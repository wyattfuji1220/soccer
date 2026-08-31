import type { Transfer } from "@/lib/types";

/**
 * このファイルは scripts/detect-transfers.mjs が生成する。直接編集しないこと。
 *
 * 前回取得したときの所属と、今回の所属を比べて、変わったところを記録している。
 * 出どころはWikipedia日本語版のインフォボックスで、報道段階の噂は含まない。
 *
 * date は「当サイトが変化を確認した日」で、クラブが発表した日ではない。
 * Wikipediaへの反映を待つぶん、発表より数日遅れることがある。
 */
export const transfers: Transfer[] = [
  {
    date: "2026-08-31",
    slug: "ayase-ueda",
    nameJa: "上田綺世",
    kind: "move",
    fromClub: "フェイエノールト",
    toClub: "フェイエノールト・ロッテルダム",
    fromLeague: "eredivisie",
    toLeague: "eredivisie",
  },
  {
    date: "2026-08-31",
    slug: "tsuyoshi-watanabe",
    nameJa: "渡辺剛",
    kind: "move",
    fromClub: "フェイエノールト",
    toClub: "フェイエノールト・ロッテルダム",
    fromLeague: "eredivisie",
    toLeague: "eredivisie",
  },
];
