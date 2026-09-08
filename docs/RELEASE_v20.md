# v2.0 Release Candidate

v2.0 不新增大规模玩法系统，目标是把 v1.9 的完整玩法收口成可部署试玩版本。

## 美术资源
- 15 名角色都有 `portrait` + `full` + `skill` 三类资源位。
- 6 个章节 Boss 都有 Emblem + Splash。
- 首页主视觉和发布封面均进入统一资源清单。
- 所有正式资源由 `asset-manifest.v20.json` 定位，客户端禁止硬编码正式 CDN 地址。

## 发布质量门槛
- `npm run check`
- `npm test`
- `npm run release:check`
- `npm run release:build`
- `cd cocos-project && npx tsc --noEmit --skipLibCheck`

## 账号侧待填参数
- CloudBase ENV ID
- 微信小游戏 AppID
- 正式远程语音/CDN地址（可后置）
