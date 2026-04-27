import { prisma } from "./../../lib/prisma"
import ExpenseRow from "./ExpenseRow"
import Link from "next/link"

export default async function ExpenseList({ 
  userId, year, month, day, page 
}: { 
  userId: string, year: number, month: number, day: number, page: number 
}) {
  const ITEMS_PER_PAGE = 10 // 🌟 每頁顯示幾多筆數

  // 1. 設定搜尋範圍
  let startDate, endDate
  if (day > 0) {
    startDate = new Date(year, month, day)
    endDate = new Date(year, month, day + 1)
  } else {
    startDate = new Date(year, month, 1)
    endDate = new Date(year, month + 1, 1)
  }

  const whereCondition = {
    userId,
    date: { gte: startDate, lt: endDate }
  }

  // 2. 獲取該條件下嘅「總記錄數量」，用嚟計算總頁數
  const totalRecords = await prisma.expense.count({
    where: whereCondition
  })
  
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE) || 1
  
  // 防呆：如果網址打嘅頁數大過總頁數，強制變返最後一頁
  const safePage = Math.min(Math.max(1, page), totalPages)

  // 3. 獲取「指定頁面」嘅開支記錄 (加入 skip 同 take)
  const expenses = await prisma.expense.findMany({
    where: whereCondition,
    include: { category: true },
    orderBy: { date: "desc" },
    skip: (safePage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  })

  // 4. 獲取分類清單 (畀 ExpenseRow 編輯模式用)
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" }
  })

  // 產生分頁用嘅基礎 URL
  const baseUrl = `/?year=${year}&month=${month}&day=${day}`

  if (totalRecords === 0) {
    return (
      <div className="p-10 text-center text-gray-400 dark:text-gray-500 font-medium bg-white dark:bg-gray-900">
         呢段時間暫時未有任何開支記錄，繼續保持！💰
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 flex flex-col h-full">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
          <thead className="bg-gray-50/80 dark:bg-gray-800/80">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider w-24">日期</th>
              <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider w-32">分類</th>
              <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">金額</th>
              <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">備註</th>
              <th className="px-4 py-3 text-right text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider w-20">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
            {expenses.map((exp) => (
              <ExpenseRow key={exp.id} exp={exp} categories={categories} />
            ))}
          </tbody>
        </table>
      </div>

      {/* 🌟 分頁控制欄 */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            顯示第 {((safePage - 1) * ITEMS_PER_PAGE) + 1} 至 {Math.min(safePage * ITEMS_PER_PAGE, totalRecords)} 筆 (共 {totalRecords} 筆)
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              href={`${baseUrl}&page=${safePage - 1}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                safePage <= 1 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 pointer-events-none' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              上一頁
            </Link>
            
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 px-2">
              {safePage} / {totalPages}
            </span>
            
            <Link 
              href={`${baseUrl}&page=${safePage + 1}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                safePage >= totalPages 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 pointer-events-none' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              下一頁
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}