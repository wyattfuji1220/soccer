import type { Metadata } from "next";
import Link from "next/link";
import { leagueMap, leagues } from "@/data/leagues";
import { cupMap } from "@/data/cups";
import { highlightsTakenAt } from "@/data/highlights";
import { finishedFixtures, playersInFixture, usingSampleData } from "@/lib/fixtures";
import { highlightFor, youtubeUrl } from "@/lib/highlights";
import { jstDate } from "@/lib/jst";
import { breadcrumb, collection } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { ResultBoard, type ResultRow } from "./ResultBoard";
import { Jp } from "@/lib/jp";

export const metadata: Metadata = {
  title: "海外組の試合結果とハイライト｜日本人選手が出た試合",
  description:
    "日本人選手が所属するクラブの試合結果を、公式チャンネルのハイライト動画とあわせて一覧にしています。スコアは既定でふせているので、これから観る試合の結果が目に入りません。",
};

function toRows(now: Date): ResultRow[] {
  return finishedFixtures(now).map((f) => {
    const kickoff = new Date(f.utcDate);
    const league = leagueMap[f.league];
    const highlight = highlightFor(f);

    return {
      id: String(f.id),
      date: f.utcDate.slice(0, 10),
      dateLabel: jstDate(kickoff),
      utcDate: f.utcDate,
      league: f.league,
      leagueName: league.name,
      country: league.country,
      cupName: f.cup ? cupMap[f.cup].name : null,
      home: f.homeTeam,
      away: f.awayTeam,
      score: `${f.score?.home} - ${f.score?.away}`,
      players: playersInFixture(f).map((p) => ({ slug: p.slug, name: p.nameJa })),
      highlight: highlight
        ? {
            videoId: highlight.videoId,
            title: highlight.title,
            channel: highlight.channel,
            url: youtubeUrl(highlight.videoId),
          }
        : null,
    };
  });
}

export default function ResultsPage() {
  const rows = toRows(new Date());
  const present = [...new Set(rows.map((r) => r.league))];
  const options = leagues
    .filter((l) => present.includes(l.id))
    .map((l) => ({ id: l.id, name: l.name, country: l.country }));
  const withHighlight = rows.filter((r) => r.highlight !== null).length;

  return (
    <Jp as="div" className="mx-auto max-w-4xl px-4 py-12">
      <JsonLd data={breadcrumb([{ name: "試合日程", path: "/fixtures/" }, { name: "試合結果" }])} />
      <JsonLd
        data={collection({
          name: "海外組の試合結果とハイライト",
          description: "日本人選手が所属するクラブの試合結果と、公式チャンネルのハイライト動画",
          path: "/results/",
          items: rows.map((r) => ({ name: `${r.home} vs ${r.away}` })),
        })}
      />

      <nav className="text-sm muted mb-6">
        <Link href="/fixtures/" className="hover:underline">
          試合日程
        </Link>
        <span className="mx-2">/</span>
        <span>試合結果</span>
      </nav>

      <p className="label muted">Results</p>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mt-1">
        試合結果とハイライト
      </h1>
      <p className="mt-5 leading-relaxed muted max-w-[40em]">
        日本人選手が所属するクラブの、終わった試合です。公式チャンネルにハイライトが出ていれば一緒に並べます。スコアは既定でふせているので、これから観るつもりの試合の結果が目に入りません。
      </p>

      {usingSampleData ? (
        <p className="mt-8 text-sm px-4 py-3 rounded-lg bg-amber-500/12 text-amber-700 dark:text-amber-400 leading-relaxed">
          <strong>これはサンプル日程です。</strong>{" "}
          football-data.org のAPIキーを設定して <code className="font-mono text-xs">npm run data:fixtures</code>{" "}
          を実行すると、実際の結果に切り替わります。
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-10 text-center muted text-sm">終わった試合がまだありません。</p>
      ) : (
        <>
          <p className="mt-6 text-sm muted">
            <span className="num text-2xl font-semibold">{rows.length}</span>
            <span className="ml-1">試合</span>
            <span className="mx-2">/</span>
            <span className="num text-2xl font-semibold accent">{withHighlight}</span>
            <span className="ml-1">試合にハイライトあり</span>
          </p>
          <ResultBoard rows={rows} leagues={options} />
        </>
      )}

      <section className="mt-14">
        <h2 className="text-lg font-bold mb-3">ハイライトについて</h2>
        <ul className="space-y-3 text-sm leading-relaxed muted">
          <li>
            <strong style={{ color: "var(--text)" }}>権利者の公式チャンネルのものだけです。</strong>{" "}
            DAZN Japan と U-NEXT フットボールが投稿した動画へのリンクで、当サイトは映像を保存も再配信もしていません。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>すべての試合にあるわけではありません。</strong>{" "}
            権利者が投稿していない試合には出ません。とくにブンデスリーガは、いまのところ投稿が見つかっていません。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>リーグでは絞っていません。</strong>{" "}
            権利者が新しいリーグの投稿を始めれば、こちらの手を加えなくても自動的に載ります。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>動画の突き合わせは題名によります。</strong>{" "}
            クラブ名が題名にあり、公開日が試合の直後のものを結び付けています。まれに取り違えが起きる可能性があります。最終取得は{highlightsTakenAt}です。
          </li>
        </ul>
        <p className="mt-4 text-xs muted">
          これからの試合は{" "}
          <Link href="/fixtures/" className="text-pitch-600 dark:text-pitch-300 hover:underline">
            試合日程
          </Link>
          をご覧ください。
        </p>
      </section>
    </Jp>
  );
}
