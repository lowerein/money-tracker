"use client"

import { useState } from "react"
import { updateExpense, deleteExpense } from "../actions" 

export default function ExpenseRow({ exp, categories }: { exp: any, categories: any[] }) {
  const [isEditing, setIsEditing] = useState(false)
  
  const [amount, setAmount] = useState(exp.amount)
  const [desc, setDesc] = useState(exp.description || "")
  const [catId, setCatId] = useState(exp.categoryId)
  
  const d = new Date(exp.date)
  const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const [date, setDate] = useState(localDateStr)

  const [loading, setLoading] = useState(false)

  // 喺 Dark mode 預設用白色字 (#f3f4f6)，Light mode 用黑色 (#111827)
  const fallbackColor = exp.category.color || "inherit"

  const handleUpdate = async () => {
    setLoading(true)
    await updateExpense(exp.id, {
      amount: parseFloat(amount),
      description: desc,
      date: new Date(date),
      categoryId: catId
    })
    setLoading(false)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm("確定要刪除呢筆開支？")) {
      await deleteExpense(exp.id)
    }
  }

  // --- 📝 編輯模式 ---
  if (isEditing) {
    return (
      // 🌟 編輯列背景：加入 dark:bg-blue-900/20
      <tr className="bg-blue-50/40 dark:bg-blue-900/20 transition-colors">
        <td className="px-4 py-3 whitespace-nowrap">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border border-blue-200 dark:border-blue-800 dark:bg-gray-800 dark:text-gray-200 rounded p-1.5 text-sm w-[115px] outline-none focus:ring-2 focus:ring-blue-500" />
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <select value={catId} onChange={e => setCatId(e.target.value)} className="border border-blue-200 dark:border-blue-800 dark:bg-gray-800 dark:text-gray-200 rounded p-1.5 text-sm max-w-[130px] outline-none focus:ring-2 focus:ring-blue-500">
            {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <input 
            type="number" 
            step="0.1" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            className="border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 rounded p-1.5 text-sm w-20 font-bold outline-none focus:ring-2 focus:ring-blue-500" 
            style={{ color: fallbackColor }}
          />
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="無備註" className="border border-blue-200 dark:border-blue-800 dark:bg-gray-800 dark:text-gray-200 rounded p-1.5 text-sm w-32 outline-none focus:ring-2 focus:ring-blue-500" />
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-right font-medium">
          <button onClick={handleUpdate} disabled={loading} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-bold mr-3 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
            {loading ? "..." : "💾 儲存"}
          </button>
          <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-xs">取消</button>
        </td>
      </tr>
    )
  }

  // --- 👁️ 顯示模式 ---
  return (
    // 🌟 滑鼠 Hover 效果：加入 dark:hover:bg-gray-800/50
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-medium">
        {exp.date.toLocaleDateString("zh-HK", { month: "short", day: "numeric" })}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm">
        <span className="px-2 py-1 inline-flex items-center gap-1.5 text-xs font-bold rounded-md" style={{ backgroundColor: `${exp.category.color}15`, color: fallbackColor }}>
          <span className="text-sm">{exp.category.emoji}</span> 
          {exp.category.name}
        </span>
      </td>
      <td 
        className="px-4 py-4 whitespace-nowrap text-sm font-black tracking-wide"
        style={{ color: fallbackColor }}
      >
        ${exp.amount.toFixed(1)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {exp.description || <span className="text-gray-300 dark:text-gray-600 italic">-</span>}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
        <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mr-3 transition" title="修改">✏️</button>
        <button onClick={handleDelete} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition" title="刪除">🗑️</button>
      </td>
    </tr>
  )
}