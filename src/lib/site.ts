/** 公開URL。デプロイ先が決まったら .env.local の NEXT_PUBLIC_SITE_URL を設定する */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://kaigaigumi-portal.example";

export const SITE_NAME = "海外組ポータル";
