'use client'
import { useState, useEffect } from 'react'
import { saveDailyNote } from '../actions'

export default function DailyNotepad({ 
  initialContent, 
  targetDate,
  dateStr,
  monthNotes = [] // 🌟 接收全月筆記資料
}: { 
  initialContent: string, 
  targetDate: Date,
  dateStr: string,
  monthNotes?: any[] 
}) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [showModal, setShowModal] = useState(false) // 🌟 控制彈出視窗

  // 當切換日期時，重設內容
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

  // 過濾走空嘅筆記
  const validNotes = monthNotes.filter(n => n.content && n.content.trim() !== "");

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
          📝 {parseInt(m)}月{parseInt(d)}日 隨手記
          {isSaving && <span className="text-[10px] text-blue-500 animate-pulse normal-case">儲存中...</span>}
        </h3>
        
        {/* 🌟 睇全月筆記嘅按鈕 */}
        <button 
          onClick={() => setShowModal(true)}
          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors font-bold"
        >
          📜 今月回顧
        </button>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今日發生咗咩事？"
        className="w-full h-32 bg-transparent text-gray-700 dark:text-gray-200 resize-none focus:outline-none text-sm leading-relaxed"
      />

      {/* 🌟 彈出視窗 Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="font-bold text-gray-800 dark:text-gray-100">
                📜 {parseInt(m)}月份 隨手記回顧
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-500 text-xl leading-none p-1"
              >
                ×
              </button>
            </div>
            
            {/* Content List */}
            <div className="p-4 overflow-y-auto space-y-4">
              {validNotes.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  呢個月仲未有任何筆記喎！快啲寫低啲生活點滴啦～
                </div>
              ) : (
                validNotes.map((note) => {
                  const noteDate = new Date(note.date);
                  return (
                    <div key={note.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="text-xs font-bold text-blue-500 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1 inline-block">
                        {noteDate.getDate()}日
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}