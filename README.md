# 星烬契约 Web / MiniGame v2.0 · Release Candidate

原创竖屏卡牌 RPG。v2.0 不再扩张大量玩法系统，而是把 v1.9 的完整玩法收口成**可部署、可远程试玩、可继续迁移微信小游戏**的正式试玩候选版。

## v2.0 重点
- `SAVE_VERSION = 20`，旧 v1.x 存档自动迁移。
- `CONFIG_VERSION = 2026.09.v20`。
- `PWA cache = star-ember-v20`。
- 新增 `asset-manifest.v20.json`，统一管理正式试玩资源。
- 15 名角色全部拥有 `portrait / full / skill` 三层资源位。
- 6 个章节 Boss 增加独立 Splash 资源，不再只有徽记。
- 新增首页主视觉 `home-main-v20.jpg`、发布封面 `release-cover-v20.jpg` 和资源总览 `visual-board-v20.jpg`。
- 首页、Boss 入场、角色详情、抽卡演出均通过资源清单加载，资源加载完成后自动刷新 UI。
- Cocos 增加 v2.0 ReleaseConfig / BuildInfo / ReleaseAssetPreloader / ReleaseCandidateAssembler。
- 新增 Home / Battle / Gacha v20 Prefab 蓝图。
- 微信小游戏新增 `BUILD_PROFILE_v20.json` 与 `ASSET_BUNDLE_PLAN_v20.json`。
- Web 新增可执行发布前检查、构建目录和 CloudBase 静态托管部署脚本。

## 试玩
直接打开：

```text
web/index.html
```

正式资源预览：

```text
web/release-preview-v20.html
```

资源总览图：

```text
web/assets/release/visual-board-v20.jpg
```

## 验证

```bash
npm run check
npm test
npm run release:check
npm run release:build
cd cocos-project
npx tsc --noEmit --skipLibCheck
```

`npm run release:build` 会生成：

```text
dist-web-v20/
```

这是用于 HTTPS 静态托管的发布目录。

## CloudBase Web 发布
配置环境变量：

```text
CLOUDBASE_ENV_ID
```

Linux/macOS：

```bash
deployment/deploy-web-cloudbase-v20.sh
```

Windows PowerShell：

```powershell
deployment/deploy-web-cloudbase-v20.ps1
```

发布脚本会先进行 v2.0 资源/版本完整性检查，然后构建 `dist-web-v20/`，最后执行静态托管部署。

## 微信小游戏
参考：

```text
cocos-project/wechat-mini-game/BUILD_PROFILE_v20.json
cocos-project/wechat-mini-game/ASSET_BUNDLE_PLAN_v20.json
cocos-project/wechat-mini-game/README_v20.md
```

实际发布仍需要账号侧真实参数：
- 微信小游戏 AppID
- CloudBase ENV ID
- 正式 CDN / 语音资源地址（可后置）

## v2.0 美术说明
本版本使用此前确定的《星烬契约》原创概念美术方向，并将现有概念素材整理为一致的试玩资源层。它们已经可以用于内部/远程试玩；正式商业发行前仍建议为 15 名角色与 6 个 Boss 逐一制作独立高分辨率终稿及动画资源。
