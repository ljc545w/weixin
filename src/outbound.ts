/**
 * weixin 消息发送模块
 */

import type { ResolvedWeixinAccount, WeixinMessage, WeixinReferenceMessage } from "./types.js";
import {
  MessageResponse,
  sendTextMessage,
  sendQuoteMessage,
  sendImageMessage,
  sendFileMessage,
  sendEmojiMessage,
  sendPatMessage
} from "./api.js";

export interface OutboundContext {
  to: string;
  text: string;
  account: ResolvedWeixinAccount;
  replyUrl: string;
  accountId?: string | null;
  replyToId?: string | null;
  messageId?: string;
  message?: WeixinMessage;
  attachment?: string;
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
    if(target.type === "c2c" || !ctx.message){
      result = await sendTextMessage(account.accountId, replyUrl, target.id, text);
    }else{
      let referMsg = {
        msgType: ctx.message.type,
        content: ctx.message.content,
        createTime: ctx.message.createTime,
        msgSvrId: ctx.message.szMsgSvrId,
        userName: ctx.message.realUserName
      } as WeixinReferenceMessage;
      result = await sendQuoteMessage(account.accountId, replyUrl, target.id, text, referMsg);
    }
    return { channel: "weixin", messageId: result.id, timestamp: result.timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log("[weixin] sendText error:", message);
    return { channel: "weixin", error: message };
  }
}

/**
 * 发送图片消息
 */
export async function sendImage(ctx: OutboundContext): Promise<OutboundResult> {
  const { to, account } = ctx;
  let { attachment, replyToId } = ctx;
  if (!attachment) {
    return { channel: "weixin", error: "No attachment provided for image message" };
  }

  console.log("[weixin] sendImage ctx:", JSON.stringify({ to, replyToId, accountId: account.accountId }, null, 2));

  try {
    const target = parseTarget(to);
    let replyUrl = `${ctx.replyUrl}`;
    console.log("[weixin] sendImage target:", JSON.stringify(target));
    let result = {} as MessageResponse;
    if(target.type === "c2c" || !ctx.message){
      result = await sendImageMessage(account.accountId, replyUrl, target.id, attachment);
    }else{
      let referMsg = {
        msgType: ctx.message.type,
        content: ctx.message.content,
        createTime: ctx.message.createTime,
        msgSvrId: ctx.message.szMsgSvrId,
        userName: ctx.message.realUserName
      } as WeixinReferenceMessage;
      result = await sendImageMessage(account.accountId, replyUrl, target.id, attachment, referMsg);
    }
    return { channel: "weixin", messageId: result.id, timestamp: result.timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log("[weixin] sendImage error:", message);
    return { channel: "weixin", error: message };
  }
}

/**
 * 发送文件消息
 */
export async function sendFile(ctx: OutboundContext): Promise<OutboundResult> {
  const { to, account } = ctx;
  let { attachment, replyToId } = ctx;
  if (!attachment) {
    return { channel: "weixin", error: "No attachment provided for file message" };
  }

  console.log("[weixin] sendFile ctx:", JSON.stringify({ to, replyToId, accountId: account.accountId }, null, 2));

  try {
    const target = parseTarget(to);
    let replyUrl = `${ctx.replyUrl}`;
    console.log("[weixin] sendFile target:", JSON.stringify(target));
    let result = {} as MessageResponse;
    if(target.type === "c2c"){
      result = await sendFileMessage(account.accountId, replyUrl, target.id, attachment);
    }else{
      result = await sendFileMessage(account.accountId, replyUrl, target.id, attachment);
    }
    return { channel: "weixin", messageId: result.id, timestamp: result.timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log("[weixin] sendFile error:", message);
    return { channel: "weixin", error: message };
  }
}

/**
 * 发送表情包消息
 */
export async function sendEmoji(ctx: OutboundContext): Promise<OutboundResult> {
  const { to, account } = ctx;
  let { attachment, replyToId } = ctx;
  if (!attachment) {
    return { channel: "weixin", error: "No attachment provided for emoji message" };
  }

  console.log("[weixin] sendEmoji ctx:", JSON.stringify({ to, replyToId, accountId: account.accountId }, null, 2));

  try {
    const target = parseTarget(to);
    let replyUrl = `${ctx.replyUrl}`;
    console.log("[weixin] sendEmoji target:", JSON.stringify(target));
    let result = {} as MessageResponse;
    if(target.type === "c2c" || !ctx.message){
      result = await sendEmojiMessage(account.accountId, replyUrl, target.id, attachment);
    }else{
      let referMsg = {
        msgType: ctx.message.type,
        content: ctx.message.content,
        createTime: ctx.message.createTime,
        msgSvrId: ctx.message.szMsgSvrId,
        userName: ctx.message.realUserName
      } as WeixinReferenceMessage;
      result = await sendEmojiMessage(account.accountId, replyUrl, target.id, attachment, referMsg);
    }
    return { channel: "weixin", messageId: result.id, timestamp: result.timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log("[weixin] sendEmoji error:", message);
    return { channel: "weixin", error: message };
  }
}

/**
 * 发送拍一拍消息
 */
export async function sendPat(ctx: OutboundContext): Promise<OutboundResult> {
  const { to, account } = ctx;
  let { replyToId } = ctx;

  console.log("[weixin] sendPat ctx:", JSON.stringify({ to, replyToId, accountId: account.accountId }, null, 2));

  try {
    const target = parseTarget(to);
    let replyUrl = `${ctx.replyUrl}`;
    console.log("[weixin] sendPat target:", JSON.stringify(target));
    let result = {} as MessageResponse;
    if(target.type === "c2c"){
      result = await sendPatMessage(account.accountId, replyUrl, target.id);
    }else{
      if(ctx.message){
        result = await sendPatMessage(account.accountId, replyUrl, target.id, ctx.message.realUserName);
      }else{
        throw new Error("No message context available for pat message in group chat");
      }
    }
    return { channel: "weixin", messageId: result.id, timestamp: result.timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log("[weixin] sendPat error:", message);
    return { channel: "weixin", error: message };
  }
}

/**
 * 发送媒体消息
 */
export async function sendMedia(ctx: OutboundContext): Promise<OutboundResult> {
  let result = {channel: "weixin"} as OutboundResult;
  if(ctx.attachment){
    if(ctx.attachment.endsWith(".jpg") || ctx.attachment.endsWith(".png") || ctx.attachment.endsWith(".jpeg")){
      result = await sendImage(ctx);
    }
    else if(ctx.attachment.endsWith(".gif")){
      result = await sendEmoji(ctx);  
    }else{
      result = await sendFile(ctx);
    }
  }else{
    result = {channel: "weixin", error: "No attachment provided for media message"};
  }
  return result;
}