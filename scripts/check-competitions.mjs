/**
 * APIキーで実際に取得できる大会を一覧にする。
 *
 * football-data.org の公開表とプランの対応は変わることがあるため、
 * 「取れるつもりだったのに取れない」を避けるために、キー自身に問い合わせて確かめる。
 *
 * 実行: npm run data:competitions
 */
import { loadEnv, USER_AGENT } from "./_env.mjs";

loadEnv(process.cwd());

const TOKEN = process.env.FOOTBALL_DATA_TOKEN;
if (!TOKEN) {
  console.error("FOOTBALL_DATA_TOKEN が未設定です。.env.local に設定してください。");
  console.error("APIキーの取得: https://www.football-data.org/client/register");
  process.exit(1);
}

const res = await fetch("https://api.football-data.org/v4/competitions", {
  headers: { "X-Auth-Token": TOKEN, "User-Agent": USER_AGENT },
});
if (!res.ok) {
  console.error(`取得に失敗しました (HTTP ${res.status})`);
  process.exit(1);
}

const { competitions = [] } = await res.json();
const cups = competitions.filter((c) => c.type !== "LEAGUE");
const leagues = competitions.filter((c) => c.type === "LEAGUE");

const line = (c) => `  ${String(c.code).padEnd(6)} ${c.name}（${c.area?.name ?? "?"}）`;

console.log(`このキーで取得できる大会: ${competitions.length}件\n`);
console.log(`リーグ ${leagues.length}件`);
console.log(leagues.map(line).join("\n"));
console.log(`\nカップ戦 ${cups.length}件`);
console.log(cups.length > 0 ? cups.map(line).join("\n") : "  なし");
console.log(
  "\nscripts/fetch-fixtures.mjs の LEAGUE_CODES / CUP_CODES に、ここにあるコードだけを書くこと。"
);
