import type { PlayerVideo } from "@/lib/types";

/**
 * 選手ページに埋め込む公式動画。
 *
 * 収録しているのは権利者自身が運営するチャンネルの動画のみで、
 * タイトルとチャンネル名は YouTube の oEmbed が返した値をそのまま保存している。
 * 追加・再検証は scripts/collect-videos.mjs と scripts/verify-videos.mjs で行う。
 */
export const OFFICIAL_CHANNELS = [
  "DAZN Japan",
  "jfatv",
  "U-NEXT サッカー",
  "U-NEXT フットボール",
  "ABEMA スポーツ",
];

export const videos: PlayerVideo[] = [
  {
    playerSlug: "kaoru-mitoma",
    videoId: "KsXx-T9lKKs",
    title: "【三笘薫と遠藤航が出場｜ブライトン×リヴァプール｜ハイライト】2024-25 カラバオカップ4回戦",
    channel: "DAZN Japan",
    channelUrl: "https://www.youtube.com/@DAZNJapan",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "kaoru-mitoma",
    videoId: "CFdz3wxMxgc",
    title: "【速報】三笘薫の仕掛けにスタジアムが沸く！得意のカットインからのシュートでゴールに迫る！｜AFCアジア最終予選 グループC第4節 日本×オーストラリア",
    channel: "DAZN Japan",
    channelUrl: "https://www.youtube.com/@DAZNJapan",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "kaoru-mitoma",
    videoId: "QHidVm-Kr-M",
    title: "【レディング×ブライトン｜ハイライト】三笘薫 後半途中出場で存在感｜プレシーズンマッチ｜2022-23",
    channel: "DAZN Japan",
    channelUrl: "https://www.youtube.com/@DAZNJapan",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "takefusa-kubo",
    videoId: "LOL10LZNTHc",
    title: "【久保建英が劇的決勝弾をアシスト！ | ヘタフェ×レアル・ソシエダ｜ハイライト】ラ・リーガ第19節｜2025-26シーズン",
    channel: "DAZN Japan",
    channelUrl: "https://www.youtube.com/@DAZNJapan",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "takefusa-kubo",
    videoId: "OWUC97ci0Wo",
    title: "【久保建英がアシスト | レアル・ソシエダ×アトレティコ・マドリード｜ハイライト】ラ・リーガ第18節｜2025-26シーズン",
    channel: "DAZN Japan",
    channelUrl: "https://www.youtube.com/@DAZNJapan",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "takefusa-kubo",
    videoId: "Kf6Wtoz61B0",
    title: "【久保建英が開幕戦以来となる今季2ゴール目 | レバンテ×レアル・ソシエダ｜ハイライト】ラ・リーガ第17節｜2025-26シーズン",
    channel: "DAZN Japan",
    channelUrl: "https://www.youtube.com/@DAZNJapan",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "takefusa-kubo",
    videoId: "_ujWOdYjiOw",
    title: "【久保建英が2ゴールの起点に！｜ソシエダ×エスパニョール｜ハイライト】ラ・リーガ第2節｜2025-26シーズン",
    channel: "DAZN Japan",
    channelUrl: "https://www.youtube.com/@DAZNJapan",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "takefusa-kubo",
    videoId: "hfN_jd5NlLg",
    title: "【久保建英が“神パス連発”も後半8分に交代｜ソシエダ×ベティス｜ハイライト】ラ・リーガ第35節｜2025-26シーズン",
    channel: "DAZN Japan",
    channelUrl: "https://www.youtube.com/@DAZNJapan",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "takefusa-kubo",
    videoId: "yL8cW-_XrzY",
    title: "【日本凱旋｜久保建英（ソシエダ）プレー集】ラ・レアル3シーズン目は5ゴール！世界に誇る“至宝”がジャパンツアーで日本凱旋！｜2024-25 ラ・リーガ",
    channel: "DAZN Japan",
    channelUrl: "https://www.youtube.com/@DAZNJapan",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "ayase-ueda",
    videoId: "aPaTB3fGo2s",
    title: "速報｜上田綺世が今シーズン初ゴール！｜フェイエノールト v ゴー・アヘッド・イーグルス｜エールディヴィジ 2026/27 第2節",
    channel: "U-NEXT フットボール",
    channelUrl: "https://www.youtube.com/@UNEXT_football",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "ayase-ueda",
    videoId: "-ybTmZoEcP0",
    title: "【上田綺世が2ゴールの大活躍｜フェイエノールト v フローニンゲン｜ショートハイライト 】エールディヴィジ25/26 第31節",
    channel: "U-NEXT フットボール",
    channelUrl: "https://www.youtube.com/@UNEXT_football",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "ayase-ueda",
    videoId: "Ljc1OSUu050",
    title: "【上田綺世 (フェイエノールト)｜25/26 全ゴール集】まさに無双状態！リーグトップ独走の13ゴール｜エールディヴィジ第13節 フェイエノールトvNECナイメヘン 11/23(日) 22:30 KO",
    channel: "U-NEXT フットボール",
    channelUrl: "https://www.youtube.com/@UNEXT_football",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "ayase-ueda",
    videoId: "06buyQPs5co",
    title: "2025/26シーズン 全ゴール集｜🇯🇵日本代表｜上田綺世(フェイエノールト)｜#世界最高峰がここにある",
    channel: "U-NEXT フットボール",
    channelUrl: "https://www.youtube.com/@UNEXT_football",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "ayase-ueda",
    videoId: "oNTL8C21zJA",
    title: "【🇯🇵上田綺世（日本代表）】理不尽が世界を震わす！ゴールハンターがW杯初ゴール含む2得点｜グループF第2節｜FIFAワールドカップ2026",
    channel: "DAZN Japan",
    channelUrl: "https://www.youtube.com/@DAZNJapan",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "ayase-ueda",
    videoId: "ga22So4bnTg",
    title: "速報｜上田綺世が2試合連続のゴール⚽️｜フェイエノールト v エクセルシオール｜エールディヴィジ25/26 第27節",
    channel: "U-NEXT フットボール",
    channelUrl: "https://www.youtube.com/@UNEXT_football",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "ayase-ueda",
    videoId: "jzfNT5XliQM",
    title: "【上田綺世が2ゴール！｜フェイエノールト v エクセルシオール｜ショートハイライト 】エールディヴィジ25/26 第27節",
    channel: "U-NEXT フットボール",
    channelUrl: "https://www.youtube.com/@UNEXT_football",
    verifiedAt: "2026-08-23",
  },
  {
    playerSlug: "wataru-endo",
    videoId: "KsXx-T9lKKs",
    title: "【三笘薫と遠藤航が出場｜ブライトン×リヴァプール｜ハイライト】2024-25 カラバオカップ4回戦",
    channel: "DAZN Japan",
    channelUrl: "https://www.youtube.com/@DAZNJapan",
    verifiedAt: "2026-08-23",
  },
];

export function videosForPlayer(slug: string): PlayerVideo[] {
  return videos.filter((v) => v.playerSlug === slug && OFFICIAL_CHANNELS.includes(v.channel));
}
