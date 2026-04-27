"use client";

import { useState } from "react";
import { deleteExpense, updateExpense } from "../actions";

// 🌟 明確定義 Props 類型，等 TypeScript 認得 currentUserId
interface ExpenseRowProps {
  exp: any;
  categories: any[];
  currentUserId: string;
}

export default function ExpenseRow({
  exp,
  categories,
  currentUserId,
}: ExpenseRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(exp.amount.toString());
  const [description, setDescription] = useState(exp.description || "");
  const [categoryId, setCategoryId] = useState(exp.categoryId);
  const [loading, setLoading] = useState(false);

  // 判斷呢條數係咪屬於當前登入嘅 User
  const isMe = exp.userId === currentUserId;

  const handleDelete = async () => {
    if (!isMe) return;
    if (confirm("確定要刪除呢筆開支？")) {
      setLoading(true);
      await deleteExpense(exp.id);
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!isMe) return; // 雙重保險：唔係自己嘅數唔准修改
    setLoading(true);

    // 🌟 將參數包裝返做一個 Object，符合你原本 actions.ts 嘅要求
    await updateExpense(exp.id, {
      amount: parseFloat(amount),
      description: description,
      date: exp.date, // 保留原本嘅日期
      categoryId: categoryId,
    });

    setIsEditing(false);
    setLoading(false);
  };

  // ==========================================
  // 編輯模式介面
  // ==========================================
  if (isEditing && isMe) {
    return (
      <tr className="bg-blue-50/50 dark:bg-blue-900/20 transition-colors">
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
          {exp.date.toLocaleDateString("zh-HK", {
            month: "short",
            day: "numeric",
          })}
        </td>

        <td className="px-4 py-3 whitespace-nowrap">
          <span className="text-[10px] font-bold text-gray-400">我</span>
        </td>

        <td className="px-4 py-3 whitespace-nowrap">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <input
            type="number"
            step="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-24 p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
          />
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="備註..."
            className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
          />
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-right text-sm sticky right-0 bg-blue-50 dark:bg-[#15233b] border-l border-blue-100 dark:border-blue-800 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="text-green-600 hover:text-green-700 font-bold mr-3 disabled:opacity-50"
          >
            保存
          </button>
          <button
            onClick={() => setIsEditing(false)}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            取消
          </button>
        </td>
      </tr>
    );
  }

  // ==========================================
  // 正常顯示介面
  // ==========================================
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-medium">
        {exp.date.toLocaleDateString("zh-HK", {
          month: "short",
          day: "numeric",
        })}
      </td>

      <td className="px-4 py-4 whitespace-nowrap">
        {isMe ? (
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
            我
          </span>
        ) : (
          <div
            className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] shadow-sm cursor-help"
            title={exp.user.name || "朋友"}
          >
            {exp.user?.name?.charAt(0).toUpperCase() || "F"}
          </div>
        )}
      </td>

      <td className="px-4 py-4 whitespace-nowrap text-sm">
        <span
          className="px-2 py-1 inline-flex items-center gap-1.5 text-xs font-bold rounded-md"
          style={{
            backgroundColor: `${exp.category.color}15`,
            color: exp.category.color,
          }}
        >
          <span className="text-sm">{exp.category.emoji}</span>
          {exp.category.name}
        </span>
      </td>

      <td
        className="px-4 py-4 whitespace-nowrap text-sm font-black tracking-wide"
        style={{ color: exp.category.color }}
      >
        ${exp.amount.toFixed(1)}
      </td>

      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 italic">
        {exp.description || "-"}
      </td>

      {/* 🌟 操作按鈕：取消 Hover 隱藏，改為永遠顯示 */}
      {/* 🌟 加入 sticky right-0 並且同步 hover 嘅背景色 */}
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm sticky right-0 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 transition-colors border-l border-gray-50 dark:border-gray-800 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">
        {isMe ? (
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
              title="編輯"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
              title="刪除"
            >
              🗑️
            </button>
          </div>
        ) : (
          <span className="text-[10px] text-gray-300 dark:text-gray-600 italic px-2">
            唯讀
          </span>
        )}
      </td>
    </tr>
  );
}
