import { db } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

// イベントとイベント種別を含む型定義
type EventType = {
  id: number;
  name: string;
  color: string;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  eventTypeId: number;
  createdAt: Date;
  updatedAt: Date;
};

type EventWithType = Event & {
  eventType: EventType;
};

export default async function EventsPage() {
  // イベントとイベント種別を取得
  const events = await db.event.findMany({
    include: {
      eventType: true,
    },
    orderBy: {
      startTime: "asc",
    },
  }) as EventWithType[];

  // 現在の日付を取得
  const now = new Date();

  // イベントを「今後のイベント」と「過去のイベント」に分類
  const upcomingEvents = events.filter(
    (event: EventWithType) => new Date(event.startTime) >= now
  );
  const pastEvents = events.filter((event: EventWithType) => new Date(event.startTime) < now);

  // 日付のフォーマット関数
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  // 時間のフォーマット関数
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-4xl">
      <div className="mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline flex items-center gap-1 text-lg mb-4"
        >
          ← トップページに戻る
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            すべてのイベント
          </h1>
          <Link
            href="/events/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            新しいイベントを追加
          </Link>
        </div>
      </div>

      {upcomingEvents.length > 0 ? (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b pb-2">
            今後のイベント
          </h2>
          <div className="space-y-6">
            {upcomingEvents.map((event: EventWithType) => (
              <div
                key={event.id}
                className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border-l-4"
                style={{ borderLeftColor: event.eventType.color }}
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {event.title}
                    </h3>
                    <div className="mb-2 text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">日時:</span>{" "}
                      {formatDate(event.startTime)}{" "}
                      {event.allDay
                        ? "（終日）"
                        : `${formatTime(event.startTime)} 〜 ${formatTime(
                            event.endTime
                          )}`}
                    </div>
                    <div className="mb-4 text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">場所:</span>{" "}
                      {event.location || "未定"}
                    </div>
                    {event.description && (
                      <p className="text-slate-700 dark:text-slate-300 mb-4">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 lg:mt-0">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: `${event.eventType.color}20`,
                        color: event.eventType.color,
                      }}
                    >
                      {event.eventType.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-12 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
          <p className="text-slate-700 dark:text-slate-300">
            今後のイベントはまだありません。
          </p>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b pb-2">
            過去のイベント
          </h2>
          <div className="space-y-4">
            {pastEvents.map((event: EventWithType) => (
              <div
                key={event.id}
                className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border-l-4 opacity-75"
                style={{ borderLeftColor: event.eventType.color }}
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {event.title}
                    </h3>
                    <div className="mb-2 text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">日時:</span>{" "}
                      {formatDate(event.startTime)}{" "}
                      {event.allDay
                        ? "（終日）"
                        : `${formatTime(event.startTime)} 〜 ${formatTime(
                            event.endTime
                          )}`}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">場所:</span>{" "}
                      {event.location || "未定"}
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: `${event.eventType.color}20`,
                        color: event.eventType.color,
                      }}
                    >
                      {event.eventType.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 