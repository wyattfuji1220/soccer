/**
 * 権利者の公式チャンネルに、試合ごとのハイライトがどれだけ出ているかを数える。
 *
 * 「各試合にハイライトのリンクを貼れるか」を決めるための調査。作ってから
 * 紐づく試合が数件しかなかった、という事態を避けるために先に測る。
 *
 * DAZN Japan は直近の投稿がプロ野球で埋まっており、RSS（15件）では
 * 海外サッカーが見えない。投稿一覧を遡って読む必要があるため API を使う。
 * 費用はかからない（1日10,000ユニットの無料枠。投稿50件の取得で1ユニット）。
 *
 * 事前に .env.local に YOUTUBE_API_KEY=<APIキー> を設定すること。
 * 取得: https://console.cloud.google.com/ で YouTube Data API v3 を有効化
 *
 * 実行: npm run check:highlights [遡る日数]
 */
import fs from "node:fs";
import path from "node:path";
import { fetchWithRetry, loadEnv, politeDelay, USER_AGENT } from "./_env.mjs";

const ROOT = process.cwd();
loadEnv(ROOT);

const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) {
  console.error("YOUTUBE_API_KEY が未設定です。.env.local に設定してください。");
  console.error("取得: https://console.cloud.google.com/ →「YouTube Data API v3」を有効化 → 認証情報 → APIキー");
  process.exit(1);
}

const DAYS = Number(process.argv[2] ?? 60);
const API = "https://www.googleapis.com/youtube/v3";

/** 権利者本人が運営していると確認できたチャンネル。videos.ts と同じ基準 */
const CHANNELS = [
  { label: "DAZN Japan", handle: "@DAZNJapan" },
  { label: "U-NEXT フットボール", handle: "@UNEXT_football" },
  { label: "ABEMA スポーツ", handle: "@ABEMA_Sports" },
];

async function api(endpoint, params) {
  const url = `${API}/${endpoint}?${new URLSearchParams({ key: KEY, ...params })}`;
  const res = await fetchWithRetry(url, { headers: { "User-Agent": USER_AGENT } });
  return res.json();
}

/** ハンドルから投稿一覧のプレイリストIDを引く */
async function uploadsPlaylist(handle) {
  const j = await api("channels", { part: "contentDetails,snippet", forHandle: handle });
  const ch = j.items?.[0];
  if (!ch) return null;
  return { id: ch.contentDetails.relatedPlaylists.uploads, title: ch.snippet.title };
}

/** 指定日数ぶんの投稿を遡って集める */
async function recentUploads(playlistId, since) {
  const out = [];
  let pageToken;
  for (let page = 0; page < 20; page++) {
    const j = await api("playlistItems", {
      part: "snippet",
      playlistId,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });
    for (const it of j.items ?? []) {
      const published = it.snippet.publishedAt.slice(0, 10);
      out.push({ title: it.snippet.title, published, videoId: it.snippet.resourceId?.videoId });
    }
    const oldest = out[out.length - 1]?.published;
    pageToken = j.nextPageToken;
    if (!pageToken || (oldest && oldest < since)) break;
    await politeDelay();
  }
  return out.filter((v) => v.published >= since);
}

/**
 * クラブ名の見分け方。
 * 掲載しているクラブ名は「ブライトン・アンド・ホーヴ・アルビオンFC」だが、
 * 動画の題名では「ブライトン」と短く書かれる。先頭のカタカナのまとまりを
 * 手がかりにする。
 */
function clubKeys() {
  const src = fs.readFileSync(path.join(ROOT, "src/data/clubs.ts"), "utf8");
  const keys = new Map();
  for (const blk of src.split("\n  {\n").slice(1)) {
    const name = blk.match(/name: "([^"]+)"/)?.[1];
    const countries = [...(blk.match(/countries: \[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([A-Z]{3})"/g)].map((m) => m[1]);
    if (!name) continue;
    // 日本のクラブは対象外。当サイトが扱うのは海外でプレーする選手の試合
    if (countries.includes("JPN")) continue;

    /*
     * 題名では「ブライトン・アンド・ホーヴ・アルビオンFC」が「ブライトン」と
     * 短く書かれる。先頭のカタカナのまとまりを手がかりにするが、3文字だと
     * 「レアル」がレアル・マドリーにも当たってしまう。5文字以上に限る。
     */
    const head = name.match(/^[ァ-ヺー]{5,}/)?.[0];
    const stripped = name.replace(/(FC|SC|AC|CF|VV|AFC)/g, "").replace(/[・＝\s]/g, "");
    for (const k of [head, stripped, name].filter((k) => k && k.length >= 4)) {
      if (!keys.has(k)) keys.set(k, name);
    }
  }
  return keys;
}

/** 題名に出てくる掲載クラブを列挙する。同じクラブは1つに畳む */
function clubsInTitle(title, keys) {
  const found = new Set();
  for (const [key, name] of keys) {
    if (title.includes(key)) found.add(name);
  }
  return [...found];
}

const OTHER_SPORTS = /プロ野球|ベースボール|Ｂリーグ|バスケ|F1|モータ|ボクシング|テニス|ラグビー|ゴルフ|卓球|バレー/;
/** Jリーグは対象外。海外でプレーする選手の試合だけを数える */
const DOMESTIC = /Jリーグ|明治安田|J1|J2|J3|ルヴァン|天皇杯/;
const HIGHLIGHT = /ハイライト|highlights?/i;

const since = new Date(Date.now() - DAYS * 86400000).toISOString().slice(0, 10);
const keys = clubKeys();
console.log(`${since} 以降の投稿を調べます（掲載クラブ ${new Set(keys.values()).size}件と突き合わせ）\n`);

const summary = [];
for (const ch of CHANNELS) {
  const info = await uploadsPlaylist(ch.handle);
  if (!info) {
    console.log(`════ ${ch.label}（${ch.handle}）: チャンネルが見つかりません`);
    summary.push({ ...ch, total: 0, football: 0, matched: 0, twoClubs: 0 });
    continue;
  }

  const uploads = await recentUploads(info.id, since);
  const football = uploads.filter((v) => !OTHER_SPORTS.test(v.title) && !DOMESTIC.test(v.title));
  const withClubs = football
    .map((v) => ({ ...v, clubs: clubsInTitle(v.title, keys) }))
    .filter((v) => v.clubs.length > 0);
  /*
   * 日本人がいるのは対戦の片方だけなのがふつうなので、掲載クラブが1つ
   * 出てくれば試合に紐づけられる。相手クラブまで掲載しているとは限らない。
   */
  const linkable = withClubs.filter((v) => HIGHLIGHT.test(v.title));
  const bothSides = linkable.filter((v) => v.clubs.length >= 2);

  console.log(`════ ${info.title}（${ch.handle}）`);
  console.log(`  投稿 ${uploads.length}件 / 他競技とJリーグを除くと ${football.length}件`);
  console.log(`  掲載クラブ名を含む: ${withClubs.length}件`);
  console.log(`  うち「ハイライト」= 試合に紐づけられる: ${linkable.length}件（両チームに日本人: ${bothSides.length}件）`);
  for (const v of linkable.slice(0, 16)) {
    console.log(`    ${v.published}  ${v.title.slice(0, 64)}`);
  }
  summary.push({ ...ch, total: uploads.length, football: football.length, matched: withClubs.length, twoClubs: linkable.length });
  console.log();
  await politeDelay();
}

const total = summary.reduce((n, s) => n + s.twoClubs, 0);
const perWeek = (total / (DAYS / 7)).toFixed(1);
console.log("──────────────");
console.log(`試合に紐づけられる動画: 合計 ${total}件（週あたり約 ${perWeek}件）`);
console.log(
  total === 0
    ? "→ 紐づく試合がありません。この機能は見送るのが妥当です。"
    : Number(perWeek) < 3
      ? "→ 週3件未満。労力に見合うか、内容を見て判断してください。"
      : "→ 十分な数があります。実装に進む価値があります。"
);
