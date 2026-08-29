import type { Club } from "@/lib/types";

/**
 * このファイルは scripts/fetch-clubs.mjs が生成する。直接編集しないこと。
 *
 * 掲載選手の現所属とクラブ遍歴を集約したもの。表記ゆれは Wikipedia の
 * リダイレクト解決で正式な記事名に寄せている。
 * 現所属選手がいる、または過去に2人以上が在籍したクラブだけを収録している。
 *
 * 最終取得: 2026-08-29
 */
export const clubs: Club[] = [
  {
    slug: "sint-truidense-vv",
    name: "シント＝トロイデンVV",
    nameEn: "Sint-Truidense VV",
    article: "シント＝トロイデンVV",
    countries: ["BEL"],
    currentPlayers: ["荒木遼太郎", "石渡ネルソン", "小久保玲央ブライアン", "新川志音", "谷口彰悟", "畑大雅", "松澤海斗"],
    pastPlayers: [
      { nameJa: "遠藤航", years: "2018-2020", loan: false },
      { nameJa: "冨安健洋", years: "2018-2019", loan: false },
      { nameJa: "鎌田大地", years: "2018-2019", loan: true },
      { nameJa: "鈴木彩艶", years: "2023-2024", loan: true },
      { nameJa: "中村敬斗", years: "2020", loan: true },
      { nameJa: "橋岡大樹", years: "2021", loan: true },
      { nameJa: "後藤啓介", years: "2025-2026", loan: true },
      { nameJa: "山本理仁", years: "2023-2024", loan: true },
      { nameJa: "原大智", years: "2021-2022", loan: true },
    ],
  },
  {
    slug: "borussia-monchengladbach",
    name: "ボルシア・メンヒェングラートバッハ",
    nameEn: "Borussia Mönchengladbach",
    article: "ボルシア・メンヒェングラートバッハ",
    countries: ["GER"],
    currentPlayers: ["板倉滉", "橋岡大樹", "町野修斗", "宇野禅斗"],
    pastPlayers: [
      { nameJa: "高井幸大", years: "2026", loan: true },
      { nameJa: "福田師王", years: "2024-2026", loan: false },
    ],
  },
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
    slug: "holstein-kiel",
    name: "ホルシュタイン・キール",
    nameEn: "Holstein Kiel",
    article: "ホルシュタイン・キール",
    countries: ["GER"],
    currentPlayers: ["関根大輝", "安部大晴", "高橋仁胡"],
    pastPlayers: [
      { nameJa: "町野修斗", years: "2023-2025", loan: false },
    ],
  },
  {
    slug: "royal-antwerp",
    name: "ロイヤル・アントワープFC",
    nameEn: "Royal Antwerp FC",
    article: "ロイヤル・アントワープFC",
    countries: ["BEL"],
    currentPlayers: ["野澤大志ブランドン", "安藤晃希", "綱島悠斗"],
    pastPlayers: [
      { nameJa: "三好康児", years: "2019-2020", loan: true },
    ],
  },
  {
    slug: "st-pauli",
    name: "FCザンクトパウリ",
    nameEn: "FC St. Pauli",
    article: "FCザンクトパウリ",
    countries: ["GER"],
    currentPlayers: ["藤田譲瑠チマ", "安藤智哉", "原大智"],
    pastPlayers: [

    ],
  },
  {
    slug: "le-havre-ac",
    name: "ル・アーヴルAC",
    nameEn: "Le Havre AC",
    article: "ル・アーヴルAC",
    countries: ["FRA"],
    currentPlayers: ["瀬古歩夢", "中村草太", "水多海斗"],
    pastPlayers: [

    ],
  },
  {
    slug: "kvc-westerlo",
    name: "KVCウェステルロー",
    nameEn: "KVC Westerlo",
    article: "KVCウェステルロー",
    countries: ["BEL"],
    currentPlayers: ["木村誠二", "齋藤俊輔", "坂本一彩"],
    pastPlayers: [

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
    slug: "az-alkmaar",
    name: "AZアルクマール",
    nameEn: "AZ Alkmaar",
    article: "AZアルクマール",
    countries: ["NED"],
    currentPlayers: ["毎熊晟矢", "市原吏音"],
    pastPlayers: [
      { nameJa: "菅原由勢", years: "2019-2020", loan: true },
    ],
  },
  {
    slug: "birmingham-city",
    name: "バーミンガム・シティFC",
    nameEn: "Birmingham City F.C.",
    article: "バーミンガム・シティFC",
    countries: ["ENG"],
    currentPlayers: ["岩田智輝", "藤本寛也"],
    pastPlayers: [
      { nameJa: "横山歩夢", years: "2024-", loan: false },
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
    slug: "1-fsv-mainz-05",
    name: "1.FSVマインツ05",
    nameEn: "1. FSV Mainz 05",
    article: "1.FSVマインツ05",
    countries: ["GER"],
    currentPlayers: ["佐野海舟", "川崎颯太"],
    pastPlayers: [

    ],
  },
  {
    slug: "blackburn-rovers",
    name: "ブラックバーン・ローヴァーズFC",
    nameEn: "Blackburn Rovers F.C.",
    article: "ブラックバーン・ローヴァーズFC",
    countries: ["ENG"],
    currentPlayers: ["大橋祐紀", "森下龍矢"],
    pastPlayers: [

    ],
  },
  {
    slug: "oud-heverlee-leuven",
    name: "OHルーヴェン",
    nameEn: "Oud-Heverlee Leuven",
    article: "OHルーヴェン",
    countries: ["BEL"],
    currentPlayers: ["荻原拓也", "山田新"],
    pastPlayers: [

    ],
  },
  {
    slug: "sv-darmstadt-98",
    name: "SVダルムシュタット98",
    nameEn: "SV Darmstadt 98",
    article: "SVダルムシュタット98",
    countries: ["GER"],
    currentPlayers: ["秋山裕紀", "古川陽介"],
    pastPlayers: [

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
      { nameJa: "岩田智輝", years: "2023", loan: true },
      { nameJa: "山田新", years: "2025-", loan: false },
    ],
  },
  {
    slug: "royale-union-saint-gilloise",
    name: "ロイヤル・ユニオン・サン＝ジロワーズ",
    nameEn: "Royale Union Saint-Gilloise",
    article: "ロイヤル・ユニオン・サン＝ジロワーズ",
    countries: ["BEL"],
    currentPlayers: ["ハーフナー・ニッキ"],
    pastPlayers: [
      { nameJa: "三笘薫", years: "2021-2022", loan: true },
      { nameJa: "町田浩樹", years: "2022-2023", loan: true },
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
    slug: "schalke-04",
    name: "シャルケ04",
    nameEn: "FC Schalke 04",
    article: "シャルケ04",
    countries: ["GER"],
    currentPlayers: ["田中聡"],
    pastPlayers: [
      { nameJa: "板倉滉", years: "2021-2022", loan: true },
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
    slug: "bolton-wanderers",
    name: "ボルトン・ワンダラーズFC",
    nameEn: "Bolton Wanderers F.C.",
    article: "ボルトン・ワンダラーズFC",
    countries: ["ENG"],
    currentPlayers: ["伊藤敦樹"],
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
    slug: "spvgg-greuther-furth",
    name: "SpVggグロイター・フュルト",
    nameEn: "SpVgg Greuther Fürth",
    article: "SpVggグロイター・フュルト",
    countries: ["GER"],
    currentPlayers: ["アペルカンプ真大"],
    pastPlayers: [

    ],
  },
  {
    slug: "karlsruher",
    name: "カールスルーエSC",
    nameEn: "Karlsruher SC",
    article: "カールスルーエSC",
    countries: ["GER"],
    currentPlayers: ["福田師王"],
    pastPlayers: [

    ],
  },
  {
    slug: "vfl-bochum",
    name: "VfLボーフム",
    nameEn: "VfL Bochum",
    article: "VfLボーフム",
    countries: ["GER"],
    currentPlayers: ["三好康児"],
    pastPlayers: [

    ],
  },
  {
    slug: "coventry-city",
    name: "コヴェントリー・シティFC",
    nameEn: "Coventry City F.C.",
    article: "コヴェントリー・シティFC",
    countries: ["ENG"],
    currentPlayers: ["坂元達裕"],
    pastPlayers: [

    ],
  },
  {
    slug: "kv-kortrijk",
    name: "KVコルトレイク",
    nameEn: "KV Kortrijk",
    article: "KVコルトレイク",
    countries: ["BEL"],
    currentPlayers: ["倍井謙"],
    pastPlayers: [

    ],
  },
  {
    slug: "rangers",
    name: "レンジャーズFC",
    nameEn: "Rangers F.C.",
    article: "レンジャーズFC",
    countries: ["SCO"],
    currentPlayers: ["横田大祐"],
    pastPlayers: [

    ],
  },
  {
    slug: "hannover-96",
    name: "ハノーファー96",
    nameEn: "Hannover 96",
    article: "ハノーファー96",
    countries: ["GER"],
    currentPlayers: ["松田隼風"],
    pastPlayers: [

    ],
  },
  {
    slug: "real-sociedad-b",
    name: "レアル・ソシエダB",
    nameEn: "Real Sociedad B",
    article: "レアル・ソシエダB",
    countries: ["ESP"],
    currentPlayers: ["喜多壱也"],
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
      { nameJa: "三好康児", years: "2015-2020", loan: false },
      { nameJa: "山田新", years: "2023-2025", loan: false },
      { nameJa: "谷口彰悟", years: "2014-2022", loan: false },
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
      { nameJa: "原大智", years: "2018-2020", loan: false },
      { nameJa: "木村誠二", years: "2020-2025", loan: false },
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
      { nameJa: "岩田智輝", years: "2021-2023", loan: false },
      { nameJa: "三好康児", years: "2019", loan: true },
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
      { nameJa: "森下龍矢", years: "2020", loan: false },
      { nameJa: "新川志音", years: "2025", loan: false },
      { nameJa: "木村誠二", years: "2024", loan: true },
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
      { nameJa: "畑大雅", years: "2020-2025", loan: false },
      { nameJa: "田中聡", years: "2020-2024", loan: false },
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
      { nameJa: "荻原拓也", years: "2018-", loan: false },
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
      { nameJa: "坂元達裕", years: "2020-2022", loan: false },
      { nameJa: "瀬古歩夢", years: "2019-2021", loan: false },
      { nameJa: "高橋仁胡", years: "2024-", loan: false },
      { nameJa: "石渡ネルソン", years: "2022-2026", loan: false },
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
      { nameJa: "森下龍矢", years: "2021-2024", loan: false },
      { nameJa: "倍井謙", years: "2023-", loan: false },
      { nameJa: "ハーフナー・ニッキ", years: "2013-2015", loan: false },
    ],
  },
  {
    slug: "kyoto-sanga",
    name: "京都サンガF.C.",
    nameEn: "Kyoto Sanga FC",
    article: "京都サンガF.C.",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "川崎颯太", years: "2020-2026", loan: false },
      { nameJa: "荻原拓也", years: "2021-2022", loan: true },
      { nameJa: "原大智", years: "2023-2025", loan: false },
      { nameJa: "木村誠二", years: "2021", loan: true },
      { nameJa: "喜多壱也", years: "2024-2026", loan: false },
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
      { nameJa: "坂本一彩", years: "2022-2025", loan: false },
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
    slug: "mito-hollyhock",
    name: "水戸ホーリーホック",
    nameEn: "Mito HollyHock",
    article: "水戸ホーリーホック",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "前田大然", years: "2017", loan: true },
      { nameJa: "松田隼風", years: "2022-2025", loan: false },
      { nameJa: "安藤晃希", years: "2026", loan: false },
      { nameJa: "齋藤俊輔", years: "2024-2025", loan: false },
    ],
  },
  {
    slug: "kaa-gent",
    name: "KAAヘント",
    nameEn: "KAA Gent",
    article: "KAAヘント",
    countries: ["BEL"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "橋岡大樹", years: "2026", loan: true },
      { nameJa: "渡辺剛", years: "2023-2025", loan: false },
      { nameJa: "伊藤敦樹", years: "2024-2026", loan: false },
      { nameJa: "横田大祐", years: "2024-2026", loan: false },
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
      { nameJa: "倍井謙", years: "2025", loan: true },
      { nameJa: "古川陽介", years: "2022-2025", loan: false },
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
      { nameJa: "藤本寛也", years: "2018-2022", loan: false },
      { nameJa: "綱島悠斗", years: "2023-2025", loan: false },
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
    slug: "machida-zelvia",
    name: "FC町田ゼルビア",
    nameEn: "FC Machida Zelvia",
    article: "FC町田ゼルビア",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "佐野海舟", years: "2019-2022", loan: false },
      { nameJa: "平河悠", years: "2021-2025", loan: false },
      { nameJa: "宇野禅斗", years: "2022-2024", loan: false },
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
      { nameJa: "坂本一彩", years: "2023", loan: true },
    ],
  },
  {
    slug: "sanfrecce-hiroshima",
    name: "サンフレッチェ広島F.C",
    nameEn: "Sanfrecce Hiroshima",
    article: "サンフレッチェ広島F.C",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "大橋祐紀", years: "2024", loan: false },
      { nameJa: "中村草太", years: "2025-", loan: false },
      { nameJa: "田中聡", years: "2025", loan: false },
    ],
  },
  {
    slug: "albirex-niigata",
    name: "アルビレックス新潟",
    nameEn: "Albirex Niigata",
    article: "アルビレックス新潟",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "三戸舜介", years: "2020-2023", loan: false },
      { nameJa: "荻原拓也", years: "2020", loan: true },
      { nameJa: "秋山裕紀", years: "2019-", loan: false },
    ],
  },
  {
    slug: "v-varen-nagasaki",
    name: "V・ファーレン長崎",
    nameEn: "V-Varen Nagasaki",
    article: "V・ファーレン長崎",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "毎熊晟矢", years: "2020-2021", loan: false },
      { nameJa: "安部大晴", years: "2021-", loan: false },
      { nameJa: "松澤海斗", years: "2023-2025", loan: false },
    ],
  },
  {
    slug: "dusseldorf",
    name: "デュッセルドルフ",
    nameEn: "Düsseldorf",
    article: "デュッセルドルフ",
    countries: ["GER"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "原口元気", years: "2018", loan: true },
      { nameJa: "アペルカンプ真大", years: "2019-2026", loan: false },
      { nameJa: "田中聡", years: "2026", loan: false },
    ],
  },
  {
    slug: "avispa-fukuoka",
    name: "アビスパ福岡",
    nameEn: "Avispa Fukuoka",
    article: "アビスパ福岡",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "冨安健洋", years: "2015-2017", loan: false },
      { nameJa: "安藤智哉", years: "2025", loan: false },
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
    slug: "arminia-bielefeld",
    name: "アルミニア・ビーレフェルト",
    nameEn: "Arminia Bielefeld",
    article: "アルミニア・ビーレフェルト",
    countries: ["GER"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "堂安律", years: "2020-2021", loan: true },
      { nameJa: "水多海斗", years: "2023-2025", loan: false },
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
    slug: "j-league-u-22-selection",
    name: "Jリーグ・アンダー22選抜",
    nameEn: "J.League U-22 Selection",
    article: "Jリーグ・アンダー22選抜",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "板倉滉", years: "2015", loan: true },
      { nameJa: "三好康児", years: "2015", loan: true },
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
    slug: "kortrijk",
    name: "コルトレイク",
    nameEn: "Kortrijk",
    article: "コルトレイク",
    countries: ["BEL"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "渡辺剛", years: "2022-2023", loan: false },
      { nameJa: "田中聡", years: "2022-2023", loan: true },
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
    slug: "shimizu-s-pulse",
    name: "清水エスパルス",
    nameEn: "Shimizu S-Pulse",
    article: "清水エスパルス",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "鈴木唯人", years: "2020-2023", loan: false },
      { nameJa: "宇野禅斗", years: "2024", loan: true },
    ],
  },
  {
    slug: "blackburn-disambiguation",
    name: "ブラックバーン",
    nameEn: "Blackburn (disambiguation)",
    article: "ブラックバーン",
    countries: ["ENG"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "大橋祐紀", years: "2024-", loan: false },
      { nameJa: "森下龍矢", years: "2025-", loan: false },
    ],
  },
  {
    slug: "hanover",
    name: "ハノーファー",
    nameEn: "Hanover",
    article: "ハノーファー",
    countries: ["GER"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "原口元気", years: "2018-2021", loan: false },
      { nameJa: "横田大祐", years: "2025-2026", loan: true },
    ],
  },
  {
    slug: "club-72",
    name: "ベールスホット",
    nameEn: null,
    article: "ベールスホット",
    countries: ["BEL"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "原口元気", years: "2025-", loan: false },
      { nameJa: "倍井謙", years: "2026", loan: true },
    ],
  },
  {
    slug: "oita-trinita",
    name: "大分トリニータ",
    nameEn: "Oita Trinita",
    article: "大分トリニータ",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "岩田智輝", years: "2016-2020", loan: false },
      { nameJa: "安藤智哉", years: "2023-2024", loan: false },
    ],
  },
  {
    slug: "montedio-yamagata",
    name: "モンテディオ山形",
    nameEn: "Montedio Yamagata",
    article: "モンテディオ山形",
    countries: ["JPN"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "坂元達裕", years: "2019", loan: false },
      { nameJa: "木村誠二", years: "2022", loan: true },
    ],
  },
  {
    slug: "le-havre",
    name: "ル・アーヴル",
    nameEn: "Le Havre",
    article: "ル・アーヴル",
    countries: ["FRA"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "瀬古歩夢", years: "2025-", loan: false },
      { nameJa: "中村草太", years: "2026-", loan: true },
    ],
  },
  {
    slug: "gornik-zabrze",
    name: "グールニク・ザブジェ",
    nameEn: "Górnik Zabrze",
    article: "グールニク・ザブジェ",
    countries: ["POL"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "横田大祐", years: "2023-2024", loan: false },
      { nameJa: "古川陽介", years: "2024-2025", loan: true },
    ],
  },
  {
    slug: "club-91",
    name: "ウェステルロー",
    nameEn: null,
    article: "ウェステルロー",
    countries: ["BEL"],
    currentPlayers: [],
    pastPlayers: [
      { nameJa: "齋藤俊輔", years: "2026-", loan: false },
      { nameJa: "坂本一彩", years: "2025", loan: true },
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
