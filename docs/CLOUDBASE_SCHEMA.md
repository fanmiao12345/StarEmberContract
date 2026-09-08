# CloudBase 数据结构 v0.7

## players
文档 ID：内部 `playerKey`。

关键字段：
- `version`, `configVersion`, `revision`
- `coin`, `starCrystal`, `tickets`, `pity`, `stage`
- `heroes.{heroId}`：`level`, `star`, `fragments`, `equipment`
- `formation`：最多 5 名角色 ID
- `inventory.equipment.{equipmentId}`：持有数量
- `inventory.relics.{relicId}`：持有数量
- `inventory.starIron`, `inventory.forgeDust`, `inventory.bondGift`：装备强化、锻造与好感资源
- `activeRelic`
- `bossClears`
- `campaignCompleted`
- `daily`, `weekly`, `profile`, `gachaHistory`
- `forge`：锻造 / 分解统计
- `event`：月蚀回廊活动货币、通关与商店记录
- `bond.{heroId}.points`：角色好感
- `lastAction`：幂等请求记录

## identity_links
文档 ID：登录身份哈希。字段 `playerKey`, `kind`, `createdAt/updatedAt`。

## link_codes
文档 ID：6 位迁移码。字段 `playerKey`, `expiresAt`, `used`。

## v0.7 云函数

共 21 个：`bootstrapPlayer`, `loadPlayer`, `gacha`, `limitedGacha`, `upgradeHero`, `saveFormation`, `battle`, `claimDaily`, `claimWeekly`, `createLinkCode`, `redeemLinkCode`, `equipLoadout`, `enhanceEquipment`, `dismantleEquipment`, `forgeEquipment`, `resourceDungeon`, `claimAchievement`, `shopBuy`, `eventBattle`, `eventShopBuy`, `bondGift`。


## v1.2
`players.newbieGacha.claimed`：首次常驻十连新手 SSR 保底是否已使用。
`players.storySeen[]`：已触发关键剧情节点 ID。
新增云函数 `newbieGacha`。
