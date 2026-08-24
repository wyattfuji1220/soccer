import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "海外組ポータルにおける個人情報、Cookie、広告配信の取り扱いについて説明します。",
};

type Section = {
  h: string;
  p: (string | { text: string; links?: { label: string; url: string }[] })[];
};

const sections: Section[] = [
  {
    h: "広告配信について",
    p: [
      "当サイトは、第三者配信の広告サービス「Google AdSense」を利用する場合があります。",
      "Googleなどの第三者配信事業者は、Cookieを使用して、ユーザーが当サイトや他のサイトに過去にアクセスした際の情報にもとづき、広告を配信します。これはユーザーの興味に応じた広告を表示するための仕組みです。",
      "欧州経済領域（EEA）、英国、スイスからアクセスされた場合には、Google認定の同意管理プラットフォームによる同意メッセージを表示します。表示される選択肢から、広告に使用されるCookieの利用可否を選択でき、選択内容は後からいつでも変更できます。同意しない場合でも、閲覧履歴にもとづかない広告が表示されることがあります。",
      {
        text: "パーソナライズ広告は、Googleの広告設定ページから無効にできます。第三者配信事業者が使用するCookieについての詳細は、次のページをご確認ください。",
        links: [
          { label: "Google 広告設定（My Ad Center）", url: "https://myadcenter.google.com/" },
          { label: "広告 – ポリシーと規約 – Google", url: "https://policies.google.com/technologies/ads?hl=ja" },
        ],
      },
      "ご利用のブラウザの設定からCookieを無効にすることもできます。その場合、当サイトの一部の機能が正しく動作しないことがあります。",
    ],
  },
  {
    h: "アクセス解析",
    p: [
      "当サイトでは、サイトの改善を目的としてアクセス解析ツールを利用する場合があります。これらのツールはCookieを使用してトラフィックデータを収集しますが、収集される情報は匿名であり、個人を特定するものではありません。",
    ],
  },
  {
    h: "アフィリエイトプログラム",
    p: [
      "当サイトは、Amazonアソシエイト、楽天アフィリエイトをはじめとする各種アフィリエイトプログラムに参加しています。これらのプログラムでは、Cookieを利用して読者の遷移元サイトを識別する場合があります。",
      "広告を含むリンクがあるセクションには、その旨を明示しています。リンク先のサービスにおける個人情報の取り扱いについては、各サービスのプライバシーポリシーをご確認ください。",
      "広告収益の有無によって、掲載するサービスの評価や記載内容を変えることはありません。",
    ],
  },
  {
    h: "お問い合わせで取得する情報",
    p: [
      "お問い合わせにはGoogleフォームを利用しています。フォームに入力された内容はGoogle社のサーバーに保存され、お問い合わせへの対応および掲載内容の修正にのみ使用します。第三者に提供することはありません。",
      "返信先メールアドレスとお名前の入力は任意です。返信が不要な場合は入力せずに送信していただけます。",
      {
        text: "Googleフォームにおける情報の取り扱いについては、Googleのプライバシーポリシーをご確認ください。",
        links: [{ label: "Google プライバシーポリシー", url: "https://policies.google.com/privacy?hl=ja" }],
      },
    ],
  },
  {
    h: "当サイト自体が収集しない情報",
    p: [
      "当サイトは静的なウェブサイトとして構築されており、上記のお問い合わせフォームを除いて、ユーザーが個人情報を入力する仕組みを設けていません。会員登録の機能もありません。",
      "視聴プラン診断で選択した内容は、ご利用のブラウザ内でのみ処理され、当サイトのサーバーに送信・保存されることはありません。",
    ],
  },
  {
    h: "免責事項",
    p: [
      "当サイトは掲載情報の正確性に努めていますが、その完全性を保証するものではありません。特に配信サービスの料金や配信対象、選手の所属クラブは変更される可能性があるため、最終的な判断は各公式サイトの情報にもとづいて行ってください。",
      "当サイトの情報を利用して生じたいかなる損害についても、運営者は責任を負いかねます。",
    ],
  },
  {
    h: "著作権",
    p: [
      "当サイトに掲載されている文章およびデザインの著作権は運営者に帰属します。引用の範囲を超えた無断転載はご遠慮ください。",
      "当サイトが参照している第三者の著作物については、各権利者に権利が帰属します。選手の経歴データはWikipedia日本語版（クリエイティブ・コモンズ 表示-継承ライセンス）を参照し、各ページに出典を明記しています。",
      "権利侵害にあたる掲載を発見された場合は、速やかに対応いたします。",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">プライバシーポリシー</h1>
      <p className="mt-3 text-xs muted">最終更新 2026-08-24</p>

      {sections.map((s) => (
        <section key={s.h} className="mt-10">
          <h2 className="text-xl font-bold mb-4">{s.h}</h2>
          {s.p.map((item, i) => {
            const text = typeof item === "string" ? item : item.text;
            const links = typeof item === "string" ? undefined : item.links;
            return (
              <div key={i} className="mb-4">
                <p className="leading-8 text-[15px]">{text}</p>
                {links && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {links.map((l) => (
                      <li key={l.url}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-pitch-600 dark:text-pitch-300 hover:underline"
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </section>
      ))}

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">お問い合わせ</h2>
        <p className="leading-8 text-[15px]">
          掲載内容の誤りのご指摘、権利に関するご連絡は{" "}
          <Link href="/about/" className="text-pitch-600 dark:text-pitch-300 hover:underline">
            サイトについて
          </Link>{" "}
          のページのお問い合わせフォームからお知らせください。出典を添えていただけますと、確認のうえ速やかに修正いたします。
        </p>
      </section>
    </div>
  );
}
