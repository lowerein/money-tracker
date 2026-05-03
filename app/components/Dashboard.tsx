import { prisma } from "./../../lib/prisma";

export default async function Dashboard({
  userId,
  year,
  month,
}: {
  userId: string;
  year: number;
  month: number;
}) {
  const safeYear = isNaN(year) ? new Date().getFullYear() : year;
  const safeMonth = isNaN(month) ? new Date().getMonth() : month;

  const firstDay = new Date(safeYear, safeMonth, 1);
  const firstDayOfNextMonth = new Date(safeYear, safeMonth + 1, 1);

  const currentMonthExpenses = await prisma.expense.findMany({
    where: { userId, date: { gte: firstDay, lt: firstDayOfNextMonth } },
    include: { category: true },
  });

  const totalAmount = currentMonthExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0,
  );
  const categoryTotals = currentMonthExpenses.reduce(
    (acc, exp) => {
      const catId = exp.categoryId;
      if (!acc[catId])
        acc[catId] = {
          name: exp.category.name,
          color: exp.category.color || "#ccc",
          emoji: exp.category.emoji || "📌",
          amount: 0,
        };
      acc[catId].amount += exp.amount;
      return acc;
    },
    {} as Record<
      string,
      { name: string; color: string; emoji: string; amount: number }
    >,
  );

  const sortedCategories = Object.values(categoryTotals).sort(
    (a, b) => b.amount - a.amount,
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
      <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
        {safeYear}年{safeMonth + 1}月 總開支
      </h2>
      <p className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        ${totalAmount.toFixed(1)}
      </p>

      {sortedCategories.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            開支分佈
          </h3>
          <div className="space-y-4">
            {sortedCategories.map((cat) => (
              <div key={cat.name} className="flex items-center">
                {/* 🌟 進度條 (flex-1 撐滿剩餘空間，shrink 畀佢縮) */}
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mr-4 flex-1 overflow-hidden shrink">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${Math.min((cat.amount / totalAmount) * 100, 100)}%`,
                      backgroundColor: cat.color,
                    }}
                  ></div>
                </div>
                
                {/* 🌟 重新排版嘅文字與金額區 */}
                <div className="w-48 shrink-0 text-sm text-gray-600 dark:text-gray-300 flex items-center">
                  <span className="text-lg shrink-0 mr-1.5">{cat.emoji}</span>
                  
                  {/* flex-1 霸佔中間空位，truncate 處理過長文字，title 顯示全名 */}
                  <span className="font-medium truncate flex-1" title={cat.name}>
                    {cat.name}
                  </span>
                  
                  {/* shrink-0 確保金額無論如何都唔會被壓扁 */}
                  <span className="font-bold text-gray-900 dark:text-gray-100 shrink-0 ml-2 text-right">
                    ${cat.amount.toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            呢個月仲未有開支，繼續保持！💰
          </p>
        </div>
      )}
    </div>
  );
}