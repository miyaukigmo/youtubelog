// YouTubeはSPA（シングルページアプリケーション）なので、URLの変更を検知する
let lastUrl = location.href;

function recordVideo() {
  const url = new URL(location.href);
  if (!url.pathname.startsWith('/watch')) return;

  const videoId = url.searchParams.get('v');
  if (!videoId) return;

  // DOMの読み込みを少し待つ（タイトルやチャンネル名がレンダリングされるため）
  setTimeout(() => {
    const titleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
    const channelElement = document.querySelector('#owner-name a');
    
    // タイトルが取得できなければタブのタイトルを代用
    const title = titleElement ? titleElement.textContent : document.title.replace(' - YouTube', '');
    const channelName = channelElement ? channelElement.textContent : "Unknown Channel";

    console.log(`[YouTubeLog] 視聴を記録中... ID: ${videoId}, Title: ${title}`);

    // ローカルサーバー（本番時はVercelのURLに変更する）にデータを送信
    // 注意: ダッシュボードアプリの npm run dev が動いている必要があります
    fetch('http://localhost:3000/api/record', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        youtube_video_id: videoId,
        title: title,
        channel_name: channelName,
        duration: "--:--"
      })
    })
    .then(res => res.json())
    .then(data => console.log('[YouTubeLog] 記録成功:', data))
    .catch(err => console.error('[YouTubeLog] 記録エラー:', err));
  }, 3000); // 3秒待つ
}

// 初回ロード時
recordVideo();

// YouTube内のページ遷移を監視
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    recordVideo();
  }
}).observe(document, { subtree: true, childList: true });
