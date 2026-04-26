"use client"

import { useState } from "react"
import { deleteCategory, updateCategory } from "@/app/actions"

// 🌟 用返同新增分類一樣嘅終極擴充版 Emoji 庫
const EMOJI_LIST = [
  // 飲食
  "🍔", "🍕", "🍜", "🍣", "🍽️", "☕", "🍺", "🍷", "🍎", "🥦", "🍼", "🍰",
  // 交通
  "🚗", "🚕", "🚌", "🚆", "✈️", "🚲", "🛥️", "⛽", "🅿️", "🎫",
  // 居住/雜費
  "🏠", "💡", "💧", "🛜", "🧹", "🪑", "🛠️", "🧻",
  // 購物
  "🛒", "🛍️", "👗", "👟", "💄", "💍", "📱", "💻",
  // 娛樂/休閒
  "🎮", "🎬", "🎵", "🎪", "🏖️", "📸", "🎨", "⚽",
  // 醫療/個人護理
  "🏥", "💊", "⚕️", "💇", "🏋️", "🧘", 
  // 寵物/教育/其他
  "🐶", "🐱", "📚", "✏️", "🎓", "💼", "🎁", "🧧",
  // 金融/雜項
  "💰", "💳", "🏦", "🧾", "💸", "📌"
]

export default function CategoryList({ categories }: { categories: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmoji, setEditEmoji] = useState("")
  const [editColor, setEditColor] = useState("")
  const [showEmojiGrid, setShowEmojiGrid] = useState(false)

  const handleDelete = async (id: string) => {
    if (confirm("確定要刪除此分類嗎？注意：該分類下的所有記錄亦會被刪除！")) {
      await deleteCategory(id)
    }
  }

  const handleUpdate = async (id: string) => {
    await updateCategory(id, editName, editColor, editEmoji)
    setEditingId(null)
    setShowEmojiGrid(false)
  }

  const startEditing = (cat: any) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditEmoji(cat.emoji)
    setEditColor(cat.color)
  }

  return (
    <div className="mt-8 space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">管理現有分類</h3>
      <div className="grid gap-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
            
            {editingId === cat.id ? (
              // --- 編輯模式 ---
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  {/* 改 Emoji */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setShowEmojiGrid(!showEmojiGrid)}
                      className="text-2xl p-1 bg-gray-100 rounded hover:bg-gray-200 w-10 h-10 flex items-center justify-center"
                    >
                      {editEmoji}
                    </button>
                    {/* 🌟 加咗 max-h-48 同 overflow-y-auto，支援長列表捲動 */}
                    {showEmojiGrid && (
                      <div className="absolute top-12 left-0 z-20 bg-white border shadow-xl p-2 rounded-lg grid grid-cols-6 gap-1 w-64 max-h-48 overflow-y-auto">
                        {EMOJI_LIST.map(e => (
                          <button key={e} onClick={() => { setEditEmoji(e); setShowEmojiGrid(false); }} className="hover:bg-gray-100 p-1 rounded text-xl flex items-center justify-center">{e}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* 改名 */}
                  <input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    className="border rounded px-2 py-1 flex-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {/* 改顏色 */}
                  <input 
                    type="color" 
                    value={editColor} 
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setEditingId(null); setShowEmojiGrid(false); }} className="text-xs text-gray-500">取消</button>
                  <button onClick={() => handleUpdate(cat.id)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">儲存更改</button>
                </div>
              </div>
            ) : (
              // --- 顯示模式 ---
              <>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="font-medium" style={{ color: cat.color }}>{cat.name}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => startEditing(cat)} className="text-gray-400 hover:text-blue-600 transition">
                    <span className="text-xs">✏️ 修改</span>
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-600 transition">
                    <span className="text-xs">🗑️ 刪除</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}