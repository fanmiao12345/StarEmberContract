# 服务端权威边界 v0.4

以下数据不可由客户端直接写入：货币、抽卡保底、角色碎片、角色等级/星级、战斗胜负、关卡推进、Boss 首通、装备/遗物掉落、装备归属、每日任务奖励。

客户端仅发送动作意图，例如：
- `gacha(count)`
- `upgradeHero(heroId,type)`
- `saveFormation(formation)`
- `battle()`
- `equipLoadout(type, heroId, itemId, slot)`

云函数读取真实玩家状态，执行校验和计算，再以 `revision + requestId` 方式写回，降低并发覆盖和网络重试造成重复奖励的风险。
