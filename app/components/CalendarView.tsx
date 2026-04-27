import { prisma } from "./../../lib/prisma"
import Link from "next/link"

interface CalendarViewProps { userId: string; year: number; month: number; selectedDay: number }

export default async function CalendarView({ userId, year, month, selectedDay }: CalendarViewProps) {
  // ... (資料庫邏輯同前面一樣，直接去 return) ...
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const expenses = await prisma.expense.findMany({ where: { userId, date: { gte: firstDay, lte: lastDay } } })

  const dailyTotals = expenses.reduce((acc, exp) => {
    const d = new Date(exp.date)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    acc[dateStr] = (acc[dateStr] || 0) + exp.amount
    return acc
  }, {} as Record<string, number>)

  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const calendarGrid = []
  for (let i = 0; i < startDayOfWeek; i++) calendarGrid.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarGrid.push(d)

  const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        {daysOfWeek.map((day, index) => (
          <div key={day} className={`py-2 text-center text-[10px] font-black uppercase tracking-widest ${index === 0 || index === 6 ? 'text-red-400 dark:text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarGrid.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} className="h-16 border-b border-r border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20" />
          
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const total = dailyTotals[dateStr]
          const isSelected = selectedDay === day
          const today = new Date()
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

          return (
            <Link 
              key={day} href={`/?year=${year}&month=${month}&day=${day}`}
              className={`h-16 p-1.5 border-b border-r border-gray-50 dark:border-gray-800 relative flex flex-col items-center justify-start transition-all cursor-pointer block
                ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-inset ring-blue-500 z-10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                ${isToday && !isSelected ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}
              `}
            >
              <span className={`text-[11px] font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                ${isToday ? 'bg-blue-600 text-white' : 'text-gray-400 dark:text-gray-500'}
                ${isSelected && !isToday ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800' : ''}
              `}>
                {day}
              </span>
              
              {total ? (
                <div className="flex flex-col items-center w-full mt-auto">
                  <span className={`text-[10px] font-black leading-none truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-red-500 dark:text-red-400'}`}>
                    ${total.toFixed(0)}
                  </span>
                  <div className="w-full h-1 mt-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden max-w-[30px]">
                    <div className={`h-full ${isSelected ? 'bg-blue-400' : 'bg-red-400 dark:bg-red-500'}`} style={{ width: `${Math.min((total / 500) * 100, 100)}%` }} />
                  </div>
                </div>
              ) : null}
            </Link>
          )
        })}
      </div>
    </div>
  )
}