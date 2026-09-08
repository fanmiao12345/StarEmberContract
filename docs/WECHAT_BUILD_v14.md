# v1.4 微信小游戏战斗会话

手动战斗需要部署四个新增云函数：`battleSessionStart`、`battleSessionCommand`、`battleSessionResume`、`battleSessionCancel`。

客户端只提交“释放技能/普通攻击”指令；双方 HP、行动顺序、技能效果与奖励均由云函数中的共享战斗引擎推进。`activeBattleSession` 会保存在玩家云存档中，因此微信切后台或重新进入后可恢复。
