# v1.9 → v2.0

v2.0 主要是发布、美术资源与客户端装配升级，不改变玩家经济数据结构。

迁移行为：
- `SAVE_VERSION` 自动从 19 更新到 20。
- 角色、抽卡保底、阵容、装备、专武、觉醒、活动、任务、邮件、战斗录像与未完成手动战斗会话全部保留。
- Web UI 设置从 `starEmber.ui.v19` 自动读取并写入 `starEmber.ui.v20`。
- 本地存档从 `starEmber.save.v19` 自动读取并迁移到 `starEmber.save.v20`。
