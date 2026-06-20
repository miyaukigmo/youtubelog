import { getVideosAction, getVideoCountAction, getCategoriesAction, getDailyCountsAction, getWatchTimeAnalyticsAction } from "@/actions/video-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Upload } from "lucide-react";
import VideoList from "@/components/VideoList";
import Heatmap from "@/components/Heatmap";
import AnalyticsChart from "@/components/AnalyticsChart";

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

  // 時間分析用のデータを取得
  const analyticsData = await getWatchTimeAnalyticsAction();

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

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-12">
      
      {/* リマインド（掘り起こし）枠 */}
      {remindVideos.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            お気に入り
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {remindVideos.map(video => (
              <Card key={video.id} className="w-[240px] h-[220px] shrink-0 snap-start overflow-hidden border-border/50 hover:shadow-md transition-shadow cursor-pointer flex flex-col" title={video.title}>
                <div className="relative h-32 w-full bg-muted shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={video.thumbnail_url} alt={video.title} className="object-cover w-full h-full" />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold line-clamp-1 text-sm">{video.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{video.channel_name}</p>
                  </div>
                  {video.progress > 0 && (
                    <Progress value={video.progress} className="h-1 mt-2" />
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

      {/* 時間の使い方分析 */}
      <section className="mt-8 pt-8 border-t border-border/50">
        <h2 className="mb-4 text-xl font-bold">時間の使い方分析（過去30日間）</h2>
        <Card className="p-6 border-border/50 bg-card/50">
          <AnalyticsChart data={analyticsData} />
        </Card>
      </section>

    </div>
  );
}
