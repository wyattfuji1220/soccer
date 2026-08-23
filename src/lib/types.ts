export type Confidence = "verified" | "needs-review";

/** 出典。ファクト重視サイトのため、可変情報には必ず一次情報URLを添える */
export type Source = {
  label: string;
  url: string;
  /** ISO date. この日時点で内容を確認したことを示す */
  checkedAt: string;
};

export type LeagueId =
  | "premier-league"
  | "la-liga"
  | "bundesliga"
  | "serie-a"
  | "ligue-1"
  | "eredivisie"
  | "jupiler-pro-league"
  | "primeira-liga"
  | "scottish-premiership";

export type League = {
  id: LeagueId;
  name: string;
  nameEn: string;
  country: string;
  /** football-data.org のコンペティションコード（無料枠で取得可能なもののみ） */
  footballDataCode?: string;
  /** 1クラブあたりのリーグ戦年間試合数。視聴プラン診断の単価計算に使う */
  matchesPerSeason: number;
};

export type Position = "GK" | "DF" | "MF" | "FW";

export type Player = {
  /** URL slug。ローマ字表記 */
  slug: string;
  nameJa: string;
  nameEn: string;
  position: Position;
  /** ISO date */
  birthDate: string;
  club: string;
  clubEn: string;
  league: LeagueId;
  squadNumber?: number;
  /** 所属情報の確度。移籍市場中は needs-review になりやすい */
  confidence: Confidence;
  sources: Source[];
  /** 事実の箇条書き。ニュースの転載ではなく、確認済みの事実のみ */
  facts: string[];
};

/** 日本国内での視聴手段。放映権は毎シーズン変動するため lastChecked を必ず表示する */
export type Broadcaster = {
  id: string;
  name: string;
  /** 月額（円）。無料プランのみの場合は 0 */
  monthlyPriceYen: number;
  /** 現時点で配信していると確認できたリーグ */
  leagues: LeagueId[];
  officialUrl: string;
  /** アフィリエイトリンク。未設定なら officialUrl にフォールバック */
  affiliateUrl?: string;
  freeTrialNote?: string;
  lastChecked: string;
  confidence: Confidence;
};

/** 試合。日程は football-data.org から取得し、日本時間への変換は表示時に行う */
export type Fixture = {
  id: string;
  league: LeagueId;
  /** ISO 8601（UTC） */
  utcDate: string;
  homeTeam: string;
  homeTeamEn: string;
  awayTeam: string;
  awayTeamEn: string;
  status: "SCHEDULED" | "IN_PLAY" | "FINISHED";
  score?: { home: number | null; away: number | null };
};
