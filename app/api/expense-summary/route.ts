import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getHKDateString, getSafeDBDate } from "@/lib/utils"; // 引入我哋之前寫落嘅時間工具

export async function GET(request: Request) {
  // 1. 獲取網址傳入嚟嘅參數
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const userId = searchParams.get("userId");

  // cmofka84j0000fcue3aqzrtf2

  // 2. 簡單安全驗證 (🌟 你可以自己改一個複雜啲嘅密碼)
  if (key !== "MY_SUPER_SECRET_KEY" || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 3. 計算香港時間嘅「今日」同「今個月」範圍
    const hkTodayStr = getHKDateString();
    const [y, m, d] = hkTodayStr.split("-").map(Number);

    // 今日範圍 (00:00:00 至 23:59:59)
    const todayStart = getSafeDBDate(hkTodayStr);
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

    // 今個月範圍 (1號 00:00:00 至下個月1號前一毫秒)
    const monthStartStr = `${y}-${String(m).padStart(2, "0")}-01`;
    const monthStart = getSafeDBDate(monthStartStr);
    const nextMonthStartStr =
      m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const monthEnd = new Date(getSafeDBDate(nextMonthStartStr).getTime() - 1);

    // 4. 從資料庫獲取今日支出 (移除 category 篩選)
    const todayExpenses = await prisma.expense.findMany({
      where: {
        userId: userId,
        date: { gte: todayStart, lte: todayEnd },
      },
    });
    const todayTotal = todayExpenses.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );

    // 5. 從資料庫獲取今個月支出 (移除 category 篩選)
    const monthExpenses = await prisma.expense.findMany({
      where: {
        userId: userId,
        date: { gte: monthStart, lte: monthEnd },
      },
    });
    const monthTotal = monthExpenses.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );
    // 6. 輸出乾淨嘅 JSON 數據
    return NextResponse.json({
      today: todayTotal,
      month: monthTotal,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
