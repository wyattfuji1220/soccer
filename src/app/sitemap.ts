import type { MetadataRoute } from "next";
import { players } from "@/data/players";
import { guides } from "@/data/guides";
import { clubs } from "@/data/clubs";
import { highlightsTakenAt } from "@/data/highlights";
import { playerLists } from "@/lib/lists";
import { leagues } from "@/data/leagues";
import { fixturesUpdatedAt } from "@/lib/fixtures";
import { standingsUpdatedAt } from "@/lib/standings";
import type { Player } from "@/lib/types";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * 更新日には、そのページの中身を実際に確かめた日を入れる。
 *
 * ビルドした日を全ページに一律で入れると、何も変わっていないページまで
 * 「更新した」と伝えることになる。日付が当てにならないと分かれば、
 * 検索側は日付そのものを見なくなる。
 * 根拠のある日付を持てないページには、日付を入れない。
 */
function latest(...dates: (string | null | undefined)[]): string | undefined {
  const known = dates.filter((d): d is string => typeof d === "string" && d.length > 0);
  return known.length > 0 ? known.reduce((a, b) => (a > b ? a : b)) : undefined;
}

/** 選手ページの更新日。出典を確認した日と、成績を照らし合わせた日のうち新しいほう */
function playerDate(p: Player): string | undefined {
  return latest(...p.sources.map((s) => s.checkedAt), p.statsCheckedAt);
}

const dateByName = new Map(players.map((p) => [p.nameJa, playerDate(p)]));

/** 選手データ全体の最終確認日。選手を並べているページに使う */
const playersDate = latest(...players.map(playerDate));

/** 試合と順位の取得日。日程・結果・順位表のページに使う */
const matchDate = latest(fixturesUpdatedAt, standingsUpdatedAt);

/** クラブページは、在籍している選手を確かめた日をもって更新日とする */
function clubDate(currentPlayers: string[]): string | undefined {
  return latest(...currentPlayers.map((n) => dateByName.get(n)));
}

/** リーグページは順位表と日程も載せているため、そちらの取得日も含める */
function leagueDate(id: string): string | undefined {
  const inLeague = players.filter((p) => p.league === id).map(playerDate);
  return latest(...inLeague, matchDate);
}

/** 日付を持てるものにだけ lastModified を付ける */
function entry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  lastModified?: string
): MetadataRoute.Sitemap[number] {
  return { url: `${SITE_URL}${path}`, changeFrequency, priority, ...(lastModified ? { lastModified } : {}) };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const guidesDate = latest(...guides.map((g) => g.updatedAt));

  return [
    entry("/", 1, "daily", latest(playersDate, matchDate)),
    entry("/players/", 0.8, "daily", playersDate),
    entry("/clubs/", 0.8, "weekly", playersDate),
    entry("/fixtures/", 0.8, "daily", matchDate),
    entry("/results/", 0.8, "daily", latest(matchDate, highlightsTakenAt)),
    entry("/rankings/", 0.9, "weekly", playersDate),
    entry("/standings/", 0.8, "daily", standingsUpdatedAt ?? undefined),
    entry("/transfers/", 0.8, "weekly", playersDate),
    entry("/history/", 0.8, "monthly"),
    entry("/watch-plan/", 0.95, "monthly", guidesDate),
    entry("/watch-plan/coverage/", 0.8, "monthly", guidesDate),
    entry("/cups/", 0.9, "monthly"),
    entry("/guides/", 0.8, "monthly", guidesDate),
    entry("/about/", 0.8, "yearly"),
    entry("/privacy/", 0.8, "yearly"),

    ...leagues.map((l) => entry(`/leagues/${l.id}/`, 0.85, "daily", leagueDate(l.id))),
    ...playerLists.map((l) =>
      entry(`/lists/${l.slug}/`, 0.75, "weekly", latest(...l.players.map(playerDate)))
    ),
    ...players.map((p) => entry(`/players/${p.slug}/`, 0.7, "weekly", playerDate(p))),
    ...clubs.map((c) => entry(`/clubs/${c.slug}/`, 0.6, "weekly", clubDate(c.currentPlayers))),
    ...guides.map((g) => entry(`/guides/${g.slug}/`, 0.9, "monthly", g.updatedAt)),
  ];
}
