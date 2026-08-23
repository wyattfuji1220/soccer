import type { League } from "@/lib/types";

export const leagues: League[] = [
  { id: "premier-league", name: "プレミアリーグ", nameEn: "Premier League", country: "イングランド", footballDataCode: "PL" },
  { id: "la-liga", name: "ラ・リーガ", nameEn: "LaLiga", country: "スペイン", footballDataCode: "PD" },
  { id: "bundesliga", name: "ブンデスリーガ", nameEn: "Bundesliga", country: "ドイツ", footballDataCode: "BL1" },
  { id: "serie-a", name: "セリエA", nameEn: "Serie A", country: "イタリア", footballDataCode: "SA" },
  { id: "ligue-1", name: "リーグ・アン", nameEn: "Ligue 1", country: "フランス", footballDataCode: "FL1" },
  { id: "eredivisie", name: "エールディヴィジ", nameEn: "Eredivisie", country: "オランダ", footballDataCode: "DED" },
  { id: "primeira-liga", name: "プリメイラ・リーガ", nameEn: "Primeira Liga", country: "ポルトガル", footballDataCode: "PPL" },
  { id: "jupiler-pro-league", name: "ジュピラー・プロ・リーグ", nameEn: "Belgian Pro League", country: "ベルギー" },
  { id: "scottish-premiership", name: "スコティッシュ・プレミアシップ", nameEn: "Scottish Premiership", country: "スコットランド" },
];

export const leagueMap = Object.fromEntries(leagues.map((l) => [l.id, l])) as Record<League["id"], League>;
