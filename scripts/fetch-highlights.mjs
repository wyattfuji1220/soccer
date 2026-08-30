/**
 * 権利者の公式チャンネルから、試合ハイライトの動画を集める。
 *
 * 集めるのは動画IDと題名だけで、映像そのものは扱わない。表示は YouTube の
 * 公式プレーヤーへのリンクで、当サイトが保存も再配信もしない。
 * 対象は権利者本人が運営しているチャンネルに限る（CHANNELS）。
 *
 * リーグでは絞らない。掲載クラブの名前が題名にあれば拾う。
 * 今は出ていないリーグ（ブンデスリーガなど）でも、権利者が投稿を始めれば
 * 自動的に載るようにするため。
 *
 * 事前に .env.local か環境変数に YOUTUBE_API_KEY を設定すること。
 * 費用はかからない（1日10,000ユニットの無料枠。投稿50件の取得で1ユニット）。
 *
 * 実行: npm run data:highlights [遡る日数]
 */
import fs from "node:fs";
import path from "node:path";
import { fetchWithRetry, loadEnv, politeDelay, USER_AGENT } from "./_env.mjs";

const ROOT = process.cwd();
loadEnv(ROOT);

const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) {
  console.error("YOUTUBE_API_KEY が未設定です。.env.local か GitHub シークレットに設定してください。");
  process.exit(1);
}

const DAYS = Number(process.argv[2] ?? 45);
const API = "https://www.googleapis.com/youtube/v3";
const outPath = path.join(ROOT, "src/data/highlights.ts");

/**
 * 権利者本人が運営していると確認できたチャンネル。
 * 増やすときは、そのチャンネルが権利者自身のものかを必ず確かめること。
 */
const CHANNELS = [
  { label: "DAZN Japan", handle: "@DAZNJapan" },
  { label: "U-NEXT フットボール", handle: "@UNEXT_football" },
];

/** 他競技と国内リーグ。当サイトは海外でプレーする選手を扱う */
const OTHER_SPORTS = /プロ野球|ベースボール|Ｂリーグ|バスケ|F1|モータ|ボクシング|テニス|ラグビー|ゴルフ|卓球|バレー/;
const DOMESTIC = /Jリーグ|明治安田|J1|J2|J3|ルヴァン|天皇杯/;
const HIGHLIGHT = /ハイライト|highlights?/i;

async function api(endpoint, params) {
  const url = `${API}/${endpoint}?${new URLSearchParams({ key: KEY, ...params })}`;
  const res = await fetchWithRetry(url, { headers: { "User-Agent": USER_AGENT } });
  return res.json();
}

async function uploadsPlaylist(handle) {
  const j = await api("channels", { part: "contentDetails,snippet", forHandle: handle });
  const ch = j.items?.[0];
  return ch ? { id: ch.contentDetails.relatedPlaylists.uploads, title: ch.snippet.title } : null;
}

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
      out.push({
        videoId: it.snippet.resourceId?.videoId,
        title: it.snippet.title,
        publishedAt: it.snippet.publishedAt.slice(0, 10),
      });
    }
    const oldest = out[out.length - 1]?.publishedAt;
    pageToken = j.nextPageToken;
    if (!pageToken || (oldest && oldest < since)) break;
    await politeDelay();
  }
  return out.filter((v) => v.videoId && v.publishedAt >= since);
}

/**
 * 題名に出てくるクラブを見分けるための手がかり。
 *
 * 掲載しているのは「ブライトン・アンド・ホーヴ・アルビオンFC」だが、題名では
 * 「ブライトン」と短く書かれる。先頭のカタカナのまとまりを鍵にする。
 * 3文字だと「レアル」がレアル・マドリーにも当たるため、5文字以上に限る。
 */
function clubKeys() {
  const src = fs.readFileSync(path.join(ROOT, "src/data/clubs.ts"), "utf8");
  const keys = new Map();
  for (const blk of src.split("\n  {\n").slice(1)) {
    const name = blk.match(/name: "([^"]+)"/)?.[1];
    const countries = [...(blk.match(/countries: \[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([A-Z]{3})"/g)].map((m) => m[1]);
    if (!name || countries.includes("JPN")) continue;
    const head = name.match(/^[ァ-ヺー]{5,}/)?.[0];
    const stripped = name.replace(/(FC|SC|AC|CF|VV|AFC)/g, "").replace(/[・＝\s]/g, "");
    for (const k of [head, stripped, name].filter((k) => k && k.length >= 4)) {
      if (!keys.has(k)) keys.set(k, name);
    }
  }
  return keys;
}

/** 掲載している選手の名前。題名に出ていれば拾う */
function playerNames() {
  const src = fs.readFileSync(path.join(ROOT, "src/data/players.ts"), "utf8");
  return [...src.matchAll(/nameJa: "([^"]+)"/g)].map((m) => m[1]);
}

const since = new Date(Date.now() - DAYS * 86400000).toISOString().slice(0, 10);
const keys = clubKeys();
const names = playerNames();
console.log(`${since} 以降のハイライトを集めます（掲載クラブ ${new Set(keys.values()).size}件）`);

const found = new Map();
for (const ch of CHANNELS) {
  const info = await uploadsPlaylist(ch.handle);
  if (!info) {
    console.warn(`  ${ch.label}（${ch.handle}）: チャンネルが見つかりません`);
    continue;
  }
  const uploads = await recentUploads(info.id, since);
  let hit = 0;
  for (const v of uploads) {
    if (OTHER_SPORTS.test(v.title) || DOMESTIC.test(v.title)) continue;
    if (!HIGHLIGHT.test(v.title)) continue;
    const clubs = [...new Set([...keys].filter(([k]) => v.title.includes(k)).map(([, name]) => name))];
    if (clubs.length === 0) continue;
    found.set(v.videoId, {
      ...v,
      channel: info.title,
      clubs,
      players: names.filter((n) => v.title.includes(n)),
    });
    hit++;
  }
  console.log(`  ${info.title}: 投稿${uploads.length}件 → ハイライト${hit}件`);
  await politeDelay();
}

const rows = [...found.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const arr = (list) => `[${list.map((x) => `"${esc(x)}"`).join(", ")}]`;
const body = rows
  .map(
    (r) =>
      `  { videoId: "${r.videoId}", publishedAt: "${r.publishedAt}", channel: "${esc(r.channel)}", title: "${esc(r.title)}", clubs: ${arr(r.clubs)}, players: ${arr(r.players)} },`
  )
  .join("\n");

fs.writeFileSync(
  outPath,
  `import type { Highlight } from "@/lib/types";

/**
 * このファイルは scripts/fetch-highlights.mjs が生成する。直接編集しないこと。
 *
 * 権利者の公式チャンネルに投稿された試合ハイライト。動画IDと題名だけを持ち、
 * 映像は扱わない。表示はYouTubeの公式プレーヤーへのリンクで、当サイトが
 * 保存も再配信もしない。
 *
 * リーグでは絞っていない。掲載クラブの名前が題名にあれば拾うので、
 * 権利者が新しいリーグの投稿を始めれば自動的に増える。
 */
export const highlightsTakenAt = "${new Date().toISOString().slice(0, 10)}";

export const highlights: Highlight[] = [
${body}
];
`
);

console.log(`\n${rows.length}件を src/data/highlights.ts に書き出しました`);
const withPlayer = rows.filter((r) => r.players.length > 0).length;
console.log(`  題名に掲載選手の名前が入っているもの: ${withPlayer}件`);
