"use client"

import { useState, useRef, useEffect } from "react"
import { createCategory } from "@/app/actions"

// 預設一堆最常用嘅記帳 Emoji 畀 User 揀
const EMOJI_LIST = [
  "🍔", "☕", "🍺", "🛒", "🚗", "🚌", "✈️", "🏠",
  "💡", "📱", "🎮", "🎬", "🏥", "💊", "👗", "👟",
  "🐶", "🐱", "📚", "🎁", "⚽", "💰", "💳", "📌"
]

export default function CategoryForm() {
  const [name, setName] = useState("")
  const [color, setColor] = useState("#3b82f6") 
  const [emoji, setEmoji] = useState("🍔") // 預設用漢堡包
  
  // 新增：用嚟控制 Emoji 面板開關嘅 State
  const [showPicker, setShowPicker] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // 用嚟偵測「點擊面板以外地方自動關閉」嘅 Ref
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 點擊外面自動閂埋個 Emoji Picker
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const result = await createCategory(name, color, emoji)

    if (result.success) {
      setMessage("✅ 分類新增成功！")
      setName("") 
      // 成功後唔需要重置 Emoji 同 Color，方便 User 連續加同色系分類
    } else {
      setMessage("❌ " + result.error)
    }
    
    setLoading(false)
    setTimeout(() => setMessage(""), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-md mt-6 relative">
      <h2 className="text-lg font-bold mb-4">🏷️ 自訂新分類</h2>
      
      <div className="flex flex-wrap gap-4 items-end">
        
        {/* 🌟 升級版 Emoji 選擇掣 */}
        <div className="relative" ref={pickerRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">圖示</label>
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="h-10 w-16 bg-gray-50 border border-gray-300 rounded flex items-center justify-center text-2xl hover:bg-gray-100 transition focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {emoji}
          </button>

          {/* Emoji 下拉面板 */}
          {showPicker && (
            <div className="absolute top-16 left-0 z-10 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-xl grid grid-cols-6 gap-2">
              {EMOJI_LIST.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    setEmoji(e)
                    setShowPicker(false) // 揀完自動閂埋
                  }}
                  className="text-2xl hover:bg-blue-50 p-1 rounded transition"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">分類名稱</label>
          <input 
            type="text" 
            required 
            placeholder="例如: 網購"
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 h-10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">顏色</label>
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            className="block h-10 w-14 p-1 border border-gray-300 rounded cursor-pointer"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !name}
          className="bg-green-600 text-white px-4 py-2 h-10 rounded hover:bg-green-700 disabled:bg-green-300 whitespace-nowrap"
        >
          {loading ? "..." : "新增"}
        </button>
      </div>

      {message && <p className="text-sm font-medium mt-3 text-gray-700">{message}</p>}
    </form>
  )
}