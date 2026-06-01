import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// .env.local を読み込んで環境変数をセット
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("🚀 インポートを開始します...");
  const filePath = path.resolve(process.cwd(), 'Rireki', 'watch-history.json');
  
  if (!fs.existsSync(filePath)) {
    console.error("エラー: ファイルが見つかりません:", filePath);
    return;
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  console.log("データのパースと整形中...");
  // Takeoutデータの簡単なパースと整形
  const videosToInsert = data
    .filter((item: any) => item.titleUrl && item.titleUrl.includes('watch?v='))
    .map((item: any) => {
      const videoIdMatch = item.titleUrl.match(/v=([^&]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      const title = item.title.replace(/^Watched /, ""); 
      const channelName = item.subtitles?.[0]?.name || "Unknown Channel";
      
      return {
        youtube_video_id: videoId,
        title: title,
        channel_name: channelName,
        thumbnail_url: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : "",
        category_name: "未分類",
        duration: "--:--",
        viewed_at: item.time,
        progress: 100,
        is_starred: false,
      };
    })
    .filter((item: any) => item.youtube_video_id !== null);

  // 同じ動画を複数回見ている場合があるため、最新の視聴記録を残して重複を除外
  const uniqueVideosMap = new Map();
  for (const video of videosToInsert) {
      if (!uniqueVideosMap.has(video.youtube_video_id)) {
          uniqueVideosMap.set(video.youtube_video_id, video);
      }
  }
  const uniqueVideos = Array.from(uniqueVideosMap.values());
  
  console.log(`✨ パース完了。有効なユニーク動画数: ${uniqueVideos.length} 件 (元の件数: ${data.length} 件)`);

  // Supabase制限を回避するため、1000件ずつチャンクに分割してインサート
  const chunkSize = 1000;
  for (let i = 0; i < uniqueVideos.length; i += chunkSize) {
    const chunk = uniqueVideos.slice(i, i + chunkSize);
    console.log(`📦 インサート中... ${i + 1} から ${i + chunk.length} 件目`);
    
    const { error } = await supabase
      .from("videos")
      .upsert(chunk, { onConflict: "youtube_video_id" });

    if (error) {
      console.error("❌ インサート中にエラーが発生しました:", error);
      return;
    }
  }
  
  console.log("✅ 全件インポートが大成功しました！");
}

main();
