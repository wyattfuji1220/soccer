import type { Metadata } from "next";
import Link from "next/link";
import { players } from "@/data/players";
import { broadcasters } from "@/data/broadcasters";
import { CoverageFinder } from "./CoverageFinder";
import { Jp } from "@/lib/jp";

export const metadata: Metadata = {
  title: "契約中のサービスで観られる海外組｜逆引き診断",
  description:
    "いま契約している配信サービスを選ぶだけで、観られる日本人選手と観られない選手が分かります。あと1社足すと何人増えて、いくら増えるかも計算します。",
};

const faq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "契約しているサービスで、どの海外組が観られるか調べられますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "このページで調べられます。契約中のサービスを選ぶと、リーグ戦の全試合を観られる選手と、観られない選手を分けて表示します。判定は各サービスの公式ページで確認した配信対象にもとづいています。",
      },
    },
    {
      "@type": "Question",
      name: "サービスを1社追加すると、観られる選手は何人増えますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "追加した場合に増える人数と増える月額、1人あたりの単価を一覧で出します。増える人数が多い順に並ぶため、追加する価値の大きさを比べられます。",
      },
    },
  ],
};

export default function CoveragePage() {
  return (
    <Jp as="div" className="mx-auto max-w-4xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <nav className="text-sm muted mb-6">
        <Link href="/watch-plan/" className="hover:underline">
          視聴プラン診断
        </Link>
        <span className="mx-2">/</span>
        <span>契約から逆引き</span>
      </nav>

      <p className="label muted">Reverse Check</p>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mt-1">
        その契約で、誰を観られていますか。
      </h1>
      <p className="mt-5 leading-relaxed muted max-w-[40em]">
        契約しているサービスを選ぶだけで、掲載中の{players.length}人のうち誰を観られていて、誰を取りこぼしているかが分かります。あと1社足したときに何人増えるかも、月額とあわせて計算します。
      </p>

      <CoverageFinder />

      <section className="mt-14">
        <h2 className="text-lg font-bold mb-3">この計算の前提</h2>
        <ul className="space-y-3 text-sm leading-relaxed muted">
          <li>
            <strong style={{ color: "var(--text)" }}>リーグ戦だけを数えています。</strong>{" "}
            カップ戦や欧州カップは配信契約が別枠になることが多く、足すと実態から離れるためです。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>「観られる」は全試合の配信を確認できたリーグです。</strong>{" "}
            毎節一部の試合だけ配信されるリーグは、別枠に分けています。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>料金は{broadcasters.length}サービスぶんの月額（税込）です。</strong>{" "}
            割引や年払いは反映していません。放映権はシーズン途中でも変わるため、申し込む前に必ず公式ページをご確認ください。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>逆の診断もできます。</strong>{" "}
            追いかけたい選手から必要な契約を出すなら{" "}
            <Link href="/watch-plan/" className="text-pitch-600 dark:text-pitch-300 hover:underline">
              視聴プラン診断
            </Link>
            をお使いください。
          </li>
        </ul>
      </section>
    </Jp>
  );
}
