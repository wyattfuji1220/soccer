import { SITE_NAME, SITE_URL } from "@/lib/site";
import { guides } from "@/data/guides";
import { transfers } from "@/data/transfers";
import { currentSeasonYear, movesInYear } from "@/lib/transfers";

/**
 * 更新をフィードで配れるようにする。
 *
 * 競合はXでの告知しか持っていない。フィードなら購読する側が取りに来るので、
 * こちらがSNSで発信し続けなくても更新が伝わる。RSSリーダーだけでなく、
 * 各種の自動化サービスからも読める。
 *
 * 載せるのは「日付が確定していて、更新のたびに増えるもの」だけ。
 * ページの内容が変わっただけのものは流さない（購読者が同じ通知を何度も
 * 受け取ることになるため）。
 */

export type FeedItem = {
  id: string;
  title: string;
  url: string;
  /** ISO 8601 */
  date: string;
  summary: string;
};

const SEASON = currentSeasonYear();

/** 記事。更新日を日付として使う */
function guideItems(): FeedItem[] {
  return guides.map((g) => ({
    id: `${SITE_URL}/guides/${g.slug}/`,
    title: g.title,
    url: `${SITE_URL}/guides/${g.slug}/`,
    date: `${g.updatedAt}T00:00:00+09:00`,
    summary: g.description,
  }));
}

/**
 * 確定した移籍。日付は当サイトが変化を確認した日で、クラブの発表日ではない。
 * 誤解を招かないよう、要約にもその旨を書く。
 */
function transferItems(): FeedItem[] {
  return transfers
    .filter((t) => t.kind === "move" || t.kind === "arrived")
    .map((t) => ({
      id: `${SITE_URL}/transfers/#${t.date}-${t.slug}`,
      title:
        t.kind === "move"
          ? `${t.nameJa}が${t.fromClub}から${t.toClub}へ`
          : `${t.nameJa}（${t.toClub}）を掲載しました`,
      url: `${SITE_URL}/players/${t.slug}/`,
      date: `${t.date}T00:00:00+09:00`,
      summary:
        t.kind === "move"
          ? `所属クラブが${t.fromClub}から${t.toClub}に変わったことを${t.date}に確認しました。日付はクラブの発表日ではなく、当サイトが確認した日です。`
          : `${t.toClub}に所属する日本人選手として、${t.date}から掲載しています。`,
    }));
}

/**
 * 記録がまだ貯まっていないあいだの埋め合わせ。
 * 今季の移籍をクラブ遍歴から出して流す。年しか分からないので日付は付けない。
 */
function seasonMoveItems(): FeedItem[] {
  if (transfers.length > 0) return [];
  return movesInYear(SEASON)
    .filter((m) => m.to.country !== "JPN")
    .slice(0, 30)
    .map((m) => ({
      id: `${SITE_URL}/players/${m.player.slug}/#${SEASON}`,
      title: `${m.player.nameJa}が${m.to.team}へ（${SEASON}年）`,
      url: `${SITE_URL}/players/${m.player.slug}/`,
      date: `${SEASON}-07-01T00:00:00+09:00`,
      summary: `${m.from ? `${m.from.team}から` : ""}${m.to.team}へ移りました。${
        m.to.loan ? "期限付き移籍です。" : ""
      }在籍年はWikipediaのクラブ遍歴によります。`,
    }));
}

export function feedItems(limit = 50): FeedItem[] {
  return [...guideItems(), ...transferItems(), ...seasonMoveItems()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function rss(): string {
  const items = feedItems();
  const updated = items[0]?.date ?? new Date().toISOString();
  const body = items
    .map(
      (i) => `  <item>
    <title>${escapeXml(i.title)}</title>
    <link>${escapeXml(i.url)}</link>
    <guid isPermaLink="false">${escapeXml(i.id)}</guid>
    <pubDate>${new Date(i.date).toUTCString()}</pubDate>
    <description>${escapeXml(i.summary)}</description>
  </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(SITE_NAME)}</title>
  <link>${SITE_URL}/</link>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
  <description>欧州でプレーする日本人選手の移籍と、視聴方法の記事の更新をお届けします。</description>
  <language>ja</language>
  <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
${body}
</channel>
</rss>
`;
}

export function jsonFeed(): string {
  return JSON.stringify(
    {
      version: "https://jsonfeed.org/version/1.1",
      title: SITE_NAME,
      home_page_url: `${SITE_URL}/`,
      feed_url: `${SITE_URL}/feed.json`,
      description: "欧州でプレーする日本人選手の移籍と、視聴方法の記事の更新をお届けします。",
      language: "ja",
      items: feedItems().map((i) => ({
        id: i.id,
        url: i.url,
        title: i.title,
        content_text: i.summary,
        date_published: i.date,
      })),
    },
    null,
    1
  );
}
