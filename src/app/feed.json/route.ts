import { jsonFeed } from "@/lib/feed";

export const dynamic = "force-static";

export function GET() {
  return new Response(jsonFeed(), {
    headers: { "content-type": "application/feed+json; charset=utf-8" },
  });
}
