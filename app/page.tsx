import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// 引入相對路徑組件
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Dashboard from "./components/Dashboard";
import CategoryManager from "./components/CategoryManager";
import CalendarView from "./components/CalendarView";
import { ThemeToggle } from "./components/ThemeToggle";

export default async function Home({
  searchParams,
}: {
  // 🌟 Next.js 15 必須將 searchParams 設為 Promise
  searchParams: Promise<{
    year?: string;
    month?: string;
    day?: string;
    page?: string;
  }>;
}) {
  const session = await auth();

  // 🌟 解開 Promise
  const resolvedSearchParams = await searchParams;

  // ==============================
  // 1. 處理日期邏輯 (鋼鐵級防護)
  // ==============================
  const now = new Date();

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
  // 2. 獲取分類資料
  // ==============================
  let categories: any[] = [];
  if (session?.user?.id) {
    categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* --- Header 頂部欄 --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              💰 記帳 App
            </h1>
            {session?.user && <CategoryManager categories={categories} />}
          </div>

          {session?.user ? (
            <div className="flex items-center gap-3">
              {/* 日月切換掣 */}
              <ThemeToggle />

              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {session.user.name}
                </span>
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-600"></div>
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
                />
              </div>
            </div>
          </div>
        ) : (
          /* --- 未登入介面 --- */
          <div className="max-w-md mx-auto text-center py-20 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 mt-20 transition-colors">
            <div className="text-6xl mb-6">📉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              掌握你的財富
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 px-10">
              登入以開始記錄你的每日開支，並透過數據分析改善消費習慣。
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
        &copy; 2024 我的記帳神器. 數據已加密儲存。
      </footer>
    </div>
  );
}
