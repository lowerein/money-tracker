"use client"

import { useState } from "react"

export default function HabitPopover({ 
  userName, 
  isMe, 
  habits,
  dateStr
}: { 
  userName: string | null, 
  isMe: boolean, 
  habits: { emoji: string, name: string }[],
  dateStr: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  // 攔截點擊事件，避免觸發底層嘅 <Link> 跳頁
  const toggleModal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  // 阻止 Modal 入面嘅點擊事件穿透去底層
  const stopProp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <>
      {/* 🌟 觸發區：月曆上嘅 Emoji 條 */}
      <div 
        onClick={toggleModal}
        className="flex items-center text-[10px] leading-none tracking-tighter opacity-90 bg-white/60 dark:bg-black/20 hover:bg-white/90 dark:hover:bg-black/40 rounded pl-0.5 pr-1 py-0.5 transition-colors cursor-pointer shadow-sm hover:shadow"
      >
        {!isMe && (
          <span className="bg-purple-100 dark:bg-purple-900/80 text-purple-600 dark:text-purple-300 rounded-full w-3 h-3 flex items-center justify-center mr-1 font-bold text-[8px] shrink-0">
            {(userName || "F").charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex gap-[1px]">
          {habits.slice(0, 3).map((h, i) => <span key={i}>{h.emoji}</span>)}
        </div>
        {habits.length > 3 && <span className="text-gray-400 font-bold ml-0.5 text-[8px]">+</span>}
      </div>

      {/* 🌟 彈出視窗 Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={toggleModal}
        >
          <div 
            className="bg-white dark:bg-gray-900 p-5 md:p-6 rounded-3xl shadow-2xl w-full max-w-xs transform transition-all border border-gray-100 dark:border-gray-800" 
            onClick={stopProp}
          >
            <h3 className="font-black text-lg text-gray-800 dark:text-white mb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <span>{isMe ? "😎 我嘅進度" : `👤 ${userName}`}</span>
              <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md">
                {dateStr}
              </span>
            </h3>
            
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {habits.map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <span className="text-2xl bg-white dark:bg-gray-800 w-10 h-10 flex items-center justify-center rounded-full shadow-sm">{h.emoji}</span>
                  <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{h.name}</span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={toggleModal} 
              className="mt-6 w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-black rounded-xl transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </>
  )
}