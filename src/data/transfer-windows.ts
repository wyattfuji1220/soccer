import type { TransferWindow } from "@/lib/types";

/**
 * 移籍市場の締切。
 *
 * 締切は毎年ずれ、リーグごとにも違う。ここに書いてよいのは、リーグまたは
 * 協会の公式発表で日付を確認できたものだけ。確認できていないリーグは
 * 空欄のままにし、UI側で「確認できていない」と書く。
 *
 * 2026年夏は、プレミアリーグ公式が「9月1日の締切はEFL・ブンデスリーガ・
 * セリエA・ラ・リーガ・リーグ・アンにも適用される」と明記している。
 * 時刻まで書かれているのはプレミアリーグだけなので、他は日付までにとどめる。
 *
 * エールディヴィジはオランダの報道でのみ確認しているため needs-review とする。
 */
const PL_SOURCE = {
  label: "Premier League 公式 — Summer 2026 Transfer Deadline Day",
  url: "https://www.premierleague.com/en/news/4698998/copy-transfer-deadline-day-everything-you-need-to-know",
  checkedAt: "2026-08-30",
};

export const transferWindows: TransferWindow[] = [
  {
    id: "summer-2026-premier-league",
    label: "2026年 夏",
    leagues: ["premier-league"],
    // 23:00 BST = UTC+1
    closesAt: "2026-09-01T23:00:00+01:00",
    precision: "time",
    confidence: "verified",
    source: PL_SOURCE,
  },
  {
    id: "summer-2026-harmonised",
    label: "2026年 夏",
    leagues: ["championship", "bundesliga", "bundesliga-2", "serie-a", "la-liga", "segunda-division", "ligue-1", "ligue-2"],
    // 日付のみ公式に確認できている。時刻は国ごとに違うため書かない
    closesAt: "2026-09-01T23:59:59+01:00",
    precision: "date",
    confidence: "verified",
    source: PL_SOURCE,
  },
  {
    id: "summer-2026-eredivisie",
    label: "2026年 夏",
    leagues: ["eredivisie"],
    closesAt: "2026-09-02T23:59:00+02:00",
    precision: "date",
    confidence: "needs-review",
    source: {
      label: "Voetbalnieuws — Tot wanneer is de transfermarkt in de Eredivisie open?",
      url: "https://www.voetbalnieuws.nl/nieuws/2119799/tot-wanneer-is-de-transfermarkt-in-de-eredivisie-open-deadline-2026.html",
      checkedAt: "2026-08-30",
    },
  },
];
