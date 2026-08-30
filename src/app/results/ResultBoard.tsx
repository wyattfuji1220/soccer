"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";

/**
 * 試合結果の一覧。
 *
 * スコアは既定でふせる。ハイライトを探しに来た人にとって、
 * 結果が先に目に入るのは困るため。表示の選択はブラウザに覚えさせ、
 * 毎回押し直さなくて済むようにする。
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

const STORAGE_KEY = "kaigaigumi:show-scores";

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

  /*
   * 表示の選択を覚える。読み込みは描画のあとに行う。
   * 最初の描画で読むと、サーバーが作ったHTMLと食い違って警告が出る。
   */
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setShowScores(true);
    } catch {
      // 保存を禁止している環境では覚えないだけで、表示には影響しない
    }
  }, []);

  const toggleScores = () => {
    setShowScores((v) => {
      try {
        localStorage.setItem(STORAGE_KEY, v ? "0" : "1");
      } catch {
        /* 覚えられなくても続行する */
      }
      return !v;
    });
  };

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
            これから観る人のために隠しています。一度表示にすると、次からもこの端末では表示のままになります。
          </p>
        </div>
        <button
          type="button"
          onClick={toggleScores}
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
