import type { Metadata } from "next";
import Link from "next/link";
import fixtures from "@/data/fixtures.json";
import { leagueMap } from "@/data/leagues";
import { players } from "@/data/players";
import type { LeagueId } from "@/lib/types";

export const metadata: Metadata = {
  title: "日本人選手が出場するリーグの試合日程",
  description:
    "海外組が所属するクラブの試合日程を、日本時間で一覧表示します。データは football-data.org から取得しています。",
};

type Match = {
  id: number;
  league: LeagueId;
  utcDate: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  score?: { home: number | null; away: number | null };
};

const data = fixtures as { updatedAt: string | null; matches: Match[] };

function jstLabel(utc: string) {
  const d = new Date(utc);
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const w = ["日", "月", "火", "水", "木", "金", "土"][jst.getUTCDay()];
  const p = (n: number) => String(n).padStart(2, "0");
  return `${jst.getUTCMonth() + 1}/${p(jst.getUTCDate())}（${w}）${p(jst.getUTCHours())}:${p(jst.getUTCMinutes())}`;
}

export default function FixturesPage() {
  const watchedLeagues = [...new Set(players.map((p) => p.league))];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">試合日程</h1>
      <p className="mt-3 muted text-sm max-w-2xl leading-relaxed">
        海外組が所属するクラブの試合を、日本時間（JST）で表示します。
        {data.updatedAt ? `データ最終更新: ${data.updatedAt}` : ""}
      </p>

      {data.matches.length === 0 ? (
        <div className="mt-8 surface rounded-xl p-6">
          <p className="font-semibold">日程データは未取得です</p>
          <p className="mt-2 text-sm muted leading-relaxed">
            日程は football-data.org の無料APIから取得します。APIキーを{" "}
            <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "var(--border)" }}>.env.local</code>{" "}
            に設定したうえで、次のコマンドを実行してください。
          </p>
          <pre className="mt-4 text-xs rounded-lg p-4 overflow-x-auto" style={{ background: "var(--border)" }}>
npm run data:fixtures
          </pre>
          <p className="mt-4 text-sm muted">
            現在の対象リーグ:{" "}
            {watchedLeagues.map((id) => leagueMap[id].name).join(" / ")}
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-2">
          {data.matches.map((m) => (
            <li key={m.id} className="surface rounded-lg px-4 py-3 flex items-center gap-4 text-sm">
              <span className="muted text-xs w-32 shrink-0">{jstLabel(m.utcDate)}</span>
              <span className="text-xs muted w-28 shrink-0 truncate">{leagueMap[m.league]?.name}</span>
              <span className="flex-1 truncate">
                {m.homeTeam} <span className="muted">vs</span> {m.awayTeam}
              </span>
              {m.score && m.score.home !== null && (
                <span className="font-bold tabular-nums">{m.score.home} - {m.score.away}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-xs muted">
        日程データ出典:{" "}
        <a href="https://www.football-data.org/" target="_blank" rel="noopener noreferrer nofollow" className="hover:underline">
          football-data.org
        </a>
        。試合の中継予定は{" "}
        <Link href="/guides/" className="text-pitch-600 dark:text-pitch-300 hover:underline">視聴ガイド</Link>
        をご覧ください。
      </p>
    </div>
  );
}
