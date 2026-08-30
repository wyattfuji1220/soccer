import { rss } from "@/lib/feed";

/** 静的書き出しのため、ビルド時に1回だけ生成する */
export const dynamic = "force-static";

export function GET() {
  return new Response(rss(), {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
