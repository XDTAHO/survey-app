/**
 * /api/config
 * 處理 GET 請求：取得問卷設定檔
 */
export async function onRequestGet(context) {
  // 1. 從環境變數取得 GAS 網址
  const GAS_URL = context.env.GAS_API_URL;

  if (!GAS_URL) {
    return new Response(JSON.stringify({ error: "GAS_API_URL not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 2. 向 GAS 發送請求
    const response = await fetch(GAS_URL);
    
    // 3. 檢查 GAS 是否回傳正常
    if (!response.ok) {
      throw new Error(`GAS responded with ${response.status}`);
    }

    const data = await response.json();

    // 4. 回傳給前端，並設定 CDN 快取 (Cache-Control)
    // s-maxage=300: Cloudflare CDN 快取 300秒 (5分鐘)
    // max-age=60: 使用者瀏覽器快取 60秒
    // 這樣就算有 1000 人同時打開網頁，5分鐘內 GAS 只會收到 1 次請求
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, s-maxage=300" 
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
