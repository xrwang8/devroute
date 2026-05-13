# DevRoute 设计文档

## 背景

开发者在本地启动后端服务并注册到 Nacos（服务名如 `tcm-docker-name`），研发环境服务名为 `tcm-docker`。前端请求经过网关时需要能灵活切换到本地服务，无需修改前端代码或网关配置。

## 方案

Chrome 扩展（Manifest V3），通过 `declarativeNetRequest` 动态规则拦截并重写请求 URL 中的服务名片段。

## 工作原理

```
请求 URL 包含规则中的"源服务名"？
  否 → 放行
  是 → 插件开关是否开启？
         否 → 放行
         是 → 将 URL 中的源服务名替换为目标服务名，重新发出请求
```

示例：
```
https://172.28.0.9:8443/gateway/tcm-docker/api/xxx
→ https://172.28.0.9:8443/gateway/tcm-docker-name/api/xxx
```

## 配置模型

支持多条规则，每条规则包含：

| 字段 | 说明 | 示例 |
|------|------|------|
| `from` | 源服务名（URL 中需匹配的片段） | `tcm-docker` |
| `to` | 目标服务名（替换后的片段） | `tcm-docker-name` |
| `enabled` | 该规则是否启用 | `true` |

全局配置：

| 字段 | 说明 |
|------|------|
| `globalEnabled` | 插件总开关 |

存储：`chrome.storage.sync`

## 文件结构

```
devroute/
  manifest.json
  background.js        # Service Worker，管理 declarativeNetRequest 动态规则
  popup/
    popup.html
    popup.js
    popup.css
```

## UI

弹窗包含：
- 全局开关 toggle
- 规则列表（每条：from → to + 启用开关 + 删除按钮）
- 添加规则按钮
- 测试区域：输入任意 URL，实时显示替换结果（纯前端模拟，不发真实请求）

## 技术约束

- Manifest V3，使用 `declarativeNetRequest` 的 `updateDynamicRules`
- `declarativeNetRequest` 的 redirect action 支持 `regexSubstitution`，用正则替换 URL 片段
- 权限：`declarativeNetRequest`、`storage`、`<all_urls>`
