import type { Broadcaster, CupId } from "@/lib/types";

/**
 * 日本国内の視聴手段。2026-27シーズン開幕時点で確認した内容。
 *
 * 放映権はシーズンごと（時にはシーズン途中でも）変わる。すべて lastChecked をUIに表示し、
 * 申し込み前に公式ページを見てもらう前提で書く。
 *
 * 2026年8月24日の確認で、前シーズンまでの前提が大きく変わっていた。
 *  - プレミアリーグは U-NEXT の独占配信になり、DAZNでは観られない
 *  - エールディヴィジも U-NEXT
 *  - SPOTV NOW は欧州主要リーグの配信から外れている
 *  - スコティッシュ・プレミアシップは国内の定額配信がなく、クラブ公式チャンネルのみ
 */
export const broadcasters: Broadcaster[] = [
  {
    id: "u-next-soccer-pack",
    name: "U-NEXT サッカーパック",
    monthlyPriceYen: 2600,
    leagues: ["premier-league", "la-liga", "eredivisie"],
    cups: ["fa-cup", "copa-del-rey", "dfb-pokal", "knvb-cup"],
    officialUrl: "https://www.video.unext.jp/lp/football_pack",
    lastChecked: "2026-08-24",
    confidence: "verified",
    note: "プレミアリーグは全試合独占配信。FAカップ、コパ・デル・レイ、DFBポカール、KNVBカップも対象。見放題プランに入らず、このパック単体でも契約できる。",
  },
  {
    id: "dmm-dazn",
    name: "DMM×DAZNホーダイ",
    monthlyPriceYen: 3480,
    leagues: ["bundesliga", "la-liga", "serie-a", "ligue-1", "jupiler-pro-league", "primeira-liga"],
    partialLeagues: ["championship"],
    officialUrl: "https://dmm-dazn.com/",
    lastChecked: "2026-08-24",
    confidence: "verified",
    note: "DAZNと同じ内容をDMMプレミアム込みで視聴できる。月払いではDAZN本体より安い。",
  },
  {
    id: "dazn",
    name: "DAZN",
    monthlyPriceYen: 4200,
    leagues: ["bundesliga", "la-liga", "serie-a", "ligue-1", "jupiler-pro-league", "primeira-liga"],
    partialLeagues: ["championship"],
    officialUrl: "https://www.dazn.com/ja-JP/",
    lastChecked: "2026-08-24",
    confidence: "verified",
    note: "スタンダード月間プランの価格。年間一括やABEMA de DAZNなど、より安い契約経路がある。EFLチャンピオンシップは毎節3試合前後の配信で全試合ではない。",
  },
  {
    id: "abema",
    name: "ABEMA",
    monthlyPriceYen: 0,
    leagues: [],
    partialLeagues: ["bundesliga"],
    officialUrl: "https://abema.tv/",
    lastChecked: "2026-08-24",
    confidence: "verified",
    note: "ブンデスリーガのうち、日本人選手が所属するクラブを中心に毎節一部の試合を無料生中継。全試合ではない。",
    freeTrialNote: "対象試合は無料で視聴できる。",
  },
  {
    id: "celtic-tv",
    name: "セルティックTV",
    monthlyPriceYen: 3000,
    leagues: ["scottish-premiership"],
    officialUrl: "https://celticfc.com/",
    lastChecked: "2026-08-24",
    confidence: "needs-review",
    note: "セルティックFCが運営する公式チャンネル。同クラブの試合が中心で、リーグ全体の配信ではない。料金はポンド建てのため円換算は変動する。",
  },
];

export const broadcasterMap = Object.fromEntries(broadcasters.map((b) => [b.id, b]));

/**
 * 国内の定額配信サービスで視聴手段が確認できていないリーグ。
 * 「情報がない」ことを黙って隠さず、明示するために持つ。
 */
/**
 * 配信元を確認できていないカップ戦。
 *
 * とくに欧州カップ戦は、リーグ戦とは別の事業者が権利を持つことが多い。
 * 憶測で埋めず、確認できていないことをそのまま書く。
 */
export const cupsWithoutBroadcaster: Partial<Record<CupId, string>> = {
  "champions-league": "国内の配信元を当サイトでは確認できていません。",
  "europa-league": "国内の配信元を当サイトでは確認できていません。",
  "conference-league": "国内の配信元を当サイトでは確認できていません。",
  "efl-cup": "国内の配信元を当サイトでは確認できていません。",
  "coppa-italia": "国内の配信元を当サイトでは確認できていません。",
  "coupe-de-france": "国内の配信元を当サイトでは確認できていません。",
  "taca-de-portugal": "国内の配信元を当サイトでは確認できていません。",
  "belgian-cup": "国内の配信元を当サイトでは確認できていません。",
  "scottish-cup": "国内の配信元を当サイトでは確認できていません。",
};

export const leaguesWithoutBroadcaster: Record<string, string> = {
  "bundesliga-2": "国内での定額配信は確認できていません。",
  "segunda-division": "国内での定額配信は確認できていません。",
  "challenger-pro-league": "国内での定額配信は確認できていません。",
  "danish-superliga": "国内での定額配信は確認できていません。",
};
