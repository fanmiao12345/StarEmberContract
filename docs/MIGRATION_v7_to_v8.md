# v0.7 → v0.8 存档迁移

新增：
- `heroes[heroId].awakening`：0~3
- `heroes[heroId].signature`：契印武装 ID 或 null
- `inventory.signatureWeapons`
- `inventory.awakeningCore`
- `mails`
- `eventBoss`

迁移为幂等补字段，旧角色、装备、活动、好感、卡池保底全部保留。系统邮件按唯一 `id` 合并，不重复发放。
