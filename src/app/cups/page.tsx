import type { Metadata } from "next";
import Link from "next/link";
import { cups } from "@/data/cups";
import { players } from "@/data/players";
import { leagueMap } from "@/data/leagues";
import { broadcasters, cupsWithoutBroadcaster } from "@/data/broadcasters";
import { broadcasterLink } from "@/lib/affiliate";
import { AdDisclosure } from "@/components/Badges";
import type { Cup } from "@/lib/types";

export const metadata: Metadata = {
  title: "カップ戦を日本から観る方法",
  description:
    "海外組が出場するUEFAチャンピオンズリーグ、FAカップ、DFBポカールなどのカップ戦について、日本国内の配信元を整理しました。リーグ戦とは配信契約が別枠になることが多く、取りこぼしが起きやすい部分です。",
};

/** そのカップ戦に出場しうる掲載選手 */
function playersFor(cup: Cup) {
  return players.filter((p) => cup.leagues.includes(p.league));
}

function CupBlock({ cup }: { cup: Cup }) {
  const services = broadcasters.filter((b) => b.cups?.includes(cup.id));
  const missing = cupsWithoutBroadcaster[cup.id];
  const related = playersFor(cup);

  return (
    <section className="py-6 hair">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-bold">{cup.name}</h3>
          <p className="text-[11px] muted mt-0.5">
            {cup.nameEn} ・ {cup.scope === "europe" ? "欧州大会" : `${cup.country}の国内カップ`}
          </p>
        </div>
        <p className="text-xs muted">
          出場しうる掲載選手 <span className="num ml-1">{related.length}</span>人
        </p>
      </div>

      <div className="mt-4">
        <p className="label muted mb-2">国内の配信</p>
        {services.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {services.map((b) => (
              <a
                key={b.id}
                href={broadcasterLink(b)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-sm font-semibold px-3 py-2 rounded-md text-pitch-600 dark:text-pitch-300 hover:opacity-80 transition-opacity"
                style={{ background: "var(--accent-soft)" }}
              >
                {b.name}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm px-3 py-2 rounded-md bg-amber-500/12 text-amber-700 dark:text-amber-400">
            {missing ?? "国内の配信元を当サイトでは確認できていません。"}
          </p>
        )}
      </div>

      <p className="mt-4 text-xs muted">
        対象リーグ: {cup.leagues.map((l) => leagueMap[l].name).join("・")}
      </p>
      <p className="mt-1 text-xs">
        <a
          href={cup.officialUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-pitch-600 dark:text-pitch-300 hover:underline"
        >
          公式サイト
        </a>
      </p>
    </section>
  );
}

export default function CupsPage() {
  const europe = cups.filter((c) => c.scope === "europe");
  const domestic = cups.filter((c) => c.scope === "domestic");

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "リーグ戦が観られる配信サービスなら、カップ戦も観られますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "観られるとは限りません。カップ戦は主催者がリーグとは別のため、配信契約も別枠で結ばれることが多く、リーグ戦は観られてもカップ戦は観られない、という組み合わせが実際に起こります。契約前に、リーグ名だけでなく大会名で配信対象を確認してください。",
        },
      },
      {
        "@type": "Question",
        name: "日本人選手が出るカップ戦にはどんなものがありますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "欧州大会ではUEFAチャンピオンズリーグ、ヨーロッパリーグ、カンファレンスリーグ。国内カップではFAカップ、EFLカップ、DFBポカール、コパ・デル・レイ、コッパ・イタリア、クープ・ドゥ・フランス、KNVBカップなどがあります。所属クラブと前季の成績によって出場する大会が決まります。",
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <p className="label muted">Cup Competitions</p>
      <h1 className="mt-2 text-3xl md:text-4xl font-black leading-tight">
        カップ戦を日本から観る方法
      </h1>
      <p className="mt-5 leading-relaxed muted">
        海外組はリーグ戦と並行して、欧州大会や国内カップにも出場します。
        ところがカップ戦は主催者がリーグと異なるため、
        <strong style={{ color: "var(--text)" }}>配信契約もリーグ戦とは別枠</strong>
        で結ばれることが多く、「リーグは観られるのにカップ戦は観られない」という取りこぼしが起きます。
        契約する前に、リーグ名だけでなく大会名で配信対象を確認してください。
      </p>

      <div className="mt-6">
        <AdDisclosure />
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold">欧州大会</h2>
        <p className="text-sm muted mt-2 leading-relaxed">
          前季のリーグ成績や国内カップの結果で出場権が決まります。シーズン中は木曜・水曜の深夜に組まれることが多く、
          リーグ戦とは別の曜日に試合が増えます。
        </p>
        <div className="mt-4">
          {europe.map((c) => (
            <CupBlock key={c.id} cup={c} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">国内カップ</h2>
        <p className="text-sm muted mt-2 leading-relaxed">
          下部リーグのクラブも参加するノックアウト方式のため、
          日程がリーグ戦の合間に不定期に入ります。
        </p>
        <div className="mt-4">
          {domestic.map((c) => (
            <CupBlock key={c.id} cup={c} />
          ))}
        </div>
      </section>

      <section className="mt-12 surface rounded-xl p-6">
        <h2 className="text-lg font-bold mb-3">この一覧の限界</h2>
        <ul className="space-y-3 text-sm leading-relaxed muted">
          <li>
            <strong style={{ color: "var(--text)" }}>出場するかどうかは別の話です。</strong>{" "}
            ここに挙げているのは「そのリーグのクラブが出場しうる大会」であり、
            個々のクラブが実際に出場するかは前季の成績と勝ち上がりで決まります。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>配信元が空欄の大会があります。</strong>{" "}
            確認できていないものを埋めると誤った契約につながるため、
            確認できていないことをそのまま書いています。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>放映権は変わります。</strong>{" "}
            シーズン途中でも変更されることがあるため、申し込む前に必ず各サービスの公式ページをご確認ください。
          </li>
        </ul>
        <p className="mt-5 text-xs muted num">最終確認 2026-08-25</p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">関連ページ</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/watch-plan/"
            className="text-sm px-3 py-2 rounded-md border hover:border-pitch-500/60 transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            視聴プラン診断
          </Link>
          <Link
            href="/guides/"
            className="text-sm px-3 py-2 rounded-md border hover:border-pitch-500/60 transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            視聴ガイド
          </Link>
          <Link
            href="/fixtures/"
            className="text-sm px-3 py-2 rounded-md border hover:border-pitch-500/60 transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            試合日程
          </Link>
        </div>
      </section>
    </div>
  );
}
