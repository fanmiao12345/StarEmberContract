# v0.4 → v0.5 存档迁移

自动迁移新增字段：

- `inventory.starIron`：星铁强化材料，旧存档默认 0。
- `inventory.enhance`：装备 ID → 强化等级（0~10）。
- `resourceRuns`：资源副本每日使用次数。
- `achievements.claimed`：成就领取状态。
- `version` 升级为 5，`configVersion` 升级为 `2026.09.v5`。

角色、碎片、装备、遗物、阵容、Boss 首通、任务、抽卡保底、账号绑定全部保留。
