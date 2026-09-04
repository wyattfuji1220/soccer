/**
 * その日の試合を X に投稿する文面を作り、必要なら投稿する。
 *
 * 決めごとが4つある。
 *
 * 1. 本文にURLを入れない。
 *    X APIはURLを含む投稿を $0.200、含まない投稿を $0.015 で課金する。13倍違う。
 *    誘導はプロフィール欄のリンクに任せる。リンク付き投稿は表示が抑えられる
 *    傾向もあるので、費用の面でも届き方の面でも本文に入れない方がよい。
 *
 * 2. ハイライトの題名を引用しない。
 *    題名は権利者が書いた文章で、当サイトのものではない。載せるのは
 *    自分たちのデータから組み立てた事実だけにする。
 *
 * 3. 「出場する」と書かない。
 *    持っているのは所属クラブの試合であって、出場するかどうかは分からない。
 *    負傷や登録の都合で出ないことがあるため、必ず所属クラブの試合だと断る。
 *
 * 4. 何も無い日は投稿しない。
 *    試合が無い日に埋め草を出すと、同じ文面が続いてXに弾かれる。
 *
 * 既定では文面を表示するだけで投稿しない。--post を付けたときだけ実際に送る。
 *
 * 実行:
 *   node scripts/post-to-x.mjs --kind=tonight          # 下書きを見る
 *   node scripts/post-to-x.mjs --kind=results --post   # 実際に投稿する
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { loadEnv } from "./_env.mjs";

const ROOT = process.cwd();
loadEnv(ROOT);

const args = process.argv.slice(2);
const KIND = (args.find((a) => a.startsWith("--kind="))?.split("=")[1] ?? "tonight");
const DO_POST = args.includes("--post");

/** Xの文字数は全角を2、半角を1として数える。上限280 */
const weigh = (s) => [...s].reduce((n, c) => n + (c.charCodeAt(0) < 0x1100 ? 1 : 2), 0);
const LIMIT = 270; // 余白を残す

/* ---------------- データを読む ---------------- */

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

/** 掲載選手。所属クラブの英語名で試合と突き合わせる */
function players() {
  const out = [];
  for (const blk of read("src/data/players.ts").split("\n  {\n    slug:").slice(1)) {
    const g = (k) => blk.match(new RegExp(`${k}: "([^"]*)"`))?.[1] ?? null;
    out.push({ nameJa: g("nameJa"), club: g("club"), clubEn: g("clubEn") });
  }
  return out.filter((p) => p.nameJa);
}

/** ハイライトの本数だけを数える。題名は使わない */
function highlightCount(sinceDate) {
  return [...read("src/data/highlights.ts").matchAll(/publishedAt: "([\d-]+)"/g)].filter(
    (m) => m[1] >= sinceDate
  ).length;
}

const fixtures = JSON.parse(read("src/data/fixtures.json")).matches ?? [];

/* ---------------- 日本時間 ---------------- */

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" });
const hhmm = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hour12: false });
const md = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric", weekday: "short" });

/** JST 9:00 を境にした「観戦ナイト」。欧州の夜は日本時間だと翌朝になるため */
const nightKey = (d) => dayKey.format(new Date(d.getTime() - 9 * 3600_000));

/* ---------------- 文面を組み立てる ---------------- */

const roster = players();
const byClubEn = new Map();
for (const p of roster) {
  if (!p.clubEn) continue;
  byClubEn.set(p.clubEn, [...(byClubEn.get(p.clubEn) ?? []), p]);
}

/** その試合に関わる掲載選手 */
function playersOf(f) {
  return (f.clubsEn ?? []).flatMap((en) => byClubEn.get(en) ?? []);
}

const now = new Date();
const tonight = nightKey(now);

/** 今夜これから始まる試合。すでに始まったものは出さない */
function tonightPost() {
  const rows = fixtures
    .filter(
      (f) =>
        nightKey(new Date(f.utcDate)) === tonight &&
        f.status === "SCHEDULED" &&
        new Date(f.utcDate) > now
    )
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate));
  if (rows.length === 0) return null;

  const head = `【今夜の海外組】${md.format(now).replace(/\s/g, "")}`;
  const tail = "※日本人選手が所属するクラブの試合です\n日本時間の一覧はプロフィールのリンクから";

  const lines = [];
  for (const f of rows) {
    const names = playersOf(f).map((p) => p.nameJa);
    if (names.length === 0) continue;
    const line = `${hhmm.format(new Date(f.utcDate))} ${playersOf(f)[0].club}（${names.slice(0, 3).join("、")}）`;
    if (weigh([head, ...lines, line, `ほか全${rows.length}試合`, tail].join("\n")) > LIMIT) break;
    lines.push(line);
  }
  if (lines.length === 0) return null;

  const count = lines.length < rows.length ? `ほか全${rows.length}試合` : `全${rows.length}試合`;
  return [head, ...lines, count, tail].join("\n");
}

/**
 * 直近で終わった観戦ナイトの試合。
 *
 * 実行時刻から逆算すると、9時の境界をまたぐたびに意味が変わって間違えやすい。
 * 終わった試合が実際に入っている夜のうち、いちばん新しいものを選ぶ。
 *
 * 誰が点を取ったかは持っていないので書かない。無料で取れるのは日程と結果だけで、
 * 得点者は有料のデータにしか入っていない。
 */
function resultsPost() {
  const nights = [
    ...new Set(
      fixtures.filter((f) => f.status === "FINISHED").map((f) => nightKey(new Date(f.utcDate)))
    ),
  ]
    .filter((n) => n <= tonight)
    .sort();
  const night = nights.at(-1);
  if (!night) return null;

  const done = fixtures.filter(
    (f) => f.status === "FINISHED" && nightKey(new Date(f.utcDate)) === night
  );
  const [y, m, d] = night.split("-").map(Number);
  const label = md.format(new Date(Date.UTC(y, m - 1, d, 12))).replace(/\s/g, "");
  const clips = highlightCount(night);
  const clubs = [...new Set(done.flatMap((f) => playersOf(f).map((p) => p.club)))];

  const head = [
    `【${label}の海外組】`,
    `日本人選手が所属するクラブの試合が${done.length}試合ありました。`,
    clips > 0 ? `公式チャンネルのハイライトは${clips}本出ています。` : null,
    "スコアはふせて並べているので、これから観る人も大丈夫です。",
  ].filter(Boolean);
  const tail = "結果とハイライトはプロフィールのリンクから";

  // クラブ名は長いものがあるので、収まるぶんだけ足す
  const shown = [];
  for (const c of clubs) {
    if (weigh([...head, `${[...shown, c].join(" / ")} ほか`, tail].join("\n")) > LIMIT) break;
    shown.push(c);
  }
  const line =
    shown.length > 0
      ? [`${shown.join(" / ")}${shown.length < clubs.length ? " ほか" : ""}`]
      : [];
  return [...head, ...line, tail].join("\n");
}

/* ---------------- 投稿する ---------------- */

/** OAuth 1.0a の署名。POSTのJSON本文は署名に含めない */
const pct = (s) =>
  encodeURIComponent(s).replace(/[!*'()]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());

function authHeader(url, method, k) {
  const p = {
    oauth_consumer_key: k.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: k.token,
    oauth_version: "1.0",
  };
  const base = [
    method,
    pct(url),
    pct(Object.keys(p).sort().map((x) => `${pct(x)}=${pct(p[x])}`).join("&")),
  ].join("&");
  p.oauth_signature = crypto
    .createHmac("sha1", `${pct(k.apiSecret)}&${pct(k.tokenSecret)}`)
    .update(base)
    .digest("base64");
  return "OAuth " + Object.keys(p).sort().map((x) => `${pct(x)}="${pct(p[x])}"`).join(", ");
}

async function post(text) {
  const k = {
    apiKey: process.env.X_API_KEY,
    apiSecret: process.env.X_API_SECRET,
    token: process.env.X_ACCESS_TOKEN,
    tokenSecret: process.env.X_ACCESS_SECRET,
  };
  const missing = Object.entries(k).filter(([, v]) => !v).map(([n]) => n);
  if (missing.length) {
    console.error(`鍵が足りません: ${missing.join(", ")}`);
    process.exit(1);
  }
  const url = "https://api.x.com/2/tweets";
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: authHeader(url, "POST", k), "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`投稿できませんでした（${res.status}）: ${body}`);
    process.exit(1);
  }
  console.log(`投稿しました: ${body}`);
}

const text = KIND === "results" ? resultsPost() : tonightPost();

if (!text) {
  console.log(`${KIND}: 出すものがありません。投稿は見送ります`);
  process.exit(0);
}

console.log(`--- ${KIND}（${weigh(text)}/280文字ぶん）---\n${text}\n---`);

if (DO_POST) await post(text);
else console.log("下書きのみ。実際に投稿するには --post を付けます");
