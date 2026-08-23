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
import { politeDelay, USER_AGENT } from "./_env.mjs";

const ROOT = process.cwd();
const API = "https://ja.wikipedia.org/w/api.php";

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Wikipedia API ${res.status}`);
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

/** テンプレートの引数を取り出す。ネストした {{ }} を数えながら走査する */
function templateField(text, field) {
  const re = new RegExp(`\\|\\s*${field}\\s*=`, "g");
  const m = re.exec(text);
  if (!m) return null;
  let i = m.index + m[0].length;
  let depth = 0;
  let value = "";
  while (i < text.length) {
    const two = text.slice(i, i + 2);
    if (two === "{{" || two === "[[") { depth++; value += two; i += 2; continue; }
    if (two === "}}" || two === "]]") {
      if (depth === 0) break;
      depth--; value += two; i += 2; continue;
    }
    if (depth === 0 && (text[i] === "|" || text[i] === "\n")) break;
    value += text[i];
    i++;
  }
  return value.trim();
}

/** [[記事名|表示名]] から表示名、[[記事名]] から記事名を取り出す */
function linkTarget(wiki) {
  const m = wiki?.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
  if (m) return { article: m[1].trim(), label: (m[2] ?? m[1]).trim() };
  // リンクになっていないクラブ名にも対応する（例: 田中碧の「リーズ・ユナイテッド」）
  const plain = stripMarkup((wiki ?? "").replace(/\{\{[^}]*\}\}/g, ""));
  if (!plain) return null;
  return { article: plain, label: plain };
}

function stripMarkup(s) {
  return (s ?? "")
    .replace(/<ref[^>]*\/>/g, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/'''?/g, "")
    .trim();
}

/**
 * インフォボックスの 年1/クラブ1/出場1/得点1 … という連番からクラブ遍歴を組み立てる。
 * クラブ名の先頭の「→」は期限付き移籍を表す慣習表記なので、loan フラグとして持たせる。
 */
function parseCareer(text, yearKey, teamKey, appKey, goalKey) {
  const rows = [];
  for (let i = 1; i <= 30; i++) {
    const years = stripMarkup(templateField(text, `${yearKey}${i}`) ?? "");
    const teamRaw = templateField(text, `${teamKey}${i}`);
    if (!years && !teamRaw) continue;
    if (!teamRaw) continue;

    const loan = /^→/.test(teamRaw.trim()) || /（loan）|\(loan\)|期限付き/.test(teamRaw);
    const cleaned = teamRaw.replace(/^→/, "").replace(/（loan）|\(loan\)/g, "");
    const link = linkTarget(cleaned);
    const flag = teamRaw.match(/\{\{Flagicon\|([A-Z]{3})\}\}/i);
    const apps = stripMarkup(templateField(text, `${appKey}${i}`) ?? "").match(/\d+/);
    const goals = stripMarkup(templateField(text, `${goalKey}${i}`) ?? "").match(/\d+/);

    // 代表チームは {{fbu|17|JPN|name=日本 U-17}} や {{JPNf}} というテンプレートで書かれる
    const fbu = teamRaw.match(/\{\{fbu\|[^}]*?name=([^|}]+)/i);
    const national = /\{\{JPNf?\}\}/.test(teamRaw) ? "日本代表" : null;

    const label = (fbu?.[1]?.trim() ?? national ?? link?.label ?? stripMarkup(cleaned.replace(/\{\{[^}]*\}\}/g, "")))
      .replace(/^→/, "")
      .trim();
    if (!label) continue;

    rows.push({
      years: years || null,
      team: label,
      country: flag ? flag[1].toUpperCase() : null,
      loan,
      apps: apps ? Number(apps[0]) : null,
      goals: goals ? Number(goals[0]) : null,
    });
  }
  return rows;
}

function parsePlayer(text) {
  // {{生年月日と年齢|2001|6|4}} 形式と「1993年02月09日」形式の両方がある
  const birthField = templateField(text, "生年月日") ?? "";
  const birth =
    birthField.match(/\{\{生年月日と年齢\|(\d{4})\|(\d{1,2})\|(\d{1,2})/) ??
    birthField.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/) ??
    text.match(/\{\{生年月日と年齢\|(\d{4})\|(\d{1,2})\|(\d{1,2})/) ??
    // インフォボックスに生年月日欄がなく、本文冒頭にだけ書かれている記事もある
    text.match(/（[^）]*?\[\[(\d{4})年\]\]\[\[(\d{1,2})月(\d{1,2})日\]\]\s*-/);
  const teamRaw = templateField(text, "所属チーム名");
  const flag = teamRaw?.match(/\{\{Flagicon\|([A-Z]{3})\}\}/i);
  const club = linkTarget(teamRaw);
  const posRaw = templateField(text, "ポジション");
  const pos = stripMarkup(posRaw ?? "").match(/\b(GK|DF|MF|FW)\b/);
  const number = stripMarkup(templateField(text, "背番号") ?? "").match(/\d+/);
  const alpha = stripMarkup(templateField(text, "アルファベット表記") ?? "");

  return {
    birthDate: birth ? `${birth[1]}-${String(birth[2]).padStart(2, "0")}-${String(birth[3]).padStart(2, "0")}` : null,
    career: parseCareer(text, "年", "クラブ", "出場", "得点"),
    nationalCareer: parseCareer(text, "代表年", "代表", "代表出場", "代表得点"),
    country: flag ? flag[1].toUpperCase() : null,
    clubArticle: club?.article ?? null,
    clubLabel: club?.label ?? null,
    position: pos ? pos[1] : null,
    squadNumber: number ? Number(number[0]) : null,
    alphabet: alpha || null,
  };
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
const leagueAlias = {
  "プレミアリーグ": "premier-league",
  "EFLチャンピオンシップ": "championship",
  "フットボールリーグ": "championship",
  "プリメーラ・ディビシオン": "la-liga",
  "セグンダ・ディビシオン": "segunda-division",
  "ドイツ・ブンデスリーガ": "bundesliga",
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
  return { leagueArticle: league?.article ?? null, leagueLabel: label };
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
    leagueId: info?.leagueLabel ? (leagueAlias[info.leagueLabel] ?? null) : null,
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
