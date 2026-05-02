'use client'
import { useState, useEffect } from 'react'
import { saveDailyNote } from '../actions'

export default function DailyNotepad({ 
  initialContent, 
  targetDate,
  dateStr 
}: { 
  initialContent: string, 
  targetDate: Date,
  dateStr: string 
}) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)

  // 🌟 當切換日期時，要重設內容
  useEffect(() => {
    setContent(initialContent)
  }, [initialContent, dateStr])

  // 自動儲存
  useEffect(() => {
    if (content === initialContent) return

    const timer = setTimeout(async () => {
      setIsSaving(true)
      await saveDailyNote(targetDate, content)
      setIsSaving(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [content, initialContent, targetDate])

  const [y, m, d] = dateStr.split("-");

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          📝 {parseInt(m)}月{parseInt(d)}日 隨手記
        </h3>
        {isSaving && <span className="text-[10px] text-blue-500 animate-pulse font-bold">儲存中...</span>}
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今日發生咗咩事？"
        className="w-full h-32 bg-transparent text-gray-700 dark:text-gray-200 resize-none focus:outline-none text-sm leading-relaxed"
      />
    </div>
  )
}