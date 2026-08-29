/**
 * scripts/player-wikipedia.json から src/data/players.ts を生成する。
 *
 * 手書きしていた facts（経歴の要約文）は既存ファイルから引き継ぐ。
 * 歴史的な事実なので移籍しても内容は有効なため、消さずに残す。
 *
 * 実行: node scripts/generate-players.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const dataPath = path.join(ROOT, "scripts/player-wikipedia.json");
const outPath = path.join(ROOT, "src/data/players.ts");

const { players: fetched } = JSON.parse(fs.readFileSync(dataPath, "utf8"));

/** 既存ファイルから slug ごとの facts を拾う */
function existingFacts() {
  if (!fs.existsSync(outPath)) return new Map();
  const src = fs.readFileSync(outPath, "utf8");
  const map = new Map();
  const re = /slug:\s*"([^"]+)"[\s\S]*?facts:\s*\[([\s\S]*?)\]/g;
  let m;
  while ((m = re.exec(src))) {
    const items = [...m[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
    if (items.length) map.set(m[1], items);
  }
  return map;
}

const facts = existingFacts();
/**
 * ローマ字表記には長音符号が含まれることがある（例: Keisuke Gotō）。
 * 表示はそのまま残し、URLに使うときだけ Goto に落とす。
 */
const slugOf = (nameEn) =>
  nameEn
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const abroad = fetched
  .filter((p) => p.abroad && p.leagueId && p.birthDate && p.position)
  .sort((a, b) => a.nameJa.localeCompare(b.nameJa, "ja"));

// 海外クラブに所属しているのに落ちた選手は、たいていリーグ名のエイリアス漏れが原因。
// 黙って消えると気づけないため、必ず理由をつけて知らせる。
const dropped = fetched
  .filter((p) => p.abroad && !abroad.includes(p))
  .map((p) => {
    const why = !p.leagueId
      ? `リーグ「${p.leagueLabel ?? "不明"}」が未対応（scripts/fetch-players.mjs の leagueAlias に追加する）`
      : !p.birthDate
        ? "生年月日を取得できなかった"
        : "ポジションを取得できなかった";
    return `  ${p.nameJa}（${p.club ?? "所属不明"}）: ${why}`;
  });
if (dropped.length > 0) {
  console.warn(`\n海外クラブ所属だが掲載できなかった選手が ${dropped.length}人います`);
  console.warn(dropped.join("\n") + "\n");
}

/*
 * クラブ記事の「ディビジョン」が2部を指しているのに、1部のリーグに割り当てて
 * いないか検算する。表示名だけで判定していた頃、ドイツの2部クラブを1部として
 * 扱っていたことがあるため。
 */
const TOP_TIER = new Set([
  "premier-league", "la-liga", "bundesliga", "serie-a", "ligue-1",
  "eredivisie", "primeira-liga", "jupiler-pro-league",
  "scottish-premiership", "danish-superliga",
]);
const tierConflicts = abroad
  .filter((p) => /2部|3部/.test(p.leagueDivision ?? "") && TOP_TIER.has(p.leagueId))
  .map((p) => `  ${p.nameJa}（${p.club}）: リーグ=${p.leagueId} だが記事のディビジョンは「${p.leagueDivision}」`);
if (tierConflicts.length > 0) {
  console.warn(`\nリーグの階層が合わない選手が ${tierConflicts.length}人います`);
  console.warn("scripts/fetch-players.mjs の leagueArticleAlias に記事名を追加すること");
  console.warn(tierConflicts.join("\n") + "\n");
}

const returned = fetched.filter((p) => !p.abroad).map((p) => `${p.nameJa}（${p.club ?? "不明"}）`);
if (returned.length > 0) {
  console.log(`国内クラブ所属または所属を特定できず対象外: ${returned.length}人 — ${returned.join(" / ")}`);
}

const seen = new Set();
const rows = [];
for (const p of abroad) {
  let slug = slugOf(p.nameEn);
  if (seen.has(slug)) slug = `${slug}-2`;
  seen.add(slug);

  const careerLines = p.career
    .map(
      (c) =>
        `      { years: ${c.years ? `"${esc(c.years)}"` : "null"}, team: "${esc(c.team)}", country: ${
          c.country ? `"${c.country}"` : "null"
        }, loan: ${c.loan}, apps: ${c.apps ?? "null"}, goals: ${c.goals ?? "null"} },`
    )
    .join("\n");

  const nationalLines = p.nationalCareer
    .map(
      (c) =>
        `      { years: ${c.years ? `"${esc(c.years)}"` : "null"}, team: "${esc(c.team)}", country: ${
          c.country ? `"${c.country}"` : "null"
        }, loan: ${c.loan}, apps: ${c.apps ?? "null"}, goals: ${c.goals ?? "null"} },`
    )
    .join("\n");

  const f = facts.get(slug);
  const factsBlock = f
    ? `\n    facts: [\n${f.map((x) => `      "${x}",`).join("\n")}\n    ],`
    : "";

  rows.push(`  {
    slug: "${slug}",
    nameJa: "${esc(p.nameJa)}",
    nameEn: "${esc(p.nameEn)}",
    position: "${p.position}",
    birthDate: "${p.birthDate}",
    club: "${esc(p.club)}",
    clubEn: "${esc(p.clubEn)}",
    league: "${p.leagueId}",${p.squadNumber ? `\n    squadNumber: ${p.squadNumber},` : ""}
    confidence: "needs-review",
    sources: [wiki("${esc(p.nameJa)}", "${p.checkedAt}")],${factsBlock}
    career: [
${careerLines}
    ],
    nationalCareer: [
${nationalLines}
    ],
  },`);
}

const out = `import type { Player } from "@/lib/types";

/**
 * このファイルは scripts/generate-players.mjs が生成する。直接編集しないこと。
 *
 * 所属クラブ・背番号・ポジション・生年月日・クラブ遍歴は、Wikipedia日本語版の
 * {{サッカー選手}} インフォボックスから機械的に取得している（scripts/fetch-players.mjs）。
 * リーグはクラブ記事の {{サッカークラブ}} から引いている。
 *
 * 移籍情報は変動が激しいため confidence は一律 "needs-review" とし、
 * 各ページに出典と最終確認日を表示する。手書きの facts のみ人が管理する。
 */
const wiki = (title: string, checkedAt: string) => ({
  label: \`Wikipedia: \${title}\`,
  url: \`https://ja.wikipedia.org/wiki/\${encodeURIComponent(title)}\`,
  checkedAt,
});

export const players: Player[] = [
${rows.join("\n")}
];

export const playerMap = Object.fromEntries(players.map((p) => [p.slug, p]));
`;

fs.writeFileSync(outPath, out);
console.log(`${rows.length}人分を src/data/players.ts に生成しました`);
console.log(`facts を引き継いだ選手: ${[...facts.keys()].filter((s) => seen.has(s)).length}人`);
