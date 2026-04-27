"use client";

import { useState, useEffect, useRef } from "react";
import { logHabitProgress } from "../actions";

// ==========================================
// 1. 數值型習慣 (加入 Debounce 及 Input，保留所有舊排版與進度條)
// ==========================================
function NumericHabitRow({
  habit,
  initialValue,
  targetDate,
}: {
  habit: any;
  initialValue: number;
  targetDate: Date;
}) {
  const [value, setValue] = useState(initialValue);
  const isFirstRender = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isCompleted = value >= (habit.target || 1);

  // Debounce 核心邏輯
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      await logHabitProgress(habit.id, targetDate, value);
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, habit.id, targetDate]);

  const handleMinus = () => setValue((prev: number) => Math.max(0, prev - 1));
  const handlePlus = () => setValue((prev: number) => prev + 1);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. 如果輸入框係空嘅，我哋暫時畀佢係 0 或者保持空，但要確保係數字
    const rawValue = e.target.value;
    if (rawValue === "") {
      setValue(0);
      return;
    }

    const val = parseFloat(rawValue);
    if (!isNaN(val)) {
      setValue(val);
    }
  };

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${isCompleted ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50" : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700"}`}
    >
      <div className="flex items-center justify-between">
        {/* 左邊：Emoji 同名稱 */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm transition-all ${isCompleted ? "" : "grayscale opacity-50"}`}
            style={{ backgroundColor: isCompleted ? habit.color : "#e5e7eb" }}
          >
            {habit.emoji}
          </div>
          <div className="flex flex-col">
            <span
              className={`font-bold ${isCompleted ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
            >
              {habit.name}
            </span>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
              {value} / {habit.target} {habit.unit}
            </span>
          </div>
        </div>

        {/* 右邊：操作掣 (轉為 Input 支援直接輸入) */}
        <div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={handleMinus}
              disabled={value <= 0}
              className="w-6 h-6 flex items-center justify-center rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
            >
              -
            </button>
            <input
              type="number"
              value={value}
              onChange={handleInputChange}
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="w-8 text-center text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={handlePlus}
              className="w-6 h-6 flex items-center justify-center rounded text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 下方：數值型專屬靚靚進度條 */}
      <div className="w-full h-1.5 mt-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min((value / (habit.target || 1)) * 100, 100)}%`,
            backgroundColor: isCompleted ? "#10b981" : habit.color,
          }}
        />
      </div>
    </div>
  );
}

// ==========================================
// 2. 打卡型習慣 (保留舊排版，支援即時反應)
// ==========================================
function BooleanHabitRow({
  habit,
  initialValue,
  targetDate,
}: {
  habit: any;
  initialValue: number;
  targetDate: Date;
}) {
  const [value, setValue] = useState(initialValue);
  const isCompleted = value > 0;

  const handleToggle = async () => {
    const newValue = value > 0 ? 0 : 1;
    setValue(newValue); // 畫面即刻轉
    await logHabitProgress(habit.id, targetDate, newValue); // 背後 Save
  };

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${isCompleted ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50" : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700"}`}
    >
      <div className="flex items-center justify-between">
        {/* 左邊：Emoji 同名稱 */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm transition-all ${isCompleted ? "" : "grayscale opacity-50"}`}
            style={{ backgroundColor: isCompleted ? habit.color : "#e5e7eb" }}
          >
            {habit.emoji}
          </div>
          <div className="flex flex-col">
            <span
              className={`font-bold ${isCompleted ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
            >
              {habit.name}
            </span>
          </div>
        </div>

        {/* 右邊：操作掣 */}
        <div>
          <button
            onClick={handleToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted ? "bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-none" : "bg-gray-200 dark:bg-gray-700 text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
          >
            {isCompleted ? "✓" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. 主模組 (保留你最原本的白色大卡片與標題)
// ==========================================
export default function HabitTracker({
  habits,
  initialLogs = [],
  targetDate,
  dateStr, // 🌟 接收呢個字串
}: {
  habits: any[];
  initialLogs?: any[];
  targetDate: Date;
  dateStr: string;
}) {
  if (habits.length === 0) return null;
  const [y, m, d] = dateStr.split("-");
  const displayDate = `${parseInt(m)}月${parseInt(d)}日`;
  // 🌟 1. 將 targetDate 轉做 YYYY-MM-DD 格式
  const targetDateStr = targetDate.toISOString().split("T")[0];

  // 🌟 2. 整理數據，嚴格過濾只屬於 targetDate 嘅紀錄
  const logMap: Record<string, number> = {};
  initialLogs.forEach((log) => {
    // 🌟 資料庫出嚟嘅，直接拆字串就得，唔會再有時差！
    const logDateStr = new Date(log.date).toISOString().split("T")[0];
    if (logDateStr === targetDateStr) {
      logMap[log.habitId] = log.value;
    }
  });

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {displayDate} 習慣打卡
        </h3>
      </div>

      <div className="space-y-3">
        {habits.map((habit) => {
          // 如果 logMap 搵唔到當日紀錄，就會乖乖地出 0
          const initialValue = logMap[habit.id] || 0;

          // 繼續用 dateKey 強制刷新組件
          const uniqueKey = `${habit.id}-${targetDateStr}`;

          if (habit.type === "NUMERIC") {
            return (
              <NumericHabitRow
                key={uniqueKey}
                habit={habit}
                initialValue={initialValue}
                targetDate={targetDate}
              />
            );
          } else {
            return (
              <BooleanHabitRow
                key={uniqueKey}
                habit={habit}
                initialValue={initialValue}
                targetDate={targetDate}
              />
            );
          }
        })}
      </div>
    </div>
  );
}
