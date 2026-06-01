"use client";

import { useRef, useTransition, useState, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, PlayCircle, Loader2, Search, ArrowUpDown, Calendar, X } from "lucide-react";
import { toggleStarAction, getVideosAction } from "@/actions/video-actions";

export type DbVideo = {
  id: string;
  youtube_video_id: string;
  title: string;
  channel_name: string;
  thumbnail_url: string;
  category_name: string;
  duration: string;
  progress: number;
  is_starred: boolean;
  viewed_at: string;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "音楽": return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200";
    case "ゲーム": return "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200";
    case "エンタメ": return "bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200";
    case "映画とアニメ": return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200";
    case "スポーツ": return "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200";
    case "科学と技術": return "bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-200";
    case "教育": return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200";
    case "未分類": return "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400";
    default: return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
  }
};

export default function VideoList({ initialVideos, categories }: { initialVideos: DbVideo[], categories: string[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  
  const [items, setItems] = useState<DbVideo[]>(initialVideos);
  const [selectedCategory, setSelectedCategory] = useState<string>("すべて");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [onlyStarred, setOnlyStarred] = useState<boolean>(false);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const rowVirtualizer = useVirtualizer({
    count: hasMore ? items.length + 1 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  });

  // リセットして再フェッチする共通関数
  const resetAndFetch = async (
    cat: string, 
    sort: "desc" | "asc", 
    search: string, 
    dateFilter: string, 
    starred: boolean
  ) => {
    setIsFetching(true);
    setHasMore(true);
    setPage(0);
    setItems([]);
    try {
      const newVideos = await getVideosAction(0, 50, cat, sort, search, dateFilter, starred);
      setItems(newVideos);
      if (newVideos.length < 50) setHasMore(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetching(false);
    }
  };

  // 無限スクロールの追加フェッチ
  const fetchMore = async () => {
    setIsFetching(true);
    const nextPage = page + 1;
    try {
      const newVideos = await getVideosAction(nextPage, 50, selectedCategory, sortOrder, activeSearchQuery, selectedDate, onlyStarred);
      if (newVideos.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newVideos]);
        setPage(nextPage);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setIsFetching(false);
    }
  };

  // スクロール検知
  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    if (virtualItems.length === 0) return;
    const lastItem = virtualItems[virtualItems.length - 1];
    if (lastItem.index >= items.length - 1 && hasMore && !isFetching) {
      fetchMore();
    }
  }, [rowVirtualizer.getVirtualItems(), hasMore, isFetching, items.length]);

  // アクションハンドラ
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    resetAndFetch(cat, sortOrder, activeSearchQuery, selectedDate, onlyStarred);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as "desc" | "asc";
    setSortOrder(newSort);
    resetAndFetch(selectedCategory, newSort, activeSearchQuery, selectedDate, onlyStarred);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    resetAndFetch(selectedCategory, sortOrder, activeSearchQuery, newDate, onlyStarred);
  };
  
  const handleClearDate = () => {
    setSelectedDate("");
    resetAndFetch(selectedCategory, sortOrder, activeSearchQuery, "", onlyStarred);
  };

  const handleStarredToggle = () => {
    const newStarred = !onlyStarred;
    setOnlyStarred(newStarred);
    resetAndFetch(selectedCategory, sortOrder, activeSearchQuery, selectedDate, newStarred);
  };

  const handleSearch = () => {
    setActiveSearchQuery(searchInput);
    resetAndFetch(selectedCategory, sortOrder, searchInput, selectedDate, onlyStarred);
  };

  const handleToggleStar = (id: string, currentStatus: boolean) => {
    startTransition(() => {
      toggleStarAction(id, currentStatus);
      // DB更新に合わせてローカルのStateも即座に更新する（楽観的UI）
      setItems(prev => prev.map(v => v.id === id ? { ...v, is_starred: !currentStatus } : v));
      
      // もし「お気に入りのみ」表示モードの時にスターを外したら、リストから即座に消すかどうかの判断
      // （今回は操作ミスを考慮して即座には消さず、見た目だけグレーアウトするか、そのままにしておく方が安全）
    });
  };

  return (
    <div className="space-y-3">
      {/* 検索・ソート・フィルターUI */}
      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="タイトルやチャンネル名で検索..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* 日付フィルター */}
          <div className="relative flex-1 sm:w-auto sm:min-w-[140px] flex items-center">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <input 
              type="date"
              value={selectedDate} 
              onChange={handleDateChange}
              className="w-full pl-9 pr-8 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm cursor-pointer"
            />
            {selectedDate && (
              <button 
                onClick={handleClearDate}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full bg-muted/50 hover:bg-muted"
                title="日付指定を解除"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* ソート */}
          <div className="relative flex-1 sm:w-auto sm:min-w-[130px]">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select 
              value={sortOrder} 
              onChange={handleSortChange}
              className="w-full pl-9 pr-8 py-2 bg-background border border-border rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm cursor-pointer"
            >
              <option value="desc">新しい順</option>
              <option value="asc">古い順</option>
            </select>
          </div>
          
          {/* お気に入りトグル */}
          <button
            onClick={handleStarredToggle}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-all shadow-sm ${
              onlyStarred 
                ? "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900" 
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <Star className={`w-4 h-4 ${onlyStarred ? "fill-yellow-500 text-yellow-500" : ""}`} />
            <span className="hidden sm:inline">お気に入り</span>
          </button>
        </div>
      </div>

      {/* ジャンルフィルタリングUI */}
      <div className="flex gap-2 overflow-x-auto pb-1 snap-x scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 snap-start border ${
              selectedCategory === cat 
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm" 
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col h-[600px] relative">
        {isFetching && items.length === 0 && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-3 bg-muted/50 text-xs font-medium text-muted-foreground border-b border-border/50 shrink-0 pr-4">
          <div className="w-10 text-center">状態</div>
          <div>タイトル</div>
          <div className="w-24">ジャンル</div>
          <div className="w-24 text-right">視聴日</div>
          <div className="w-10"></div>
        </div>
        
        <div ref={parentRef} className="flex-1 overflow-auto divide-y divide-border/50">
          {items.length === 0 && !isFetching ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm space-y-2">
              <Search className="w-8 h-8 opacity-20" />
              <p>条件に一致する動画が見つかりませんでした😢</p>
            </div>
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                if (virtualRow.index >= items.length) {
                  return (
                    <div
                      key="loader"
                      className="flex justify-center items-center p-4 absolute top-0 left-0 w-full"
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  );
                }

                const video = items[virtualRow.index];
                return (
                  <div
                    key={video.id}
                    className="group grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-3 items-center hover:bg-muted/30 transition-colors absolute top-0 left-0 w-full"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="w-10 flex justify-center text-muted-foreground">
                      {video.progress === 100 ? (
                        <PlayCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      {/* YouTube直リンクに変更 */}
                      <a 
                        href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm truncate hover:text-blue-500 hover:underline block transition-colors" 
                        title={video.title}
                      >
                        {video.title}
                      </a>
                      <p className="text-xs text-muted-foreground truncate mt-0.5" title={video.channel_name}>{video.channel_name}</p>
                    </div>
                    <div className="w-24 flex items-center">
                      <Badge variant="secondary" className={`font-medium text-[10px] truncate border-transparent ${getCategoryColor(video.category_name)}`}>
                        {video.category_name}
                      </Badge>
                    </div>
                    <div className="w-24 text-right text-xs text-muted-foreground">
                      {new Date(video.viewed_at).toLocaleDateString()}
                    </div>
                    <div className="w-10 flex justify-center z-10">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleStar(video.id, video.is_starred);
                        }}
                        className={`p-1 rounded-md transition-opacity cursor-pointer ${video.is_starred ? 'opacity-100 text-yellow-500' : 'opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-muted'}`}
                      >
                        <Star className={`w-4 h-4 ${video.is_starred ? 'fill-yellow-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
