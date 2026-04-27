"use client"

import { useState, useEffect } from "react"
import { logHabitProgress } from "../actions"

export default function HabitTracker({ 
  habits, 
  initialLogs, 
  targetDate 
}: { 
  habits: any[], 
  initialLogs: any[], 
  targetDate: Date 
}) {
  // 將 initialLogs 轉做 { habitId: value } 嘅格式方便讀取
  const [logs, setLogs] = useState<Record<string, number>>({})

  useEffect(() => {
    const logMap: Record<string, number> = {}
    initialLogs.forEach(log => {
      logMap[log.habitId] = log.value
    })
    setLogs(logMap)
  }, [initialLogs])

  const handleToggle = async (habitId: string, currentValue: number) => {
    const newValue = currentValue > 0 ? 0 : 1 // 有做 -> 冇做，冇做 -> 有做
    setLogs(prev => ({ ...prev, [habitId]: newValue })) // 畫面即刻轉
    await logHabitProgress(habitId, targetDate, newValue) // 背後 Save
  }

  const handleNumeric = async (habitId: string, currentValue: number, delta: number) => {
    const newValue = Math.max(0, currentValue + delta) // 最少為 0
    setLogs(prev => ({ ...prev, [habitId]: newValue }))
    await logHabitProgress(habitId, targetDate, newValue)
  }

  if (habits.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {targetDate.toLocaleDateString("zh-HK", { month: "short", day: "numeric" })} 習慣打卡
        </h3>
      </div>

      <div className="space-y-3">
        {habits.map(habit => {
          const currentValue = logs[habit.id] || 0
          const isCompleted = habit.type === "BOOLEAN" ? currentValue > 0 : currentValue >= (habit.target || 1)

          return (
            <div 
              key={habit.id} 
              className={`p-3 rounded-xl border transition-all ${
                isCompleted 
                  ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50" 
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between">
                
                {/* 左邊：Emoji 同名稱 */}
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm transition-all ${
                      isCompleted ? "" : "grayscale opacity-50"
                    }`}
                    style={{ backgroundColor: isCompleted ? habit.color : '#e5e7eb' }}
                  >
                    {habit.emoji}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-bold ${isCompleted ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                      {habit.name}
                    </span>
                    {/* 數值型進度提示 */}
                    {habit.type === "NUMERIC" && (
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                        {currentValue} / {habit.target} {habit.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* 右邊：操作掣 */}
                <div>
                  {habit.type === "BOOLEAN" ? (
                    // 達成型：開關掣
                    <button 
                      onClick={() => handleToggle(habit.id, currentValue)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isCompleted 
                          ? "bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-none" 
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {isCompleted ? "✓" : ""}
                    </button>
                  ) : (
                    // 計數型：加減掣
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                      <button 
                        onClick={() => handleNumeric(habit.id, currentValue, -1)}
                        disabled={currentValue <= 0}
                        className="w-6 h-6 flex items-center justify-center rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="w-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200">
                        {currentValue}
                      </span>
                      <button 
                        onClick={() => handleNumeric(habit.id, currentValue, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* 數值型嘅微型進度條 */}
              {habit.type === "NUMERIC" && (
                <div className="w-full h-1.5 mt-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${Math.min((currentValue / (habit.target || 1)) * 100, 100)}%`,
                      backgroundColor: isCompleted ? '#10b981' : habit.color 
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}