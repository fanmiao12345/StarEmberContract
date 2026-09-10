# 星烬契约 v2.1.1 Play Session Polish 检查与修复报告

## 本轮目标
针对连续游玩 10–20 分钟最容易暴露的交互问题进行收口：首屏仍偏长、十连结束缺少总结果页、战斗结算信息弱、养成/领奖缺反馈、红点重复出现、连续点击存在重复请求风险。

## 完成项
1. **首页一屏化**：手机端仅保留主视觉、主线操作与三格状态坞；任务/活动大卡不再占据首屏。
2. **十连结果页**：最后一次揭示或“跳过全部”后展示 5×2 总览，统计 SSR/SR/NEW/碎片，并支持再次十连或直达契灵。
3. **战斗结算重构**：胜负分别提供更合理的下一步动作；增加 MVP、贡献统计和掉落区。
4. **角色成长反馈**：升级/升星/觉醒显示前→后变化和战力增量，非阻塞、自动消失。
5. **奖励反馈**：登录、日/周任务、成就、邮件、商店、扫荡统一使用资源获得动画。
6. **红点已读签名**：契约/契灵/阵容/探索提示在访问后记住当前条件；数量或条件变化时才再次提醒。
7. **防重复操作**：高风险 mutation 按钮 620ms 前端锁 + 500ms 按钮禁用；异步逻辑仍由原有全局 busy 锁串行化。

## 兼容性
- `SAVE_VERSION = 20` 不变。
- `CONFIG_VERSION = 2026.09.v21.1`。
- CloudBase API/集合结构未改变。
- 本轮只需重新构建并部署 Web 静态资源。

## 验证
```text
npm test
npm run check
npm run release:check
npm run release:build
```

## 实际验证结果
- `npm test`：通过；包含 v2.1.1 十连结果页、战斗结算、奖励/成长反馈、红点已读回归。
- `npm run check`：`syntax check passed · 44 files`。
- `npm run release:check`：`2.1.1 release-check OK · 75 assets · 10 release files · 0 missing`。
- `npm run release:build`：成功生成 `dist-web-v20`。
- 静态 action 扫描：98 个字面 `data-action`，3 个动态模板 action（form/selectHero、limited/gacha 单抽/十连）；对应 handler 均存在。
- ZIP 完整性：无压缩错误。
