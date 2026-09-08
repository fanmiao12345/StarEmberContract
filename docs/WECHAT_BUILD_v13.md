# 微信小游戏 v1.3 发布结构

- 目标：Cocos Creator 3.8.x / WeChat Mini Game / 750×1624 竖屏。
- 首场景：Splash -> Login -> Home。
- 角色立绘：建议 `characters` Asset Bundle，小游戏分包。
- 语音：接口保留远程 CDN/CloudBase Storage。
- 发布时由 Cocos Build 面板生成 `build/wechatgame`，不要把模板目录直接提交审核。
