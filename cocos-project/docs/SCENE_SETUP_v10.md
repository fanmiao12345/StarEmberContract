# v1.0 Cocos Creator 场景搭建

目标：Cocos Creator 3.8.x，750×1624 竖屏。

## 场景
1. Splash → `SplashSceneController`
2. Boot → `BootController`
3. Home → `HomeSceneController`
4. Heroes → `HeroesSceneController`
5. Gacha → `GachaSceneController`
6. Formation → `FormationSceneController`
7. Battle → `BattleSceneController`

`.scene/.prefab` 请在 Creator 编辑器生成；仓库中的蓝图与 Controller 用于可靠迁移，不手写引擎序列化资产。

## v1.0 新组件
- `AudioDirector`：音乐/音效统一入口
- `TutorialOverlay`：新手引导 UI
- `SettingsPanel`：设置面板
- `GachaReveal`：角色获得动画钩子
- `BattleUnitView`：角色血条/单位表现
- `DamageNumber`：伤害跳字
