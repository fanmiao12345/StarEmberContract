# v1.5 部署准备

## Web/PWA
- 部署 `web/` 到 HTTPS 静态托管。
- 修改 `web/cloud-config.js` 填入 CloudBase 环境 ID。
- HTTPS 下 Service Worker 会缓存启动所需的最小静态资源。

## CloudBase
- 部署 `cloudbase/functions/` 下全部云函数。
- 初始化项目文档中列出的集合与索引。
- 经济数据、抽卡、战斗奖励仍由云函数权威结算。

## 微信小游戏
- 使用 Cocos Creator 构建微信小游戏目标。
- 微信开发者工具中配置真实 AppID。
- 先做开发版/体验版，不要在未完成合规与概率公示前启用付费。
