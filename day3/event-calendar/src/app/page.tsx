import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white dark:bg-slate-900">
      <main className="flex flex-col gap-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            地域イベントカレンダー
          </h1>
          <p className="text-xl text-slate-700 dark:text-slate-300">
            市内で開催される様々なイベント情報をカレンダー形式で確認できます
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/calendar" 
            className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              カレンダーを見る
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-center">
              月表示でイベントを確認できます
            </p>
          </Link>

          <Link 
            href="/events" 
            className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              イベント一覧
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-center">
              すべてのイベントをリスト表示で確認できます
            </p>
          </Link>
          
          <Link 
            href="/events/new" 
            className="flex flex-col items-center justify-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-md border border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow md:col-span-2"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              新しいイベントを追加
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-center">
              イベント情報を入力して登録できます
            </p>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            データの準備
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            カレンダーを使用する前に、まずサンプルデータをデータベースに追加してください。
          </p>
          <Link 
            href="/api/seed" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            サンプルデータを追加
          </Link>
        </div>
      </main>

      <footer className="mt-16 text-center text-slate-500 dark:text-slate-400">
        <p>©️ 2025 地域イベントカレンダー</p>
      </footer>
    </div>
  );
}
