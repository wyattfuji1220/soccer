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

// 遡る日数は数字の引数から取る。--report のような指定と取り違えないようにする
const DAYS = Number(process.argv.slice(2).find((a) => /^\d+$/.test(a)) ?? 45);
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
 * 題名に出てくるクラブを見分ける。
 *
 * 掲載名と題名の書き方は揃わない。掲載が「LOSCリール」でも題名は「リール」、
 * 掲載が「アストン・ヴィラFC」でも題名は「アストン・ヴィラ」、
 * 掲載が「フェイエノールト・ロッテルダム」でも題名は「フェイエノールト」と書かれる。
 * ラテン文字の接頭辞と接尾辞、中黒、数字の付き方がまちまちなので、
 * 両方からカタカナ以外を捨ててから比べる。
 *
 * 掲載名のほうが長いことも多いため、中黒で切ったまとまりも鍵にする。
 * ただし「ユナイテッド」「シティ」のように複数のクラブが共有する語は、
 * どのクラブか決められないので鍵にしない。
 */
const katakana = (s) => s.replace(/[^ァ-ヺー]/g, "");

/** 中黒・イコールで切ったまとまり。「レアル・ソシエダ」→ レアル / ソシエダ */
const parts = (name) => name.split(/[・＝]/).map(katakana);

function clubKeys() {
  const src = fs.readFileSync(path.join(ROOT, "src/data/clubs.ts"), "utf8");
  const clubs = [];
  for (const blk of src.split("\n  {\n").slice(1)) {
    const name = blk.match(/name: "([^"]+)"/)?.[1];
    const countries = [...(blk.match(/countries: \[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([A-Z]{3})"/g)].map((m) => m[1]);
    if (!name || countries.includes("JPN")) continue;
    /*
     * 予備チーム（レアル・ソシエダB）は鍵にしない。
     * カタカナだけにすると末尾のBが落ちてトップチームと同じ鍵になり、
     * トップチームの試合が予備チームのものとして記録されてしまう。
     * 権利者が予備リーグのハイライトを出すこともない。
     */
    if (/(B|II)$/.test(name)) continue;
    clubs.push(name);
  }

  const keys = new Map();
  const add = (key, name) => {
    if (key.length < 3) return;
    // 同じ鍵に複数のクラブが当たるなら、どれか決められないので鍵ごと捨てる
    if (keys.has(key) && keys.get(key) !== name) keys.set(key, null);
    else if (!keys.has(key)) keys.set(key, name);
  };
  for (const name of clubs) add(katakana(name), name);
  for (const name of clubs) for (const t of parts(name)) if (t.length >= 4) add(t, name);
  return new Map([...keys].filter(([, name]) => name !== null));
}

/**
 * 短い名前が長い名前の一部になっていることがある（「リール」と「リールセ」）。
 * 題名に複数当たったときは、より長い名前に含まれてしまうほうを捨てる。
 */
function clubsInTitle(title, keys) {
  const t = katakana(title);
  const hits = [...keys].filter(([k]) => t.includes(k));
  const kept = hits.filter(([k]) => !hits.some(([other]) => other !== k && other.includes(k)));
  return [...new Set(kept.map(([, name]) => name))];
}

/** 掲載している選手の名前 */
function playerNames() {
  const src = fs.readFileSync(path.join(ROOT, "src/data/players.ts"), "utf8");
  return [...src.matchAll(/^\s{4}nameJa: "([^"]+)"/gm)].map((m) => m[1]);
}

const since = new Date(Date.now() - DAYS * 86400000).toISOString().slice(0, 10);
const keys = clubKeys();
const names = playerNames();
console.log(`${since} 以降のハイライトを集めます（掲載クラブ ${new Set(keys.values()).size}件）`);

const found = new Map();
/** ハイライトではあるが掲載クラブに結び付かなかったもの。--report で中身を見る */
const unmatched = [];
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
    /*
     * クラブは題名からだけ決める。選手名から今の所属クラブを補うことはしない。
     * 移籍したばかりの選手だと、前のクラブでの試合に今のクラブを貼ってしまう
     * （上田綺世のフェイエノールト戦がリールの試合として記録された）。
     */
    const clubs = clubsInTitle(v.title, keys);
    if (clubs.length === 0) {
      unmatched.push(v.title);
      continue;
    }
    found.set(v.videoId, { ...v, channel: info.title, clubs, players: names.filter((n) => v.title.includes(n)) });
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

/*
 * 取りこぼしを見つけるための報告。掲載クラブの試合なのに拾えていないものが
 * 混じっていないかを、ここで確かめる。日本人選手のいない試合が並ぶのは正常。
 * 実行: node scripts/fetch-highlights.mjs --report
 */
if (process.argv.includes("--report")) {
  console.log(`
クラブに結び付かなかったハイライト ${unmatched.length}件:`);
  for (const t of unmatched) console.log(`  ${t}`);
}
const withPlayer = rows.filter((r) => r.players.length > 0).length;
console.log(`  題名に掲載選手の名前が入っているもの: ${withPlayer}件`);
