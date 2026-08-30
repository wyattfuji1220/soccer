/**
 * 今季の出場数・得点数を、英語版Wikipediaの「Career statistics」表から取る。
 *
 * 日本語版のインフォボックスはクラブ在籍中の通算値しか持たないため、今季ぶんを
 * 取り出せない。版の差分から出す方法も試したが、編集者が前季の数字をあとから
 * 書き足すことがあり、その分まで今季として数えてしまう（森下龍矢が3週間で
 * 37試合になった）。
 *
 * 英語版の選手記事にはクラブ・シーズン・大会ごとに分かれた表があり、
 * どの行が今季なのかが明示されている。載っていなければ「まだ記載がない」と
 * 言い切れるので、間違った数字を出さずに済む。
 *
 * 取るのはリーグ戦の出場数・得点数と、表に併記された更新時点。
 * カップ戦・欧州カップは列が記事ごとに揺れるため、いまは扱わない。
 *
 * 実行: node scripts/fetch-season-stats.mjs [2026-27]
 */
import fs from "node:fs";
import path from "node:path";
import { fetchWithRetry, politeDelay, USER_AGENT } from "./_env.mjs";

const ROOT = process.cwd();
const outPath = path.join(ROOT, "scripts/season-stats-raw.json");
const EN_API = "https://en.wikipedia.org/w/api.php";
const JA_API = "https://ja.wikipedia.org/w/api.php";

const season = process.argv[2] ?? "2026-27";
const [startYear, endYear] = season.split("-");
/** 欧州は「2026–27」、北欧など暦年で回すリーグは「2026」と書かれる */
const EUROPEAN = new RegExp(`^${startYear}[–-]${endYear}$`);
const CALENDAR = new RegExp(`^${startYear}$`);
/** 暦年の行はJリーグの2026年とも一致してしまうため、除くための判定 */
const JAPAN_LEAGUE = /J1|J2|J3|J\.?\s?League|Japan/i;

async function api(base, params) {
  const url = `${base}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  return (await fetchWithRetry(url, { headers: { "User-Agent": USER_AGENT } })).json();
}

/** 日本語版の記事名から英語版の記事名を引く */
async function englishTitles(titles) {
  const out = new Map();
  for (let i = 0; i < titles.length; i += 50) {
    const j = await api(JA_API, {
      action: "query", prop: "langlinks", lllang: "en", lllimit: "500",
      redirects: "1", titles: titles.slice(i, i + 50).join("|"),
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

async function englishArticles(titles) {
  const out = new Map();
  for (let i = 0; i < titles.length; i += 50) {
    const j = await api(EN_API, {
      action: "query", prop: "revisions", rvprop: "content", rvslots: "main",
      redirects: "1", titles: titles.slice(i, i + 50).join("|"),
    });
    const redirects = new Map((j.query.redirects ?? []).map((r) => [r.to, r.from]));
    for (const page of j.query.pages ?? []) {
      const text = page.revisions?.[0]?.slots?.main?.content;
      if (!text) continue;
      out.set(page.title, text);
      const from = redirects.get(page.title);
      if (from) out.set(from, text);
    }
    if (i + 50 < titles.length) await politeDelay();
  }
  return out;
}

/** 参照・注釈・リンクを落として、セルの中身だけにする */
function cell(raw) {
  return raw
    .replace(/<ref[^>]*\/>/g, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "")
    .replace(/\{\{efn[^}]*\}\}/gi, "")
    .replace(/\{\{[^{}]*\}\}/g, "")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/''+/g, "")
    .replace(/^\s*(rowspan|colspan|style|scope|align)\s*=\s*"[^"]*"\s*\|?/gi, "")
    .trim();
}

/**
 * 「Career statistics」の表から今季の行を探す。
 *
 * 行は「クラブ｜シーズン｜ディビジョン｜リーグ出場｜リーグ得点｜…」の並び。
 * クラブ名もディビジョンも rowspan でまとめられることがあり、2行目以降には
 * 現れない。「Total」で始まる集計行（! で始まる）は読み飛ばす。
 *
 * 欧州のシーズンは「2026–27」、北欧などの暦年リーグは「2026」と書かれる。
 * 暦年の行はJリーグの2026年とも一致してしまうため、欧州表記の行を優先し、
 * 暦年しか無いときだけ、Jリーグ以外の行を採る。
 */
function seasonRow(text) {
  const start = text.search(/==+\s*Career statistics\s*==+/i);
  if (start < 0) return null;
  const table = text.slice(start, start + 30000);
  const hits = [];

  for (const raw of table.split(/\n\|-/)) {
    const line = raw.trim();
    if (!line || line.startsWith("!")) continue;

    // セルは「|値」または「値||値」で区切られる
    const cells = line
      .split("\n")
      .filter((l) => l.startsWith("|"))
      .flatMap((l) => l.replace(/^\|/, "").split("||"))
      .map(cell)
      .filter((c) => c !== "");

    const at = cells.findIndex((c) => EUROPEAN.test(c) || CALENDAR.test(c));
    if (at < 0) continue;
    const rest = cells.slice(at + 1);
    // 「—」はそのシーズンにリーグ戦の記録が無いことを表す
    if (/^[—–-]$/.test(rest[0] ?? "")) continue;

    let division = null;
    let apps;
    let goals;
    if (/^\d+$/.test(rest[0] ?? "") && /^\d+$/.test(rest[1] ?? "")) {
      // ディビジョンが上の行から rowspan でまとめられている
      [apps, goals] = [rest[0], rest[1]];
    } else if (/^\d+$/.test(rest[1] ?? "") && /^\d+$/.test(rest[2] ?? "")) {
      [division, apps, goals] = [rest[0], rest[1], rest[2]];
    } else {
      continue;
    }
    hits.push({ division, apps: Number(apps), goals: Number(goals), european: EUROPEAN.test(cells[at]) });
  }

  return (
    hits.find((h) => h.european) ??
    hits.find((h) => h.division && !JAPAN_LEAGUE.test(h.division)) ??
    null
  );
}

/** {{updated|match played 9 May 2026}} から更新時点を読む */
function updatedAt(text) {
  const m = text.match(/\{\{updated\|[^}]*?(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
  if (!m) return null;
  const month = new Date(`${m[2]} 1, 2000`).getMonth();
  if (Number.isNaN(month)) return null;
  return `${m[3]}-${String(month + 1).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`;
}

const candidates = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/player-candidates.json"), "utf8"));
console.log(`${candidates.length}人ぶん、英語版の成績表から ${season} シーズンを探します`);

const enTitle = await englishTitles(candidates);
console.log(`  英語版の記事があるのは ${enTitle.size}人`);
const articles = await englishArticles([...new Set(enTitle.values())]);

const found = {};
const noSeason = [];
const noArticle = [];
for (const ja of candidates) {
  const en = enTitle.get(ja);
  const text = en ? articles.get(en) : null;
  if (!text) { noArticle.push(ja); continue; }
  const row = seasonRow(text);
  if (!row) { noSeason.push(ja); continue; }
  found[ja.replace(/\s*\(サッカー選手\)$/, "")] = { ...row, updatedAt: updatedAt(text), source: en };
}

fs.writeFileSync(
  outPath,
  JSON.stringify({ season, takenAt: new Date().toISOString().slice(0, 10), players: found }, null, 1) + "\n"
);

console.log(`\n${Object.keys(found).length}人ぶんの ${season} の記録が見つかりました`);
console.log(`  今季の行がまだない: ${noSeason.length}人`);
console.log(`  英語版に記事がない: ${noArticle.length}人`);
const sample = Object.entries(found).slice(0, 8);
for (const [name, r] of sample) console.log(`  ${name}: ${r.division ?? "リーグ不明"} ${r.apps}試合 ${r.goals}得点（${r.updatedAt ?? "更新時点なし"}）`);
