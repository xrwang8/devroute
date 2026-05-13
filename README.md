# DevRoute

Chrome 浏览器扩展，用于本地开发联调时将请求中的服务名替换为本地服务名。

## 使用场景

后端服务注册在 Nacos，研发环境服务名为 `tcm-docker`，本地启动的服务注册为 `tcm-docker-name`。开启插件后，浏览器发出的 API 请求中包含 `tcm-docker` 的 URL 会自动替换为 `tcm-docker-name`，网关将流量路由到本地服务，无需修改前端代码或网关配置。

## 安装

1. 打开 Chrome，访问 `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」，选择本项目目录

## 使用

1. 点击工具栏 DevRoute 图标，打开弹窗
2. 开启全局开关
3. 添加规则：左侧填写研发环境服务名，右侧填写本地服务名
4. 点击「示例」按钮可预览替换效果

## 注意事项

- 仅对 XHR/Fetch 请求生效（即前端 axios、fetch 等发出的 API 请求）
- 页面导航、静态资源加载不受影响
- 支持多条规则，每条可独立启用/禁用

## 文件结构

```
devroute/
  manifest.json      # Chrome 扩展配置（Manifest V3）
  background.js      # Service Worker，管理 declarativeNetRequest 动态规则
  tubiao.png         # 插件图标
  popup/
    popup.html       # 弹窗页面
    popup.js         # 弹窗交互逻辑
    popup.css        # 弹窗样式
```
