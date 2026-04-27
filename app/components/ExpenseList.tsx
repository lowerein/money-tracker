import { prisma } from "./../../lib/prisma"
import ExpenseRow from "./ExpenseRow"
import Link from "next/link"
import ExpenseCategoryFilter from "./ExpenseCategoryFilter" // 🌟 引入新組件

interface ExpenseListProps {
  userId: string        
  year: number
  month: number
  day: number
  page: number
  viewUserIds: string[]
  selectedCats: string[] // 🌟 新增：目前選取中嘅分類名稱
}

export default async function ExpenseList({ 
  userId, 
  year, 
  month, 
  day, 
  page, 
  viewUserIds,
  selectedCats
}: ExpenseListProps) {
  const ITEMS_PER_PAGE = 10

  let startDate, endDate
  if (day > 0) {
    startDate = new Date(year, month, day)
    endDate = new Date(year, month, day + 1)
  } else {
    startDate = new Date(year, month, 1)
    endDate = new Date(year, month + 1, 1)
  }

  // 🌟 加入分類過濾條件
  const whereCondition: any = {
    userId: { in: viewUserIds },
    date: { gte: startDate, lt: endDate }
  }
  if (selectedCats.length > 0) {
    whereCondition.category = {
      name: { in: selectedCats }
    }
  }

  // 計算總數 (如果你揀咗分類，呢度就會變成該分類嘅總數！)
  const totalAmountResult = await prisma.expense.aggregate({
    where: whereCondition,
    _sum: { amount: true }
  })
  const grandTotal = totalAmountResult._sum.amount || 0

  const totalRecords = await prisma.expense.count({ where: whereCondition })
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE) || 1
  const safePage = Math.min(Math.max(1, page), totalPages)

  const expenses = await prisma.expense.findMany({
    where: whereCondition,
    include: { category: true, user: true },
    orderBy: { date: "desc" },
    skip: (safePage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  })

  // 獲取目前所有相關 Users 嘅分類，用嚟顯示喺 Filter 度
  const viewCategories = await prisma.category.findMany({
    where: { userId: { in: viewUserIds } },
    orderBy: { createdAt: "asc" }
  })
  // 🌟 去除重複名稱嘅分類 (因為你同朋友可能有同名分類)
  const uniqueCategories = Array.from(new Map(viewCategories.map(c => [c.name, c])).values())
  
  // 編輯專用：只篩選返屬於自己嘅分類畀 ExpenseRow
  const myCategories = viewCategories.filter(c => c.userId === userId)

  const viewQuery = viewUserIds.length > 0 ? `&view=${viewUserIds.join(",")}` : ""
  const catQuery = selectedCats.length > 0 ? `&cat=${encodeURIComponent(selectedCats.join(","))}` : ""
  const baseUrl = `/?year=${year}&month=${month}&day=${day}${viewQuery}${catQuery}`

  return (
    <div className="bg-white dark:bg-gray-900 flex flex-col h-full shadow-inner">
      
      {/* 頂部總數顯示區 */}
      <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
            {day > 0 ? `${month + 1}月${day}日` : `${month + 1}月`} {selectedCats.length > 0 ? '篩選開支' : '總開支'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            {viewUserIds.length > 1 && (
              <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-1">多人模式</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block">記錄總數</span>
          <span className="text-sm font-black text-gray-700 dark:text-gray-300">{totalRecords} 筆</span>
        </div>
      </div>

      {/* 🌟 插入過濾器 UI */}
      <ExpenseCategoryFilter categories={uniqueCategories} selectedCats={selectedCats} />

      {totalRecords === 0 ? (
        <div className="p-10 text-center text-gray-400 dark:text-gray-500 font-medium bg-white dark:bg-gray-900">
           {selectedCats.length > 0 ? "呢個分類暫時未有開支。👻" : "呢段時間暫時未有任何開支記錄。💰"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-white dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider w-24">日期</th>
                <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider w-16">用戶</th>
                <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider w-32">分類</th>
                <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">金額</th>
                <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">備註</th>
                <th className="px-4 py-3 text-right text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider w-20 sticky right-0 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
              {expenses.map((exp) => (
                <ExpenseRow 
                  key={exp.id} 
                  exp={exp} 
                  categories={myCategories} 
                  currentUserId={userId} 
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 分頁控制 */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/50">
          <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
             第 {safePage} 頁 (共 {totalPages} 頁)
          </div>
          <div className="flex items-center gap-2">
            <Link href={`${baseUrl}&page=${safePage - 1}`} scroll={false} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${safePage <= 1 ? 'bg-gray-100 text-gray-300 pointer-events-none' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50'}`}>上一頁</Link>
            <Link href={`${baseUrl}&page=${safePage + 1}`} scroll={false} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${safePage >= totalPages ? 'bg-gray-100 text-gray-300 pointer-events-none' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50'}`}>下一頁</Link>
          </div>
        </div>
      )}
    </div>
  )
}