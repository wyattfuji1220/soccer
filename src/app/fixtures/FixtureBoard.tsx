"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";

/**
 * 試合日程の絞り込みと日付移動。
 *
 * 表示に要るものはサーバー側で組み立てて渡す。ここで選手データや配信データを
 * 読み込むと、そのまま全部がブラウザに送られてしまうため。
 *
 * 終わった試合のスコアは既定で隠している。日程を確かめに来ただけの人に
 * 結果が目に入るのは、録画で観る人にとって困るため。
 */

export type FixtureRow = {
  id: string;
  /** 観戦ナイトのキー（JST 9時区切り） */
  night: string;
  /** 日付タブの見出し。「8/30(日)」 */
  nightLabel: string;
  utcDate: string;
  time: string;
  league: string;
  leagueName: string;
  country: string;
  cupName: string | null;
  home: string;
  away: string;
  finished: boolean;
  score: string | null;
  players: { slug: string; name: string }[];
  services: { name: string; url: string }[];
  /** 検索用。選手名とクラブ名を小文字でつないだもの */
  search: string;
};

type Props = {
  rows: FixtureRow[];
  /** 今夜のキー。ここが最初に開く */
  todayNight: string;
  leagues: { id: string; name: string; country: string }[];
};

type Order = "time" | "league";

export function FixtureBoard({ rows, todayNight, leagues }: Props) {
  const [league, setLeague] = useState("all");
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order>("time");
  const [showScores, setShowScores] = useState(false);
  const [night, setNight] = useState(todayNight);

  const past = useMemo(() => rows.filter((r) => r.night < todayNight), [rows, todayNight]);
  const future = useMemo(() => rows.filter((r) => r.night >= todayNight), [rows, todayNight]);

  /** 日付タブに出す夜。試合がある日だけ並べる */
  const nights = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of future) seen.set(r.night, r.nightLabel);
    return [...seen].sort((a, b) => a[0].localeCompare(b[0]));
  }, [future]);

  const matches = (r: FixtureRow) => {
    if (league !== "all" && r.league !== league) return false;
    if (!query.trim()) return true;
    return r.search.includes(query.trim().toLowerCase());
  };

  /*
   * 絞り込んだ結果、選んでいる日の試合が無くなることがある。そのまま
   * 「試合がありません」と出すと行き止まりになるので、試合がある最初の日へ送る。
   */
  const effectiveNight = useMemo(() => {
    if (future.some((r) => r.night === night && matches(r))) return night;
    return nights.find(([key]) => future.some((r) => r.night === key && matches(r)))?.[0] ?? night;
  }, [future, night, nights, league, query]);

  const shown = useMemo(() => {
    const list = future.filter((r) => r.night === effectiveNight && matches(r));
    return order === "time"
      ? [...list].sort((a, b) => a.utcDate.localeCompare(b.utcDate))
      : [...list].sort(
          (a, b) => a.leagueName.localeCompare(b.leagueName, "ja") || a.utcDate.localeCompare(b.utcDate)
        );
  }, [future, effectiveNight, league, query, order]);

  const pastShown = useMemo(() => past.filter(matches).sort((a, b) => b.utcDate.localeCompare(a.utcDate)), [past, league, query]);

  const total = rows.filter(matches).length;
  const range =
    rows.length > 0
      ? `${rows[0].nightLabel}〜${rows[rows.length - 1].nightLabel}`
      : "";

  return (
    <div className="jp-auto mt-8">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="選手名・クラブ名でしぼる"
        className="w-full px-4 py-3 rounded-lg surface text-sm outline-none focus:border-pitch-500 transition-colors"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <Chip on={league === "all"} onClick={() => setLeague("all")}>
          全リーグ
        </Chip>
        {leagues.map((l) => (
          <Chip key={l.id} on={league === l.id} onClick={() => setLeague(l.id)}>
            <Flag country={l.country} size={11} />
            {l.name}
          </Chip>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="inline-flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
          {(["time", "league"] as const).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOrder(o)}
              aria-pressed={order === o}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${
                order === o ? "bg-pitch-500 text-white" : "hover:bg-pitch-500/10"
              }`}
            >
              {o === "time" ? "時刻順" : "リーグ順"}
            </button>
          ))}
        </div>
        <p className="text-xs muted">
          {range} ・ 全<span className="num mx-1">{total}</span>試合 ・ 時刻は日本時間
        </p>
      </div>

      <div
        className="mt-5 rounded-lg px-5 py-4 flex flex-wrap items-center justify-between gap-4 border-l-2 border-pitch-500"
        style={{ background: "color-mix(in srgb, var(--color-pitch-500) 7%, var(--surface))" }}
      >
        <div>
          <p className="font-bold text-sm">結果はふせてあります</p>
          <p className="text-xs muted mt-1 leading-relaxed">
            終わった試合のスコアは隠しています。あとから観るつもりの試合の結果が、目に入らないようにするためです。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowScores((v) => !v)}
          aria-pressed={showScores}
          className={`tap px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
            showScores ? "bg-pitch-500 text-white border-pitch-500" : "surface hover:border-pitch-500/60"
          }`}
        >
          {showScores ? "スコアを表示中" : "スコアを表示する"}
        </button>
      </div>

      <div className="mt-6 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-min pb-1">
          {nights.map(([key, label]) => {
            const n = future.filter((r) => r.night === key && matches(r)).length;
            if (n === 0) return null;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setNight(key)}
                aria-pressed={effectiveNight === key}
                className={`tap px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  effectiveNight === key ? "bg-pitch-500 text-white" : "surface hover:border-pitch-500/60"
                }`}
              >
                {key === todayNight ? "今夜" : label}
                <span className={`num ml-1.5 ${effectiveNight === key ? "opacity-80" : "muted"}`}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        {shown.length === 0 ? (
          <p className="py-10 text-center muted text-sm">この条件に合う試合がありません。</p>
        ) : (
          shown.map((r) => <Row key={r.id} row={r} showScore={showScores} />)
        )}
      </div>

      {pastShown.length > 0 && (
        <Link
          href="/results/"
          className="mt-10 surface rounded-lg px-5 py-4 flex items-center justify-between gap-4 hover:border-pitch-500/60 transition-colors"
        >
          <span>
            <span className="font-semibold text-sm">終わった試合とハイライト</span>
            <span className="block text-xs muted mt-1">
              直近の{pastShown.length}試合。公式チャンネルのハイライトがあれば一緒に並べています。
            </span>
          </span>
          <span className="text-sm font-semibold text-pitch-600 dark:text-pitch-300 whitespace-nowrap">結果を見る →</span>
        </Link>
      )}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`tap inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
        on ? "bg-pitch-500 text-white border-pitch-500" : "surface hover:border-pitch-500/60"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ row, showScore }: { row: FixtureRow; showScore: boolean }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 py-4 hair">
      <div className="pt-0.5 w-[4.5rem]">
        <p className="num text-xl font-semibold leading-none accent whitespace-nowrap">{row.time}</p>
        <p className="label muted mt-1 text-[10px]">JST</p>
      </div>
      <div className="min-w-0">
        <p className="text-xs muted flex items-center gap-1.5">
          {row.cupName ? (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-sm"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {row.cupName}
            </span>
          ) : (
            <>
              <Flag country={row.country} size={11} />
              {row.leagueName}
            </>
          )}
        </p>

        <p className="mt-1 font-semibold leading-snug">
          {row.home} <span className="muted font-normal mx-0.5">vs</span> {row.away}
          {row.finished &&
            (showScore && row.score ? (
              <span className="num ml-3">{row.score}</span>
            ) : (
              <span className="num ml-3 muted text-xs">終了</span>
            ))}
        </p>

        {row.players.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {row.players.map((p) => (
              <Link
                key={p.slug}
                href={`/players/${p.slug}/`}
                className="tap text-xs px-2.5 py-1 rounded-sm border hover:border-pitch-500 transition-colors"
                style={{ borderColor: "var(--border)" }}
              >
                {p.name}
              </Link>
            ))}
          </div>
        )}

        {row.services.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] muted">視聴</span>
            {row.services.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-[11px] font-semibold px-2 py-1 rounded bg-pitch-500/10 text-pitch-600 dark:text-pitch-300 hover:bg-pitch-500/20 transition-colors"
              >
                {s.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
