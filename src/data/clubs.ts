import type { Club } from "@/lib/types";

/**
 * このファイルは scripts/fetch-clubs.mjs が生成する。直接編集しないこと。
 *
 * 掲載選手の現所属とクラブ遍歴を集約したもの。表記ゆれは Wikipedia の
 * リダイレクト解決で正式な記事名に寄せている。
 * 現所属選手がいる、または過去に2人以上が在籍したクラブだけを収録している。
 *
 * 最終取得: 2026-08-24
 */
export const clubs: Club[] = [
  {
    slug: "freiburg",
    name: "SCフライブルク",
    nameEn: "SC Freiburg",
    article: "SCフライブルク",
    countries: ["GER"],
    currentPlayers: ["後藤啓介", "山本理仁", "鈴木唯人"],
    pastPlayers: [
      { nameJa: "堂安律", years: "2022-2025", loan: false },
    ],
  },
  {
    slug: "borussia-monchengladbach",
    name: "ボルシア・メンヒェングラートバッハ",
    nameEn: "Borussia Mönchengladbach",
    article: "ボルシア・メンヒェングラートバッハ",
    countries: ["GER"],
    currentPlayers: ["板倉滉", "橋岡大樹", "町野修斗"],
    pastPlayers: [
      { nameJa: "高井幸大", years: "2026", loan: true },
    ],
  },
  {
    slug: "eintracht-frankfurt",
    name: "アイントラハト・フランクフルト",
    nameEn: "Eintracht Frankfurt",
    article: "アイントラハト・フランクフルト",
    countries: ["GER"],
    currentPlayers: ["堂安律", "小杉啓太"],
    pastPlayers: [
      { nameJa: "鎌田大地", years: "2017-2023", loan: false },
    ],
  },
  {
    slug: "crystal-palace",
    name: "クリスタル・パレスFC",
    nameEn: "Crystal Palace F.C.",
    article: "クリスタル・パレスFC",
    countries: ["ENG"],
    currentPlayers: ["冨安健洋", "鎌田大地"],
    pastPlayers: [

    ],
  },
  {
    slug: "krc-genk",
    name: "KRCゲンク",
    nameEn: "KRC Genk",
    article: "KRCゲンク",
    countries: ["BEL"],
    currentPlayers: ["伊東純也", "横山歩夢"],
    pastPlayers: [

    ],
  },
  {
    slug: "feyenoord",
    name: "フェイエノールト",
    nameEn: "Feyenoord",
    article: "フェイエノールト",
    countries: ["NED"],
    currentPlayers: ["上田綺世", "渡辺剛"],
    pastPlayers: [

    ],
  },
  {
    slug: "southampton",
    name: "サウサンプトンFC",
    nameEn: "Southampton F.C.",
    article: "サウサンプトンFC",
    countries: ["ENG"],
    currentPlayers: ["菅原由勢", "松木玖生"],
    pastPlayers: [

    ],
  },
  {
    slug: "sint-truidense-vv",
    name: "シント＝トロイデンVV",
    nameEn: "Sint-Truidense VV",
    article: "シント＝トロイデンVV",
    countries: ["BEL"],
    currentPlayers: ["荒木遼太郎"],
    pastPlayers: [
      { nameJa: "遠藤航", years: "2018-2020", loan: false },
      { nameJa: "冨安健洋", years: "2018-2019", loan: false },
      { nameJa: "鎌田大地", years: "2018-2019", loan: true },
      { nameJa: "鈴木彩艶", years: "2023-2024", loan: true },
      { nameJa: "中村敬斗", years: "2020", loan: true },
      { nameJa: "橋岡大樹", years: "2021", loan: true },
      { nameJa: "後藤啓介", years: "2025-2026", loan: true },
      { nameJa: "山本理仁", years: "2023-2024", loan: true },
    ],
  },
  {
    slug: "stade-de-reims",
    name: "スタッド・ランス",
    nameEn: "Stade de Reims",
    article: "スタッド・ランス",
    countries: ["FRA"],
    currentPlayers: ["中村敬斗"],
    pastPlayers: [
      { nameJa: "伊東純也", years: "2022-2025", loan: false },
      { nameJa: "関根大輝", years: "2025-", loan: false },
    ],
  },
  {
    slug: "kaa-gent",
    name: "KAAヘント",
    nameEn: "KAA Gent",
    article: "KAAヘント",
    countries: ["BEL"],
    currentPlayers: ["伊藤敦樹"],
    pastPlayers: [
      { nameJa: "橋岡大樹", years: "2026", loan: true },
      { nameJa: "渡辺剛", years: "2023-2025", loan: false },
    ],
  },
  {
    slug: "psv-eindhoven",
    name: "PSVアイントホーフェン",
    nameEn: "PSV Eindhoven",
    article: "PSVアイントホーフェン",
    countries: ["NED"],
    currentPlayers: ["佐野航大"],
    pastPlayers: [
      { nameJa: "堂安律", years: "2019-2022", loan: false },
    ],
  },
  {
    slug: "hull-city",
    name: "ハル・シティAFC",
    nameEn: "Hull City A.F.C.",
    article: "ハル・シティAFC",
    countries: ["ENG"],
    currentPlayers: ["守田英正"],
    pastPlayers: [
      { nameJa: "平河悠", years: "2026", loan: true },
    ],
  },
  {
    slug: "celtic",
    name: "セルティックFC",
    nameEn: "Celtic F.C.",
    article: "セルティックFC",
    countries: ["SCO"],
    currentPlayers: ["旗手怜央"],
    pastPlayers: [
      { nameJa: "前田大然", years: "2022", loan: true },
    ],
  },
  {
    slug: "az-alkmaar",
    name: "AZアルクマール",
    nameEn: "AZ Alkmaar",
    article: "AZアルクマール",
    countries: ["NED"],
    currentPlayers: ["毎熊晟矢"],
    pastPlayers: [
      { nameJa: "菅原由勢", years: "2019-2020", loan: true },
    ],
  },
  {
    slug: "bayern-munich",
    name: "FCバイエルン・ミュンヘン",
    nameEn: "FC Bayern Munich",
    article: "FCバイエルン・ミュンヘン",
    countries: ["GER"],
    currentPlayers: ["伊藤洋輝"],
    pastPlayers: [
      { nameJa: "福井太智", years: "2023-2025", loan: false },
    ],
  },
  {
    slug: "holstein-kiel",
    name: "ホルシュタイン・キール",
    nameEn: "Holstein Kiel",
    article: "ホルシュタイン・キール",
    countries: ["GER"],
    currentPlayers: ["関根大輝"],
    pastPlayers: [
      { nameJa: "町野修斗", years: "2023-2025", loan: false },
    ],
  },
  {
    slug: "sparta-rotterdam",
    name: "スパルタ・ロッテルダム",
    nameEn: "Sparta Rotterdam",
    article: "スパルタ・ロッテルダム",
    countries: ["NED"],
    currentPlayers: ["三戸舜介"],
    pastPlayers: [
      { nameJa: "斉藤光毅", years: "2022-2024", loan: true },
    ],
  },
  {
    slug: "real-sociedad",
    name: "レアル・ソシエダ",
    nameEn: "Real Sociedad",
    article: "レアル・ソシエダ",
    countries: ["ESP"],
    currentPlayers: ["久保建英"],
    pastPlayers: [

    ],
  },
  {
    slug: "brighton-hove-albion",
    name: "ブライトン・アンド・ホーヴ・アルビオンFC",
    nameEn: "Brighton & Hove Albion F.C.",
    article: "ブライトン・アンド・ホーヴ・アルビオンFC",
    countries: ["ENG"],
    currentPlayers: ["三笘薫"],
    pastPlayers: [

    ],
  },
  {
    slug: "liverpool",
    name: "リヴァプールFC",
    nameEn: "Liverpool F.C.",
    article: "リヴァプールFC",
    countries: ["ENG"],
    currentPlayers: ["遠藤航"],
    pastPlayers: [

    ],
  },
  {
    slug: "as-monaco",
    name: "ASモナコ",
    nameEn: "AS Monaco FC",
    article: "ASモナコ",
    countries: ["MON"],
    currentPlayers: ["南野拓実"],
    pastPlayers: [

    ],
  },
  {
    slug: "ipswich-town",
    name: "イプスウィッチ・タウンFC",
    nameEn: "Ipswich Town F.C.",
    article: "イプスウィッチ・タウンFC",
    countries: ["ENG"],
    currentPlayers: ["前田大然"],
    pastPlayers: [

    ],
  },
  {
    slug: "aston-villa",
    name: "アストン・ヴィラFC",
    nameEn: "Aston Villa F.C.",
    article: "アストン・ヴィラFC",
    countries: ["ENG"],
    currentPlayers: ["鈴木彩艶"],
    pastPlayers: [

    ],
  },
  {
    slug: "leeds-united",
    name: "リーズ・ユナイテッドFC",
    nameEn: "Leeds United F.C.",
    article: "リーズ・ユナイテッドFC",
    countries: ["ENG"],
    currentPlayers: ["田中碧"],
    pastPlayers: [

    ],
  },
  {
    slug: "1-fsv-mainz-05",
    name: "1.FSVマインツ05",
    nameEn: "1. FSV Mainz 05",
    article: "1.FSVマインツ05",
    countries: ["GER"],
    currentPlayers: ["佐野海舟"],
    pastPlayers: [

    ],
  },
  {
    slug: "tsg-1899-hoffenheim",
    name: "TSG1899ホッフェンハイム",
    nameEn: "TSG 1899 Hoffenheim",
    article: "TSG1899ホッフェンハイム",
    countries: ["GER"],
    currentPlayers: ["町田浩樹"],
    pastPlayers: [

    ],
  },
  {
    slug: "vfl-wolfsburg",
    name: "VfLヴォルフスブルク",
    nameEn: "VfL Wolfsburg",
    article: "VfLヴォルフスブルク",
    countries: ["GER"],
    currentPlayers: ["塩貝健人"],
    pastPlayers: [

    ],
  },
  {
    slug: "arouca",
    name: "FCアロウカ",
    nameEn: "F.C. Arouca",
    article: "FCアロウカ",
    countries: ["POR"],
    currentPlayers: ["福井太智"],
    pastPlayers: [

    ],
  },
  {
    slug: "st-pauli",
    name: "FCザンクトパウリ",
    nameEn: "FC St. Pauli",
    article: "FCザンクトパウリ",
    countries: ["GER"],
    currentPlayers: ["藤田譲瑠チマ"],
    pastPlayers: [

    ],
  },
  {
    slug: "ud-las-palmas",
    name: "UDラス・パルマス",
    nameEn: "UD Las Palmas",
    article: "UDラス・パルマス",
    countries: ["ESP"],
    currentPlayers: ["宮代大聖"],
    pastPlayers: [

    ],
  },
  {
    slug: "queens-park-rangers",
    name: "クイーンズ・パーク・レンジャーズFC",
    nameEn: "Queens Park Rangers F.C.",
    article: "クイーンズ・パーク・レンジャーズFC",
    countries: ["ENG"],
    currentPlayers: ["斉藤光毅"],
    pastPlayers: [

    ],
  },
  {
    slug: "bristol-city",
    name: "ブリストル・シティFC",
    nameEn: "Bristol City F.C.",
    article: "ブリストル・シティFC",
    countries: ["ENG"],
    currentPlayers: ["平河悠"],
    pastPlayers: [

    ],
  },
  {
    slug: "blackburn-rovers",
    name: "ブラックバーン・ローヴァーズFC",
    nameEn: "Blackburn Rovers F.C.",
    article: "ブラックバーン・ローヴァーズFC",
    countries: ["ENG"],
    currentPlayers: ["大橋祐紀"],
    pastPlayers: [

    ],
  },
  {
    slug: "tottenham-hotspur",
    name: "トッテナム・ホットスパーFC",
    nameEn: "Tottenham Hotspur F.C.",
    article: "トッテナム・ホットスパーFC",
    countries: ["ENG"],
    currentPlayers: ["高井幸大"],
    pastPlayers: [

    ],
  },
  {
    slug: "royal-antwerp",
    name: "ロイヤル・アントワープFC",
    nameEn: "Royal Antwerp FC",
    article: "ロイヤル・アントワープFC",
    countries: ["BEL"],
    currentPlayers: ["野澤大志ブランドン"],
    pastPlayers: [

    ],
  },
  {
    slug: "copenhagen",
    name: "FCコペンハーゲン",
    nameEn: "F.C. Copenhagen",
    article: "FCコペンハーゲン",
    countries: ["DEN"],
    currentPlayers: ["鈴木淳之介"],
    pastPlayers: [

    ],
  },
  {
    slug: "k-beerschot-va",
    name: "KベールスホットVA",
    nameEn: "K Beerschot VA",
    article: "KベールスホットVA",
    countries: ["BEL"],
    currentPlayers: ["原口元気"],
    pastPlayers: [

    ],
  },
  {
    slug: "valencia-cf",
    name: "バレンシアCF",
    nameEn: "Valencia CF",
    article: "バレンシアCF",
    countries: ["ESP"],
    currentPlayers: ["佐藤龍之介"],
    pastPlayers: [

    ],
  },
  {
    slug: "kawasaki-frontale",
    name: "川崎フロンターレ",
    nameEn: "Kawasaki Frontale",
    article: "川崎フロンターレ",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "三笘薫", years: "2020-2021", loan: false },
      { nameJa: "板倉滉", years: "2015-2018", loan: false },
      { nameJa: "守田英正", years: "2018-2020", loan: false },
      { nameJa: "田中碧", years: "2017-2022", loan: false },
      { nameJa: "旗手怜央", years: "2019-2021", loan: false },
      { nameJa: "宮代大聖", years: "2018-2023", loan: false },
      { nameJa: "高井幸大", years: "2022-2025", loan: false },
    ],
  },
  {
    slug: "tokyo",
    name: "FC東京",
    nameEn: "FC Tokyo",
    article: "FC東京",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "久保建英", years: "2017-2019", loan: false },
      { nameJa: "渡辺剛", years: "2018-2021", loan: false },
      { nameJa: "松木玖生", years: "2022-2024", loan: false },
      { nameJa: "野澤大志ブランドン", years: "2020-2025", loan: false },
      { nameJa: "荒木遼太郎", years: "2024", loan: true },
      { nameJa: "佐藤龍之介", years: "2023-2026", loan: false },
    ],
  },
  {
    slug: "yokohama-f-marinos",
    name: "横浜F・マリノス",
    nameEn: "Yokohama F. Marinos",
    article: "横浜F・マリノス",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "久保建英", years: "2018", loan: true },
      { nameJa: "前田大然", years: "2020", loan: true },
      { nameJa: "町野修斗", years: "2018-2019", loan: false },
      { nameJa: "塩貝健人", years: "2024", loan: false },
      { nameJa: "藤田譲瑠チマ", years: "2022-2023", loan: false },
    ],
  },
  {
    slug: "urawa-red-diamonds",
    name: "浦和レッドダイヤモンズ",
    nameEn: "Urawa Red Diamonds",
    article: "浦和レッドダイヤモンズ",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "遠藤航", years: "2016-2018", loan: false },
      { nameJa: "鈴木彩艶", years: "2021-2024", loan: false },
      { nameJa: "橋岡大樹", years: "2018-2021", loan: false },
      { nameJa: "原口元気", years: "2009-2014", loan: false },
      { nameJa: "伊藤敦樹", years: "2021-2024", loan: false },
    ],
  },
  {
    slug: "shonan-bellmare",
    name: "湘南ベルマーレ",
    nameEn: "Shonan Bellmare",
    article: "湘南ベルマーレ",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "遠藤航", years: "2010-2015", loan: false },
      { nameJa: "町野修斗", years: "2021-2023", loan: false },
      { nameJa: "大橋祐紀", years: "2018-2023", loan: false },
      { nameJa: "鈴木淳之介", years: "2022-2025", loan: false },
    ],
  },
  {
    slug: "sagan-tosu",
    name: "サガン鳥栖",
    nameEn: "Sagan Tosu",
    article: "サガン鳥栖",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "鎌田大地", years: "2015-2017", loan: false },
      { nameJa: "福井太智", years: "2021-2022", loan: false },
      { nameJa: "横山歩夢", years: "2023-2024", loan: false },
      { nameJa: "宮代大聖", years: "2022", loan: true },
    ],
  },
  {
    slug: "kashima-antlers",
    name: "鹿島アントラーズ",
    nameEn: "Kashima Antlers",
    article: "鹿島アントラーズ",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "上田綺世", years: "2019-2022", loan: false },
      { nameJa: "佐野海舟", years: "2023-2024", loan: false },
      { nameJa: "町田浩樹", years: "2016-2023", loan: false },
      { nameJa: "荒木遼太郎", years: "2020-2026", loan: false },
    ],
  },
  {
    slug: "vfb-stuttgart",
    name: "VfBシュトゥットガルト",
    nameEn: "VfB Stuttgart",
    article: "VfBシュトゥットガルト",
    countries: ["GER"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "遠藤航", years: "2019-2020", loan: true },
      { nameJa: "伊藤洋輝", years: "2021-2022", loan: true },
      { nameJa: "原口元気", years: "2023-2024", loan: false },
    ],
  },
  {
    slug: "gamba-osaka",
    name: "ガンバ大阪",
    nameEn: "Gamba Osaka",
    article: "ガンバ大阪",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "堂安律", years: "2015-2018", loan: false },
      { nameJa: "中村敬斗", years: "2018-2021", loan: false },
      { nameJa: "山本理仁", years: "2022-2024", loan: false },
    ],
  },
  {
    slug: "royale-union-saint-gilloise",
    name: "ロイヤル・ユニオン・サン＝ジロワーズ",
    nameEn: "Royale Union Saint-Gilloise",
    article: "ロイヤル・ユニオン・サン＝ジロワーズ",
    countries: ["BEL"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "三笘薫", years: "2021-2022", loan: true },
      { nameJa: "町田浩樹", years: "2022-2023", loan: true },
    ],
  },
  {
    slug: "ajax",
    name: "アヤックス・アムステルダム",
    nameEn: "AFC Ajax",
    article: "アヤックス・アムステルダム",
    countries: ["NED"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "冨安健洋", years: "2025-2026", loan: false },
      { nameJa: "板倉滉", years: "2025-2026", loan: false },
    ],
  },
  {
    slug: "kashiwa-reysol",
    name: "柏レイソル",
    nameEn: "Kashiwa Reysol",
    article: "柏レイソル",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "伊東純也", years: "2016-2020", loan: false },
      { nameJa: "関根大輝", years: "2023-2024", loan: false },
    ],
  },
  {
    slug: "cerezo-osaka",
    name: "セレッソ大阪",
    nameEn: "Cerezo Osaka",
    article: "セレッソ大阪",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "南野拓実", years: "2012-2014", loan: false },
      { nameJa: "毎熊晟矢", years: "2022-2024", loan: false },
    ],
  },
  {
    slug: "matsumoto-yamaga",
    name: "松本山雅FC",
    nameEn: "Matsumoto Yamaga FC",
    article: "松本山雅FC",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "前田大然", years: "2016-2020", loan: false },
      { nameJa: "横山歩夢", years: "2021-2022", loan: false },
    ],
  },
  {
    slug: "nagoya-grampus",
    name: "名古屋グランパスエイト",
    nameEn: "Nagoya Grampus",
    article: "名古屋グランパスエイト",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "菅原由勢", years: "2018-2020", loan: false },
      { nameJa: "伊藤洋輝", years: "2019", loan: true },
    ],
  },
  {
    slug: "jubilo-iwata",
    name: "ジュビロ磐田",
    nameEn: "Júbilo Iwata",
    article: "ジュビロ磐田",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "伊藤洋輝", years: "2018-2022", loan: false },
      { nameJa: "後藤啓介", years: "2023-2024", loan: false },
    ],
  },
  {
    slug: "machida-zelvia",
    name: "FC町田ゼルビア",
    nameEn: "FC Machida Zelvia",
    article: "FC町田ゼルビア",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "佐野海舟", years: "2019-2022", loan: false },
      { nameJa: "平河悠", years: "2021-2025", loan: false },
    ],
  },
  {
    slug: "nec-nijmegen",
    name: "NECナイメヘン",
    nameEn: "NEC Nijmegen",
    article: "NECナイメヘン",
    countries: ["NED"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "塩貝健人", years: "2024-2026", loan: false },
      { nameJa: "佐野航大", years: "2023-2026", loan: false },
    ],
  },
  {
    slug: "tokyo-verdy",
    name: "東京ヴェルディ1969",
    nameEn: "Tokyo Verdy",
    article: "東京ヴェルディ1969",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "山本理仁", years: "2019-2022", loan: false },
      { nameJa: "藤田譲瑠チマ", years: "2019-2020", loan: false },
    ],
  },
  {
    slug: "tokushima-vortis",
    name: "徳島ヴォルティス",
    nameEn: "Tokushima Vortis",
    article: "徳島ヴォルティス",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "藤田譲瑠チマ", years: "2021", loan: false },
      { nameJa: "宮代大聖", years: "2021", loan: true },
    ],
  },
  {
    slug: "fagiano-okayama",
    name: "ファジアーノ岡山FC",
    nameEn: "Fagiano Okayama",
    article: "ファジアーノ岡山FC",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "佐野航大", years: "2022-2023", loan: false },
      { nameJa: "佐藤龍之介", years: "2025", loan: true },
    ],
  },
];

export const clubMap = Object.fromEntries(clubs.map((c) => [c.slug, c]));

/** 選手名からその選手が関わったクラブを引く */
export function clubsForPlayer(nameJa: string): Club[] {
  return clubs.filter(
    (c) => c.currentPlayers.includes(nameJa) || c.pastPlayers.some((p) => p.nameJa === nameJa)
  );
}
