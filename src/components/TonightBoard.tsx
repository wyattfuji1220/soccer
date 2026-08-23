"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { leagueMap } from "@/data/leagues";
import { broadcasters } from "@/data/broadcasters";
import { broadcasterLink } from "@/lib/affiliate";
import {
  getFixtures,
  groupByNight,
  playersInFixture,
  usingSampleData,
} from "@/lib/fixtures";
import { countdown, isLive, jstTime, nextNightKey, nightKey, nightLabel } from "@/lib/jst";
import type { Fixture } from "@/lib/types";

function Countdown({ kickoff, now }: { kickoff: Date; now: Date }) {
  if (isLive(kickoff, now)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" aria-hidden />
        キックオフ済
      </span>
    );
  }
  const left = countdown(kickoff, now);
  if (!left) {
    return <span className="text-xs muted">終了</span>;
  }
  const label =
    left.hours >= 1
      ? left.minutes > 0
        ? `${left.hours}時間${left.minutes}分`
        : `${left.hours}時間`
      : `${left.minutes}分`;
  const soon = left.hours < 3;
  return (
    <span
      className={`text-xs font-bold px-2 py-1 rounded ${
        soon
          ? "bg-pitch-500/15 text-pitch-600 dark:text-pitch-300"
          : "bg-black/5 dark:bg-white/10 muted"
      }`}
    >
      あと{label}
    </span>
  );
}

function MatchRow({ fixture, now }: { fixture: Fixture; now: Date }) {
  const kickoff = new Date(fixture.utcDate);
  const league = leagueMap[fixture.league];
  const featured = playersInFixture(fixture);
  const options = broadcasters.filter((b) => b.leagues.includes(fixture.league));

  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 py-4 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="pt-0.5">
        <p className="text-lg font-bold tabular-nums leading-none">{jstTime(kickoff)}</p>
        <p className="text-[10px] muted mt-1 tracking-wide">JST</p>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs muted">{league.name}</span>
          <Countdown kickoff={kickoff} now={now} />
        </div>

        <p className="mt-1.5 font-semibold leading-snug">
          {fixture.homeTeam} <span className="muted font-normal mx-0.5">vs</span> {fixture.awayTeam}
        </p>

        {featured.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {featured.map((p) => (
              <Link
                key={p.slug}
                href={`/players/${p.slug}/`}
                className="text-xs px-2 py-1 rounded-full border hover:border-pitch-500 hover:text-pitch-600 dark:hover:text-pitch-300 transition-colors"
                style={{ borderColor: "var(--border)" }}
              >
                {p.nameJa}
              </Link>
            ))}
          </div>
        )}

        {options.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
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
}

export function TonightBoard({ buildTime }: { buildTime: string }) {
  const [now, setNow] = useState(() => new Date(buildTime));

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const today = nightKey(now);
  const nights = useMemo(() => groupByNight(getFixtures(now)), [today]);

  // 今夜の試合。すでに全部終わっていれば次に試合がある夜へ繰り上げる。
  const upcoming = nights.filter((n) => n.key >= today);
  const current = upcoming.find((n) => n.key === today) ?? upcoming[0];
  const following = upcoming.find((n) => n.key !== current?.key);

  return (
    <div className="surface rounded-2xl overflow-hidden">
      <div className="px-5 sm:px-6 pt-5 pb-3 flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold">
            {current ? nightLabel(current.key, today, nextNightKey(today)) : "今夜"}のキックオフ
          </h2>
          <p className="text-xs muted mt-0.5">
            日本時間で表示。夜9時から翌朝9時までを「ひと晩」として並べています。
          </p>
        </div>
        <p className="text-xs muted tabular-nums">現在 {jstTime(now)} JST</p>
      </div>

      {usingSampleData && (
        <p className="mx-5 sm:mx-6 mb-3 text-xs px-3 py-2 rounded-md bg-amber-500/12 text-amber-700 dark:text-amber-400">
          表示中の日程はサンプルです。APIキーを設定して <code className="font-mono">npm run data:fixtures</code> を実行すると実際の日程に切り替わります。
        </p>
      )}

      <div className="px-5 sm:px-6 pb-5">
        {current ? (
          current.fixtures.map((f) => <MatchRow key={f.id} fixture={f} now={now} />)
        ) : (
          <p className="py-8 text-center text-sm muted">予定されている試合がありません。</p>
        )}
      </div>

      {following && (
        <div className="px-5 sm:px-6 py-4 border-t text-sm flex items-center justify-between gap-4 flex-wrap" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--surface) 60%, transparent)" }}>
          <span className="muted">
            {nightLabel(following.key, today, nextNightKey(today))}は{following.fixtures.length}試合
          </span>
          <Link href="/fixtures/" className="font-semibold text-pitch-600 dark:text-pitch-300 hover:underline">
            日程をすべて見る →
          </Link>
        </div>
      )}
    </div>
  );
}
