"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";

/**
 * 試合結果の一覧。
 *
 * スコアは既定でふせる。ハイライトを探しに来た人にとって、
 * 結果が先に目に入るのは困るため。
 *
 * 表示にした状態は覚えない。ページを開き直せばまた隠れる。
 * 覚えてしまうと、あとで別の試合を観るつもりで来たときに、
 * 前回の選択のせいで結果が目に入ってしまうため。
 */

export type ResultRow = {
  id: string;
  date: string;
  dateLabel: string;
  utcDate: string;
  league: string;
  leagueName: string;
  country: string;
  cupName: string | null;
  home: string;
  away: string;
  score: string;
  players: { slug: string; name: string }[];
  highlight: { videoId: string; title: string; channel: string; url: string } | null;
};

export function ResultBoard({
  rows,
  leagues,
}: {
  rows: ResultRow[];
  leagues: { id: string; name: string; country: string }[];
}) {
  const [league, setLeague] = useState("all");
  const [onlyHighlights, setOnlyHighlights] = useState(false);
  const [showScores, setShowScores] = useState(false);

  const shown = useMemo(
    () =>
      rows.filter(
        (r) => (league === "all" || r.league === league) && (!onlyHighlights || r.highlight !== null)
      ),
    [rows, league, onlyHighlights]
  );

  const withHighlight = rows.filter((r) => r.highlight !== null).length;

  return (
    <div className="jp-auto mt-8">
      <div className="flex flex-wrap gap-2">
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

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOnlyHighlights((v) => !v)}
          aria-pressed={onlyHighlights}
          className={`tap px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
            onlyHighlights ? "bg-pitch-500 text-white border-pitch-500" : "surface hover:border-pitch-500/60"
          }`}
        >
          ハイライトがある試合だけ
          <span className={`num ml-1.5 text-xs ${onlyHighlights ? "opacity-80" : "muted"}`}>{withHighlight}</span>
        </button>
        <p className="text-xs muted">
          全<span className="num mx-1">{shown.length}</span>試合
        </p>
      </div>

      <div
        className="mt-5 rounded-lg px-5 py-4 flex flex-wrap items-center justify-between gap-4 border-l-2 border-pitch-500"
        style={{ background: "color-mix(in srgb, var(--color-pitch-500) 7%, var(--surface))" }}
      >
        <div>
          <p className="font-bold text-sm">スコアはふせてあります</p>
          <p className="text-xs muted mt-1 leading-relaxed">
            これから観る人のために隠しています。ページを開き直すと、また隠れます。
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

      <div className="mt-6">
        {shown.length === 0 ? (
          <p className="py-10 text-center muted text-sm">この条件に合う試合がありません。</p>
        ) : (
          shown.map((r) => <Row key={r.id} row={r} showScore={showScores} />)
        )}
      </div>
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

function Row({ row, showScore }: { row: ResultRow; showScore: boolean }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 py-4 hair">
      <div className="pt-0.5 w-[4.5rem]">
        <p className="num text-sm font-semibold muted whitespace-nowrap">{row.dateLabel}</p>
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
          {showScore ? (
            <span className="num ml-3 accent">{row.score}</span>
          ) : (
            <span className="num ml-3 muted text-xs">終了</span>
          )}
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

        {row.highlight && (
          <a
            href={row.highlight.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-start gap-3 text-xs p-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{ background: "var(--accent-soft)" }}
          >
            {/*
              サムネイルはYouTubeの配信元からそのまま読む。当サイトは画像を
              持たない。まだ取得していない領域を占めて画面が飛ばないよう、
              縦横を指定しておく。
            */}
            <img
              src={`https://i.ytimg.com/vi/${row.highlight.videoId}/mqdefault.jpg`}
              alt=""
              width={160}
              height={90}
              loading="lazy"
              decoding="async"
              className="rounded-md shrink-0 w-[7.5rem] sm:w-40 h-auto"
              style={{ aspectRatio: "16 / 9", objectFit: "cover" }}
            />
            <span className="min-w-0 pt-0.5">
              <span className="font-bold accent">ハイライト</span>
              <span className="block leading-relaxed mt-1">{row.highlight.title}</span>
              <span className="block muted mt-1">{row.highlight.channel}（YouTubeで開く）</span>
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
