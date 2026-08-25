import type { Metadata } from "next";
import { PlayerBrowser } from "./PlayerBrowser";
import { AgeChart } from "@/components/AgeChart";

export const metadata: Metadata = {
  title: "海外組の日本人選手一覧",
  description:
    "欧州各リーグでプレーする日本人選手を、リーグ・ポジションで絞り込んで探せます。所属情報には最終確認日を明記しています。",
};

export default function PlayersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">選手一覧</h1>
      <p className="mt-3 muted text-sm max-w-2xl leading-relaxed">
        リーグとポジションで絞り込めます。所属クラブは移籍により変動するため、各選手ページで最終確認日と出典をご確認ください。
      </p>
      <AgeChart />

      <PlayerBrowser />
    </div>
  );
}
