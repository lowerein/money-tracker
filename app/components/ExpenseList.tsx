import { prisma } from "@/lib/prisma"
import { deleteExpense } from "@/app/actions"

export default async function ExpenseList({ userId, year, month }: { userId: string, year: number, month: number }) {
const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: { gte: firstDay, lte: lastDay } // 🌟 只攞呢個月嘅數
    },
    include: { category: true },
    orderBy: { date: "desc" },
  })

  if (expenses.length === 0) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow text-center text-gray-500">
        暫時未有任何開支記錄。快啲喺左邊記低第一筆啦！
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">📋 最近開支 (最新 10 筆)</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分類</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">備註</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((exp) => {
              const deleteAction = deleteExpense.bind(null, exp.id)
              
              return (
                <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exp.date.toLocaleDateString("zh-HK")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {/* 🌟 呢度加咗 Emoji 顯示，仲加咗 items-center 同 gap-1 令佢對齊 */}
                    <span 
                      className="px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full"
                      style={{ backgroundColor: `${exp.category.color}20`, color: exp.category.color || "#374151" }}
                    >
                      <span className="text-base">{exp.category.emoji || "📌"}</span> 
                      {exp.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                    ${exp.amount.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exp.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <form action={deleteAction}>
                      <button type="submit" className="text-red-500 hover:text-red-700 transition" title="刪除此記錄">
                        ❌
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}