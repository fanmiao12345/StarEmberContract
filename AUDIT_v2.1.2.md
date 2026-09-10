# 星烬契约 v2.1.2 First 10-Minute Loop 检查与修复报告

## 本轮目标
从“页面已经手游化”继续推进到“新玩家能够自然完成一次完整循环”。重点验证首契→培养→编队→战斗→领奖是否存在断点，以及战败后是否能自然回到可提升的系统。

## 完成项
1. **初航路线**：根据真实存档自动计算 5 个里程碑，首页显示当前目标、进度和单一 CTA。
2. **上下文引导**：契约/契灵/阵容/探索页只显示当前闭环所需的下一步，不重复弹教程。
3. **十连到培养**：十连总结在初航阶段优先显示“培养契灵”，并自动选中当前高稀有主力。
4. **编队可达性**：阵容页新增统一子页头；初航编队目标按当前已拥有角色动态取 1–3 人，不会因抽卡重复导致引导卡死。
5. **首战到领奖**：首战后若存在待领取内容，结算页可直接进入事务所。
6. **失败恢复**：根据阵容人数、可升级角色、空装备槽、星痕点和站位情况实时生成一条优先提升建议，并一键跳转。
7. **返回链路**：探索非战斗态与阵容页均补齐显式“返回首页 / 更多”入口；战斗进行中仍保持沉浸布局。
8. **经济校验**：新档 30 契灵印满足首契；5000 烬币远高于第一次升级所需 200 烬币；无需改动经济平衡。

## 兼容性
- `SAVE_VERSION = 20` 不变。
- `CONFIG_VERSION = 2026.09.v21.2`。
- CloudBase API、集合结构和云函数参数均未改变。
- 本轮只需重新构建并部署 Web 静态资源。

## 验证命令
```text
npm test
npm run check
npm run release:check
npm run release:build
```

## 实际验证结果
- `npm test`：通过；新增 v2.1.2 初航五步、阵容/探索返回链路、首战领奖与战败恢复回归。
- `npm run check`：`syntax check passed · 44 files`。
- `npm run release:check`：`2.1.2 release-check OK · 75 assets · 10 release files · 0 missing`。
- `npm run release:build`：成功生成 `dist-web-v20`。
- 静态 action 扫描：97 个字面 `data-action`，104 个 action handler，缺失绑定 0；`journeyGo / resultRecover / resultClaim` 均已绑定。
- CloudBase 源目录与 v2.1.1 完全一致，本轮没有云函数代码变化。
- 初始经济校验：新档 `tickets=30`、`coin=5000`；首契需要 10 契灵印，第一次升级需要 200 烬币，闭环不会因基础资源不足被卡住。
- 构建产物 `release-info.json`：`version=2.1.2`、`configVersion=2026.09.v21.2`。
