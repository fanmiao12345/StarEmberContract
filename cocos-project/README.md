# 《星烬契约》Cocos Creator 客户端骨架 · v0.9

目标：把 Web 原型逐步迁移为真正的微信小游戏客户端。

## v0.9 已落地
- `GameContext`：统一客户端 API / 状态
- `SceneRouter`：五主场景导航
- `Theme + UiFactory`：统一暗紫星轨视觉
- `TopCurrencyBar` / `BottomNav` / `HeroCardView`
- `BattleFxBus` / `SkillBanner` 动画事件层
- Home / Heroes / Gacha / Formation / Battle 五个场景 Controller
- 750×1624 竖屏适配基线
- SafeArea / ResponsiveRoot
- 场景蓝图与 Prefab 蓝图
- CloudBaseGameApi 继续复用 v0.8 权威云函数

> `.scene` / `.prefab` 文件必须由 Cocos Creator 编辑器生成，因此本包不伪造引擎序列化资产。按 `docs/SCENE_SETUP_v09.md` 创建空场景并挂 Controller 即可。


## v1.8
新增 `runtime/BattlePrefabAssembler.ts` 与 `runtime/HomePrefabAssembler.ts`，以及天赋、职业克制、阵容预设 UI 组件。
