import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// 環境変数の読み込み
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// みやしたさんが取得してくれたYouTube APIキー
const YOUTUBE_API_KEY = "AIzaSyBgp1BL196tiz_aQgbeOsVmFUHvVozSeAw";

// YouTubeのカテゴリIDと日本語名のマッピング辞書
const CATEGORY_MAP: Record<string, string> = {
  "1": "映画とアニメ",
  "2": "自動車と乗り物",
  "10": "音楽",
  "15": "ペットと動物",
  "17": "スポーツ",
  "19": "旅行とイベント",
  "20": "ゲーム",
  "22": "ブログ",
  "23": "コメディー",
  "24": "エンタメ",
  "25": "ニュースと政治",
  "26": "ハウツーとスタイル",
  "27": "教育",
  "28": "科学と技術",
  "29": "非営利団体と社会活動"
};

async function main() {
  console.log("🚀 ジャンル自動更新を開始します...");

  // 未分類の動画をデータベースから取得
  let allUncategorized: any[] = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from("videos")
      .select("id, youtube_video_id")
      .eq("category_name", "未分類")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("データ取得エラー:", error);
      return;
    }

    if (!data || data.length === 0) break;
    allUncategorized = allUncategorized.concat(data);
    page++;
  }

  console.log(`🔍 未分類の動画が見つかりました: ${allUncategorized.length} 件`);
  
  if (allUncategorized.length === 0) {
    console.log("🎉 すべてジャンル分け済みです！完璧！");
    return;
  }

  // YouTube APIの制限に合わせて50件ずつリクエスト
  const chunkSize = 50;
  let successCount = 0;

  for (let i = 0; i < allUncategorized.length; i += chunkSize) {
    const chunk = allUncategorized.slice(i, i + chunkSize);
    const ids = chunk.map(v => v.youtube_video_id).join(',');

    try {
      const res = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${ids}&key=${YOUTUBE_API_KEY}`);
      const data = await res.json();
      
      if (data.error) {
         console.error("❌ YouTube API エラー:", data.error.message);
         if (data.error.code === 403) {
            console.log("⚠️ APIの制限に達した可能性があります。今日はここまでにします！");
            break;
         }
         continue; 
      }

      // APIからのレスポンスをもとに更新処理の配列を作成
      const updatePromises = (data.items || []).map((item: any) => {
        const videoId = item.id;
        const categoryId = item.snippet.categoryId;
        const categoryName = CATEGORY_MAP[categoryId] || "その他";
        
        // Supabaseを1件ずつ更新 (並列処理)
        return supabase
          .from("videos")
          .update({ category_name: categoryName })
          .eq("youtube_video_id", videoId);
      });

      // 50件を一気に更新実行
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        successCount += updatePromises.length;
        console.log(`✅ ${i + 1}〜${i + chunk.length}件目のジャンル付け完了！ (成功合計: ${successCount}件)`);
      }
    } catch (e) {
      console.error("通信エラー:", e);
    }
  }

  console.log(`✨ 今回の処理で ${successCount} 件のジャンル分けが完了しました！`);
}

main();
