import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * 検索エンジン向けの構造化データ（JSON-LD）を組み立てる。
 *
 * 画面に出しているパンくずやデータの一覧は、人には読めても機械には
 * 「ただのリンク」「ただの表」にしか見えない。同じ内容を機械向けにも
 * 出しておくと、検索結果でURLの代わりに階層が表示される。
 *
 * 書いてよいのは画面に実際に出ている内容だけ。表示していないものを
 * 構造化データにだけ書くのはガイドライン違反にあたる。
 */

export type Crumb = {
  name: string;
  /** サイト内のパス。最後の1件（現在地）は省く */
  path?: string;
};

/**
 * パンくずリスト。先頭のホームはこちらで付ける。
 *   breadcrumb([{ name: "選手一覧", path: "/players/" }, { name: "三笘薫" }])
 */
export function breadcrumb(items: Crumb[]) {
  const all: Crumb[] = [{ name: SITE_NAME, path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      // 現在地には item を付けない（Googleの指定）
      ...(c.path ? { item: `${SITE_URL}${c.path}` } : {}),
    })),
  };
}

/** 一覧ページ。何がいくつ並んでいるかを伝える */
export function collection({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  /** 並んでいるものの名前とリンク先。多すぎると読まれないので上位のみ渡す */
  items: { name: string; path?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${SITE_URL}${path}`,
    inLanguage: "ja",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((x, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: x.name,
        ...(x.path ? { url: `${SITE_URL}${x.path}` } : {}),
      })),
    },
  };
}

/** クラブ。所属している日本人選手を紐づける */
export function sportsTeam({
  name,
  nameEn,
  path,
  article,
  members,
}: {
  name: string;
  nameEn: string | null;
  path: string;
  /** Wikipediaの記事URL。同じものを指していると伝える手がかりになる */
  article: string;
  members: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name,
    ...(nameEn ? { alternateName: nameEn } : {}),
    sport: "Football",
    url: `${SITE_URL}${path}`,
    sameAs: `https://ja.wikipedia.org/wiki/${encodeURIComponent(article)}`,
    ...(members.length > 0
      ? {
          member: members.map((m) => ({
            "@type": "Person",
            name: m.name,
            url: `${SITE_URL}${m.path}`,
          })),
        }
      : {}),
  };
}
