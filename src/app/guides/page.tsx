import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/data/guides";
import { Jp } from "@/lib/jp";

export const metadata: Metadata = {
  title: "視聴ガイド",
  description: "欧州サッカーを日本から観るための方法と、キックオフ時刻の日本時間換算をまとめています。",
};

export default function GuidesPage() {
  return (
    <Jp as="div" className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">視聴ガイド</h1>
      <p className="mt-3 muted text-sm max-w-2xl leading-relaxed">
        海外リーグを日本から観るための情報を整理しています。配信サービスの契約内容は変動するため、各記事の更新日をご確認ください。
      </p>
      <div className="mt-8 space-y-4">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}/`}
            className="surface rounded-xl p-6 block hover:border-pitch-500/50 transition-colors"
          >
            <h2 className="font-bold text-lg">{g.title}</h2>
            <p className="mt-2 text-sm muted leading-relaxed">{g.description}</p>
            <p className="mt-3 text-xs muted">最終更新 {g.updatedAt}</p>
          </Link>
        ))}
      </div>
    </Jp>
  );
}
