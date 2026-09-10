# 星烬契约 v2.1.3 Midgame Loop 检查与修复报告

## 目标

v2.1.3 聚焦玩家完成新手前 10 分钟后的 20–40 分钟中期游玩循环，解决“下一步做什么不明确”、日周任务缺乏直达、资源副本选择成本高、掉落价值不清晰等问题。

本轮不新增额外体力系统，不改变存档版本，不修改 CloudBase 云函数协议；只把现有主线、扫荡、资源裂境、活动次数、任务、养成与装备系统重新组织成更清晰的手游循环。

## 主要改动

### 1. 今日星轨：中期玩法导航

当玩家完成“首契 → 培养 → 编队 → 首战 → 领奖”的初航路线，或主线推进到第 6 关以后，首页自动切换为“今日星轨”。

导航会根据真实存档动态推荐下一步：

- 有待领奖励：前往星轨事务所
- 即将进入 Boss：优先推进 Boss
- 日常战斗/胜利任务未完成：继续主线
- 周资源任务未完成：进入推荐资源裂境
- 当前阵容存在可执行培养：前往契灵/整备
- 活动有可用次数且战力达标：进入活动
- 有扫荡次数：优先使用扫荡
- 以上均完成：继续推进主线

同时显示每日/每周任务完成数、现有行动次数和下一个 Boss 首通目标。

### 2. 行动次数总览

探索页增加行动次数条，汇总当前游戏已经存在的：

- 主线扫荡次数
- 资源裂境次数
- 月蚀活动次数
- 星港夜航次数

界面明确标注“次数独立刷新 · 无额外体力条”，避免为了制造手游感而额外引入一套没有后端支撑的体力经济。

### 3. 日常 / 周常任务可直接前往

未完成任务不再只显示“进行中”，而是提供可操作的直达按钮。根据任务类型自动跳转到：

- 探索 / 主线
- 契约
- 资源裂境
- 整备
- 契灵养成

已经满足条件的任务仍保留领取按钮，已领取任务保持禁用态。

### 4. 资源裂境动态推荐

系统根据当前真实资源缺口以及周任务状态，动态推荐烬币、锻造材料或星髓相关裂境，并给出推荐原因。推荐不会改变副本数值，只降低玩家判断成本。

### 5. Boss 里程碑

“今日星轨”会显示下一个 Boss 节点与首通奖励，让主线推进具有明确的短期目标，而不是只显示一个孤立的关卡编号。

### 6. 战斗掉落价值反馈

战斗结算中的装备与遗物掉落增加用途提示，例如：

- 当前阵容存在空装备位：提示可立即补位
- 新装备稀有度高于当前装备：提示存在替换价值
- 暂时无直接提升：提示可用于后续强化或分解
- 遗物：提示与当前激活遗物的关系

只要本场存在装备/遗物掉落，结算页都会提供“前往整备 · 查看掉落用途”入口。

## 版本一致性

- Web Version: `2.1.3`
- CONFIG_VERSION: `2026.09.v21.3`
- SAVE_VERSION: `20`
- PWA Cache: `star-ember-v21-midgame13`
- Web 与 Cocos 的 `asset-manifest.v20.json` 已同步到 2.1.3
- 构建产物 `release-info.json` 已验证为 2.1.3 / 2026.09.v21.3

由于 `SAVE_VERSION` 仍为 20，本轮不需要迁移旧存档。

## CloudBase 兼容性

将 v2.1.2 与 v2.1.3 的 `cloudbase/` 目录逐文件比较，未发现差异。本轮没有修改云函数源代码、数据库结构或云端请求协议，因此 v2.1.3 本身不要求重新部署云函数。

注意：历史流程中尚未拿到“36 个云函数线上全部部署成功”的最终清单。如果线上某个云功能提示 function not found，应使用 `tcb fn list` 核对实际部署状态。

## 自动化验证

实际执行：

```text
npm test
✅ v2.0 core tests passed
✅ v2.0 UI smoke test passed
✅ v2.0 UI feature smoke passed
✅ v2.0 visual UI passed
✅ v2.0.4 mobile system regression passed
✅ v2.0.5 battle mobile UX regression passed
✅ v2.0.6 contract growth gear regression passed
✅ v2.0.7 liveops utility shop regression passed
✅ v2.0.8 mobile quality polish regression passed
✅ v2.0.9 release readiness regression passed
✅ v2.1.0 release polish regression passed
✅ v2.1.1 play session polish regression passed
✅ v2.1.2 first 10-minute loop regression passed
✅ v2.1.3 midgame loop regression passed
✅ release asset test passed · 2.1.3
```

```text
npm run check
✅ syntax check passed · 44 files
```

```text
npm run release:check
✅ 2.1.3 release-check OK · 75 assets · 10 release files · 0 missing
```

```text
npm run release:build
✅ dist-web-v20 ready
```

额外扫描前端操作绑定：

```text
字面 data-action：100
动作 handler：106
缺失绑定：0

midgameGo：入口存在 / handler 存在
taskGo：入口存在 / handler 存在
```

## 结论

v2.1.3 已把新手后的中期循环从“多个独立系统”整理成“领奖 → 主线/Boss → 日周任务 → 资源裂境 → 培养/装备 → 活动 → 再推进”的可执行链路。主要修改集中在前端导航、信息层级和结果反馈，不改变既有战斗数值和后端经济规则。
