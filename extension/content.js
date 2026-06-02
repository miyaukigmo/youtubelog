// YouTubeはSPA（シングルページアプリケーション）なので、URLの変更を検知する
let lastUrl = location.href;

let currentTimer = null; // タイマーの重複を防ぐための変数

function recordVideo() {
  const url = new URL(location.href);
  console.log(`[YouTubeLog] 🚀 検知: URLが変更されました (${url.href})`);

  if (!url.pathname.startsWith('/watch')) {
    console.log(`[YouTubeLog] ⏭️ スキップ: 動画ページではありません`);
    return;
  }

  const videoId = url.searchParams.get('v');
  if (!videoId) {
    console.log(`[YouTubeLog] ❌ エラー: videoIdが見つかりません`);
    return;
  }

  // 既存のタイマーがあれば止める（重複実行防止）
  if (currentTimer) clearInterval(currentTimer);

  let attempts = 0;
  const maxAttempts = 20; // 0.5秒 x 20回 = 最大10秒まで待つ

  console.log(`[YouTubeLog] ⏱️ 監視開始: タイトル表示を待ちます... (VideoID: ${videoId})`);

  // 0.5秒おきにタイトルが表示されたかチェックする
  currentTimer = setInterval(() => {
    attempts++;
    const titleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
    const channelElement = document.querySelector('#owner-name a');
    
    // タイトルが表示されたか、または10秒経過して諦めた場合に処理を進める
    if (titleElement || attempts >= maxAttempts) {
      clearInterval(currentTimer); // 監視タイマーをストップ

      // タイトルが取得できなければタブのタイトルを代用
      const title = titleElement ? titleElement.textContent : document.title.replace(' - YouTube', '');
      const channelName = channelElement ? channelElement.textContent : "Unknown Channel";

      console.log(`[YouTubeLog] 📤 送信開始... ID: ${videoId}, Title: ${title}`);

      // バックグラウンド（background.js）におつかいを頼む
      chrome.runtime.sendMessage({
        type: "RECORD_VIDEO",
        data: {
          youtube_video_id: videoId,
          title: title,
          channel_name: channelName,
          duration: "--:--"
        }
      }, (response) => {
        if (response && response.success) {
          console.log('[YouTubeLog] ✅ 記録成功:', response.data);
        } else {
          console.error('[YouTubeLog] ❌ 記録エラー:', response ? response.error : chrome.runtime.lastError);
        }
      });
    }
  }, 500); // 0.5秒ごとにチェック
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
