/**
 * football-data.org から、海外組が所属するクラブの試合日程を取得する。
 * 無料プランは 1分あたり10リクエストの制限があるため、リーグごとに待機を入れる。
 *
 * 事前に .env.local に FOOTBALL_DATA_TOKEN=<APIキー> を設定すること。
 * 実行: npm run data:fixtures
 */
import fs from "node:fs";
import path from "node:path";
import { loadEnv, politeDelay, USER_AGENT } from "./_env.mjs";

const ROOT = process.cwd();
loadEnv(ROOT);

const TOKEN = process.env.FOOTBALL_DATA_TOKEN;
if (!TOKEN) {
  console.error("FOOTBALL_DATA_TOKEN が未設定です。.env.local に設定してください。");
  console.error("APIキーの取得: https://www.football-data.org/client/register");
  process.exit(1);
}

const LEAGUE_CODES = {
  "premier-league": "PL",
  "la-liga": "PD",
  bundesliga: "BL1",
  "serie-a": "SA",
  "ligue-1": "FL1",
  eredivisie: "DED",
  "primeira-liga": "PPL",
};

function readPlayerClubs() {
  const src = fs.readFileSync(path.join(ROOT, "src/data/players.ts"), "utf8");
  const clubs = new Map();
  const re = /clubEn:\s*"([^"]+)",\s*league:\s*"([^"]+)",/g;
  let m;
  while ((m = re.exec(src))) {
    if (!clubs.has(m[2])) clubs.set(m[2], new Set());
    clubs.get(m[2]).add(m[1]);
  }
  return clubs;
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const matchesClub = (teamName, wanted) => {
  const t = norm(teamName);
  return [...wanted].some((w) => {
    const n = norm(w);
    return t.includes(n) || n.includes(t);
  });
};

const clubsByLeague = readPlayerClubs();
const dateFrom = new Date().toISOString().slice(0, 10);
const dateTo = new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10);

const matches = [];
for (const [leagueId, clubs] of clubsByLeague) {
  const code = LEAGUE_CODES[leagueId];
  if (!code) {
    console.log(`  スキップ: ${leagueId}（無料APIの対象外）`);
    continue;
  }
  const url = `https://api.football-data.org/v4/competitions/${code}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  const res = await fetch(url, { headers: { "X-Auth-Token": TOKEN, "User-Agent": USER_AGENT } });
  if (!res.ok) {
    console.error(`  失敗: ${leagueId} (HTTP ${res.status})`);
    await politeDelay();
    continue;
  }
  const data = await res.json();
  const hits = (data.matches ?? []).filter(
    (m) => matchesClub(m.homeTeam.name, clubs) || matchesClub(m.awayTeam.name, clubs)
  );
  for (const m of hits) {
    matches.push({
      id: m.id,
      league: leagueId,
      utcDate: m.utcDate,
      homeTeam: m.homeTeam.shortName ?? m.homeTeam.name,
      awayTeam: m.awayTeam.shortName ?? m.awayTeam.name,
      status: m.status,
      score: { home: m.score?.fullTime?.home ?? null, away: m.score?.fullTime?.away ?? null },
    });
  }
  console.log(`  ${leagueId}: ${hits.length}件`);
  await politeDelay();
}

matches.sort((a, b) => a.utcDate.localeCompare(b.utcDate));

fs.writeFileSync(
  path.join(ROOT, "src/data/fixtures.json"),
  JSON.stringify({ updatedAt: new Date().toISOString().slice(0, 10), matches }, null, 2)
);
console.log(`\n合計 ${matches.length}件を src/data/fixtures.json に保存しました`);
