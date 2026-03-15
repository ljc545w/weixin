import type { ResolvedWeixinAccount, WeixinAccountConfig } from "./types.js";
import type { OpenClawConfig } from "openclaw/plugin-sdk";

export const DEFAULT_ACCOUNT_ID = "default";

interface WeixinChannelConfig extends WeixinAccountConfig {
  accounts?: Record<string, WeixinAccountConfig>;
}

/**
 * 列出所有 微信 账户 ID
 */
export function listWeixinAccountIds(cfg: OpenClawConfig): string[] {
  const ids = new Set<string>();
  const weixin = cfg.channels?.weixin as WeixinChannelConfig | undefined;

  if (weixin?.accountId) {
    ids.add(DEFAULT_ACCOUNT_ID);
  }

  if (weixin?.accounts) {
    for (const accountId of Object.keys(weixin.accounts)) {
      if (weixin.accounts[accountId]?.accountId) {
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
  return weixin?.accountId || DEFAULT_ACCOUNT_ID;
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

  // 基础配置
  let accountConfig: WeixinAccountConfig = {};

  if (resolvedAccountId === DEFAULT_ACCOUNT_ID) {
    // 默认账户从顶层读取
    accountConfig = {
      enabled: weixin?.enabled,
      accountId: weixin?.accountId,
      gateway: weixin?.gateway,
      allowFrom: weixin?.allowFrom
    };
  } else {
    // 命名账户从 accounts 读取
    const account = weixin?.accounts?.[resolvedAccountId];
    accountConfig = account ?? {};
  }

  return {
    enabled: accountConfig.enabled !== false,
    accountId: accountConfig.accountId || "",
    gateway: accountConfig.gateway,
    allowFrom: accountConfig.allowFrom || []
  };
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
