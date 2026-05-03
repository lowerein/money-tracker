import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

// 引入組件
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Dashboard from "./components/Dashboard";
import CalendarView from "./components/CalendarView";
import { ThemeToggle } from "./components/ThemeToggle";
import HabitTracker from "./components/HabitTracker";
import DailyNotepad from "./components/DailyNotepad";
import SettingsManager from "./components/SettingsManager";
import StatsModal from "./components/StatsModal";

// 引入工具函式 (確保路徑正確)
import { getHKDateString, getSafeDBDate } from "../lib/utils";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    month?: string;
    day?: string;
    page?: string;
    view?: string;
    cat?: string;
  }>;
}) {
  const session = await auth();

  // 1. 處理 Next.js 15 的非同步 searchParams
  const resolvedSearchParams = await searchParams;

  // ==============================
  // 2. 處理日期邏輯 (香港時間鋼鐵防護版)
  // ==============================
  const hkTodayStr = getHKDateString(); // "YYYY-MM-DD"
  const [hkY, hkM, hkD] = hkTodayStr.split("-").map(Number);

  // 解析年份
  let year = parseInt(resolvedSearchParams.year || "");
  if (isNaN(year) || year < 1900 || year > 2100) {
    year = hkY;
  }

  // 解析月份 (0-11)
  let month = parseInt(resolvedSearchParams.month || "");
  if (isNaN(month) || month < 0 || month > 11) {
    month = hkM - 1;
  }

  // 解析日期 (0 代表顯示全月)
  let selectedDay = parseInt(resolvedSearchParams.day || "");
  if (isNaN(selectedDay) || selectedDay < 0 || selectedDay > 31) {
    // 如果目前月份是香港今個月，預設選中「今日」，否則預設「0」(全月)
    if (year === hkY && month === hkM - 1) {
      selectedDay = hkD;
    } else {
      selectedDay = 0;
    }
  }

  // 決定用於 HabitTracker 的特定日期字串
  // 如果選了全月(day=0)，HabitTracker 預設顯示 1 號或是今天
  const habitDay =
    selectedDay > 0 ? selectedDay : year === hkY && month === hkM - 1 ? hkD : 1;
  const targetDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(habitDay).padStart(2, "0")}`;
  const targetDate = getSafeDBDate(targetDateStr);

  // 分頁邏輯
  let page = parseInt(resolvedSearchParams.page || "1");
  if (isNaN(page) || page < 1) page = 1;

  const prevMonthDate = new Date(year, month - 1, 1);
  const nextMonthDate = new Date(year, month + 1, 1);

  // ==============================
  // 3. 獲取資料
  // ==============================
  let categories: any[] = [];
  let habits: any[] = [];
  let currentDayLogs: any[] = [];
  let sharedUsers: any[] = [];
  let sharedByMe: any[] = [];
  let viewUserIds: string[] = [];
  let dailyNote: any;
  let monthNotes: any[] = [];

  if (session?.user?.id) {
    // 1. 讀取當天筆記
    dailyNote = await prisma.dailyNote.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: targetDate,
        },
      },
    });

    // 2. 為了讓 CalendarView 顯示筆記圖示，讀取當月所有筆記
    monthNotes = await prisma.dailyNote.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(year, month, 1),
          lte: new Date(year, month + 1, 0),
        },
      },
      orderBy: { date: "asc" }, // 🌟 順住日子排
    });

    // A. 分類與習慣 (按 order 排序)
    categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    habits = await prisma.habit.findMany({
      where: { userId: session.user.id },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    // B. 社交/分享邏輯
    const accesses = await prisma.shareAccess.findMany({
      where: { guestId: session.user.id },
      include: { owner: true },
    });
    sharedUsers = accesses.map((a) => a.owner);

    const accessesByMe = await prisma.shareAccess.findMany({
      where: { ownerId: session.user.id },
      include: { guest: true },
    });
    sharedByMe = accessesByMe.map((a) => a.guest);

    // 決定查看對象
    const viewParam = resolvedSearchParams.view;
    viewUserIds = viewParam ? viewParam.split(",") : [session.user.id];

    // C. 獲取選中日期的打卡記錄 (精準 24 小時範圍)
    const targetDateEnd = new Date(
      targetDate.getTime() + 24 * 60 * 60 * 1000 - 1,
    );
    currentDayLogs = await prisma.habitLog.findMany({
      where: {
        userId: session.user.id,
        date: { gte: targetDate, lte: targetDateEnd },
      },
    });
  }

  const selectedCats = resolvedSearchParams.cat
    ? resolvedSearchParams.cat.split(",")
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* --- Header 頂部欄 --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-4">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              🎯 Habit Tracker
            </h1>
            <div className="md:hidden">{session?.user && <ThemeToggle />}</div>
          </div>

          {session?.user ? (
            <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <SettingsManager
                  categories={categories}
                  habits={habits}
                  sharedByMe={sharedByMe}
                />
                <StatsModal year={year} month={month} />
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:block">
                  <ThemeToggle />
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                  <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200 truncate max-w-[100px]">
                    {session.user.name}
                  </span>
                  <div className="w-px h-4 bg-gray-200 dark:bg-gray-600"></div>
                  <form
                    action={async () => {
                      "use server";
                      await signOut();
                    }}
                  >
                    <button className="text-xs text-red-500 hover:text-red-400 font-bold">
                      登出
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {session?.user ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            {/* --- 左邊欄：Dashboard 與 習慣打卡 --- */}
            <div className="xl:col-span-1 space-y-8">
              {/* --- 左邊欄：Dashboard、記帳、習慣、記事 --- */}
              <div className="xl:col-span-1 space-y-8">
                <Dashboard
                  userId={session.user.id!}
                  year={year}
                  month={month}
                />

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                  <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                    快速記帳
                  </h3>
                  <ExpenseForm categories={categories} />
                </div>

                <HabitTracker
                  habits={habits}
                  initialLogs={currentDayLogs}
                  targetDate={targetDate}
                  dateStr={targetDateStr}
                />
              </div>
            </div>

            {/* --- 右邊欄：月曆與清單 --- */}
            <div className="xl:col-span-2 space-y-8">
              {/* 月份切換 */}
              <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <Link
                  href={`/?year=${prevMonthDate.getFullYear()}&month=${prevMonthDate.getMonth()}`}
                  className="px-6 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 font-bold transition-all"
                >
                  ◀
                </Link>
                <div className="text-center">
                  <span className="text-xl font-black text-gray-800 dark:text-gray-100">
                    {year} 年 {month + 1} 月
                  </span>
                </div>
                <Link
                  href={`/?year=${nextMonthDate.getFullYear()}&month=${nextMonthDate.getMonth()}`}
                  className="px-6 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 font-bold transition-all"
                >
                  ▶
                </Link>
              </div>

              {/* 月曆 */}
              <CalendarView
                userId={session.user.id!}
                year={year}
                month={month}
                selectedDay={selectedDay}
                viewUserIds={viewUserIds}
                sharedUsers={sharedUsers}
                notesDates={monthNotes.map(
                  (n) => n.date.toISOString().split("T")[0],
                )}
                currentUser={{ id: session.user.id!, name: session.user.name! }}
              />

              {/* 帳目列表 */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200">
                    {selectedDay > 0
                      ? `📅 ${month + 1}月${selectedDay}日 帳目明細`
                      : "📜 全月帳目明細"}
                  </h3>
                  {selectedDay > 0 && (
                    <Link
                      href={`/?year=${year}&month=${month}&day=0&page=1`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      顯示全月
                    </Link>
                  )}
                </div>
                <ExpenseList
                  userId={session.user.id!}
                  year={year}
                  month={month}
                  day={selectedDay}
                  page={page}
                  viewUserIds={viewUserIds}
                  selectedCats={selectedCats}
                />
              </div>

              <DailyNotepad
                initialContent={dailyNote?.content || ""}
                targetDate={targetDate}
                dateStr={targetDateStr}
                monthNotes={monthNotes} // 🌟 加多呢行傳遞資料
              />
            </div>
          </div>
        ) : (
          /* --- 未登入介面 --- */
          <div className="max-w-md mx-auto text-center py-20 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 mt-20 transition-colors">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              掌控你的人生與財富
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 px-10">
              登入以開始追蹤每日好習慣與開支，透過數據分析成就更好的自己。
            </p>
            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <button className="px-10 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-200">
                使用 Google 帳號登入
              </button>
            </form>
          </div>
        )}
      </div>

      <footer className="mt-20 text-center text-gray-300 dark:text-gray-700 text-xs pb-10">
        &copy; {new Date().getFullYear()} Habit Tracker. 數據已加密儲存。
      </footer>
    </div>
  );
}
