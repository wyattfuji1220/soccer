/**
 * 過去に海外のクラブでプレーした日本人選手を集め、集計用の要約を作る。
 *
 * 現役の掲載選手（src/data/players.ts）は「いまどこにいるか」を追うためのもので、
 * 引退した選手や国内に戻った選手は落ちる。そのため「日本人が海外へ渡ってきた
 * 歴史」がサイトから見えない。奥寺康彦の1977年から今日までを一本の線で見せたい。
 *
 * クラブ遍歴をそのまま持つと重くなるので、集計に要る形だけに削って書き出す。
 * リーグは引かない（過去のクラブが今どの階層にいるかは、当時の話と関係ない）。
 *
 * 入力: scripts/alumni-candidates.json（fetch-candidates.mjs が作る）
 * 実行: node scripts/fetch-alumni.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fetchWithRetry, politeDelay, USER_AGENT } from "./_env.mjs";
import { parsePlayer } from "./_wiki.mjs";

const ROOT = process.cwd();
const API = "https://ja.wikipedia.org/w/api.php";
const outPath = path.join(ROOT, "src/data/alumni.ts");

async function fetchWikitext(titles) {
  const out = new Map();
  for (let i = 0; i < titles.length; i += 50) {
    const chunk = titles.slice(i, i + 50);
    const url = `${API}?${new URLSearchParams({
      format: "json", formatversion: "2", action: "query", prop: "revisions",
      rvprop: "content", rvslots: "main", redirects: "1", titles: chunk.join("|"),
    })}`;
    const j = await (await fetchWithRetry(url, { headers: { "User-Agent": USER_AGENT } })).json();
    const redirects = new Map((j.query.redirects ?? []).map((r) => [r.to, r.from]));
    for (const page of j.query.pages ?? []) {
      const text = page.revisions?.[0]?.slots?.main?.content;
      if (!text) continue;
      out.set(page.title, text);
      const from = redirects.get(page.title);
      if (from) out.set(from, text);
    }
    process.stdout.write(`\r  ${Math.min(i + 50, titles.length)}/${titles.length}件`);
    if (i + 50 < titles.length) await politeDelay();
  }
  process.stdout.write("\n");
  return out;
}

const candidates = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/alumni-candidates.json"), "utf8"));
console.log(`${candidates.length}人の記事を取得します`);
const texts = await fetchWikitext(candidates);

/** 「2019-2021」「2021-」から開始年と終了年を読む */
function years(row) {
  const nums = (row.years ?? "").match(/\d{4}/g);
  if (!nums) return null;
  const from = Number(nums[0]);
  const to = nums.length > 1 ? Number(nums[1]) : /-\s*$/.test(row.years ?? "") ? null : from;
  return { from, to };
}

const rows = [];
const skipped = [];
for (const name of candidates) {
  const text = texts.get(name);
  if (!text || !text.includes("{{サッカー選手")) { skipped.push(name); continue; }

  const info = parsePlayer(text);
  const abroad = info.career.filter((c) => c.country && c.country !== "JPN");
  if (abroad.length === 0) { skipped.push(name); continue; }

  /*
   * 在籍を1件ずつ持つ。クラブや国ごとの「いつ」を出すのに要る。
   * 選手全体の from で代用すると、中村俊輔のセルティック在籍が
   * レッジーナに渡った2002年から始まっていることになってしまう。
   * クラブ名は記事名で持つ（表示名は「ボルシアMG」のように略されて、
   * ほかのデータと突き合わせられない）。
   */
  const spells = abroad
    .map((c) => ({ row: c, span: years(c) }))
    .filter((x) => x.span !== null)
    .map((x) => ({ club: x.row.teamArticle ?? x.row.team, country: x.row.country, from: x.span.from, to: x.span.to }));
  if (spells.length === 0) { skipped.push(name); continue; }

  const from = Math.min(...spells.map((s) => s.from));
  // 「2021-」のように終わりが書かれていなければ、まだ在籍中とみなして null
  const to = spells.some((s) => s.to === null) ? null : Math.max(...spells.map((s) => s.to));

  rows.push({ nameJa: name.replace(/\s*\(サッカー選手\)$/, ""), article: name, from, to, spells });
}

rows.sort((a, b) => a.from - b.from || a.nameJa.localeCompare(b.nameJa, "ja"));

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const spell = (s) => `{ club: "${esc(s.club)}", country: "${s.country}", from: ${s.from}, to: ${s.to ?? "null"} }`;

const body = rows
  .map(
    (r) =>
      `  {
    nameJa: "${esc(r.nameJa)}",
    article: "${esc(r.article)}",
    from: ${r.from},
    to: ${r.to ?? "null"},
    spells: [${r.spells.map(spell).join(", ")}],
  },`
  )
  .join("\n");

fs.writeFileSync(
  outPath,
  `import type { Alumnus } from "@/lib/types";

/**
 * このファイルは scripts/fetch-alumni.mjs が生成する。直接編集しないこと。
 *
 * 海外のクラブに在籍した記録がある日本人選手の要約。現役で掲載中の選手も
 * 含まれる。出どころはWikipedia日本語版のクラブ遍歴で、在籍年と国だけを残し、
 * 出場数などは落としている（歴史の集計にしか使わないため）。
 *
 * to が null なのは、遍歴の在籍年が「2021-」のように閉じていない選手。
 */
export const alumni: Alumnus[] = [
${body}
];
`
);

console.log(`${rows.length}人分を src/data/alumni.ts に書き出しました`);
console.log(`  海外クラブの記録がなく対象外: ${skipped.length}人`);
const firstYear = rows[0]?.from;
console.log(`  もっとも古い記録: ${firstYear}年（${rows.filter((r) => r.from === firstYear).map((r) => r.nameJa).join("、")}）`);
