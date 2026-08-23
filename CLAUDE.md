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

## データ更新のワークフロー

選手データの自動書き換えは行わない。`npm run data:wikipedia` は照合レポート（`output/data-verification.md`）を
出力するだけで、修正は人間が一次情報を見て判断する。

## テスト・検証

変更後は必ず以下を実行してから完了とする。

```
npm run typecheck
npm run build
```

## 成果物の置き場所

`output/site/` にビルド済みサイトを置く（`npm run export:output`）。
`output/` 配下には閲覧可能な最終成果物のみを置く。
