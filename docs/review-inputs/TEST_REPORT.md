# 《星烬契约》线上版本测试报告（v2.1.8 部署版）

- 测试对象：https://star-ember-d2grc7dhvba07314f-1354158098.tcloudbaseapp.com （`version.json` = 2.1.8，`meta[name=star-ember-build]` = 2.1.8）
- 对照源码：`StarEmberContract_WebMiniGame_v2.2.0-current-source`（本地源码版本号是 2.2.0，**线上是 2.1.8，两者 app.js / styles.css / sw.js 都不同**）
- 测试方式：真实浏览器（Edge headless + CDP）驱动真实点击/触摸事件、真实视口（360×640 / 375×667 / 390×844 / 393×851 / 430×932 / 820×1180 / 1440×900）、断网模拟、CPU/内存采样，并对线上 JS/CSS 做静态审计；规则层另外用「在真实页面里调用 `window.STAR_EMBER_GAME` 导出 API」+「Node vm 里加载同一份 game-data.js」两条独立路径交叉验证
- 证据目录：`C:\Users\15480\Desktop\星烬契约\_audit\`（截图在 `shots\`，原始 JSON 在 `p*.json`）
- 说明：线上版本比本地源码旧，下面标注了「线上 2.1.8 / 源码 2.2.0」有差异的地方
- 结论概览：**致命 5 条（含 2 条可无限刷资源的漏洞）、严重 11 条、中等 21 条、轻微 20+ 条**；所有编号项都有实测证据或明确代码位置

---

## 一、致命问题（功能直接不可用）

### B1. 云存档完全不可用 ①：CloudBase SDK 的 CDN 地址 404
- 证据：`cloud-config.js` 里 `sdkUrl: 'https://static.cloudbase.net/cloudbase-js-sdk/3.0.1/cloudbase.full.js'`
- 实测：该 URL 返回 **404 NoSuchKey**（`_audit/p9-cloud-diag.json`）；同域 `.../cloudbase-js-sdk/latest/cloudbase.full.js` 返回 200（862KB）
- 现象：点「连接」→ 立刻 toast「⚠ 云端组件加载失败，请检查网络后重试」，`.starEmberCloud.connected()` 永远 false，UI 一直显示「☁ 云存档尚未连接」
- 影响：**整个云存档 / 跨设备迁移 / 云函数模式（battleSession、leaderboard 等）全部失效**，游戏只能本地试玩；清浏览器数据 = 进度全丢
- 修复：把 `sdkUrl` 换成存在且版本匹配的地址（`latest/cloudbase.full.js` 实测可用，或锁定一个真实存在的版本号并自测），并在 CI 里加一条「SDK HEAD 200」的检查

### B2. 云存档完全不可用 ②：即使 SDK 加载成功，后端仍 403
- 实测：手动注入可用的 SDK 后调用 `StarEmberCloud.connect()`，返回
  `{"code":"NETWORK_UNSTABLE","cause":"Request exceeds granted authority ... EXCEED_AUTHORITY"}`
  网络面板显示 `POST https://star-ember-....api.tcloudbasegateway.com/v1/functions/bootstrapPlayer` **403 Forbidden**（`_audit/p11-cloud.json`）
- 影响：即使修好 B1，云函数仍然调不通。需要排查 CloudBase 侧：环境是否开通匿名登录/自定义登录、`bootstrapPlayer` 等云函数的调用权限与安全规则、网关的 referer/域名白名单、以及 Web SDK v3 的网关路径是否与环境匹配
- 注意：`cloud-bridge.js` 把**所有**云函数错误（含 403）统一包装成 `NETWORK_UNSTABLE`「网络连接不稳定，请稍后重试」，会误导玩家和排障，建议按 HTTP 状态/错误码分类

### B3. 云函数排行榜是假数据（本地写死）
- 证据：`game-data.js` `localEventLeaderboard()` 返回固定名单：夜航者 168420 / 北辰 142880 / 镜海听潮 128600 / 赤环余烬 117320 / 青原旅人 98600 + 玩家自己
- 现象：本地模式下「伤害榜」显示「本地模拟排行」，且 `#1 夜航者 168,420` 是常量。若产品预期是真实排行，这里必须改为云端数据或明确标注为演示数据

---

## 一点五、经济/规则漏洞（已用线上引擎逐条复现，最严重）

> 说明：以下 5 条是我在线上页面里直接调用 `window.STAR_EMBER_GAME` 导出 API 复现的实测结果（`_audit/p40-verify-engine.json`、`_audit/p41-clock.json`），不是推测。另有一个子代理在 Node vm 里独立加载同一份 game-data.js 做了交叉验证，结论一致。顺带确认：线上 `game-data.js` 与服务端 `_shared/game.js` 引擎**逐行一致**，不存在前后端规则分叉。

### E1【致命·无限资源】每次读档都会重新发放新手武器 → 无限锻造尘
- 代码：`migrate()`（game-data.js L456）
  `if(!Object.keys(s.inventory.equipment).length){ s.inventory.equipment.eq001=1; ... }`
  —— **没有任何一次性标记**（对比同文件 L434 的 `rewardBackfills.v215` 回填是有标记的），而 L418 又会把数量为 0 的背包键删掉，所以「背包为空」这个条件每次分解完最后一件装备后就又成立了
- 实测（200 轮循环）：`分解 eq001 → 重新 migrate → eq001 回来了（还自动装回 h004）→ 再分解 ……`
  结果：**锻造尘 0 → 5025**，每轮稳定 +25（`cycles:200, dustGain:5000, EXPLOIT:true`）
- 影响：锻造尘是 SSR 套装装备的唯一来源，等于**无限锻造尘 → 无限套装装备**；云模式下更密（子代理实测每次云请求都跑一次 migrate，约 3 次正常云调用就能白拿 25 尘）
- 修复：把这段改成一次性回填，例如 `if(!s.rewardBackfills.v003){…发放…;s.rewardBackfills.v003=true;}`，或者写一个永不被清空的 `starterGranted` 标记

### E2【致命·刷日常】所有「每日/每周」重置键都取自本地日期，且**可以被传参/改表绕过**
- 代码：`gameDay(date=new Date())` L369、`gameWeek(date=new Date())` L378，以及所有调用方都把日期作为**可选参数**传入（`ensureDaily` L400、`ensureShop` L408、`ensureResourceRuns` L547、`ensureEventShop` L409、`ensureNightEventShop` L410、`ensureEventBoss` L351、`sweepInfo` L520、`claimLoginReward` L477、`eventBattle` L544、`nightEventBattle` L523）
- 实测 A（当天来回拨日期）：`claimLoginReward(D(0))` → 第 1 天；`claimLoginReward(D(1))` → 第 2 天；`claimLoginReward(D(-1))` → **第 3 天**。存档里的 `daily.day` 会被改成比原来更早的 `2026-09-09`，**日期键可以倒退**，没有任何单调性保护
- 实测 B（一个真实日内刷完 7 天签到）：连续传 D(0)…D(7) → 8 次领取全部成功，**7 张契灵印 + 460 星髓 + 2000 烬币 + 100 星铁 + 2 星语花 + 1 觉醒核心**，7 天签到轨道当天刷穿并可循环
- 实测 C：商店每日限购也跟着日期重置（`purchases` 从 `{ticket:2}` 变回 `{}`）
- 影响：本地模式（默认模式、云未连通时）完全是客户端权威，**改一次手机时间或改一次存档日期就能反复刷**：签到、每日任务、10 次扫荡、3 个资源裂境、商店限购、8 次月蚀回廊 + 6 次星港夜航 + 3 次月蚀兽
- 修复：存档里记一个只增不减的 `lastSeenDay`（新日期 ≤ 已记录值就不重置），并在云模式下把重置逻辑放到服务端、用服务端时间

### E3【严重·重复结算】同一关可以拿两次奖励
- 代码：`finalizeBattleSession` L644 **先发奖再判断关卡**：
  `rewardState(state,rewards); drops=rollLoot(...); if(state.stage===session.stage){…state.stage++…}`
  —— 关卡判断只挡住了「推进关卡」，没挡住「发奖 + 掉落」
- 而且 `startBattleSession` L646 有 `if(old&&['running','waiting'].includes(old.status))throw ACTIVE_BATTLE_SESSION`，但 **`battle()` L651 没有同样的检查**
- 实测：stage 3 起一个手动会话（停在 `waiting`）→ 直接调用 `battle()` 自动战斗 → 胜、+470 烬币 +1 券、stage 3→4，**残留会话仍然存在且状态仍为 waiting** → 再把该会话打完 → 又是 `win:true, rewards:{coin:470,tickets:1}, drops:1` → 合计 **+940 烬币 +2 券 + 2 次掉落**，正好是单次通关奖励的 2 倍（可对每一关重复）
- 附带影响：UI 上表现是「手动模式失效」——有未结束的手动战斗时切自动会提示「已有未结束的手动战斗」，而刷新页面会**静默丢弃**这场手动战斗（L417）
- 修复：把 `rewardState`/`rollLoot` 移进 `if(state.stage===session.stage)` 分支内；给 `battle()` 加上与 `startBattleSession` 相同的会话互斥检查

### E4【严重·读档直接崩】`migrate()` 遇到残缺/异常存档会抛异常，整个存档加载失败
- 实测（8 组畸形存档，5 组直接抛）：
  | 存档形态 | 结果 |
  |---|---|
  | `{formation:'h004'}` | ❌ `s.formation.filter is not a function` |
  | `{formation:{0:'h004'}}` | ❌ 同上 |
  | `{heroes:{h004:null}}` | ❌ `Cannot read properties of null (reading 'level')` |
  | `{inventory:'x'}` | ❌ `Cannot convert undefined or null to object` |
  | `{activeBattleSession:{allies:[null],…}}` | ❌ `Cannot read properties of null (reading 'silence')` |
  | `{heroes:{},formation:[]}` | ✅ 但**永久无法战斗**（`INVALID_FORMATION`），只能靠抽卡恢复 |
  | `{coin:Infinity}` | ✅ 正确钳到 0 |
  | `level:999,star:99,awakening:99` | ✅ 正确钳到 50/5/3 |
- 我的补充实测（上一轮）已确认：整份存档写成非法 JSON、`coin:'NaN'`、`heroes:null`、`stage:-5` 时能优雅恢复 —— 所以问题只在**类型错但能解析**的形态
- 修复：`formation`/hero 条目/`inventory`/会话数组先做 `Array.isArray`/`typeof` 校验；`heroes` 为空时回填 h004（现在只有装备会回填）；`migrate` 外层加「修复后继续」而不是抛出

### E5【严重·白拿成就】NaN 进度可以领取成就
- 代码：`achievementProgress` 里 `maxEnhance` 用 `Math.max(0,...Object.values(enhance).map(Number))`，而 L419 会把**不属于 EQUIPMENT 的陈旧键原样保留**（例如 `eq999_legacy:'x'`）→ `Number('x')=NaN` → `Math.max(0,NaN)=NaN` → 判定 `if(p<a.goal)throw` 里 `NaN<5` 为 **false** → 直接放行
- 实测：构造 `enhance:{eq001:0, eq999_legacy:'x'}` → `progress: NaN` → `claimAchievement('gear5')` 成功发放 **120 星髓**（星髓 300→420），而玩家一次强化都没做过
- 修复：`map(Number).filter(Number.isFinite)`，并在 `claimAchievement` 里拒绝非有限进度

### E6【轻微·强化不丢失】强化等级按「装备类型」存，分解后重新锻造白得 +10
- 实测：锻造 `eq010` → 强化到 +10 → 分解掉唯一一件（持有 0，`enhance.eq010` 仍是 10）→ 再锻造 `eq010` → **直接是 +10**
- 影响：不算漏洞（玩家不吃亏），但会破坏「强化是需要投入的」这一经济预期，而且锻造列表会展示玩家其实没有的 +10 图纸

### E7【轻微·内容缺失】系统邮件永远发不到新号
- `newPlayer` 里 `mails:[]` + `systemMailPolicy:'current'`，而 `migrate` 只在 policy **不是** `'current'` 时才合并 `SYSTEM_MAILS`
- 实测：新号 `mails:0, unread:0`；也就是说所有新玩家永久拿不到 `v08_launch`（**5 契灵印 + 300 星髓 + 3 觉醒核 + sig_h004**）和 `v08_event`（6000 烬币 + 120 星铁 + 180 锻造尘 + 2 星语花）
- 影响：觉醒核在游戏里极度稀缺（签到第 6 天 1 个/轮、夜航商店 2 个/周、讨伐 ≥12 万伤害给 1 个），白丢 3 个对养成节奏影响很大；「邮件」面板和角标对新号是死内容
- 修复：`newPlayer` 里直接 `mails: makeSystemMails()`，或改成按版本标记发放

### E8【轻微】其它已验证的小问题
- 成就 `stage10`/`stage20` 在**刚到**第 10/20 关（还没打过）就能领，文案「推进至第 10 关」有歧义（实测 stage=10、bossClears 只有 5 时就能领 3 券）
- `isPristine()` 忽略耐久进度：每日商店买空、活动/夜航商店清空、保存过阵容预设、有战斗录像、`eventBoss.bestDamage=999999`、有未领邮件……这些都会被判为「全新账号」，而且 `daily.claimed`/`sweep.used` 等字段每天会归零使判断非单调；它正是迁移码绑定 `LINK_WOULD_REPLACE_PROGRESS` 的保护开关，误判会导致**已玩账号被静默替换**
- `classifyBattleEvent` 取的是日志文本里**最后一个数字**，导致战斗时间轴的特效标注错位（「造成 2314 群体伤害并眩晕 3 人」被记为 damage 3；「全队恢复 1200 生命并获得 800 护盾」被记为 heal 800），且因为先判断 `/伤害|攻击/`，**所有状态类特效永远不会被识别为状态**
- 眩晕回合会 `continue` 跳过 `endActorTurn`，导致被眩晕单位身上的嘲讽/攻击buff/减速**多持续一个行动回合**，与日志里「嘲讽敌方2回合」的说明不符
- `migrate` 会把 `awakening` 钳到 0..3，但不校验 `awakenHero` 要求的等级/星级门槛，edited 存档可以在 Lv.1/1★ 保留觉醒 3 并拿到完整 +18% 加成

---

## 二、严重问题（核心体验被破坏）

### B4. 自动战斗结束后「结算面板完全不出现」
- 证据（线上 `app.433d269d88.js`）：`async function battle(){ ... lastBattle=d.battle; liveSession=null; battleFrame=0; resultOpen=false; ... }`
  `battleResultOverlay()` 只在 `resultOpen===true` 时渲染 —— 也就是说**战斗结算后代码主动把结算面板关掉了**
- 实测三次（`p4b/p4c/p4d/p23-manual2`）：自动战斗胜利后，页面回到「探索」，没有胜利画面、没有掉落列表、没有 MVP/战报、没有「下一目标」；**失败时连一句提示都没有**（只有音效和屏幕震动），玩家会以为卡住
- 只有手动战斗（`adoptLiveSession` 会把 `resultOpen=true`）、或去 探索→扫荡/记录→点「查看结算」才能看到结算面板（`_audit/shots/p27-result.png` 证明该面板本身是好的）
- 影响：这是游戏的核心正反馈，现在是缺失的；`resultRetry`（再次挑战）/`resultRecover`（按建议提升）/掉落用途提示等入口全部不可达
- 修复：`battle()` 里改为 `resultOpen=true`（并让 `exploreViewMode='archive'` 或保证竞技场面板在主线页也渲染）

### B5. 手动战斗进行中，底部导航在**全 App 被隐藏**，且几乎没有兜底出口
- 证据：`render()` 只要 `liveSession && status!=='complete'` 就给 `main.app` 加 `m205-battle-active`（与当前 tab 无关）；CSS `.app.m205-battle-active + .nav{display:none}`
- 实测：开启手动技后开始战斗，导航栏消失；此时点顶栏 ✉（邮件/事务所）跳转到事务所，**导航栏依然是消失的**，玩家只能靠左上角「‹」回首页再进探索，全程没有任何说明
- 修复：只在 `tab==='explore'` 时加这个 class，或保留导航只隐藏战斗页

### B6. 「连接云端」会**静默覆盖本地存档**（无合并/无备份/无二次确认）
- 证据：`connectCloudCore(){ const d=await CLOUD.connect(); state=G.migrate(d.state); cloudMode=true; ... }`，而 `cloud-bridge.connect()` 调用的 `bootstrapPlayer` **不带任何本地进度参数**，服务端无法拿到本地数据 → 本地进度不可能被合并
- 反证设计意图：`redeemLinkCode()` 有保护 `if(!G.isPristine(state)) throw LINK_WOULD_REPLACE_PROGRESS`（当前设备已有进度时阻止绑定），但**「连接云端」这条路没有同样的保护**；`hadLocalSave` 只被用于「欢迎回来」弹窗
- 现状缓解：因为 B1/B2，云连接根本走不通，所以这个坑目前还没被触发；一旦云修好，老玩家点一次「连接」就可能把几十关的进度换成云端的新号
- 修复：连接前先把本地存档快照到 `starEmber.save.v20.backup`；本地非 pristine 时必须弹「本地进度 vs 云端进度」对比让玩家选择；或让 `bootstrapPlayer` 接收本地进度做 server 端合并

### B7. 关掉「自动恢复云存档」会导致进度回滚
- 证据：`persist(){ state.lastLogin=...; if(!cloudMode) saves.save(state) }` —— 云模式下**永远不写本地存档**，本地 `localStorage` 里留着的还是「连接云端之前」的旧存档；而 `toggleCloudAuto` 关掉后，下次启动 `restoreCloudSilently` 直接 return
- 影响：云模式玩几天 → 设置里关掉自动恢复 → 刷新 → 看到的是连接前的旧档（顶栏显示「本地试玩」），玩家会认为进度丢了
- 修复：云模式下每次成功写入后同时镜像一份到 `localStorage`；或在关闭自动恢复时二次确认

### B8. 战斗结算/回放定时器跨页面泄漏
- 证据：`battleReplay` 里 `battleTimer=setInterval(...render()..., 520/ui.battleSpeed)`，只有 `battleRecordClose`/`battlePause`/播完自身会 clear；`data-tab` 切换和 `battle()` 都不 clear
- 影响：在 探索→扫荡/记录 点「播放战斗」后立刻切到首页 → 首页被每秒重绘 2 次、每帧触发音效与震动，播完后还会把结算弹窗**弹到首页上**
- 修复：在 tab 切换与新战斗开始时 clearInterval

### B9. 十连结算弹窗的层级低于顶栏（可点穿并且卡住）
- 证据（CSS）：`.m211-gacha-summary-layer{z-index:82}`，而 `.v216-topbar{z-index:110}`、`.m204-more-layer{z-index:72}`（其它 `.v10-modal-layer` 是 5000）
- 影响：十连结算弹窗打开时点顶栏 ✉ 会「穿过去」跳转，弹窗却继续留着；点 ✦ 快捷菜单，快捷面板被压在弹窗下面（按钮像失灵）；唯一可靠出口是右上角 36px 的「×」
- 修复：去掉这条 z-index 覆盖；切页时同时 `gachaSummaryOpen=false`

### B10. 战斗中启动时云恢复失败被静默吞掉
- 证据：`restoreCloudSilently('启动')` 的 catch 只 `console.warn('[cloud-auto-restore]', e)`，随后 `bootMessage = cloudMode ? '云存档已恢复 · 星轨就绪' : '星轨已就绪'`
- 影响：云玩家看到「星轨已就绪」其实是在玩旧本地档，且此后所有操作写进本地（`cloudMode=false`），与云端分叉；下一次恢复成功又会把这段进度丢掉。实测日志里反复出现 `[cloud-auto-restore] Error: CLOUDBASE_SDK_LOAD_FAILED`，玩家侧零提示
- 另：启动恢复有 `Promise.race(..., 2400ms)` 超时，弱网必然失败且不会重试
- 修复：给玩家非阻塞提示 + 重试按钮；恢复待定期间禁止写本地

### B11. `saveUi()` 没有容错，而它被放在导航路径上
- 证据：`function saveUi(){ localStorage.setItem(UI_KEY, JSON.stringify(ui)) }`（无 try/catch），调用点包含 `markBadgeSeen()`；而 `routeToSystem()` 里是 `tab=target; markBadgeSeen(tab); window.scrollTo(0,0); render()`
- 影响：`localStorage` 满（QuotaExceededError，实测可复现）或 iOS 无痕模式下：点「前往」→ `saveUi` 抛异常 → `render()` 不执行 → **界面毫无反应，但 tab 变量已经改了**，下一次无关渲染会把玩家瞬移到另一个页面。同理教程的「跳过/下一步」、云连接（`cloudMode=true` 之后抛错）都会出现假错误提示
- 修复：`try{...}catch{console.warn}` 包住，UI 状态以内存为准

---

## 三、中等问题（玩法/交互缺陷）

### B12. 教程按钮跳错页（数组错位）
- 证据：`tutorialOverlay()` 里每步都声明了 `tab:'home'/'gacha'/'heroes'/'formation'/'explore'`，但**这个字段从未被读取**；`tutorialNext` 用的是另一个数组 `['gacha','heroes','formation','explore']`，用同一个 `ui.tutorialStep` 索引 → 第 2 步（CTA「查看契约」）跳到「契灵」，第 3 步跳到「编队」，第 4 步跳到「探索」
- 影响：全程有全屏遮罩，正常点击时看不出来；一旦中途点「跳过」就会落到与按钮不一致的页面

### B13. 首次十连引导会「吞掉」一次点击并强制消费
- 现象：第一次进「契约」页会弹 FIRST CONTRACT 弹窗，其主按钮 `firstContractStart` 会**立即执行十连并扣 10 契灵印**（不是打开确认框）
- 实测：我的自动化流程在「关闭弹窗」的通用逻辑里误点了这个按钮，直接消耗了 10 张券（`p6` 记录）。真人玩家误触的概率同样存在，而新手只有 30 张券
- 修复：主按钮改为「二次确认」或至少加一次「消耗 10 契灵印，确定？」；弹窗的「稍后」应更显眼

### B14. 「战斗演出速度 ×1 / ×1.5 / ×2」对自动战斗完全无效，且只影响回放
- 证据：自动战斗是同步跑完并瞬间出结果（`G.battle()` 同步），`battleSpeed` 只用在回放 `setInterval` 间隔上
- 影响：设置里的「战斗演出速度」在正常推图时是没有任何作用的，玩家会以为是 bug

### B15. 战斗主力按钮需要先滚过一屏策略面板
- 现象：探索页的主 CTA 在页面**中段**（实测 360×640 时 y≈436，430×932 时 y≈728，都还在视口内——这点没问题），但把「战斗模式」切到「手动技能」后，页面会停在下方（我用 `scrollIntoView` 点开关后 `scrollY=427`），此时 CTA 跑到视口上方（实测 y=-30），必须手动往上滚才能点「开始手动战斗」
- 修复：任何切换后 `window.scrollTo(0,0)`，或把策略开关做成吸顶/抽屉

### B16. 大量可点元素小于 44×44（移动端误触）
实测（见 `p18-layout.json`）：
- 顶栏 ✉ / ✦ / ⚙：**31×31**（≤700px 时），云存档「连接」按钮 **38×38**
- 弹窗「×」：36×36；子页「‹ 返回」「快捷」：32×34 / 36×34
- 设置页所有开关：高 36；`.btn.compact` 高 38（领取 / 挑战 / 整备 / 兑换 / 前往契约 全是它）
- 首页「扫荡 / 培养」：高 43；`探索` 页 tab 高 52 没问题
- 最小的是 `.text-btn`（如战斗页「撤离战斗」「前往整备」）：padding 0、字号 11px，实际高度约 15px —— 而它恰好是卡在手动战斗里时唯一的正规出口
- 另有 3 个 tiny（<32px）目标：顶栏三连

### B17. 编队页过长，关键按钮被压在最后
- 实测：编队页文档高 **2940px**（375 宽），需要滚动 2273px；「阵容预设（保存/载入）」在页面最底部，「职业克制与编队提示」还在更下面
- 候选契灵列表 11~15 张卡片铺成长列表，是页面膨胀主因；建议候选列表限高 + 内部滚动 / 分页 / 折叠

### B18. 活动页底部「兑换」按钮被底部导航挡住
- 实测（375×667，滚到最底）：月蚀商店第二个兑换按钮 `eventBuy` rect top=638 bottom=676，而固定导航 top=**595** → 按钮整块被压在导航下面，且已经到 `maxScroll`，**无法通过滚动把它露出来**（导航是 `position:fixed`，`.app` 只留了 86px 内边距，而活动卡片的横向滚动区在导航覆盖带里）
- 影响：小屏机上无法兑换部分商品

### B19. 设置里的「音乐」是幽灵开关（游戏根本没有 BGM）
- 证据：`ui.music` 只被一个孤立的 `data-action==='toggleMusic'` 分支写入，**全项目没有任何地方渲染这个按钮**，也没有任何音频播放代码（全文没有 `new Audio` / `bgm` / `.play()`）；`sfx()` 只判断 `ui.sound`
- 现象：设置面板只有「音效 / 角色语音 / 触感 / 契约演出 / 速度 / 特效质量 / 云存档」；一个卡牌手游完全没有背景音乐，音效也只是 WebAudio 振荡器合成的「嘟嘟」声（`sfx()` 用 oscillator 生成 420/620/960Hz）
- 这是体验层面最明显的短板之一

### B20. 「视觉特效质量 = 中」几乎无效
- 证据：整个 212KB CSS 里 `.fx-medium` 只有**一条**规则（`.fx-medium .v11-comet{opacity:.55}`）；`fx-low` 才是真的（关动画/减星）。玩家选「中」等于没选

### B21. 迁移码输入框会被任意重渲染清空
- 证据：`<input id="linkCodeInput">` 位于 `#app` 内，而 `render()` 是 `app.innerHTML=...` 整体替换；会触发无操作重渲染的事件包括 `star-ember-assets-ready`（资源预载完成，启动后几秒）、`connection.change`、`refreshCloudSilently`、奖励/成长特效定时器
- 影响：跨设备迁移时正输入 6 位码 → 被清空，需要重输；且输入框没有 `inputmode="numeric"`（不弹数字键盘），生成的迁移码也没有「复制」按钮

### B22. 键盘/全屏在 iOS 上零反馈
- `toggleBattleFullscreen()`：iPhone 上 `document.documentElement.requestFullscreen` 不存在，可选链调用**不抛错**故 catch 里的 toast「当前浏览器暂不支持全屏模式」永远不会出现 → 点 ⛶ 毫无反应

### B23. 音效在 iOS 可能整局静音
- 证据：`audioCtx ||= new (window.AudioContext||window.webkitAudioContext)()` 在 `sfx()` 里懒创建，全文**没有 `audioCtx.resume()`**，也没有首次手势解锁
- 影响：若首次创建发生在非用户手势上下文（例如回放 interval、`await` 之后的动作），Safari 会保持 suspended，之后所有音效静音且无提示

### B24. Service Worker 更新/离线策略偏危险
- `install` 用 `addAll([...CORE,...STATIC])`（16 个 URL）**全有或全无**：任何一个 404 就整个安装失败 → 用户被永久钉在旧版本且无提示
- `skipWaiting()` + `clients.claim()` 会在页面仍运行旧 JS 时换掉缓存，而 app 侧（`register('./sw.js?v=2.1.8')`）**没有 `controllerchange` 处理、没有「发现新版本，点击刷新」提示**
- `networkFirst(req, fallback)` 对非导航请求 fallback 传 `null` → 离线时拿不到缓存就直接抛错（若 index.html 缓存引用了已被删除的哈希资源，会白屏）
- 我实测到缓存名是 `star-ember-v218-full-ui`（57 个条目），而本地源码的 sw.js 缓存名是 `star-ember-v21-ui-fidelity220` —— **线上/本地两套缓存并存**，说明发版流程里缓存版本号没有统一

### B25. 顶栏「✦N」角标语义不清
- 实测：全新号顶栏是 `◎30 ✉ ✦5 ⚙`，实际契灵印是 30（资源抽屉里也是 30），`✦5` 是「快捷菜单待处理事项数」（= `topNoticeCount()`：事务所在内的事务 + 活动剩余次数）
- 问题：✦ 在游戏里是「星髓/契灵印」一类的资源图标，这里又被当作通知点，玩家很容易误读；建议换成「·」或直接用数字气泡

### B26. 文本被 CSS 截断且无法查看全文
- `.toast{white-space:nowrap; max-width:90vw; overflow:hidden; text-overflow:ellipsis}` —— 扫荡/夜航奖励汇总、所有错误提示都可能被截断
- `.m212-journey-main small{max-width:190px; ellipsis}` —— 首页「今日星轨」的目标说明
- `.m204-subpage-head p{nowrap; ellipsis}` —— 所有子页副标题
- 建议：toast 允许换行或点击展开

### B27. 空 `src` 图片会重复请求整个文档
- 证据：`portrait()` 里 `<img class="v19-portrait-skill" src="${skill}">`，`skill = window.StarEmberAssets?.skill(h.id) || ''` —— 其它所有图片都有 `||fallback`，只有这个没有
- 后果：如果 `asset-loader.js` 被拦/加载失败，每个头像都会输出 `src=""`，浏览器会把空 src 解析为当前文档地址 → 每次渲染产生几十个页面级请求（实测加载失败时控制台会刷 404/重复请求）

### B28. 存档健壮性
- ✅ 已验证良好：`localStorage` 被写成非法 JSON、字段类型全错（`coin:'NaN'`, `heroes:null`, `stage:-5`）时，`migrate()` 能把存档修复成合法状态并正常启动（`p21-offline.json`）
- ⚠️ 但：`saveUi()` 溢出会抛异常（见 B11）；`localStorage` 满时存档保存会 toast `LOCAL_SAVE_FAILED`，玩家唯一的补救是「连接云端」——而云端是坏的（B1/B2）

---

## 四、轻微问题 / 打磨项

| 编号 | 问题 | 证据 |
|---|---|---|
| B29 | 每次点击都会整体重建 DOM 2~3 次（`action()` 进出一共 2 次 `render()`，分支里还有），会丢失 `<details>` 展开状态（顶栏资源抽屉、卡池规则、锻造）与输入焦点 | `action()` / `render()` |
| B30 | 自动战斗后战报竞技场显示的是第 0 帧（满血）却挂着 VICTORY 徽章 | `battle()` 里 `battleFrame=0` |
| B31 | 手动战斗的「选择目标」被自动预选（`adoptLiveSession` 把 `selectedBattleTargetId` 设为第一个目标），宣称的目标选择机制形同虚设 | `adoptLiveSession()` / 技能按钮 `disabled` 条件 |
| B32 | `interactionLocks` 只增不减（key 含 `data-id`，如单位 id），长时间会话下无界增长 | `const interactionLocks=new Map()` |
| B33 | 死代码：`reset`（重置本地试玩）有完整确认框实现，但**全项目没有渲染入口**；`battle2x`（一键 2×）也没有按钮 | 全量 `data-action` 对账：无「有按钮无处理」，但有 2 个「有处理无按钮」 |
| B34 | 快捷编队按钮在新号上必定报错：「该阵容预设尚未保存」（同页的预设按钮有 `disabled` 保护，页头这个没有） | 实测 toast |
| B35 | 原始英文/JS 错误串会直接展示给玩家：`toast(errorText(e.code||e.message))`，未映射的 code 或 `TypeError` 原文（如 `Cannot read properties of undefined`）会出现在提示里 | `action()` 的 catch |
| B36 | 离线连接云端时点了等于没点：`syncCloud` 在 `!onlineNow()` 时直接 throw，界面无任何 toast（实测 toast=null） | `p21-offline.json` |
| B37 | 首次运行打开 PWA 快捷方式（`?tab=gacha` 等）时，若教程未完成则忽略 tab 参数，落到首页并继续教程；教程完成后才生效 | `p30-deeplink.json` |
| B38 | 深链 `?tab=gacha` 时底部导航高亮「首页」（`nav()` 里 gacha 被 alias 到 home），玩家会觉得导航与内容不符 | `p30-deeplink.json` |
| B39 | 卡池 tab 上显示的保底数字含义模糊：`星契轮 0/50` 与 `SSR 保底 0/50` 是同一个值，容易被读成「已抽/上限」还是「距离保底」，建议改成「距保底还差 N 抽」 | `p29-misc.json` |
| B40 | 事务所有 14 项待处理时导航角标只显示 9（`Math.min(9,...)`），且徽标样式没有「99+」逻辑（`badgeText` 有但导航没用） | `nav()` / `p29` |
| B41 | 无 `aria-label` 的关闭按钮（所有 `.v10-close` 只有「×」）、导航无 `aria-current`、弹窗无 `role="dialog"`/焦点管理；全项目只有 6 处 aria-label | 静态审计 |
| B42 | 页面始终多出 83px 可滚动空白（`.toast` 固定定位 `bottom:calc(74px+safe)` 撑大了 `scrollHeight`），与内容无关 | `p35-cta.json`：`docH - innerH = 83`（所有视口一致） |
| B43 | 版本号不一致：线上 `version.json`=2.1.8 / 本地源码=2.2.0 / sw 缓存=star-ember-v218-full-ui / 本地 sw=star-ember-v21-ui-fidelity220；SW 预缓存的 CSS/JS 文件名是**带哈希的**（`app.433d269d88.js`），每次发版都要改 sw.js，极易漏改导致缓存失效或钉旧版 | 实测 + 静态审计 |
| B44 | `manifest.webmanifest` 缺 `screenshots`（Chrome 安装横幅/应用商店卡片会退化为无图），`icons` 用 `purpose:"any maskable"` 同一张图（推荐分离 maskable 图），`lang` 未设置 | 实测 manifest 拉取 |
| B45 | 自动战斗的策略差异几乎不可感知：均衡/爆发/生存 12 场平均伤害 1583 / 1572 / 1649，只有治疗与护盾有区别，「爆发」的承诺效果没体现 | `p36-engine.json` |
| B46 | **连携技实测触发率 0**：3 种策略 × 12 场（stage 20）`combosUsed` 全为空，`avgCombos=0`，疑似触发条件过严 | `p36-engine.json` |
| B47 | 中后期难度陡增：满级（Lv.50×5 人）无装备队伍 stage 15 起必败，stage 30 只撑 22 行日志 | `p36-engine.json` |
| B48 | `enemyTeam()` 返回的对象只有 `hp` 没有 `maxHp`，而战斗单位是 `hp+maxHp`；做数值/调试工具时会读到 0 | `p37-class.json` |
| B49 | 手动战斗在**单人队伍**下会直接跑完（`status:'complete'`、`pending:null`），玩家完全看不到指令阶段 | `p38b-dmg.json` |
| B50 | 限定池文案「当前 SSR 中 UP 概率 50%」低于实测 67.6%（因「非 UP 后下次必 UP」的补偿），会让玩家低估收益 | `p36-engine.json` |

---

## 五点五、引擎层面实测数据（在线上版本里直接调用 `window.STAR_EMBER_GAME` 跑出来的）

### 5.1 抽卡数值：与界面描述完全一致 ✅
- 常驻池 **3000 次单抽**：SSR 115（**3.83%**）、SR 648（21.6%）、R 2237（74.57%）；**最大保底间隔 50**，无一次超过 50（`gapsOver50=0`），平均间隔 25.94
- 限定池 **2000 次单抽**：SSR 71（**3.55%**）、**最大间隔 60**（`gapsOver60=0`）、平均 27.82；其中 **67.6% 是 UP 角色**（夜岚）
  - 说明：界面上写「当前 SSR 中 UP 概率 50%」，实测 67.6% 是因为「非 UP 后下一次 SSR 必为 UP」的补偿机制把综合概率抬高了 —— 数值对玩家有利，但**文案写 50% 会让玩家低估**，建议改成「首次 50%，未中则下次必中」
- 重复转化 10/20/40 碎片（R/SR/SSR）实测一致

### 5.2 扫荡收益随关卡线性增长 ✅
| Stage | 5 次扫荡烬币 | 星铁 | 星痕点 | 遗物 |
|---|---|---|---|---|
| 1 | 1025 | 20 | 1 | 0 |
| 5 | 1525 | 20 | 0 | 0 |
| 10 | 2150 | 40 | 0 | 0 |
| 20 | 3400 | 40 | 0 | 1 |
| 30 | 4650 | 40 | 0 | 0 |

高关卡额外给遗物（stage≥20 有概率），与文案「高阶裂境还有概率掉落 SSR 装备与遗物」一致

### 5.3 Boss 阶段与破韧机制确实生效 ✅
- Stage 5 / 10 的 Boss 战日志里能看到**阶段提示**与**BREAK/破韧**文本（`hasPhaseText=true, hasBreak=true`），战斗长度 120/176 行、时间轴 100/140 帧，说明血量与阶段切换都跑到了
- ⚠️ 但 **Stage 15 / 20 / 25 / 30 全部失败**：我用「15 名角色全 Lv.50、无装备、5 人上阵」的队伍去打，15 关起就赢不了（第 30 关只撑了 22 行日志）。这说明**中后期难度曲线偏陡**，或者战力体系里装备/星级/天赋的权重远大于等级——建议你确认一下这是不是设计预期：满级无装备队伍连主线中段都过不去，玩家容易卡死

### 5.4 自动策略（均衡/爆发/生存）差异存在但很弱 ⚠️
同一支队伍各跑 12 场（stage 20）：
| 策略 | 平均伤害 | 平均治疗 | 平均护盾 |
|---|---|---|---|
| 均衡 | 1583 | 951 | 145 |
| 爆发 | 1572 | 865 | 21 |
| 生存 | 1649 | 674 | 210 |
- 三种策略的伤害几乎一样（1572~1649，同一量级），只有「治疗/护盾」有明显区别；「爆发」策略并没有表现出「优先压低血量目标快速击杀」的承诺效果
- 另外 **`avgCombos = 0`**：12 场 × 3 策略全部没有触发任何连携技（`combosUsed` 为空）。连携技系统在实战中可能极难触发，建议检查触发条件是否过严

### 5.5 职业克制系统：**功能正常** ✅（我先前的怀疑已被推翻）
- `ROLE_CLASS` 把「强攻/刺击→assault、术式→arcane、控制→control、防御→guard、辅助/治疗→support」映射正确，敌我单位都带 `combatClass` 字段
- `classMultiplier` 实测返回正确的 8 组非中立关系：突击>术式=1.18、突击>守御=0.88、术式>控制=1.18、控制>守御=1.18、守御>突击=1.18 等，与编队页「克制 +18% · 被克制 -12%」文案一致
- `applyDamage(target, amount, actor)` 在所有伤害路径（普攻 L583、技能 L586、Boss 各技能 L607-613）都会乘上该系数 ✅
- 唯一注意点：`support` 职业（青禾、白砚、潮生等治疗/辅助）**永远不吃克制也不被克制**（函数里 `a==='support'||b==='support' return 1`），UI 也写了「支援中立」，属设计

### 5.6 顺手发现的小问题
- `enemyTeam()` 返回的敌人只有 `hp` 字段（没有 `maxHp`），而战斗单位是 `hp + maxHp`。做数值/调试工具时容易踩坑（我用 `maxHp` 读敌人血量时全是 0）
- 手动战斗的 `startBattleSession` 在**单人队伍**下会直接跑完（`status:'complete'`、`pending:null`），玩家看不到任何指令阶段 —— 属于边缘情况，但如果是「1 人队想手动操作」的场景会困惑

---

## 五、做得好的地方（已逐项验证）
- 抽卡数值与描述一致：`x<0.03→SSR / x<0.25→SR / 其余 R`（3%/22%/75%），50 抽保底、限定 60 抽保底 + 非 UP 后必 UP（`guaranteed`）、首十连 SSR 保障都按文档执行；重复转化 10/20/40 碎片也正确（3000+2000 次实测）
- 等级上限 50、星级上限 5、觉醒门槛（Lv.30 + 5★ + 核心）、装备强化上限 +10、升星消耗 30/60/120/200、天赋消耗 1/2/3 及前置链都正确
- 反「重复扣费/重复领取」在**同一天内**做得不错：`busy` 全局忙标志 + `interactionAllowed` 的 risky 锁；成就 / 邮件 / 签到 / 每日 / 每周 / 首十连都无法重复领取；商店与两个活动商店的限购、资源裂境次数、每日 10 次扫荡都正确扣减
- 职业克制系统**真实生效**（突击→术式→控制→守御→突击，±18%/-12%），并在所有伤害路径上应用；阵营共鸣、前后排、连携技数据结构完整
- 战斗循环不会死锁（36 回合上限，所有分支都会推进）；Boss 阶段与破韧机制实际跑通
- 「锻造→分解」是净亏的（-70 / -240 尘），不存在正期望套利；羁绊赠礼在 800 点/5 级正确封顶
- 断网后本地玩法（战斗、抽卡、养成）全部正常，不报错、不卡死；SW 缓存命中良好（冷启动 57 个条目）
- 性能：主线程无长任务，DOM 约 188 节点，30 次重渲染 21ms，100 次切页内存增长 0.1MB，无可感知泄漏
- 安全面：`cloud-config.js` 未泄露 accessKey（匿名身份走 `signInAnonymously`），前端无写死密钥；线上引擎与服务端 `_shared/game.js` 逐行一致，没有前后端规则分叉
- ⚠️ 但请注意：以上「反重复领取」只挡住了**同一游戏日内的重复点击**，跨日/改日期的情况见 E2

---

## 六、修复优先级建议

**第一批（经济与数据安全，建议立刻修）**
1. **E1**：新手武器重复发放 → 无限锻造尘（加一次性标记即可，改动 1 行）
2. **E2**：所有每日/每周重置依赖本地日期且可回溯 → 加 `lastSeenDay` 单调保护；云模式下把重置搬到服务端
3. **E3**：同一关可重复结算 → 发奖移进关卡判断内 + 给 `battle()` 补会话互斥
4. **E4**：畸形存档让 `migrate()` 抛异常 → 补类型校验（这是「读档失败 = 玩家进度丢失」级别）
5. **E5**：NaN 成就进度白拿星髓 → `filter(Number.isFinite)`

**第二批（云与核心体验）**
6. **B1 + B2**：云存储现在等于不存在（CDN 404 + 云函数 403），需要一起修
7. **B6 + B7**：云存档覆盖/回滚保护（一旦云修好就是数据丢失级事故）
8. **B4**：自动战斗结算面板改为显示（一行代码，收益最大）
9. **B5 + B9**：导航丢失与弹窗层级（会把玩家卡住）
10. **B11**：`saveUi` 容错（牵涉教程、导航、云连接三条主流程）

**第三批（体验打磨）**
11. **B8 + B23**：定时器泄漏与 iOS 音频解锁
12. **B15 + B16 + B17 + B18**：移动端布局与触控尺寸（影响所有小屏玩家）
13. **B19 + B20 + E7**：补 BGM、修「中」档特效、让新号能收到系统邮件
14. **B13 + B24 + B43**：误触消费、SW 更新提示、发版缓存版本统一

---

## 附：复现要点索引

| 问题 | 复现步骤 |
|---|---|
| E1 | 卸下并分解 eq001 → 刷新页面 → eq001 回来了且自动装备 → 再分解……实测 200 轮得 5025 锻造尘 |
| E2 | 调系统时间（或改存档里的 day/week 键）→ 签到/每日/扫荡/商店/活动次数全部重置；日期倒退也能再领一次 |
| E3 | 起一场手动战斗停在指令阶段 → 再打一场自动战斗（能打赢）→ 回来把手动战斗打完 → 同一关拿两次奖励 |
| E4 | 把存档改成 `{"formation":"h004"}` 或 `{"heroes":{"h004":null}}` → 读档抛异常 |
| E5 | 存档 `inventory.enhance` 里放一个非装备 ID 的键（如 `eq999_legacy:"x"`）→ 直接领「任意装备强化至+5」成就得 120 星髓 |
| E7 | 全新号进「事务所→邮件」→ 空的，永远收不到系统补偿邮件 |
| B1 | 首页点「连接」→ 立刻报「云端组件加载失败」；网络面板可见 SDK 404 |
| B4 | 首页「继续主线」→ 胜利后：无结算面板、无掉落、无 MVP；失败后：完全无提示 |
| B5 | 探索 → 战斗模式切「手动技能」→ 开始战斗 → 点顶栏 ✉ → 事务所页也看不到底部导航 |
| B9 | 十连 → 结算弹窗出现时点顶栏 ✉ → 页面跳转但弹窗仍在 |
| B13 | 首次进「契约」→ 点主按钮 → 直接扣 10 券开抽，无二次确认 |
| B17 | 编队页滚到底：预设按钮在 2900px 处 |
| B18 | 375×667 进「活动」→ 滚到底 → 月蚀商店第二个「兑换」被导航完全覆盖 |
| B19 | 设置页找 BGM：没有音乐开关，游戏全程无背景音乐 |
| B24 | 断网后重载可正常进入游戏；但发新版本时旧 SW 不会提示刷新 |
| B36 | 断网点「连接」→ 无任何提示 |
