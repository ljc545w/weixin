import type { ResolvedWeixinAccount, WeixinChannelConfig } from "./types.js";
import type { OpenClawConfig } from "openclaw/plugin-sdk";

export const DEFAULT_ACCOUNT_ID = "default";


/**
 * 列出所有 微信 账户 ID
 */
export function listWeixinAccountIds(cfg: OpenClawConfig): string[] {
  const ids = new Set<string>();
  const weixin = cfg.channels?.weixin as WeixinChannelConfig | undefined;

  if(weixin?.default && weixin?.default.enabled){
    ids.add(DEFAULT_ACCOUNT_ID);
  }

  if (weixin?.accounts) {
    for (const accountId of Object.keys(weixin.accounts)) {
      if (weixin.accounts[accountId].enabled) {
        ids.add(accountId);
      }
    }
  }

  return Array.from(ids);
}

/**
 * 获取默认账户 ID
 */
export function resolveDefaultWeixinAccountId(cfg: OpenClawConfig): string {
  const weixin = cfg.channels?.weixin as WeixinChannelConfig | undefined;
  return weixin?.default?.accountId || DEFAULT_ACCOUNT_ID;
}

/**
 * 解析 微信 账户配置
 */
export function resolveWeixinAccount(
  cfg: OpenClawConfig,
  accountId?: string | null
): ResolvedWeixinAccount {
  const resolvedAccountId = accountId ?? DEFAULT_ACCOUNT_ID;
  const weixin = cfg.channels?.weixin as WeixinChannelConfig | undefined;
  // 读取默认账户
  if (resolvedAccountId === DEFAULT_ACCOUNT_ID || resolvedAccountId === weixin?.default?.accountId) {
    return {
      enabled: weixin?.default?.enabled || false,
      accountId: weixin?.default?.accountId || "",
      allowFrom: weixin?.default?.allowFrom || [],
    };
  } else {
    // 命名账户从 accounts 读取
    const account = weixin?.accounts?.[resolvedAccountId];
    if(account){
      return {
        enabled: account.enabled,
        accountId: resolvedAccountId,
        allowFrom: account?.allowFrom || [],
      };
    }
  }
  return { enabled: false, accountId: "", allowFrom: []};
}

/**
 * 应用账户配置
 */
export function applyWeixinAccountConfig(
  cfg: OpenClawConfig
): OpenClawConfig {
  const next = { ...cfg };
  return next;
}
