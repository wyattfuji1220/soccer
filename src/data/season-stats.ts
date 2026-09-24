import type { SeasonStat } from "@/lib/types";

/**
 * このファイルは scripts/generate-season-stats.mjs が生成する。直接編集しないこと。
 *
 * 2026-27 シーズンのリーグ戦の記録。英語版Wikipediaの選手記事にある
 * 「Career statistics」表から、今季の行だけを取り出している。
 * カップ戦・欧州カップ・代表戦は含まない。
 *
 * updatedAt はその表が自己申告している更新時点。載っていない選手は、
 * まだ今季の行が書かれていないということで、0試合という意味ではない。
 */
export const season = "2026-27";
export const seasonTakenAt = "2026-09-24";

export const seasonStats: SeasonStat[] = [
  { slug: "yuito-suzuki", apps: 7, goals: 4, division: "Bundesliga", updatedAt: "2026-09-19", source: "Yuito Suzuki" },
  { slug: "taichi-hara", apps: 7, goals: 3, division: "2. Bundesliga", updatedAt: "2026-09-20", source: "Taichi Hara" },
  { slug: "ayase-ueda", apps: 4, goals: 3, division: "Eredivisie", updatedAt: "2026-09-20", source: "Ayase Ueda" },
  { slug: "ryuya-morishita", apps: 8, goals: 2, division: "Championship", updatedAt: "2026-09-19", source: "Ryōya Morishita" },
  { slug: "daiki-matsuoka", apps: 6, goals: 2, division: "Slovak First Football League", updatedAt: "2026-09-05", source: "Daiki Matsuoka" },
  { slug: "koji-miyoshi", apps: 4, goals: 2, division: null, updatedAt: "2026-08-28", source: "Kōji Miyoshi" },
  { slug: "kuryu-matsuki", apps: 8, goals: 1, division: "Championship", updatedAt: "2026-09-19", source: "Kuryu Matsuki" },
  { slug: "kodai-sano", apps: 5, goals: 1, division: "Eredivisie", updatedAt: "2026-09-13", source: "Kodai Sano (footballer)" },
  { slug: "nelson-yuichiro-ishiwatari", apps: 5, goals: 1, division: "Belgian Pro League", updatedAt: "2026-09-06", source: "Nelson Ishiwatari" },
  { slug: "sota-kitano", apps: 5, goals: 1, division: "Austrian Bundesliga", updatedAt: "2026-09-17", source: "Sōta Kitano" },
  { slug: "yu-hirakawa", apps: 5, goals: 1, division: "EFL Championship", updatedAt: "2026-09-05", source: "Yū Hirakawa" },
  { slug: "yuki-kobayashi", apps: 5, goals: 1, division: "Ekstraklasa", updatedAt: "2026-09-03", source: "Yuki Kobayashi (footballer, born 2000)" },
  { slug: "ayumu-yokoyama", apps: 4, goals: 1, division: "Belgian Pro League", updatedAt: "2026-08-28", source: "Ayumu Yokoyama" },
  { slug: "joel-chima-fujita", apps: 4, goals: 1, division: "2. Bundesliga", updatedAt: "2026-09-20", source: "Joel Chima Fujita" },
  { slug: "junya-ito", apps: 4, goals: 1, division: "Belgian Pro League", updatedAt: "2026-08-28", source: "Junya Itō" },
  { slug: "ryotaro-araki", apps: 4, goals: 1, division: "Belgian Pro League", updatedAt: "2026-09-12", source: "Ryōtarō Araki" },
  { slug: "ao-tanaka", apps: 3, goals: 1, division: "Premier League", updatedAt: "2026-09-14", source: "Ao Tanaka" },
  { slug: "yuta-nakayama", apps: 3, goals: 1, division: "J1 League", updatedAt: "2026-09-17", source: "Yūta Nakayama" },
  { slug: "koki-saito", apps: 2, goals: 1, division: "EFL Championship", updatedAt: "2026-08-29", source: "Kōki Saitō (footballer)" },
  { slug: "shuto-machino", apps: 2, goals: 1, division: "Bundesliga", updatedAt: "2026-09-19", source: "Shūto Machino" },
  { slug: "shinnosuke-fukuda", apps: 13, goals: 0, division: "J1 100 Year Vision League", updatedAt: "2026-08-29", source: "Shinnosuke Fukuda" },
  { slug: "junnosuke-suzuki", apps: 8, goals: 0, division: "Danish Superliga", updatedAt: "2026-09-15", source: "Junnosuke Suzuki" },
  { slug: "sho-fukuda", apps: 6, goals: 0, division: "Danish Superliga", updatedAt: "2026-09-17", source: "Shō Fukuda" },
  { slug: "ayumu-seko", apps: 5, goals: 0, division: null, updatedAt: "2026-09-19", source: "Ayumu Seko" },
  { slug: "daichi-kamada", apps: 5, goals: 0, division: "Premier League", updatedAt: "2026-09-20", source: "Daichi Kamada" },
  { slug: "kento-shiogai", apps: 5, goals: 0, division: "2. Bundesliga", updatedAt: "2026-09-12", source: "Kento Shiogai" },
  { slug: "sota-nakamura", apps: 5, goals: 0, division: "Ligue 1", updatedAt: "2026-09-19", source: "Sōta Nakamura" },
  { slug: "takefusa-kubo", apps: 5, goals: 0, division: "La Liga", updatedAt: "2026-09-17", source: "Takefusa Kubo" },
  { slug: "tomoya-ando", apps: 5, goals: 0, division: "2. Bundesliga", updatedAt: "2026-09-20", source: "Tomoya Ando" },
  { slug: "genki-haraguchi", apps: 4, goals: 0, division: "Challenger Pro League", updatedAt: "2026-09-06", source: "Genki Haraguchi" },
  { slug: "kaishu-sano", apps: 4, goals: 0, division: "Bundesliga", updatedAt: "2026-09-19", source: "Kaishū Sano" },
  { slug: "keisuke-goto", apps: 4, goals: 0, division: "Bundesliga", updatedAt: "2026-09-19", source: "Keisuke Gotō" },
  { slug: "keita-kosugi", apps: 4, goals: 0, division: "Bundesliga", updatedAt: "2026-09-19", source: "Keita Kosugi" },
  { slug: "kou-itakura", apps: 4, goals: 0, division: "Bundesliga", updatedAt: "2026-09-19", source: "Kō Itakura" },
  { slug: "mio-backhaus", apps: 4, goals: 0, division: "Bundesliga", updatedAt: "2026-09-19", source: "Mio Backhaus" },
  { slug: "nikki-havenaar", apps: 4, goals: 0, division: "Belgian Pro League", updatedAt: "2026-09-17", source: "Nikki Havenaar" },
  { slug: "seiya-maikuma", apps: 4, goals: 0, division: "Eredivisie", updatedAt: "2026-09-06", source: "Seiya Maikuma" },
  { slug: "takuya-ogiwara", apps: 4, goals: 0, division: "Belgian Pro League", updatedAt: "2026-09-07", source: "Takuya Ogiwara" },
  { slug: "tsuyoshi-watanabe", apps: 4, goals: 0, division: "Eredivisie", updatedAt: "2026-09-09", source: "Tsuyoshi Watanabe" },
  { slug: "zion-suzuki", apps: 4, goals: 0, division: "Premier League", updatedAt: "2026-09-19", source: "Zion Suzuki" },
  { slug: "kaito-mizuta", apps: 3, goals: 0, division: "Ligue 1", updatedAt: "2026-09-12", source: "Kaito Mizuta" },
  { slug: "koki-ando", apps: 3, goals: 0, division: "Belgian Division 2", updatedAt: "2026-09-12", source: "Koki Ando (footballer)" },
  { slug: "ritsu-doan", apps: 3, goals: 0, division: "Bundesliga", updatedAt: "2026-09-19", source: "Ritsu Dōan" },
  { slug: "shunsuke-mito", apps: 3, goals: 0, division: "Eredivisie", updatedAt: "2026-08-22", source: "Shunsuke Mito" },
  { slug: "takehiro-tomiyasu", apps: 3, goals: 0, division: "Premier League", updatedAt: "2026-09-20", source: "Takehiro Tomiyasu" },
  { slug: "daiki-hashioka", apps: 2, goals: 0, division: "Bundesliga", updatedAt: "2026-09-19", source: "Daiki Hashioka" },
  { slug: "keito-nakamura", apps: 2, goals: 0, division: "Ligue 1", updatedAt: "2026-09-19", source: "Keito Nakamura" },
  { slug: "koki-machida", apps: 2, goals: 0, division: "Bundesliga", updatedAt: "2026-09-20", source: "Kōki Machida" },
  { slug: "satoshi-tanaka", apps: 2, goals: 0, division: "Bundesliga", updatedAt: "2026-09-11", source: "Satoshi Tanaka" },
  { slug: "yuki-ohashi", apps: 2, goals: 0, division: "Championship", updatedAt: "2026-08-25", source: "Yūki Ōhashi" },
  { slug: "daizen-maeda", apps: 1, goals: 0, division: "Premier League", updatedAt: "2026-08-25", source: "Daizen Maeda" },
  { slug: "rion-ichihara", apps: 1, goals: 0, division: "Eredivisie", updatedAt: "2026-09-15", source: "Rion Ichihara" },
  { slug: "tatsuhiro-sakamoto", apps: 1, goals: 0, division: "Premier League", updatedAt: "2026-09-16", source: "Tatsuhiro Sakamoto" },
  { slug: "atsuki-ito", apps: 0, goals: 0, division: "EFL Championship", updatedAt: "2026-05-31", source: "Atsuki Itō" },
  { slug: "hidemasa-morita", apps: 0, goals: 0, division: "Premier League", updatedAt: "2026-08-25", source: "Hidemasa Morita" },
  { slug: "hiroki-ito", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-09-10", source: "Hiroki Itō (footballer, born 1999)" },
  { slug: "kazunari-kita", apps: 0, goals: 0, division: "Segunda División", updatedAt: "2026-05-24", source: "Kazunari Kita" },
  { slug: "kota-takai", apps: 0, goals: 0, division: "Belgian Pro League", updatedAt: "2026-04-25", source: "Kōta Takai" },
  { slug: "reo-hatate", apps: 0, goals: 0, division: null, updatedAt: "2026-08-25", source: "Reo Hatate" },
  { slug: "rihito-yamamoto", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-05-24", source: "Rihito Yamamoto" },
  { slug: "ryunosuke-sato", apps: 0, goals: 0, division: "La Liga", updatedAt: "2026-03-06", source: "Ryūnosuke Satō" },
  { slug: "shiou-fukuda", apps: 0, goals: 0, division: "2. Bundesliga", updatedAt: "2026-05-17", source: "Shiō Fukuda" },
  { slug: "sota-kawasaki", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-04-16", source: "Sōta Kawasaki" },
  { slug: "yukinari-sugawara", apps: 0, goals: 0, division: "Championship", updatedAt: "2026-09-19", source: "Yukinari Sugawara" },
  { slug: "zento-uno", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-05-24", source: "Zento Uno" },
];

export const seasonStatMap = Object.fromEntries(seasonStats.map((s) => [s.slug, s]));
