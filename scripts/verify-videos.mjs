/**
 * 掲載中の動画がまだ公開されているか、チャンネル名が変わっていないかを再確認する。
 *
 * 動画は削除されたり非公開になったりする。壊れたプレーヤーを放置しないよう、
 * 定期的に実行してレポートを確認すること。自動での削除は行わない。
 *
 * 実行: npm run data:videos
 */
import fs from "node:fs";
import path from "node:path";
import { politeDelay, USER_AGENT } from "./_env.mjs";

const ROOT = process.cwd();

function readVideos() {
  const src = fs.readFileSync(path.join(ROOT, "src/data/videos.ts"), "utf8");
  const officialBlock = src.match(/OFFICIAL_CHANNELS = \[([\s\S]*?)\]/)?.[1] ?? "";
  const official = [...officialBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

  const videos = [];
  const re = /playerSlug:\s*"([^"]+)",\s*videoId:\s*"([^"]+)",\s*title:\s*"((?:[^"\\]|\\.)*)",\s*channel:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) {
    videos.push({ playerSlug: m[1], videoId: m[2], title: m[3], channel: m[4] });
  }
  return { official, videos };
}

async function oembed(videoId) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${videoId}`
  )}&format=json`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) return null;
  return res.json();
}

const { official, videos } = readVideos();
console.log(`${videos.length}件の動画を再確認します（1件あたり1〜3秒待機）`);

const rows = [];
for (const v of videos) {
  const data = await oembed(v.videoId);
  let status;
  if (!data) status = "削除または非公開";
  else if (!official.includes(data.author_name)) status = `チャンネルが公式一覧にない (${data.author_name})`;
  else if (data.title !== v.title) status = "タイトルが変更された";
  else status = "OK";

  rows.push({ ...v, status, currentTitle: data?.title ?? "" });
  console.log(`  ${status === "OK" ? "OK  " : "要対応"} ${v.videoId} ${status}`);
  await politeDelay();
}

const problems = rows.filter((r) => r.status !== "OK");
const outDir = path.join(ROOT, "output");
fs.mkdirSync(outDir, { recursive: true });

const md = [
  `# 掲載動画の再確認レポート（${new Date().toISOString().slice(0, 10)}）`,
  "",
  `全${rows.length}件中、対応が必要なもの ${problems.length}件。`,
  "",
  "| 選手 | 動画ID | 状態 | 現在のタイトル |",
  "| --- | --- | --- | --- |",
  ...rows.map(
    (r) =>
      `| ${r.playerSlug} | [${r.videoId}](https://www.youtube.com/watch?v=${r.videoId}) | ${
        r.status === "OK" ? "OK" : `**${r.status}**`
      } | ${(r.currentTitle || "—").replace(/\|/g, "/")} |`
  ),
].join("\n");

fs.writeFileSync(path.join(outDir, "video-verification.md"), md);
console.log(`\n対応が必要: ${problems.length}件 / レポート: output/video-verification.md`);
if (problems.length > 0) process.exitCode = 0; // 情報提供のみ。CIは落とさない
