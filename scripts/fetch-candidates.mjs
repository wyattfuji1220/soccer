/**
 * 掲載候補の選手名を Wikipedia の一覧記事から作る。
 *
 * これまで scripts/player-candidates.json を手で書き足していたため、
 * 新しくヨーロッパへ渡った選手を取りこぼしていた（オーストリアやスロバキアの
 * 1部でプレーする選手が丸ごと抜けていた）。日本語版には
 * 「ヨーロッパのサッカーリーグに所属する日本人選手一覧」という国別・部別の
 * 一覧があるので、そこを唯一の入口にする。
 *
 * 記事は国ごとに「現在所属する選手」と「過去所属した選手」に分かれ、
 * その中が「; 1部」「; [[プレミアリーグ]]」のような見出しで区切られている。
 *   - 現在: いま掲載する選手（scripts/player-candidates.json）
 *   - 過去: 海外でプレーした記録として残す選手（scripts/alumni-candidates.json）
 * 名前を拾うだけで、所属や経歴は選手記事のインフォボックスから取る。
 *
 * 女子の選手も同じ記事に載っている。当サイトは男子リーグを対象にしているため、
 * 見出しと「Category:在外日本人の女子サッカー選手」の二重で除いている。
 *
 * 実行: node scripts/fetch-candidates.mjs [--report]
 */
import fs from "node:fs";
import path from "node:path";
import { fetchWithRetry, USER_AGENT, politeDelay } from "./_env.mjs";

const ROOT = process.cwd();
const SOURCE = "ヨーロッパのサッカーリーグに所属する日本人選手一覧";
const WOMEN_CATEGORY = "Category:在外日本人の女子サッカー選手";

/*
 * 掲載する国と、その国のどの階層までを対象にするか。
 * 一覧記事はアルバニア3部やイングランド9部まで載っているが、日本から観る手段が
 * あり、リーグとして定義してある範囲に絞る（src/data/leagues.ts と対応させる）。
 *
 * tiers: 「1部」「男子2部」のように数字で書かれた見出しを拾う
 * leagues: 「[[プレミアリーグ]]」のようにリーグ名で書かれた見出しを拾う
 */
const SCOPE = {
  イングランド: { tiers: [], leagues: ["プレミアリーグ", "EFLチャンピオンシップ"] },
  スペイン: { tiers: [], leagues: ["プリメーラ・ディビシオン", "セグンダ・ディビシオン"] },
  ドイツ: { tiers: [1, 2], leagues: [] },
  イタリア: { tiers: [1], leagues: ["セリエA"] },
  フランス: { tiers: [], leagues: ["リーグ・アン", "リーグ・ドゥ"] },
  オランダ: { tiers: [1], leagues: ["エールディヴィジ"] },
  ベルギー: { tiers: [1, 2], leagues: [] },
  ポルトガル: { tiers: [1], leagues: [] },
  スコットランド: { tiers: [1], leagues: [] },
  デンマーク: { tiers: [1], leagues: [] },
  オーストリア: { tiers: [1], leagues: [] },
  スイス: { tiers: [1], leagues: ["スイス・スーパーリーグ"] },
  ポーランド: { tiers: [1], leagues: [] },
  スロバキア: { tiers: [1], leagues: [] },
  セルビア: { tiers: [1], leagues: [] },
  クロアチア: { tiers: [1], leagues: [] },
  // ASモナコはフランスのリーグに出るため、国としては別でも対象に入れる
  モナコ: { tiers: [], leagues: ["リーグ・アン"] },
};

/** 女子リーグの見出し。男子と同じ節に並んでいるので文字列で見分ける */
const WOMEN = /女子|ウィメンズ|フラウエン|フェメニーナ|ダームアルスヴェンスカン|Women/i;
/** 育成年代・同好会など、プロのリーグ戦ではない見出し */
const NOT_LEAGUE = /U1[0-9]|U2[0-9]|同好会|エリートリーグ/;

async function api(params) {
  const url = `https://ja.wikipedia.org/w/api.php?${new URLSearchParams({
    format: "json",
    formatversion: "2",
    ...params,
  })}`;
  return (await fetchWithRetry(url, { headers: { "User-Agent": USER_AGENT } })).json();
}

async function fetchArticle(title) {
  const j = await api({
    action: "query", prop: "revisions", rvprop: "content",
    rvslots: "main", redirects: "1", titles: title,
  });
  const text = j.query?.pages?.[0]?.revisions?.[0]?.slots?.main?.content;
  if (!text) throw new Error(`記事を取得できません: ${title}`);
  return text;
}

async function fetchCategory(title) {
  const out = new Set();
  let cont;
  do {
    const j = await api({
      action: "query", list: "categorymembers", cmtitle: title,
      cmlimit: "500", cmtype: "page", ...(cont ? { cmcontinue: cont } : {}),
    });
    for (const m of j.query.categorymembers) out.add(m.title);
    cont = j.continue?.cmcontinue;
    if (cont) await politeDelay();
  } while (cont);
  return out;
}

/** 「* [[記事名|表示名]]（クラブ）」の行から記事名を取り出す */
function playerOf(line) {
  const m = line.match(/^\*\s*\[\[([^\]|#]+)/);
  if (!m) return null;
  const title = m[1].trim();
  if (/一覧|Category:|カテゴリ/.test(title)) return null;
  return title;
}

/** 見出しが掲載対象かどうか。対象なら true */
function inScope(heading, scope) {
  if (!heading) return false;
  if (WOMEN.test(heading) || NOT_LEAGUE.test(heading)) return false;
  if (scope.leagues.some((l) => heading.includes(l))) return true;
  const tier = heading.match(/(\d)\s*部/);
  return tier ? scope.tiers.includes(Number(tier[1])) : false;
}

export function parseList(text) {
  const countries = [];
  let country = null;
  let past = false;
  let heading = null;

  for (const raw of text.split("\n")) {
    const line = raw.trim();

    const h2 = line.match(/^==\s*([^=]+?)\s*==$/);
    if (h2) {
      country = { name: h2[1], rows: [] };
      countries.push(country);
      past = false;
      heading = null;
      continue;
    }
    if (!country) continue;

    if (/^;\s*現在所属/.test(line)) { past = false; heading = null; continue; }
    if (/^;\s*過去所属/.test(line)) { past = true; heading = null; continue; }
    if (/^;/.test(line)) { heading = line.replace(/^;\s*/, ""); continue; }

    const title = playerOf(line);
    if (title) country.rows.push({ title, heading, past });
  }
  return countries;
}

const text = await fetchArticle(SOURCE);
const countries = parseList(text);
const women = await fetchCategory(WOMEN_CATEGORY);

const current = new Map();
const alumni = new Set();
for (const c of countries) {
  const scope = SCOPE[c.name];
  for (const row of c.rows) {
    if (women.has(row.title)) continue;
    // 過去に所属した選手は国も階層も問わず全部ひろう。歴史の集計に使う
    if (row.past || !scope || !inScope(row.heading, scope)) {
      alumni.add(row.title);
      continue;
    }
    current.set(row.title, `${c.name} / ${row.heading}`);
  }
}
for (const t of current.keys()) alumni.delete(t);

if (process.argv.includes("--report")) {
  console.log(`女子選手として除外: ${women.size}人\n`);
  console.log("掲載対象になった選手\n");
  const byCountry = new Map();
  for (const [title, where] of current) {
    const c = where.split(" / ")[0];
    byCountry.set(c, [...(byCountry.get(c) ?? []), title]);
  }
  for (const [c, list] of [...byCountry].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${c.padEnd(9)} ${String(list.length).padStart(3)}人  ${list.join("、")}`);
  }
  const outside = countries
    .filter((c) => !SCOPE[c.name])
    .map((c) => ({ name: c.name, n: c.rows.filter((r) => !r.past && !women.has(r.title)).length }))
    .filter((x) => x.n > 0);
  console.log(`\n対象外の国に ${outside.reduce((n, x) => n + x.n, 0)}人`);
  console.log("  " + outside.map((x) => `${x.name}(${x.n})`).join(" / "));
}

const write = (file, list) => {
  const sorted = [...list].sort((a, b) => a.localeCompare(b, "ja"));
  fs.writeFileSync(path.join(ROOT, file), JSON.stringify(sorted, null, 1) + "\n");
  console.log(`${sorted.length}件を ${file} に書き出しました`);
};

write("scripts/player-candidates.json", current.keys());
write("scripts/alumni-candidates.json", alumni);
console.log(`出典: https://ja.wikipedia.org/wiki/${encodeURIComponent(SOURCE)}`);
