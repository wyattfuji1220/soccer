import type { Metadata } from "next";
import Link from "next/link";
import { PlayerBrowser } from "./PlayerBrowser";
import { playerLists } from "@/lib/lists";
import { Jp } from "@/lib/jp";

export const metadata: Metadata = {
  title: "海外組の日本人選手一覧",
  description:
    "欧州各リーグでプレーする日本人選手を、リーグ・ポジションで絞り込んで探せます。所属情報には最終確認日を明記しています。",
};

export default function PlayersPage() {
  return (
    <Jp as="div" className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">選手一覧</h1>
      <p className="mt-3 muted text-sm max-w-2xl leading-relaxed">
        リーグとポジションで絞り込めます。所属クラブは移籍により変動するため、各選手ページで最終確認日と出典をご確認ください。
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="label muted self-center mr-1">切り口から</span>
        {playerLists.map((l) => (
          <Link
            key={l.slug}
            href={`/lists/${l.slug}/`}
            className="tap px-3 py-2 rounded-md text-sm surface hover:border-pitch-500/60 transition-colors"
          >
            {l.heading}
            <span className="num muted ml-1.5 text-xs">{l.players.length}</span>
          </Link>
        ))}
      </div>

      <PlayerBrowser />
    </Jp>
  );
}
