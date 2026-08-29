/**
 * Wikipedia日本語版のインフォボックスから、日本人選手の現所属を確定させる。
 *
 * 二段構えで取得する。
 *   1. 選手記事の {{サッカー選手}} から 所属チーム名・国・生年月日・ポジション・背番号
 *   2. クラブ記事の {{サッカークラブ}} から そのクラブが所属するリーグ
 * さらにクラブ記事の言語間リンクから英語名を取り、試合日程との突き合わせに使う。
 *
 * APIは1リクエストで最大50記事をまとめて取得できるので、その形で呼ぶ。
 * 自動でデータを書き換えることはせず、結果をJSONとレポートに出力する。
 *
 * 実行: node scripts/fetch-players.mjs scripts/player-candidates.json
 */
import fs from "node:fs";
import path from "node:path";
import { fetchWithRetry, politeDelay, USER_AGENT } from "./_env.mjs";
import { parsePlayer, templateField, linkTarget, stripMarkup } from "./_wiki.mjs";

const ROOT = process.cwd();
const API = "https://ja.wikipedia.org/w/api.php";

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  const res = await fetchWithRetry(url, { headers: { "User-Agent": USER_AGENT } });
  return res.json();
}

/** 50件ずつまとめて本文を取得する */
const canonical = new Map();

async function fetchWikitext(titles) {
  const out = new Map();
  for (let i = 0; i < titles.length; i += 50) {
    const chunk = titles.slice(i, i + 50);
    const j = await api({
      action: "query",
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
      redirects: "1",
      titles: chunk.join("|"),
    });
    const redirects = new Map((j.query.redirects ?? []).map((r) => [r.to, r.from]));
    for (const page of j.query.pages ?? []) {
      if (page.missing) continue;
      const text = page.revisions?.[0]?.slots?.main?.content;
      if (!text) continue;
      out.set(page.title, text);
      const from = redirects.get(page.title);
      if (from) { out.set(from, text); canonical.set(from, page.title); }
    }
    if (i + 50 < titles.length) await politeDelay();
  }
  return out;
}

/** クラブ記事の英語版タイトルを取得する */
async function fetchEnglishTitles(titles) {
  const out = new Map();
  for (let i = 0; i < titles.length; i += 50) {
    const chunk = titles.slice(i, i + 50);
    const j = await api({
      action: "query",
      prop: "langlinks",
      lllang: "en",
      lllimit: "500",
      redirects: "1",
      titles: chunk.join("|"),
    });
    const redirects = new Map((j.query.redirects ?? []).map((r) => [r.to, r.from]));
    for (const page of j.query.pages ?? []) {
      const en = page.langlinks?.[0]?.title;
      if (!en) continue;
      out.set(page.title, en);
      const from = redirects.get(page.title);
      if (from) out.set(from, en);
    }
    if (i + 50 < titles.length) await politeDelay();
  }
  return out;
}

/**
 * 選手記事のリンク先がクラブ記事でないことがある。
 * 例: [[クリスタル・パレス]] はロンドンの建造物の記事を指す。
 */
const clubArticleAlias = {
  "クリスタル・パレス": "クリスタル・パレスFC",
};

/**
 * Wikipedia上のリーグ表記をサイト内のIDに正規化する。
 * 同じリーグが複数の名前で書かれている（ジュピラー・プロ・リーグ／ベルギー・ファースト・ディビジョンA など）。
 */
/*
 * リーグはリンク先の記事名で判定する。
 * インフォボックスの表示名は当てにならない。たとえばドイツの2部クラブは
 *   [[2. ブンデスリーガ (ドイツサッカー)|ブンデスリーガ]]
 * と書かれ、1部クラブの表示名と区別がつかない。
 */
const leagueArticleAlias = {
  "プレミアリーグ": "premier-league",
  "EFLチャンピオンシップ": "championship",
  "フットボールリーグ": "championship",
  "サッカー・ブンデスリーガ (ドイツ)": "bundesliga",
  "2. ブンデスリーガ (ドイツサッカー)": "bundesliga-2",
  "リーグ・ドゥ": "ligue-2",
  "リーガ・エスパニョーラ": "la-liga",
  "プリメーラ・ディビシオン (スペイン)": "la-liga",
  "セグンダ・ディビシオン": "segunda-division",
  "セリエA (サッカー)": "serie-a",
  "リーグ・アン": "ligue-1",
  "フランスプロサッカーリーグ": "ligue-1",
  "エールディヴィジ": "eredivisie",
  "プリメイラ・リーガ": "primeira-liga",
  "ベルギー・ファースト・ディビジョンA": "jupiler-pro-league",
  "ベルギー・ファースト・ディビジョンB": "challenger-pro-league",
  "スコティッシュ・プレミアシップ": "scottish-premiership",
  "スーペルリーガ (デンマーク)": "danish-superliga",
  "デンマーク・スーペルリーガ": "danish-superliga",

  // 5大リーグ以外の1部
  "オーストリア・ブンデスリーガ": "austrian-bundesliga",
  "サッカー・ブンデスリーガ (オーストリア)": "austrian-bundesliga",
  "スーパーリーグ (スイス)": "swiss-super-league",
  "エクストラクラサ": "ekstraklasa",
  "フォルトゥナ・リーガ": "slovak-superliga",
  "セルビア・スーペルリーガ": "serbian-superliga",
  "クロアチア・フットボールリーグ": "croatian-hnl",
};

/*
 * クラブ記事に「リーグ」欄が無いことがある。所属を落とすと選手ごと消えるため、
 * 記事名で直接ひもづける。書き足すときは必ずクラブ公式で階層を確かめること。
 */
const clubLeagueOverride = {
  "パトロ・アイスデン・マースメヘレン": "challenger-pro-league",
};

/** 記事名で引けなかったときの保険。表示名で引く */
const leagueAlias = {
  "プレミアリーグ": "premier-league",
  "EFLチャンピオンシップ": "championship",
  "フットボールリーグ": "championship",
  "プリメーラ・ディビシオン": "la-liga",
  "ラ・リーガ": "la-liga",
  "ラリーガ": "la-liga",
  "ラリーガ・エア・スポーツ": "segunda-division",
  "セグンダ・ディビシオン": "segunda-division",
  "ドイツ・ブンデスリーガ": "bundesliga",
  "ブンデスリーガ": "bundesliga",
  "2.ブンデスリーガ": "bundesliga-2",
  "2. ブンデスリーガ": "bundesliga-2",
  "セリエA": "serie-a",
  "フランスプロサッカーリーグ": "ligue-1",
  "リーグ・アン": "ligue-1",
  "エールディヴィジ": "eredivisie",
  "プリメイラ・リーガ": "primeira-liga",
  "ジュピラー・プロ・リーグ": "jupiler-pro-league",
  "ベルギー・ファースト・ディビジョンA": "jupiler-pro-league",
  "チャレンジャー・プロ・リーグ": "challenger-pro-league",
  "スコティッシュ・プレミアシップ": "scottish-premiership",
  "デンマーク・スーペルリーガ": "danish-superliga",
  "オーストリア・ブンデスリーガ": "austrian-bundesliga",
  "スーパーリーグ": "swiss-super-league",
  "エクストラクラサ": "ekstraklasa",
  "ニケー・リーガ": "slovak-superliga",
  "スロバキア・スーペルリーガ": "slovak-superliga",
  "セルビア・スーペルリーガ": "serbian-superliga",
  "1.HNL": "croatian-hnl",
};

function parseClub(text) {
  const leagueRaw = templateField(text, "リーグ");
  const league = linkTarget(leagueRaw);
  const label = league?.label ?? (stripMarkup(leagueRaw ?? "") || null);
  /*
   * 「ディビジョン」欄。クラブ記事の「リーグ」はリーグ機構を指すことがあり、
   * ハノーファー96のように1部の記事へリンクしながら実際は2部、という例がある。
   * 階層はこちらで確定させる。
   */
  const divisionRaw = templateField(text, "ディビジョン");
  const divisionLink = linkTarget(divisionRaw);
  const division = stripMarkup(divisionRaw ?? "") || null;
  return {
    leagueArticle: league?.article ?? null,
    leagueLabel: label,
    division,
    divisionArticle: divisionLink?.article ?? null,
  };
}

/** 比較用に長音符号を落とす。Itō と Ito を同じ語として扱うため */
function plain(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * ローマ字表記を組み立てる。
 *
 * 日本語版の「アルファベット表記」欄は並びが揃っていない。「ITO Junya」と姓を
 * 先に書く記事もあれば、「Shinta Appelkamp」と名を先に書く記事もある。
 * 一律に入れ替えていたころ、後藤啓介が「Goto Keisuke」になっていた。
 *
 * 英語版の記事名は必ず名→姓の並びなので、並び順の判定にはそちらを使う。
 * 綴りは日本語版の欄を優先する（英語版は Itō や Leo Kokubo のように、
 * 長音符号つきだったり短縮形だったりするため）。
 */
function romaji(alphabet, enTitle) {
  // 「Ao Tanaka (footballer, born 1998)」のような曖昧さ回避を落とす
  const en = enTitle ? enTitle.replace(/\s*\([^)]*\)$/, "").trim() : null;
  if (!alphabet) return en;

  const parts = alphabet.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return alphabet;
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

  const surnameFirst = en
    ? plain(parts[0]) === plain(en.split(/\s+/).at(-1))
    : /^[A-Z][A-Z'’-]+$/.test(parts[0]); // 英語版が無ければ、姓を大文字で書く慣習に頼る

  const ordered = surnameFirst ? [...parts.slice(1), parts[0]] : parts;
  return ordered.map(cap).join(" ");
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("候補JSONのパスを指定してください");
  process.exit(1);
}

const candidates = JSON.parse(fs.readFileSync(inputPath, "utf8"));
console.log(`${candidates.length}人の記事を取得します`);

const playerText = await fetchWikitext(candidates);
console.log(`  ${playerText.size}件の記事を取得`);

const parsed = [];
const missing = [];
for (const name of candidates) {
  const text = playerText.get(name);
  if (!text) { missing.push(name); continue; }
  if (!text.includes("{{サッカー選手")) { missing.push(`${name}（選手記事ではない）`); continue; }
  parsed.push({ nameJa: name, ...parsePlayer(text) });
}

for (const p of parsed) {
  if (p.clubArticle && clubArticleAlias[p.clubArticle]) p.clubArticle = clubArticleAlias[p.clubArticle];
}

const clubArticles = [...new Set(parsed.map((p) => p.clubArticle).filter(Boolean))];
console.log(`${clubArticles.length}クラブのリーグを確認します`);
await politeDelay();
const clubText = await fetchWikitext(clubArticles);
await politeDelay();
const clubEn = await fetchEnglishTitles(clubArticles);

// リダイレクト元の表記（例: ボルシア・メンヘングラートバッハ）を正式名に寄せる
for (const p of parsed) {
  if (p.clubArticle && canonical.has(p.clubArticle)) p.clubArticle = canonical.get(p.clubArticle);
}

const clubInfo = new Map();
for (const [title, text] of clubText) {
  clubInfo.set(title, { ...parseClub(text), en: clubEn.get(title) ?? null });
}

/**
 * クラブ情報からリーグを決める。
 * 「ディビジョン」が下部リーグを指している場合はそちらを優先する。
 * 対応するリーグを持っていなければ null にして、掲載対象から外す。
 */
function resolveLeague(info, clubArticle) {
  if (!info) return clubLeagueOverride[clubArticle] ?? null;
  const base =
    (info.leagueArticle ? leagueArticleAlias[info.leagueArticle] : null) ??
    (info.leagueLabel ? leagueAlias[info.leagueLabel] : null) ??
    clubLeagueOverride[clubArticle] ??
    null;
  if (!/2部|3部/.test(info.division ?? "")) return base;
  // ディビジョンがリンクになっていれば、そちらが階層の正解。
  // ただの「2部」でリンクが無い場合も多いので、そのときは元の判定を使う。
  // 食い違いは generate-players.mjs の検算で警告する。
  const fromDivision = info.divisionArticle ? leagueArticleAlias[info.divisionArticle] : null;
  return fromDivision ?? base;
}

/*
 * ローマ字表記は英語版の記事名を第一の出どころにする。
 *
 * 日本語版の「アルファベット表記」欄は並びが揃っていない。「KUBO Takefusa」と
 * 姓を先に書く記事もあれば、「Shinta Appelkamp」と名を先に書く記事もあり、
 * 機械的に入れ替えると後藤啓介が「Goto Keisuke」になってしまう。
 * 英語版の記事名は必ず名→姓の並びなので、そちらを優先する。
 * 英語版に記事が無い選手だけ、日本語版の欄から組み立てる。
 */
const enTitles = await fetchEnglishTitles(parsed.map((p) => p.nameJa));
for (const p of parsed) p.nameEn = romaji(p.alphabet, enTitles.get(p.nameJa) ?? null);
const noName = parsed.filter((p) => !p.nameEn).map((p) => p.nameJa);
console.log(`ローマ字表記: ${parsed.length - noName.length}人ぶん確定（うち英語版を参照 ${enTitles.size}人）`);
if (noName.length) console.warn(`  ローマ字を取れず掲載できません: ${noName.join(" / ")}`);

const today = new Date().toISOString().slice(0, 10);
const result = parsed.map((p) => {
  const info = p.clubArticle ? clubInfo.get(p.clubArticle) : null;
  return {
    nameJa: p.nameJa.replace(/\s*\(サッカー選手\)$/, ""),
    nameEn: p.nameEn,
    birthDate: p.birthDate,
    position: p.position,
    squadNumber: p.squadNumber,
    career: p.career,
    nationalCareer: p.nationalCareer,
    country: p.country,
    club: p.clubArticle ?? p.clubLabel,
    clubArticle: p.clubArticle,
    clubEn: info?.en ?? null,
    leagueLabel: info?.leagueLabel ?? null,
    leagueArticle: info?.leagueArticle ?? null,
    leagueDivision: info?.division ?? null,
    leagueId: resolveLeague(info, p.clubArticle),
    abroad: p.country !== null && p.country !== "JPN",
    checkedAt: today,
  };
});

const unmapped = result.filter((r) => r.abroad && !r.leagueId);
if (unmapped.length) {
  console.log("\n--- リーグIDに変換できなかった（leagueAlias への追加が必要）---");
  for (const r of unmapped) console.log(`  ${r.nameJa}: ${r.club} / ${r.leagueLabel ?? "リーグ欄なし"}`);
}

fs.writeFileSync(
  path.join(ROOT, "scripts/player-wikipedia.json"),
  JSON.stringify({ fetchedAt: today, missing, players: result }, null, 2)
);

const abroad = result.filter((r) => r.abroad);
const home = result.filter((r) => !r.abroad);

console.log(`\n海外所属: ${abroad.length}人 / 国内または不明: ${home.length}人 / 記事なし: ${missing.length}件`);
console.log("\n--- 海外所属 ---");
for (const r of abroad.sort((a, b) => (a.leagueId ?? "zz").localeCompare(b.leagueId ?? "zz"))) {
  console.log(`  ${(r.leagueId ?? "???").padEnd(22)} ${(r.club ?? "-").padEnd(24)} ${r.nameJa.replace(/s*(サッカー選手)$/, "")}`);
}
if (home.length) {
  console.log("\n--- 国内または判定不能（掲載対象外）---");
  home.forEach((r) => console.log(`  ${r.club ?? "不明"} ${r.nameJa}`));
}
if (missing.length) {
  console.log("\n--- 記事が見つからない ---");
  missing.forEach((m) => console.log(`  ${m}`));
}
console.log("\nscripts/player-wikipedia.json に保存しました");
