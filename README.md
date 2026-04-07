# OpenClaw 微信频道插件（自用版）

这是一个用于 OpenClaw 的微信频道插件（`weixin`），由 `qqbot` 精简改造而来，面向个人自用。

## ✅ 功能

- 处理个人用户发来的消息(文本、图片、语音、视频、文件)
- 处理群聊中的 @Bot 文本消息（群艾特）

> 注意：消息推送和回复接口是插件的关键适配点，需要你根据自己的微信网关/服务实现。

## ⚠️ 说明

微信现在已提供官方插件`openclaw-weixin`，个人使用功能完全足够。  
如果你仍然想要接入（用于回复朋友、群聊等），需自己完成`消息监听`、`推送`和`回复`，大概是以下步骤：

1. 你自己的微信连接层（通过`Hook`、`协议`等）负责把消息推送到插件，消息需包含`replyUrl`字段
2. 插件将消息转成 OpenClaw 事件并交给主应用
3. 插件调用`${replyUrl}sendText/`等接口进行回复
3. 你自己的回复层负责把 bot 的输出转回微信

## 📁 代码结构

- `index.ts`：插件入口
- `src/api.ts`：微信 API 适配层
- `src/channel.ts`：OpenClaw 渠道实现
- `src/gateway.ts`：消息路由与状态
- `src/outbound.ts`：发送消息接口
- `src/runtime.ts`：运行时逻辑
- `src/types.ts`：类型定义
- `src/config.ts`：配置加载

## 🔧 快速开始

1. 克隆仓库并安装依赖：

```bash
git clone https://github.com/ljc545w/weixin/
cd weixin
pnpm install
```

2. 在 OpenClaw 主程序中启用插件：

```bash
openclaw plugin install ./weixin
openclaw plugin enable weixin
```

3. 完成`weixin`插件配置。  
3.1 在`openclaw.json.channels.weixin`中配置`gateway`，插件会基于此地址启动`wss`或`http`服务，然后，你需要**自行完成消息监听**，将消息推送到该地址。  
3.2 在`openclaw.json.channels.weixin`中配置`accounts`，单个账号示例:  
```
"accounts": {
    "default": {
        "enabled": true,
        "accountId": "wxid_111",
        "allowFrom": [
            "wxid_222"
        ],
    }
}
```
多个账号示例: 
```
"accounts": {
    "default": {
        "enabled": true,
        "accountId": "wxid_111",
        "allowFrom": [
            "wxid_222"
        ],
    },
    "bot1": {
        "enabled": true,
        "accountId": "wxid_333",
        "allowFrom": [
            "wxid_444"
        ],
    },
    "bot2": {
        "enabled": true,
        "accountId": "wxid_444",
        "allowFrom": [
            "*"
        ],
    },
    "bot3": {
        "enabled": false,
        "accountId": "wxid_555",
        "allowFrom": [],
    }
}
```

## ⚙️ 关键适配点

本插件支持消息事件的接收和处理，但以下部分需要你自己实现对接：

- 接收微信消息后推送到插件：`src/gateway.ts`、`src/api.ts`
- 解析 OpenClaw 输出并回复给目标用户：`src/outbound.ts`
- 群 @ 解析与回复定位（@用户）

## 🛠 你应该做的事情
1. 在你的微信网关中把个人消息转换为插件输入事件。
2. 把群消息艾特 `bot` 的场景映射到插件事件（`at` 标记）。
3. 插件的发送接口（`outbound`）会将回复内容发送到你的网关，由你返回给用户，因此，网关须支持`sendText/`路由。
4. 测试个人与群 @ 回复行为。

## 🧩 插件调用约定（建议）

- 输入消息格式：参考`src/types.ts/WeixinMessage`
- 输出消息格式：`{ accountId, userName, content }`

你可以根据自己的网关 layer 扩展字段。

## 📌 注意

- 目前此插件只做消息桥接逻辑，不含完整微信客户端认证/会话管理。
- 请勿直接把敏感信息写入仓库。

## 🤝 贡献与自用

欢迎把这个仓库当作你自己微信自用的起点：

如果你愿意，也可以把你的创意提 PR 回 upstream。

---

`weixin`：由 [qqbot](https://github.com/sliverp/qqbot) 精简改造的 OpenClaw 微信频道插件，特别感谢原作者`sliverp`的贡献。