import type { League } from "@/lib/types";

/**
 * matchesPerSeason は1クラブあたりのリーグ戦の年間試合数。
 * カップ戦・欧州カップは含まない（配信対象が別契約になることが多いため）。
 */
export const leagues: League[] = [
  { id: "premier-league", name: "プレミアリーグ", nameEn: "Premier League", country: "イングランド", footballDataCode: "PL", matchesPerSeason: 38 },
  { id: "la-liga", name: "ラ・リーガ", nameEn: "LaLiga", country: "スペイン", footballDataCode: "PD", matchesPerSeason: 38 },
  { id: "bundesliga", name: "ブンデスリーガ", nameEn: "Bundesliga", country: "ドイツ", footballDataCode: "BL1", matchesPerSeason: 34 },
  { id: "serie-a", name: "セリエA", nameEn: "Serie A", country: "イタリア", footballDataCode: "SA", matchesPerSeason: 38 },
  { id: "ligue-1", name: "リーグ・アン", nameEn: "Ligue 1", country: "フランス", footballDataCode: "FL1", matchesPerSeason: 34 },
  { id: "eredivisie", name: "エールディヴィジ", nameEn: "Eredivisie", country: "オランダ", footballDataCode: "DED", matchesPerSeason: 34 },
  { id: "primeira-liga", name: "プリメイラ・リーガ", nameEn: "Primeira Liga", country: "ポルトガル", footballDataCode: "PPL", matchesPerSeason: 34 },
  { id: "jupiler-pro-league", name: "ジュピラー・プロ・リーグ", nameEn: "Belgian Pro League", country: "ベルギー", matchesPerSeason: 30 },
  { id: "scottish-premiership", name: "スコティッシュ・プレミアシップ", nameEn: "Scottish Premiership", country: "スコットランド", matchesPerSeason: 38 },
];

export const leagueMap = Object.fromEntries(leagues.map((l) => [l.id, l])) as Record<League["id"], League>;
