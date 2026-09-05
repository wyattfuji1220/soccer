"use client";

import { useEffect, useState } from "react";
import { tonightDraft, resultsDraft, weigh, X_LIMIT } from "@/lib/x-draft";

/**
 * Xへ出す文面の下書き。手で投稿する前提なので、本文にリンクを入れる。
 *
 * 課金されるのはAPIから出したときだけで、URLを含むと13倍になる。
 * 画面から手で出すぶんには無料なので、読者がサイトへ来やすいリンクありにする。
 *
 * 時刻はブラウザ側で取り直す。文面は「いまが何時か」で変わるのに、
 * サイトは6時間ごとにしか作り直さないため、作った時刻のまま出すと
 * 朝に見たとき「今夜」が昨夜を指してしまう。
 */
export function DraftBoard({ buildTime }: { buildTime: string }) {
  const [now, setNow] = useState(() => new Date(buildTime));

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="jp-auto mt-8 space-y-8">
      <Draft
        title="今夜の試合予定"
        when="夕方に出す"
        text={tonightDraft(now, { link: true })}
        empty="今夜これから始まる試合がありません。この場合は投稿しません。"
      />
      <Draft
        title="昨夜の結果とハイライト"
        when="朝に出す"
        text={resultsDraft(now, { link: true })}
        empty="終わった試合がまだありません。この場合は投稿しません。"
      />
    </div>
  );
}

function Draft({
  title,
  when,
  text,
  empty,
}: {
  title: string;
  when: string;
  text: string | null;
  empty: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // 権限がない環境では、そのまま選んで写してもらう
    }
  }

  return (
    <section className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <div
        className="px-5 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-b"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <h2 className="font-bold">{title}</h2>
        <span className="text-xs muted">{when}</span>
        {text && (
          <span className="num text-xs muted ml-auto">
            {weigh(text)} / 280
          </span>
        )}
      </div>

      {text ? (
        <>
          <pre
            className="px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap break-words font-sans"
            style={{ background: "var(--surface)" }}
          >
            {text}
          </pre>
          <div className="px-5 py-3 border-t flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
            <button
              type="button"
              onClick={copy}
              className="tap px-4 py-2 rounded-lg text-sm font-semibold bg-pitch-500 text-white hover:opacity-90 transition-opacity"
            >
              {copied ? "写しました" : "文面を写す"}
            </button>
            <a
              href="https://x.com/compose/post"
              target="_blank"
              rel="noopener noreferrer"
              className="tap text-sm text-pitch-600 dark:text-pitch-300 hover:underline"
            >
              Xの投稿画面を開く
            </a>
          </div>
        </>
      ) : (
        <p className="px-5 py-6 text-sm muted">{empty}</p>
      )}
    </section>
  );
}
