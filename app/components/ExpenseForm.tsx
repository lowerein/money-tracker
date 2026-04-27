"use client"

import { useState, useEffect } from "react"
import { createExpense } from "../actions"

export default function ExpenseForm({ categories }: { categories: any[] }) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  
  const today = new Date()
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [date, setDate] = useState(localToday)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])

  // 🌟 核心計數功能：安全地將字串數學式計出結果
  const calculateAmount = (val: string) => {
    try {
      const sanitized = val.replace(/[^\d.+\-*/()]/g, "")
      if (!sanitized) return ""
      
      const result = new Function("return " + sanitized)()
      
      if (!isNaN(result) && isFinite(result)) {
        return Number(result).toFixed(1).replace(/\.0$/, "")
      }
      return val
    } catch (error) {
      return val
    }
  }

  // 當輸入框失去焦點時，自動計數
  const handleBlur = () => {
    setAmount(calculateAmount(amount))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (!categoryId) {
      setMessage("❌ 請先選擇一個分類！")
      setLoading(false)
      return
    }

    const finalAmountStr = calculateAmount(amount)
    const finalAmount = parseFloat(finalAmountStr)

    if (isNaN(finalAmount) || finalAmount <= 0) {
      setMessage("❌ 開支金額必須大於 0！")
      setLoading(false)
      return
    }

    const result = await createExpense({
      amount: finalAmount,
      description,
      date: new Date(date),
      categoryId,
    })

    if (result.success) {
      setMessage("✅ 記帳成功！")
      setAmount("")
      setDescription("")
      setTimeout(() => setMessage(""), 2000)
    } else {
      setMessage("❌ " + result.error)
    }
    
    setLoading(false)
  }

  // 🌟 如果無任何分類，顯示警告訊息
  if (categories.length === 0) {
    return (
      <div className="p-5 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50 rounded-xl mb-4 text-sm font-bold text-center">
        請先喺右上角「⚙️ 管理分類」新增最少一個分類！
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* 1. 日期選擇 */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">日期</label>
        <input 
          type="date" 
          required 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          className="block w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all font-medium text-gray-700 dark:text-gray-200"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 2. 金額輸入 (支援計數) */}
        <div>
          <label className="flex justify-between items-end mb-1">
            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">金額 ($)</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">支援加減乘除</span>
          </label>
          <input 
            type="text" 
            required 
            placeholder="例: 50+20"
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            onBlur={handleBlur}
            className="block w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all font-bold text-lg text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
          />
        </div>

        {/* 3. 分類選擇 */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">分類</label>
          <select 
            value={categoryId} 
            onChange={(e) => setCategoryId(e.target.value)}
            className="block w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all font-medium text-gray-700 dark:text-gray-200"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. 備註輸入 */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">備註 (可選)</label>
        <input 
          type="text" 
          placeholder="例如：同朋友食飯"
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all text-sm text-gray-700 dark:text-gray-200"
        />
      </div>

      {/* 5. 提交按鈕 */}
      <button 
        type="submit" 
        disabled={loading || !categoryId}
        className="w-full bg-gray-900 dark:bg-blue-600 text-white p-4 rounded-xl hover:bg-black dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-all font-bold text-lg shadow-md shadow-gray-200 dark:shadow-none"
      >
        {loading ? "儲存中..." : "確認記帳"}
      </button>

      {/* 狀態訊息 */}
      {message && (
        <p className={`text-sm font-bold text-center mt-2 ${message.includes("✅") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {message}
        </p>
      )}
    </form>
  )
}