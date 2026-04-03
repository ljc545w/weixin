---
name: weixin-pat
description: Send WeChat "pat" (拍一拍) messages via strict XML format only.
metadata: { "openclaw": { "emoji": "👋", "requires": { "config": ["channels.weixin.enabled"] } } }
---

# WeChat Pat (拍一拍) - Strict Mode

Send WeChat "pat" (拍一拍) messages using **strict XML format**. No other text or content is allowed.

## ⚠️ Strict Mode

- **Only** valid XML with `<pat>` element will be processed
- **No** additional text, explanations, or fallback
- If XML is invalid or missing `<pat>` element, nothing will be sent
- AI must reply with **pure XML only**

## When to Use

✅ **USE this skill when:**

- User explicitly asks you to "pat" someone on WeChat (拍一拍)
- User asks you to 拍一拍 or tap a WeChat contact
- You want to send a playful WeChat pat gesture

## Format

```xml
<appmsg><pat chatRoom="group_id">user_id</pat></appmsg>
```

### Parameters

| Attribute | Required | Description |
|-----------|----------|-------------|
| `chatRoom` | Optional | Group chat ID (`xxx@chatroom`). Omit for direct chat. |
| Content | **Required** | Target user ID to pat (e.g., `wxid_xxx`) |

## Examples

### Pat in Direct Chat

**Correct:**
```xml
<appmsg><pat>wxid_currentuser</pat></appmsg>
```

**Wrong (will fail):**
```
好的，我来拍你
<appmsg><pat>wxid_currentuser</pat></appmsg>
```

```xml
<appmsg><pat></pat></appmsg>
```

### Pat in Group Chat

**Correct:**
```xml
<appmsg><pat chatRoom="chatroom123@chatroom">wxid_zhangsan</pat></appmsg>
```

**Wrong (will fail):**
```xml
<appmsg><pat>wxid_zhangsan</pat></appmsg>
```
(Missing chatRoom for group pat)

## Behavior

| Input | Result |
|-------|--------|
| Valid XML with `<pat>` | Pat is sent |
| Invalid XML | Nothing sent |
| XML without `<pat>` | Nothing sent |
| Empty `<pat>` content | Nothing sent |
| Extra text around XML | Nothing sent |

## Guidelines

1. **Pure XML only** - Do not add any text before or after the XML
2. **Confirm recipient** - Always verify the target user ID
3. **Group pat** - Include `chatRoom` attribute for group chats
4. **Don't spam** - Avoid repeated pats in quick succession
