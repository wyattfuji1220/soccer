import type { Metadata } from "next";
import Link from "next/link";
import { leagueMap } from "@/data/leagues";
import { cupMap } from "@/data/cups";
import { Flag } from "@/components/Flag";
import { KickoffChart } from "@/components/KickoffChart";
import { broadcasters } from "@/data/broadcasters";
import { broadcasterLink } from "@/lib/affiliate";
import {
  getFixtures,
  groupByNight,
  playersInFixture,
  usingSampleData,
  fixturesUpdatedAt,
  fetchFailures,
} from "@/lib/fixtures";
import { jstTime, jstDate, fromJst } from "@/lib/jst";

export const metadata: Metadata = {
  title: "海外組の試合日程｜日本時間で見る欧州各リーグ",
  description:
    "日本人選手が所属するクラブの試合日程を、日本時間で一覧表示します。各試合の配信サービスも併記しています。",
};

function nightHeading(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return jstDate(fromJst(y, m, d, 12));
}

export default function FixturesPage() {
  const all = getFixtures(new Date());
  const nights = groupByNight(all);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">試合日程</h1>
      <p className="mt-3 muted text-sm max-w-2xl leading-relaxed">
        日本時間（JST）で表示しています。欧州の夜の試合は日本時間だと翌朝になるため、
        夜9時から翌朝9時までを「ひと晩」としてまとめています。
        {fixturesUpdatedAt ? ` データ最終更新: ${fixturesUpdatedAt}` : ""}
      </p>

      {usingSampleData && (
        <p className="mt-5 text-sm px-4 py-3 rounded-lg bg-amber-500/12 text-amber-700 dark:text-amber-400 leading-relaxed">
          <strong>これはサンプル日程です。</strong>{" "}
          football-data.org のAPIキーを <code className="font-mono text-xs">.env.local</code> に設定し、
          <code className="font-mono text-xs">npm run data:fixtures</code> を実行すると実際の日程に切り替わります。
        </p>
      )}

      {fetchFailures.length > 0 && (
        <p className="mt-5 text-sm px-4 py-3 rounded-lg bg-amber-500/12 text-amber-700 dark:text-amber-400 leading-relaxed">
          次の大会の日程は取得できませんでした:{" "}
          {fetchFailures.map((f) => `${f.competition}（${f.error}）`).join(" / ")}
          。このページには含まれていません。
        </p>
      )}

      <KickoffChart fixtures={all} />

      {nights.length === 0 && (
        <p className="mt-10 text-center muted text-sm">予定されている試合がありません。</p>
      )}

      <div className="mt-10 space-y-10">
        {nights.map(({ key, fixtures }) => (
          <section key={key}>
            <h2 className="text-sm font-bold tracking-wide pb-2 border-b" style={{ borderColor: "var(--border)" }}>
              {nightHeading(key)}の夜
              <span className="ml-2 muted font-normal">{fixtures.length}試合</span>
            </h2>

            <div>
              {fixtures.map((f) => {
                const kickoff = new Date(f.utcDate);
                const league = leagueMap[f.league];
                const featured = playersInFixture(f);
                const options = broadcasters.filter((b) => b.leagues.includes(f.league));

                return (
                  <div
                    key={f.id}
                    className="grid grid-cols-[auto_1fr] gap-x-4 py-4 border-b"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="pt-0.5">
                      <p className="num text-xl font-semibold leading-none accent">{jstTime(kickoff)}</p>
                    </div>
                    <div className="min-w-0">
                      {f.cup ? (
                        <p>
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-sm"
                            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                          >
                            {cupMap[f.cup].name}
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs muted flex items-center gap-1.5">
                          <Flag country={league.country} size={11} />
                          {league.name}
                        </p>
                      )}
                      <p className="mt-1 font-semibold leading-snug">
                        {f.homeTeam} <span className="muted font-normal mx-0.5">vs</span> {f.awayTeam}
                        {f.score && f.score.home !== null && (
                          <span className="ml-3 num">
                            {f.score.home} - {f.score.away}
                          </span>
                        )}
                      </p>
                      {featured.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {featured.map((p) => (
                            <Link
                              key={p.slug}
                              href={`/players/${p.slug}/`}
                              className="tap text-xs px-2.5 py-1 rounded-sm border hover:border-pitch-500 transition-colors"
                              style={{ borderColor: "var(--border)" }}
                            >
                              {p.nameJa}
                            </Link>
                          ))}
                        </div>
                      )}
                      {options.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] muted">視聴</span>
                          {options.map((b) => (
                            <a
                              key={b.id}
                              href={broadcasterLink(b)}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="text-[11px] font-semibold px-2 py-1 rounded bg-pitch-500/10 text-pitch-600 dark:text-pitch-300 hover:bg-pitch-500/20 transition-colors"
                            >
                              {b.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-xs muted leading-relaxed">
        日程データ出典:{" "}
        <a
          href="https://www.football-data.org/"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="hover:underline"
        >
          football-data.org
        </a>
        。どのサービスを契約すべきかは{" "}
        <Link href="/watch-plan/" className="text-pitch-600 dark:text-pitch-300 hover:underline">
          視聴プラン診断
        </Link>
        で計算できます。本ページの配信サービスへのリンクには広告が含まれます。
      </p>
    </div>
  );
}
