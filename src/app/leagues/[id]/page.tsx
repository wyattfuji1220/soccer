import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { leagues, leagueMap } from "@/data/leagues";
import { players } from "@/data/players";
import { clubs } from "@/data/clubs";
import { season, seasonStatMap } from "@/data/season-stats";
import { alumniAtClub } from "@/lib/alumni";
import { PlayerCard } from "@/components/PlayerCard";
import { BroadcasterList } from "@/components/BroadcasterList";
import { CupCoverage } from "@/components/CupCoverage";
import { Flag } from "@/components/Flag";
import { age } from "@/lib/format";
import { Jp } from "@/lib/jp";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumb, collection } from "@/lib/schema";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return leagues.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const league = leagues.find((l) => l.id === id);
  if (!league) return {};
  const n = players.filter((p) => p.league === league.id).length;
  const title = `${league.name}の日本人選手${n}人｜所属クラブと視聴方法`;
  const description = `${league.name}（${league.country}）でプレーする日本人選手${n}人を、所属クラブ・今季の成績とあわせて一覧にしています。日本から試合を観る方法もまとめました。`;
  const image = { url: `/leagues/${league.id}/og.png`, width: 1200, height: 630, alt: league.name };
  return {
    title,
    description,
    openGraph: { title, description, images: [image] },
    twitter: { title, description, images: [image] },
  };
}

export default async function LeaguePage({ params }: Props) {
  const { id } = await params;
  const league = leagues.find((l) => l.id === id);
  if (!league) notFound();

  const squad = players.filter((p) => p.league === league.id);

  /* このリーグのクラブごとにまとめる。人数が多い順 */
  const byClub = (() => {
    const m = new Map<string, typeof squad>();
    for (const p of squad) m.set(p.club, [...(m.get(p.club) ?? []), p]);
    return [...m].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "ja"));
  })();

  const stats = squad
    .map((p) => ({ player: p, stat: seasonStatMap[p.slug] }))
    .filter((x) => x.stat !== undefined)
    .sort((a, b) => b.stat.goals - a.stat.goals || b.stat.apps - a.stat.apps);

  /* このリーグのクラブに在籍した、掲載範囲外の日本人 */
  const history = byClub
    .map(([clubName]) => {
      const club = clubs.find((c) => c.name === clubName);
      return { clubName, past: club ? alumniAtClub(club.article) : [] };
    })
    .filter((x) => x.past.length > 0);

  const ages = squad.map((p) => age(p.birthDate)).sort((a, b) => a - b);
  const median = ages.length > 0 ? ages[Math.floor(ages.length / 2)] : null;
  const others = leagues.filter((l) => l.id !== league.id && players.some((p) => p.league === l.id));

  return (
    <Jp as="div" className="mx-auto max-w-5xl px-4 py-12">
      <JsonLd data={breadcrumb([{ name: "選手一覧", path: "/players/" }, { name: league.name }])} />
      <JsonLd
        data={collection({
          name: `${league.name}の日本人選手`,
          description: `${league.country}の${league.name}に所属する日本人選手${squad.length}人の一覧`,
          path: `/leagues/${league.id}/`,
          items: squad.map((p) => ({ name: p.nameJa, path: `/players/${p.slug}/` })),
        })}
      />
      <nav className="text-sm muted mb-6">
        <Link href="/players/" className="hover:underline">
          選手一覧
        </Link>
        <span className="mx-2">/</span>
        <span>{league.name}</span>
      </nav>

      <p className="label muted flex items-center gap-2">
        <Flag country={league.country} size={12} />
        {league.nameEn}
      </p>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">{league.name}の日本人選手</h1>
      <p className="mt-4 text-sm muted leading-relaxed max-w-2xl">
        {league.country}の{league.name}に所属する日本人選手を、クラブごとにまとめています。
        {median !== null && `年齢の中央値は${median}歳、${byClub.length}クラブに分かれています。`}
        1クラブあたりのリーグ戦は年間{league.matchesPerSeason}試合です。
      </p>

      {squad.length === 0 ? (
        <p className="mt-10 muted text-sm">現在、このリーグに掲載中の日本人選手はいません。</p>
      ) : (
        <>
          <p className="mt-6">
            <span className="num text-4xl font-semibold">{squad.length}</span>
            <span className="muted ml-2 text-sm">人が在籍中</span>
          </p>

          {byClub.map(([clubName, list]) => (
            <section key={clubName} className="mt-10">
              <h2 className="text-lg font-bold">
                {clubName}
                <span className="num text-sm muted font-normal ml-2">{list.length}人</span>
              </h2>
              <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p) => (
                  <PlayerCard key={p.slug} player={p} />
                ))}
              </div>
            </section>
          ))}

          {stats.length > 0 && (
            <section className="mt-14">
              <h2 className="text-xl font-bold mb-1">今季の記録（{season}）</h2>
              <p className="text-sm muted mb-4 leading-relaxed max-w-[40em]">
                英語版Wikipediaの成績表に今季の行がある{stats.length}人ぶんです。リーグ戦のみで、記載がない選手は載りません（0試合という意味ではありません）。
              </p>
              <ul>
                {stats.map(({ player, stat }) => (
                  <li key={player.slug} className="grid grid-cols-[1fr_auto_auto] gap-x-5 py-3 hair items-baseline">
                    <Link href={`/players/${player.slug}/`} className="font-medium hover:underline truncate">
                      {player.nameJa}
                    </Link>
                    <span className="num text-sm">
                      {stat.apps}
                      <span className="text-xs muted ml-1">試合</span>
                    </span>
                    <span className="num text-sm w-16 text-right">
                      {stat.goals}
                      <span className="text-xs muted ml-1">点</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {history.length > 0 && (
            <section className="mt-14">
              <h2 className="text-xl font-bold mb-1">これらのクラブでプレーした日本人</h2>
              <p className="text-sm muted mb-4 leading-relaxed max-w-[40em]">
                いま日本人が所属しているクラブに、過去に在籍した選手です。当時どの階層にいたかは分からないため、リーグではなくクラブ単位で並べています。
              </p>
              <ul className="space-y-3">
                {history.map(({ clubName, past }) => (
                  <li key={clubName} className="grid grid-cols-1 sm:grid-cols-[13rem_1fr] gap-x-5 gap-y-1 py-3 hair">
                    <span className="font-medium text-sm">{clubName}</span>
                    <span className="text-sm muted">
                      {past.map((x) => `${x.player.nameJa}（${x.from}${x.to === null ? "年〜" : x.to === x.from ? "年" : `〜${x.to}`}）`).join("、")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <BroadcasterList league={league.id} heading={`${league.name}を日本から観るには`} />
          <CupCoverage league={league.id} />
        </>
      )}

      <section className="mt-14">
        <h2 className="text-lg font-bold mb-3">ほかのリーグ</h2>
        <div className="flex flex-wrap gap-2">
          {others.map((l) => (
            <Link
              key={l.id}
              href={`/leagues/${l.id}/`}
              className="tap px-3 py-2 rounded-md text-sm surface hover:border-pitch-500/60 transition-colors flex items-center gap-1.5"
            >
              <Flag country={l.country} size={11} />
              {l.name}
              <span className="num muted text-xs">{players.filter((p) => p.league === l.id).length}</span>
            </Link>
          ))}
        </div>
      </section>
    </Jp>
  );
}
