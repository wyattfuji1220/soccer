import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "海外組ポータル | 欧州で戦う日本人サッカー選手のファクトデータベース",
    template: "%s | 海外組ポータル",
  },
  description:
    "欧州各リーグでプレーする日本人選手の所属・経歴・試合日程を、出典付きで整理したファクトデータベース。日本からの視聴方法もまとめています。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
  },
};

const nav = [
  { href: "/players/", label: "選手一覧" },
  { href: "/fixtures/", label: "試合日程" },
  { href: "/guides/", label: "視聴ガイド" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 backdrop-blur border-b" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
          <div className="mx-auto max-w-6xl px-4 h-16 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
              <span className="inline-block w-3 h-3 rounded-full bg-pitch-500" aria-hidden />
              <span>海外組ポータル</span>
            </Link>
            <nav className="ml-auto flex items-center gap-1 text-sm">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-3 py-2 rounded-md hover:bg-pitch-500/10 transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t mt-16" style={{ borderColor: "var(--border)" }}>
          <div className="mx-auto max-w-6xl px-4 py-10 text-sm muted space-y-3">
            <p className="font-semibold" style={{ color: "var(--text)" }}>海外組ポータル</p>
            <p>
              当サイトは公開情報にもとづく事実の整理を目的としています。選手写真・クラブロゴ・試合映像等の
              著作権保護対象コンテンツは掲載していません。データの出典は各ページに明記しています。
            </p>
            <p>本サイトはアフィリエイトプログラムに参加しており、リンクを経由した購入・登録により収益を得る場合があります。</p>
            <div className="flex gap-4 pt-2">
              <Link href="/about/" className="hover:underline">サイトについて</Link>
              <Link href="/privacy/" className="hover:underline">プライバシーポリシー</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
