import type { Broadcaster, LeagueId, Player } from "@/lib/types";
import { broadcasters } from "@/data/broadcasters";
import { leagueMap } from "@/data/leagues";

export type Plan = {
  services: Broadcaster[];
  monthlyYen: number;
  annualYen: number;
  covered: LeagueId[];
  /** この組み合わせでは観られないが、他のサービスなら観られるリーグ */
  droppedByPlan: LeagueId[];
  /** 当サイトの掲載サービスでは配信元が見つからないリーグ */
  unavailable: LeagueId[];
  /** 全試合の配信はないが、一部の試合なら観られるリーグ */
  partialOnly: { league: LeagueId; services: string[] }[];
  /** 対象クラブのリーグ戦の年間試合数の合計 */
  matchesPerYear: number;
  /** 年額 ÷ 視聴できる試合数 */
  yenPerMatch: number | null;
};

function subsets<T>(items: T[]): T[][] {
  return items.reduce<T[][]>((acc, item) => [...acc, ...acc.map((s) => [...s, item])], [[]]);
}

function buildPlan(services: Broadcaster[], needed: LeagueId[], selected: Player[]): Plan {
  const covered = needed.filter((l) => services.some((s) => s.leagues.includes(l)));
  const uncovered = needed.filter((l) => !covered.includes(l));
  const unavailable = uncovered.filter((l) => !broadcasters.some((b) => b.leagues.includes(l)));
  const droppedByPlan = uncovered.filter((l) => !unavailable.includes(l));

  // 全試合の配信がないリーグでも、一部の試合なら観られることがある。
  // 試合数には数えないが、読者にとっては重要な情報なので別に持つ。
  const partialOnly = uncovered
    .map((league) => ({
      league,
      services: broadcasters.filter((b) => b.partialLeagues?.includes(league)).map((b) => b.name),
    }))
    .filter((x) => x.services.length > 0);

  // 視聴できる試合数は「カバーされているリーグに所属するクラブ」だけを数える。
  // 同じクラブに複数の日本人選手がいても試合は1つなので、クラブ単位で重複を除く。
  const clubs = new Map<string, LeagueId>();
  for (const p of selected) {
    if (covered.includes(p.league)) clubs.set(p.clubEn, p.league);
  }
  const matchesPerYear = [...clubs.values()].reduce(
    (sum, league) => sum + leagueMap[league].matchesPerSeason,
    0
  );

  const monthlyYen = services.reduce((sum, s) => sum + s.monthlyPriceYen, 0);
  const annualYen = monthlyYen * 12;

  return {
    services,
    monthlyYen,
    annualYen,
    covered,
    droppedByPlan,
    unavailable,
    partialOnly,
    matchesPerYear,
    yenPerMatch: matchesPerYear > 0 ? Math.round(annualYen / matchesPerYear) : null,
  };
}

/** 無駄なサービスを含む組み合わせを除く（1つ抜いてもカバー範囲が変わらないなら不要） */
function isMinimal(services: Broadcaster[], needed: LeagueId[]): boolean {
  const coveredCount = (list: Broadcaster[]) =>
    needed.filter((l) => list.some((s) => s.leagues.includes(l))).length;
  const full = coveredCount(services);
  return services.every((s) => coveredCount(services.filter((x) => x !== s)) < full);
}

export type PlanResult = {
  /** 必要なリーグを最も広くカバーし、その中で最安の組み合わせ */
  best: Plan;
  /** 1社だけで最も広くカバーできる場合の比較用 */
  singleBest: Plan | null;
  neededLeagues: LeagueId[];
};

export function solvePlan(selected: Player[]): PlanResult | null {
  if (selected.length === 0) return null;

  const needed = [...new Set(selected.map((p) => p.league))];

  const candidates = subsets(broadcasters)
    .filter((s) => s.length > 0)
    .filter((s) => isMinimal(s, needed))
    .map((s) => buildPlan(s, needed, selected));

  /*
   * 選んだ選手のリーグをどのサービスも配信していない場合、上の絞り込みで
   * 候補が全部消える。カバー数が最初から0なので、1社抜いても0のままで、
   * どの組み合わせも「無駄がない」と見なされないため。
   *
   * 契約なしの計画を返す。表示側は「観る手段が見つからない」と出せばよく、
   * ここで空を返すと best が undefined になって画面ごと落ちる。
   */
  if (candidates.length === 0) {
    /*
     * 全試合の配信が無くても、一部の試合なら観られることがある。
     * 「観る手段がない」と言い切る前にそちらを探す。EFLチャンピオンシップが
     * これに当たり、DAZNが毎節数試合を配信している。
     */
    const partial = broadcasters
      .filter((b) => needed.some((l) => b.partialLeagues?.includes(l)))
      .sort((a, b) => {
        const count = (x: Broadcaster) => needed.filter((l) => x.partialLeagues?.includes(l)).length;
        return count(b) - count(a) || a.monthlyPriceYen - b.monthlyPriceYen;
      });
    const services = partial.length > 0 ? [partial[0]] : [];
    return { best: buildPlan(services, needed, selected), singleBest: null, neededLeagues: needed };
  }

  // カバー数が多いほど良い。同数なら安いほうを選ぶ。
  const rank = (p: Plan) => [-p.covered.length, p.monthlyYen];
  const sorted = [...candidates].sort((a, b) => {
    const [ac, am] = rank(a);
    const [bc, bm] = rank(b);
    return ac !== bc ? ac - bc : am - bm;
  });

  const best = sorted[0];
  const singles = candidates.filter((p) => p.services.length === 1);
  const singleBest = singles.length > 0
    ? [...singles].sort((a, b) => {
        const [ac, am] = rank(a);
        const [bc, bm] = rank(b);
        return ac !== bc ? ac - bc : am - bm;
      })[0]
    : null;

  return {
    best,
    singleBest: singleBest && singleBest.services.length === best.services.length ? null : singleBest,
    neededLeagues: needed,
  };
}
