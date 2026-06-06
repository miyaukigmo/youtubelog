"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// 1. Supabaseから動画一覧を取得するアクション (無限スクロール＆絞り込み・ソート・検索対応)
export async function getVideosAction(
  page: number = 0, 
  limit: number = 50, 
  category: string = "すべて",
  sortOrder: "desc" | "asc" = "desc",
  searchQuery: string = "",
  dateFilter: string = "",
  onlyStarred: boolean = false
) {
  let query = supabase
    .from("videos")
    .select("*")
    .order("viewed_at", { ascending: sortOrder === "asc" })
    .range(page * limit, (page + 1) * limit - 1);

  // カテゴリが指定されている場合は絞り込む
  if (category !== "すべて") {
    query = query.eq("category_name", category);
  }

  // 検索キーワードがある場合はタイトルかチャンネル名で検索
  if (searchQuery.trim() !== "") {
    query = query.or(`title.ilike.%${searchQuery}%,channel_name.ilike.%${searchQuery}%`);
  }

  // 日付が指定されている場合はその1日の範囲で絞り込む
  if (dateFilter && dateFilter !== "") {
    const startDate = `${dateFilter}T00:00:00.000Z`;
    const endDate = `${dateFilter}T23:59:59.999Z`;
    query = query.gte("viewed_at", startDate).lte("viewed_at", endDate);
  }

  // お気に入りのみ指定がある場合は絞り込む
  if (onlyStarred) {
    query = query.eq("is_starred", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("動画の取得に失敗しました:", error);
    return [];
  }
  return data;
}

// 存在するカテゴリの一覧を返すアクション（固定リスト）
export async function getCategoriesAction() {
  return [
    "エンタメ", "音楽", "ゲーム", "映画とアニメ", "自動車と乗り物", 
    "ペットと動物", "スポーツ", "旅行とイベント", "ブログ", "コメディー", 
    "ニュースと政治", "ハウツーとスタイル", "教育", "科学と技術", 
    "非営利団体と社会活動", "未分類"
  ];
}

// 全件数を正確に取得するアクション
export async function getVideoCountAction() {
  const { count, error } = await supabase
    .from("videos")
    .select("*", { count: 'exact', head: true });

  if (error) {
    console.error("件数の取得に失敗しました:", error);
    return 0;
  }
  return count || 0;
}

// 2. スターの状態を切り替えるアクション
export async function toggleStarAction(id: string, currentStatus: boolean) {
  const { error } = await supabase
    .from("videos")
    .update({ is_starred: !currentStatus })
    .eq("id", id);

  if (error) {
    console.error("スターの切り替えに失敗しました:", error);
    throw new Error("Failed to update star");
  }
  
  // 更新後、ページを再描画（リロードなしでUIを最新化）
  revalidatePath("/");
}

// 3. 動画データを新規保存するアクション（YouTube連携時に使用）
export async function addVideoAction(videoData: {
  youtube_video_id: string;
  title: string;
  channel_name: string;
  thumbnail_url: string;
  category_name: string;
  duration: string;
}) {
  const { error } = await supabase
    .from("videos")
    .insert([{
      youtube_video_id: videoData.youtube_video_id,
      title: videoData.title,
      channel_name: videoData.channel_name,
      thumbnail_url: videoData.thumbnail_url,
      category_name: videoData.category_name,
      duration: videoData.duration,
      progress: 0,
      is_starred: false,
    }]);

  if (error) {
    console.error("動画の保存に失敗しました:", error);
    throw new Error("Failed to save video");
  }

  revalidatePath("/");
}

// 4. 日付ごとの視聴件数を取得するアクション（ヒートマップ用）
export async function getDailyCountsAction() {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 100); // 余裕を見て過去100日分取得

  const { data, error } = await supabase
    .from("videos")
    .select("viewed_at")
    .gte("viewed_at", pastDate.toISOString());

  if (error) {
    console.error("日別データの取得に失敗しました:", error);
    return [];
  }

  // タイムゾーンによる日付ズレを防ぐため、集計はクライアント側で行う
  // ここでは viewed_at の配列だけを返す
  return data.map(row => row.viewed_at).filter(Boolean);
}
