import type { PluginRuntime } from "openclaw/plugin-sdk";

let runtime: PluginRuntime | null = null;
let accountIdToReplyUrlMap: Record<string, string> = {};

export function setReplyUrlForAccount(accountId: string, replyUrl: string) {
  if(!accountIdToReplyUrlMap[accountId] || accountIdToReplyUrlMap[accountId] !== replyUrl){
    accountIdToReplyUrlMap[accountId] = replyUrl;
  }
}

export function getReplyUrlForAccount(accountId: string): string | undefined {
  if (!accountId) {
    return undefined;
  }
  return accountIdToReplyUrlMap[accountId];
}

export function setWeixinRuntime(next: PluginRuntime) {
  runtime = next;
}

export function getWeixinRuntime(): PluginRuntime {
  if (!runtime) {
    throw new Error("Weixin runtime not initialized");
  }
  return runtime;
}
