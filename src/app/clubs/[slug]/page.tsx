import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { clubs } from "@/data/clubs";
import { players } from "@/data/players";
import { alumniAtClub, countriesOf } from "@/lib/alumni";
import { countryNameJa } from "@/lib/countries";
import { leagueMap } from "@/data/leagues";
import { PlayerCard } from "@/components/PlayerCard";
import { BroadcasterList } from "@/components/BroadcasterList";
import { Jp } from "@/lib/jp";

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
  const history = alumniAtClub(club.article);
  const isJapanese = club.countries.includes("JPN") && current.length === 0;

  return { club, current, league, isJapanese, history };
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
  const { club, current, league, isJapanese, history } = ctx;


  return (
    <Jp as="div" className="mx-auto max-w-4xl px-4 py-12">
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
                  <span className="text-xs muted num">{past.years ?? "—"}</span>
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

      {current[0] && (
        <>
          <BroadcasterList league={current[0].league} heading={`${club.name}の試合を日本から観るには`} />
          <p className="mt-4 text-sm muted">
            複数の選手を追いかけている場合は{" "}
            <Link href="/watch-plan/" className="text-pitch-600 dark:text-pitch-300 hover:underline">
              視聴プラン診断
            </Link>
            で必要な契約と1試合あたりの単価を計算できます。
          </p>
        </>
      )}

      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-1">歴代の日本人選手</h2>
          <p className="text-sm muted mb-4 leading-relaxed max-w-[40em]">
            当サイトの掲載範囲の外まで広げ、このクラブに在籍した記録がある日本人選手を並べています。引退した選手や国内へ戻った選手を含みます。
          </p>
          <ul className="list-none p-0 m-0">
            {history.map(({ player, from, to }) => (
              <li key={player.article} className="grid grid-cols-[7rem_1fr] gap-3 items-baseline py-3 border-t" style={{ borderColor: "var(--hairline)" }}>
                <span className="num text-xs muted">
                  {from}
                  {to === null ? "年〜" : to === from ? "年" : `〜${to}`}
                </span>
                <span className="text-sm">
                  <a
                    href={`https://ja.wikipedia.org/wiki/${encodeURIComponent(player.article)}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="font-medium hover:underline"
                  >
                    {player.nameJa}
                  </a>
                  <span className="muted text-xs ml-2">{countriesOf(player).map(countryNameJa).join("・")}</span>
                </span>
              </li>
            ))}
          </ul>
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
          在籍情報は各選手のWikipedia記事のクラブ遍歴から集計しています。歴代の一覧はWikipediaに記事がある選手が対象で、記事のない選手は含まれません。
        </p>
      </section>
    </Jp>
  );
}
