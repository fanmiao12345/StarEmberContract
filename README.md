# 星烬契约 · Web/MiniGame v2.2.0 UI Fidelity & Interaction · Current Snapshot

这是在 v2.1.7 Cache-Safe Release 基础上的完整移动端界面重构版本。

## 版本重点
- 桌面与手机统一采用 460px 以内的手机游戏布局。
- 首页保持大厅式设计。
- 探索拆分为主线 / 资源裂境 / 扫荡记录三个模式。
- 契灵养成拆分为属性 / 升级 / 天赋 / 装备 / 羁绊。
- 编队、契约、活动、事务所统一移动端信息层级。
- 保留 v2.1.5 的玩法与经济修复。
- SAVE_VERSION 仍为 20，旧存档直接兼容。
- CloudBase 游戏逻辑未变化，本版本只需重新部署 Web 静态资源。

## 测试
```powershell
npm test
npm run check
npm run release:build
```

## CloudBase 部署
```powershell
$env:CLOUDBASE_ENV_ID="star-ember-d2grc7dhvba07314f"
.\deployment\deploy-web-cloudbase-v20.ps1
```

## 线上版本验证
部署完成后访问：

`/release-probe-2.2.0.json`

正式构建使用内容哈希 JS/CSS，不依赖旧 `app.js/styles.css` URL。
