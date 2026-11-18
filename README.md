# 鋼PvP（Hagane PvP）ランキング

Minecraft PvPサーバー「鋼PvP」のDuel / FFAティアランキングサイトです。ダークトーンのダッシュボード風UIで、総合ランキング、FFAランキング、9つのDuelモード（Sword / Axe / Mace / Neth OP / UHC / Pot / SMP / Crystal / Spear）のティアリストを閲覧できます。

## 主な機能

- **総合ランキング** — 全モードのティアポイント合計順。上位3名は金・銀・銅のリボン表示、各モードのティアをチップで表示。
- **モード別ティアリスト** — Tier 1〜5のカラム表示。HT（High Tier）は緑、LT（Low Tier）は赤のラインで区別。
- **FFAランキング** — 総キル数 / ベストストリークの切り替え表示（上位10名）。
- **プレイヤー検索** — `/` キーでフォーカス、全ビューを絞り込み。
- **プロフィールモーダル** — モードごとの戦績とティア。
- **サーバーIPコピー**、Discordリンク、ランキング説明モーダル。

## 技術スタック

- TanStack Start（React 19 / TanStack Router）、Vite
- プレーンCSS（`src/rankings.css`）＋ Tailwind CSS 4
- lucide-react アイコン、sonner トースト
- Netlify にデプロイ

## ローカルで実行

```bash
pnpm install
netlify dev   # もしくは pnpm dev
```

## 今後の予定

- 現在のランキングデータは `src/data/rankings.ts` のサンプル（固定シードで生成）です。ゲームサーバーから試合結果を受け取るAPIと Netlify Database への保存を追加し、実データに切り替えます。
- 実際のMinecraftスキン表示（現在は名前から生成するピクセルアバター）。
- 公開ランキングAPI（`/api/rankings`）。
