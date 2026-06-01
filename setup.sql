-- videos テーブルの作成
create table videos (
  id uuid default gen_random_uuid() primary key,
  youtube_video_id text not null unique, -- YouTubeの動画ID (例: dQw4w9WgXcQ)
  title text not null,
  channel_name text not null,
  thumbnail_url text not null,
  category_name text not null, -- ジャンル推定やカスタムタグ用
  duration text not null, -- 動画の長さ (例: "15:30")
  progress integer default 0, -- 視聴進捗 (0-100)
  is_starred boolean default false, -- スター有無
  viewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- アクセス権限の設定 (RLS)
-- ※今回はテスト用として、誰でもデータの読み書きができるように設定します。
alter table videos enable row level security;
create policy "Enable all access for now" on videos for all using (true) with check (true);
