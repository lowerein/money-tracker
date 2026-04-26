"use client"

import { useState } from "react"
import { createCategory, deleteCategory, updateCategory } from "@/app/actions"

const EMOJI_LIST = [
  "🍔", "🍕", "🍜", "🍣", "🍽️", "☕", "🍺", "🍷", "🍎", "🥦", "🍼", "🍰",
  "🚗", "🚕", "🚌", "🚆", "✈️", "🚲", "🛥️", "⛽", "🅿️", "🎫",
  "🏠", "💡", "💧", "🛜", "🧹", "🪑", "🛠️", "🧻",
  "🛒", "🛍️", "👗", "👟", "💄", "💍", "📱", "💻",
  "🎮", "🎬", "🎵", "🎪", "🏖️", "📸", "🎨", "⚽",
  "🏥", "💊", "⚕️", "💇", "🏋️", "🧘", "🐶", "🐱", 
  "📚", "✏️", "🎓", "💼", "🎁", "🧧", "💰", "💳", "🏦", "🧾", "💸", "📌"
]

export default function CategoryManager({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [newName, setNewName] = useState("")
  const [newEmoji, setNewEmoji] = useState("📌")
  const [newColor, setNewColor] = useState("#3b82f6")
  const [showNewEmojiPicker, setShowNewEmojiPicker] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmoji, setEditEmoji] = useState("")
  const [editColor, setEditColor] = useState("")
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createCategory(newName, newColor, newEmoji)
    if (res.success) {
      setNewName("")
      setShowNewEmojiPicker(false)
    }
    setLoading(false)
  }

  const handleUpdate = async (id: string) => {
    await updateCategory(id, editName, editColor, editEmoji)
    setEditingId(null)
    setShowEditEmojiPicker(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("確定刪除此分類？相關開支亦會被剷除！")) {
      await deleteCategory(id)
    }
  }

  return (
    <>
      {/* 🌟 修正 1：移除所有外圍 margin，確保同登出掣完美對齊水平線 */}
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:bg-gray-50 transition flex items-center gap-2 h-[40px]"
      >
        ⚙️ 管理分類
      </button>

      {/* 🌟 修正 2：彈出式視窗 (Modal Overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* 關閉按鈕 */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
            >
              ✖
            </button>

            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">⚙️ 管理分類</h2>

              {/* --- 第一部份：新增分類 --- */}
              <div className="mb-8 pb-8 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-widest">新增分類</h3>
                <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                  <div className="relative">
                    <button type="button" onClick={() => setShowNewEmojiPicker(!showNewEmojiPicker)} className="h-10 w-12 bg-gray-50 border rounded flex items-center justify-center text-xl hover:bg-gray-100">
                      {newEmoji}
                    </button>
                    {showNewEmojiPicker && (
                      <div className="absolute top-12 left-0 z-50 bg-white border shadow-2xl p-2 rounded-lg grid grid-cols-6 gap-1 w-64 max-h-48 overflow-y-auto">
                        {EMOJI_LIST.map(e => <button key={e} type="button" onClick={() => {setNewEmoji(e); setShowNewEmojiPicker(false)}} className="p-1 hover:bg-gray-100 rounded text-xl">{e}</button>)}
                      </div>
                    )}
                  </div>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="分類名" className="border rounded h-10 px-3 flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-500 outline-none" required />
                  <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="h-10 w-10 p-1 bg-transparent cursor-pointer" />
                  <button disabled={loading} className="bg-blue-600 text-white px-6 h-10 rounded-lg hover:bg-blue-700 transition">添加</button>
                </form>
              </div>

              {/* --- 第二部份：管理現有列表 --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-widest">現有分類 ({categories.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-3 border rounded-lg flex items-center justify-between hover:shadow-md transition bg-gray-50">
                      {editingId === cat.id ? (
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex items-center gap-2 relative">
                            <button type="button" onClick={() => setShowEditEmojiPicker(!showEditEmojiPicker)} className="text-xl bg-white border p-1 rounded w-8 h-8 flex items-center justify-center">{editEmoji}</button>
                            <input value={editName} onChange={e => setEditName(e.target.value)} className="border rounded px-2 h-8 flex-1 text-sm outline-none focus:border-blue-500" />
                            <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer" />
                            
                            {showEditEmojiPicker && (
                              <div className="absolute top-10 left-0 z-50 bg-white border shadow-xl p-2 rounded-lg grid grid-cols-6 gap-1 w-56 max-h-40 overflow-y-auto">
                                {EMOJI_LIST.map(e => <button key={e} type="button" onClick={() => {setEditEmoji(e); setShowEditEmojiPicker(false)}} className="p-1 hover:bg-gray-100 rounded text-lg">{e}</button>)}
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end gap-3 mt-1">
                            <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:text-gray-700">取消</button>
                            <button onClick={() => handleUpdate(cat.id)} className="text-xs text-blue-600 font-bold hover:text-blue-800">儲存</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl drop-shadow-sm">{cat.emoji}</span>
                            <span className="text-sm font-bold" style={{ color: cat.color }}>{cat.name}</span>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => {setEditingId(cat.id); setEditName(cat.name); setEditEmoji(cat.emoji); setEditColor(cat.color);}} className="text-gray-400 hover:text-blue-600 transition">✏️</button>
                            <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-600 transition">🗑️</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </>
  )
}