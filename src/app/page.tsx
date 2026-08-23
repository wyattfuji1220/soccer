import Link from "next/link";
import { players } from "@/data/players";
import { leagues, leagueMap } from "@/data/leagues";
import { PlayerCard } from "@/components/PlayerCard";

export default function Home() {
  const byLeague = leagues
    .map((l) => ({ league: l, count: players.filter((p) => p.league === l.id).length }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const featured = players.slice(0, 8);

  return (
    <>
      <section className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="text-sm font-semibold text-pitch-600 dark:text-pitch-300 mb-4">
            欧州で戦う日本人選手のファクトデータベース
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight max-w-3xl">
            誰が、どこで、いつ戦っているか。
            <br />
            出典付きで、正確に。
          </h1>
          <p className="mt-6 max-w-2xl muted leading-relaxed">
            所属クラブ・経歴・試合日程を一次情報にもとづいて整理しています。
            推測や噂は載せません。情報の確度と最終確認日をすべてのページに明記しています。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/players/"
              className="px-5 py-3 rounded-lg bg-pitch-500 text-white font-semibold hover:bg-pitch-600 transition-colors"
            >
              選手を探す
            </Link>
            <Link
              href="/guides/"
              className="px-5 py-3 rounded-lg surface font-semibold hover:border-pitch-500/50 transition-colors"
            >
              日本から観る方法
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-bold mb-6">リーグ別</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {byLeague.map(({ league, count }) => (
            <Link
              key={league.id}
              href={`/players/?league=${league.id}`}
              className="surface rounded-xl p-4 hover:border-pitch-500/50 transition-colors"
            >
              <p className="text-2xl font-bold">{count}<span className="text-sm font-normal muted ml-1">人</span></p>
              <p className="text-sm mt-1 truncate">{league.name}</p>
              <p className="text-xs muted">{league.country}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-baseline justify-between mb-6">
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

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="surface rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-3">このサイトの編集方針</h2>
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
