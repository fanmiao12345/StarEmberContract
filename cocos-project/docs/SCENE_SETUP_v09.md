# v0.9 Cocos 场景搭建说明

Creator 的 `.scene` / `.prefab` 序列化资产应由编辑器生成。本目录提供可编译 Controller 与蓝图，不手写不可验证的引擎序列化文件。

## 需要创建的 6 个空场景
1. Boot：挂 `BootController`
2. Home：根节点挂 `HomeSceneController`
3. Heroes：根节点挂 `HeroesSceneController`
4. Gacha：根节点挂 `GachaSceneController`
5. Formation：根节点挂 `FormationSceneController`
6. Battle：根节点挂 `BattleSceneController`

每个场景只需要 Canvas/根节点。Controller 会在运行时创建顶部货币栏、内容区域和底部导航。

## 推荐设计分辨率
- 750 × 1624（竖屏）
- Fit Width: on
- Fit Height: off
- 微信小游戏安全区：根节点额外挂 `ResponsiveRoot` / `SafeArea`

## Prefab 策略
当前 `UiFactory` 可在无 Prefab 情况下生成 UI，便于代码验证。进入正式美术生产后，将以下组件保存为 Creator Prefab：
- TopCurrencyBar
- BottomNav
- HeroCard
- SkillBanner
- CommonPanel / Button

保存 Prefab 后 Controller 只需把运行时工厂替换成资源加载，不改变 `GameApi` 和云端逻辑。
