"use client";
import { useMemo } from "react";

export default function Heatmap({ data }: { data: string[] }) {
  // 過去30日分の日付配列を生成
  const days = useMemo(() => {
    // 1. data (viewed_atの配列) をローカルのYYYY-MM-DD形式に変換して集計
    const counts: Record<string, number> = {};
    for (const isoString of data) {
      if (!isoString) continue;
      const d = new Date(isoString);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    }

    // 2. 過去30日分の配列を作成
    const result = [];
    const today = new Date();
    
    // 直近30日間
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      
      // YYYY-MM-DD 形式を取得（ローカルタイム基準）
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      result.push({
        date: dateStr,
        displayDate: `${d.getMonth() + 1}/${d.getDate()}`, // 6/6
        count: counts[dateStr] || 0
      });
    }
    return result;
  }, [data]);

  // 最大値を求めて高さをパーセンテージで計算できるようにする
  const maxCount = Math.max(...days.map(d => d.count), 1); // 0割防止のため最低1

  return (
    <div className="flex flex-col gap-6 w-full">
      <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
        📊 視聴グラフ (過去30日間)
      </h3>
      
      <div className="w-full h-[220px] flex items-end justify-between gap-1 sm:gap-2 pb-8 relative pt-6">
        {days.map((day) => {
          const heightPercent = (day.count / maxCount) * 100;
          return (
            <div key={day.date} className="flex flex-col items-center flex-1 group h-full justify-end relative">
              
              {/* 棒の上に数字（ホバー時または常に） */}
              <div className={`text-[10px] sm:text-xs font-bold mb-1 transition-opacity ${day.count > 0 ? 'text-foreground' : 'text-transparent'}`}>
                {day.count > 0 ? day.count : ""}
              </div>
              
              {/* 棒本体 */}
              <div 
                className={`w-full max-w-[32px] rounded-t-sm transition-all relative ${day.count > 0 ? 'bg-emerald-500/60 hover:bg-emerald-500 dark:bg-emerald-600/60 dark:hover:bg-emerald-500' : 'bg-transparent'}`}
                style={{ height: `${Math.max(heightPercent, 2)}%` }} // 0件でも最低2%の高さを持たせてレイアウトを崩さないようにする（色は透明なので見えない）
                title={`${day.date}: ${day.count}本`}
              >
              </div>
              
              {/* X軸のラベル（日付） */}
              <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-2 rotate-45 origin-top-left absolute -bottom-6 left-1/2 whitespace-nowrap">
                {day.displayDate}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
