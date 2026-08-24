/** 公開URL。デプロイ先が決まったら .env.local の NEXT_PUBLIC_SITE_URL を設定する */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://kaigai-gumi.com";

export const SITE_NAME = "海外組ポータル";

/**
 * 問い合わせ先。どちらか一方を設定する。
 * フォームURL（Googleフォームなど）のほうがメールアドレスを公開せずに済む。
 */
export const CONTACT_FORM_URL = process.env.NEXT_PUBLIC_CONTACT_FORM_URL || null;
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || null;

/** Google AdSense のパブリッシャーID（ca-pub-xxxxxxxxxxxxxxxx）。未設定なら広告タグを出さない */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || null;
