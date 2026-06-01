import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "AIzaSyBgp1BL196tiz_aQgbeOsVmFUHvVozSeAw";

const CATEGORY_MAP: Record<string, string> = {
  "1": "映画とアニメ", "2": "自動車と乗り物", "10": "音楽", "15": "ペットと動物",
  "17": "スポーツ", "19": "旅行とイベント", "20": "ゲーム", "22": "ブログ",
  "23": "コメディー", "24": "エンタメ", "25": "ニュースと政治", "26": "ハウツーとスタイル",
  "27": "教育", "28": "科学と技術", "29": "非営利団体と社会活動"
};

// YouTubeの動画時間(PT1H2M3S)を hh:mm:ss 形式にパースする関数
function parseDuration(duration: string) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "--:--";
  const h = (match[1] || '').replace('H', '');
  const m = (match[2] || '').replace('M', '');
  const s = (match[3] || '').replace('S', '');
  let formatted = "";
  if (h) formatted += `${h}:`;
  formatted += `${m ? m.padStart(2, '0') : '00'}:`;
  formatted += s ? s.padStart(2, '0') : '00';
  return formatted;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const videoId = data.youtube_video_id;
    
    if (!videoId) {
      return NextResponse.json({ success: false, error: "Missing video ID" }, { status: 400 });
    }

    // サーバー側でYouTube APIを叩いて正確な情報を取得する！
    const ytRes = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`);
    const ytData = await ytRes.json();
    
    if (!ytData.items || ytData.items.length === 0) {
      return NextResponse.json({ success: false, error: "Video not found on YouTube" }, { status: 404 });
    }

    const snippet = ytData.items[0].snippet;
    const contentDetails = ytData.items[0].contentDetails;
    const categoryName = CATEGORY_MAP[snippet.categoryId] || "その他";

    const { error } = await supabase
      .from("videos")
      .upsert([{
        youtube_video_id: videoId,
        title: snippet.title,                     // APIから取得した正確なタイトル
        channel_name: snippet.channelTitle,       // APIから取得した正確なチャンネル名
        category_name: categoryName,              // APIから取得した正確なジャンル！
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        duration: parseDuration(contentDetails.duration),
        progress: 100, // 新規追加分は視聴済み(100)とする
        is_starred: false,
        viewed_at: new Date().toISOString(),
      }], { onConflict: "youtube_video_id" });

    if (error) throw error;

    return NextResponse.json(
      { success: true, message: `Saved: ${snippet.title}` },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
