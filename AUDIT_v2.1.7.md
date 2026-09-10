# 星烬契约 v2.1.7 Cache-Safe Release

## 问题
v2.1.6 的 UI 代码与 `dist-web-v20` 构建产物均包含新版 `v216-*` 大厅/导航，但正式站点仍可能显示旧 UI。原因是 CloudBase 静态托管通过 CDN 分发，而 v2.1.6 的核心文件仍使用固定 URL：`app.js`、`styles.css` 等；同时 Service Worker 缓存键仍沿用了 `star-ember-v21-stability14`。

## 修复
1. `release:build` 对 6 个核心文件生成 SHA-256 内容哈希文件名。
2. 正式 `dist-web-v20/index.html` 自动改写为哈希资源 URL。
3. `release-info.json` 写入实际哈希映射，可线上核验。
4. Service Worker 缓存键更新为 `star-ember-v217-cache-safe`。
5. Web 注册 Service Worker 使用 `sw.js?v=2.1.7`。
6. 固定源文件仍保留，兼容本地开发与旧检查流程；正式入口只加载哈希文件。

## 兼容性
- SAVE_VERSION: 20（不变）
- CONFIG_VERSION: 2026.09.v21.5（不变）
- CloudBase 数据库/云函数：不变
- 玩家存档：直接兼容
