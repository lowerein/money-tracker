"use client";

import { useState, useEffect } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createHabit,
  deleteHabit,
  inviteFriend,
  revokeShareAccess,
  updateHabit,
  updateHabitOrder,
  updateCategoryOrder,
} from "../actions";

export default function SettingsManager({
  categories,
  habits,
  sharedByMe,
}: {
  categories: any[];
  habits: any[];
  sharedByMe: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"habit" | "category" | "invite">(
    "habit",
  );
  const [loading, setLoading] = useState(false);

  // 🌟 超長版常用 Emoji 清單 (記帳 + 習慣 通用)
  const quickEmojis = [
    "🍽️",
    "🍔",
    "☕",
    "🍺",
    "🛒",
    "🛍️",
    "👕",
    "👗",
    "🏠",
    "💡",
    "💧",
    "🧹",
    "🚗",
    "🚌",
    "🚆",
    "✈️",
    "🎬",
    "🎮",
    "🎵",
    "🎫",
    "🏥",
    "💊",
    "💇‍♀️",
    "🧴",
    "🐶",
    "🐱",
    "👶",
    "🎓",
    "📱",
    "💻",
    "🌐",
    "⛽",
    "🏃‍♂️",
    "📖",
    "🧘‍♀️",
    "💪",
    "🥗",
    "🛌",
    "🚭",
    "⭐",
  ];

  // ==========================================
  // 💰 分類 State & Handlers
  // ==========================================
  const [catEditingId, setCatEditingId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("📌");
  const [catColor, setCatColor] = useState("#3b82f6");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editHabitName, setEditHabitName] = useState("");
  const [editHabitEmoji, setEditHabitEmoji] = useState("");
  const [editHabitTarget, setEditHabitTarget] = useState(1);
  const [editHabitUnit, setEditHabitUnit] = useState("");
  const [localHabits, setLocalHabits] = useState(habits);
  const [localCategories, setLocalCategories] = useState(categories);

  // 🌟 移動分類功能
  const moveCategory = async (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === localCategories.length - 1) return;

    const newList = [...localCategories];
    const swapIndex = direction === "UP" ? index - 1 : index + 1;

    // 交換位置
    const temp = newList[index];
    newList[index] = newList[swapIndex];
    newList[swapIndex] = temp;

    setLocalCategories(newList); // 即時更新畫面

    // 射去 Server Save
    const newOrderIds = newList.map((c) => c.id);
    await updateCategoryOrder(newOrderIds);
  };

  const startEditHabit = (habit: any) => {
    setEditingHabitId(habit.id);
    setEditHabitName(habit.name);
    setEditHabitEmoji(habit.emoji);
    setEditHabitTarget(habit.target || 1);
    setEditHabitUnit(habit.unit || "");
  };

  const handleSaveEditHabit = async () => {
    if (!editingHabitId || !editHabitName.trim() || !editHabitEmoji.trim())
      return;
    setLoading(true);
    await updateHabit(
      editingHabitId,
      editHabitName,
      editHabitEmoji,
      editHabitTarget,
      editHabitUnit,
    );
    setEditingHabitId(null);
    setLoading(false);
  };

  const resetCatForm = () => {
    setCatEditingId(null);
    setCatName("");
    setCatEmoji("📌");
    setCatColor("#3b82f6");
  };

  const handleEditCat = (cat: any) => {
    setCatEditingId(cat.id);
    setCatName(cat.name);
    setCatEmoji(cat.emoji || "📌");
    setCatColor(cat.color || "#3b82f6");
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setLoading(true);
    if (catEditingId) {
      await updateCategory(catEditingId, catName, catColor, catEmoji);
    } else {
      await createCategory(catName, catColor, catEmoji);
    }
    resetCatForm();
    setLoading(false);
  };

  const handleDeleteCat = async (id: string) => {
    if (confirm("⚠️ 確定刪除？此操作會連帶刪除該分類下所有開支！")) {
      setLoading(true);
      await deleteCategory(id);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLocalHabits(habits);
  }, [habits]);

  // ==========================================
  // 🎯 習慣 State & Handlers
  // ==========================================
  const [habName, setHabName] = useState("");
  const [habEmoji, setHabEmoji] = useState("⭐");
  const [habColor, setHabColor] = useState("#10b981");
  const [habType, setHabType] = useState("BOOLEAN");
  const [habTarget, setHabTarget] = useState("");
  const [habUnit, setHabUnit] = useState("");

  const resetHabForm = () => {
    setHabName("");
    setHabEmoji("⭐");
    setHabColor("#10b981");
    setHabType("BOOLEAN");
    setHabTarget("");
    setHabUnit("");
  };

  const handleSaveHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habName.trim()) return;
    setLoading(true);
    await createHabit({
      name: habName,
      emoji: habEmoji,
      color: habColor,
      type: habType,
      target: habType === "NUMERIC" ? parseFloat(habTarget) || 1 : undefined,
      unit: habType === "NUMERIC" ? habUnit : undefined,
    });
    resetHabForm();
    setLoading(false);
  };

  const handleDeleteHabit = async (id: string) => {
    if (confirm("⚠️ 確定要刪除呢個習慣？打卡記錄會一併消失！")) {
      setLoading(true);
      await deleteHabit(id);
      setLoading(false);
    }
  };

  const moveHabit = async (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === localHabits.length - 1) return;

    const newList = [...localHabits];
    const swapIndex = direction === "UP" ? index - 1 : index + 1;

    // 交換位置
    const temp = newList[index];
    newList[index] = newList[swapIndex];
    newList[swapIndex] = temp;

    setLocalHabits(newList); // 即時更新畫面

    // 射去 Server Save
    const newOrderIds = newList.map((h) => h.id);
    await updateHabitOrder(newOrderIds);
  };

  // ==========================================
  // 🤝 邀請 State & Handlers
  // ==========================================
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await inviteFriend(inviteEmail);
    if (res.success) {
      setInviteMsg("✅ 邀請成功！");
      setInviteEmail("");
    } else {
      setInviteMsg(`❌ ${res.error}`);
    }
    setLoading(false);
    setTimeout(() => setInviteMsg(""), 3000);
  };

  const handleRemoveShare = async (guestId: string, name: string) => {
    if (confirm(`確定要移除 ${name} 嘅觀看權限？`)) {
      setLoading(true);
      await revokeShareAccess(guestId);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <span>⚙️</span> 設定
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">
                ⚙️ 系統設定
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setActiveTab("habit")}
                className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === "habit" ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
              >
                🎯 習慣
              </button>
              <button
                onClick={() => setActiveTab("category")}
                className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === "category" ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
              >
                💰 記帳
              </button>
              <button
                onClick={() => setActiveTab("invite")}
                className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === "invite" ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
              >
                🤝 社交
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              {/* ========================================== */}
              {/* TAB 1: 🎯 習慣管理 */}
              {/* ========================================== */}
              {activeTab === "habit" && (
                <div className="animate-in fade-in">
                  <form
                    onSubmit={handleSaveHabit}
                    className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                      新增習慣
                    </h3>
                    <div className="mb-3 flex gap-2 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setHabType("BOOLEAN")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${habType === "BOOLEAN" ? "bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        ✔ 達成型
                      </button>
                      <button
                        type="button"
                        onClick={() => setHabType("NUMERIC")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${habType === "NUMERIC" ? "bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        📈 計數型
                      </button>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <div className="w-14">
                        <input
                          type="text"
                          value={habEmoji}
                          onChange={(e) => setHabEmoji(e.target.value)}
                          required
                          className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-center dark:text-white"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={habName}
                          onChange={(e) => setHabName(e.target.value)}
                          required
                          placeholder="習慣名稱"
                          className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none dark:text-white"
                        />
                      </div>
                      <div className="w-12">
                        <input
                          type="color"
                          value={habColor}
                          onChange={(e) => setHabColor(e.target.value)}
                          className="w-full h-10 p-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                    {habType === "NUMERIC" && (
                      <div className="flex gap-2 mb-3">
                        <input
                          type="number"
                          step="0.1"
                          value={habTarget}
                          onChange={(e) => setHabTarget(e.target.value)}
                          required
                          placeholder="目標數量 (例: 8)"
                          className="flex-1 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none dark:text-white text-sm"
                        />
                        <input
                          type="text"
                          value={habUnit}
                          onChange={(e) => setHabUnit(e.target.value)}
                          required
                          placeholder="單位 (例: 杯)"
                          className="flex-1 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none dark:text-white text-sm"
                        />
                      </div>
                    )}

                    {/* 🌟 補回：習慣 Emoji 選擇區 */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 justify-center">
                        {quickEmojis.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => setHabEmoji(e)}
                            className={`w-8 h-8 flex items-center justify-center text-lg rounded transition-colors ${habEmoji === e ? "bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-500 shadow-sm" : "hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent"}`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
                    >
                      ➕ 新增習慣
                    </button>
                  </form>
                  <div className="space-y-2 mt-4 max-h-[40vh] overflow-y-auto pr-2">
                    {habits.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">
                        未有任何習慣。
                      </p>
                    ) : (
                      localHabits.map((habit, index) => (
                        <div
                          key={habit.id}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700"
                        >
                          {/* 🌟 編輯模式 */}
                          {editingHabitId === habit.id ? (
                            <div className="flex-1 flex flex-col gap-2 mr-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editHabitEmoji}
                                  onChange={(e) =>
                                    setEditHabitEmoji(e.target.value)
                                  }
                                  className="w-10 p-1.5 text-center text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                                />
                                <input
                                  type="text"
                                  value={editHabitName}
                                  onChange={(e) =>
                                    setEditHabitName(e.target.value)
                                  }
                                  placeholder="習慣名稱"
                                  className="flex-1 p-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                                />
                              </div>
                              {habit.type === "NUMERIC" && (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={editHabitTarget}
                                    onChange={(e) =>
                                      setEditHabitTarget(
                                        parseFloat(e.target.value),
                                      )
                                    }
                                    className="w-20 p-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                                  />
                                  <input
                                    type="text"
                                    value={editHabitUnit}
                                    onChange={(e) =>
                                      setEditHabitUnit(e.target.value)
                                    }
                                    placeholder="單位 (例如: 杯)"
                                    className="w-20 p-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                                  />
                                </div>
                              )}
                              <div className="flex gap-2 justify-end mt-1">
                                <button
                                  onClick={() => setEditingHabitId(null)}
                                  className="text-xs font-bold text-gray-500 hover:text-gray-700"
                                >
                                  取消
                                </button>
                                <button
                                  onClick={handleSaveEditHabit}
                                  disabled={loading}
                                  className="text-xs font-bold text-green-600 hover:text-green-700"
                                >
                                  儲存
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* 🌟 正常顯示模式 */
                            <>
                              <div className="flex items-center gap-3">
                                {/* 🌟 排序按鈕區 */}
                                <div className="flex flex-col gap-0.5 mr-1">
                                  <button
                                    onClick={() => moveHabit(index, "UP")}
                                    disabled={index === 0 || loading}
                                    className="text-[10px] text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={() => moveHabit(index, "DOWN")}
                                    disabled={
                                      index === localHabits.length - 1 ||
                                      loading
                                    }
                                    className="text-[10px] text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                                  >
                                    ▼
                                  </button>
                                </div>

                                <span className="text-xl">{habit.emoji}</span>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                    {habit.name}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-bold tracking-wider">
                                    {habit.type === "BOOLEAN"
                                      ? "每日打卡"
                                      : `目標: ${habit.target} ${habit.unit}`}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => startEditHabit(habit)}
                                  disabled={loading}
                                  className="text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("確定刪除此習慣？"))
                                      handleDeleteHabit(habit.id);
                                  }}
                                  disabled={loading}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  🗑️
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB 2: 💰 記帳管理 */}
              {/* ========================================== */}
              {activeTab === "category" && (
                <div className="animate-in fade-in">
                  <form
                    onSubmit={handleSaveCat}
                    className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                      {catEditingId ? "修改分類" : "新增分類"}
                    </h3>
                    <div className="flex gap-2 mb-3">
                      <div className="w-14">
                        <input
                          type="text"
                          value={catEmoji}
                          onChange={(e) => setCatEmoji(e.target.value)}
                          required
                          className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-center dark:text-white"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={catName}
                          onChange={(e) => setCatName(e.target.value)}
                          required
                          placeholder="分類名稱"
                          className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none dark:text-white"
                        />
                      </div>
                      <div className="w-12">
                        <input
                          type="color"
                          value={catColor}
                          onChange={(e) => setCatColor(e.target.value)}
                          className="w-full h-10 p-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 🌟 補回：記帳 Emoji 選擇區 */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 justify-center">
                        {quickEmojis.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => setCatEmoji(e)}
                            className={`w-8 h-8 flex items-center justify-center text-lg rounded transition-colors ${catEmoji === e ? "bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-500 shadow-sm" : "hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent"}`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        {catEditingId ? "💾 更新" : "➕ 新增"}
                      </button>
                      {catEditingId && (
                        <button
                          type="button"
                          onClick={resetCatForm}
                          className="px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-lg text-sm"
                        >
                          取消
                        </button>
                      )}
                    </div>
                  </form>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      現有清單
                    </h3>
                    {/* 🌟 1. 改用 localCategories 嚟 map，並加入 index */}
                    {localCategories.map((cat, index) => (
                      <div
                        key={cat.id}
                        className="flex justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          {/* 🌟 2. 呢度加返排序上下按鈕 */}
                          <div className="flex flex-col gap-0.5 mr-1">
                            <button
                              onClick={() => moveCategory(index, "UP")}
                              disabled={index === 0 || loading}
                              className="text-[10px] text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => moveCategory(index, "DOWN")}
                              disabled={
                                index === localCategories.length - 1 || loading
                              }
                              className="text-[10px] text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                            >
                              ▼
                            </button>
                          </div>

                          {/* 原本嘅顏色圓點與名稱 (保留你嘅原版設計) */}
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          ></div>
                          <span className="font-bold text-sm text-gray-700 dark:text-gray-200">
                            {cat.emoji} {cat.name}
                          </span>
                        </div>

                        <div className="flex gap-2 items-center">
                          {/* 原本嘅 Edit 功能 (保留) */}
                          <button
                            onClick={() => handleEditCat(cat)}
                            className="text-gray-400 hover:text-blue-500 p-1 text-sm transition-colors"
                          >
                            ✏️
                          </button>
                          {/* 原本嘅 Delete 功能 (保留) */}
                          <button
                            onClick={() => handleDeleteCat(cat.id)}
                            className="text-gray-400 hover:text-red-500 p-1 text-sm transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB 3: 🤝 社交邀請 */}
              {/* ========================================== */}
              {activeTab === "invite" && (
                <div className="animate-in fade-in">
                  <form
                    onSubmit={handleInvite}
                    className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                      邀請朋友
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      輸入朋友嘅 Email，授權佢喺月曆睇到你嘅打卡進度。
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Google Email..."
                        required
                        className="flex-1 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none dark:text-white text-sm"
                      />
                      <button
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm disabled:opacity-50"
                      >
                        邀請
                      </button>
                    </div>
                    {inviteMsg && (
                      <p className="text-xs font-bold mt-2 text-blue-600 dark:text-blue-400">
                        {inviteMsg}
                      </p>
                    )}
                  </form>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      我的朋友圈 (雙向分享中)
                    </h3>
                    {sharedByMe.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">
                        目前未有邀請任何朋友。輸入 Email
                        建立互相督促嘅朋友圈啦！
                      </p>
                    ) : (
                      sharedByMe.map((user) => (
                        <div
                          key={user.id}
                          className="flex justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                              {user.name?.charAt(0) || "👤"}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-gray-700 dark:text-gray-200">
                                {user.name}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {user.email}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveShare(user.id, user.name)
                            }
                            className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 rounded"
                          >
                            移除
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
