import type { Broadcaster } from "@/lib/types";

/**
 * 日本国内の視聴手段。
 * 放映権はシーズンごと（時にはシーズン途中でも）変わるため、
 * すべて lastChecked を必ずUIに表示し、confidence: "needs-review" を初期値とする。
 * 契約更新時期（毎年7月・1月）に必ず各社公式ページで再確認すること。
 */
export const broadcasters: Broadcaster[] = [
  {
    id: "dazn",
    name: "DAZN",
    monthlyPriceYen: 4200,
    leagues: ["la-liga", "serie-a", "premier-league"],
    officialUrl: "https://www.dazn.com/ja-JP/",
    lastChecked: "2026-08-23",
    confidence: "needs-review",
    freeTrialNote: "料金プランが複数あり、視聴できるリーグがプランにより異なる。",
  },
  {
    id: "spotv-now",
    name: "SPOTV NOW",
    monthlyPriceYen: 1300,
    leagues: ["premier-league", "la-liga", "ligue-1", "eredivisie", "primeira-liga"],
    officialUrl: "https://www.spotvnow.co.jp/",
    lastChecked: "2026-08-23",
    confidence: "needs-review",
  },
  {
    id: "u-next",
    name: "U-NEXT",
    monthlyPriceYen: 2189,
    leagues: ["premier-league", "ligue-1"],
    officialUrl: "https://video.unext.jp/",
    lastChecked: "2026-08-23",
    confidence: "needs-review",
    freeTrialNote: "無料トライアルの有無・期間は時期により変動。",
  },
  {
    id: "abema",
    name: "ABEMA",
    monthlyPriceYen: 1080,
    leagues: ["premier-league"],
    officialUrl: "https://abema.tv/",
    lastChecked: "2026-08-23",
    confidence: "needs-review",
    freeTrialNote: "無料で視聴できる試合も一部ある。",
  },
  {
    id: "wowow",
    name: "WOWOW",
    monthlyPriceYen: 2530,
    leagues: ["la-liga"],
    officialUrl: "https://www.wowow.co.jp/",
    lastChecked: "2026-08-23",
    confidence: "needs-review",
  },
];

export const broadcasterMap = Object.fromEntries(broadcasters.map((b) => [b.id, b]));
