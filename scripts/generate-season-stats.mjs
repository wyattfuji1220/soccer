/**
 * 今季の成績を src/data/season-stats.ts に書き出す。
 *
 * 数字は scripts/fetch-season-stats.mjs が英語版Wikipediaの成績表から取ったもの。
 * ここでは選手名を掲載中の slug に対応づけ、TypeScript の形に整えるだけ。
 *
 * 実行: node scripts/generate-season-stats.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const rawPath = path.join(ROOT, "scripts/season-stats-raw.json");
const outPath = path.join(ROOT, "src/data/season-stats.ts");

if (!fs.existsSync(rawPath)) {
  console.error("先に node scripts/fetch-season-stats.mjs を実行してください");
  process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));

const players = fs
  .readFileSync(path.join(ROOT, "src/data/players.ts"), "utf8")
  .split("\n  {\n    slug:")
  .slice(1)
  .map((blk) => ({
    slug: blk.match(/^\s*"([^"]+)"/)[1],
    nameJa: blk.match(/nameJa: "([^"]*)"/)[1],
  }));

const rows = [];
const unmatched = [];
for (const p of players) {
  const r = raw.players[p.nameJa];
  if (!r) continue;
  rows.push({ slug: p.slug, ...r });
}
for (const name of Object.keys(raw.players)) {
  if (!players.some((p) => p.nameJa === name)) unmatched.push(name);
}

rows.sort((a, b) => b.goals - a.goals || b.apps - a.apps || a.slug.localeCompare(b.slug));

// ここに来る値はリーグ名と日付と記事名だけ。引用符だけ逃がせば足りる
const q = (s) => (s ? `"${String(s).replace(/"/g, '\\"')}"` : "null");
const body = rows
  .map(
    (r) =>
      `  { slug: "${r.slug}", apps: ${r.apps}, goals: ${r.goals}, division: ${q(r.division)}, updatedAt: ${q(r.updatedAt)}, source: ${q(r.source)} },`
  )
  .join("\n");

fs.writeFileSync(
  outPath,
  `import type { SeasonStat } from "@/lib/types";

/**
 * このファイルは scripts/generate-season-stats.mjs が生成する。直接編集しないこと。
 *
 * ${raw.season} シーズンのリーグ戦の記録。英語版Wikipediaの選手記事にある
 * 「Career statistics」表から、今季の行だけを取り出している。
 * カップ戦・欧州カップ・代表戦は含まない。
 *
 * updatedAt はその表が自己申告している更新時点。載っていない選手は、
 * まだ今季の行が書かれていないということで、0試合という意味ではない。
 */
export const season = "${raw.season}";
export const seasonTakenAt = "${raw.takenAt}";

export const seasonStats: SeasonStat[] = [
${body}
];

export const seasonStatMap = Object.fromEntries(seasonStats.map((s) => [s.slug, s]));
`
);

console.log(`${rows.length}人分を src/data/season-stats.ts に書き出しました（${raw.season}）`);
console.log(`  得点がある選手: ${rows.filter((r) => r.goals > 0).length}人 / 出場がある選手: ${rows.filter((r) => r.apps > 0).length}人`);
if (unmatched.length) console.warn(`  掲載中の選手と対応づかず: ${unmatched.join(" / ")}`);
