// lib/utils.ts

// 1. 取得香港時間嘅 YYYY-MM-DD 字串 (例如 "2026-04-28")
export function getHKDateString(date: Date | string | number = new Date()): string {
  return new Date(date).toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" })
}

// 2. 將 YYYY-MM-DD 轉做絕對安全嘅資料庫儲存時間 (鎖死 UTC 00:00:00)
export function getSafeDBDate(hkDateString: string): Date {
  return new Date(`${hkDateString}T00:00:00.000Z`)
}