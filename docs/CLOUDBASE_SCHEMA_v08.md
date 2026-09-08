# v0.8 新增 CloudBase 数据

## players
继续保存权威玩家状态，新增觉醒、专武、邮件与 eventBoss 字段。

## event_leaderboard
- `_id`: playerKey
- `playerKey`
- `name`
- `bestDamage`
- `updatedAt`

建议为 `bestDamage` 创建降序索引。排行榜只由 `eventBoss` 云函数写入，客户端无直写权限。
