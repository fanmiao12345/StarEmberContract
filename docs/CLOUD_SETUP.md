# CloudBase 接入步骤 · v0.8

1. 创建 CloudBase 环境并记录环境 ID。
2. 在 `web/cloud-config.js` 设置 `enabled: true` 和你的 `env`。
3. 数据库创建：`players`、`identity_links`、`link_codes`、`event_leaderboard`。
4. 给 `event_leaderboard.bestDamage` 建立降序索引，便于活动 Boss 排名查询。
5. 部署 `cloudbase/functions` 下 26 个云函数；每个函数目录已包含独立 `package.json` 与 `lib`。
6. 用 Web 身份测试：连接云端 → 领取邮件 → 抽卡 → 战斗 → 专武 / 觉醒 → 活动 Boss → 刷新排行榜。
7. 微信小游戏阶段使用 `cocos-project/assets/scripts/adapters/CloudBaseGameApi.ts` 作为客户端接口适配层。

## 安全原则

- 客户端禁止直接写 `players` 与 `event_leaderboard`。
- 抽卡、觉醒、专武装备、邮件领取、活动 Boss 和排行榜写入全部由云函数执行。
- `eventBoss` 使用服务端玩家状态重新计算伤害，再更新排行榜；不接受客户端上传 damage。
- 所有关键经济写操作继续使用 `requestId` 幂等与 `revision` 乐观锁。
