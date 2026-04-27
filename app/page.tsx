import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// 引入相對路徑組件
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Dashboard from "./components/Dashboard";
import CalendarView from "./components/CalendarView";
import { ThemeToggle } from "./components/ThemeToggle";
import HabitTracker from "./components/HabitTracker";
import SettingsManager from "./components/SettingsManager";
import StatsModal from "./components/StatsModal";

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

  // 🌟 解開 Promise
  const resolvedSearchParams = await searchParams;

  // ==============================
  // 1. 處理日期邏輯 (鋼鐵級防護)
  // ==============================
  const newDay = new Date();
  const hkTodayStr = newDay.toLocaleDateString("en-CA", {
    timeZone: "Asia/Hong_Kong",
  });
  const now = new Date(`${hkTodayStr}T00:00:00+08:00`);

  // 解析年份
  let year = parseInt(resolvedSearchParams.year || "");
  if (isNaN(year) || year < 1900 || year > 2100) {
    year = now.getFullYear();
  }

  // 解析月份 (0-11)
  let month = parseInt(resolvedSearchParams.month || "");
  if (isNaN(month) || month < 0 || month > 11) {
    month = now.getMonth();
  }

  // 解析日期 (0 代表顯示全月)
  let selectedDay = parseInt(resolvedSearchParams.day || "");
  if (isNaN(selectedDay) || selectedDay < 0 || selectedDay > 31) {
    selectedDay = 0;
  }

  let page = parseInt(resolvedSearchParams.page || "1");
  if (isNaN(page) || page < 1) page = 1;

  // 計算導航用的日期物件
  const prevMonthDate = new Date(year, month - 1, 1);
  const nextMonthDate = new Date(year, month + 1, 1);

  // ==============================
  // 2. 獲取分類、習慣與打卡資料
  // ==============================
  let categories: any[] = [];
  let habits: any[] = [];
  let currentDayLogs: any[] = [];
  let sharedUsers: any[] = []; // 🌟 朋友清單
  let viewUserIds: string[] = []; // 🌟 準備要睇嘅 ID
  let sharedByMe: any[] = [];
  // 決定打卡日期：如果有 click 月曆就用 selectedDay，冇就用今日
  const targetDateForHabit =
    selectedDay > 0
      ? new Date(year, month, selectedDay)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (session?.user?.id) {
    // 攞分類
    categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });

    // 攞習慣
    habits = await prisma.habit.findMany({
      where: { userId: session.user.id },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    // 🌟 搵出授權咗畀我睇嘅朋友
    const accesses = await prisma.shareAccess.findMany({
      where: { guestId: session.user.id },
      include: { owner: true },
    });
    sharedUsers = accesses.map((a) => a.owner);

    // 🌟 搵出我授權咗畀邊個睇 (我 Share 畀人 -> InviteManager 用)
    const accessesByMe = await prisma.shareAccess.findMany({
      where: { ownerId: session.user.id },
      include: { guest: true },
    });
    sharedByMe = accessesByMe.map((a) => a.guest);

    // 解析 URL 嘅 view 參數，決定睇邊幾個 User 嘅資料
    const viewParam = resolvedSearchParams.view;
    if (viewParam) {
      viewUserIds = viewParam.split(",");
    } else {
      viewUserIds = [session.user.id]; // 預設只睇自己
    }

    // 攞「目標日期」嘅打卡記錄
    const targetDateStart = new Date(targetDateForHabit);
    targetDateStart.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(targetDateForHabit);
    targetDateEnd.setHours(23, 59, 59, 999);

    currentDayLogs = await prisma.habitLog.findMany({
      where: {
        userId: session.user.id,
        date: { gte: targetDateStart, lte: targetDateEnd },
      },
    });
  }

  // ... 其他參數
  const pageParam = resolvedSearchParams.page;

  // 🌟 加入呢兩行去接收分類參數
  const catParam = resolvedSearchParams.cat as string | undefined;
  const selectedCats = catParam ? catParam.split(",") : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* --- Header 頂部欄 --- */}
        {/* --- Header 頂部欄 (手機/電腦自適應排版) --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          {/* 上半部：標題 (手機版會將日月掣放喺右邊) */}
          <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-4">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              🎯 Habit Tracker
            </h1>

            {/* 手機版專屬：日月切換掣 */}
            <div className="md:hidden">{session?.user && <ThemeToggle />}</div>
          </div>

          {/* 下半部：操作按鈕與使用者資訊 */}
          {session?.user ? (
            <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3">
              {/* 左邊：統一系統設定面板 與 統計 */}
              <div className="flex flex-wrap items-center gap-2">
                <SettingsManager
                  categories={categories}
                  habits={habits}
                  sharedByMe={sharedByMe}
                />
                {/* 🌟 引入新嘅統計 Popup */}
                <StatsModal year={year} month={month} />
              </div>
              <div className="flex items-center gap-3">
                {/* 電腦版專屬：日月切換掣 (手機版會隱藏，因為移咗去上面) */}
                <div className="hidden md:block">
                  <ThemeToggle />
                </div>

                {/* 使用者資訊與登出 */}
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-3 md:px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                  {/* 加入 max-w-[100px] 同 truncate，防止名字太長撐爆排版 */}
                  <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200 truncate max-w-[100px] md:max-w-none">
                    {session.user.name}
                  </span>
                  <div className="w-px h-3 md:h-4 bg-gray-200 dark:bg-gray-600"></div>
                  <form
                    action={async () => {
                      "use server";
                      await signOut();
                    }}
                  >
                    <button className="text-xs text-red-500 hover:text-red-400 font-bold transition-all">
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
            {/* --- 左邊欄：總結與輸入 --- */}
            <div className="xl:col-span-1 space-y-8">
              <Dashboard userId={session.user.id!} year={year} month={month} />

              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                  快速記帳
                </h3>
                <ExpenseForm categories={categories} />
              </div>

              {/* 🌟 習慣打卡區 (放喺 Dashboard 下面) */}
              <HabitTracker
                habits={habits}
                initialLogs={currentDayLogs}
                targetDate={targetDateForHabit}
              />
            </div>

            {/* --- 右邊欄：月曆與清單 --- */}
            <div className="xl:col-span-2 space-y-8">
              {/* 月份切換控制列 */}
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

              {/* 月曆視圖 */}
              <CalendarView
                userId={session.user.id!}
                year={year}
                month={month}
                selectedDay={selectedDay}
                viewUserIds={viewUserIds} // 🌟 傳入選擇咗嘅 ID
                sharedUsers={sharedUsers} // 🌟 傳入朋友清單
                currentUser={{ id: session.user.id, name: session.user.name }}
              />

              {/* 詳細列表 */}
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
                  selectedCats={selectedCats} // 🌟 傳入呢行
                />
              </div>
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
              <button className="px-10 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none">
                使用 Google 帳號登入
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 底部裝飾 */}
      <footer className="mt-20 text-center text-gray-300 dark:text-gray-700 text-xs pb-10">
        &copy; {new Date().getFullYear()} Habit Tracker. 數據已加密儲存。
      </footer>
    </div>
  );
}
