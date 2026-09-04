/**
 * 選手データ（現所属＋クラブ遍歴）に登場するクラブを集約し、src/data/clubs.ts を生成する。
 *
 * 経歴欄のクラブ名は表記がぶれる（シント＝トロイデン / シントトロイデンVV、
 * ボルシアMG / ボルシア・メンヒェングラートバッハ）。Wikipediaのリダイレクトを解決して
 * 正式な記事名に寄せることで、同じクラブを1つにまとめる。
 *
 * 実行: node scripts/fetch-clubs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fetchWithRetry, politeDelay, USER_AGENT } from "./_env.mjs";

const ROOT = process.cwd();
const API = "https://ja.wikipedia.org/w/api.php";

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  const res = await fetchWithRetry(url, { headers: { "User-Agent": USER_AGENT } });
  return res.json();
}

/** タイトルの正式名・英語名をまとめて解決する */
async function resolveTitles(titles) {
  const canonical = new Map();
  const english = new Map();

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
    const back = new Map();
    for (const r of j.query.redirects ?? []) {
      back.set(r.to, [...(back.get(r.to) ?? []), r.from]);
    }
    for (const n of j.query.normalized ?? []) {
      back.set(n.to, [...(back.get(n.to) ?? []), n.from]);
    }
    for (const page of j.query.pages ?? []) {
      if (page.missing) continue;
      canonical.set(page.title, page.title);
      for (const from of back.get(page.title) ?? []) canonical.set(from, page.title);
      const en = page.langlinks?.[0]?.title;
      if (en) english.set(page.title, en);
    }
    if (i + 50 < titles.length) await politeDelay();
  }
  return { canonical, english };
}

/**
 * 選手記事のリンク先がクラブの記事とは限らない。
 * 「シント＝トロイデン」はベルギーの都市、「クリスタル・パレス」はロンドンの建造物の記事。
 * 下の検証で見つかったものをここに追加していく。
 */
const clubAlias = {
  // 都市名の記事を指しているもの
  "シント＝トロイデン": "シント＝トロイデンVV",
  "シントトロイデンVV": "シント＝トロイデンVV",
  "シュトゥットガルト": "VfBシュトゥットガルト",
  "フライブルク・イム・ブライスガウ": "SCフライブルク",
  "ヘント": "KAAヘント",
  // まったく別の記事を指しているもの
  "クリスタル・パレス": "クリスタル・パレスFC", // ロンドンの建造物
  "日本電気": "NECナイメヘン", // 電機メーカー
  "アイアース": "アヤックス・アムステルダム", // ギリシャ神話の人物
  "セルティック": "セルティックFC", // ケルト人

  /*
   * 2026-09-04 に追加した14件。
   *
   * 検証は前から「クラブの記事ではない」と警告していたが、放置していた。
   * そのあいだ都市や曖昧さ回避の記事がそのままクラブとして登録され、
   * liverpool-2 や blackburn-disambiguation といった実体のないクラブページが
   * 14本できていた。ハイライトの突き合わせも、同じクラブに名前が2つあるせいで
   * どちらか決められず、リヴァプールやフランクフルトの試合を丸ごと落としていた。
   */
  デュッセルドルフ: "フォルトゥナ・デュッセルドルフ",
  ブレーメン: "ヴェルダー・ブレーメン",
  ハノーファー: "ハノーファー96",
  キール: "ホルシュタイン・キール",
  "フランクフルト・アム・マイン": "アイントラハト・フランクフルト",
  リヴァプール: "リヴァプールFC",
  サウサンプトン: "サウサンプトンFC",
  ブラックバーン: "ブラックバーン・ローヴァーズFC", // 曖昧さ回避の記事
  "ル・アーヴル": "ル・アーヴルAC",
  フローニンゲン: "FCフローニンゲン",
  PSV: "PSVアイントホーフェン",
  ベールスホット: "KベールスホットVA",
  ウェステルロー: "KVCウェステルロー",
  コルトレイク: "KVコルトレイク",
};

/** その記事がサッカークラブの記事かどうかを本文で確かめる */
async function verifyClubArticles(titles) {
  const notClub = [];
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
    for (const page of j.query.pages ?? []) {
      const text = page.revisions?.[0]?.slots?.main?.content ?? "";
      if (!/\{\{サッカークラブ|\{\{Infobox football club/i.test(text)) notClub.push(page.title);
    }
    if (i + 50 < titles.length) await politeDelay();
  }
  return notClub;
}

const { players } = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts/player-wikipedia.json"), "utf8")
);
const abroad = players.filter((p) => p.abroad);

// 集約対象のクラブ名をすべて集める
const rawNames = new Set();
for (const p of abroad) {
  rawNames.add(p.clubArticle ?? p.club);
  for (const c of p.career) rawNames.add(c.team);
}
// ユースやセカンドチームは対象外にする
const names = [...rawNames].filter(
  (n) => n && !/U-?\d{2}|ユース|ジュニア|Jong|ヨング/i.test(n)
);

console.log(`${names.length}件のクラブ名を正規化します`);
const { canonical } = await resolveTitles(names);

/**
 * リンク名とリダイレクト解決後の記事名、どちらの段階でも別記事に飛びうる。
 * 「NEC」はリダイレクトで「日本電気」に、「アヤックス」は「アイアース」に着地する。
 */
function finalArticle(raw) {
  const first = clubAlias[raw] ?? raw;
  const resolved = canonical.get(first) ?? first;
  return clubAlias[resolved] ?? resolved;
}

// 別記事へ差し替えたぶんの英語名を取り直す
await politeDelay();
const allArticles = [...new Set([...rawNames].filter(Boolean).map(finalArticle))];
const { english } = await resolveTitles(allArticles);
console.log(`  ${new Set([...rawNames].filter(Boolean).map(finalArticle)).size}クラブに集約`);

/** 表示名は記事名から曖昧さ回避の括弧を落としたもの */
const display = (article) => article.replace(/\s*\((?:サッカー|フットボール)[^)]*\)$/, "").trim();

const slugOf = (en, fallback) =>
  (en ?? fallback)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\bf\.?c\.?\b|\ba\.?f\.?c\.?\b|\bs\.?c\.?\b/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const clubs = new Map();
function entry(article) {
  if (!clubs.has(article)) {
    clubs.set(article, {
      article,
      name: display(article),
      nameEn: english.get(article) ?? null,
      current: [],
      past: [],
      countries: new Set(),
    });
  }
  return clubs.get(article);
}

for (const p of abroad) {
  const currentArticle = finalArticle(p.clubArticle ?? p.club);
  if (currentArticle) {
    const e = entry(currentArticle);
    e.current.push({ slug: null, nameJa: p.nameJa, league: p.leagueId });
    if (p.country) e.countries.add(p.country);
  }
  for (const c of p.career) {
    const a = /U-?\d{2}|ユース|ジュニア|Jong|ヨング/i.test(c.team) ? null : finalArticle(c.team);
    if (!a || a === currentArticle) continue;
    const e = entry(a);
    if (!e.past.some((x) => x.nameJa === p.nameJa)) {
      e.past.push({ nameJa: p.nameJa, years: c.years, loan: c.loan });
    }
    if (c.country) e.countries.add(c.country);
  }
}

// 現所属がいる、または過去在籍が2人以上のクラブだけを対象にする（薄いページを作らない）
const selected = [...clubs.values()].filter((c) => c.current.length > 0 || c.past.length >= 2);

const seen = new Set();
for (const c of selected) {
  let s = slugOf(c.nameEn, c.article);
  if (!s) s = `club-${seen.size}`;
  if (seen.has(s)) s = `${s}-2`;
  seen.add(s);
  c.slug = s;
}

await politeDelay();
const notClub = await verifyClubArticles([...new Set(selected.map((c) => c.article))]);
if (notClub.length) {
  console.log("\n⚠ サッカークラブの記事ではない可能性があります（clubAlias への追加を検討）:");
  notClub.forEach((t) => console.log("  " + t));
}

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const today = new Date().toISOString().slice(0, 10);

const rows = selected
  .sort((a, b) => b.current.length - a.current.length || b.past.length - a.past.length)
  .map(
    (c) => `  {
    slug: "${c.slug}",
    name: "${esc(c.name)}",
    nameEn: ${c.nameEn ? `"${esc(c.nameEn)}"` : "null"},
    article: "${esc(c.article)}",
    countries: [${[...c.countries].map((x) => `"${x}"`).join(", ")}],
    currentPlayers: [${c.current.map((x) => `"${esc(x.nameJa)}"`).join(", ")}],
    pastPlayers: [
${c.past
  .map((x) => `      { nameJa: "${esc(x.nameJa)}", years: ${x.years ? `"${esc(x.years)}"` : "null"}, loan: ${x.loan} },`)
  .join("\n")}
    ],
  },`
  );

const out = `import type { Club } from "@/lib/types";

/**
 * このファイルは scripts/fetch-clubs.mjs が生成する。直接編集しないこと。
 *
 * 掲載選手の現所属とクラブ遍歴を集約したもの。表記ゆれは Wikipedia の
 * リダイレクト解決で正式な記事名に寄せている。
 * 現所属選手がいる、または過去に2人以上が在籍したクラブだけを収録している。
 *
 * 最終取得: ${today}
 */
export const clubs: Club[] = [
${rows.join("\n")}
];

export const clubMap = Object.fromEntries(clubs.map((c) => [c.slug, c]));

/** 選手名からその選手が関わったクラブを引く */
export function clubsForPlayer(nameJa: string): Club[] {
  return clubs.filter(
    (c) => c.currentPlayers.includes(nameJa) || c.pastPlayers.some((p) => p.nameJa === nameJa)
  );
}
`;

fs.writeFileSync(path.join(ROOT, "src/data/clubs.ts"), out);

const overseas = selected.filter((c) => !c.countries.has("JPN") || c.current.length > 0);
console.log(`\n${selected.length}クラブを src/data/clubs.ts に生成しました`);
console.log(`  現所属あり: ${selected.filter((c) => c.current.length > 0).length}`);
console.log(`  過去在籍のみ: ${selected.filter((c) => c.current.length === 0).length}`);
console.log("\n=== 日本人が多く在籍したクラブ 上位12 ===");
for (const c of [...selected].sort((a, b) => b.current.length + b.past.length - (a.current.length + a.past.length)).slice(0, 12)) {
  console.log(
    `  ${String(c.current.length + c.past.length).padStart(2)}人  ${c.name}  (${c.slug})`
  );
}
