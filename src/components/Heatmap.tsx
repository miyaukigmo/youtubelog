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

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
        🔥 視聴ヒートマップ (過去3ヶ月)
      </h3>
      <div className="overflow-x-auto pb-2 scrollbar-hide">
        {/* 数字を表示するグリッド */}
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-max">
          {days.map((day) => (
            <div 
              key={day.date} 
              className="w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-[10px] sm:text-xs font-medium bg-muted/30 border border-border/50 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              title={`${day.date}: ${day.count}本`}
            >
              {day.count > 0 ? day.count : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
