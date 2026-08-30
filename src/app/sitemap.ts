import type { MetadataRoute } from "next";
import { players } from "@/data/players";
import { guides } from "@/data/guides";
import { clubs } from "@/data/clubs";
import { playerLists } from "@/lib/lists";
import { leagues } from "@/data/leagues";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/players", "/clubs", "/fixtures", "/rankings", "/standings", "/transfers", "/history", "/watch-plan", "/watch-plan/coverage", "/cups", "/guides", "/about", "/privacy"];
  return [
    ...staticPaths.map((p) => ({
      url: `${SITE_URL}${p}/`,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : p === "/watch-plan" ? 0.95 : p === "/rankings" || p === "/cups" ? 0.9 : 0.8,
    })),
    ...leagues.map((l) => ({
      url: `${SITE_URL}/leagues/${l.id}/`,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...playerLists.map((l) => ({
      url: `${SITE_URL}/lists/${l.slug}/`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...players.map((p) => ({
      url: `${SITE_URL}/players/${p.slug}/`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...clubs.map((c) => ({
      url: `${SITE_URL}/clubs/${c.slug}/`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...guides.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}/`,
      lastModified: g.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
