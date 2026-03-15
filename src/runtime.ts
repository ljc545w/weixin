import type { PluginRuntime } from "openclaw/plugin-sdk";

let runtime: PluginRuntime | null = null;

export function setWeixinRuntime(next: PluginRuntime) {
  runtime = next;
}

export function getWeixinRuntime(): PluginRuntime {
  if (!runtime) {
    throw new Error("Weixin runtime not initialized");
  }
  return runtime;
}
