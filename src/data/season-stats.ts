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
export const seasonTakenAt = "2026-09-05";

export const seasonStats: SeasonStat[] = [
  { slug: "ayase-ueda", apps: 4, goals: 3, division: "Eredivisie", updatedAt: "2026-09-03", source: "Ayase Ueda" },
  { slug: "yuito-suzuki", apps: 1, goals: 3, division: "Bundesliga", updatedAt: "2026-08-30", source: "Yuito Suzuki" },
  { slug: "daiki-matsuoka", apps: 5, goals: 2, division: "Slovak First Football League", updatedAt: "2026-08-30", source: "Daiki Matsuoka" },
  { slug: "ayumu-yokoyama", apps: 4, goals: 1, division: "Belgian Pro League", updatedAt: "2026-08-28", source: "Ayumu Yokoyama" },
  { slug: "junya-ito", apps: 4, goals: 1, division: "Belgian Pro League", updatedAt: "2026-08-28", source: "Junya Itō" },
  { slug: "ryuya-morishita", apps: 4, goals: 1, division: "Championship", updatedAt: "2026-09-01", source: "Ryōya Morishita" },
  { slug: "sota-kitano", apps: 4, goals: 1, division: "Austrian Bundesliga", updatedAt: "2026-09-02", source: "Sōta Kitano" },
  { slug: "taichi-hara", apps: 3, goals: 1, division: "2. Bundesliga", updatedAt: "2026-08-30", source: "Taichi Hara" },
  { slug: "koki-saito", apps: 2, goals: 1, division: "EFL Championship", updatedAt: "2026-08-29", source: "Kōki Saitō (footballer)" },
  { slug: "ryotaro-araki", apps: 1, goals: 1, division: "Belgian Pro League", updatedAt: "2026-08-30", source: "Ryōtarō Araki" },
  { slug: "shinnosuke-fukuda", apps: 13, goals: 0, division: "J1 100 Year Vision League", updatedAt: "2026-08-29", source: "Shinnosuke Fukuda" },
  { slug: "junnosuke-suzuki", apps: 6, goals: 0, division: "Danish Superliga", updatedAt: "2026-09-03", source: "Junnosuke Suzuki" },
  { slug: "kuryu-matsuki", apps: 5, goals: 0, division: "Championship", updatedAt: "2026-09-05", source: "Kuryu Matsuki" },
  { slug: "takefusa-kubo", apps: 4, goals: 0, division: "La Liga", updatedAt: "2026-09-03", source: "Takefusa Kubo" },
  { slug: "kento-shiogai", apps: 3, goals: 0, division: "2. Bundesliga", updatedAt: "2026-08-29", source: "Kento Shiogai" },
  { slug: "koji-miyoshi", apps: 3, goals: 0, division: null, updatedAt: "2026-08-28", source: "Kōji Miyoshi" },
  { slug: "rento-takaoka", apps: 3, goals: 0, division: "Challenger Pro League", updatedAt: "2026-08-29", source: "Rento Takaoka" },
  { slug: "shunsuke-mito", apps: 3, goals: 0, division: "Eredivisie", updatedAt: "2026-08-22", source: "Shunsuke Mito" },
  { slug: "tomoya-ando", apps: 3, goals: 0, division: "2. Bundesliga", updatedAt: "2026-08-30", source: "Tomoya Ando" },
  { slug: "yuki-kobayashi", apps: 3, goals: 0, division: "Ekstraklasa", updatedAt: "2026-08-27", source: "Yuki Kobayashi (footballer, born 2000)" },
  { slug: "ayumu-seko", apps: 2, goals: 0, division: null, updatedAt: "2026-08-29", source: "Ayumu Seko" },
  { slug: "daichi-kamada", apps: 2, goals: 0, division: "Premier League", updatedAt: "2026-08-22", source: "Daichi Kamada" },
  { slug: "joel-chima-fujita", apps: 2, goals: 0, division: "2. Bundesliga", updatedAt: "2026-08-23", source: "Joel Chima Fujita" },
  { slug: "kaito-mizuta", apps: 2, goals: 0, division: "Ligue 1", updatedAt: "2026-08-29", source: "Kaito Mizuta" },
  { slug: "kodai-sano", apps: 2, goals: 0, division: "Eredivisie", updatedAt: "2026-08-23", source: "Kodai Sano (footballer)" },
  { slug: "nikki-havenaar", apps: 2, goals: 0, division: "Belgian Pro League", updatedAt: "2026-08-30", source: "Nikki Havenaar" },
  { slug: "seiya-maikuma", apps: 2, goals: 0, division: "Eredivisie", updatedAt: "2026-08-22", source: "Seiya Maikuma" },
  { slug: "sota-nakamura", apps: 2, goals: 0, division: "Ligue 1", updatedAt: "2026-08-29", source: "Sōta Nakamura" },
  { slug: "takehiro-tomiyasu", apps: 2, goals: 0, division: "Premier League", updatedAt: "2026-08-28", source: "Takehiro Tomiyasu" },
  { slug: "yuki-ohashi", apps: 2, goals: 0, division: "Championship", updatedAt: "2026-08-25", source: "Yūki Ōhashi" },
  { slug: "daiki-hashioka", apps: 1, goals: 0, division: "Bundesliga", updatedAt: "2026-08-30", source: "Daiki Hashioka" },
  { slug: "daizen-maeda", apps: 1, goals: 0, division: "Premier League", updatedAt: "2026-08-25", source: "Daizen Maeda" },
  { slug: "kaishu-sano", apps: 1, goals: 0, division: "Bundesliga", updatedAt: "2026-08-29", source: "Kaishū Sano" },
  { slug: "keita-kosugi", apps: 1, goals: 0, division: "Bundesliga", updatedAt: "2026-08-29", source: "Keita Kosugi" },
  { slug: "kou-itakura", apps: 1, goals: 0, division: "Bundesliga", updatedAt: "2026-08-29", source: "Kō Itakura" },
  { slug: "mio-backhaus", apps: 1, goals: 0, division: "Bundesliga", updatedAt: "2026-08-30", source: "Mio Backhaus" },
  { slug: "rion-ichihara", apps: 1, goals: 0, division: "Eredivisie", updatedAt: "2026-08-15", source: "Rion Ichihara" },
  { slug: "tatsuhiro-sakamoto", apps: 1, goals: 0, division: "Premier League", updatedAt: "2026-08-29", source: "Tatsuhiro Sakamoto" },
  { slug: "tsuyoshi-watanabe", apps: 1, goals: 0, division: "Eredivisie", updatedAt: "2026-08-16", source: "Tsuyoshi Watanabe" },
  { slug: "zion-suzuki", apps: 1, goals: 0, division: "Premier League", updatedAt: "2026-08-31", source: "Zion Suzuki" },
  { slug: "ao-tanaka", apps: 0, goals: 0, division: "Premier League", updatedAt: "2026-08-25", source: "Ao Tanaka" },
  { slug: "atsuki-ito", apps: 0, goals: 0, division: "EFL Championship", updatedAt: "2026-05-31", source: "Atsuki Itō" },
  { slug: "hidemasa-morita", apps: 0, goals: 0, division: "Premier League", updatedAt: "2026-08-25", source: "Hidemasa Morita" },
  { slug: "hiroki-ito", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-05-23", source: "Hiroki Itō (footballer, born 1999)" },
  { slug: "kazunari-kita", apps: 0, goals: 0, division: "Segunda División", updatedAt: "2026-05-24", source: "Kazunari Kita" },
  { slug: "keisuke-goto", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-08-27", source: "Keisuke Gotō" },
  { slug: "koki-ando", apps: 0, goals: 0, division: "Belgian Pro League", updatedAt: "2026-05-30", source: "Koki Ando (footballer)" },
  { slug: "kota-takai", apps: 0, goals: 0, division: "Belgian Pro League", updatedAt: "2026-04-25", source: "Kōta Takai" },
  { slug: "reo-hatate", apps: 0, goals: 0, division: null, updatedAt: "2026-08-25", source: "Reo Hatate" },
  { slug: "rihito-yamamoto", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-05-24", source: "Rihito Yamamoto" },
  { slug: "ryunosuke-sato", apps: 0, goals: 0, division: "La Liga", updatedAt: "2026-03-06", source: "Ryūnosuke Satō" },
  { slug: "satoshi-tanaka", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-08-24", source: "Satoshi Tanaka" },
  { slug: "shiou-fukuda", apps: 0, goals: 0, division: "2. Bundesliga", updatedAt: "2026-05-17", source: "Shiō Fukuda" },
  { slug: "shuto-machino", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-08-23", source: "Shūto Machino" },
  { slug: "sota-kawasaki", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-04-16", source: "Sōta Kawasaki" },
  { slug: "yukinari-sugawara", apps: 0, goals: 0, division: "Championship", updatedAt: "2026-05-09", source: "Yukinari Sugawara" },
  { slug: "zento-uno", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-05-24", source: "Zento Uno" },
];

export const seasonStatMap = Object.fromEntries(seasonStats.map((s) => [s.slug, s]));
