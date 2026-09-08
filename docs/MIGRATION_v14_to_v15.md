# v1.4 → v1.5 存档迁移

- `SAVE_VERSION`：14 → 15。
- 旧角色、抽卡、装备、活动、邮件及 `activeBattleSession` 数据继续保留。
- 战斗单位新增临时字段 `energy / phase / maxPhase`；这些字段仅存在于战斗会话，不改变角色永久养成数据。
- v1.4 未完成手动战斗可以恢复；缺少能量字段时按 0 初始化。
