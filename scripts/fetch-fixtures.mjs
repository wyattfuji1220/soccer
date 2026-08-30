/**
 * football-data.org から、海外組が所属するクラブの試合日程を取得する。
 * 無料プランは 1分あたり10リクエストの制限があるため、リーグごとに待機を入れる。
 *
 * 事前に .env.local に FOOTBALL_DATA_TOKEN=<APIキー> を設定すること。
 * 実行: npm run data:fixtures
 */
import fs from "node:fs";
import path from "node:path";
import { fetchWithRetry, loadEnv, politeDelay, USER_AGENT } from "./_env.mjs";

const ROOT = process.cwd();
loadEnv(ROOT);

const TOKEN = process.env.FOOTBALL_DATA_TOKEN;
if (!TOKEN) {
  console.error("FOOTBALL_DATA_TOKEN が未設定です。.env.local に設定してください。");
  console.error("APIキーの取得: https://www.football-data.org/client/register");
  process.exit(1);
}

/**
 * 無料枠で日程を取得できるカップ戦。
 * チャンピオンズリーグのみが対象で、ヨーロッパリーグや各国のカップ戦は有料プランが要る
 * （https://www.football-data.org/coverage）。
 */
const CUP_CODES = {
  "champions-league": "CL",
};

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

/** 英語表記 -> 日本語表記。APIは英語しか返さないため、掲載クラブは日本語に直す */
function readClubNames() {
  const map = new Map();
  const add = (ja, en) => {
    if (ja && en) map.set(norm(en), ja);
  };
  const players = fs.readFileSync(path.join(ROOT, "src/data/players.ts"), "utf8");
  for (const m of players.matchAll(/club:\s*"([^"]+)",\s*clubEn:\s*"([^"]+)",/g)) {
    add(m[1], m[2]);
  }
  const clubs = fs.readFileSync(path.join(ROOT, "src/data/clubs.ts"), "utf8");
  for (const m of clubs.matchAll(/name:\s*"([^"]+)",\s*nameEn:\s*"([^"]+)",/g)) {
    add(m[1], m[2]);
  }
  return map;
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
const clubNames = readClubNames();

/** 掲載クラブなら日本語名、そうでなければAPIの表記をそのまま使う */
function displayName(team) {
  const api = team.shortName ?? team.name;
  const key = norm(team.name);
  if (clubNames.has(key)) return clubNames.get(key);
  for (const [en, ja] of clubNames) {
    if (key.includes(en) || en.includes(key)) return ja;
  }
  return api;
}

/** 何を取得できて、何ができなかったかを残す。無言で欠けるのを防ぐ */
const report = [];

const hasJapanese = (s) => /[぀-ヿ㐀-鿿]/.test(s);

/**
 * 掲載外の対戦相手クラブの日本語名を Wikipedia から引く。
 *
 * APIの略称（Atleti、Barça）では記事にたどり着けないため、正式名称で引く。
 * 日本語記事が {{サッカークラブ}} を持つことを確かめてから採用する。
 * 過去に「クリスタル・パレス」がロンドンの建物の記事に化けた例があるため、
 * 確証が持てないものは英語表記のまま残す。
 */
async function resolveJapaneseNames(englishNames) {
  const resolved = new Map();
  if (englishNames.length === 0) return resolved;

  const follow = (title, table) => {
    let t = title;
    for (let i = 0; i < 3; i++) t = table.get(t) ?? t;
    return t;
  };

  // 1. 英語版から日本語版へのリンクを引く
  const candidates = new Map();
  for (let i = 0; i < englishNames.length; i += 50) {
    const chunk = englishNames.slice(i, i + 50);
    const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({
      format: "json",
      formatversion: "2",
      action: "query",
      titles: chunk.join("|"),
      prop: "langlinks",
      lllang: "ja",
      lllimit: "500",
      redirects: "1",
    })}`;
    const data = await (await fetchWithRetry(url, { headers: { "User-Agent": USER_AGENT } })).json();
    const table = new Map();
    for (const n of data.query?.normalized ?? []) table.set(n.from, n.to);
    for (const r of data.query?.redirects ?? []) table.set(r.from, r.to);
    const pages = new Map((data.query?.pages ?? []).map((x) => [x.title, x]));
    for (const name of chunk) {
      const ja = pages.get(follow(name, table))?.langlinks?.[0]?.title;
      if (ja) candidates.set(name, ja);
    }
    if (i + 50 < englishNames.length) await politeDelay();
  }
  if (candidates.size === 0) return resolved;

  // 2. その日本語記事が本当にサッカークラブの記事か確かめる
  const jaTitles = [...new Set(candidates.values())];
  const verified = new Set();
  for (let i = 0; i < jaTitles.length; i += 50) {
    const chunk = jaTitles.slice(i, i + 50);
    const url = `https://ja.wikipedia.org/w/api.php?${new URLSearchParams({
      format: "json",
      formatversion: "2",
      action: "query",
      titles: chunk.join("|"),
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
      redirects: "1",
    })}`;
    await politeDelay();
    const data = await (await fetchWithRetry(url, { headers: { "User-Agent": USER_AGENT } })).json();
    const table = new Map();
    for (const n of data.query?.normalized ?? []) table.set(n.from, n.to);
    for (const r of data.query?.redirects ?? []) table.set(r.from, r.to);
    const pages = new Map((data.query?.pages ?? []).map((x) => [x.title, x]));
    for (const title of chunk) {
      const page = pages.get(follow(title, table));
      const text = page?.revisions?.[0]?.slots?.main?.content ?? "";
      if (text.includes("{{サッカークラブ")) verified.add(title);
    }
  }

  for (const [en, ja] of candidates) {
    if (verified.has(ja)) resolved.set(en, ja);
  }
  return resolved;
}

/*
 * 過去7日ぶんも取る。終わった試合はスコアつきで返ってくるので、
 * 「先週どうだったか」を結果として出せる。無料枠でも同じエンドポイントで済む。
 */
const dateFrom = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
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
    report.push({ competition: leagueId, ok: false, error: `HTTP ${res.status}` });
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
      homeTeam: displayName(m.homeTeam),
      homeTeamEn: m.homeTeam.name,
      awayTeam: displayName(m.awayTeam),
      awayTeamEn: m.awayTeam.name,
      status: m.status,
      score: { home: m.score?.fullTime?.home ?? null, away: m.score?.fullTime?.away ?? null },
    });
  }
  report.push({ competition: leagueId, ok: true, count: hits.length });
  console.log(`  ${leagueId}: ${hits.length}件`);
  await politeDelay();
}

// カップ戦は複数リーグのクラブが同じ大会に出るため、リーグ単位ではなく大会単位で引く。
const allClubs = new Set([...clubsByLeague.values()].flatMap((set) => [...set]));
const leagueOfClub = new Map();
for (const [leagueId, clubs] of clubsByLeague) {
  for (const c of clubs) leagueOfClub.set(c, leagueId);
}

for (const [cupId, code] of Object.entries(CUP_CODES)) {
  const url = `https://api.football-data.org/v4/competitions/${code}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  const res = await fetch(url, { headers: { "X-Auth-Token": TOKEN, "User-Agent": USER_AGENT } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`  失敗: ${cupId} (HTTP ${res.status}) ${body.slice(0, 200)}`);
    report.push({ competition: cupId, ok: false, error: `HTTP ${res.status}` });
    await politeDelay();
    continue;
  }
  const data = await res.json();
  const hits = (data.matches ?? []).filter(
    (m) => matchesClub(m.homeTeam.name, allClubs) || matchesClub(m.awayTeam.name, allClubs)
  );
  for (const m of hits) {
    // 掲載選手のクラブがどちらかにいるはずなので、そのクラブのリーグを試合のリーグとして持つ
    const ours =
      [...allClubs].find((c) => matchesClub(m.homeTeam.name, [c])) ??
      [...allClubs].find((c) => matchesClub(m.awayTeam.name, [c]));
    matches.push({
      id: m.id,
      league: leagueOfClub.get(ours) ?? "premier-league",
      cup: cupId,
      utcDate: m.utcDate,
      homeTeam: displayName(m.homeTeam),
      homeTeamEn: m.homeTeam.name,
      awayTeam: displayName(m.awayTeam),
      awayTeamEn: m.awayTeam.name,
      status: m.status,
      score: { home: m.score?.fullTime?.home ?? null, away: m.score?.fullTime?.away ?? null },
    });
  }
  report.push({
    competition: cupId,
    ok: true,
    count: hits.length,
    total: (data.matches ?? []).length,
  });
  console.log(`  ${cupId}: 全${(data.matches ?? []).length}試合中 ${hits.length}件が掲載クラブ`);
  await politeDelay();
}

// 掲載外のクラブは英語のまま残っている。Wikipediaで日本語名が確かめられた分だけ差し替える。
const unresolved = [
  ...new Set(
    matches.flatMap((m) => [
      hasJapanese(m.homeTeam) ? [] : [m.homeTeamEn],
      hasJapanese(m.awayTeam) ? [] : [m.awayTeamEn],
    ].flat())
  ),
].filter(Boolean);

if (unresolved.length > 0) {
  console.log(`\n対戦相手 ${unresolved.length}クラブの日本語名を Wikipedia で確認します`);
  await politeDelay();
  const jaNames = await resolveJapaneseNames(unresolved);
  for (const m of matches) {
    if (!hasJapanese(m.homeTeam) && jaNames.has(m.homeTeamEn)) m.homeTeam = jaNames.get(m.homeTeamEn);
    if (!hasJapanese(m.awayTeam) && jaNames.has(m.awayTeamEn)) m.awayTeam = jaNames.get(m.awayTeamEn);
  }
  console.log(`  ${jaNames.size}クラブを日本語名にしました（残り${unresolved.length - jaNames.size}クラブは英語のまま）`);
  report.push({
    competition: "club-names",
    ok: true,
    count: jaNames.size,
    total: unresolved.length,
  });
}

matches.sort((a, b) => a.utcDate.localeCompare(b.utcDate));

fs.writeFileSync(
  path.join(ROOT, "src/data/fixtures.json"),
  JSON.stringify(
    { updatedAt: new Date().toISOString().slice(0, 10), report, matches },
    null,
    2
  )
);
console.log(`\n合計 ${matches.length}件を src/data/fixtures.json に保存しました`);
const failed = report.filter((r) => !r.ok);
if (failed.length > 0) {
  console.warn(`取得できなかった大会: ${failed.map((r) => `${r.competition}(${r.error})`).join(", ")}`);
}
