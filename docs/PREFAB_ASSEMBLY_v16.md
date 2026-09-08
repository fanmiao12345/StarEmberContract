# v1.6 Home / Battle Prefab 装配规范

## Home
- 根节点 `SafeAreaRoot`，750×1624。
- `HomeBackgroundMotion` 只负责背景。
- `TopCurrencyBar` / `BottomNav` 锚定安全区。
- `HeroShowcase` 使用可替换远程立绘。

## Battle
- `BossPhaseHeader` 显示 Boss 阶段。
- `EnemyFormation` / `AllyFormation` 显示血条、护盾、异常状态。
- `HeroSkillBar` + `EnergyRing` + `SkillChargeFx`。
- `LiveSkillCommandPanel` 承担手动技能目标与指令。
- `BattlePlaybackControls` 承担 AUTO/录像暂停倍速。
- `BattleReplayStore` 只读取已结算 timeline，回放不发奖。
