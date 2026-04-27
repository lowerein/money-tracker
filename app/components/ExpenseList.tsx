import { prisma } from "./../../lib/prisma";
import ExpenseRow from "./ExpenseRow";
import Link from "next/link";

interface ExpenseListProps {
  userId: string;
  year: number;
  month: number;
  day: number;
  page: number;
  viewUserIds: string[];
}

export default async function ExpenseList({
  userId,
  year,
  month,
  day,
  page,
  viewUserIds,
}: ExpenseListProps) {
  const ITEMS_PER_PAGE = 10;

  // 設定時間範圍
  let startDate, endDate;
  if (day > 0) {
    startDate = new Date(year, month, day);
    endDate = new Date(year, month, day + 1);
  } else {
    startDate = new Date(year, month, 1);
    endDate = new Date(year, month + 1, 1);
  }

  const whereCondition = {
    userId: { in: viewUserIds },
    date: { gte: startDate, lt: endDate },
  };

  // 1. 計算所有符合條件的總金額（不分分頁）
  const totalAmountResult = await prisma.expense.aggregate({
    where: whereCondition,
    _sum: {
      amount: true,
    },
  });
  const grandTotal = totalAmountResult._sum.amount || 0;

  // 2. 分頁邏輯
  const totalRecords = await prisma.expense.count({ where: whereCondition });
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);

  // 3. 獲取當前頁面的開支數據
  const expenses = await prisma.expense.findMany({
    where: whereCondition,
    include: {
      category: true,
      user: true,
    },
    orderBy: { date: "desc" },
    skip: (safePage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  const viewQuery =
    viewUserIds.length > 0 ? `&view=${viewUserIds.join(",")}` : "";
  const baseUrl = `/?year=${year}&month=${month}&day=${day}${viewQuery}`;

  if (totalRecords === 0) {
    return (
      <div className="p-10 text-center text-gray-400 dark:text-gray-500 font-medium bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        呢段時間暫時未有任何開支記錄。💰
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 flex flex-col h-full shadow-inner">
      {/* 🌟 頂部總數顯示區 */}
      <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
            {day > 0 ? `${month + 1}月${day}日` : `${month + 1}月`} 總開支
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              $
              {grandTotal.toLocaleString(undefined, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </span>
            {viewUserIds.length > 1 && (
              <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                多人模式
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block">
            記錄總數
          </span>
          <span className="text-sm font-black text-gray-700 dark:text-gray-300">
            {totalRecords} 筆
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
          <thead className="bg-white dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider w-24">
                日期
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider w-16">
                用戶
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider w-32">
                分類
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                金額
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                備註
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider w-20">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
            {expenses.map((exp) => (
              <ExpenseRow
                key={exp.id}
                exp={exp}
                categories={categories}
                currentUserId={userId}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* 分頁控制 */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/50">
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
            第 {safePage} 頁 (共 {totalPages} 頁)
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`${baseUrl}&page=${safePage - 1}`}
              scroll={false}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                safePage <= 1
                  ? "bg-gray-100 text-gray-300 pointer-events-none"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              }`}
            >
              上一頁
            </Link>
            <Link
              href={`${baseUrl}&page=${safePage + 1}`}
              scroll={false}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                safePage >= totalPages
                  ? "bg-gray-100 text-gray-300 pointer-events-none"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              }`}
            >
              下一頁
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
