# 星烬契约 v2.1.4 稳定性加固报告

## 本轮范围
仅处理 v2.1.3 的隐藏稳定性、存档安全、云端一致性和发布完整性问题，不新增玩法，不改变 SAVE_VERSION=20，不调整战斗/经济数值。

## 已确认并修复
1. 迁移码在 `action()` 内嵌套调用 `connectCloud()`，会被全局 busy 锁短路；改为无 UI 锁的 `connectCloudCore()`，外层只加一次 action 锁。
2. 本地已有非初始进度时直接绑定迁移码可能切走本地档；绑定前新增本地非初始档保护。
3. CloudBase `resolvePlayerKey/getOrCreate` 吞掉任意数据库读取异常并继续 set，存在把暂时性读错误误判为“无账号/无存档”的覆盖风险；改为查询式存在性读取，真实错误继续抛出。
4. 迁移码读取后再标记 used 存在并发双兑换窗口；改为 `used:false` 条件更新抢占。
5. Web / Cloud / Cocos 版本元数据漂移；统一到 2.1.4 / 2026.09.v21.4。
6. `index.html` 仍显示 v2.0.4；同步正式版本文案。
7. 旧档/异常档中的字符串型货币、碎片、次数可能在奖励结算时发生字符串拼接；迁移阶段统一数值化、非负化。
8. 异常存档可保留重复阵容、超出拥有数量的装备、未拥有的遗物/契印；迁移阶段自动修复。
9. CloudBase SDK 并发初始化可能重复登录/重复插入脚本；增加 ensurePromise 合并并发请求。
10. 旧检查只校验 36 个云函数 index.js，不校验每个函数实际打包的 lib/game.js / lib/cloud.js；现在检查全部部署副本并验证与 _shared 零漂移。
11. 本地存储写入失败此前直接抛浏览器底层异常；现在转成明确的 LOCAL_SAVE_FAILED 提示。

## 部署影响
本版修改了 Web 前端与 CloudBase 共享逻辑。SAVE_VERSION 仍为 20，无需迁移玩家存档；但若要获得服务器端“读取异常不覆盖存档”和“迁移码并发抢占”保护，需要重新部署 CloudBase 云函数。

## 自动化验证
实际执行结果：

```text
npm test
✅ v2.0 core tests passed
✅ v2.1.4 stability regression passed
✅ v2.0–v2.1.3 全部 UI / 功能回归通过
✅ release asset test passed · 2.1.4
```

```text
npm run cloud:sync
✅ cloud shared libs synced · 72 files
```

```text
npm run check
✅ syntax/integrity check passed · 116 files · cloud helper drift 0
```

```text
npm run release:check
✅ 2.1.4 release-check OK · 75 assets · 10 release files · 0 missing
```

```text
npm run release:build
✅ dist-web-v20 ready
```

## 仍需上线前实机确认
- 本地代码已经覆盖 36 个云函数的 `lib/game.js` 与 `lib/cloud.js`，但当前工作环境没有直接核验线上 36 个云函数是否全部重新部署成功；部署后仍应使用 CloudBase CLI/控制台核对。
- PWA 更新、弱网切换、iOS/Android 浏览器存储异常属于浏览器/设备行为，自动化已覆盖逻辑分支，但上线前仍建议各做一次真机验收。

## 结论
v2.1.4 的重点不是继续叠玩法，而是把 v2.1.3 中自动化测试未覆盖的账号迁移、异常存档、云端读取失败、并发初始化和发布漂移问题补齐。SAVE_VERSION 保持 20，现有玩家数据无需格式升级。
