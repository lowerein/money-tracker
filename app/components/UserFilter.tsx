"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function UserFilter({ 
  currentUser, 
  sharedUsers 
}: { 
  currentUser: any, 
  sharedUsers: any[] 
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentView = searchParams.get("view") || currentUser.id
  const viewIds = currentView.split(",")

  const toggleUser = (id: string) => {
    let newIds = [...viewIds]
    if (newIds.includes(id)) {
      newIds = newIds.filter(uid => uid !== id)
    } else {
      newIds.push(id)
    }
    // 最少要睇一個人，如果清空晒就強迫睇自己
    if (newIds.length === 0) newIds = [currentUser.id]
    
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", newIds.join(","))
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  // 如果無朋友，就連呢個過濾器都唔需要顯示
  if (sharedUsers.length === 0) return null

  return (
    <div className="mb-4 bg-gray-50/50 dark:bg-gray-800/30 p-4 border-b border-gray-100 dark:border-gray-800">
      <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">👀 顯示進度</h4>
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => toggleUser(currentUser.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${viewIds.includes(currentUser.id) ? "bg-blue-600 text-white shadow-sm" : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"}`}
        >
          😎 我自己
        </button>
        
        {sharedUsers.map(u => (
          <button 
            key={u.id}
            onClick={() => toggleUser(u.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${viewIds.includes(u.id) ? "bg-purple-600 text-white shadow-sm" : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"}`}
          >
            👤 {u.name}
          </button>
        ))}
      </div>
    </div>
  )
}