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
 *
 * 2026年9月5日に追記。2.ブンデスリーガを配信するイージースポーツ2を見つけた。
 * 掲載13人（3番目に多い）を抱えるリーグなのに視聴手段が1件も無い状態だった。
 * なお同社の価格は公式サイトのトップ画像に焼かれていて本文からは読み取れない。
 * 規約に載っているのは「定額チケット」という仕組みの説明だけで金額は書かれていないため、
 * 表示を実際に見て確かめること。
 */
export const broadcasters: Broadcaster[] = [
  {
    id: "u-next-soccer-pack",
    name: "U-NEXT サッカーパック",
    monthlyPriceYen: 2600,
    leagues: ["premier-league", "la-liga", "eredivisie"],
    cups: ["fa-cup", "copa-del-rey", "dfb-pokal", "knvb-cup"],
    officialUrl: "https://www.video.unext.jp/lp/football_pack",
    lastChecked: "2026-08-25",
    confidence: "verified",
    note: "プレミアリーグは全試合独占配信。公式の対象作品はプレミアリーグ、ラ・リーガ、エールディヴィジ、FAカップ、FAコミュニティ・シールド、コパ・デル・レイ、スーペルコパ・デ・エスパーニャ、DFBポカール、KNVBカップ、ウィメンズ・スーパーリーグ。サッカーパック単体でも契約できる。パック自体に無料期間はないが、月額プランの無料トライアル特典（1,200ポイント）を充当すると初月1,400円になる。",
  },
  {
    id: "dazn",
    name: "DAZN",
    monthlyPriceYen: 4200,
    leagues: ["bundesliga", "la-liga", "serie-a", "ligue-1", "jupiler-pro-league", "primeira-liga"],
    partialLeagues: ["championship"],
    cups: ["efl-cup"],
    officialUrl: "https://www.dazn.com/ja-JP/",
    lastChecked: "2026-08-25",
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
    id: "wowow-on-demand",
    name: "WOWOWオンデマンド",
    monthlyPriceYen: 2530,
    leagues: [],
    cups: ["champions-league", "europa-league", "conference-league"],
    officialUrl: "https://wod.wowow.co.jp/genre/106",
    lastChecked: "2026-08-25",
    confidence: "verified",
    note: "スタンダードプラン（月額2,530円・税込）の価格。UEFAチャンピオンズリーグ、ヨーロッパリーグ、カンファレンスリーグ、UEFAスーパーカップが対象。国内リーグ戦の配信はない。CL・ELだけを観るなら、2026-27シーズンパス（12,100円・税込）という買い切りもある。",
    freeTrialNote: "ショートハイライトは無料で視聴できる。",
  },
  {
    id: "easysports2",
    name: "イージースポーツ2",
    monthlyPriceYen: 1980,
    leagues: ["bundesliga-2"],
    officialUrl: "https://easysports2.stores.play.jp/",
    lastChecked: "2026-09-05",
    confidence: "verified",
    note: "EASY PRODUCTION株式会社が運営。2.ブンデスリーガの全試合をライブ配信すると公式サイトに明示されている。月額のほかに試合ごとに購入する方式もあり、そちらの価格は各試合のページに出る。見逃し配信の有無は試合によって違うため、観たい試合のページで確認が必要。",
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
  "coppa-italia": "U-NEXT、DAZN、WOWOWオンデマンドの配信対象には含まれていません（2026年8月25日に各公式ページで確認）。他の視聴手段は確認できていません。",
  "coupe-de-france": "U-NEXT、DAZN、WOWOWオンデマンドの配信対象には含まれていません（2026年8月25日に各公式ページで確認）。他の視聴手段は確認できていません。",
  "taca-de-portugal": "U-NEXT、DAZN、WOWOWオンデマンドの配信対象には含まれていません（2026年8月25日に各公式ページで確認）。他の視聴手段は確認できていません。",
  "belgian-cup": "U-NEXT、DAZN、WOWOWオンデマンドの配信対象には含まれていません（2026年8月25日に各公式ページで確認）。他の視聴手段は確認できていません。",
  "scottish-cup": "U-NEXT、DAZN、WOWOWオンデマンドの配信対象には含まれていません（2026年8月25日に各公式ページで確認）。他の視聴手段は確認できていません。",
};

export const leaguesWithoutBroadcaster: Record<string, string> = {
  "ligue-2": "国内での定額配信は確認できていません。",
  "segunda-division": "国内での定額配信は確認できていません。",
  "challenger-pro-league": "国内での定額配信は確認できていません。",
  "danish-superliga": "国内での定額配信は確認できていません。",
};
