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

/** アルファベット表記は「KUBO Takefusa」形式なので「Takefusa Kubo」に直す */
function normalizeName(alpha) {
  if (!alpha) return null;
  const parts = alpha.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return alpha;
  const surname = parts[0];
  const given = parts.slice(1).join(" ");
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  return `${given.split(" ").map(cap).join(" ")} ${cap(surname)}`;
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
function resolveLeague(info) {
  if (!info) return null;
  const base =
    (info.leagueArticle ? leagueArticleAlias[info.leagueArticle] : null) ??
    (info.leagueLabel ? leagueAlias[info.leagueLabel] : null) ??
    null;
  if (!/2部|3部/.test(info.division ?? "")) return base;
  // ディビジョンがリンクになっていれば、そちらが階層の正解。
  // ただの「2部」でリンクが無い場合も多いので、そのときは元の判定を使う。
  // 食い違いは generate-players.mjs の検算で警告する。
  const fromDivision = info.divisionArticle ? leagueArticleAlias[info.divisionArticle] : null;
  return fromDivision ?? base;
}

const today = new Date().toISOString().slice(0, 10);
const result = parsed.map((p) => {
  const info = p.clubArticle ? clubInfo.get(p.clubArticle) : null;
  return {
    nameJa: p.nameJa.replace(/\s*\(サッカー選手\)$/, ""),
    nameEn: normalizeName(p.alphabet),
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
    leagueId: resolveLeague(info),
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
