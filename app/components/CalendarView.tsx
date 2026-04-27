import { prisma } from "./../../lib/prisma";
import Link from "next/link";
import UserFilter from "./UserFilter";
import HabitPopover from "./HabitPopover"; // 🌟 引入新組件

interface CalendarViewProps {
  userId: string;
  year: number;
  month: number;
  selectedDay: number;
  viewUserIds: string[];
  sharedUsers: any[];
  currentUser: any;
}

export default async function CalendarView({
  userId,
  year,
  month,
  selectedDay,
  viewUserIds,
  sharedUsers,
  currentUser,
}: CalendarViewProps) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const expenses = await prisma.expense.findMany({
    where: {
      userId: { in: viewUserIds },
      date: { gte: firstDay, lte: lastDay },
    },
    include: { user: true },
  });

  const habitLogs = await prisma.habitLog.findMany({
    where: {
      userId: { in: viewUserIds },
      date: { gte: firstDay, lte: lastDay },
    },
    include: { habit: true, user: true },
  });

  const dailyExpenses = expenses.reduce(
    (acc, exp) => {
      const d = new Date(exp.date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!acc[dateStr]) acc[dateStr] = {};
      if (!acc[dateStr][exp.userId])
        acc[dateStr][exp.userId] = { name: exp.user.name, total: 0 };
      acc[dateStr][exp.userId].total += exp.amount;
      return acc;
    },
    {} as Record<
      string,
      Record<string, { name: string | null; total: number }>
    >,
  );

  // 🌟 改變整理結構：儲存 { emoji, name } 而唔係單純 string
  const dailyHabits = habitLogs.reduce(
    (acc, log) => {
      const d = new Date(log.date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      const isCompleted =
        log.habit.type === "BOOLEAN"
          ? log.value > 0
          : log.value >= (log.habit.target || 1);

      if (isCompleted) {
        if (!acc[dateStr]) acc[dateStr] = {};
        if (!acc[dateStr][log.userId]) {
          acc[dateStr][log.userId] = { name: log.user.name, habits: [] };
        }
        acc[dateStr][log.userId].habits.push({
          emoji: log.habit.emoji,
          name: log.habit.name,
        });
      }
      return acc;
    },
    {} as Record<
      string,
      Record<
        string,
        { name: string | null; habits: { emoji: string; name: string }[] }
      >
    >,
  );

  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const calendarGrid = [];
  for (let i = 0; i < startDayOfWeek; i++) calendarGrid.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarGrid.push(d);
  const daysOfWeek = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
      <UserFilter currentUser={currentUser} sharedUsers={sharedUsers} />

      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        {daysOfWeek.map((day, index) => (
          <div
            key={day}
            className={`py-2 text-center text-[10px] font-black uppercase tracking-widest ${index === 0 || index === 6 ? "text-red-400 dark:text-red-500" : "text-gray-400 dark:text-gray-500"}`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarGrid.map((day, index) => {
          if (day === null)
            return (
              <div
                key={`empty-${index}`}
                className="h-24 border-b border-r border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20"
              />
            );

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const displayDate = `${month + 1}月${day}日`; // 用嚟顯示喺 Modal

          const dayHabitsData = dailyHabits[dateStr] || {};
          const userIdsWithHabits = Object.keys(dayHabitsData).sort((a, b) => {
            if (a === currentUser.id) return -1;
            if (b === currentUser.id) return 1;
            return 0;
          });

          const dayExpensesData = dailyExpenses[dateStr] || {};
          const userIdsWithExpenses = Object.keys(dayExpensesData).sort(
            (a, b) => {
              if (a === currentUser.id) return -1;
              if (b === currentUser.id) return 1;
              return 0;
            },
          );

          const isSelected = selectedDay === day;
          const today = new Date();
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;
          const viewQuery =
            viewUserIds.length > 0 ? `&view=${viewUserIds.join(",")}` : "";
          return (
            <Link
              key={day}
              href={`/?year=${year}&month=${month}&day=${day}${viewQuery}`}
              className={`h-24 p-1.5 border-b border-r border-gray-50 dark:border-gray-800 relative flex flex-col transition-all cursor-pointer block
                ${isSelected ? "bg-blue-50 dark:bg-blue-900/30 ring-2 ring-inset ring-blue-500 z-10" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}
                ${isToday && !isSelected ? "bg-blue-50/20 dark:bg-blue-900/10" : ""}
              `}
            >
              <div className="flex justify-between items-start w-full">
                <span
                  className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0
                  ${isToday ? "bg-blue-600 text-white" : "text-gray-400 dark:text-gray-500"}
                  ${isSelected && !isToday ? "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800" : ""}
                `}
                >
                  {day}
                </span>

                {/* 🌟 替換為 HabitPopover */}
                {userIdsWithHabits.length > 0 && (
                  <div className="flex flex-col items-end gap-0.5 max-h-[40px] overflow-hidden">
                    {userIdsWithHabits.slice(0, 3).map((uid) => (
                      <HabitPopover
                        key={uid}
                        userName={dayHabitsData[uid].name}
                        isMe={uid === currentUser.id}
                        habits={dayHabitsData[uid].habits}
                        dateStr={displayDate}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center w-full mt-auto gap-[2px]">
                {userIdsWithExpenses.length > 0 ? (
                  <>
                    {userIdsWithExpenses.slice(0, 2).map((uid) => {
                      const isMe = uid === currentUser.id;
                      const data = dayExpensesData[uid];
                      return (
                        <div
                          key={uid}
                          className="flex items-center w-full justify-center"
                          title={data.name || "朋友"}
                        >
                          {!isMe && (
                            <span className="bg-red-100 dark:bg-red-900/80 text-red-600 dark:text-red-300 rounded-full w-3 h-3 flex items-center justify-center mr-1 font-bold text-[8px] shrink-0">
                              {(data.name || "F").charAt(0).toUpperCase()}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-black leading-none truncate ${isSelected ? "text-blue-700 dark:text-blue-300" : isMe ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            ${data.total.toFixed(0)}
                          </span>
                        </div>
                      );
                    })}
                    {userIdsWithExpenses.includes(currentUser.id) && (
                      <div className="w-full h-[3px] mt-0.5 bg-gray-100 dark:bg-gray-700 rounded-full max-w-[30px] overflow-hidden">
                        <div
                          className={`h-full ${isSelected ? "bg-blue-400" : "bg-red-400 dark:bg-red-500"}`}
                          style={{
                            width: `${Math.min((dayExpensesData[currentUser.id].total / 500) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-[14px]"></div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
