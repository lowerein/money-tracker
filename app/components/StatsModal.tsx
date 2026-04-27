"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getMonthlyStats } from "../actions";

export default function StatsModal({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [habitData, setHabitData] = useState<any[]>([]);

  const openModal = async () => {
    setIsOpen(true);
    setLoading(true);
    const res = await getMonthlyStats(year, month);
    if (res.success) {
      setExpenseData(res.expenseData || []);
      setHabitData(res.habitData || []);
    }
    setLoading(false);
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <p className="font-bold text-gray-700 dark:text-gray-200">
            {data.name}
          </p>
          <p className="text-sm font-black" style={{ color: data.color }}>
            ${data.value.toFixed(1)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <p className="font-bold text-gray-700 dark:text-gray-200">
            {data.emoji} {data.name}
          </p>
          <p className="text-sm font-black text-blue-600 dark:text-blue-400">
            達成率: {data.rate}%
          </p>
        </div>
      );
    }
    return null;
  };

  const totalExpense = expenseData.reduce((sum, item) => sum + item.value, 0);

  return (
    <>
      <button
        onClick={openModal}
        className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <span>📊</span> 統計
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div>
                <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-2">
                  📊 {year}年{month + 1}月 統計
                </h2>
                {!loading && (
                  <p className="text-sm font-bold text-gray-500 mt-1">
                    本月總開支:{" "}
                    <span className="text-red-500 font-black">
                      ${totalExpense.toFixed(1)}
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 font-bold gap-3">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  努力運算中...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 💰 開支圓餅圖 */}
                  <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                    <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-widest text-center">
                      💰 分類開支分佈
                    </h3>
                    {expenseData.length > 0 ? (
                      <>
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={expenseData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                              >
                                {expenseData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomPieTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 justify-center">
                          {expenseData.map((d) => (
                            <div
                              key={d.name}
                              className="flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-300"
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: d.color }}
                              ></span>
                              {d.name}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="h-48 flex items-center justify-center text-gray-400 text-sm font-bold">
                        暫無數據
                      </div>
                    )}
                  </div>

                  {/* 🎯 習慣長條圖 */}
                  <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                    <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-widest text-center">
                      🎯 習慣達成率
                    </h3>
                    {habitData.length > 0 ? (
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={habitData}
                            layout="vertical"
                            margin={{ top: 0, right: 20, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              horizontal={false}
                              stroke="#374151"
                              opacity={0.1}
                            />
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis
                              dataKey="emoji"
                              type="category"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 16 }}
                            />
                            <Tooltip
                              cursor={{ fill: "transparent" }}
                              content={<CustomBarTooltip />}
                            />
                            <Bar
                              dataKey="rate"
                              radius={[0, 4, 4, 0]}
                              barSize={16}
                            >
                              {habitData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-48 flex items-center justify-center text-gray-400 text-sm font-bold">
                        暫無數據
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
