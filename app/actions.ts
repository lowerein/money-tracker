"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ==============================
// 1. 新增自定義分類
// ==============================
// 🌟 參數加咗 emoji
export async function createCategory(name: string, color: string = "#3b82f6", emoji: string = "📌") {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "請先登入！" }
    }

    const category = await prisma.category.create({
      data: {
        name,
        color,
        emoji, // 🌟 將 emoji 寫入 Database
        userId: session.user.id,
      },
    })

    revalidatePath("/") 
    return { success: true, data: category }
  } catch (error) {
    console.error("Create Category Error:", error)
    return { success: false, error: "新增分類失敗，可能分類名稱已存在。" }
  }
}

// ==============================
// 2. 新增每日開支
// ==============================
export async function createExpense(data: {
  amount: number
  description?: string
  date: Date
  categoryId: string
}) {
  try {
    // 1. 驗證身份
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "請先登入！" }
    }

    // 2. 基本防呆檢查
    if (data.amount <= 0) {
      return { success: false, error: "開支金額必須大於 0！" }
    }

    // 3. 寫入 Database
    const expense = await prisma.expense.create({
      data: {
        amount: data.amount,
        description: data.description,
        date: data.date,
        categoryId: data.categoryId,
        userId: session.user.id,
      },
    })

    // 4. 刷新快取
    revalidatePath("/")

    return { success: true, data: expense }
  } catch (error) {
    console.error("Create Expense Error:", error)
    return { success: false, error: "新增開支失敗，請稍後再試。" }
  }
}


// 3. 刪除開支記錄

// ==============================
export async function deleteExpense(id: string, formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      console.error("未登入！")
      return // 直接 return 終止執行，唔回傳任何 Object
    }

    await prisma.expense.delete({
      where: { 
        id: id,
        userId: session.user.id 
      },
    })

    revalidatePath("/")
    // 成功都唔需要 return嘢，因為 revalidatePath 已經會自動刷新畫面
  } catch (error) {
    console.error("Delete Expense Error:", error)
  }
}

// ==============================
// 4. 更新分類
// ==============================
export async function updateCategory(id: string, name: string, color: string, emoji: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "請先登入" }

    await prisma.category.update({
      where: { id, userId: session.user.id },
      data: { name, color, emoji },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: "更新失敗" }
  }
}

// ==============================
// 5. 刪除分類
// ==============================
export async function deleteCategory(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "請先登入" }

    // 注意：如果呢個分類下面有開支，Prisma 會根據你 Schema 的 onDelete 設定處理
    // 如果你跟我之前嘅設定，刪除分類會連帶刪除該分類下所有開支 (Cascade)
    await prisma.category.delete({
      where: { id, userId: session.user.id },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: "刪除失敗，可能此分類仍有開支數據。" }
  }
}