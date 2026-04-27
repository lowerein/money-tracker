"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function ExpenseCategoryFilter({ 
  categories, 
  selectedCats 
}: { 
  categories: any[], 
  selectedCats: string[] 
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const toggleCategory = (name: string) => {
    let newCats = [...selectedCats]
    if (newCats.includes(name)) {
      newCats = newCats.filter(c => c !== name)
    } else {
      newCats.push(name)
    }

    const params = new URLSearchParams(searchParams.toString())
    if (newCats.length === 0) {
      params.delete("cat")
    } else {
      params.set("cat", newCats.join(","))
    }
    params.delete("page") // 轉 filter 嗰陣重置返去第一頁
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("cat")
    params.delete("page")
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  if (categories.length === 0) return null

  return (
    <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2 shrink-0">篩選</span>
      
      <button 
        onClick={clearFilter} 
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${selectedCats.length === 0 ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 border border-gray-100 dark:border-gray-700'}`}
      >
        全部
      </button>

      {categories.map(cat => {
        const isSelected = selectedCats.includes(cat.name)
        return (
          <button 
            key={cat.name} 
            onClick={() => toggleCategory(cat.name)} 
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${isSelected ? 'shadow-sm' : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700'}`}
            style={isSelected ? { backgroundColor: `${cat.color}15`, color: cat.color, borderColor: `${cat.color}40` } : {}}
          >
            <span className={!isSelected ? "opacity-50 grayscale" : ""}>{cat.emoji}</span>
            <span className={!isSelected ? "text-gray-500 dark:text-gray-400" : ""}>{cat.name}</span>
          </button>
        )
      })}
    </div>
  )
}