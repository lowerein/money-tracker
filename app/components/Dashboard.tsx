import { prisma } from "./../../lib/prisma"

export default async function Dashboard({ 
  userId, 
  year, 
  month 
}: { 
  userId: string, 
  year: number, 
  month: number 
}) {
  // 1. 根據傳入嚟嘅 year 同 month 計算日期範圍
  const firstDay = new Date(year, month, 1)
  const firstDayOfNextMonth = new Date(year, month + 1, 1)

  // 2. 攞返嗰個月嘅所有開支
  const currentMonthExpenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: firstDay,
        lt: firstDayOfNextMonth,
      },
    },
    include: { category: true },
  })

  // 3. 計算總開支
  const totalAmount = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  // 4. 按分類計總數
  const categoryTotals = currentMonthExpenses.reduce((acc, exp) => {
    const catId = exp.categoryId
    if (!acc[catId]) {
      acc[catId] = { 
        name: exp.category.name, 
        color: exp.category.color || "#ccc", 
        emoji: exp.category.emoji || "📌", 
        amount: 0 
      }
    }
    acc[catId].amount += exp.amount
    return acc
  }, {} as Record<string, { name: string; color: string; emoji: string; amount: number }>)

  // 5. 將分類按金額由大至小排序
  const sortedCategories = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-medium text-gray-500 mb-2">
        {year}年{month + 1}月 總開支
      </h2>
      <p className="text-4xl font-bold text-gray-900 mb-8">
        ${totalAmount.toFixed(1)}
      </p>

      {sortedCategories.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">開支分佈</h3>
          <div className="space-y-4">
            {sortedCategories.map((cat) => (
              <div key={cat.name} className="flex items-center">
                {/* 進度條 */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 mr-4 flex-1 overflow-hidden">
                  <div 
                    className="h-2.5 rounded-full" 
                    style={{ 
                      width: `${Math.min((cat.amount / totalAmount) * 100, 100)}%`,
                      backgroundColor: cat.color 
                    }}
                  ></div>
                </div>
                {/* 數字同 Emoji */}
                <div className="w-40 text-sm text-gray-600 flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="font-medium">{cat.name}</span>
                  </span>
                  <span className="font-bold text-gray-900">${cat.amount.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-500">呢個月仲未有開支，繼續保持！💰</p>
        </div>
      )}
    </div>
  )
}