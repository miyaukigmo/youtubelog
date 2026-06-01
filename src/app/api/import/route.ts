import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Takeoutデータの簡単なパースと整形
    const videosToInsert = data
      .filter((item: any) => item.titleUrl && item.titleUrl.includes('watch?v='))
      .map((item: any) => {
        // URLから動画IDを抽出 (例: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
        const videoIdMatch = item.titleUrl.match(/v=([^&]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        
        // Takeoutのタイトルは「Watched [元のタイトル]」になっていることが多いので置換
        const title = item.title.replace(/^Watched /, ""); 
        const channelName = item.subtitles?.[0]?.name || "Unknown Channel";
        
        return {
          youtube_video_id: videoId,
          title: title,
          channel_name: channelName,
          // 動画IDが分かれば、YouTube標準のサムネイルURLを自動生成できる！
          thumbnail_url: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : "",
          category_name: "未分類", // 初期値
          duration: "--:--", // APIで取得するまではプレースホルダー
          viewed_at: item.time,
          progress: 100, // 履歴にあるものは一旦視聴済み(100)とする
          is_starred: false,
        };
      })
      .filter((item: any) => item.youtube_video_id !== null); // IDが取れなかったものは除外

    // 同じ動画を複数回見ている場合があるため、動画IDベースで重複を除外
    const uniqueVideos = Array.from(new Map(videosToInsert.map((item: any) => [item.youtube_video_id, item])).values());

    // 1万件とかを一気にインサートするとSupabaseがパンクするので、一旦最新の1000件に絞る
    const chunkToInsert = (uniqueVideos as any[]).slice(0, 1000);

    // Supabaseに一括登録 (同じ動画IDがあれば更新するupsert)
    const { error } = await supabase
      .from("videos")
      .upsert(chunkToInsert, { onConflict: "youtube_video_id" });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, count: chunkToInsert.length });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
