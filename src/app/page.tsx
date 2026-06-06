import { getVideosAction, getVideoCountAction, getCategoriesAction, getDailyCountsAction } from "@/actions/video-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Upload } from "lucide-react";
import VideoList from "@/components/VideoList";
import Heatmap from "@/components/Heatmap";

// Vercelのキャッシュを無効にして常に最新のデータベースを表示する
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 初期表示用の最新50件を取得
  const initialVideos = await getVideosAction(0, 50, "すべて") || [];
  
  // データベースにある本当の総件数を取得
  const totalCount = await getVideoCountAction();

  // 存在するカテゴリのリストを取得
  const categories = await getCategoriesAction();

  // 日別視聴件数を取得（ヒートマップ用）
  const dailyCounts = await getDailyCountsAction();

  if (totalCount === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
        <div className="p-6 bg-muted/50 rounded-full">
          <Upload className="w-12 h-12 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">まだ視聴履歴がありません</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Google Takeoutからダウンロードした履歴データをインポートするか、Chrome拡張機能を使って履歴の記録を開始してください。
          </p>
        </div>
      </div>
    );
  }

  // リマインド用動画（初期取得の50件から抽出）
  const remindVideos = initialVideos.filter(v => v.is_starred).slice(0, 10);

  // カテゴリごとの割合計算（最近の50件の傾向）
  const totalRecentVideos = initialVideos.length;
  // 最近50件に含まれるユニークなカテゴリ名を取得
  const uniqueCategories = Array.from(new Set(initialVideos.map(v => v.category_name)));
  
  const categoryStats = uniqueCategories.map(cat => {
    const count = initialVideos.filter(v => v.category_name === cat).length;
    return { name: cat, percentage: Math.round((count / totalRecentVideos) * 100) };
  }).filter(stat => stat.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage); // 割合が多い順にソート

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-12">
      
      {/* リマインド（掘り起こし）枠 */}
      {remindVideos.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            後で見る・続きから
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {remindVideos.map(video => (
              <Card key={video.id} className="min-w-[280px] shrink-0 snap-start overflow-hidden border-border/50 hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative h-40 w-full bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={video.thumbnail_url} alt={video.title} className="object-cover w-full h-full" />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-2 text-sm mb-1">{video.title}</h3>
                  <p className="text-xs text-muted-foreground">{video.channel_name}</p>
                  {video.progress > 0 && (
                    <Progress value={video.progress} className="h-1 mt-3" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ヒートマップ（草生やす） */}
      <section>
        <Card className="p-6 border-border/50 bg-card/50">
          <Heatmap data={dailyCounts} />
        </Card>
      </section>

      {/* ミクロ分析（仮想スクロールリスト） */}
      <section>
        <h2 className="mb-4 text-xl font-bold">すべての履歴 ({totalCount.toLocaleString()}件)</h2>
        <VideoList initialVideos={initialVideos} categories={["すべて", ...categories]} />
      </section>

      {/* マクロ分析 */}
      <section className="mt-8 pt-8 border-t border-border/50">
        <h2 className="mb-4 text-xl font-bold">視聴傾向（最近）</h2>
        <Card className="p-6 border-border/50">
          <div className="space-y-4">
            {categoryStats.map(stat => (
              <div key={stat.name} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium">{stat.name}</div>
                <Progress value={stat.percentage} className="flex-1 h-2" />
                <div className="w-12 text-sm text-right text-muted-foreground">{stat.percentage}%</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

    </div>
  );
}
