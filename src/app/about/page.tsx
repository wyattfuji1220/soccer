import type { Metadata } from "next";
import { CONTACT_FORM_URL, CONTACT_EMAIL } from "@/lib/site";
import { Jp } from "@/lib/jp";

export const metadata: Metadata = {
  title: "サイトについて",
  description: "海外組ポータルの編集方針、情報源、著作権に関する考え方について説明します。",
};

const sections = [
  {
    h: "サイトの目的",
    p: [
      "欧州各リーグでプレーする日本人選手について、「誰が、どのクラブで、いつ試合をするのか」という基本的な事実を、出典付きで一箇所にまとめることを目的としています。",
      "速報性よりも正確性を重視します。確認できていない情報は掲載せず、変動しうる情報には最終確認日を明記します。",
    ],
  },
  {
    h: "情報源",
    p: [
      "選手のプロフィールおよび経歴は、Wikipedia日本語版（クリエイティブ・コモンズ 表示-継承ライセンス）およびクラブ公式サイトの公開情報を参照しています。参照元は各選手ページの「出典」欄に記載しています。",
      "試合日程・結果は football-data.org のAPIから取得しています（Football data provided by the Football-Data.org API）。APIキーが設定されていない状態では、画面構成を確認するためのサンプル日程を表示し、その旨をページ上に明示します。",
      "配信サービスの料金および配信対象は、各サービスの公式ページで確認した内容を記載しています。契約内容は変更されることがあるため、最終確認日を併記しています。",
    ],
  },
  {
    h: "著作権について",
    p: [
      "当サイトは、選手の写真、クラブのエンブレム、リーグのロゴ、試合映像など、第三者が権利を有するコンテンツを掲載しません。ページはすべてテキストと自作のデザイン要素のみで構成しています。",
      "報道記事の文章を転載することもしません。事実（日付、所属、記録など）を自らの言葉で整理したうえで、出典元へのリンクを示す方針をとっています。",
    ],
  },
  {
    h: "記事の作成方法",
    p: [
      "本サイトの文章は、運営者が生成AIを用いて作成しています。配信サービスの料金・配信対象、選手の所属・経歴は公式サイトやWikipediaなどの一次情報と照合し、最終確認日を各ページに明記しています。",
      "生成AIが出力した内容をそのまま掲載することはしません。数値や固有名詞は運営者が一次情報にあたって確認し、確認できなかった事項は「確認できていません」と明記しています。",
    ],
  },
  {
    h: "情報の確度表示",
    p: [
      "各選手ページには「出典確認済」または「要再確認」のいずれかを表示しています。移籍市場が開いている期間（6〜8月、1月）は所属クラブが変動しやすいため、この期間の情報は特に慎重にご確認ください。",
      "誤りを見つけられた場合や、掲載内容についてのご指摘は、出典を添えてお知らせいただけますと確認のうえ修正いたします。",
    ],
  },
  {
    h: "広告について",
    p: [
      "当サイトはアフィリエイトプログラムに参加しており、掲載しているリンクを経由して読者がサービスに登録または商品を購入された場合、運営者が紹介料を受け取ることがあります。",
      "広告収益の有無によって、掲載するサービスの評価や記載内容を変えることはありません。広告を含むリンクがあるセクションには、その旨を明示しています。",
    ],
  },
];

export default function AboutPage() {
  return (
    <Jp as="div" className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">サイトについて</h1>
      {sections.map((s) => (
        <section key={s.h} className="mt-10">
          <h2 className="text-xl font-bold mb-4">{s.h}</h2>
          {s.p.map((p, i) => (
            <p key={i} className="leading-8 text-[15px] mb-4 max-w-[40em]">{p}</p>
          ))}
        </section>
      ))}

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">お問い合わせ</h2>
        <p className="leading-8 text-[15px] max-w-[40em]">
          掲載内容の誤りのご指摘、権利に関するご連絡、その他のお問い合わせは以下からお願いします。いただいた内容は確認のうえ、必要に応じて修正いたします。
        </p>
        {CONTACT_FORM_URL ? (
          <a
            href={CONTACT_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block px-5 py-3 rounded-lg bg-pitch-500 text-white text-sm font-semibold hover:bg-pitch-600 transition-colors"
          >
            お問い合わせフォームを開く
          </a>
        ) : CONTACT_EMAIL ? (
          <p className="mt-4 text-[15px]">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-pitch-600 dark:text-pitch-300 hover:underline font-medium"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        ) : (
          <p className="mt-4 text-sm muted">お問い合わせ方法は準備中です。</p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">サイトの構成</h2>
        <p className="leading-8 text-[15px] mb-4">
          本サイトは静的なウェブサイトとして構築され、GitHub Pages で公開しています。選手データはWikipedia日本語版から定期的に取得し、毎日再ビルドしています。サーバー側でユーザーの情報を受け取る仕組みは持っていません。
        </p>
      </section>
    </Jp>
  );
}
