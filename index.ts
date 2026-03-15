import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";

import { weixinPlugin } from "./src/channel.js";
import { setWeixinRuntime } from "./src/runtime.js";

const plugin = {
  id: "weixin",
  name: "Weixin",
  description: "Weixin channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    setWeixinRuntime(api.runtime);
    api.registerChannel({ plugin: weixinPlugin });
  },
};

export default plugin;

export { weixinPlugin } from "./src/channel.js";
export { setWeixinRuntime, getWeixinRuntime } from "./src/runtime.js";
export * from "./src/types.js";
export * from "./src/api.js";
export * from "./src/config.js";
export * from "./src/gateway.js";
export * from "./src/outbound.js";
