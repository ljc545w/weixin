/**
 * weixin 消息发送模块
 */

import type { ResolvedWeixinAccount } from "./types.js";
import {
  MessageResponse,
  sendTextMessage
} from "./api.js";

export interface OutboundContext {
  to: string;
  text: string;
  accountId?: string | null;
  replyToId?: string | null;
  messageId: string;
  account: ResolvedWeixinAccount;
  replyUrl: string;
}

export interface MediaOutboundContext extends OutboundContext {
  mediaUrl: string;
}

export interface OutboundResult {
  channel: string;
  messageId?: string;
  timestamp?: string | number;
  error?: string;
}

/**
 * 解析目标地址
 */
function parseTarget(to: string): { type: "c2c" | "chatRoom"; id: string } {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [weixin] parseTarget: input=${to}`);
  
  let id = to;
  
  if (id.startsWith("wxid_")) {
    return { type: "c2c", id: id };
  }
  
  if (id.endsWith("@chatroom")) {
    return { type: "chatRoom", id: id };
  }
  
  return { type: "c2c", id };
}

/**
 * 发送文本消息
 */
export async function sendText(ctx: OutboundContext): Promise<OutboundResult> {
  const { to, account } = ctx;
  let { text, replyToId } = ctx;

  console.log("[weixin] sendText ctx:", JSON.stringify({ to, text: text?.slice(0, 50), replyToId, accountId: account.accountId }, null, 2));

  try {
    const target = parseTarget(to);
    let replyUrl = `${ctx.replyUrl}`;
    console.log("[weixin] sendText target:", JSON.stringify(target));
    let result = {} as MessageResponse;
    if(target.type === "c2c"){
      result = await sendTextMessage(account.accountId, replyUrl, target.id, text);
    }else{
      // 后续可以使用引用消息进行回复
      result = await sendTextMessage(account.accountId, replyUrl, target.id, text);
    }
    return { channel: "weixin", messageId: result.id, timestamp: result.timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { channel: "weixin", error: message };
  }
}