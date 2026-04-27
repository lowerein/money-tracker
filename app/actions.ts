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

// ==============================
// 3. 習慣養成相關操作 (Habit Tracker)
// ==============================

// 新增習慣
export async function createHabit(data: { name: string, emoji: string, color: string, type: string, target?: number, unit?: string }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "請先登入" }

    await prisma.habit.create({
      data: { 
        ...data, 
        userId: session.user.id 
      },
    })
    
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Create Habit Error:", error)
    return { success: false, error: "新增失敗" }
  }
}

// 刪除習慣
export async function deleteHabit(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "請先登入" }

    await prisma.habit.delete({
      where: { id, userId: session.user.id },
    })
    
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: "刪除失敗" }
  }
}

// 🌟 核心打卡功能 (支援有做/無做 及 數值加減)
export async function logHabitProgress(habitId: string, date: Date, value: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "請先登入" }

    // 將時間強制設定為當日凌晨 00:00:00，確保同一日只會有一條記錄
    const logDate = new Date(date)
    logDate.setHours(0, 0, 0, 0)

    if (value <= 0) {
      // 如果數值 <= 0 (例如取消打卡)，就直接刪除嗰日嘅記錄
      await prisma.habitLog.deleteMany({
        where: { 
          habitId, 
          userId: session.user.id, 
          date: logDate 
        }
      })
    } else {
      // upsert: 如果今日未打卡就 Create，打咗卡就 Update 個數值
      await prisma.habitLog.upsert({
        where: {
          date_habitId_userId: {
            date: logDate,
            habitId,
            userId: session.user.id
          }
        },
        update: { value },
        create: {
          date: logDate,
          value,
          habitId,
          userId: session.user.id
        }
      })
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Log Habit Error:", error)
    return { success: false, error: "打卡失敗" }
  }
}


// ==============================
// 4. 社交與分享功能
// ==============================

// ==============================
// 4. 社交與分享功能
// ==============================

export async function inviteFriend(email: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "請先登入" }
    if (session.user.email === email) return { success: false, error: "唔可以邀請自己！" }

    // 搵個朋友出嚟
    const friend = await prisma.user.findUnique({ where: { email } })
    if (!friend) return { success: false, error: "搵唔到呢個 Email 嘅用戶，請確保佢已經登入過一次 App。" }

    // 🌟 雙向分享機制 (Mutual Share)
    // 建立兩條記錄：你 -> 朋友，同埋 朋友 -> 你
    await prisma.shareAccess.createMany({
      data: [
        { ownerId: session.user.id, guestId: friend.id }, // 你 Share 畀佢
        { ownerId: friend.id, guestId: session.user.id }  // 佢 Share 畀你
      ],
      skipDuplicates: true, // 如果已經存在部分關係，唔會報錯，直接略過
    })

    return { success: true }
  } catch (error: any) {
    console.error("Invite Error:", error)
    return { success: false, error: "邀請失敗" }
  }
}

// 🌟 收回分享權限 (雙向解除好友)
export async function revokeShareAccess(friendId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "請先登入" }

    // 用 deleteMany 一次過刪除 A->B 同 B->A 嘅記錄
    await prisma.shareAccess.deleteMany({
      where: {
        OR: [
          { ownerId: session.user.id, guestId: friendId },
          { ownerId: friendId, guestId: session.user.id }
        ]
      }
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Remove Share Error:", error)
    return { success: false, error: "移除失敗" }
  }
}

// ==============================
// 5. 數據統計功能
// ==============================

export async function getMonthlyStats(year: number, month: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "請先登入" }

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    // 1. 獲取開支數據
    const expenses = await prisma.expense.findMany({
      where: { userId: session.user.id, date: { gte: firstDay, lte: lastDay } },
      include: { category: true }
    })

    const expenseMap = expenses.reduce((acc, exp) => {
      const key = exp.category.name
      if (!acc[key]) acc[key] = { name: `${exp.category.emoji} ${key}`, value: 0, color: exp.category.color }
      acc[key].value += exp.amount
      return acc
    }, {} as Record<string, { name: string, value: number, color: string }>)
    
    const expenseData = Object.values(expenseMap).sort((a, b) => b.value - a.value)

    // 2. 獲取習慣數據
    const habits = await prisma.habit.findMany({ where: { userId: session.user.id } })
    const habitLogs = await prisma.habitLog.findMany({
      where: { userId: session.user.id, date: { gte: firstDay, lte: lastDay } }
    })

    const habitData = habits.map(habit => {
      const logsForHabit = habitLogs.filter(log => log.habitId === habit.id)
      const completedDays = logsForHabit.filter(log => 
        habit.type === "BOOLEAN" ? log.value > 0 : log.value >= (habit.target || 1)
      ).length
      
      const rate = Math.round((completedDays / daysInMonth) * 100)
      return { name: habit.name, emoji: habit.emoji, color: habit.color, rate }
    }).sort((a, b) => b.rate - a.rate)

    return { success: true, expenseData, habitData }
  } catch (error) {
    console.error("Get Stats Error:", error)
    return { success: false, error: "獲取數據失敗" }
  }
}

export async function updateHabitLog(habitId: string, date: Date, value: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false }

    // 1. 先檢查當日係咪已經有呢個習慣嘅打卡記錄
    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId: habitId,
        date: date,
      }
    })

    if (existingLog) {
      // 2. 如果已經有記錄，就 Update 個 value
      await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { value: value }
      })
    } else {
      // 3. 如果今日未打過卡 (無記錄)，就 Create 一條新嘅
      await prisma.habitLog.create({
        data: {
          userId: session.user.id,
          habitId: habitId,
          date: date,
          value: value
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Update Habit Log Error:", error)
    return { success: false, error: "打卡失敗" }
  }
}

// 🌟 更新習慣
export async function updateHabit(
  id: string, 
  name: string, 
  emoji: string, 
  target?: number, 
  unit?: string
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "請先登入" }

    await prisma.habit.update({
      where: { 
        id: id,
        userId: session.user.id // 確保只可以改自己嘅習慣
      },
      data: {
        name,
        emoji,
        target,
        unit
      }
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Update Habit Error:", error)
    return { success: false, error: "更新習慣失敗" }
  }
}

// 🌟 更新習慣次序
export async function updateHabitOrder(habitIds: string[]) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false }

    // 用 Transaction 確保一次過順序更新晒所有 ID
    await prisma.$transaction(
      habitIds.map((id, index) => 
        prisma.habit.update({
          where: { id: id, userId: session.user?.id },
          data: { order: index } // 將 index 變成佢嘅新次序
        })
      )
    )

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Update Habit Order Error:", error)
    return { success: false, error: "更新次序失敗" }
  }
}