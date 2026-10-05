// utils/request.js

// 流式接口基础地址
const basePath = "/api/travel";

/* ==================== 流式接口（AI 对话用）==================== */
export async function fetchStream(
  url,
  data,
  onChunk,
  onComplete,
  onError = () => {},
) {
  const controller = new AbortController();
  const cleanUrl = url.replace(/^\/+/, "");

  try {
    const response = await fetch(`${basePath}/${cleanUrl}`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    if (!response.ok) {
      let msg = `HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        msg = errBody.message || errBody.error || msg;
      } catch {}
      throw new Error(msg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line) continue;

        const raw = line.startsWith("data:") ? line.slice(5).trim() : line;
        if (!raw || raw === "[DONE]") continue;

        try {
          const jsonData = JSON.parse(raw);
          if (jsonData.type === "chunk") {
            onChunk(jsonData.content);
          } else if (jsonData.done) {
            onComplete();
          } else if (jsonData.error) {
            onError(jsonData.error);
          }
        } catch (e) {
          console.warn("[fetchStream] 解析失败的行 =", raw, e);
        }
      }
    }
  } catch (err) {
    if (err.name === "AbortError") return;
    onError(err);
  }

  return () => controller.abort();
}

/* ==================== 普通接口（推荐行程用）==================== */
/**
 * 普通 POST 请求，一次性返回完整 JSON
 * @param {string} url - 相对路径，如 "/recommend"
 * @param {object} data - 请求体
 * @returns {Promise<any>} 已解包后的业务数据
 */
export async function fetchJson(url, data) {
  const cleanUrl = url.replace(/^\/+/, "");

  const response = await fetch(`${basePath}/${cleanUrl}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const errBody = await response.json();
      msg = errBody.message || errBody.error || msg;
    } catch {}
    throw new Error(msg);
  }

  const result = await response.json();
  console.log("[fetchJson] 后端原始返回:", result);

  // 统一解包后端包装：{ code, data, message, error }
  if (result && typeof result === "object" && "code" in result) {
    if (result.code !== 200) {
      throw new Error(
        result.message || result.error || `业务错误 code=${result.code}`,
      );
    }
    return result.data;
  }

  return result;
}
