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
export const seasonTakenAt = "2026-08-30";

export const seasonStats: SeasonStat[] = [
  { slug: "ayase-ueda", apps: 3, goals: 2, division: "Eredivisie", updatedAt: "2026-08-16", source: "Ayase Ueda" },
  { slug: "daiki-matsuoka", apps: 4, goals: 1, division: "Slovak First Football League", updatedAt: "2026-08-22", source: "Daiki Matsuoka" },
  { slug: "ayumu-yokoyama", apps: 3, goals: 1, division: "Belgian Pro League", updatedAt: "2026-08-22", source: "Ayumu Yokoyama" },
  { slug: "ryuya-morishita", apps: 3, goals: 1, division: "Championship", updatedAt: "2026-08-29", source: "Ryōya Morishita" },
  { slug: "sota-kitano", apps: 2, goals: 1, division: "Austrian Bundesliga", updatedAt: "2026-08-27", source: "Sōta Kitano" },
  { slug: "taichi-hara", apps: 2, goals: 1, division: "2. Bundesliga", updatedAt: "2026-08-23", source: "Taichi Hara" },
  { slug: "koki-saito", apps: 1, goals: 1, division: "EFL Championship", updatedAt: "2026-08-15", source: "Kōki Saitō (footballer)" },
  { slug: "junnosuke-suzuki", apps: 4, goals: 0, division: "Danish Superliga", updatedAt: "2026-08-27", source: "Junnosuke Suzuki" },
  { slug: "junya-ito", apps: 3, goals: 0, division: "Belgian Pro League", updatedAt: "2026-08-22", source: "Junya Itō" },
  { slug: "kuryu-matsuki", apps: 3, goals: 0, division: "Championship", updatedAt: "2026-08-29", source: "Kuryu Matsuki" },
  { slug: "shunsuke-mito", apps: 3, goals: 0, division: "Eredivisie", updatedAt: "2026-08-22", source: "Shunsuke Mito" },
  { slug: "takefusa-kubo", apps: 3, goals: 0, division: "La Liga", updatedAt: "2026-08-29", source: "Takefusa Kubo" },
  { slug: "yuki-kobayashi", apps: 3, goals: 0, division: "Ekstraklasa", updatedAt: "2026-08-27", source: "Yuki Kobayashi (footballer, born 2000)" },
  { slug: "daichi-kamada", apps: 2, goals: 0, division: "Premier League", updatedAt: "2026-08-22", source: "Daichi Kamada" },
  { slug: "joel-chima-fujita", apps: 2, goals: 0, division: "2. Bundesliga", updatedAt: "2026-08-23", source: "Joel Chima Fujita" },
  { slug: "kento-shiogai", apps: 2, goals: 0, division: "2. Bundesliga", updatedAt: "2026-08-24", source: "Kento Shiogai" },
  { slug: "kodai-sano", apps: 2, goals: 0, division: "Eredivisie", updatedAt: "2026-08-23", source: "Kodai Sano (footballer)" },
  { slug: "koji-miyoshi", apps: 2, goals: 0, division: null, updatedAt: "2026-08-23", source: "Kōji Miyoshi" },
  { slug: "rento-takaoka", apps: 2, goals: 0, division: "Challenger Pro League", updatedAt: "2026-08-22", source: "Rento Takaoka" },
  { slug: "seiya-maikuma", apps: 2, goals: 0, division: "Eredivisie", updatedAt: "2026-08-22", source: "Seiya Maikuma" },
  { slug: "takehiro-tomiyasu", apps: 2, goals: 0, division: "Premier League", updatedAt: "2026-08-28", source: "Takehiro Tomiyasu" },
  { slug: "tomoya-ando", apps: 2, goals: 0, division: "2. Bundesliga", updatedAt: "2026-08-23", source: "Tomoya Ando" },
  { slug: "yuki-ohashi", apps: 2, goals: 0, division: "Championship", updatedAt: "2026-08-25", source: "Yūki Ōhashi" },
  { slug: "ayumu-seko", apps: 1, goals: 0, division: null, updatedAt: "2026-08-23", source: "Ayumu Seko" },
  { slug: "daizen-maeda", apps: 1, goals: 0, division: "Premier League", updatedAt: "2026-08-25", source: "Daizen Maeda" },
  { slug: "kaito-mizuta", apps: 1, goals: 0, division: "Ligue 1", updatedAt: "2026-08-23", source: "Kaito Mizuta" },
  { slug: "nikki-havenaar", apps: 1, goals: 0, division: "Belgian Pro League", updatedAt: "2026-08-15", source: "Nikki Havenaar" },
  { slug: "rion-ichihara", apps: 1, goals: 0, division: "Eredivisie", updatedAt: "2026-08-15", source: "Rion Ichihara" },
  { slug: "sota-nakamura", apps: 1, goals: 0, division: "Ligue 1", updatedAt: "2026-08-23", source: "Sōta Nakamura" },
  { slug: "tatsuhiro-sakamoto", apps: 1, goals: 0, division: "Premier League", updatedAt: "2026-08-29", source: "Tatsuhiro Sakamoto" },
  { slug: "tsuyoshi-watanabe", apps: 1, goals: 0, division: "Eredivisie", updatedAt: "2026-08-16", source: "Tsuyoshi Watanabe" },
  { slug: "ao-tanaka", apps: 0, goals: 0, division: "Premier League", updatedAt: "2026-08-25", source: "Ao Tanaka" },
  { slug: "atsuki-ito", apps: 0, goals: 0, division: "EFL Championship", updatedAt: "2026-05-31", source: "Atsuki Itō" },
  { slug: "daiki-hashioka", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-08-23", source: "Daiki Hashioka" },
  { slug: "hidemasa-morita", apps: 0, goals: 0, division: "Premier League", updatedAt: "2026-08-25", source: "Hidemasa Morita" },
  { slug: "hiroki-ito", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-05-23", source: "Hiroki Itō (footballer, born 1999)" },
  { slug: "kaishu-sano", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-08-23", source: "Kaishū Sano" },
  { slug: "kazunari-kita", apps: 0, goals: 0, division: "Segunda División", updatedAt: "2026-05-24", source: "Kazunari Kita" },
  { slug: "keisuke-goto", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-08-27", source: "Keisuke Gotō" },
  { slug: "keita-kosugi", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-08-21", source: "Keita Kosugi" },
  { slug: "koki-ando", apps: 0, goals: 0, division: "Belgian Pro League", updatedAt: "2026-05-30", source: "Koki Ando (footballer)" },
  { slug: "kou-itakura", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-08-23", source: "Kō Itakura" },
  { slug: "mio-backhaus", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-08-27", source: "Mio Backhaus" },
  { slug: "reo-hatate", apps: 0, goals: 0, division: null, updatedAt: "2026-08-25", source: "Reo Hatate" },
  { slug: "rihito-yamamoto", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-05-24", source: "Rihito Yamamoto" },
  { slug: "ryotaro-araki", apps: 0, goals: 0, division: "Belgian Pro League", updatedAt: "2026-08-20", source: "Ryōtarō Araki" },
  { slug: "ryunosuke-sato", apps: 0, goals: 0, division: "La Liga", updatedAt: "2026-03-06", source: "Ryūnosuke Satō" },
  { slug: "satoshi-tanaka", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-08-24", source: "Satoshi Tanaka" },
  { slug: "shiou-fukuda", apps: 0, goals: 0, division: "2. Bundesliga", updatedAt: "2026-05-17", source: "Shiō Fukuda" },
  { slug: "shuto-machino", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-08-23", source: "Shūto Machino" },
  { slug: "sota-kawasaki", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-04-16", source: "Sōta Kawasaki" },
  { slug: "yuito-suzuki", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-08-27", source: "Yuito Suzuki" },
  { slug: "yukinari-sugawara", apps: 0, goals: 0, division: "Championship", updatedAt: "2026-05-09", source: "Yukinari Sugawara" },
  { slug: "zento-uno", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-05-24", source: "Zento Uno" },
  { slug: "zion-suzuki", apps: 0, goals: 0, division: "Premier League", updatedAt: "2026-05-17", source: "Zion Suzuki" },
];

export const seasonStatMap = Object.fromEntries(seasonStats.map((s) => [s.slug, s]));
