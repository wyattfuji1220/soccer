import Link from "next/link";
import { players } from "@/data/players";
import { leagues, leagueMap } from "@/data/leagues";
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
        <p className="text-sm font-semibold text-pitch-600 dark:text-pitch-300">
          欧州で戦う日本人選手のファクトデータベース
        </p>
        <h1 className="mt-4 text-3xl md:text-5xl font-bold leading-tight tracking-tight max-w-3xl">
          今夜、誰の試合が、
          <br />
          何時に、どこで観られるか。
        </h1>
        <p className="mt-5 max-w-2xl muted leading-relaxed">
          海外組の試合を日本時間で並べ、それぞれの配信先まで示します。所属や経歴は出典と最終確認日つき。
          推測や噂は載せません。
        </p>
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
          className="block rounded-2xl p-6 sm:p-8 border border-pitch-500/40 hover:border-pitch-500 transition-colors"
          style={{ background: "color-mix(in srgb, var(--color-pitch-500) 7%, var(--surface))" }}
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="max-w-xl">
              <p className="text-xs font-bold text-pitch-600 dark:text-pitch-300">視聴プラン診断</p>
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

      <section className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="text-xl font-bold mb-5">リーグ別</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {byLeague.map(({ league, count }) => (
            <Link
              key={league.id}
              href={`/players/?league=${league.id}`}
              className="surface rounded-xl p-4 hover:border-pitch-500/50 transition-colors"
            >
              <p className="text-2xl font-bold tabular-nums">
                {count}
                <span className="text-sm font-normal muted ml-1">人</span>
              </p>
              <p className="text-sm mt-1 truncate">{league.name}</p>
              <p className="text-xs muted">{league.country}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-xl font-bold">注目の選手</h2>
          <Link href="/players/" className="text-sm text-pitch-600 dark:text-pitch-300 hover:underline">
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
        <div className="surface rounded-2xl p-6 sm:p-8">
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
          <p className="mt-6 text-xs muted">
            現在の掲載選手数: {players.length}人 / 対象リーグ: {Object.keys(leagueMap).length}リーグ
          </p>
        </div>
      </section>
    </>
  );
}
