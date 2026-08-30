/**
 * Wikipediaの {{Flagicon}} に使われる国コードを、表示用の国名に直す。
 *
 * 同じ国が複数のコードで書かれている。ドイツは GER と DEU、スペインは ESP と
 * SPA、スイスは SUI・CHE・SWI といった具合で、記事ごとにばらつく。
 * 集計の前に代表コードへ寄せておかないと、同じ国が二重に数えられる。
 */

/** 表記ゆれ → 代表コード */
const ALIAS: Record<string, string> = {
  DEU: "GER", SPA: "ESP", NLD: "NED", CHE: "SUI", SWI: "SUI",
  LAT: "LVA", LIT: "LTU", ROM: "ROU", HRV: "CRO", DNK: "DEN",
  BGR: "BUL", GRC: "GRE", PRT: "POR", IRE: "IRL", SLO: "SVN",
  MAL: "MLT", ROC: "TPE", PRY: "PAR", MGL: "MNG", MYA: "MMR",
  INA: "IDN", SGP: "SIN", PHL: "PHI", BGD: "BAN", OMN: "OMA",
  SCG: "SRB", MAS: "MYS",
};

export function normalizeCountry(code: string): string {
  return ALIAS[code] ?? code;
}

const NAMES: Record<string, string> = {
  // 欧州
  ENG: "イングランド", SCO: "スコットランド", WAL: "ウェールズ", IRL: "アイルランド",
  GER: "ドイツ", ESP: "スペイン", ITA: "イタリア", FRA: "フランス",
  NED: "オランダ", BEL: "ベルギー", POR: "ポルトガル", AUT: "オーストリア",
  SUI: "スイス", DEN: "デンマーク", SWE: "スウェーデン", NOR: "ノルウェー",
  FIN: "フィンランド", POL: "ポーランド", CZE: "チェコ", SVK: "スロバキア",
  HUN: "ハンガリー", ROU: "ルーマニア", BUL: "ブルガリア", GRE: "ギリシャ",
  TUR: "トルコ", CRO: "クロアチア", SVN: "スロベニア", SRB: "セルビア",
  MNE: "モンテネグロ", BIH: "ボスニア・ヘルツェゴビナ", MKD: "北マケドニア",
  ALB: "アルバニア", KOS: "コソボ", LVA: "ラトビア", LTU: "リトアニア",
  EST: "エストニア", RUS: "ロシア", UKR: "ウクライナ", BLR: "ベラルーシ",
  MDA: "モルドバ", ARM: "アルメニア", GEO: "ジョージア", AZE: "アゼルバイジャン",
  CYP: "キプロス", MLT: "マルタ", LUX: "ルクセンブルク", ISL: "アイスランド",
  SMR: "サンマリノ", GIB: "ジブラルタル", FRO: "フェロー諸島", MON: "モナコ",
  // 欧州以外でよく出てくる国
  THA: "タイ", KOR: "韓国", CHN: "中国", HKG: "香港", TPE: "台湾",
  SIN: "シンガポール", MYS: "マレーシア", IDN: "インドネシア", VIE: "ベトナム",
  CAM: "カンボジア", KHM: "カンボジア", LAO: "ラオス", MMR: "ミャンマー",
  IND: "インド", NPL: "ネパール", BAN: "バングラデシュ", LKA: "スリランカ",
  MDV: "モルディブ", BTN: "ブータン", MNG: "モンゴル", MAC: "マカオ",
  UZB: "ウズベキスタン", KAZ: "カザフスタン", KGZ: "キルギス", TJK: "タジキスタン",
  QAT: "カタール", UAE: "アラブ首長国連邦", SAU: "サウジアラビア",
  BHR: "バーレーン", OMA: "オマーン", IRN: "イラン", ISR: "イスラエル",
  USA: "アメリカ", CAN: "カナダ", MEX: "メキシコ", CRC: "コスタリカ",
  BRA: "ブラジル", ARG: "アルゼンチン", URU: "ウルグアイ", PAR: "パラグアイ",
  AUS: "オーストラリア", NZL: "ニュージーランド", FIJ: "フィジー",
  VUT: "バヌアツ", NCL: "ニューカレドニア", SLB: "ソロモン諸島", PNG: "パプアニューギニア",
  MDG: "マダガスカル", SLV: "エルサルバドル",
};

export function countryNameJa(code: string): string {
  const c = normalizeCountry(code);
  return NAMES[c] ?? c;
}

const EUROPE = new Set([
  "ENG", "SCO", "WAL", "IRL", "GER", "ESP", "ITA", "FRA", "NED", "BEL",
  "POR", "AUT", "SUI", "DEN", "SWE", "NOR", "FIN", "POL", "CZE", "SVK",
  "HUN", "ROU", "BUL", "GRE", "TUR", "CRO", "SVN", "SRB", "MNE", "BIH",
  "MKD", "ALB", "KOS", "LVA", "LTU", "EST", "RUS", "UKR", "BLR", "MDA",
  "ARM", "GEO", "AZE", "CYP", "MLT", "LUX", "ISL", "SMR", "GIB", "FRO", "MON",
]);

export function isEurope(code: string): boolean {
  return EUROPE.has(normalizeCountry(code));
}
