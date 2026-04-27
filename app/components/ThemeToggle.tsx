"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 🌟 確保組件喺 Client 端完全掛載之後先渲染 UI
  useEffect(() => {
    setMounted(true)
  }, [])

  // 喺未準備好之前，先顯示一個隱形嘅佔位掣，防止排版跳動 (Layout Shift)
  if (!mounted) {
    return (
      <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 opacity-50 cursor-default">
        <span className="opacity-0">☀️</span>
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      title={theme === "dark" ? "切換至淺色模式" : "切換至深色模式"}
    >
      <span className="text-sm">{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  )
}