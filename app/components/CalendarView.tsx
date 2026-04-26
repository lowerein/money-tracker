import { prisma } from "./../../lib/prisma"

interface CalendarViewProps {
  userId: string
  year: number
  month: number
}

export default async function CalendarView({ userId, year, month }: CalendarViewProps) {
  // 🌟 關鍵修正：確保這裡是用傳入的 year 和 month，而不是 new Date()
  // JavaScript Date 的 month 是 0-11
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0) // 下個月的第 0 天即是本月最後一天
  
  // 獲取該月份的所有開支
  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: { 
        gte: firstDay, 
        lte: lastDay 
      }
    }
  })

  // 按日子加總
  const dailyTotals = expenses.reduce((acc, exp) => {
    // 考慮時區問題，建議用 YYYY-MM-DD 格式
    const d = new Date(exp.date)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    acc[dateStr] = (acc[dateStr] || 0) + exp.amount
    return acc
  }, {} as Record<string, number>)

  const startDayOfWeek = firstDay.getDay() 
  const daysInMonth = lastDay.getDate()
  
  const calendarGrid = []
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarGrid.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarGrid.push(d)
  }

  const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {daysOfWeek.map(day => (
          <div key={day} className="py-2 text-center text-[10px] font-bold text-gray-400 uppercase">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarGrid.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} className="h-16 border-b border-r border-gray-50 bg-gray-50/20" />
          
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const total = dailyTotals[dateStr]
          
          // 判斷是否為「今天」
          const today = new Date()
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

          return (
            <div key={day} className={`h-16 p-1 border-b border-r border-gray-50 relative flex flex-col items-center justify-start ${isToday ? 'bg-blue-50/30' : ''}`}>
              <span className={`text-[10px] font-bold mb-1 ${isToday ? 'bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full' : 'text-gray-300'}`}>
                {day}
              </span>
              
              {total ? (
                <div className="flex flex-col items-center w-full px-1">
                  <span className="text-[9px] font-black text-red-500 leading-none truncate">
                    ${total.toFixed(0)}
                  </span>
                  {/* 小進度條視覺化 */}
                  <div className="w-full h-1 mt-1 bg-red-100 rounded-full overflow-hidden max-w-[30px]">
                    <div 
                      className="h-full bg-red-400" 
                      style={{ width: `${Math.min((total / 500) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}