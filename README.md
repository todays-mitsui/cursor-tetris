# ブラウザで遊べるテトリス

SolidJS + TypeScript + Viteで作られたブラウザで遊べるテトリスゲームです。

## 機能

- 横10マス×縦30マスのグリッド
- キーボード操作によるテトリミノの移動と回転
- スコアシステム（複数行同時消しで高得点）
- 次のテトリミノのプレビュー表示
- ゲームオーバー時のスコア表示

## 操作方法

- ← : テトリミノを左に移動
- → : テトリミノを右に移動
- ↑ : テトリミノを右回転
- Shift + ↑ : テトリミノを左回転
- ↓ : テトリミノを即時落下

## 開発環境のセットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

## 使用技術

- SolidJS
- TypeScript
- Vite
