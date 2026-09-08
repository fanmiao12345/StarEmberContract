# 星烬契约 v2.0 发布说明

## Web / PWA
1. 设置 `CLOUDBASE_ENV_ID`。
2. 先执行 `node deployment/build-web-v20.mjs`，生成 `dist-web-v20/`。
3. Linux/macOS：`deployment/deploy-web-cloudbase-v20.sh`。
4. Windows PowerShell：`deployment/deploy-web-cloudbase-v20.ps1`。

`build-web-v20.mjs` 会先执行资源/版本校验，任何正式资源缺失都会中止构建。

## 微信小游戏
- Cocos Creator 3.8.x。
- 竖屏 750×1624。
- Start Scene：Splash。
- 主包只保留 Splash/Login/Home 必要资源。
- `characters`、`battle-fx` 使用小游戏分包。
- `voice` 保持远程资源。
- 正式构建使用 `BUILD_PROFILE_v20.json` 与 `ASSET_BUNDLE_PLAN_v20.json` 作为装配参考。

## 仍需账号侧真实参数
- 微信小游戏 AppID
- CloudBase ENV ID
- 正式域名/静态托管域名（如需自定义域名）
