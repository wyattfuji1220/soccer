"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { players } from "@/data/players";
import { leagues, leagueMap } from "@/data/leagues";
import { metrics, rankBy, type MetricId } from "@/lib/rankings";
import { Flag } from "@/components/Flag";
import { PositionBadge } from "@/components/Badges";
import type { LeagueId } from "@/lib/types";

/**
 * 絞り込みはブラウザ側で行うが、useSearchParams は使わない。
 * 使うと静的書き出し時に中身が空のHTMLになり、検索エンジンから
 * ランキングが見えなくなるため。
 */
export function RankingBoard() {
  const [metricId, setMetricId] = useState<MetricId>("abroad-apps");
  const [league, setLeague] = useState<LeagueId | "all">("all");

  const metric = metrics.find((m) => m.id === metricId) ?? metrics[0];

  const rows = useMemo(() => {
    const list = league === "all" ? players : players.filter((p) => p.league === league);
    return rankBy(metric, list);
  }, [metric, league]);

  // 選手がいるリーグだけ出す
  const available = leagues.filter((l) => players.some((p) => p.league === l.id));

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm border transition-colors ${
      active ? "bg-pitch-500 text-white border-pitch-500" : "hover:border-pitch-500/50"
    }`;

  const max = rows.length > 0 ? Math.max(...rows.map((r) => r.value)) : 0;

  return (
    <div className="jp-auto mt-8">
      <div className="flex flex-wrap gap-2">
        {metrics.map((m) => (
          <button
            key={m.id}
            onClick={() => setMetricId(m.id)}
            aria-pressed={metricId === m.id}
            className={chip(metricId === m.id)}
            style={{ borderColor: "var(--border)" }}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setLeague("all")}
          className={chip(league === "all")}
          style={{ borderColor: "var(--border)" }}
        >
          全リーグ
        </button>
        {available.map((l) => (
          <button
            key={l.id}
            onClick={() => setLeague(l.id)}
            className={chip(league === l.id)}
            style={{ borderColor: "var(--border)" }}
          >
            {l.name}
          </button>
        ))}
      </div>

      <div className="mt-6 surface rounded-xl p-5" style={{ borderTop: "2px solid var(--accent)" }}>
        <p className="label muted">Ranking</p>
        <h2 className="text-xl font-bold mt-1.5">
          {metric.name}
          {league !== "all" && <span className="muted font-normal text-base ml-2">{leagueMap[league].name}</span>}
        </h2>
        <p className="text-sm muted mt-2 leading-relaxed max-w-[40em]">{metric.note}</p>

        {rows.length === 0 ? (
          <p className="mt-8 text-center text-sm muted">該当する選手がいません。</p>
        ) : (
          <ol className="mt-5 list-none p-0 m-0">
            {rows.map((r) => {
              const lg = leagueMap[r.player.league];
              return (
                <li key={r.player.slug} className="hair">
                  <Link
                    href={`/players/${r.player.slug}/`}
                    className="grid grid-cols-[2.2rem_1fr_auto] items-center gap-x-3 gap-y-1.5 py-3 group"
                  >
                    <span
                      className="num text-lg font-semibold text-right"
                      style={{ color: r.rank <= 3 ? "var(--accent)" : "var(--text-muted)" }}
                    >
                      {r.rank}
                    </span>

                    <span className="min-w-0 flex items-center gap-2.5">
                      <PositionBadge position={r.player.position} />
                      <span className="min-w-0">
                        <span className="font-bold truncate block group-hover:text-pitch-600 dark:group-hover:text-pitch-300 transition-colors">
                          {r.player.nameJa}
                        </span>
                        <span className="text-xs muted flex items-center gap-1.5">
                          <Flag country={lg.country} size={10} />
                          <span className="truncate">{r.player.club}</span>
                        </span>
                      </span>
                    </span>

                    <span className="num text-xl font-semibold whitespace-nowrap">
                      {r.value}
                      <span className="text-xs font-normal muted ml-1 font-sans">{metric.unit}</span>
                    </span>

                    {/*
                      棒は値の大きさを表す。若い順のように小さいほど上位の指標では
                      「1位なのに棒が短い」となって誤解を招くため出さない。
                    */}
                    {metric.order === "desc" && (
                      <span
                        className="col-start-2 col-span-2 h-1.5 rounded-sm overflow-hidden"
                        style={{ background: "color-mix(in srgb, var(--text) 7%, transparent)" }}
                        aria-hidden
                      >
                        <span
                          className="block h-full rounded-sm"
                          style={{
                            width: `${max > 0 ? Math.max((r.value / max) * 100, 1.5) : 0}%`,
                            background: "var(--accent)",
                          }}
                        />
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        )}

        <p className="mt-5 text-xs muted num">{rows.length}人</p>
      </div>
    </div>
  );
}
