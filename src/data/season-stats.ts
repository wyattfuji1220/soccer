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
export const seasonTakenAt = "2026-10-17";

export const seasonStats: SeasonStat[] = [
  { slug: "yuito-suzuki", apps: 5, goals: 4, division: "Bundesliga", updatedAt: "2026-10-15", source: "Yuito Suzuki" },
  { slug: "taichi-hara", apps: 7, goals: 3, division: "2. Bundesliga", updatedAt: "2026-09-20", source: "Taichi Hara" },
  { slug: "ayase-ueda", apps: 4, goals: 3, division: "Eredivisie", updatedAt: "2026-10-13", source: "Ayase Ueda" },
  { slug: "kuryu-matsuki", apps: 10, goals: 2, division: "Championship", updatedAt: "2026-10-14", source: "Kuryu Matsuki" },
  { slug: "ryuya-morishita", apps: 10, goals: 2, division: "Championship", updatedAt: "2026-10-13", source: "Ryōya Morishita" },
  { slug: "daiki-matsuoka", apps: 8, goals: 2, division: "Slovak First Football League", updatedAt: "2026-10-10", source: "Daiki Matsuoka" },
  { slug: "atsuki-ito", apps: 4, goals: 2, division: "EFL Championship", updatedAt: "2026-10-13", source: "Atsuki Itō" },
  { slug: "koji-miyoshi", apps: 4, goals: 2, division: null, updatedAt: "2026-08-28", source: "Kōji Miyoshi" },
  { slug: "ayumu-yokoyama", apps: 7, goals: 1, division: "Belgian Pro League", updatedAt: "2026-09-20", source: "Ayumu Yokoyama" },
  { slug: "junya-ito", apps: 7, goals: 1, division: "Belgian Pro League", updatedAt: "2026-09-20", source: "Junya Itō" },
  { slug: "kodai-sano", apps: 7, goals: 1, division: "Eredivisie", updatedAt: "2026-10-13", source: "Kodai Sano (footballer)" },
  { slug: "sota-kitano", apps: 7, goals: 1, division: "Austrian Bundesliga", updatedAt: "2026-10-15", source: "Sōta Kitano" },
  { slug: "daichi-kamada", apps: 6, goals: 1, division: "Premier League", updatedAt: "2026-10-15", source: "Daichi Kamada" },
  { slug: "keisuke-goto", apps: 5, goals: 1, division: "Bundesliga", updatedAt: "2026-10-15", source: "Keisuke Gotō" },
  { slug: "nelson-yuichiro-ishiwatari", apps: 5, goals: 1, division: "Belgian Pro League", updatedAt: "2026-09-06", source: "Nelson Ishiwatari" },
  { slug: "yu-hirakawa", apps: 5, goals: 1, division: "EFL Championship", updatedAt: "2026-09-05", source: "Yū Hirakawa" },
  { slug: "yuki-kobayashi", apps: 5, goals: 1, division: "Ekstraklasa", updatedAt: "2026-09-03", source: "Yuki Kobayashi (footballer, born 2000)" },
  { slug: "joel-chima-fujita", apps: 4, goals: 1, division: "2. Bundesliga", updatedAt: "2026-09-20", source: "Joel Chima Fujita" },
  { slug: "ryotaro-araki", apps: 4, goals: 1, division: "Belgian Pro League", updatedAt: "2026-09-12", source: "Ryōtarō Araki" },
  { slug: "ao-tanaka", apps: 3, goals: 1, division: "Premier League", updatedAt: "2026-09-14", source: "Ao Tanaka" },
  { slug: "shuto-machino", apps: 3, goals: 1, division: "Bundesliga", updatedAt: "2026-10-11", source: "Shūto Machino" },
  { slug: "yuta-nakayama", apps: 3, goals: 1, division: "J1 League", updatedAt: "2026-10-15", source: "Yūta Nakayama" },
  { slug: "koki-saito", apps: 2, goals: 1, division: "EFL Championship", updatedAt: "2026-08-29", source: "Kōki Saitō (footballer)" },
  { slug: "shinnosuke-fukuda", apps: 13, goals: 0, division: "J1 100 Year Vision League", updatedAt: "2026-08-29", source: "Shinnosuke Fukuda" },
  { slug: "junnosuke-suzuki", apps: 9, goals: 0, division: "Danish Superliga", updatedAt: "2026-10-15", source: "Junnosuke Suzuki" },
  { slug: "keigo-tsunemoto", apps: 9, goals: 0, division: "Swiss Super League", updatedAt: "2026-10-02", source: "Keigo Tsunemoto" },
  { slug: "tomoki-iwata", apps: 9, goals: 0, division: "Championship", updatedAt: "2026-10-10", source: "Tomoki Iwata" },
  { slug: "taiga-hata", apps: 7, goals: 0, division: "Belgian Pro League", updatedAt: "2026-09-20", source: "Taiga Hata" },
  { slug: "ayumu-seko", apps: 6, goals: 0, division: null, updatedAt: "2026-10-10", source: "Ayumu Seko" },
  { slug: "nikki-havenaar", apps: 6, goals: 0, division: "Belgian Pro League", updatedAt: "2026-10-15", source: "Nikki Havenaar" },
  { slug: "sho-fukuda", apps: 6, goals: 0, division: "Danish Superliga", updatedAt: "2026-09-17", source: "Shō Fukuda" },
  { slug: "sota-nakamura", apps: 6, goals: 0, division: "Ligue 1", updatedAt: "2026-10-10", source: "Sōta Nakamura" },
  { slug: "tsuyoshi-watanabe", apps: 6, goals: 0, division: "Eredivisie", updatedAt: "2026-10-14", source: "Tsuyoshi Watanabe" },
  { slug: "kaishu-sano", apps: 5, goals: 0, division: "Bundesliga", updatedAt: "2026-10-10", source: "Kaishū Sano" },
  { slug: "keita-kosugi", apps: 5, goals: 0, division: "Bundesliga", updatedAt: "2026-10-10", source: "Keita Kosugi" },
  { slug: "kento-shiogai", apps: 5, goals: 0, division: "2. Bundesliga", updatedAt: "2026-09-12", source: "Kento Shiogai" },
  { slug: "mio-backhaus", apps: 5, goals: 0, division: "Bundesliga", updatedAt: "2026-10-15", source: "Mio Backhaus" },
  { slug: "seiya-maikuma", apps: 5, goals: 0, division: "Eredivisie", updatedAt: "2026-10-15", source: "Seiya Maikuma" },
  { slug: "shunsuke-mito", apps: 5, goals: 0, division: "Eredivisie", updatedAt: "2026-09-04", source: "Shunsuke Mito" },
  { slug: "takefusa-kubo", apps: 5, goals: 0, division: "La Liga", updatedAt: "2026-10-15", source: "Takefusa Kubo" },
  { slug: "tomoya-ando", apps: 5, goals: 0, division: "2. Bundesliga", updatedAt: "2026-09-20", source: "Tomoya Ando" },
  { slug: "zion-suzuki", apps: 5, goals: 0, division: "Premier League", updatedAt: "2026-10-14", source: "Zion Suzuki" },
  { slug: "genki-haraguchi", apps: 4, goals: 0, division: "Challenger Pro League", updatedAt: "2026-09-06", source: "Genki Haraguchi" },
  { slug: "kaito-mizuta", apps: 4, goals: 0, division: "Ligue 1", updatedAt: "2026-10-10", source: "Kaito Mizuta" },
  { slug: "kou-itakura", apps: 4, goals: 0, division: "Bundesliga", updatedAt: "2026-09-19", source: "Kō Itakura" },
  { slug: "ritsu-doan", apps: 4, goals: 0, division: "Bundesliga", updatedAt: "2026-10-10", source: "Ritsu Dōan" },
  { slug: "takuya-ogiwara", apps: 4, goals: 0, division: "Belgian Pro League", updatedAt: "2026-09-07", source: "Takuya Ogiwara" },
  { slug: "daiki-hashioka", apps: 3, goals: 0, division: "Bundesliga", updatedAt: "2026-10-11", source: "Daiki Hashioka" },
  { slug: "keito-nakamura", apps: 3, goals: 0, division: "Ligue 1", updatedAt: "2026-10-15", source: "Keito Nakamura" },
  { slug: "koki-ando", apps: 3, goals: 0, division: "Belgian Division 2", updatedAt: "2026-09-12", source: "Koki Ando (footballer)" },
  { slug: "koki-machida", apps: 3, goals: 0, division: "Bundesliga", updatedAt: "2026-10-15", source: "Kōki Machida" },
  { slug: "satoshi-tanaka", apps: 3, goals: 0, division: "Bundesliga", updatedAt: "2026-09-20", source: "Satoshi Tanaka" },
  { slug: "takehiro-tomiyasu", apps: 3, goals: 0, division: "Premier League", updatedAt: "2026-09-20", source: "Takehiro Tomiyasu" },
  { slug: "tatsuhiro-sakamoto", apps: 2, goals: 0, division: "Premier League", updatedAt: "2026-10-12", source: "Tatsuhiro Sakamoto" },
  { slug: "yuki-ohashi", apps: 2, goals: 0, division: "Championship", updatedAt: "2026-08-25", source: "Yūki Ōhashi" },
  { slug: "daizen-maeda", apps: 1, goals: 0, division: "Premier League", updatedAt: "2026-08-25", source: "Daizen Maeda" },
  { slug: "rion-ichihara", apps: 1, goals: 0, division: "Eredivisie", updatedAt: "2026-09-15", source: "Rion Ichihara" },
  { slug: "zento-uno", apps: 1, goals: 0, division: "Bundesliga", updatedAt: "2026-10-11", source: "Zento Uno" },
  { slug: "hidemasa-morita", apps: 0, goals: 0, division: "Premier League", updatedAt: "2026-08-25", source: "Hidemasa Morita" },
  { slug: "hiroki-ito", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-10-13", source: "Hiroki Itō (footballer, born 1999)" },
  { slug: "kazunari-kita", apps: 0, goals: 0, division: "Segunda División", updatedAt: "2026-05-24", source: "Kazunari Kita" },
  { slug: "kota-takai", apps: 0, goals: 0, division: "Belgian Pro League", updatedAt: "2026-04-25", source: "Kōta Takai" },
  { slug: "reo-hatate", apps: 0, goals: 0, division: null, updatedAt: "2026-10-13", source: "Reo Hatate" },
  { slug: "rihito-yamamoto", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-05-24", source: "Rihito Yamamoto" },
  { slug: "ryunosuke-sato", apps: 0, goals: 0, division: "La Liga", updatedAt: "2026-03-06", source: "Ryūnosuke Satō" },
  { slug: "shiou-fukuda", apps: 0, goals: 0, division: "2. Bundesliga", updatedAt: "2026-05-17", source: "Shiō Fukuda" },
  { slug: "sota-kawasaki", apps: 0, goals: 0, division: "Bundesliga", updatedAt: "2026-04-16", source: "Sōta Kawasaki" },
  { slug: "takumi-minamino", apps: 0, goals: 0, division: "Ligue 1", updatedAt: "2026-10-15", source: "Takumi Minamino" },
  { slug: "yukinari-sugawara", apps: 0, goals: 0, division: "Championship", updatedAt: "2026-10-11", source: "Yukinari Sugawara" },
];

export const seasonStatMap = Object.fromEntries(seasonStats.map((s) => [s.slug, s]));
