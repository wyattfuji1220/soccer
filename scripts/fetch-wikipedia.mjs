/**
 * Wikipedia日本語版のAPIで、選手データの所属クラブ記述を照合する。
 * 自動で書き換えはせず、確認用レポートを output/ に出力する（誤検知で事実を壊さないため）。
 *
 * 実行: npm run data:wikipedia
 */
import fs from "node:fs";
import path from "node:path";
import { politeDelay, USER_AGENT } from "./_env.mjs";

const ROOT = process.cwd();

function readPlayers() {
  const src = fs.readFileSync(path.join(ROOT, "src/data/players.ts"), "utf8");
  const players = [];
  const re = /slug:\s*"([^"]+)",[\s\S]*?nameJa:\s*"([^"]+)",[\s\S]*?club:\s*"([^"]+)",/g;
  let m;
  while ((m = re.exec(src))) players.push({ slug: m[1], nameJa: m[2], club: m[3] });
  return players;
}

async function summary(title) {
  const url = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  if (!res.ok) return null;
  return res.json();
}

const players = readPlayers();
console.log(`${players.length}人を照合します（1件あたり1〜3秒待機）`);

const rows = [];
for (const p of players) {
  const data = await summary(p.nameJa);
  const extract = data?.extract ?? "";
  const clubCore = p.club.replace(/[・\s]/g, "");
  const extractCore = extract.replace(/[・\s]/g, "");
  const match = clubCore.length > 1 && extractCore.includes(clubCore.slice(0, Math.min(4, clubCore.length)));
  rows.push({
    slug: p.slug,
    nameJa: p.nameJa,
    club: p.club,
    found: !!data,
    clubMentioned: match,
    extract: extract.slice(0, 160),
    url: data?.content_urls?.desktop?.page ?? "",
  });
  console.log(`  ${match ? "OK " : "要確認"} ${p.nameJa} (${p.club})`);
  await politeDelay();
}

const outDir = path.join(ROOT, "output");
fs.mkdirSync(outDir, { recursive: true });
const today = new Date().toISOString().slice(0, 10);
const md = [
  `# 選手データ照合レポート（${today}）`,
  "",
  "Wikipedia日本語版の要約と、`src/data/players.ts` の所属クラブ記述を突き合わせた結果です。",
  "「要確認」の行は手作業で一次情報を確認してから修正してください。自動更新は行いません。",
  "",
  "| 選手 | 登録クラブ | 照合 | Wikipedia要約（冒頭） |",
  "| --- | --- | --- | --- |",
  ...rows.map(
    (r) =>
      `| [${r.nameJa}](${r.url}) | ${r.club} | ${r.clubMentioned ? "一致" : "**要確認**"} | ${r.extract.replace(/\|/g, "/")} |`
  ),
  "",
  "出典: Wikipedia日本語版（CC BY-SA 4.0）",
].join("\n");

fs.writeFileSync(path.join(outDir, "data-verification.md"), md);
console.log(`\nレポートを output/data-verification.md に書き出しました`);
