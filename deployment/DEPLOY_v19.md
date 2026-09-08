# v1.9 CloudBase / 微信小游戏部署准备

## Web 静态托管
1. `npm i -g @cloudbase/cli`
2. `tcb login`
3. 设置 `CLOUDBASE_ENV_ID`。
4. Windows: `deployment\deploy-web-cloudbase.ps1`；macOS/Linux: `deployment/deploy-web-cloudbase.sh`。

脚本会先运行资源检查，再执行 `tcb hosting deploy . -e <ENV_ID> --safe --verify`。

## 微信小游戏
在 Cocos Creator 3.8.x Build 面板选择 WeChat Mini Game，填写真实 AppID。Release 构建可启用 Separate Engine；高清角色资源建议 Asset Bundle + Mini Game Subpackage。
