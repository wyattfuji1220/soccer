import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { players } from "@/data/players";
import { leagueMap } from "@/data/leagues";
import { clubsForPlayer } from "@/data/clubs";
import { PositionBadge, ConfidenceBadge, LoanBadge, AdDisclosure } from "@/components/Badges";
import { PlayerVideos } from "@/components/PlayerVideos";
import { BroadcasterList } from "@/components/BroadcasterList";
import { CupCoverage } from "@/components/CupCoverage";
import { CareerTimeline } from "@/components/CareerTimeline";
import { loanStatus } from "@/lib/loan";
import { age, formatDateJa } from "@/lib/format";
import { amazonSearchUrl, rakutenSearchUrl } from "@/lib/affiliate";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return players.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = players.find((p) => p.slug === slug);
  if (!player) return {};
  const league = leagueMap[player.league];
  return {
    title: `${player.nameJa}（${player.club}）の経歴・所属・視聴方法`,
    description: `${player.nameJa}（${player.nameEn}）の所属クラブ、ポジション、経歴を出典付きで整理。${league.name}の試合を日本から観る方法もまとめています。`,
  };
}

export default async function PlayerPage({ params }: Props) {
  const { slug } = await params;
  const player = players.find((p) => p.slug === slug);
  if (!player) notFound();

  const league = leagueMap[player.league];
  const latestCheck = player.sources[0]?.checkedAt;
  const relatedClubs = clubsForPlayer(player.nameJa);
  const loan = loanStatus(player);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.nameJa,
    alternateName: player.nameEn,
    birthDate: player.birthDate,
    nationality: { "@type": "Country", name: "Japan" },
    jobTitle: "プロサッカー選手",
    affiliation: { "@type": "SportsTeam", name: player.clubEn },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-sm muted mb-6">
        <Link href="/players/" className="hover:underline">選手一覧</Link>
        <span className="mx-2">/</span>
        <span>{player.nameJa}</span>
      </nav>

      <div className="flex items-start gap-4 flex-wrap">
        <PositionBadge position={player.position} />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{player.nameJa}</h1>
          <p className="muted mt-1">{player.nameEn}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ConfidenceBadge confidence={player.confidence} checkedAt={latestCheck} />
        {loan.onLoan && <LoanBadge parentClub={loan.parentClub} />}
      </div>

      {loan.onLoan && (
        <p className="mt-4 text-sm px-4 py-3 rounded-lg bg-violet-500/10 text-violet-800 dark:text-violet-200 leading-relaxed">
          {loan.parentClub
            ? `${loan.parentClub}から${player.club}へ期限付き移籍中です。契約上の保有元は${loan.parentClub}のため、移籍期間の終了後に所属が変わる可能性があります。`
            : `${player.club}へ期限付き移籍中です。移籍期間の終了後に所属が変わる可能性があります。`}
          クラブ遍歴の記載にもとづく判定です。
        </p>
      )}

      <section className="mt-8 surface rounded-xl overflow-hidden">
        <dl className="divide-y" style={{ borderColor: "var(--border)" }}>
          {[
            ["所属クラブ", player.club],
            ...(loan.onLoan && loan.parentClub ? [["保有元クラブ", loan.parentClub]] : []),
            ["リーグ", `${league.name}（${league.country}）`],
            ["ポジション", player.position],
            ["生年月日", `${formatDateJa(player.birthDate)}（${age(player.birthDate)}歳）`],
            ...(player.squadNumber ? [["背番号", String(player.squadNumber)]] : []),
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-3 gap-4 px-5 py-3.5 text-sm" style={{ borderColor: "var(--border)" }}>
              <dt className="muted">{k}</dt>
              <dd className="col-span-2 font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {player.facts && player.facts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">特徴</h2>
          <ul className="space-y-3">
            {player.facts.map((f, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-pitch-500 shrink-0" aria-hidden />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <CareerTimeline career={player.career} nationalCareer={player.nationalCareer} />

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">出典</h2>
        <ul className="space-y-2 text-sm">
          {player.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-pitch-600 dark:text-pitch-300 hover:underline">
                {s.label}
              </a>
              <span className="muted ml-2 text-xs">最終確認 {s.checkedAt}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs muted">
          Wikipedia の記述は クリエイティブ・コモンズ 表示-継承ライセンス にもとづき参照しています。
        </p>
      </section>

      <PlayerVideos slug={player.slug} playerName={player.nameJa} />

      <BroadcasterList league={player.league} heading={`${player.nameJa}の試合を日本から観るには`} />

      <CupCoverage league={player.league} />

      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">関連ページ</h2>
        <div className="flex flex-wrap gap-2">
          {relatedClubs.map((c) => (
            <Link
              key={c.slug}
              href={`/clubs/${c.slug}/`}
              className="text-sm px-3 py-2 rounded-lg border hover:border-pitch-500/60 transition-colors"
              style={{ borderColor: "var(--border)" }}
            >
              {c.name}の日本人選手
            </Link>
          ))}
          <Link
            href={`/players/?league=${player.league}`}
            className="text-sm px-3 py-2 rounded-lg border hover:border-pitch-500/60 transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            {league.name}の日本人選手
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold mb-2">関連グッズ・書籍を探す</h2>
        <p className="text-sm muted mb-4">各ショップの検索結果ページへ移動します。</p>
        <div className="mb-4">
          <AdDisclosure />
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={amazonSearchUrl(`${player.nameJa} ${player.clubEn} ユニフォーム`)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="px-4 py-2.5 rounded-lg surface text-sm font-semibold hover:border-pitch-500/50 transition-colors"
          >
            Amazonでユニフォームを探す
          </a>
          <a
            href={rakutenSearchUrl(`${player.nameJa} ユニフォーム`)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="px-4 py-2.5 rounded-lg surface text-sm font-semibold hover:border-pitch-500/50 transition-colors"
          >
            楽天市場でユニフォームを探す
          </a>
          <a
            href={amazonSearchUrl(`${league.name} 書籍`)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="px-4 py-2.5 rounded-lg surface text-sm font-semibold hover:border-pitch-500/50 transition-colors"
          >
            {league.name}関連の書籍を探す
          </a>
        </div>
      </section>
    </div>
  );
}
