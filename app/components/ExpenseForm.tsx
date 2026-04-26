"use client"

import { useState, useEffect } from "react"
import { createExpense } from "@/app/actions"

export default function ExpenseForm({ categories }: { categories: any[] }) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("") // 初始先留空
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // 🌟 加入呢個 useEffect：當 categories 有變，自動揀第一個
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // 🌟 加多層防呆：確保真係有 categoryId 先准 submit
    if (!categoryId) {
      setMessage("❌ 請先選擇一個分類！")
      setLoading(false)
      return
    }

    const result = await createExpense({
      amount: parseFloat(amount),
      description,
      date: new Date(),
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

  if (categories.length === 0) {
    return <div className="p-4 bg-yellow-100 text-yellow-800 rounded mb-4">請先喺下面新增最少一個分類！</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold">📝 記低今日開支</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">金額 ($)</label>
        <input 
          type="number" 
          step="0.1" 
          required 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">分類</label>
        <select 
          value={categoryId} 
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">備註 (可選)</label>
        <input 
          type="text" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button 
        type="submit" 
        disabled={loading || !categoryId}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300 transition"
      >
        {loading ? "儲存中..." : "確認記帳"}
      </button>

      {message && <p className="text-sm font-medium mt-2">{message}</p>}
    </form>
  )
}