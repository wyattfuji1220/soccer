import type { Cup, CupId, LeagueId } from "@/lib/types";

/**
 * 海外組が出場しうるカップ戦。
 *
 * リーグ戦と違い、カップ戦は配信契約が別枠になることが多い。
 * 「リーグは観られるがカップ戦は観られない」という取りこぼしが起きやすいため、
 * リーグとは別に持って明示する。
 *
 * footballDataCode は無料枠で日程を取得できるものだけ設定している。
 * 無料枠に含まれるカップ戦はチャンピオンズリーグのみ（2026年8月25日時点、
 * https://www.football-data.org/coverage の公開表で確認）。
 */
export const cups: Cup[] = [
  {
    id: "champions-league",
    name: "UEFAチャンピオンズリーグ",
    nameEn: "UEFA Champions League",
    scope: "europe",
    leagues: [
      "premier-league",
      "la-liga",
      "bundesliga",
      "serie-a",
      "ligue-1",
      "eredivisie",
      "primeira-liga",
      "jupiler-pro-league",
      "scottish-premiership",
      "danish-superliga",
    ],
    footballDataCode: "CL",
    officialUrl: "https://www.uefa.com/uefachampionsleague/",
  },
  {
    id: "europa-league",
    name: "UEFAヨーロッパリーグ",
    nameEn: "UEFA Europa League",
    scope: "europe",
    leagues: [
      "premier-league",
      "la-liga",
      "bundesliga",
      "serie-a",
      "ligue-1",
      "eredivisie",
      "primeira-liga",
      "jupiler-pro-league",
      "scottish-premiership",
      "danish-superliga",
    ],
    officialUrl: "https://www.uefa.com/uefaeuropaleague/",
  },
  {
    id: "conference-league",
    name: "UEFAカンファレンスリーグ",
    nameEn: "UEFA Conference League",
    scope: "europe",
    leagues: [
      "eredivisie",
      "primeira-liga",
      "jupiler-pro-league",
      "scottish-premiership",
      "danish-superliga",
      "serie-a",
      "ligue-1",
    ],
    officialUrl: "https://www.uefa.com/uefaconferenceleague/",
  },
  {
    id: "fa-cup",
    name: "FAカップ",
    nameEn: "FA Cup",
    scope: "domestic",
    country: "イングランド",
    leagues: ["premier-league", "championship"],
    officialUrl: "https://www.thefa.com/competitions/thefacup",
  },
  {
    id: "efl-cup",
    name: "EFLカップ",
    nameEn: "EFL Cup",
    scope: "domestic",
    country: "イングランド",
    leagues: ["premier-league", "championship"],
    officialUrl: "https://www.efl.com/clubs-and-competitions/carabao-cup/",
  },
  {
    id: "dfb-pokal",
    name: "DFBポカール",
    nameEn: "DFB-Pokal",
    scope: "domestic",
    country: "ドイツ",
    leagues: ["bundesliga", "bundesliga-2"],
    officialUrl: "https://www.dfb.de/dfb-pokal/",
  },
  {
    id: "copa-del-rey",
    name: "コパ・デル・レイ",
    nameEn: "Copa del Rey",
    scope: "domestic",
    country: "スペイン",
    leagues: ["la-liga", "segunda-division"],
    officialUrl: "https://www.rfef.es/",
  },
  {
    id: "coppa-italia",
    name: "コッパ・イタリア",
    nameEn: "Coppa Italia",
    scope: "domestic",
    country: "イタリア",
    leagues: ["serie-a"],
    officialUrl: "https://www.legaseriea.it/",
  },
  {
    id: "coupe-de-france",
    name: "クープ・ドゥ・フランス",
    nameEn: "Coupe de France",
    scope: "domestic",
    country: "フランス",
    leagues: ["ligue-1"],
    officialUrl: "https://www.fff.fr/",
  },
  {
    id: "knvb-cup",
    name: "KNVBカップ",
    nameEn: "KNVB Cup",
    scope: "domestic",
    country: "オランダ",
    leagues: ["eredivisie"],
    officialUrl: "https://www.knvb.nl/",
  },
  {
    id: "taca-de-portugal",
    name: "タッサ・デ・ポルトガル",
    nameEn: "Taça de Portugal",
    scope: "domestic",
    country: "ポルトガル",
    leagues: ["primeira-liga"],
    officialUrl: "https://www.fpf.pt/",
  },
  {
    id: "belgian-cup",
    name: "ベルギー・カップ",
    nameEn: "Belgian Cup",
    scope: "domestic",
    country: "ベルギー",
    leagues: ["jupiler-pro-league", "challenger-pro-league"],
    officialUrl: "https://www.rbfa.be/",
  },
  {
    id: "scottish-cup",
    name: "スコティッシュカップ",
    nameEn: "Scottish Cup",
    scope: "domestic",
    country: "スコットランド",
    leagues: ["scottish-premiership"],
    officialUrl: "https://www.scottishfa.co.uk/",
  },
];

export const cupMap = Object.fromEntries(cups.map((c) => [c.id, c])) as Record<CupId, Cup>;

/** そのリーグのクラブが出場しうるカップ戦 */
export function cupsForLeague(league: LeagueId): Cup[] {
  return cups.filter((c) => c.leagues.includes(league));
}
