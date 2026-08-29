import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, SITE_NAME, ADSENSE_CLIENT } from "@/lib/site";
import { usingSampleData } from "@/lib/fixtures";
import { Logo } from "@/components/Logo";
import "./globals.css";
import { Jp } from "@/lib/jp";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "海外組ポータル | 欧州で戦う日本人サッカー選手のファクトデータベース",
    template: "%s | 海外組ポータル",
  },
  description:
    "欧州各リーグでプレーする日本人選手の所属・経歴・試合日程を、出典付きで整理したファクトデータベース。日本からの視聴方法もまとめています。",
  // Search Console の所有権確認コード。リポジトリシークレットから注入する
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

const nav = [
  { href: "/players/", label: "選手一覧" },
  { href: "/clubs/", label: "クラブ別" },
  { href: "/fixtures/", label: "試合日程" },
  { href: "/rankings/", label: "ランキング" },
  { href: "/watch-plan/", label: "視聴プラン診断" },
  { href: "/cups/", label: "カップ戦" },
  { href: "/guides/", label: "視聴ガイド" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* 本文の書体は自前で配信する。最初に必要になるので先に読ませる */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/noto-sans-jp-subset.woff2"
          crossOrigin="anonymous"
        />
        {/* 数字用。ラテン文字のみのため軽い */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
        {ADSENSE_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        <header
          className="sticky top-0 z-50 backdrop-blur border-b"
          style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg) 88%, transparent)" }}
        >
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-6">
            <Link href="/" className="tap shrink-0 text-pitch-600 dark:text-pitch-300" aria-label="海外組ポータル">
              <Logo />
            </Link>
            <nav className="ml-auto flex items-center gap-0.5 text-[13px] overflow-x-auto">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="tap px-2.5 py-1.5 rounded whitespace-nowrap hover:bg-pitch-500/10 hover:text-pitch-600 dark:hover:text-pitch-300 transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t mt-16" style={{ borderColor: "var(--border)" }}>
          <Jp as="div" className="mx-auto max-w-6xl px-4 py-10 text-sm muted space-y-3">
            <p className="text-pitch-600 dark:text-pitch-300">
              <Logo scale={1.15} />
            </p>
            <p>
              当サイトは公開情報にもとづく事実の整理を目的としています。選手写真・クラブロゴ・試合映像等の著作権保護対象コンテンツは掲載していません。データの出典は各ページに明記しています。
            </p>
            <p>本サイトはアフィリエイトプログラムに参加しており、リンクを経由した購入・登録により収益を得る場合があります。</p>
            {/* 利用規約 7.1 で指定された文言。表記はそのまま用いる */}
            {!usingSampleData && (
              <p>
                Football data provided by the{" "}
                <a
                  href="https://www.football-data.org/"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="hover:underline"
                >
                  Football-Data.org API
                </a>
              </p>
            )}
            <div className="flex gap-4 pt-2">
              <Link href="/about/" className="hover:underline">サイトについて</Link>
              <Link href="/privacy/" className="hover:underline">プライバシーポリシー</Link>
            </div>
          </Jp>
        </footer>
      </body>
    </html>
  );
}
