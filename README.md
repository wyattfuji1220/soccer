# 海外組ポータル

欧州各リーグでプレーする日本人サッカー選手のファクトデータベース。
出典と最終確認日を明記し、著作権保護対象コンテンツ（選手写真・クラブロゴ・試合映像）を扱わない方針で運営する。

## 技術構成

| 項目 | 内容 |
| --- | --- |
| フレームワーク | Next.js 15（App Router / 静的エクスポート） |
| スタイル | Tailwind CSS v4 |
| データ | `src/data/` 配下の TypeScript / JSON |
| デプロイ | 静的ホスティング（Vercel / Cloudflare Pages / GitHub Pages のいずれでも可） |

## セットアップ

```bash
npm install
cp .env.example .env.local   # 必要なキーを記入
npm run dev
```

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー（http://localhost:3000） |
| `npm run build` | 静的ビルド（`out/` に出力） |
| `npm run export:output` | `out/` を `output/site/` に複製 |
| `npm run typecheck` | 型チェック |
| `npm run data:wikipedia` | 選手データを Wikipedia と照合し `output/data-verification.md` を生成 |
| `npm run data:fixtures` | football-data.org から試合日程を取得し `src/data/fixtures.json` を更新 |

## デプロイ

GitHub Actions で GitHub Pages に自動デプロイする（`.github/workflows/deploy.yml`）。

- `main` へのプッシュごとにビルドして公開
- 毎日 21:00 JST に再ビルド（日程データの鮮度を保つため）
- 公開URL: https://wyattfuji1220.github.io/soccer/

### 初回のみ必要な設定

GitHub リポジトリの **Settings → Pages → Build and deployment → Source** を
**「GitHub Actions」** に変更する。これを行うまでワークフローは失敗する。

### リポジトリシークレット（任意）

**Settings → Secrets and variables → Actions** に登録すると、ビルド時に反映される。
未登録でもビルドは通る。

| シークレット名 | 用途 |
| --- | --- |
| `FOOTBALL_DATA_TOKEN` | 実際の試合日程を取得する。未設定ならサンプル日程のまま |
| `AMAZON_TAG` | AmazonアソシエイトのトラッキングID |
| `RAKUTEN_AFFILIATE_ID` | 楽天アフィリエイトID |

### サブパス配信について

GitHub Pages はリポジトリ名のサブパス（`/soccer/`）で配信されるため、
ワークフローで `NEXT_PUBLIC_BASE_PATH=/soccer` を渡している。
独自ドメインを取得してルート配信に切り替える場合は、この環境変数を外し、
`NEXT_PUBLIC_SITE_URL` を新しいドメインに変更する。

## データの扱い方

`src/lib/types.ts` の `confidence` フィールドで、情報の確度を2段階で管理する。

- `verified` — 一次情報で確認済み
- `needs-review` — 変動しうる、または未確認

所属クラブ・背番号・配信サービスの料金と配信対象は**すべて変動する**ため、初期値は `needs-review`。
`npm run data:wikipedia` は自動で書き換えを行わず、確認用レポートのみを出力する（誤検知でファクトを壊さないため）。

### 更新すべきタイミング

| 対象 | タイミング |
| --- | --- |
| 選手の所属クラブ | 移籍市場の閉幕直後（9月上旬・2月上旬） |
| 配信サービスの配信対象 | シーズン開幕前（7月）および冬（1月） |
| 試合日程 | 週1回（`npm run data:fixtures`） |

## アフィリエイト

トラッキングIDは `.env.local` にのみ記載し、コードにハードコードしない。
未設定でもサイトは動作し、リンクは通常URLにフォールバックする（審査通過前でも公開できる）。
リンク生成は `src/lib/affiliate.ts` に集約している。

広告を含むセクションには `AdDisclosure` コンポーネントで広告表記を必ず添える（ステマ規制対応）。

## ディレクトリ

```
src/
├── app/          ページ（App Router）
├── components/   共通UI
├── data/         選手・リーグ・配信サービス・記事データ
└── lib/          型定義、フォーマッタ、アフィリエイトリンク生成
scripts/          データ取得・検証スクリプト
output/           最終成果物（ビルド済みサイト、検証レポート）
```
