import type { Metadata } from "next";
import { fixturesUpdatedAt } from "@/lib/fixtures";
import { DraftBoard } from "./DraftBoard";
import { Jp } from "@/lib/jp";

/**
 * Xへ出す文面の下書きを見るためのページ。
 *
 * 読者向けではなく運営の道具なので、検索には載せない。
 * どこからも辿れないようにしてあり、URLを知っている人だけが開く。
 */
export const metadata: Metadata = {
  title: "Xの下書き",
  robots: { index: false, follow: false },
};

export default function XDraftsPage() {
  return (
    <Jp as="div" className="mx-auto max-w-2xl px-4 py-12">
      <p className="label muted">Draft</p>
      <h1 className="text-3xl font-bold tracking-tight mt-1">Xの下書き</h1>
      <p className="mt-4 text-sm muted leading-relaxed max-w-[36em]">
        いま開いている時刻で組み立てています。読み込み直せば最新になります。
        {fixturesUpdatedAt ? `試合データの最終取得は${fixturesUpdatedAt}です。` : ""}
      </p>
      <p className="mt-2 text-xs muted leading-relaxed max-w-[36em]">
        手で投稿する前提なので、本文にリンクを入れています。料金がかかるのはAPIから出したときだけで、Xの画面から貼るぶんには無料です。自動投稿に切り替えるときは、URLを含む投稿が13倍になるため本文からリンクを外します。
      </p>

      <DraftBoard buildTime={new Date().toISOString()} />
    </Jp>
  );
}
