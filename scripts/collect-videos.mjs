/**
 * 候補の動画IDを YouTube の oEmbed で検証し、src/data/videos.ts を生成する。
 *
 * 検索結果や人づての情報ではなく、YouTube 自身が返すタイトルとチャンネル名だけを採用する。
 * 権利者本人のチャンネル（OFFICIAL_CHANNELS）以外は自動的に除外する。
 *
 * 実行: node scripts/collect-videos.mjs <候補JSONのパス>
 */
import fs from "node:fs";
import path from "node:path";
import { politeDelay, USER_AGENT } from "./_env.mjs";

const ROOT = process.cwd();

/** 権利者自身が運営していると確認できたチャンネルのみ */
export const OFFICIAL_CHANNELS = [
  "DAZN Japan",
  "jfatv",
  "U-NEXT サッカー",
  "U-NEXT フットボール",
  "ABEMA スポーツ",
];

async function oembed(videoId) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${videoId}`
  )}&format=json`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) return null;
  return res.json();
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("候補JSONのパスを指定してください");
  process.exit(1);
}

const candidates = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const today = new Date().toISOString().slice(0, 10);

const accepted = [];
const rejected = [];

for (const c of candidates) {
  const data = await oembed(c.videoId);
  if (!data) {
    rejected.push({ ...c, reason: "動画が存在しないか非公開" });
    console.log(`  除外 ${c.videoId} 動画が存在しないか非公開`);
  } else if (!OFFICIAL_CHANNELS.includes(data.author_name)) {
    rejected.push({ ...c, reason: `権利者チャンネルではない (${data.author_name})` });
    console.log(`  除外 ${c.videoId} ${data.author_name}`);
  } else {
    accepted.push({
      playerSlug: c.playerSlug,
      videoId: c.videoId,
      title: data.title,
      channel: data.author_name,
      channelUrl: data.author_url,
      verifiedAt: today,
    });
    console.log(`  採用 ${c.videoId} ${data.author_name}`);
  }
  await politeDelay();
}

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const out = `import type { PlayerVideo } from "@/lib/types";

/**
 * 選手ページに埋め込む公式動画。
 *
 * 収録しているのは権利者自身が運営するチャンネルの動画のみで、
 * タイトルとチャンネル名は YouTube の oEmbed が返した値をそのまま保存している。
 * 追加・再検証は scripts/collect-videos.mjs と scripts/verify-videos.mjs で行う。
 */
export const OFFICIAL_CHANNELS = [
${OFFICIAL_CHANNELS.map((c) => `  "${esc(c)}",`).join("\n")}
];

export const videos: PlayerVideo[] = [
${accepted
  .map(
    (v) => `  {
    playerSlug: "${v.playerSlug}",
    videoId: "${v.videoId}",
    title: "${esc(v.title)}",
    channel: "${esc(v.channel)}",
    channelUrl: "${esc(v.channelUrl)}",
    verifiedAt: "${v.verifiedAt}",
  },`
  )
  .join("\n")}
];

export function videosForPlayer(slug: string): PlayerVideo[] {
  return videos.filter((v) => v.playerSlug === slug && OFFICIAL_CHANNELS.includes(v.channel));
}
`;

fs.writeFileSync(path.join(ROOT, "src/data/videos.ts"), out);
console.log(`\n採用 ${accepted.length}件 / 除外 ${rejected.length}件`);
console.log("src/data/videos.ts を生成しました");
