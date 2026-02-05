/**
 * /api/submit
 * 處理 POST 請求：轉發問卷資料到 GAS
 */
export async function onRequestPost(context) {
  const GAS_URL = context.env.GAS_API_URL;

  if (!GAS_URL) {
    return new Response(JSON.stringify({ error: "GAS_API_URL not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 1. 取得前端傳來的 JSON
    const payload = await context.request.json();

    // 2. 轉發給 GAS
    // Cloudflare 的 fetch 預設會自動跟隨 redirect (follow)，
    // 所以我們不需要寫額外的程式碼來處理 302，它會自動追到底。
    const gasResponse = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // 3. 讀取 GAS 最終回傳的結果
    const resultText = await gasResponse.text();
    
    // 嘗試解析 JSON，如果 GAS 噴 HTML 錯誤頁面，這裡會擋下來
    let resultJson;
    try {
      resultJson = JSON.parse(resultText);
    } catch (e) {
      // 萬一 GAS 回傳的不是 JSON (例如 Google 的錯誤 HTML)
      throw new Error("Invalid response from GAS: " + resultText.substring(0, 100));
    }

    // 4. 回傳乾淨的 JSON 給前端
    return new Response(JSON.stringify(resultJson), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 502, // Bad Gateway
      headers: { "Content-Type": "application/json" }
    });
  }
}