# v0.6 → v0.7 存档迁移

v0.7 将 `SAVE_VERSION` 提升至 7，并在 `migrate()` 中自动补齐以下字段：

- `inventory.forgeDust`：锻造尘，默认 0。
- `inventory.bondGift`：星语花，旧存档默认 0；新玩家初始 3。
- `forge`：`crafted`, `dismantled` 统计。
- `event`：活动 ID、月蚀印、通关、首通和商店兑换记录。
- `bond.{heroId}.points`：已拥有角色的好感点数。

原有角色、星级、碎片、装备、强化等级、卡池保底、任务、关卡、账号映射全部保留。
