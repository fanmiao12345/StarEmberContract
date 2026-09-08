# v1.9 美术资源管线

## 资源层级
- Critical：Logo、首页背景、主角卡面、基础 UI 图标。必须位于主包。
- Character Bundle：15 名角色高清立绘、角色卡框。微信小游戏建议 Asset Bundle 分包。
- Battle FX Bundle：技能图标、状态 Icon、Boss 徽记与战斗特效。
- Voice Remote：角色语音保持远程资源位，按需下载。

## 替换正式立绘
保持文件键 `h001`~`h015` 不变，只替换 manifest 指向的资源，不修改游戏逻辑。
