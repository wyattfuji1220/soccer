# CLAUDE.md（プロジェクト設定）

海外組ポータル — 欧州でプレーする日本人サッカー選手のファクトデータベース兼アフィリエイトサイト。

## リポジトリ

- リモート: https://github.com/wyattfuji1220/soccer.git
- ブランチ: `main`

## 技術スタック

Next.js 15（App Router、`output: "export"` による静的サイト）/ TypeScript / Tailwind CSS v4。
サーバーサイド処理は持たない。データはビルド時に `src/data/` から読み込む。

## 絶対に守ること

1. **著作権**: 選手写真、クラブエンブレム、リーグロゴを自ら掲載しない。報道記事の文章を転載しない。
   事実を自らの言葉で整理し、出典URLを添える。
   動画だけは例外で、**権利者自身が公式チャンネルに出したもの**に限り、YouTubeの公式プレーヤーの
   埋め込みか、サムネイル付きのリンクで扱う。保存・再配信はしない。
   この例外は「サイトについて」にも明記すること（書いていない機能を動かさない）。
2. **出典**: 変動しうる情報（所属クラブ、料金、配信対象）には必ず `confidence` と最終確認日を持たせ、UIに表示する。
3. **秘密情報**: APIキー・アフィリエイトIDは `.env.local` にのみ置き、コードに書かない。`.env.local` は `.gitignore` 済み。
4. **スクレイピング**: 公式APIのみを使う。スクレイピングが必要になった場合は robots.txt を確認し、
   リクエスト間に1〜3秒の待機を入れる（`scripts/_env.mjs` の `politeDelay`）。
   利用規約でスクレイピングを禁止しているサイト（Transfermarkt等）には一切アクセスしない。
5. **広告表記**: アフィリエイトリンクを含むセクションには必ず `AdDisclosure` を配置する。

6. **日本語の行送り**: 文章は必ず `<Jp>`（`src/lib/jp.tsx`）で包む。折り返しの決まりは3つ。
   単語の途中で折り返さない／助詞・句読点を行頭に置かない／意味の切れ目で折り返す。
   JSXのテキストを2行に分けると間に半角スペースが入るため、日本語の文は1行に収める。
   クライアントコンポーネントは `<Jp>` を使わず `className="jp-auto"` を付ける
   （NodeとブラウザでICUの区切りがずれるとハイドレーションが合わないため）。

## データ更新のワークフロー

選手データの自動書き換えは行わない。`npm run data:check` は照合レポート（`output/player-audit.md`）を
出力するだけで、修正は人間が一次情報を見て判断する。

掲載候補は `npm run data:candidates` が Wikipedia の
「ヨーロッパのサッカーリーグに所属する日本人選手一覧」から作る。手で書き足さない。
対象の国と階層は `scripts/fetch-candidates.mjs` の `SCOPE` で決める。

```
npm run data:players    # 候補 → 選手 → クラブ（毎日、GitHub Actions が実行）
npm run data:transfers  # 前回との差分を移籍として記録
npm run data:season     # 今季の出場・得点（英語版Wikipediaの成績表から）
npm run data:alumni     # 過去に海外でプレーした選手（重いので週1）
npm run data:check      # 掲載データとWikipedia原文の突き合わせ
npm run data:fixtures   # 試合日程と結果（要 FOOTBALL_DATA_TOKEN）
npm run data:standings  # 順位表（要 FOOTBALL_DATA_TOKEN）
npm run data:highlights # 試合ハイライト（要 YOUTUBE_API_KEY）
```

ハイライトは権利者の公式チャンネル（DAZN Japan / U-NEXT フットボール）の投稿だけを扱う。
動画IDと題名を持つだけで、映像は保存も再配信もしない。リーグでは絞らないので、
権利者が新しいリーグの投稿を始めれば自動的に載る。
どれだけ出ているかは `npm run check:highlights` で数えられる。

今季の成績は英語版Wikipediaの「Career statistics」表から取る。日本語版の
インフォボックスはクラブ在籍中の通算値しか持たず、今季ぶんを切り出せない。
版の差分で出そうとすると、編集者が前季の数字をあとから書き足すぶんまで
今季として数えてしまうので採らない。

football-data.org は無料枠のまま使う。取れるのは日程・結果・順位表だけで、
選手ごとのスタッツとラインナップは有料。有料プランの検討は月間収益が
2万円を超えてから。

移籍は噂を扱わない。Wikipedia のインフォボックスが書き換わった＝確定したものだけを
`src/data/transfers.ts` に追記する。日付は「当サイトが確認した日」であって発表日ではない。

## Xへの自動投稿

`.github/workflows/post-x.yml` が日本時間 8:30（昨夜の結果）と 19:00（今夜の予定）に走る。
文面は `scripts/post-to-x.mjs` がデータから組み立てる。下書きだけ見るには次を実行する。

```
npm run x:tonight    # 今夜の試合予定
npm run x:results    # 昨夜の結果とハイライト
```

守ること。

1. **本文にURLを入れない**。X APIはURLを含む投稿を $0.200、含まない投稿を $0.015 で課金する。
   13倍違う。誘導はプロフィール欄のリンクに任せる。
2. **ハイライトの題名を引用しない**。題名は権利者が書いた文章で、当サイトのものではない。
   載せるのは自分たちのデータから組み立てた事実だけにする。
3. **「出場する」と書かない**。持っているのは所属クラブの試合であって、出場するかは分からない。
   必ず「所属クラブの試合です」と断る。
4. **何も無い日は投稿しない**。埋め草を出すと同じ文面が続いてXに弾かれる。

鍵（`X_API_KEY` `X_API_SECRET` `X_ACCESS_TOKEN` `X_ACCESS_SECRET`）が未設定のあいだは、
投稿せず下書きを実行ログに出すだけになる。揃えば自動で投稿に切り替わる。

本文にURLを入れない以上、プロフィールが唯一の入口になる。ヘッダー画像は次で作り直す。
1500×500。**左下にアイコンが重なる**——実測で横は幅の四分の一、縦は下の四割ほどなので、
文字の左端は430pxより右に置く。

載せるのはロゴと説明の2行だけにしてある。掲載人数やリーグ数のような変わる数字を
画像に焼くと古くなるため入れない。おかげでデータが増えても作り直さなくてよい。

```
npm run assets:x-header    # output/x-header.png
```

## 配色（明るい面と暗い面）

状態は3つある。何も指定していなければ端末の設定に従い、選べばそれが優先される。
選択は `<html data-theme="light|dark">` で表し、localStorage に残す。

属性を付けるのは `layout.tsx` の `<head>` 先頭にある小さなスクリプト。
Reactが動く前に走らせないと、暗い配色を選んでいる人に一瞬だけ明るい画面が出る。
サーバー側の出力とは必ず食い違うので、`<html>` に `suppressHydrationWarning` を付けてある。

`dark:` の判定は `globals.css` の `@custom-variant dark`。色の変数も同じ3状態で書く。
**片方の状態にしか無い色を作らないこと**——`:root` に明るい面を全部置き、
暗い面は `@media (prefers-color-scheme: dark) の :root:not([data-theme="light"])` と
`:root[data-theme="dark"]` の両方で上書きする。片方だけだと、端末の設定と選択が
食い違ったときに文字と地の色がちぐはぐになる。

明るい面の背景には `public/pitch.svg` をうっすら敷いている。色を焼かずマスクとして扱い、
`--pitch-line` を変えるだけで濃さを変えられる。暗い面では `transparent` にして消す。

## テスト・検証

変更後は必ず以下を実行してから完了とする。

```
npm run typecheck
npm run build
```

## ロゴと画像素材

ロゴの原画は利用者が用意したもので、**こちらで描き変えない**。原画は `scripts/brand/` に置く。

- `logo-wide.png` 横組み（海外組／PORTAL／右にコーナー）。ヘッダー・フッター・共有カードで使う
- `logo-tall.png` 縦組み。ボールが大きく描かれているので、アイコンはここから切り出す

原画は白地に緑（#098741）で描かれており、そのままでは濃紺の上に置けない。
`npm run assets:brand` が「緑がどれだけ乗っているか」を透明度に変換したマスクを作る。
表示側は CSS の mask で `currentColor` を流し込むので、明暗どちらの配色でも1枚で足りる。

```
npm run assets:brand      # public/ のロゴ・アイコン・og.png と output/x-avatar.png
npm run assets:x-header   # output/x-header.png（Xのプロフィール用）
```

Xのプロフィール画像（`output/x-avatar.png`）は緑の円に白抜き。タイムラインでは
32〜48pxまで小さくなり、その寸法では細部が消えて色の塊にしか見えないため、
塗り面積が最大になる形にしてある。白背景でも濃色背景でも同じ見え方になる。

Satori（共有カードとXのヘッダー）は CSS の mask を解釈しないため、
そちらは色を焼いた `public/logo-mint.png` を読む。**原画を差し替えたら
`assets:brand` → `assets:x-header` の順に実行する**（後者が前者の出力を使う）。

`public/logo-green.png` は白地向けに色を焼いたもの。サイトでは使っていないが、
外部に渡すときのために置いてある。

## SNS用のカード画像（OGP）

選手・リーグ・記事のページは `og.png` というルートで画像を作る（`src/lib/og.tsx`）。
Next の `opengraph-image.tsx` は拡張子の無いファイルとして書き出され、
GitHub Pages では画像として配信されないため使わない。

描画に使う書体は `scripts/fonts/og-*.ttf`。元の Noto Sans JP は可変フォントで
Satori が扱えないため、太さを固定した静的なTTFを別に作っている。
**選手やクラブを増やしたら作り直すこと**（収録外の文字は豆腐になる）。

```
npm run assets:og-font
```

## 成果物の置き場所

`output/site/` にビルド済みサイトを置く（`npm run export:output`）。
`output/` 配下には閲覧可能な最終成果物のみを置く。
