/**
 * football-data.org から順位表を取得する。
 *
 * 無料枠で取れるのは日程と順位表だけで、これまで順位表は使っていなかった。
 * 有料の統計が要らないぶん、ここは競合と同じ土俵に立てる。
 *
 * 保存するのは日本人選手が所属するクラブの行と、そのリーグの全体像
 * （何チーム中の何位か、勝点差）だけ。順位表そのものを丸ごと載せる意図はない。
 *
 * 事前に .env.local に FOOTBALL_DATA_TOKEN=<APIキー> を設定すること。
 * 実行: npm run data:standings
 */
import fs from "node:fs";
import path from "node:path";
import { fetchWithRetry, loadEnv, politeDelay, USER_AGENT } from "./_env.mjs";

const ROOT = process.cwd();
loadEnv(ROOT);

const TOKEN = process.env.FOOTBALL_DATA_TOKEN;
if (!TOKEN) {
  console.error("FOOTBALL_DATA_TOKEN が未設定です。.env.local に設定してください。");
  process.exit(1);
}

const outPath = path.join(ROOT, "src/data/standings.json");

/** 掲載中の選手の所属クラブ（英語名）とリーグ */
function targetClubs() {
  const src = fs.readFileSync(path.join(ROOT, "src/data/players.ts"), "utf8");
  const m = new Map();
  for (const blk of src.split("\n  {\n    slug:").slice(1)) {
    const pick = (k) => blk.match(new RegExp(`${k}: "([^"]*)"`))?.[1] ?? null;
    const clubEn = pick("clubEn");
    if (!clubEn) continue;
    const entry = m.get(clubEn) ?? { league: pick("league"), club: pick("club"), players: [] };
    entry.players.push(pick("nameJa"));
    m.set(clubEn, entry);
  }
  return m;
}

/** リーグIDと football-data のコード。無料枠で順位表を取れるものだけ */
function leagueCodes() {
  const src = fs.readFileSync(path.join(ROOT, "src/data/leagues.ts"), "utf8");
  const out = [];
  for (const line of src.split("\n")) {
    const id = line.match(/id: "([^"]+)"/);
    const code = line.match(/footballDataCode: "([^"]+)"/);
    if (id && code) out.push({ id: id[1], code: code[1] });
  }
  return out;
}

/**
 * クラブ名の突き合わせ。APIは "Brighton & Hove Albion FC"、Wikipediaは
 * "Brighton & Hove Albion F.C." のように書式が揺れるため、記号を落として比べる。
 */
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const clubs = targetClubs();
const clubKeys = new Map([...clubs].map(([en, v]) => [key(en), { en, ...v }]));

const rows = [];
const report = [];
for (const { id, code } of leagueCodes()) {
  const url = `https://api.football-data.org/v4/competitions/${code}/standings`;
  const res = await fetchWithRetry(url, { headers: { "X-Auth-Token": TOKEN, "User-Agent": USER_AGENT } }).catch((e) => e);
  if (!(res instanceof Response) || !res.ok) {
    const status = res instanceof Response ? res.status : "接続失敗";
    console.error(`  失敗: ${id}（${status}）`);
    report.push({ league: id, ok: false, error: String(status) });
    await politeDelay();
    continue;
  }
  const data = await res.json();
  // TOTAL の表だけを使う（HOME/AWAY 別の表も返ってくる）
  const table = (data.standings ?? []).find((s) => s.type === "TOTAL")?.table ?? [];
  const total = table.length;
  const leader = table[0]?.points ?? null;

  let hit = 0;
  for (const r of table) {
    const found = clubKeys.get(key(r.team.name)) ?? clubKeys.get(key(r.team.shortName ?? ""));
    if (!found || found.league !== id) continue;
    hit++;
    rows.push({
      league: id,
      club: found.club,
      clubEn: found.en,
      players: found.players,
      position: r.position,
      total,
      played: r.playedGames,
      points: r.points,
      won: r.won,
      draw: r.draw,
      lost: r.lost,
      goalDifference: r.goalDifference,
      /** 首位との勝点差。優勝争いか残留争いかを読むのに使う */
      behindLeader: leader === null ? null : leader - r.points,
    });
  }
  report.push({ league: id, ok: true, teams: total, matched: hit, matchday: data.season?.currentMatchday ?? null });
  console.log(`  ${id}: ${total}チーム中 ${hit}クラブが該当`);
  await politeDelay();
}

rows.sort((a, b) => a.position - b.position || a.club.localeCompare(b.club, "ja"));

fs.writeFileSync(
  outPath,
  JSON.stringify({ updatedAt: new Date().toISOString().slice(0, 10), report, rows }, null, 1) + "\n"
);
console.log(`\n${rows.length}クラブぶんを src/data/standings.json に保存しました`);
const missing = [...clubs.keys()].filter((en) => !rows.some((r) => r.clubEn === en));
if (missing.length) console.warn(`  順位表に見つからなかったクラブ: ${missing.length}件（無料枠の対象外リーグを含む）`);
