# v1.3 → v1.4 存档迁移

- SAVE_VERSION: 13 → 14
- 新增 `activeBattleSession`，用于保存可恢复的实时手动战斗会话。
- 旧的 `battlePrefs.manualSkills` 保留用于兼容，但 v1.4 手动模式改为战斗中逐次指令。
- 未完成会话可在重新登录后恢复；完成会话可被下一次战斗替换。
