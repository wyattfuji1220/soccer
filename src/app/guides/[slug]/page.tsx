import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guides } from "@/data/guides";
import { BroadcasterList } from "@/components/BroadcasterList";
import type { Block } from "@/lib/types";
import { Jp } from "@/lib/jp";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) return {};
  return { title: guide.title, description: guide.description };
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <Jp as="p" className="leading-8 text-[15px] mb-4 max-w-[40em]">
          {block.text}
        </Jp>
      );

    case "list":
      return (
        <Jp as="ul" className="space-y-2.5 mb-5 max-w-[40em]">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-7">
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-pitch-500 shrink-0" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </Jp>
      );

    case "table":
      return (
        <Jp as="figure" className="m-0 mb-6">
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-sm border-collapse min-w-[26rem]">
              <thead>
                <tr>
                  {block.head.map((h) => (
                    <th
                      key={h}
                      className="text-left font-bold px-4 py-3 whitespace-nowrap"
                      style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-4 py-3 align-top leading-6 ${j > 0 ? "num" : "font-medium"}`}
                        style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.note && <figcaption className="text-xs muted mt-2 leading-relaxed">{block.note}</figcaption>}
        </Jp>
      );

    case "callout":
      return (
        <Jp
          as="p"
          className="text-[15px] leading-7 mb-5 px-5 py-4 rounded-lg border-l-2 border-pitch-500 max-w-[42em]"
          style={{ background: "color-mix(in srgb, var(--color-pitch-500) 7%, var(--surface))" }}
        >
          {block.text}
        </Jp>
      );

    case "broadcasters":
      return <BroadcasterList league={block.league} heading={block.heading} />;
  }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    dateModified: guide.updatedAt,
    inLanguage: "ja",
  };

  return (
    <Jp as="article" className="mx-auto max-w-3xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-sm muted mb-6">
        <Link href="/guides/" className="hover:underline">視聴ガイド</Link>
        <span className="mx-2">/</span>
        <span>{guide.title}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{guide.title}</h1>
      <p className="mt-3 text-xs muted">最終更新 {guide.updatedAt}</p>
      <p className="mt-6 muted leading-relaxed">{guide.description}</p>

      {guide.sections.map((s) => (
        <section key={s.heading} className="mt-12">
          <h2 className="text-xl font-bold mb-5">{s.heading}</h2>
          {s.blocks.map((b, i) => (
            <BlockView key={i} block={b} />
          ))}
        </section>
      ))}

      {guide.sources && guide.sources.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-bold mb-3">確認に用いた情報源</h2>
          <ul className="space-y-2 text-sm">
            {guide.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-pitch-600 dark:text-pitch-300 hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs muted leading-relaxed">
            料金と配信対象は{guide.updatedAt}時点で各サービスの公式ページを確認した内容です。放映権はシーズンごと、時にはシーズン途中でも変更されます。申し込み前に必ず公式ページで最新の情報をご確認ください。
          </p>
        </section>
      )}

      <section className="mt-12">
        <p className="label muted mb-2">Editorial Note</p>
        <p className="text-xs muted leading-relaxed max-w-[42em]">
          本サイトの文章は、運営者が生成AIを用いて作成しています。配信サービスの料金・配信対象、選手の所属・経歴は公式サイトやWikipediaなどの一次情報と照合し、最終確認日を各ページに明記しています。
        </p>
      </section>

      <section className="mt-12 surface rounded-xl p-6">
        <p className="font-bold">追いかけたい選手が複数いる場合</p>
        <p className="mt-2 text-sm muted leading-relaxed">
          必要な契約の組み合わせは直感では判断しにくくなります。選手を選ぶだけで、必要なサービス・年間費用・
          1試合あたりの単価を計算できます。
        </p>
        <Link
          href="/watch-plan/"
          className="mt-4 inline-block px-4 py-2.5 rounded-lg bg-pitch-500 text-white text-sm font-semibold hover:bg-pitch-600 transition-colors"
        >
          視聴プラン診断を使う →
        </Link>
      </section>
    </Jp>
  );
}
