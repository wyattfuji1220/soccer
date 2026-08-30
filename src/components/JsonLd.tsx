/**
 * 構造化データを埋め込む。目には見えず、検索エンジンだけが読む。
 * 各ページで <script type="application/ld+json"> を書き下すと読みづらいので、
 * 1か所にまとめる。
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
