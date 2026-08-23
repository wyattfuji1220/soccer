import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guides } from "@/data/guides";
import { broadcasters } from "@/data/broadcasters";
import { leagueMap } from "@/data/leagues";
import { AdDisclosure } from "@/components/Badges";
import { broadcasterLink } from "@/lib/affiliate";
import { yen } from "@/lib/format";

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

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) notFound();

  const options = guide.league
    ? broadcasters.filter((b) => b.leagues.includes(guide.league!))
    : [];

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <nav className="text-sm muted mb-6">
        <Link href="/guides/" className="hover:underline">視聴ガイド</Link>
        <span className="mx-2">/</span>
        <span>{guide.title}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{guide.title}</h1>
      <p className="mt-3 text-xs muted">最終更新 {guide.updatedAt}</p>
      <p className="mt-6 muted leading-relaxed">{guide.description}</p>

      {guide.sections.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="text-xl font-bold mb-4">{s.heading}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i} className="leading-8 text-[15px] mb-4">{p}</p>
          ))}
        </section>
      ))}

      {options.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-2">
            {guide.league ? `${leagueMap[guide.league].name}を配信しているサービス` : "配信サービス"}
          </h2>
          <p className="text-sm muted mb-4">
            記載の料金・配信範囲は最終確認日時点のものです。申込前に必ず公式ページをご確認ください。
          </p>
          <div className="mb-4">
            <AdDisclosure />
          </div>
          <div className="space-y-3">
            {options.map((b) => (
              <div key={b.id} className="surface rounded-xl p-5 flex flex-wrap items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{b.name}</p>
                  <p className="text-sm muted mt-0.5">月額 {yen(b.monthlyPriceYen)}〜</p>
                  <p className="text-xs muted mt-1">最終確認: {b.lastChecked}</p>
                </div>
                <a
                  href={broadcasterLink(b)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="px-4 py-2.5 rounded-lg bg-pitch-500 text-white text-sm font-semibold hover:bg-pitch-600 transition-colors shrink-0"
                >
                  公式サイトで確認
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
