import type { Broadcaster, LeagueId, Player } from "@/lib/types";
import { broadcasters } from "@/data/broadcasters";
import { leagueMap } from "@/data/leagues";
import { players } from "@/data/players";

/**
 * 逆引きの診断。「いま契約しているサービス」から、観られる選手と観られない選手を出す。
 *
 * 視聴プラン診断（solvePlan）は「追いたい選手 → 必要な契約」を解く。
 * こちらはその逆で、すでに契約している人が「自分は誰を観られているのか」
 * 「あと1社足すと何人増えるのか」を確かめるためのもの。
 *
 * 数えるのはリーグ戦だけ。カップ戦・欧州カップは配信契約が別になることが多く、
 * 足すと実態から離れるため含めない。
 */

export type Coverage = {
  services: Broadcaster[];
  monthlyYen: number;
  /** 観られる選手 */
  watchable: Player[];
  /** 観られない選手（他のサービスなら観られる） */
  missed: Player[];
  /** どのサービスでも全試合の配信を確認できていない選手 */
  unavailable: Player[];
  /** 一部の試合だけ観られる選手 */
  partial: Player[];
  /** 観られる試合数（クラブ単位。同じクラブに複数いても1つ） */
  matchesPerYear: number;
  yenPerMatch: number | null;
};

const coveredLeagues = (services: Broadcaster[]): Set<LeagueId> =>
  new Set(services.flatMap((s) => s.leagues));

const partialLeagues = (services: Broadcaster[]): Set<LeagueId> =>
  new Set(services.flatMap((s) => s.partialLeagues ?? []));

/** どのサービスでも全試合の配信を確認できていないリーグ */
const NEVER_COVERED: Set<LeagueId> = new Set(
  [...new Set(players.map((p) => p.league))].filter((l) => !broadcasters.some((b) => b.leagues.includes(l)))
);

export function coverageOf(services: Broadcaster[], list: Player[] = players): Coverage {
  const full = coveredLeagues(services);
  const part = partialLeagues(services);

  const watchable = list.filter((p) => full.has(p.league));
  const rest = list.filter((p) => !full.has(p.league));
  const unavailable = rest.filter((p) => NEVER_COVERED.has(p.league));
  const partial = rest.filter((p) => !NEVER_COVERED.has(p.league) && part.has(p.league));
  const missed = rest.filter((p) => !NEVER_COVERED.has(p.league) && !part.has(p.league));

  // 同じクラブに複数の日本人がいても試合は1つなので、クラブ単位で数える
  const clubs = new Map<string, LeagueId>();
  for (const p of watchable) clubs.set(p.clubEn, p.league);
  const matchesPerYear = [...clubs.values()].reduce((sum, l) => sum + leagueMap[l].matchesPerSeason, 0);

  const monthlyYen = services.reduce((sum, s) => sum + s.monthlyPriceYen, 0);
  const annualYen = monthlyYen * 12;

  return {
    services,
    monthlyYen,
    watchable,
    missed,
    unavailable,
    partial,
    matchesPerYear,
    yenPerMatch: matchesPerYear > 0 ? Math.round(annualYen / matchesPerYear) : null,
  };
}

export type Upgrade = {
  service: Broadcaster;
  /** 追加で観られるようになる選手 */
  gained: Player[];
  /** 増える月額 */
  addedMonthlyYen: number;
  /** 1人増やすのにいくらかかるか（月額ベース）。0人なら null */
  yenPerPlayer: number | null;
  /** 追加後の1試合あたりの単価 */
  yenPerMatchAfter: number | null;
};

/**
 * あと1社足したときに、何人増えて、いくら増えるか。
 * 「限界コスト」を見せることで、足すべきか止めるべきかを決められるようにする。
 */
export function upgrades(current: Broadcaster[], list: Player[] = players): Upgrade[] {
  const before = coverageOf(current, list);
  const have = new Set(current.map((s) => s.id));

  return broadcasters
    .filter((b) => !have.has(b.id))
    .map((service) => {
      const after = coverageOf([...current, service], list);
      const gainedIds = new Set(before.watchable.map((p) => p.slug));
      const gained = after.watchable.filter((p) => !gainedIds.has(p.slug));
      return {
        service,
        gained,
        addedMonthlyYen: service.monthlyPriceYen,
        yenPerPlayer: gained.length > 0 ? Math.round(service.monthlyPriceYen / gained.length) : null,
        yenPerMatchAfter: after.yenPerMatch,
      };
    })
    .sort((a, b) => b.gained.length - a.gained.length || a.addedMonthlyYen - b.addedMonthlyYen);
}
