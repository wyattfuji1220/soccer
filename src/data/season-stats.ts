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
export const seasonTakenAt = "2026-09-14";

export const seasonStats: SeasonStat[] = [
  { slug: "ayase-ueda", apps: 4, goals: 3, division: "Eredivisie", updatedAt: "2026-09-08", source: "Ayase Ueda" },
  { slug: "yuito-suzuki", apps: 2, goals: 3, division: "Bundesliga", updatedAt: "2026-09-05", source: "Yuito Suzuki" },
  { slug: "daiki-matsuoka", apps: 6, goals: 2, division: "Slovak First Football League", updatedAt: "2026-09-05", source: "Daiki Matsuoka" },
  { slug: "koji-miyoshi", apps: 4, goals: 2, division: null, updatedAt: "2026-08-28", source: "Kōji Miyoshi" },
  { slug: "taichi-hara", apps: 4, goals: 2, division: "2. Bundesliga", updatedAt: "2026-08-30", source: "Taichi Hara" },
  { slug: "kuryu-matsuki", apps: 7, goals: 1, division: "Championship", updatedAt: "2026-09-12", source: "Kuryu Matsuki" },
  { slug: "kodai-sano", apps: 5, goals: 1, division: "Eredivisie", updatedAt: "2026-09-13", source: "Kodai Sano (footballer)" },
  { slug: "nelson-ishiwatari", apps: 5, goals: 1, division: "Belgian Pro League", updatedAt: "2026-09-06", source: "Nelson Ishiwatari" },
  { slug: "yu-hirakawa", apps: 5, goals: 1, division: "EFL Championship", updatedAt: "2026-09-05", source: "Yū Hirakawa" },
  { slug: "ayumu-yokoyama", apps: 4, goals: 1, division: "Belgian Pro League", updatedAt: "2026-08-28", source: "Ayumu Yokoyama" },
  { slug: "junya-ito", apps: 4, goals: 1, division: "Belgian Pro League", updatedAt: "2026-08-28", source: "Junya Itō" },
  { slug: "ryotaro-araki", apps: 4, goals: 1, division: "Belgian Pro League", updatedAt: "2026-09-12", source: "Ryōtarō Araki" },
  { slug: "ryuya-morishita", apps: 4, goals: 1, division: "Championship", updatedAt: "2026-09-01", source: "Ryōya Morishita" },
  { slug: "sota-kitano", apps: 4, goals: 1, division: "Austrian Bundesliga", updatedAt: "2026-09-02", source: "Sōta Kitano" },
  { slug: "koki-saito", apps: 2, goals: 1, division: "EFL Championship", updatedAt: "2026-08-29", source: "Kōki Saitō (footballer)" },
  { slug: "shinnosuke-fukuda", apps: 13, goals: 0, division: "J1 100 Year Vision League", updatedAt: "2026-08-29", source: "Shinnosuke Fukuda" },
  { slug: "junnosuke-suzuki", apps: 6, goals: 0, division: "Danish Superliga", updatedAt: "2026-09-03", source: "Junnosuke Suzuki" },
  { slug: "takefusa-kubo", apps: 5, goals: 0, division: "La Liga", updatedAt: "2026-09-13", source: "Takefusa Kubo" },
  { slug: "ayumu-seko", apps: 4, goals: 0, division: null, updatedAt: "2026-09-12", source: "Ayumu Seko" },
  { slug: "genki-haraguchi", apps: 4, goals: 0, division: "Challenger Pro League", updatedAt: "2026-09-06", source: "Genki Haraguchi" },
  { slug: "rento-takaoka", apps: 4, goals: 0, division: "Challenger Pro League", updatedAt: "2026-09-04", source: "Rento Takaoka" },
  { slug: "sota-nakamura", apps: 4, goals: 0, division: "Ligue 1", updatedAt: "2026-09-12", source: "Sōta Nakamura" },
  { slug: "takuya-ogiwara", apps: 4, goals: 0, division: "Belgian Pro League", updatedAt: "2026-09-07", source: "Takuya Ogiwara" },
  { slug: "tsuyoshi-watanabe", apps: 4, goals: 0, division: "Eredivisie", updatedAt: "2026-09-09", source: "Tsuyoshi Watanabe" },
  { slug: "daichi-kamada", apps: 3, goals: 0, division: "Premier League", updatedAt: "2026-09-08", source: "Daichi Kamada" },
  { slug: "kaito-mizuta", apps: 3, goals: 0, division: "Ligue 1", updatedAt: "2026-09-12", source: "Kaito Mizuta" },
  { slug: "kento-shiogai", apps: 3, goals: 0, division: "2. Bundesliga", updatedAt: "2026-08-29", source: "Kento Shiogai" },
  { slug: "koki-ando", apps: 3, goals: 0, division: "Belgian Division 2", updatedAt: "2026-09-12", source: "Koki Ando (footballer)" },
  { slug: "shunsuke-mito", apps: 3, goals: 0, division: "Eredivisie", updatedAt: "2026-08-22", source: "Shunsuke Mito" },
  { slug: "tomoya-ando", apps: 3, goals: 0, division: "2. Bundesliga", updatedAt: "2026-08-30", source: "Tomoya Ando" },
  { slug: "yuki-kobayashi", apps: 3, goals: 0, division: "Ekstraklasa", updatedAt: "2026-08-27", source: "Yuki Kobayashi (footballer, born 2000)" },
  { slug: "zion-suzuki", apps: 3, goals: 0, division: "Premier League", updatedAt: "2026-09-12", source: "Zion Suzuki" },
  { slug: "joel-chima-fujita", apps: 2, goals: 0, division: "2. Bundesliga", updatedAt: "2026-08-23", source: "Joel Chima Fujita" },
  { slug: "kaishu-sano", apps: 2, goals: 0, division: "Bundesliga", updatedAt: "2026-09-06", source: "Kaishū Sano" },
  { slug: "keisuke-goto", apps: 2, goals: 0, division: "Bundesliga", updatedAt: "2026-09-05", source: "Keisuke Gotō" },
  { slug: "keita-kosugi", apps: 2, goals: 0, division: "Bundesliga", updatedAt: "2026-09-06", source: "Keita Kosugi" },
  { slug: "kou-itakura", apps: 2, goals: 0, division: "Bundesliga", updatedAt: "2026-09-05", source: "Kō Itakura" },
  { slug: "nikki-havenaar", apps: 2, goals: 0, division: "Belgian Pro League", updatedAt: "2026-08-30", source: "Nikki Havenaar" },
  { slug: "seiya-maikuma", apps: 2, goals: 0, division: "Eredivisie", updatedAt: "2026-08-22", source: "Seiya Maikuma" },
  { slug: "takehiro-tomiyasu", apps: 2, goals: 0, division: "Premier League", updatedAt: "2026-08-28", source: "Takehiro Tomiyasu" },
  { slug: "yuki-ohashi", apps: 2, goals: 0, division: "Championship", updatedAt: "2026-08-25", source: "Yūki Ōhashi" },
  { slug: "daiki-hashioka", apps: 1, goals: 0, division: "Bundesliga", updatedAt: "2026-08-30", source: "Daiki Hashioka" },
  { slug: "daizen-maeda", apps: 1, goals: 0, division: "Premier League", updatedAt: "2026-08-25", source: "Daizen Maeda" },
  { slug: "keito-nakamura", apps: 1, goals: 0, division: "Ligue 1", updatedAt: "2026-09-12", source: "Keito Nakamura" },
  { slug: "mio-backhaus", apps: 1, goals: 0, division: "Bundesliga", updatedAt: "2026-08-30", source: "Mio Backhaus" },
  { slug: "rion-ichihara", apps: 1, goals: 0, division: "Eredivisie", updatedAt: "2026-08-15", source: "Rion Ichihara" },
  { slug: "ritsu-doan", apps: 1, goals: 0, division: "Bundesliga", updatedAt: "2026-09-06", source: "Ritsu Dōan" },
  { slug: "satoshi-tanaka", apps: 1, goals: 0, division: "Bundesliga", updatedAt: "2026-09-06", source: "Satoshi Tanaka" },
  { slug: "tatsuhiro-sakamoto", apps: 1, goals: 0, division: "Premier League", updatedAt: "2026-08-29", source: "Tatsuhiro Sakamoto" },
  { slug: "ao-tanaka", apps: 0, goals: 0, division: "Premier League", updatedAt: "2026-08-25", source: "Ao Tanaka" },
  { slug: "atsuki-ito", apps: 0, goals: 0, division: "EFL Championship", updatedAt: "2026-05-31", source: "Atsuki Itō" },
  { slug: "hidemasa-morita", apps: 0, goals: 0, division: "Premier League", updatedAt: "2026-08-25", source: "Hidemasa Morita" },
  { slug: "hiroki-ito", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-09-10", source: "Hiroki Itō (footballer, born 1999)" },
  { slug: "kazunari-kita", apps: 0, goals: 0, division: "Segunda División", updatedAt: "2026-05-24", source: "Kazunari Kita" },
  { slug: "kota-takai", apps: 0, goals: 0, division: "Belgian Pro League", updatedAt: "2026-04-25", source: "Kōta Takai" },
  { slug: "reo-hatate", apps: 0, goals: 0, division: null, updatedAt: "2026-08-25", source: "Reo Hatate" },
  { slug: "rihito-yamamoto", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-05-24", source: "Rihito Yamamoto" },
  { slug: "ryunosuke-sato", apps: 0, goals: 0, division: "La Liga", updatedAt: "2026-03-06", source: "Ryūnosuke Satō" },
  { slug: "shiou-fukuda", apps: 0, goals: 0, division: "2. Bundesliga", updatedAt: "2026-05-17", source: "Shiō Fukuda" },
  { slug: "shuto-machino", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-08-23", source: "Shūto Machino" },
  { slug: "sota-kawasaki", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-04-16", source: "Sōta Kawasaki" },
  { slug: "yukinari-sugawara", apps: 0, goals: 0, division: "Championship", updatedAt: "2026-09-12", source: "Yukinari Sugawara" },
  { slug: "zento-uno", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-05-24", source: "Zento Uno" },
];

export const seasonStatMap = Object.fromEntries(seasonStats.map((s) => [s.slug, s]));
