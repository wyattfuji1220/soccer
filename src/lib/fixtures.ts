import type { Fixture, LeagueId, Player } from "@/lib/types";
import { players } from "@/data/players";
import raw from "@/data/fixtures.json";
import { fromJst, nightKey } from "./jst";

export type FetchReport = {
  competition: string;
  ok: boolean;
  count?: number;
  /** APIが返した全試合数。掲載クラブの試合が0件なのか、取得自体が空なのかを見分ける */
  total?: number;
  error?: string;
};

type FixtureFile = {
  updatedAt: string | null;
  report?: FetchReport[];
  matches: Fixture[];
};

const file = raw as unknown as FixtureFile;

/** 実データが未取得かどうか。UIでサンプル表示であることを明示するために使う */
export const usingSampleData = file.matches.length === 0;
export const fixturesUpdatedAt = file.updatedAt;

/** 取得できなかった大会。黙って欠けるのを避けるため、UIに出す */
export const fetchFailures = (file.report ?? []).filter((r) => !r.ok);

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

/**
 * 終わった試合。スコアが両方そろっているものだけを結果として扱う。
 * 中止や延期は status が FINISHED にならないので自然に外れる。
 */
export function finishedFixtures(now: Date): Fixture[] {
  return getFixtures(now)
    .filter((f) => f.status === "FINISHED" && f.score?.home != null && f.score?.away != null)
    .filter((f) => new Date(f.utcDate) <= now)
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate));
}

/** これからの試合。日程ページの本体はこちら */
export function upcomingFixtures(now: Date): Fixture[] {
  const finished = new Set(finishedFixtures(now).map((f) => f.id));
  return getFixtures(now).filter((f) => !finished.has(f.id));
}

/**
 * クラブ名を突き合わせるための正規化。
 * APIは "Brighton & Hove Albion FC"、当サイトは "Brighton & Hove Albion F.C." と
 * 表記が揃っていない。厳密一致で比べていたころ、プレミアリーグの試合に
 * 選手名がまったく出ていなかった。
 */
const clubKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** その試合に出場しうる掲載選手 */
export function playersInFixture(fixture: Fixture): Player[] {
  // 取得時に引き当てた名前があればそれを使う。厳密に一致する
  if (fixture.clubsEn && fixture.clubsEn.length > 0) {
    const wanted = new Set(fixture.clubsEn);
    return players.filter((p) => wanted.has(p.clubEn));
  }
  // 古いデータ向けの保険。表記を正規化して照らす
  const teams = [clubKey(fixture.homeTeamEn), clubKey(fixture.awayTeamEn)];
  return players.filter((p) => {
    const c = clubKey(p.clubEn);
    return teams.some((t) => t === c || t.includes(c) || c.includes(t));
  });
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
