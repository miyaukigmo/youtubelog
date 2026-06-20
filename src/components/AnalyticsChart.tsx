"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

type AnalyticsData = {
  name: string;
  value: number; // 分単位
};

const COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#64748b", // slate-500
  "#84cc16", // lime-500
];

export default function AnalyticsChart({ data }: { data: AnalyticsData[] }) {
  // 合計時間（分）を計算
  const totalMinutes = data.reduce((sum, item) => sum + item.value, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // ツールチップのカスタムフォーマット
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hours = Math.floor(data.value / 60);
      const mins = data.value % 60;
      const timeStr = hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
      const percentage = ((data.value / totalMinutes) * 100).toFixed(1);

      return (
        <div className="bg-popover/95 text-popover-foreground p-3 rounded-lg shadow-md border border-border">
          <p className="font-bold mb-1">{data.name}</p>
          <p className="text-sm">{timeStr} ({percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground text-center px-4">
        <p className="mb-2">まだ十分なデータがありません。</p>
        <p className="text-sm">※Google Takeout経由でインポートした過去の履歴は動画の長さが含まれていないため、拡張機能を入れてから視聴した動画のみが集計対象になります。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground font-medium mb-1">過去30日間の総視聴時間</p>
        <p className="text-4xl font-bold tracking-tight">
          {totalHours}<span className="text-xl font-normal text-muted-foreground ml-1 mr-2">時間</span>
          {remainingMinutes}<span className="text-xl font-normal text-muted-foreground ml-1">分</span>
        </p>
      </div>

      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ paddingTop: "20px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
