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
  | "primeira-liga"
  | "jupiler-pro-league"
  | "scottish-premiership"
  | "danish-superliga"
  | "championship"
  | "bundesliga-2"
  | "ligue-2"
  | "segunda-division"
  | "challenger-pro-league"
  | "austrian-bundesliga"
  | "swiss-super-league"
  | "ekstraklasa"
  | "slovak-superliga"
  | "serbian-superliga"
  | "croatian-hnl";

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

/**
 * 所属が変わったことの記録。噂は含まず、Wikipediaのインフォボックスが
 * 書き換わった＝移籍が確定して反映されたものだけを扱う。
 *   move    … 掲載中の選手が別のクラブへ移った
 *   arrived … 新たに掲載対象になった（欧州のリーグへ来た）
 *   left    … 掲載対象から外れた（国内復帰、対象外リーグへの移籍など）
 */
export type Transfer = {
  /** 当サイトが変化を確認した日。クラブの発表日ではない */
  date: string;
  slug: string;
  nameJa: string;
  kind: "move" | "arrived" | "left";
  fromClub: string | null;
  toClub: string | null;
  fromLeague: LeagueId | null;
  toLeague: LeagueId | null;
};

/**
 * 移籍市場が閉まる日時。締切を過ぎると、次の市場が開くまで登録ができない。
 * 「いま契約を決めるか、移籍が落ち着くまで待つか」の判断材料として出す。
 *
 * 時刻まで公式に確認できたものだけ precision を "time" にする。
 * 日付しか確認できていないものは "date" とし、時刻を書かない。
 */
export type TransferWindow = {
  id: string;
  /** 「2026年 夏」のような市場の呼び名 */
  label: string;
  leagues: LeagueId[];
  /** 締切。オフセットつきのISO8601で持ち、表示時に日本時間へ直す */
  closesAt: string;
  precision: "time" | "date";
  confidence: Confidence;
  source: Source;
};

/**
 * 海外のクラブに在籍した記録がある選手の要約。歴史の集計にだけ使う。
 * 出場数や背番号は持たない（当時の記録が揃わないため）。
 */
export type Alumnus = {
  nameJa: string;
  /** Wikipediaの記事名。曖昧さ回避の括弧が付くことがある */
  article: string;
  /** 初めて海外クラブに在籍した年 */
  from: number;
  /** 最後に海外クラブに在籍した年。在籍中なら null */
  to: number | null;
  /** 在籍した国（ISO 3文字コード） */
  countries: string[];
  clubs: string[];
};

/**
 * 今季のリーグ戦の記録。英語版Wikipediaの「Career statistics」表から取る。
 * 日本語版のインフォボックスは通算値しか持たず、今季ぶんを切り出せないため。
 */
export type SeasonStat = {
  slug: string;
  apps: number;
  goals: number;
  /** 英語版の表に書かれたディビジョン名。行によっては省略されている */
  division: string | null;
  /** 表が自己申告している更新時点。古ければ直近の試合は反映されていない */
  updatedAt: string | null;
  /** 出どころの英語版記事名 */
  source: string | null;
};

export type CupId =
  | "champions-league"
  | "europa-league"
  | "conference-league"
  | "fa-cup"
  | "efl-cup"
  | "dfb-pokal"
  | "copa-del-rey"
  | "coppa-italia"
  | "coupe-de-france"
  | "knvb-cup"
  | "taca-de-portugal"
  | "belgian-cup"
  | "scottish-cup";

export type Cup = {
  id: CupId;
  name: string;
  nameEn: string;
  /** 欧州大会か、各国の国内カップか */
  scope: "europe" | "domestic";
  /** 国内カップの開催国。欧州大会では未設定 */
  country?: string;
  /** このカップ戦に出場しうるクラブが所属するリーグ */
  leagues: LeagueId[];
  /** football-data.org のコンペティションコード。無料枠で取れるものだけ設定する */
  footballDataCode?: string;
  officialUrl: string;
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
  /** 出場数・得点数がいつ時点のものか（Wikipediaの「クラブ成績更新日」） */
  statsCheckedAt?: string;
  sources: Source[];
  /** 事実の箇条書き。ニュースの転載ではなく、確認済みの事実のみ。任意 */
  facts?: string[];
  /** クラブ遍歴。Wikipediaのインフォボックスから機械的に取得している */
  career: CareerRow[];
  /** 代表歴 */
  nationalCareer: CareerRow[];
};

export type CareerRow = {
  /** "2019-2022" や "2022-" のような表記のまま持つ */
  years: string | null;
  team: string;
  /** IOCコード。国旗表示ではなく国名の判別に使う */
  country: string | null;
  /** 期限付き移籍 */
  loan: boolean;
  apps: number | null;
  goals: number | null;
};

/** 日本国内での視聴手段。放映権は毎シーズン変動するため lastChecked を必ず表示する */
export type Broadcaster = {
  id: string;
  name: string;
  /** 月額（円）。無料プランのみの場合は 0 */
  monthlyPriceYen: number;
  /** 全試合を配信していると確認できたリーグ */
  leagues: LeagueId[];
  /** 一部の試合のみ配信しているリーグ。全試合は観られないため、試合数の集計には含めない */
  partialLeagues?: LeagueId[];
  /** 配信を確認できたカップ戦 */
  cups?: CupId[];
  officialUrl: string;
  /** アフィリエイトリンク。未設定なら officialUrl にフォールバック */
  freeTrialNote?: string;
  /** 配信範囲の但し書き。「全試合ではない」などの重要な限定はここに書く */
  note?: string;
  lastChecked: string;
  confidence: Confidence;
};

/** 試合。日程は football-data.org から取得し、日本時間への変換は表示時に行う */
export type Fixture = {
  id: string;
  league: LeagueId;
  /** リーグ戦以外の場合に入る。未設定ならリーグ戦 */
  cup?: CupId;
  /** ISO 8601（UTC） */
  utcDate: string;
  homeTeam: string;
  homeTeamEn: string;
  awayTeam: string;
  awayTeamEn: string;
  status: "SCHEDULED" | "IN_PLAY" | "FINISHED";
  score?: { home: number | null; away: number | null };
};

/** 選手ページに埋め込む公式動画。権利者自身のチャンネルのものだけを扱う */
export type PlayerVideo = {
  playerSlug: string;
  videoId: string;
  /** YouTube の oEmbed が返した実際のタイトル */
  title: string;
  /** YouTube の oEmbed が返した実際のチャンネル名 */
  channel: string;
  channelUrl: string;
  verifiedAt: string;
};

/** クラブ。掲載選手の現所属とクラブ遍歴から集約している */
export type Club = {
  slug: string;
  name: string;
  nameEn: string | null;
  /** Wikipediaの記事名。出典リンクに使う */
  article: string;
  /** IOCコード。日本のクラブか海外かの判別に使う */
  countries: string[];
  currentPlayers: string[];
  pastPlayers: { nameJa: string; years: string | null; loan: boolean }[];
};

/** 記事の本文を構成するブロック。表や注意書きを混ぜられるようにしている */
export type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][]; note?: string }
  | { type: "callout"; text: string }
  | { type: "broadcasters"; league: LeagueId; heading: string };
