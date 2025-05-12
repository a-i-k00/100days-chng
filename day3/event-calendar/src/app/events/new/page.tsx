import { db } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// イベント種別の型定義
type EventType = {
  id: number;
  name: string;
  color: string;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
};

async function createEvent(formData: FormData) {
  "use server";

  // フォームデータの取得と変換
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const eventTypeId = parseInt(formData.get("eventTypeId") as string);
  const startDateStr = formData.get("startDate") as string;
  const startTimeStr = formData.get("startTime") as string;
  const endDateStr = formData.get("endDate") as string;
  const endTimeStr = formData.get("endTime") as string;
  const allDay = formData.get("allDay") === "on";

  // 日付と時間の処理
  const startDate = new Date(startDateStr);
  if (startTimeStr && !allDay) {
    const [hours, minutes] = startTimeStr.split(":").map(Number);
    startDate.setHours(hours, minutes);
  } else {
    startDate.setHours(0, 0, 0, 0);
  }

  const endDate = new Date(endDateStr || startDateStr);
  if (endTimeStr && !allDay) {
    const [hours, minutes] = endTimeStr.split(":").map(Number);
    endDate.setHours(hours, minutes);
  } else if (allDay) {
    endDate.setHours(23, 59, 59, 999);
  }

  // イベントの作成
  try {
    await db.event.create({
      data: {
        title,
        description: description || null,
        location: location || null,
        startTime: startDate,
        endTime: endDate,
        allDay,
        eventTypeId,
      },
    });

    // イベント一覧ページにリダイレクト
    return { success: true };
  } catch (error) {
    console.error("イベント作成エラー:", error);
    return { success: false, error: "イベントの作成に失敗しました" };
  }
}

export default async function NewEventPage() {
  // イベント種別の一覧を取得
  const eventTypes = await db.eventType.findMany({
    orderBy: {
      name: "asc",
    },
  }) as EventType[];

  // 現在の日付を取得（フォームのデフォルト値として使用）
  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-3xl">
      <div className="mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline flex items-center gap-1 text-lg mb-4"
        >
          ← トップページに戻る
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          新しいイベントを追加
        </h1>

        <form action={async (formData) => {
          const result = await createEvent(formData);
          if (result.success) {
            redirect('/events');
          }
        }} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-lg font-medium text-slate-900 dark:text-white mb-2"
            >
              イベント名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-lg"
              placeholder="イベントのタイトルを入力してください"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-lg font-medium text-slate-900 dark:text-white mb-2"
            >
              イベントの説明
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-lg"
              placeholder="イベントの詳細や説明を入力してください"
            ></textarea>
          </div>

          <div className="mb-6">
            <label
              htmlFor="location"
              className="block text-lg font-medium text-slate-900 dark:text-white mb-2"
            >
              開催場所
            </label>
            <input
              type="text"
              id="location"
              name="location"
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-lg"
              placeholder="イベントの開催場所を入力してください"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="eventTypeId"
              className="block text-lg font-medium text-slate-900 dark:text-white mb-2"
            >
              イベントの種類 <span className="text-red-500">*</span>
            </label>
            <select
              id="eventTypeId"
              name="eventTypeId"
              required
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-lg"
            >
              <option value="">イベントの種類を選択してください</option>
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="allDay"
                name="allDay"
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="allDay"
                className="ml-2 text-lg font-medium text-slate-900 dark:text-white"
              >
                終日イベント
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-lg font-medium text-slate-900 dark:text-white mb-2"
                >
                  開始日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  required
                  defaultValue={todayISO}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-lg"
                />
              </div>
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-lg font-medium text-slate-900 dark:text-white mb-2"
                >
                  開始時間
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  defaultValue="09:00"
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-lg"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-lg font-medium text-slate-900 dark:text-white mb-2"
                >
                  終了日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  required
                  defaultValue={todayISO}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-lg"
                />
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-lg font-medium text-slate-900 dark:text-white mb-2"
                >
                  終了時間
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  defaultValue="17:00"
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Link
              href="/events"
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium text-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
            >
              イベントを作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 