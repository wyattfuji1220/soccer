/**
 * アフィリエイトリンクの生成を1か所に集約する。
 * トラッキングIDは環境変数から読み込み、コードにハードコードしない。
 * 未設定の場合はタグなしの通常リンクにフォールバックする（審査前でもサイトが壊れない）。
 */
const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "";
const RAKUTEN_AFFILIATE_ID = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID ?? "";

export function amazonSearchUrl(keyword: string): string {
  const url = new URL("https://www.amazon.co.jp/s");
  url.searchParams.set("k", keyword);
  if (AMAZON_TAG) url.searchParams.set("tag", AMAZON_TAG);
  return url.toString();
}

export function rakutenSearchUrl(keyword: string): string {
  const base = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
  if (!RAKUTEN_AFFILIATE_ID) return base;
  return `https://hb.afl.rakuten.co.jp/hgc/${RAKUTEN_AFFILIATE_ID}/?pc=${encodeURIComponent(base)}`;
}

/** 配信サービスへのリンク。アフィリエイトURL未設定なら公式URLを使う */
export function broadcasterLink(b: { officialUrl: string; affiliateUrl?: string }): string {
  return b.affiliateUrl ?? b.officialUrl;
}

/** 広告表記が必要なリンクかどうか（景表法・ステマ規制対応） */
export const AD_DISCLOSURE = "本ページのリンクには広告が含まれます。";
