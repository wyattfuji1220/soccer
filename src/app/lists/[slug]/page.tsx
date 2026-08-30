import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { byLeague, playerListMap, playerLists } from "@/lib/lists";
import { PlayerCard } from "@/components/PlayerCard";
import { Flag } from "@/components/Flag";
import { age } from "@/lib/format";
import { Jp } from "@/lib/jp";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return playerLists.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const list = playerListMap[slug];
  if (!list) return {};
  return { title: list.title, description: list.description };
}

export default async function ListPage({ params }: Props) {
  const { slug } = await params;
  const list = playerListMap[slug];
  if (!list) notFound();

  const groups = byLeague(list.players);
  const ages = list.players.map((p) => age(p.birthDate)).sort((a, b) => a - b);
  const median = ages.length > 0 ? ages[Math.floor(ages.length / 2)] : null;

  return (
    <Jp as="div" className="mx-auto max-w-6xl px-4 py-12">
      <nav className="text-sm muted mb-6">
        <Link href="/players/" className="hover:underline">
          選手一覧
        </Link>
        <span className="mx-2">/</span>
        <span>{list.heading}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight">{list.title}</h1>
      <p className="mt-3 muted text-sm max-w-2xl leading-relaxed">{list.lead}</p>
      <p className="mt-4 text-sm">
        <span className="num text-2xl font-semibold">{list.players.length}</span>
        <span className="muted ml-1">人が該当します。</span>
        {median !== null && (
          <span className="muted">
            年齢の中央値は<span className="num mx-1">{median}</span>歳、
            {groups.length}リーグに分かれています。
          </span>
        )}
      </p>

      {groups.map(({ league, players }) => (
        <section key={league.id} className="mt-10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Flag country={league.country} size={14} />
            {league.name}
            <span className="num text-sm muted font-normal">{players.length}人</span>
          </h2>
          <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((p) => (
              <PlayerCard key={p.slug} player={p} />
            ))}
          </div>
        </section>
      ))}

      <section className="mt-14">
        <h2 className="text-lg font-bold mb-3">ほかの切り口で探す</h2>
        <div className="flex flex-wrap gap-2">
          {playerLists
            .filter((l) => l.slug !== list.slug)
            .map((l) => (
              <Link
                key={l.slug}
                href={`/lists/${l.slug}/`}
                className="tap px-3 py-2 rounded-md text-sm surface hover:border-pitch-500/60 transition-colors"
              >
                {l.heading}
                <span className="num muted ml-1.5 text-xs">{l.players.length}</span>
              </Link>
            ))}
        </div>
      </section>

      <p className="mt-10 text-xs muted leading-relaxed max-w-[42em]">
        所属クラブは移籍により変わります。各選手ページに出典と最終確認日を載せているので、あわせてご確認ください。
      </p>
    </Jp>
  );
}
