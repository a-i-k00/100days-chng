# ローカルイベントカレンダー

## プロジェクト概要

ローカルイベントカレンダーは、地域コミュニティのイベント情報を一元管理し、視覚的に分かりやすく提供するウェブアプリケーションです。地域の活動情報が分散している問題を解決し、住民同士のつながりを促進することを目的としています。

## 主な機能

- カレンダー形式での地域イベント表示（月・週・日ビュー対応）
- カテゴリー別（地域イベント、文化、健康、教育）のイベント管理と視覚化
- イベント情報の登録・編集・削除
- イベント検索・フィルタリング機能
- イベント共有用リンク生成機能
- Google Calendarへのイベント追加機能
- モバイル対応レスポンシブデザイン

## 技術スタック

- **フレームワーク**: Next.js 15.2.4
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS, shadcn/ui（Radixベース）
- **データベース**: PostgreSQL（Prisma ORM）
- **認証**: 未実装（計画中）
- **状態管理**: React hooks
- **UI/UXライブラリ**: Radix UI, date-fns, recharts
- **フォーム**: React Hook Form, Zod

## プロジェクト構造

```
LocalEventCalendar/
├── app/               # Next.js App Router ページ
├── components/        # UI コンポーネント
├── hooks/             # カスタムフック
├── lib/               # ユーティリティ関数とモックデータ
├── prisma/            # データベーススキーマと設定
├── public/            # 静的アセット
├── styles/            # グローバルスタイル
└── types/             # TypeScript 型定義
```

## 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone [repository-url]

# プロジェクトディレクトリに移動
cd LocalEventCalendar

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 設計ドキュメント

プロジェクトの詳細設計については、以下のドキュメントを参照してください：

- [アーキテクチャ概要](./overview.md) - システムアーキテクチャとコンポーネント設計
- [機能実装状況](./status.md) - 現在実装済みの機能と今後の実装予定
- [データモデル設計](./data_model_design.md) - ERD、テーブル定義、データフロー

## コントリビューション

プロジェクトへの貢献をご希望の場合は、以下の手順に従ってください：

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトは [MIT ライセンス](LICENSE) の下で公開されています。

## 連絡先

プロジェクトに関するご質問やフィードバックは、以下までご連絡ください：

- プロジェクト管理者: [email@example.com](mailto:email@example.com)
- Issue Tracker: [GitHub Issues](https://github.com/yourusername/LocalEventCalendar/issues) 