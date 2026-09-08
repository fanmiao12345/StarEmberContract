# v1.3 微信小游戏构建交接

1. 使用 Cocos Creator 3.8.x 打开 `cocos-project`。
2. Project -> Build，平台选择 **WeChat Mini Game**。
3. 竖屏 Portrait；填写真实小游戏 AppID。
4. Release 构建可启用 Separate Engine（使用内置引擎且非 Debug）。
5. 角色高清立绘建议设置为 Asset Bundle，并按 Mini Game Subpackage 输出；语音资源保留远程资源接口。
6. Build 后使用微信开发者工具打开 Creator 生成的 `build/wechatgame` 目录。

> `project.config.example.json` 和 `game.json.example` 是交接模板；真正发布目录应由 Creator Build 生成。
