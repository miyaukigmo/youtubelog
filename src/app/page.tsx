import { mockVideos, categories } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, PlayCircle } from "lucide-react";

export default function Home() {
  // リマインド用動画（スターあり ＆ 未視聴 or 途中）
  const remindVideos = mockVideos.filter(v => v.isStarred);

  // カテゴリごとの割合計算
  const totalVideos = mockVideos.length;
  const categoryStats = categories.map(cat => {
    const count = mockVideos.filter(v => v.category === cat).length;
    return { name: cat, percentage: Math.round((count / totalVideos) * 100) };
  }).filter(stat => stat.percentage > 0);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-12">
      
      {/* リマインド（掘り起こし）枠 */}
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
                <img src={video.thumbnail} alt={video.title} className="object-cover w-full h-full" />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                  {video.duration}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-2 text-sm mb-1">{video.title}</h3>
                <p className="text-xs text-muted-foreground">{video.channel}</p>
                {video.progress > 0 && (
                  <Progress value={video.progress} className="h-1 mt-3" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* マクロ分析 */}
      <section>
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

      {/* ミクロ分析（高密度リスト） */}
      <section>
        <h2 className="mb-4 text-xl font-bold">すべての履歴</h2>
        <div className="border border-border/50 rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-3 bg-muted/50 text-xs font-medium text-muted-foreground border-b border-border/50">
            <div className="w-10 text-center">状態</div>
            <div>タイトル</div>
            <div className="w-24">ジャンル</div>
            <div className="w-24 text-right">視聴日</div>
            <div className="w-10"></div>
          </div>
          <div className="divide-y divide-border/50">
            {mockVideos.map(video => (
              <div key={video.id} className="group grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-3 items-center hover:bg-muted/30 transition-colors">
                <div className="w-10 flex justify-center text-muted-foreground">
                  {video.progress === 100 ? (
                    <PlayCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-orange-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{video.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{video.channel}</p>
                </div>
                <div className="w-24 flex items-center">
                  <Badge variant="secondary" className="font-normal text-[10px] bg-secondary/50 hover:bg-secondary/50">
                    {video.category}
                  </Badge>
                </div>
                <div className="w-24 text-right text-xs text-muted-foreground">
                  {new Date(video.viewedAt).toLocaleDateString()}
                </div>
                <div className="w-10 flex justify-center">
                  <button className={`p-1 rounded-md transition-opacity cursor-pointer ${video.isStarred ? 'opacity-100 text-yellow-500' : 'opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-muted'}`}>
                    <Star className={`w-4 h-4 ${video.isStarred ? 'fill-yellow-500' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
