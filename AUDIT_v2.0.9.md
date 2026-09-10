# 星烬契约 v2.0.9 正式试玩就绪检查与修复报告

## 本轮目标

v2.0.4-v2.0.8 已完成核心页面手游化和第二轮品质统一。本轮处理正式远程试玩的“最后一公里”：首次进入与回流、安装到桌面、资源预载、弱网/断网保护、云存档自动恢复、前后台切换以及离线缓存策略。

## 主要修复

### 1. 首次进入与回流玩家分流
- 新玩家仍使用原有 5 步新手引导，不额外增加阻塞弹窗。
- 有旧存档且离开 12 小时以上时显示“欢迎回来”摘要。
- 摘要直接展示 Stage、待处理奖励、活动剩余次数；若存在未完成手动战斗，主按钮直接恢复探索页。

### 2. 启动加载从固定 650ms 改为真实预载流程
- `asset-loader.js` 为关键资源预载增加进度事件。
- 启动界面显示真实百分比和当前阶段：关键资源 → 本地进度 → 云存档恢复。
- 弱网 / Save-Data 时只预载关键列表前 2 项，避免首屏等待无意义变长。

### 3. PWA 安装与独立运行
- Chromium/Android 捕获 `beforeinstallprompt` 并提供“立即安装”。
- iOS 提供 Safari“分享 → 添加到主屏幕”的专用引导。
- `manifest.webmanifest` 补充 `id / scope / description / categories / shortcuts / maskable icons`。
- 契约、阵容、探索可作为桌面快捷入口；URL `?tab=` 会在已完成新手引导时直达对应页面。
- `index.html` 增加 Apple/移动 Web App 元信息。

### 4. 云存档自动恢复
- 玩家手动成功连接 CloudBase 后记录 `cloudAutoConnect=true`。
- 下次启动在网络正常时自动恢复云端进度。
- 网络恢复后、后台超过 60 秒再回前台时会静默刷新云存档。
- 设置页可随时关闭“自动恢复云存档”。

### 5. 弱网 / 离线保护
- 顶部增加弱网或离线状态条。
- CloudBase 调用在离线时直接返回 `NETWORK_OFFLINE`，网络异常统一映射为 `NETWORK_UNSTABLE`。
- 本地玩法继续可用；云端模式不会偷偷切成本地存档，避免进度分叉。

### 6. Service Worker 恢复策略
- Cache 升级为 `star-ember-v20-mobile9`。
- HTML/JS/CSS/JSON 使用 2.6 秒超时的 network-first；网络迟迟不返回时快速回退缓存。
- 图片等静态资源改为 stale-while-revalidate，先显示缓存再后台更新。
- 导航离线时回退到缓存 `index.html`。

## 兼容性
- Web version: `2.0.9`
- `CONFIG_VERSION = 2026.09.v20.9`
- `SAVE_VERSION = 20`
- CloudBase ENV: `star-ember-d2grc7dhvba07314f`
- 无数据库结构变化、无云函数协议变化。只需重新发布 Web 静态资源。

## 回归要求
```text
npm test
npm run check
npm run release:check
npm run release:build
```
并额外执行 360 / 390 / 430px Chromium 截图 QA 与离线 PWA 回退检查。

## 自动视觉 QA 说明

代码侧已保留并复核 v2.0.8 的 360 / 390 / 430px 三档媒体查询，并对 v2.0.9 新增的回流卡、安装提示、弱网条增加 `<=600px` 与 `<=360px` 规则。尝试使用当前运行环境的 Chromium/Playwright 生成真实宽度截图时，导航被环境安全策略拦截（`ERR_BLOCKED_BY_ADMINISTRATOR`），因此本报告不把“自动截图 QA”标记为已通过。部署后仍建议用真实手机截图做最后视觉验收。
