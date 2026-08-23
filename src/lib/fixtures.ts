import type { Fixture, LeagueId, Player } from "@/lib/types";
import { players } from "@/data/players";
import raw from "@/data/fixtures.json";
import { fromJst, nightKey } from "./jst";

type FixtureFile = {
  updatedAt: string | null;
  matches: Fixture[];
};

const file = raw as unknown as FixtureFile;

/** 実データが未取得かどうか。UIでサンプル表示であることを明示するために使う */
export const usingSampleData = file.matches.length === 0;
export const fixturesUpdatedAt = file.updatedAt;

/**
 * サンプル日程。football-data.org のAPIキー設定前でも体験を確認できるようにする。
 * クラブ名は掲載中の選手の所属クラブから取っているため、選手との紐付けもそのまま動く。
 */
const opponents: Partial<Record<LeagueId, { ja: string; en: string }[]>> = {
  "premier-league": [
    { ja: "マンチェスター・シティ", en: "Manchester City" },
    { ja: "トッテナム・ホットスパー", en: "Tottenham Hotspur" },
    { ja: "ニューカッスル・ユナイテッド", en: "Newcastle United" },
    { ja: "アストン・ヴィラ", en: "Aston Villa" },
  ],
  "la-liga": [
    { ja: "セビージャFC", en: "Sevilla FC" },
    { ja: "ビジャレアルCF", en: "Villarreal CF" },
  ],
  bundesliga: [
    { ja: "VfLヴォルフスブルク", en: "VfL Wolfsburg" },
    { ja: "VfBシュツットガルト", en: "VfB Stuttgart" },
  ],
  "serie-a": [
    { ja: "ボローニャFC", en: "Bologna FC" },
    { ja: "ウディネーゼ", en: "Udinese Calcio" },
  ],
  "ligue-1": [
    { ja: "リールOSC", en: "Lille OSC" },
    { ja: "OGCニース", en: "OGC Nice" },
  ],
  eredivisie: [
    { ja: "FCトゥエンテ", en: "FC Twente" },
    { ja: "AZアルクマール", en: "AZ Alkmaar" },
  ],
  "primeira-liga": [
    { ja: "SCブラガ", en: "SC Braga" },
    { ja: "ヴィトーリア・ギマランイス", en: "Vitória Guimarães" },
  ],
  "jupiler-pro-league": [
    { ja: "クラブ・ブルッヘ", en: "Club Brugge" },
  ],
  "scottish-premiership": [
    { ja: "ハート・オブ・ミドロシアン", en: "Heart of Midlothian" },
    { ja: "アバディーンFC", en: "Aberdeen FC" },
  ],
  championship: [
    { ja: "リーズ・ユナイテッド", en: "Leeds United" },
    { ja: "ノリッジ・シティ", en: "Norwich City" },
  ],
  "bundesliga-2": [
    { ja: "ハンブルガーSV", en: "Hamburger SV" },
    { ja: "ヘルタ・ベルリン", en: "Hertha BSC" },
  ],
  "segunda-division": [{ ja: "レアル・サラゴサ", en: "Real Zaragoza" }],
  "challenger-pro-league": [{ ja: "ロンメルSK", en: "Lommel SK" }],
  "danish-superliga": [{ ja: "ブレンビーIF", en: "Brøndby IF" }],
};

/** 掲載中の選手が所属するクラブ（リーグごと） */
function clubsByLeague(): Map<LeagueId, { ja: string; en: string }[]> {
  const map = new Map<LeagueId, { ja: string; en: string }[]>();
  for (const p of players) {
    const list = map.get(p.league) ?? [];
    if (!list.some((c) => c.en === p.clubEn)) list.push({ ja: p.club, en: p.clubEn });
    map.set(p.league, list);
  }
  return map;
}

/** 欧州の一般的なキックオフを日本時間に直したときの時刻。24を超える値は翌日にあたる */
const slots: { nightOffset: number; hour: number; minute: number }[] = [
  { nightOffset: 0, hour: 20, minute: 30 },
  { nightOffset: 0, hour: 23, minute: 0 },
  { nightOffset: 0, hour: 25, minute: 30 },
  { nightOffset: 0, hour: 28, minute: 0 },
  { nightOffset: 1, hour: 22, minute: 0 },
  { nightOffset: 1, hour: 25, minute: 0 },
  { nightOffset: 1, hour: 27, minute: 45 },
  { nightOffset: 2, hour: 23, minute: 30 },
  { nightOffset: 2, hour: 27, minute: 0 },
  { nightOffset: 3, hour: 21, minute: 0 },
  { nightOffset: 3, hour: 26, minute: 0 },
  { nightOffset: 4, hour: 24, minute: 0 },
  { nightOffset: 5, hour: 22, minute: 30 },
  { nightOffset: 5, hour: 27, minute: 0 },
  { nightOffset: 6, hour: 23, minute: 0 },
];

export function sampleFixtures(now: Date): Fixture[] {
  const byLeague = clubsByLeague();
  const entries = [...byLeague.entries()].flatMap(([league, clubs]) =>
    clubs.map((club) => ({ league, club }))
  );
  if (entries.length === 0) return [];

  const [by, bm, bd] = nightKey(now).split("-").map(Number);

  return slots.flatMap<Fixture>((slot, i) => {
    const { league, club } = entries[i % entries.length];
    const pool = opponents[league];
    if (!pool || pool.length === 0) return [];
    const opponent = pool[i % pool.length];
    const homeIsOurs = i % 2 === 0;
    const kickoff = fromJst(by, bm, bd + slot.nightOffset, slot.hour, slot.minute);

    return [
      {
        id: `sample-${i}`,
        league,
        utcDate: kickoff.toISOString(),
        homeTeam: homeIsOurs ? club.ja : opponent.ja,
        homeTeamEn: homeIsOurs ? club.en : opponent.en,
        awayTeam: homeIsOurs ? opponent.ja : club.ja,
        awayTeamEn: homeIsOurs ? opponent.en : club.en,
        status: "SCHEDULED",
      },
    ];
  });
}

/** 表示に使う日程。実データがなければサンプルを返す */
export function getFixtures(now: Date): Fixture[] {
  const list = usingSampleData ? sampleFixtures(now) : file.matches;
  return [...list].sort((a, b) => a.utcDate.localeCompare(b.utcDate));
}

/** その試合に出場しうる掲載選手 */
export function playersInFixture(fixture: Fixture): Player[] {
  return players.filter(
    (p) => p.clubEn === fixture.homeTeamEn || p.clubEn === fixture.awayTeamEn
  );
}

/** 観戦ナイトごとにまとめる */
export function groupByNight(fixtures: Fixture[]): { key: string; fixtures: Fixture[] }[] {
  const groups = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const key = nightKey(new Date(f.utcDate));
    groups.set(key, [...(groups.get(key) ?? []), f]);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, list]) => ({ key, fixtures: list }));
}
