"use client";

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

interface StatsChartsProps {
  expenseData: { name: string; value: number; color: string }[];
  habitData: { name: string; rate: number; emoji: string; color: string }[];
}

export default function StatsCharts({
  expenseData,
  habitData,
}: StatsChartsProps) {
  // 自訂圓餅圖 Tooltip
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

  // 自訂長條圖 Tooltip
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* 💰 開支圓餅圖 */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-black text-gray-800 dark:text-white mb-4">
          💰 分類開支分佈
        </h3>
        {expenseData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm font-bold">
            暫時未有開支數據
          </div>
        )}
        {/* 開支圖例 */}
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {expenseData.map((d) => (
            <div
              key={d.name}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: d.color }}
              ></span>
              {d.name} (${d.value.toFixed(0)})
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 習慣達成率長條圖 */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-black text-gray-800 dark:text-white mb-4">
          🎯 習慣達成率
        </h3>
        {habitData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={habitData}
                layout="vertical"
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#374151"
                  opacity={0.2}
                />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  dataKey="emoji"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 20 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={<CustomBarTooltip />}
                />
                <Bar dataKey="rate" radius={[0, 10, 10, 0]} barSize={24}>
                  {habitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm font-bold">
            暫時未有習慣數據
          </div>
        )}
      </div>
    </div>
  );
}
