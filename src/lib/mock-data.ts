export type Video = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  category: string;
  duration: string;
  progress: number; // 0 to 100
  isStarred: boolean;
  viewedAt: string; // ISO date string
};

export const categories = ["エンタメ", "音楽", "勉強/テック", "ゲーム", "ライフスタイル"];

export const mockVideos: Video[] = [
  {
    id: "v1",
    title: "Next.js App Routerの完全理解ガイド",
    channel: "Tech Channel",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=280&fit=crop",
    category: "勉強/テック",
    duration: "1:20:05",
    progress: 100,
    isStarred: false,
    viewedAt: "2026-06-01T10:00:00Z",
  },
  {
    id: "v2",
    title: "最高にリラックスできるLo-Fi Hip Hop",
    channel: "Chill Vibes",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=280&fit=crop",
    category: "音楽",
    duration: "2:00:00",
    progress: 45,
    isStarred: true,
    viewedAt: "2026-06-01T12:30:00Z",
  },
  {
    id: "v3",
    title: "買ってよかった！デスク周りの神アイテム10選",
    channel: "Gadget Review",
    thumbnail: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=500&h=280&fit=crop",
    category: "ライフスタイル",
    duration: "15:30",
    progress: 100,
    isStarred: false,
    viewedAt: "2026-05-31T20:00:00Z",
  },
  {
    id: "v4",
    title: "絶対に笑ってはいけない〇〇総集編",
    channel: "Comedy TV",
    thumbnail: "https://images.unsplash.com/photo-1543269664-7eef42226a21?w=500&h=280&fit=crop",
    category: "エンタメ",
    duration: "45:12",
    progress: 10,
    isStarred: true,
    viewedAt: "2026-05-31T22:15:00Z",
  },
  {
    id: "v5",
    title: "新作RPG 先行プレイ＆レビュー！",
    channel: "Game Master",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&h=280&fit=crop",
    category: "ゲーム",
    duration: "28:40",
    progress: 100,
    isStarred: false,
    viewedAt: "2026-05-30T18:00:00Z",
  },
  {
    id: "v6",
    title: "React Hooksを使いこなすための5つのコツ",
    channel: "Frontend Hero",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=280&fit=crop",
    category: "勉強/テック",
    duration: "22:15",
    progress: 0,
    isStarred: true,
    viewedAt: "2026-05-30T10:00:00Z",
  },
  {
    id: "v7",
    title: "朝のルーティン - 生産性を最大化する過ごし方",
    channel: "Life Hacker",
    thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&h=280&fit=crop",
    category: "ライフスタイル",
    duration: "12:05",
    progress: 100,
    isStarred: false,
    viewedAt: "2026-05-29T08:30:00Z",
  },
  {
    id: "v8",
    title: "神作画アニメのOP集めました",
    channel: "Anime Fan",
    thumbnail: "https://images.unsplash.com/photo-1580477659142-8874ee303e48?w=500&h=280&fit=crop",
    category: "エンタメ",
    duration: "18:20",
    progress: 100,
    isStarred: false,
    viewedAt: "2026-05-29T21:00:00Z",
  }
];

export const generateMockVideos = (count: number): Video[] => {
  const videos: Video[] = [];
  const baseVideos = mockVideos;
  for (let i = 0; i < count; i++) {
    const base = baseVideos[i % baseVideos.length];
    videos.push({
      ...base,
      id: `generated_v${i}`,
      title: `${base.title} (動画 ${i + 1})`,
      viewedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // 過去30日間のランダムな日付
      isStarred: Math.random() > 0.8,
      progress: Math.random() > 0.7 ? 100 : (Math.random() > 0.5 ? Math.floor(Math.random() * 99) + 1 : 0),
    });
  }
  // 日付が新しい順にソート
  return videos.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
};
