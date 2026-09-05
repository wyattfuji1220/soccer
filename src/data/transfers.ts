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
    date: "2026-09-05",
    slug: "takatora-einaga",
    nameJa: "永長鷹虎",
    kind: "arrived",
    fromClub: null,
    toClub: "KベールスホットVA",
    fromLeague: null,
    toLeague: "challenger-pro-league",
  },
  {
    date: "2026-09-05",
    slug: "shinnosuke-fukuda",
    nameJa: "福田心之助",
    kind: "arrived",
    fromClub: null,
    toClub: "レギア・ワルシャワ",
    fromLeague: null,
    toLeague: "ekstraklasa",
  },
  {
    date: "2026-09-05",
    slug: "gaku-nawata",
    nameJa: "名和田我空",
    kind: "arrived",
    fromClub: null,
    toClub: "シャルルロワSC",
    fromLeague: null,
    toLeague: "jupiler-pro-league",
  },
  {
    date: "2026-09-03",
    slug: "keito-nakamura",
    nameJa: "中村敬斗",
    kind: "move",
    fromClub: "スタッド・ランス",
    toClub: "オリンピック・リヨン",
    fromLeague: "ligue-2",
    toLeague: "ligue-1",
  },
  {
    date: "2026-09-02",
    slug: "reo-hatate",
    nameJa: "旗手怜央",
    kind: "move",
    fromClub: "セルティックFC",
    toClub: "バーンリーFC",
    fromLeague: "scottish-premiership",
    toLeague: "championship",
  },
  {
    date: "2026-09-02",
    slug: "kota-takai",
    nameJa: "高井幸大",
    kind: "move",
    fromClub: "トッテナム・ホットスパーFC",
    toClub: "シント＝トロイデンVV",
    fromLeague: "premier-league",
    toLeague: "jupiler-pro-league",
  },
  {
    date: "2026-09-02",
    slug: "yukinari-sugawara",
    nameJa: "菅原由勢",
    kind: "move",
    fromClub: "サウサンプトンFC",
    toClub: "カリアリ・カルチョ",
    fromLeague: "championship",
    toLeague: "serie-a",
  },
  {
    date: "2026-09-01",
    slug: "ayase-ueda",
    nameJa: "上田綺世",
    kind: "move",
    fromClub: "フェイエノールト・ロッテルダム",
    toClub: "LOSCリール",
    fromLeague: "eredivisie",
    toLeague: "ligue-1",
  },
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
