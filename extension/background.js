chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "RECORD_VIDEO") {
    // バックグラウンドで代わりにVercelへfetchを実行する（CORSを回避）
    fetch('https://youtubelog.vercel.app/api/record', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.data)
    })
    .then(res => res.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(err => sendResponse({ success: false, error: err.toString() }));
    
    // 非同期でsendResponseを呼ぶためにtrueを返す
    return true;
  }
});
