import { db } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

// データの再取得を強制するために動的レンダリングを設定
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

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string };
}) {
  // 年月のパラメータを取得。デフォルトは現在の年月
  const today = new Date();
  const yearParam = searchParams.year
    ? parseInt(searchParams.year)
    : today.getFullYear();
  const monthParam = searchParams.month
    ? parseInt(searchParams.month) - 1
    : today.getMonth();

  // 無効な年月のパラメータの場合、404を返す
  if (isNaN(yearParam) || isNaN(monthParam)) {
    return notFound();
  }

  // 表示する月の初日と最終日を設定
  const startDate = new Date(yearParam, monthParam, 1);
  const endDate = new Date(yearParam, monthParam + 1, 0);

  // 月の最初の日の曜日（0: 日曜日, 1: 月曜日, ..., 6: 土曜日）
  const firstDayOfWeek = startDate.getDay();

  // 月の日数
  const daysInMonth = endDate.getDate();

  // 前月の末日
  const lastDayOfPrevMonth = new Date(yearParam, monthParam, 0).getDate();

  // カレンダーに表示する週の数
  const weeksInMonth = Math.ceil((daysInMonth + firstDayOfWeek) / 7);

  // 月の期間内のイベントを取得
  const events = await db.event.findMany({
    where: {
      OR: [
        // 開始日が月内
        {
          startTime: {
            gte: new Date(yearParam, monthParam, 1, 0, 0, 0),
            lt: new Date(yearParam, monthParam + 1, 1, 0, 0, 0),
          },
        },
        // 終了日が月内
        {
          endTime: {
            gte: new Date(yearParam, monthParam, 1, 0, 0, 0),
            lt: new Date(yearParam, monthParam + 1, 1, 0, 0, 0),
          },
        },
        // 開始と終了が月をまたぐイベント
        {
          AND: [
            {
              startTime: {
                lt: new Date(yearParam, monthParam + 1, 1, 0, 0, 0),
              },
            },
            {
              endTime: {
                gte: new Date(yearParam, monthParam, 1, 0, 0, 0),
              },
            },
          ],
        },
      ],
    },
    include: {
      eventType: true,
    },
    orderBy: {
      startTime: "asc",
    },
  }) as EventWithType[];

  // 日ごとのイベントを整理
  const eventsByDay: Record<number, EventWithType[]> = {};
  events.forEach((event) => {
    // イベントの開始日を取得
    const eventDate = new Date(event.startTime);
    // 該当月のイベントのみを表示
    if (
      eventDate.getFullYear() === yearParam &&
      eventDate.getMonth() === monthParam
    ) {
      const day = eventDate.getDate();
      if (!eventsByDay[day]) {
        eventsByDay[day] = [];
      }
      eventsByDay[day].push(event);
    }
  });

  // 月名の配列
  const monthNames = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月"
  ];

  // 曜日の配列
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  // 前月と翌月のリンク用のURLを生成
  const prevMonth =
    monthParam === 0
      ? `?year=${yearParam - 1}&month=12`
      : `?year=${yearParam}&month=${monthParam}`;
  const nextMonth =
    monthParam === 11
      ? `?year=${yearParam + 1}&month=1`
      : `?year=${yearParam}&month=${monthParam + 2}`;

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-5xl">
      <div className="mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline flex items-center gap-1 text-lg mb-4"
        >
          ← トップページに戻る
        </Link>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            イベントカレンダー
          </h1>
          <Link
            href="/events/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            新しいイベントを追加
          </Link>
        </div>

        {/* ナビゲーション */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href={prevMonth}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700"
          >
            前月
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {yearParam}年 {monthNames[monthParam]}
          </h2>
          <Link
            href={nextMonth}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700"
          >
            翌月
          </Link>
        </div>

        {/* カレンダー */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          {/* 曜日のヘッダー */}
          <div className="grid grid-cols-7 text-center font-bold py-3 border-b border-slate-200 dark:border-slate-700">
            {weekdays.map((day, index) => (
              <div
                key={index}
                className={`text-lg ${
                  index === 0
                    ? "text-red-500 dark:text-red-400"
                    : index === 6
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-slate-800 dark:text-slate-200"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* カレンダー本体 */}
          <div>
            {Array.from({ length: weeksInMonth }).map((_, weekIndex) => (
              <div
                key={weekIndex}
                className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 last:border-b-0"
              >
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dayNumber = weekIndex * 7 + dayIndex + 1 - firstDayOfWeek;
                  const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                  const isPrevMonth = dayNumber <= 0;
                  const isNextMonth = dayNumber > daysInMonth;

                  // 実際の日付を計算
                  let displayDay;
                  if (isPrevMonth) {
                    displayDay = lastDayOfPrevMonth + dayNumber;
                  } else if (isNextMonth) {
                    displayDay = dayNumber - daysInMonth;
                  } else {
                    displayDay = dayNumber;
                  }

                  // 今日かどうかを判定
                  const isToday =
                    isCurrentMonth &&
                    today.getDate() === dayNumber &&
                    today.getMonth() === monthParam &&
                    today.getFullYear() === yearParam;

                  // 日ごとのイベントを取得
                  const dayEvents = isCurrentMonth ? eventsByDay[dayNumber] || [] : [];

                  return (
                    <div
                      key={dayIndex}
                      className={`p-2 min-h-[120px] ${
                        isCurrentMonth
                          ? ""
                          : "bg-slate-100 dark:bg-slate-700/30 text-slate-400 dark:text-slate-500"
                      } ${
                        isToday
                          ? "bg-blue-50 dark:bg-blue-900/20 font-bold"
                          : ""
                      } border-r border-slate-200 dark:border-slate-700 last:border-r-0`}
                    >
                      <div
                        className={`text-center mb-1 ${
                          dayIndex === 0
                            ? "text-red-500 dark:text-red-400"
                            : dayIndex === 6
                            ? "text-blue-500 dark:text-blue-400"
                            : ""
                        }`}
                      >
                        {displayDay}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="text-xs p-1 rounded truncate"
                            style={{
                              backgroundColor: `${event.eventType.color}20`,
                              color: event.eventType.color,
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-slate-500 text-center">
                            +{dayEvents.length - 3}件
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 