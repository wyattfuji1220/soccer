import type { Metadata } from "next";
import { WatchPlanFinder } from "./WatchPlanFinder";
import { Jp } from "@/lib/jp";

export const metadata: Metadata = {
  title: "視聴プラン診断｜追いたい選手から必要な配信サービスを計算",
  description:
    "追いかけたい日本人選手を選ぶだけで、必要な配信サービスの組み合わせ・年間費用・1試合あたりの単価を計算します。無駄な契約を避けるための比較ツールです。",
};

const faq = [
  {
    q: "1試合あたりの単価はどう計算していますか？",
    a: "年間費用（月額×12）を、選んだ選手の所属クラブのリーグ戦の年間試合数で割っています。同じクラブに複数の日本人選手がいる場合は、試合は1つとして数えます。",
  },
  {
    q: "カップ戦や欧州カップは含まれますか？",
    a: "含めていません。国内カップやUEFAの大会は配信契約が別になることが多く、単純に足すと実態から離れるためです。表示している試合数はリーグ戦のみです。",
  },
  {
    q: "料金や配信対象は最新ですか？",
    a: "各サービスの公式ページで確認した日付を結果画面に表示しています。放映権はシーズンごとに変わるため、申し込む前に必ず公式ページで最新の配信対象をご確認ください。",
  },
];

export default function WatchPlanPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <Jp as="div" className="mx-auto max-w-4xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="text-sm font-semibold text-pitch-600 dark:text-pitch-300">視聴プラン診断</p>
      <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight leading-tight">
        その契約、本当に必要ですか。
      </h1>
      <p className="mt-5 muted leading-relaxed max-w-2xl">
        追いかけたい選手を選ぶだけで、必要な配信サービスの組み合わせと年間費用、そして
        <strong style={{ color: "var(--text)" }}>1試合あたりいくらになるか</strong>
        を計算します。3人を追うのに2社契約するのか、1社で足りるのか。数字で確かめてください。
      </p>

      <WatchPlanFinder />

      <section className="mt-16">
        <h2 className="text-lg font-bold mb-5">よくある質問</h2>
        <dl className="space-y-5">
          {faq.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[15px]">{f.q}</dt>
              <dd className="mt-1.5 text-sm muted leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </Jp>
  );
}
