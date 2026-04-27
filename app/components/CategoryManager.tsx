"use client"

import { useState } from "react"
import { createCategory, updateCategory, deleteCategory } from "../actions"

export default function CategoryManager({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  
  // 表單 State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("📌")
  const [color, setColor] = useState("#3b82f6")
  const [loading, setLoading] = useState(false)

  // 🌟 終極補回：超長版常用 Emoji 快速選擇列表
  const quickEmojis = [
    "🍽️", "🍔", "☕", "🍺", // 飲食
    "🛒", "🛍️", "👕", "👗", // 購物
    "🏠", "💡", "💧", "🧹", // 居住/雜費
    "🚗", "🚌", "🚆", "✈️", // 交通/旅行
    "🎬", "🎮", "🎵", "🎫", // 娛樂
    "🏥", "💊", "💇‍♀️", "🧴", // 醫療/美容
    "🐶", "🐱", "👶", "🎓", // 寵物/孩童/教育
    "📱", "💻", "🌐", "⛽", // 科技/通訊/入油
    "🎁", "💰", "💳", "📌"  // 其他
  ]

  const resetForm = () => {
    setEditingId(null)
    setName("")
    setEmoji("📌")
    setColor("#3b82f6")
  }

  const handleOpen = () => {
    resetForm()
    setIsOpen(true)
  }

  const handleEdit = (cat: any) => {
    setEditingId(cat.id)
    setName(cat.name)
    setEmoji(cat.emoji || "📌")
    setColor(cat.color || "#3b82f6")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    if (editingId) {
      await updateCategory(editingId, name, color, emoji)
    } else {
      await createCategory(name, color, emoji)
    }

    resetForm()
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("⚠️ 確定刪除？此操作會連帶刪除該分類下所有開支！")) {
      setLoading(true)
      await deleteCategory(id)
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={handleOpen}
        className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <span>⚙️</span> 管理分類
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors">
            
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">⚙️ 管理分類</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold leading-none">&times;</button>
            </div>

            <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto">
              {/* 表單區塊 */}
              <form onSubmit={handleSave} className="mb-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                  {editingId ? "修改分類" : "新增分類"}
                </h3>
                
                <div className="flex gap-2 mb-4">
                  <div className="w-16">
                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Emoji</label>
                     <input type="text" value={emoji} onChange={e => setEmoji(e.target.value)} required className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center dark:text-white" />
                  </div>
                  <div className="flex-1">
                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">名稱</label>
                     <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="例如: 飲食" className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-300 dark:placeholder-gray-600" />
                  </div>
                  <div className="w-16">
                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">顏色</label>
                     <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-[42px] p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer" />
                  </div>
                </div>

                {/* 🌟 快速 Emoji 選擇區 (加長版) */}
                <div className="mb-5">
                  <div className="flex flex-wrap gap-1 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 justify-center">
                    {quickEmojis.map(e => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setEmoji(e)}
                        className={`w-8 h-8 flex items-center justify-center text-lg rounded transition-colors ${
                          emoji === e 
                            ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-500 shadow-sm' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="flex-1 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50">
                    {loading ? "儲存中..." : (editingId ? "💾 更新" : "➕ 新增")}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetForm} className="px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 rounded-lg transition-colors">
                      取消
                    </button>
                  )}
                </div>
              </form>

              {/* 現有分類列表 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">現有分類</h3>
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">暫無分類</p>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow dark:hover:bg-gray-750 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></div>
                        <span className="font-bold text-gray-700 dark:text-gray-200">{cat.emoji} {cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(cat)} className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-1" title="修改">✏️</button>
                        <button onClick={() => handleDelete(cat.id)} disabled={loading} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1" title="刪除">🗑️</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}