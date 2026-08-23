import type { MetadataRoute } from "next";
import { players } from "@/data/players";
import { guides } from "@/data/guides";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/players", "/fixtures", "/guides", "/about", "/privacy"];
  return [
    ...staticPaths.map((p) => ({
      url: `${SITE_URL}${p}/`,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.8,
    })),
    ...players.map((p) => ({
      url: `${SITE_URL}/players/${p.slug}/`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...guides.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}/`,
      lastModified: g.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
