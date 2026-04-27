"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ==============================
// 1. 分類相關操作 (Category)
// ==============================

// 新增分類
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
        emoji,
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

// 更新分類
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
    console.error("Update Category Error:", error)
    return { success: false, error: "更新失敗" }
  }
}

// 刪除分類
export async function deleteCategory(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "請先登入" }

    // 注意：根據 Schema 設定，刪除分類會連帶刪除該分類下的所有開支 (Cascade)
    await prisma.category.delete({
      where: { id, userId: session.user.id },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Delete Category Error:", error)
    return { success: false, error: "刪除失敗，可能此分類仍有數據。" }
  }
}

// ==============================
// 2. 開支相關操作 (Expense)
// ==============================

// 新增開支
export async function createExpense(data: {
  amount: number
  description?: string
  date: Date
  categoryId: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "請先登入！" }
    }

    if (data.amount <= 0) {
      return { success: false, error: "開支金額必須大於 0！" }
    }

    const expense = await prisma.expense.create({
      data: {
        amount: data.amount,
        description: data.description,
        date: data.date,
        categoryId: data.categoryId,
        userId: session.user.id,
      },
    })

    revalidatePath("/")
    return { success: true, data: expense }
  } catch (error) {
    console.error("Create Expense Error:", error)
    return { success: false, error: "新增開支失敗，請確保已選擇有效分類。" }
  }
}

// 更新開支
export async function updateExpense(id: string, data: { amount: number, description?: string, date: Date, categoryId: string }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "請先登入！" }
    if (data.amount <= 0) return { success: false, error: "開支金額必須大於 0！" }

    await prisma.expense.update({
      where: { id, userId: session.user.id },
      data: {
        amount: data.amount,
        description: data.description,
        date: data.date,
        categoryId: data.categoryId,
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Update Expense Error:", error)
    return { success: false, error: "更新失敗" }
  }
}

// 刪除開支 (🌟 簡化版，唔再需要 formData)
export async function deleteExpense(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "請先登入" }

    await prisma.expense.delete({
      where: { id, userId: session.user.id },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Delete Expense Error:", error)
    return { success: false, error: "刪除失敗" }
  }
}