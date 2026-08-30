# CLAUDE.md（プロジェクト設定）

海外組ポータル — 欧州でプレーする日本人サッカー選手のファクトデータベース兼アフィリエイトサイト。

## リポジトリ

- リモート: https://github.com/wyattfuji1220/soccer.git
- ブランチ: `main`

## 技術スタック

Next.js 15（App Router、`output: "export"` による静的サイト）/ TypeScript / Tailwind CSS v4。
サーバーサイド処理は持たない。データはビルド時に `src/data/` から読み込む。

## 絶対に守ること

1. **著作権**: 選手写真、クラブエンブレム、リーグロゴ、試合映像を掲載しない。報道記事の文章を転載しない。
   事実を自らの言葉で整理し、出典URLを添える。
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
npm run data:alumni     # 過去に海外でプレーした選手（重いので週1）
npm run data:check      # 掲載データとWikipedia原文の突き合わせ
```

移籍は噂を扱わない。Wikipedia のインフォボックスが書き換わった＝確定したものだけを
`src/data/transfers.ts` に追記する。日付は「当サイトが確認した日」であって発表日ではない。

## テスト・検証

変更後は必ず以下を実行してから完了とする。

```
npm run typecheck
npm run build
```

## 成果物の置き場所

`output/site/` にビルド済みサイトを置く（`npm run export:output`）。
`output/` 配下には閲覧可能な最終成果物のみを置く。
