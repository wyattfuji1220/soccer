/**
 * 掲載中の選手データをWikipediaの原文と突き合わせ、取りこぼしと食い違いを洗い出す。
 *
 * データの自動書き換えはしない（CLAUDE.md の方針）。見つかった疑いを列挙するだけで、
 * 直すかどうかは人が一次情報を見て決める。
 *
 * インフォボックスは書式のゆれが大きく、テンプレートを1つ取りこぼすと行ごと消える。
 * 実際に {{Fb|JPN}} が読めず、三笘薫のA代表31試合が丸ごと欠けていた。
 * そこで「原文に欄がいくつあるか」を解析結果と独立に数え、差が出たら知らせる。
 *
 * 実行: node scripts/check-players.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fetchWithRetry, politeDelay, USER_AGENT } from "./_env.mjs";
import { parsePlayer, templateField, linkTarget, stripMarkup } from "./_wiki.mjs";

const ROOT = process.cwd();
const API = "https://ja.wikipedia.org/w/api.php";

async function fetchWikitext(titles) {
  const out = new Map();
  for (let i = 0; i < titles.length; i += 50) {
    const chunk = titles.slice(i, i + 50);
    const url = `${API}?${new URLSearchParams({
      format: "json", formatversion: "2", action: "query",
      prop: "revisions", rvprop: "content", rvslots: "main",
      redirects: "1", titles: chunk.join("|"),
    })}`;
    const res = await fetchWithRetry(url, { headers: { "User-Agent": USER_AGENT } });
    const j = await res.json();
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

/** クラブ遍歴の各行のリンク先（記事名）を並べる。表示名は略されるので記事名で照合する */
function careerArticles(text) {
  const out = [];
  for (let i = 1; i <= 30; i++) {
    const raw = templateField(text, `クラブ${i}`);
    if (!raw) continue;
    const a = linkTarget(raw.replace(/^→/, "").replace(/（loan）|\(loan\)/g, ""))?.article;
    if (a) out.push(a);
  }
  return out;
}

/*
 * 同じクラブでも記事名がぶれる。所属チーム名は [[クリスタル・パレス]]、遍歴は
 * [[クリスタル・パレスFC]] のように転送ページ経由だったり、[[ボルシア・メンヘン…]]
 * のように誤字だったりする。厳密一致だと本当の欠落が埋もれるので、
 * 略号・区切りを落としたうえで、前方6文字が揃えば同じクラブとみなす。
 */
function sameClub(a, b) {
  const norm = (s) => s.replace(/[・＝=\s]/g, "").replace(/(FC|SC|AC|VV|CF|F\.C\.)/g, "");
  const [x, y] = [norm(a), norm(b)];
  return x === y || x.includes(y) || y.includes(x) || x.slice(0, 6) === y.slice(0, 6);
}

/** 原文に「クラブ3 = ○○」のような中身のある欄がいくつ並んでいるかを数える */
function countFilledRows(text, teamKey) {
  let n = 0;
  for (let i = 1; i <= 30; i++) {
    const v = templateField(text, `${teamKey}${i}`);
    if (v && stripMarkup(v)) n++;
  }
  return n;
}

/* ---- 掲載中のデータを読む（players.ts は生成物なので正規表現で足りる）---- */
const src = fs.readFileSync(path.join(ROOT, "src/data/players.ts"), "utf8");
const published = src.split("\n  {\n    slug:").slice(1).map((blk) => {
  const one = (k) => blk.match(new RegExp(`${k}: "([^"]*)"`))?.[1] ?? null;
  const list = (k) => {
    const start = blk.indexOf(`${k}: [`);
    if (start < 0) return [];
    const end = blk.indexOf("\n    ],", start);
    const body = blk.slice(start, end < 0 ? undefined : end);
    return [...body.matchAll(/team: "([^"]*)"/g)].map((x) => x[1]);
  };
  return {
    slug: blk.match(/^\s*"([^"]+)"/)[1],
    nameJa: one("nameJa"),
    position: one("position"),
    birthDate: one("birthDate"),
    club: one("club"),
    league: one("league"),
    career: list("career"),
    nationalCareer: list("nationalCareer"),
    facts: (blk.match(/facts: \[([\s\S]*?)\n    \],/)?.[1].match(/"/g)?.length ?? 0) / 2,
  };
});

/*
 * 記事名は表示名と一致しないことがある（例: 田中碧 → 「田中碧 (サッカー選手)」）。
 * 表示名でそのまま引くと曖昧さ回避のページを読んでしまい、欄が0個に見える。
 * 取得時に使った候補リストから、表示名 → 実際の記事名を引き直す。
 */
const candidates = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/player-candidates.json"), "utf8"));
const articleOf = new Map(candidates.map((t) => [t.replace(/\s*\(サッカー選手\)$/, ""), t]));

console.log(`掲載中: ${published.length}人。Wikipediaの原文と突き合わせます…\n`);
const texts = await fetchWikitext(published.map((p) => articleOf.get(p.nameJa) ?? p.nameJa));

/* ---- 1件ずつ点検する ---- */
const issues = [];
const add = (p, kind, detail) => issues.push({ kind, who: `${p.nameJa}（${p.slug}）`, detail });

for (const p of published) {
  const text = texts.get(articleOf.get(p.nameJa) ?? p.nameJa);
  if (!text) {
    add(p, "記事なし", "Wikipedia日本語版の記事を取得できなかった");
    continue;
  }
  const info = parsePlayer(text);

  const rawClubs = countFilledRows(text, "クラブ");
  if (rawClubs !== p.career.length) {
    add(p, "クラブ遍歴の取りこぼし", `原文は${rawClubs}行、掲載は${p.career.length}行`);
  }
  const rawNational = countFilledRows(text, "代表");
  if (rawNational !== p.nationalCareer.length) {
    add(p, "代表歴の取りこぼし", `原文は${rawNational}行、掲載は${p.nationalCareer.length}行`);
  }
  if (rawNational === 0 && p.nationalCareer.length === 0) {
    // 落としたのではなく元から空。誤りではないが、代表歴なしと表示してよいかの確認用
    add(p, "代表歴なし（原文も空）", "インフォボックスに代表欄が書かれていない");
  }
  if (info.position && info.position !== p.position) {
    add(p, "ポジション不一致", `原文=${info.position} / 掲載=${p.position}`);
  }
  if (info.birthDate && info.birthDate !== p.birthDate) {
    add(p, "生年月日不一致", `原文=${info.birthDate} / 掲載=${p.birthDate}`);
  }
  /*
   * 現所属クラブは遍歴のどこかに出てくるはず。表示名は略されることが多い
   * （[[ボルシア・メンヒェングラートバッハ|ボルシアMG]]）ので、表示名ではなく
   * リンク先の記事名どうしで突き合わせる。
   */
  if (info.clubArticle) {
    const articles = careerArticles(text);
    if (!articles.some((a) => sameClub(a, info.clubArticle))) {
      add(p, "現所属がクラブ遍歴にない", `所属=${info.clubArticle} / 遍歴=${articles.join("、") || "なし"}`);
    }
  }
  const age = (Date.now() - new Date(p.birthDate)) / 31557600000;
  if (!(age > 15 && age < 45)) add(p, "年齢が不自然", `${p.birthDate} から算出すると ${age.toFixed(1)}歳`);
}

/* ---- 掲載データ内部の整合 ---- */
const slugs = new Set(published.map((p) => p.slug));
const factsFile = path.join(ROOT, "src/data/player-facts.ts");
if (fs.existsSync(factsFile)) {
  const keys = [...fs.readFileSync(factsFile, "utf8").matchAll(/^\s*"([a-z0-9-]+)":/gm)].map((m) => m[1]);
  for (const k of keys) {
    if (!slugs.has(k)) issues.push({ kind: "特徴の宛先が不明", who: k, detail: "この slug の選手は掲載されていない" });
  }
  const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
  for (const k of dup) issues.push({ kind: "特徴の重複", who: k, detail: "同じ slug が2回書かれている" });
}

/* ---- レポート ---- */
const byKind = new Map();
for (const it of issues) byKind.set(it.kind, [...(byKind.get(it.kind) ?? []), it]);

const today = new Date().toISOString().slice(0, 10);
let md = `# 選手データ点検レポート\n\n`;
md += `${today} 実行 / 掲載${published.length}人 / 指摘${issues.length}件\n\n`;
md += `Wikipedia日本語版のインフォボックス原文と、サイトに掲載しているデータを突き合わせた結果。\n`;
md += `自動修正はしていない。各項目は一次情報を確認したうえで人が判断する。\n\n`;
if (issues.length === 0) md += `食い違いは見つからなかった。\n`;
for (const [kind, list] of [...byKind].sort((a, b) => b[1].length - a[1].length)) {
  md += `## ${kind}（${list.length}件）\n\n`;
  for (const it of list) md += `- **${it.who}** — ${it.detail}\n`;
  md += `\n`;
}
fs.mkdirSync(path.join(ROOT, "output"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "output/player-audit.md"), md);

for (const [kind, list] of [...byKind].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n■ ${kind}（${list.length}件）`);
  for (const it of list) console.log(`  ${it.who} — ${it.detail}`);
}
console.log(`\n${issues.length}件を output/player-audit.md に書き出しました`);
