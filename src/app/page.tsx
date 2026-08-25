import Link from "next/link";
import { players } from "@/data/players";
import { leagues, leagueMap } from "@/data/leagues";
import { clubs } from "@/data/clubs";
import { guides } from "@/data/guides";
import { PlayerCard } from "@/components/PlayerCard";
import { TonightBoard } from "@/components/TonightBoard";
import { getFixtures, groupByNight, playersInFixture } from "@/lib/fixtures";
import { SITE_URL } from "@/lib/site";
import type { LeagueId } from "@/lib/types";

export default function Home() {
  // 静的ビルド時点の日時。クライアント側で実時刻に差し替わる。
  const buildTime = new Date().toISOString();

  const byLeague = leagues
    .map((l) => ({ league: l, count: players.filter((p) => p.league === l.id).length }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  // 選手データは五十音順なので、そのまま並べると偏る。主要リーグの選手を優先して見せる
  const featurePriority: LeagueId[] = ["premier-league", "la-liga", "bundesliga", "serie-a", "ligue-1"];
  const featured = [...players]
    .sort((a, b) => {
      const rank = (id: LeagueId) => {
        const i = featurePriority.indexOf(id);
        return i === -1 ? featurePriority.length : i;
      };
      return rank(a.league) - rank(b.league);
    })
    .slice(0, 8);

  // 検索結果に日程が出る可能性を上げるため、直近の試合を SportsEvent として出力する
  const nextNight = groupByNight(getFixtures(new Date()))[0];
  const eventsJsonLd = (nextNight?.fixtures ?? []).slice(0, 8).map((f) => ({
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${f.homeTeam} vs ${f.awayTeam}`,
    startDate: f.utcDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: f.homeTeam, address: leagueMap[f.league].country },
    competitor: [
      { "@type": "SportsTeam", name: f.homeTeamEn },
      { "@type": "SportsTeam", name: f.awayTeamEn },
    ],
    url: `${SITE_URL}/fixtures/`,
    about: playersInFixture(f).map((p) => ({ "@type": "Person", name: p.nameJa })),
  }));

  return (
    <>
      <section className="mx-auto max-w-5xl px-4 pt-14 pb-6">
        <p className="label text-pitch-600 dark:text-pitch-300">Japanese Players Abroad</p>
        <p className="mt-3 text-sm font-bold">欧州で戦う日本人選手のファクトデータベース</p>
        <h1 className="mt-4 text-3xl md:text-5xl font-black leading-tight max-w-3xl">
          今夜、誰の試合が、
          <br />
          何時に、どこで観られるか。
        </h1>
        <p className="mt-5 max-w-2xl muted">
          海外組の試合を日本時間で並べ、それぞれの配信先まで示します。所属や経歴は出典と最終確認日つき。
          推測や噂は載せません。
        </p>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
          {[
            ["掲載選手", players.length, "人"],
            ["対象リーグ", byLeague.length, "リーグ"],
            ["クラブ", clubs.length, "クラブ"],
            ["視聴ガイド", guides.length, "本"],
          ].map(([label, value, unit]) => (
            <div key={label as string}>
              <dt className="label muted">{label}</dt>
              <dd className="num text-2xl font-semibold mt-1.5">
                {value}
                <span className="text-xs font-normal muted ml-1.5 font-sans">{unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-4">
        <TonightBoard buildTime={buildTime} />
        {eventsJsonLd.map((e, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(e) }}
          />
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <Link
          href="/watch-plan/"
          className="block rounded-xl p-6 sm:p-8 border hover:border-pitch-500/70 transition-colors"
          style={{
            borderColor: "var(--border)",
            borderTop: "2px solid var(--accent)",
            background: "color-mix(in srgb, var(--accent) 5%, var(--surface))",
          }}
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="max-w-xl">
              <p className="label text-pitch-600 dark:text-pitch-300">Watch Plan Finder</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold leading-snug">
                その契約、本当に必要ですか。
              </p>
              <p className="mt-3 text-sm muted leading-relaxed">
                追いかけたい選手を選ぶだけで、必要な配信サービスの組み合わせ・年間費用・
                1試合あたりの単価を計算します。
              </p>
            </div>
            <span className="text-sm font-semibold text-pitch-600 dark:text-pitch-300 whitespace-nowrap">
              診断する →
            </span>
          </div>
        </Link>
      </section>

      <div className="mx-auto max-w-5xl px-4 pt-10">
        <div className="border-t" style={{ borderColor: "var(--border)" }} />
      </div>

      <section className="mx-auto max-w-5xl px-4 pt-10 pb-8">
        <p className="label muted">Browse by League</p>
        <h2 className="text-xl font-bold mt-2 mb-1">リーグ別</h2>
        <p className="text-sm muted mb-5">クリックすると、そのリーグの選手だけに絞り込みます。</p>
        <ul className="surface rounded-lg px-5 py-1 md:grid md:grid-cols-2 md:gap-x-10">
          {byLeague.map(({ league, count }, i) => (
            <li key={league.id} className={i === 0 || i === 1 ? "md:border-t-0" : ""} style={{ borderTop: i === 0 ? "none" : "1px solid var(--hairline)" }}>
              <Link
                href={`/players/?league=${league.id}`}
                className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-2.5 group"
              >
                <span className="num text-xl font-semibold accent text-right">{count}</span>
                <span className="text-sm font-medium truncate group-hover:text-pitch-600 dark:group-hover:text-pitch-300 transition-colors">
                  {league.name}
                </span>
                <span className="text-xs muted">{league.country}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-xl font-bold">注目の選手</h2>
          <Link href="/players/" className="tap text-sm text-pitch-600 dark:text-pitch-300 hover:underline">
            すべて見る →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((p) => (
            <PlayerCard key={p.slug} player={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="surface rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-4">このサイトの編集方針</h2>
          <ul className="space-y-3 text-sm leading-relaxed muted">
            <li>
              <strong style={{ color: "var(--text)" }}>出典を明示する。</strong>{" "}
              所属クラブや経歴などの事実には、確認に用いた情報源と確認日を添えています。
            </li>
            <li>
              <strong style={{ color: "var(--text)" }}>権利物を扱わない。</strong>{" "}
              選手写真・クラブエンブレム・試合映像は掲載せず、データと文章のみで構成しています。
            </li>
            <li>
              <strong style={{ color: "var(--text)" }}>不確かなものは不確かと書く。</strong>{" "}
              移籍市場の期間中など、情報が変動しうる項目には「要再確認」を表示します。
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
