import type { Metadata } from "next";
import Link from "next/link";
import { leagueMap, leagues } from "@/data/leagues";
import { cupMap } from "@/data/cups";
import { broadcasters } from "@/data/broadcasters";
import { broadcasterLink } from "@/lib/affiliate";
import { getFixtures, playersInFixture, usingSampleData, fixturesUpdatedAt, fetchFailures } from "@/lib/fixtures";
import { jstTime, jstDate, nightKey } from "@/lib/jst";
import { FixtureBoard, type FixtureRow } from "./FixtureBoard";
import { Jp } from "@/lib/jp";

export const metadata: Metadata = {
  title: "海外組の試合日程｜日本時間で見る欧州各リーグ",
  description:
    "日本人選手が所属するクラブの試合日程を、日本時間で一覧表示します。リーグと選手名でしぼり込め、終わった試合の結果はふせて表示します。",
};

/**
 * 表示に要るものはここで組み立ててから渡す。
 * 絞り込みの操作はブラウザ側でやるが、選手データや配信データをそのまま
 * 渡すと全部がブラウザに送られてしまうため、必要な形に削っておく。
 */
function toRows(now: Date): FixtureRow[] {
  return getFixtures(now).map((f) => {
    const kickoff = new Date(f.utcDate);
    const league = leagueMap[f.league];
    const players = playersInFixture(f);
    const services = broadcasters.filter((b) => b.leagues.includes(f.league));
    const finished = f.status === "FINISHED" && f.score?.home != null && f.score?.away != null;

    return {
      id: String(f.id),
      night: nightKey(kickoff),
      nightLabel: jstDate(kickoff),
      utcDate: f.utcDate,
      time: jstTime(kickoff),
      league: f.league,
      leagueName: league.name,
      country: league.country,
      cupName: f.cup ? cupMap[f.cup].name : null,
      home: f.homeTeam,
      away: f.awayTeam,
      finished,
      score: finished ? `${f.score?.home} - ${f.score?.away}` : null,
      players: players.map((p) => ({ slug: p.slug, name: p.nameJa })),
      services: services.map((b) => ({ name: b.name, url: broadcasterLink(b) })),
      search: [...players.map((p) => p.nameJa), f.homeTeam, f.awayTeam, league.name].join(" ").toLowerCase(),
    };
  });
}

export default function FixturesPage() {
  const now = new Date();
  const rows = toRows(now).sort((a, b) => a.utcDate.localeCompare(b.utcDate));
  const todayNight = nightKey(now);

  // 絞り込みの選択肢は、実際に試合があるリーグだけ出す
  const present = [...new Set(rows.map((r) => r.league))];
  const options = leagues
    .filter((l) => present.includes(l.id))
    .map((l) => ({ id: l.id, name: l.name, country: l.country }));

  return (
    <Jp as="div" className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">試合日程</h1>
      <p className="mt-3 muted text-sm max-w-2xl leading-relaxed">
        日本時間で表示しています。欧州の夜の試合は日本時間だと翌朝になるため、夜9時から翌朝9時までを「ひと晩」としてまとめています。
        {fixturesUpdatedAt ? ` データ最終更新: ${fixturesUpdatedAt}` : ""}
      </p>
      <p className="mt-2 muted text-xs max-w-2xl leading-relaxed">
        並べているのは、日本人選手が所属するクラブの試合です。負傷や登録の都合で、その選手が出場するとは限りません。
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

      <FixtureBoard rows={rows} todayNight={todayNight} leagues={options} />

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
    </Jp>
  );
}
