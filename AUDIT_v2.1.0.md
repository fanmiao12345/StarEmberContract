# 星烬契约 v2.1.0 Release Polish 检查与修复报告

## 本轮定位

v2.0.4-v2.0.9 已完成核心页面手游化、战斗/抽卡/养成/活动重构以及 PWA/弱网/云存档就绪。本轮进入 2.1.0，重点不是继续堆系统，而是对正式试玩最容易被感知的四个方面收口：大厅、契约演出、战斗反馈、首屏性能和发布文案。

## 主要改动

### 1. 首页大厅最终收口
- 去除玩家首页的 `V2.0 RELEASE CANDIDATE` 标记。
- 章节主卡增加本章进度条和下一个 Boss 目标，不需要在六章路线页里才能判断进度。
- 主视觉图使用 `fetchpriority=high + decoding=async`，更偏向首屏优先。

### 2. 契约揭示演出 2.0
- SSR / SR / R 使用不同光晕强度；SSR 增加专属 flare。
- 十连揭示增加位置计数与稀有度进度轨。
- 卡面增加阵营、职业、NEW/重复、UP 标签。
- “跳过演出”明确改为“跳过全部”。
- 设置中增加“契约演出：完整 / 精简”，精简模式关闭转轮、粒子与闪光。

### 3. 战斗反馈
- WebAudio 提示音扩展攻击、暴击、治疗、BREAK、胜利、失败。
- 支持 `navigator.vibrate` 的手机加入差异化轻触感。
- 暴击 / BREAK 使用极短画面冲击；治疗 / 胜利使用颜色闪光，均不改变战斗逻辑。
- 设置可关闭触感反馈。

### 4. 首屏性能
- 角色列表图片改为 lazy + async decode；角色详情、抽卡揭示、战斗等即时视觉保持 eager。
- `asset-loader.js` 增加 idle secondary preload；首屏就绪后才预载二级背景/角色。
- 弱网、2G、Save-Data 不执行二级预载。
- 首页扩展区、事务所面板、折叠详情使用 `content-visibility:auto`。

### 5. 发布清理
- `EVENT_BOSS.subtitle` 移除“原型”字样。
- Release Preview 页移除 `RELEASE CANDIDATE`。
- `version.json`：2.1.0 / `release-preview`。
- Asset manifest release metadata：2.1.0 / `release-preview`。
- release checker 不再把 release version 硬编码为 2.0.0，而是与 `version.json` 对齐。
- Service Worker cache：`star-ember-v21-release10`。

## 数据与后端兼容
- `SAVE_VERSION = 20` 不变。
- CloudBase EnvId 不变：`star-ember-d2grc7dhvba07314f`。
- 无数据库字段变化。
- 无云函数请求/响应协议变化。
- 因此本轮只需重新部署 Web 静态资源。

## 验证命令
```text
npm test
npm run check
npm run release:check
npm run release:build
```
