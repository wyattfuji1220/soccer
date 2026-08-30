import type { Metadata } from "next";
import Link from "next/link";
import { players } from "@/data/players";
import { seasonStats } from "@/data/season-stats";
import { leagueMap } from "@/data/leagues";
import { metrics, rankBy } from "@/lib/rankings";
import { RankingBoard } from "./RankingBoard";
import { Jp } from "@/lib/jp";

export const metadata: Metadata = {
  title: "海外組ランキング｜リーグを跨いだ通算成績",
  description:
    "欧州でプレーする日本人選手を、海外クラブでの通算出場数・得点、日本代表キャップ、海外挑戦年数などでランキングにしました。リーグを跨いだ比較ができます。",
};

export default function RankingsPage() {
  const checkedAt = players[0]?.sources[0]?.checkedAt ?? null;

  // 検索結果に出やすいよう、代表的な指標の上位はJSON-LDでも渡す
  const top = rankBy(metrics[0]).slice(0, 10);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${metrics[0].name}ランキング`,
    numberOfItems: top.length,
    itemListElement: top.map((r) => ({
      "@type": "ListItem",
      position: r.rank,
      item: { "@type": "Person", name: r.player.nameJa },
    })),
  };

  return (
    <Jp as="div" className="mx-auto max-w-3xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="label muted">Rankings</p>
      <h1 className="mt-2 text-3xl md:text-4xl font-black leading-tight">
        リーグを跨いで、
        <br />
        海外組を並べる
      </h1>
      <p className="mt-5 leading-relaxed muted max-w-[40em]">
        所属リーグが違うと、選手同士を比べる機会はほとんどありません。ここでは掲載中の{players.length}人を、リーグの枠を外して同じ指標で並べています。今季の成績ではなく<strong style={{ color: "var(--text)" }}>キャリアの通算値</strong>です。
      </p>

      <RankingBoard />

      <section className="mt-12 surface rounded-xl p-6">
        <h2 className="text-lg font-bold mb-3">この数字の出どころと限界</h2>
        <ul className="space-y-3 text-sm leading-relaxed muted">
          <li>
            <strong style={{ color: "var(--text)" }}>今季の記録だけ出どころが違います。</strong>{" "}
            日本語版のインフォボックスはクラブ在籍中の通算値しか持たないため、今季ぶんは英語版の「Career statistics」表から取っています。今季の行がまだ書かれていない選手はランキングに現れません（{players.length}人中{seasonStats.length}人が対象）。0試合という意味ではない点にご注意ください。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>通算の出典はWikipedia日本語版です。</strong>{" "}
            各選手のクラブ遍歴と代表歴に記載された出場数・得点数を合計しています。有料の統計サービスは使っていません。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>最新の試合が反映されていないことがあります。</strong>{" "}
            Wikipediaの更新状況に依存するため、直近の数節分が抜けている場合があります。順位はその前提でご覧ください。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>リーグ戦のみを数えています。</strong>{" "}
            カップ戦や欧州大会の出場・得点は含みません。リーグによって年間の試合数が違う点にもご注意ください。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>デュエル数やパス数は扱っていません。</strong>{" "}
            これらは有料の統計サービスでしか取得できないため、当サイトでは掲載していません。
          </li>
        </ul>
        {checkedAt && <p className="mt-5 text-xs muted num">データの最終確認 {checkedAt}</p>}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">関連ページ</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/players/", label: "選手一覧" },
            { href: "/clubs/", label: "クラブ別" },
            { href: "/watch-plan/", label: "視聴プラン診断" },
            { href: "/guides/", label: "視聴ガイド" },
          ].map((x) => (
            <Link
              key={x.href}
              href={x.href}
              className="text-sm px-3 py-2 rounded-md border hover:border-pitch-500/60 transition-colors"
              style={{ borderColor: "var(--border)" }}
            >
              {x.label}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs muted">
          リーグ別の内訳は{" "}
          <Link href="/players/" className="text-pitch-600 dark:text-pitch-300 hover:underline">
            選手一覧
          </Link>{" "}
          で絞り込めます（{Object.keys(leagueMap).length}リーグ）。
        </p>
      </section>
    </Jp>
  );
}
