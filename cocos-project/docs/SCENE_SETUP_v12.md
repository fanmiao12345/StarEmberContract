# v1.2 Cocos 场景接线

新增 `Login` 场景，挂载 `LoginSceneController`。启动链路建议：Splash → Login → Boot/CloudBase → Home。

新增 UI/动画组件：`StoryDialogue`、`BattleResultPanel`、`SkillSignatureFx`、`VoiceDirector`、`WechatLoginPanel`。

角色语音正式资源路径约定：`resources/voice/<heroId>/<acquire|skill|victory>`。当前代码只提供接口，不包含商业配音资产。
