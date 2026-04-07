import type { ResolvedWeixinAccount, WeixinChannelConfig } from "./types.js";
import type { OpenClawConfig } from "openclaw/plugin-sdk";

export const DEFAULT_ACCOUNT_ID = "default";


/**
 * 列出所有 微信 账户 ID
 */
export function listWeixinAccountIds(cfg: OpenClawConfig): string[] {
  const ids = new Set<string>();
  const weixin = cfg.channels?.weixin as WeixinChannelConfig | undefined;

  if (weixin?.accounts) {
    for (const accountName of Object.keys(weixin.accounts)) {
      const account = weixin.accounts[accountName];
      if (account.enabled && account.accountId) {
        ids.add(account.accountId);
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
  const account = weixin?.accounts?.[DEFAULT_ACCOUNT_ID];
  return account?.accountId || "";
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
  const defaultAccount = weixin?.accounts?.[DEFAULT_ACCOUNT_ID];
  if (resolvedAccountId === DEFAULT_ACCOUNT_ID || resolvedAccountId === defaultAccount?.accountId) {
    return {
      enabled: defaultAccount?.enabled || false,
      accountId: defaultAccount?.accountId || "",
      allowFrom: defaultAccount?.allowFrom || [],
    };
  } else {
    if(weixin?.accounts){
      for (const accountName of Object.keys(weixin.accounts)) {
        const account = weixin.accounts[accountName];
        if (account.enabled && account.accountId == resolvedAccountId) {
          return {
            enabled: account.enabled,
            accountId: account.accountId,
            allowFrom: account?.allowFrom || [],
          };
        }
      }
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
