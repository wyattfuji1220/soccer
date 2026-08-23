import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { clubs } from "@/data/clubs";
import { players } from "@/data/players";
import { leagueMap } from "@/data/leagues";
import { broadcasters } from "@/data/broadcasters";
import { PlayerCard } from "@/components/PlayerCard";
import { AdDisclosure } from "@/components/Badges";
import { broadcasterLink } from "@/lib/affiliate";
import { yen } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return clubs.map((c) => ({ slug: c.slug }));
}

function context(slug: string) {
  const club = clubs.find((c) => c.slug === slug);
  if (!club) return null;

  const current = club.currentPlayers
    .map((n) => players.find((p) => p.nameJa === n))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const league = current[0] ? leagueMap[current[0].league] : null;
  const isJapanese = club.countries.includes("JPN") && current.length === 0;

  return { club, current, league, isJapanese };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ctx = context(slug);
  if (!ctx) return {};
  const { club, current, league, isJapanese } = ctx;

  if (isJapanese) {
    return {
      title: `${club.name}から海外へ渡った日本人選手`,
      description: `${club.name}に在籍したのち海外リーグでプレーしている日本人選手を、経歴とあわせて一覧にしています。`,
    };
  }
  return {
    title: `${club.name}の日本人選手`,
    description: `${club.name}に所属する日本人選手${
      current.length > 0 ? `（${current.map((p) => p.nameJa).join("・")}）` : ""
    }の情報と、${league ? `${league.name}を` : "試合を"}日本から観る方法をまとめています。`,
  };
}

export default async function ClubPage({ params }: Props) {
  const { slug } = await params;
  const ctx = context(slug);
  if (!ctx) notFound();
  const { club, current, league, isJapanese } = ctx;

  const watchOptions = current[0]
    ? broadcasters.filter((b) => b.leagues.includes(current[0].league))
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav className="text-sm muted mb-6">
        <Link href="/clubs/" className="hover:underline">クラブ別</Link>
        <span className="mx-2">/</span>
        <span>{club.name}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
        {isJapanese ? `${club.name}から海外へ渡った日本人選手` : `${club.name}の日本人選手`}
      </h1>
      {club.nameEn && <p className="muted mt-2">{club.nameEn}</p>}
      {league && (
        <p className="text-sm muted mt-2">
          {league.name}（{league.country}）
        </p>
      )}

      {current.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-1">現在所属している選手</h2>
          <p className="text-sm muted mb-5">
            {current.length}人。所属情報は各選手ページで出典と最終確認日をご確認ください。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {current.map((p) => (
              <PlayerCard key={p.slug} player={p} />
            ))}
          </div>
        </section>
      )}

      {club.pastPlayers.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-1">
            {isJapanese ? "在籍していた選手" : "過去に在籍した選手"}
          </h2>
          <p className="text-sm muted mb-4 leading-relaxed">
            当サイトに掲載している選手のうち、このクラブでプレーした経験がある{club.pastPlayers.length}人です。
            {isJapanese && "現在はいずれも海外のクラブに所属しています。"}
          </p>
          <ul className="list-none p-0 m-0">
            {club.pastPlayers.map((past) => {
              const p = players.find((x) => x.nameJa === past.nameJa);
              return (
                <li
                  key={past.nameJa}
                  className="grid grid-cols-[5.5rem_1fr_auto] gap-3 items-baseline py-3 border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="text-xs muted tabular-nums">{past.years ?? "—"}</span>
                  <span>
                    {p ? (
                      <Link href={`/players/${p.slug}/`} className="text-sm font-medium hover:underline">
                        {past.nameJa}
                      </Link>
                    ) : (
                      <span className="text-sm">{past.nameJa}</span>
                    )}
                    {past.loan && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 muted">
                        期限付き
                      </span>
                    )}
                  </span>
                  <span className="text-xs muted text-right">
                    {p ? `現在 ${p.club}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {watchOptions.length > 0 && league && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-2">{club.name}の試合を日本から観るには</h2>
          <p className="text-sm muted mb-4">
            {league.name}を配信しているサービスです。放映権は変動するため、必ず公式ページで最新の配信対象をご確認ください。
          </p>
          <div className="mb-4">
            <AdDisclosure />
          </div>
          <div className="space-y-3">
            {watchOptions.map((b) => (
              <div key={b.id} className="surface rounded-xl p-5 flex flex-wrap items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{b.name}</p>
                  <p className="text-sm muted mt-0.5">月額 {yen(b.monthlyPriceYen)}〜</p>
                  <p className="text-xs muted mt-1">配信内容の最終確認: {b.lastChecked}</p>
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
          <p className="mt-4 text-sm muted">
            複数の選手を追いかけている場合は{" "}
            <Link href="/watch-plan/" className="text-pitch-600 dark:text-pitch-300 hover:underline">
              視聴プラン診断
            </Link>
            で必要な契約と1試合あたりの単価を計算できます。
          </p>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-bold mb-3">出典</h2>
        <p className="text-sm">
          <a
            href={`https://ja.wikipedia.org/wiki/${encodeURIComponent(club.article)}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-pitch-600 dark:text-pitch-300 hover:underline"
          >
            Wikipedia: {club.article}
          </a>
        </p>
        <p className="mt-2 text-xs muted leading-relaxed">
          在籍情報は各選手のWikipedia記事のクラブ遍歴から集計しています。当サイトに掲載していない選手は含まれません。
        </p>
      </section>
    </div>
  );
}
