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

/**
 * 配信サービスのアフィリエイトURL。
 *
 * ASPが発行するURLには識別子が含まれるため、データファイルには置かない
 * （このリポジトリは公開されている）。Next.js は環境変数を静的に置き換えるので、
 * 変数名は文字列として書き下す必要があり、動的な参照にはできない。
 */
const BROADCASTER_URLS: Record<string, string | undefined> = {
  "u-next-soccer-pack": process.env.NEXT_PUBLIC_AFFILIATE_UNEXT,
  "dmm-dazn": process.env.NEXT_PUBLIC_AFFILIATE_DMM,
  dazn: process.env.NEXT_PUBLIC_AFFILIATE_DAZN,
  "wowow-on-demand": process.env.NEXT_PUBLIC_AFFILIATE_WOWOW,
  abema: process.env.NEXT_PUBLIC_AFFILIATE_ABEMA,
  "celtic-tv": process.env.NEXT_PUBLIC_AFFILIATE_CELTIC,
};

/** 配信サービスへのリンク。未設定なら公式URLに落ちる（提携前でもサイトは壊れない） */
export function broadcasterLink(b: { id: string; officialUrl: string }): string {
  return BROADCASTER_URLS[b.id] || b.officialUrl;
}

/** 広告表記が必要なリンクかどうか（景表法・ステマ規制対応） */
export const AD_DISCLOSURE = "本ページのリンクには広告が含まれます。";
