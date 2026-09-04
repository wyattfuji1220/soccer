/**
 * API-Football で、今季の出場・得点データが取れるかを確かめる。
 *
 * === 2026-09-05 に実行した結果 ===
 * 無料プランでは今季を取得できない。試合の取得でこう返る。
 *   "Free plans do not have access to this season, try from 2022 to 2024."
 *
 * 紛らわしいのは /leagues が今季について lineups=true events=true を返すこと。
 * あれはリーグ側の提供状況であって、こちらのプランが読めるかとは別物。
 * 判定はかならず /fixtures を実際に叩いて行う。
 *
 * 有料にする場合は Pro（$19/月・7,500件/日）から今季が読める。
 * football-data.org の Standard（€49/月）より安く、日程・順位表・ラインナップ・
 * イベントが1か所で揃うため、契約するならこちらに寄せて football-data は外す。
 *
 * 契約を変えたら、このスクリプトをもう一度走らせて実際に読めることを確かめること。
 *
 * 使うリクエストは6件ほど。無料枠は1日100件なので、確認のために叩いても支障はない。
 */
import { loadEnv } from "./_env.mjs";

loadEnv(process.cwd());
const KEY = process.env.API_FOOTBALL_KEY;
if (!KEY) {
  console.error("API_FOOTBALL_KEY が未設定です。.env.local に追記してください。");
  process.exit(1);
}

const BASE = "https://v3.football.api-sports.io";
let used = 0;

async function api(path) {
  used++;
  const res = await fetch(`${BASE}${path}`, { headers: { "x-apisports-key": KEY } });
  const j = await res.json();
  if (j.errors && Object.keys(j.errors).length) {
    console.error(`  エラー（${path}）:`, JSON.stringify(j.errors));
  }
  return j;
}

console.log("=== 1. 契約の状態 ===");
const st = await api("/status");
const s = st.response ?? {};
console.log(`  プラン: ${s.subscription?.plan}`);
console.log(`  1日の上限: ${s.requests?.limit_day} / 使用済み ${s.requests?.current}`);

console.log("\n=== 2. リーグ・アンの今季 ===");
const lg = await api("/leagues?id=61&current=true");
const seasons = lg.response?.[0]?.seasons ?? [];
console.log(`  シーズン: ${seasons.map((x) => `${x.year}${x.current ? "（今季）" : ""}`).join(", ") || "取得できず"}`);
const season = seasons.find((x) => x.current)?.year ?? seasons.at(-1)?.year;
console.log(`  使うシーズン: ${season}`);
if (seasons[0]) {
  const c = seasons[0].coverage?.fixtures ?? {};
  console.log(`  提供範囲: lineups=${c.lineups} events=${c.events} statistics=${c.statistics_fixtures}`);
}

console.log("\n=== 3. リールの直近の試合 ===");
const team = await api("/teams?search=Lille");
const lille = team.response?.find((t) => /lille/i.test(t.team?.name ?? ""))?.team;
console.log(`  クラブ: ${lille?.name}（id=${lille?.id}）`);

const fx = await api(`/fixtures?team=${lille?.id}&season=${season}&last=3`);
const finished = (fx.response ?? []).filter((f) => f.fixture?.status?.short === "FT");
console.log(`  終わった試合: ${finished.length}件`);
for (const f of finished.slice(0, 1)) {
  console.log(`  → ${f.fixture.date.slice(0, 10)} ${f.teams.home.name} ${f.goals.home}-${f.goals.away} ${f.teams.away.name}（id=${f.fixture.id}）`);
}

const target = finished[0];
if (!target) {
  console.log("\n終わった試合が無いため、ここまで。");
  console.log(`使用リクエスト: ${used}件`);
  process.exit(0);
}

console.log("\n=== 4. ラインナップ ===");
const lu = await api(`/fixtures/lineups?fixture=${target.fixture.id}`);
for (const side of lu.response ?? []) {
  const start = (side.startXI ?? []).map((x) => x.player.name);
  const bench = (side.substitutes ?? []).map((x) => x.player.name);
  console.log(`  ${side.team.name}: 先発${start.length}人 / ベンチ${bench.length}人`);
  if (/lille/i.test(side.team.name)) {
    console.log(`    先発: ${start.slice(0, 11).join(", ")}`);
    console.log(`    ベンチ: ${bench.join(", ")}`);
  }
}

console.log("\n=== 5. イベント（得点・アシスト・交代） ===");
const ev = await api(`/fixtures/events?fixture=${target.fixture.id}`);
for (const e of ev.response ?? []) {
  const who = e.player?.name ?? "?";
  const sub = e.assist?.name ? `（${e.type === "subst" ? "交代IN" : "アシスト"}: ${e.assist.name}）` : "";
  console.log(`  ${String(e.time?.elapsed).padStart(3)}分 ${e.type}/${e.detail} ${who}${sub} [${e.team?.name}]`);
}

console.log(`\n使用リクエスト: ${used}件`);
