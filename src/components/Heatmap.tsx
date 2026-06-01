"use client";
import { useMemo } from "react";

export default function Heatmap({ data }: { data: Record<string, number> }) {
  // 過去約90日分（13週分）の日付配列を生成
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    // タイムゾーンのズレを防ぐため、単純に現在のローカル日付を基準にする
    
    // 最初のセルが日曜日になるように、過去90日〜96日の間で調整する
    const daysToSubtract = 90 + today.getDay(); 

    for (let i = daysToSubtract; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      
      // YYYY-MM-DD 形式を取得（ローカルタイム基準）
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      result.push({
        date: dateStr,
        count: data[dateStr] || 0
      });
    }
    return result;
  }, [data]);

  // 件数に応じて色を変える関数（GitHubの草カラー）
  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/50 dark:bg-muted/30"; // 0件
    if (count < 5) return "bg-emerald-200 dark:bg-emerald-900"; // 少ない
    if (count < 15) return "bg-emerald-400 dark:bg-emerald-700"; // 中くらい
    if (count < 30) return "bg-emerald-600 dark:bg-emerald-500"; // 多い
    return "bg-emerald-800 dark:bg-emerald-400"; // めっちゃ多い
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
        🔥 視聴ヒートマップ (過去3ヶ月)
      </h3>
      <div className="overflow-x-auto pb-2 scrollbar-hide">
        {/* GitHub風の縦7行・横並びグリッド */}
        <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
          {days.map((day) => (
            <div 
              key={day.date} 
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-primary/50 ${getColor(day.count)}`}
              title={`${day.date}: ${day.count}本`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mt-1">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted/50" />
          <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
          <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
          <div className="w-3 h-3 rounded-sm bg-emerald-800 dark:bg-emerald-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
