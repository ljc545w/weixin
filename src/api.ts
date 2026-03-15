/**
 * 获取全局唯一的消息序号（范围 0 ~ 65535）
 * 使用毫秒级时间戳低位 + 随机数异或混合，无状态，避免碰撞
 */
export function getNextMsgSeq(_msgId: string): number {
  const timePart = Date.now() % 100000000; // 毫秒时间戳后8位
  const random = Math.floor(Math.random() * 65536); // 0~65535
  return (timePart ^ random) % 65536; // 异或混合后限制在 0~65535
}

// API 请求超时配置（毫秒）
const DEFAULT_API_TIMEOUT = 30000; // 默认 30 秒

/**
 * API 请求封装
 */
export async function apiRequest<T = unknown>(
  serverAddress: string,
  method: string,
  path: string,
  body?: unknown,
  timeoutMs?: number
): Promise<T> {
  const url = `${serverAddress}${path}`;
  
  const timeout = timeoutMs || DEFAULT_API_TIMEOUT;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  
  const options: RequestInit = {
    method,
    headers: {},
    signal: controller.signal,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  // 打印请求信息
  console.log(`[weixin-api] >>> ${method} ${url} (timeout: ${timeout}ms)`);
  if (body) {
    const logBody = { ...body } as Record<string, unknown>;
    if (typeof logBody.file_data === "string") {
      logBody.file_data = `<base64 ${(logBody.file_data as string).length} chars>`;
    }
  }

  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      console.error(`[weixin-api] <<< Request timeout after ${timeout}ms`);
      throw new Error(`Request timeout[${path}]: exceeded ${timeout}ms`);
    }
    console.error(`[weixin-api] <<< Network error:`, err);
    throw new Error(`Network error [${path}]: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timeoutId);
  }

  const responseHeaders: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });
  console.log(`[weixin-api] <<< Status: ${res.status} ${res.statusText}`);

  let data: T;
  let rawBody: string;
  try {
    rawBody = await res.text();
    data = JSON.parse(rawBody) as T;
  } catch (err) {
    throw new Error(`Failed to parse response[${path}]: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!res.ok) {
    const error = data as { message?: string; code?: number };
    throw new Error(`API Error [${path}]: ${error.message ?? JSON.stringify(data)}`);
  }

  return data;
}

export interface MessageResponse {
  id: string;
  timestamp: number | string;
}

export async function sendTextMessage(
  accountId: string,
  replyUrl: string,
  replyToId: string,
  content: string,
): Promise<MessageResponse> {
  let json = {
    accountId: accountId,
    userName: replyToId,
    content: content
  }
  return apiRequest(`${replyUrl}`, "POST", `sendText/`, json);
}