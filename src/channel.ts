import {
  type ChannelPlugin,
  type NormalizeTargetResult,
  applyAccountNameToChannelSection,
} from "openclaw/plugin-sdk";

import type { ResolvedWeixinAccount } from "./types.js";
import { DEFAULT_ACCOUNT_ID, listWeixinAccountIds, resolveWeixinAccount, applyWeixinAccountConfig, resolveDefaultWeixinAccountId } from "./config.js";
import { startGateway } from "./gateway.js";

/**
 * 简单的文本分块函数
 * 用于预先分块长文本
 */
function chunkText(text: string, limit: number): string[] {
  if (text.length <= limit) return [text];
  
  const chunks: string[] = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    if (remaining.length <= limit) {
      chunks.push(remaining);
      break;
    }
    
    // 尝试在换行处分割
    let splitAt = remaining.lastIndexOf("\n", limit);
    if (splitAt <= 0 || splitAt < limit * 0.5) {
      // 没找到合适的换行，尝试在空格处分割
      splitAt = remaining.lastIndexOf(" ", limit);
    }
    if (splitAt <= 0 || splitAt < limit * 0.5) {
      // 还是没找到，强制在 limit 处分割
      splitAt = limit;
    }
    
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }
  
  return chunks;
}

export const weixinPlugin: ChannelPlugin<ResolvedWeixinAccount> = {
  id: "weixin",
  meta: {
    id: "weixin",
    label: "Weixin",
    selectionLabel: "Weixin",
    docsPath: "/docs/channels/weixin",
    blurb: "Connect to Weixin via 3rdparty plugin",
    order: 50,
  },
  capabilities: {
    chatTypes: ["direct"],
    media: true,
    reactions: false,
    threads: false,
    /**
     * blockStreaming: true 表示该 Channel 支持块流式
     * 框架会收集流式响应，然后通过 deliver 回调发送
     */
    blockStreaming: false,
  },
  reload: { configPrefixes: ["channels.weixin"] },

  config: {
    listAccountIds: (cfg) => {
      const ids = listWeixinAccountIds(cfg);
      console.log(`[weixin:channel] listAccountIds: ${JSON.stringify(ids)}`);
      return ids;
    },
    resolveAccount: (cfg, accountId) => {
      const account = resolveWeixinAccount(cfg, accountId);
      console.log(`[weixin:channel] resolveAccount: input=${accountId} → resolved=${account.accountId}, enabled=${account.enabled}`);
      return account;
    },
    defaultAccountId: (cfg) => {
      const id = resolveDefaultWeixinAccountId(cfg);
      console.log(`[weixin:channel] defaultAccountId: ${id}`);
      return id;
    },
  },
  setup: {
    // 新增：规范化账户 ID
    resolveAccountId: ({ accountId }) => accountId?.trim().toLowerCase() || DEFAULT_ACCOUNT_ID,
    // 新增：应用账户名称
    applyAccountName: ({ cfg, accountId, name }) =>
      applyAccountNameToChannelSection({
        cfg,
        channelKey: "weixin",
        accountId,
        name,
      }),
    applyAccountConfig: ({ cfg }) => {
      return applyWeixinAccountConfig(cfg);
    },
  },
  // Messaging 配置：用于解析目标地址
  messaging: {
    normalizeTarget: (target: string): NormalizeTargetResult => {
      return {ok: false, error: `Unrecognized target format: ${target}`};
    },
    targetResolver: {
      /**
       * 判断目标 ID 是否可能是 微信 格式
       */
      looksLikeId: (id: string): boolean => {
        if(id.endsWith("@chatroom")) {
          return true;
        }
        if(id.startsWith("wxid_")) {
          return true;
        }
        if(id.length < 32)
          return true;
        return false;
      },
      hint: "Weixin 目标格式: wxid_xxx (私聊) 或 xxx@chatroom (群聊)",
    },
  },
  outbound: {
    deliveryMode: "direct",
    chunker: chunkText,
    chunkerMode: "markdown",
    textChunkLimit: 2000
  },
  gateway: {
    // TODO: 必须完善的方法
    startAccount: async (ctx) => {
      const { account, abortSignal, log, cfg } = ctx;

      log?.info(`[weixin:${account.accountId}] Starting gateway, enabled=${account.enabled}`);
      
      await startGateway({
        account,
        abortSignal,
        cfg,
        log,
        onReady: () => {
          log?.info(`[weixin:${account.accountId}] Gateway ready`);
          ctx.setStatus({
            ...ctx.getStatus(),
            running: true,
            connected: true,
            lastConnectedAt: Date.now(),
          });
        },
        onError: (error) => {
          log?.error(`[weixin:${account.accountId}] Gateway error: ${error.message}`);
          ctx.setStatus({
            ...ctx.getStatus(),
            lastError: error.message,
          });
        },
      });
    },
  },
  status: {
    defaultRuntime: {
      accountId: DEFAULT_ACCOUNT_ID,
      running: false,
      connected: false,
      lastConnectedAt: null,
      lastError: null,
      lastInboundAt: null,
      lastOutboundAt: null,
    },
  },
};
