const fs=require('fs'),vm=require('vm'),assert=require('assert');
const appEl={innerHTML:''};
global.window=global;
global.localStorage={_m:new Map(),getItem(k){return this._m.get(k)||null},setItem(k,v){this._m.set(k,v)},removeItem(k){this._m.delete(k)}};
global.document={getElementById(id){return id==='app'?appEl:null},querySelectorAll(){return[]},querySelector(){return null},createElement(){return{className:'',textContent:'',remove(){}}},body:{appendChild(){}}};
global.confirm=()=>false;global.navigator={};global.location={protocol:'file:'};
global.StarEmberCloud={configured:()=>false,meta:()=>({}),loadPlayer:async()=>({}),gacha:async()=>({}),limitedGacha:async()=>({})};
window.StarEmberCloud=global.StarEmberCloud;window.StarEmberAssets={heroPortrait:(id)=>`assets/characters/${id}.jpg`,skill:(id)=>`assets/ui/skills/${id}.svg`,status:(id)=>`assets/ui/status/${id}.svg`,boss:(s)=>`assets/ui/bosses/stage-${s}.svg`,bg:(id)=>`assets/ui/backgrounds/${id}.svg`};
vm.runInThisContext(fs.readFileSync('web/game-data.js','utf8'),{filename:'game-data.js'});
vm.runInThisContext(fs.readFileSync('web/app.js','utf8'),{filename:'app.js'});
assert.ok(appEl.innerHTML.includes('v216-lobby'),'v2.1.8 mobile lobby should render');
assert.ok(appEl.innerHTML.includes('STAR EMBER COVENANT'),'brand should render');
assert.ok(appEl.innerHTML.includes('v216-quick-rail'),'home quick rail should render');
assert.ok(appEl.innerHTML.includes('v09-nav'),'nav should render');
assert.ok(appEl.innerHTML.includes('v10-boot'),'boot overlay should render');
assert.ok(appEl.innerHTML.includes('v216-star-route'),'today star route should render');
assert.ok(appEl.innerHTML.includes('每日任务')&&appEl.innerHTML.includes('本周进度'),'home task progress cards should render');
vm.runInThisContext('state.stage=5;bossIntroOpen=true;render();');
assert.ok(appEl.innerHTML.includes('v11-boss-intro'),'boss intro should render on boss stage');
vm.runInThisContext('state.stage=1;storyOpen=true;storyIndex=0;render();');
assert.ok(appEl.innerHTML.includes('v12-story-scene'),'story dialogue should render');
vm.runInThisContext('storyOpen=false;lastBattle={win:true,stage:1,rewards:{coin:390,tickets:1},drops:[],formationPower:1000,timeline:[]};resultOpen=true;render();');
assert.ok(appEl.innerHTML.includes('v12-result-card'),'battle result should render');
vm.runInThisContext("resultOpen=false;tab='gacha';gachaViewPool='standard';render();");
assert.ok(appEl.innerHTML.includes('首次常驻十连必得 SSR')&&appEl.innerHTML.includes('v12-newbie-badge'),'newbie gacha label should render');
vm.runInThisContext("ui.tutorialDone=true;ui.firstContractDone=true;tab='heroes';heroViewMode='overview';render();");
assert.ok(appEl.innerHTML.includes('角色档案'),'archive entry should render');
vm.runInThisContext("archiveHeroId='h004';archiveOpen=true;render();");assert.ok(appEl.innerHTML.includes('v13-archive'),'archive overlay should render');
vm.runInThisContext("archiveOpen=false;tab='explore';ui.skillMode='manual';ui.manualSkills=['h004'];render();");assert.ok(appEl.innerHTML.includes('v13-strategy')&&appEl.innerHTML.includes('手动技能'),'battle strategy should render');
vm.runInThisContext("ui.skillMode='manual';liveSession={id:'bs-test14',status:'waiting',round:3,pending:{heroId:'h004',heroName:'青禾',skill:'春息'},allies:[{id:'h004',name:'青禾',hp:1000,maxHp:1200,shield:0}],enemies:[{id:'e1',name:'裂境体',hp:800,maxHp:1000,shield:0}],log:['✦ 青禾「春息」充能完成'],timeline:[]};battleLog=liveSession.log;tab='explore';render();");assert.ok(appEl.innerHTML.includes('v14-live-session')&&appEl.innerHTML.includes('SKILL READY'),'v1.4 live battle command panel should render');
assert.ok(appEl.innerHTML.includes('v15-skill-dock'),'v1.5 five-hero skill dock should render');assert.ok(appEl.innerHTML.includes('v15-energy-ring'),'v1.5 energy ring should render');assert.ok(appEl.innerHTML.includes('v16-strategy'),'battle settings drawer should remain reachable during live combat');assert.ok(!appEl.innerHTML.includes('BATTLE ARCHIVE'),'replay archive should stay out of the active battle focus view');
assert.ok(appEl.innerHTML.includes('m205-battle-focus'),'active battle should use the v2.0.5 focused battle surface');
console.log('v2.0 UI smoke test passed');

vm.runInThisContext("liveSession=null;tab='event';render();");assert.ok(appEl.innerHTML.includes('星港夜航'));vm.runInThisContext("tab='heroes';selectedHeroId='h004';heroViewMode='talent';render();");assert.ok(appEl.innerHTML.includes('TALENT CONSTELLATION')&&appEl.innerHTML.includes('角色天赋')); vm.runInThisContext("tab='formation';render();");assert.ok(appEl.innerHTML.includes('阵容预设'));assert.ok(appEl.innerHTML.includes('m221-formation-stage')&&appEl.innerHTML.includes('选择契灵')&&appEl.innerHTML.includes('五人星轨编成'),'v2.2.1 five-slot mobile formation should render');console.log('v2.0 UI feature smoke passed');

vm.runInThisContext("tab='home';render();");assert.ok(appEl.innerHTML.includes('v216-lobby'),'v2.1.8 visual home should render');vm.runInThisContext("tab='heroes';selectedHeroId='h004';heroViewMode='overview';render();");assert.ok(appEl.innerHTML.includes('v20-skill-icon'),'v2.0 skill art should render');console.log('v2.0 visual UI passed');

// v2.0.4 mobile system regression coverage
vm.runInThisContext("tab='heroes';selectedHeroId='h004';heroViewMode='growth';moreOpen=false;render();");
assert.ok(appEl.innerHTML.includes('m204-growth'),'v2.0.4 hero growth panel should render');
assert.ok(appEl.innerHTML.includes('data-action="star"'),'v2.0.4 star-up control should be reachable');
assert.ok(appEl.innerHTML.includes('data-action="awaken"'),'v2.0.4 awaken control should be reachable');
assert.ok(appEl.innerHTML.includes('data-action="equipSig"'),'v2.0.4 signature weapon control should be reachable');
vm.runInThisContext("moreOpen=true;render();");
assert.ok(appEl.innerHTML.includes('m204-more-sheet')&&appEl.innerHTML.includes('快捷入口'),'v2.1.8 mobile quick sheet should render');
vm.runInThisContext("moreOpen=false;tab='hub';render();");
assert.ok(appEl.innerHTML.includes('今日星约')&&appEl.innerHTML.includes('m207-office-tabs'),'utility hub should render daily tasks with navigable office tabs');
vm.runInThisContext("tab='explore';render();");
assert.ok(!appEl.innerHTML.includes('开发者选项'),'developer controls should be hidden outside debug mode');
console.log('v2.0.4 mobile system regression passed');



// v2.0.5 battle mobile UX regression coverage
vm.runInThisContext("ui.tutorialDone=true;resultOpen=false;lastBattle=null;liveSession={id:'bs-v205',status:'waiting',round:2,pending:{heroId:'h004',heroName:'青禾',skill:'春息',targetMode:'ally',targets:[{id:'h004',name:'青禾'}],energy:90,skillCost:90},allies:[{id:'h004',name:'青禾',hp:900,maxHp:1200,shield:120,energy:90,skillCost:90}],enemies:[{id:'e1',name:'裂境体',hp:800,maxHp:1000,shield:0}],log:['✦ 青禾「春息」充能完成'],timeline:[]};selectedBattleTargetId='h004';tab='explore';render();");
assert.ok(appEl.innerHTML.includes('m205-live-battle'),'v2.0.5 live battle focus should render');
assert.ok(appEl.innerHTML.includes('m205-command-dock'),'v2.0.5 sticky command dock marker should render');
assert.ok(appEl.innerHTML.includes('m205-team-strip'),'v2.0.5 mobile team strips should render');
assert.ok(appEl.innerHTML.includes('data-action="battleFullscreen"'),'v2.0.5 fullscreen action should be reachable');
vm.runInThisContext("liveSession=null;lastBattle={win:true,stage:3,boss:null,rewards:{coin:390,tickets:1},drops:[],formationPower:1200,timeline:[{text:'青禾 发动 春息',allies:[{id:'h004',name:'青禾',hp:1100,maxHp:1200,shield:0}],enemies:[{id:'e1',name:'裂境体',hp:400,maxHp:1000,shield:0}],effect:{kind:'heal',value:120},actor:{id:'h004'},side:'a'}],stats:[{name:'青禾',damage:10,heal:120,shield:0}]};battleFrame=0;tab='explore';exploreViewMode='archive';render();");
assert.ok(appEl.innerHTML.includes('m205-replay-stage'),'v2.0.5 replay stage should render before prep content');
assert.ok(appEl.innerHTML.includes('m205-replay-progress'),'v2.0.5 replay progress should render');
assert.ok(appEl.innerHTML.includes('data-action="battleRecordClose"'),'v2.0.5 replay dismiss control should be reachable');
console.log('v2.0.5 battle mobile UX regression passed');


// v2.0.6 contract / growth / gear regression coverage
vm.runInThisContext("liveSession=null;lastBattle=null;resultOpen=false;revealOpen=false;tab='gacha';gachaViewPool='limited';render();");
assert.ok(appEl.innerHTML.includes('m206-pool-tabs')&&appEl.innerHTML.includes('m206-gacha-stage'),'v2.0.6 gacha pool shell should render');
assert.ok(appEl.innerHTML.includes('data-action="gachaPoolTab"'),'v2.0.6 gacha pool switch should be reachable');
vm.runInThisContext("gachaViewPool='standard';render();");assert.ok(appEl.innerHTML.includes('常驻星契轮')&&appEl.innerHTML.includes('m206-standard-orbit'),'v2.0.6 standard pool should render');
vm.runInThisContext("tab='heroes';selectedHeroId='h004';heroViewMode='overview';render();");
assert.ok(appEl.innerHTML.includes('m206-hero-switch')&&appEl.innerHTML.includes('v218-hero-tabs'),'v2.1.8 hero command tabs should render');
assert.ok(appEl.innerHTML.includes('data-view="growth"')&&appEl.innerHTML.includes('data-view="talent"')&&appEl.innerHTML.includes('data-tab="inventory"'),'v2.1.8 growth, talent and gear should remain reachable');
vm.runInThisContext("tab='inventory';gearSlot='weapon';render();");
assert.ok(appEl.innerHTML.includes('m206-slot-tabs')&&appEl.innerHTML.includes('data-action="gearSlot"'),'v2.0.6 single-slot gear navigation should render');
assert.ok(appEl.innerHTML.includes('m206-gear-list')&&appEl.innerHTML.includes('星烬锻造'),'v2.0.6 gear candidates and forge drawer should render');
console.log('v2.0.6 contract growth gear regression passed');


// v2.0.7 live-ops / utility / shop regression coverage
vm.runInThisContext("liveSession=null;lastBattle=null;tab='event';eventViewMode='eclipse';render();");
assert.ok(appEl.innerHTML.includes('m207-event-tabs')&&appEl.innerHTML.includes('m207-event-stage-rail'),'v2.0.7 eclipse event focus should render');
assert.ok(appEl.innerHTML.includes('data-action="eventViewTab"'),'v2.0.7 event category switch should be reachable');
vm.runInThisContext("eventViewMode='boss';render();");assert.ok(appEl.innerHTML.includes('m207-boss-raid')&&appEl.innerHTML.includes('伤害榜'),'v2.0.7 raid view should render');
vm.runInThisContext("eventViewMode='night';render();");assert.ok(appEl.innerHTML.includes('m207-night-rail')&&appEl.innerHTML.includes('夜航补给'),'v2.0.7 night voyage focus should render');
vm.runInThisContext("eventViewMode='bond';render();");assert.ok(appEl.innerHTML.includes('m207-bond-rail')&&appEl.innerHTML.includes('契灵羁绊'),'v2.0.7 bond focus should render');
vm.runInThisContext("tab='shop';render();");assert.ok(appEl.innerHTML.includes('m207-shop-wallet')&&appEl.innerHTML.includes('m207-shop-list'),'v2.0.7 supply station should render');assert.ok(!appEl.innerHTML.includes('ART DIRECTION'),'player shop should not expose art direction dev copy');
vm.runInThisContext("tab='hub';utilityViewMode='daily';render();");assert.ok(appEl.innerHTML.includes('m207-office-summary')&&appEl.innerHTML.includes('m207-office-tabs'),'v2.0.7 office shell should render');
vm.runInThisContext("utilityViewMode='mail';render();");assert.ok(appEl.innerHTML.includes('星轨邮件'),'v2.0.7 office mail tab should render');
vm.runInThisContext("utilityViewMode='account';render();");assert.ok(appEl.innerHTML.includes('玩家账号'),'v2.0.7 office account tab should render');
console.log('v2.0.7 liveops utility shop regression passed');

// v2.0.8 mobile quality polish regression coverage
vm.runInThisContext("busy=false;booting=false;ui.tutorialDone=true;tab='home';render();");
assert.ok(appEl.innerHTML.includes('v216-progress-cards'),'v2.1.8 lobby progress dock should render');
assert.ok(appEl.innerHTML.includes('m208-page-home'),'v2.0.8 page transition wrapper should render');
assert.ok(appEl.innerHTML.includes('m208-nav'),'v2.0.8 navigation quality layer should render');
vm.runInThisContext("busy=true;busyMessage='测试同步';render();");
assert.ok(appEl.innerHTML.includes('m208-loading-card')&&appEl.innerHTML.includes('测试同步'),'v2.0.8 compact loading feedback should render');
vm.runInThisContext("busy=false;tab='heroes';render();");
assert.ok(!appEl.innerHTML.includes('m208-cloud-nudge'),'v2.0.8 cloud reminder should not occupy non-home gameplay pages');
console.log('v2.0.8 mobile quality polish regression passed');


// v2.0.9 release-readiness regression coverage
vm.runInThisContext("busy=false;booting=false;ui.tutorialDone=true;returnOpen=true;tab='home';render();");
assert.ok(appEl.innerHTML.includes('m209-return-card'),'v2.0.9 returning-player overlay should render');
vm.runInThisContext("returnOpen=false;networkOffline=true;render();");
assert.ok(appEl.innerHTML.includes('m209-network-strip'),'v2.0.9 offline protection strip should render');
vm.runInThisContext("networkOffline=false;settingsOpen=true;render();");
assert.ok(appEl.innerHTML.includes('自动恢复云存档'),'v2.0.9 cloud auto-restore setting should render');
vm.runInThisContext("settingsOpen=false;booting=true;bootProgress=48;bootMessage='正在预载关键资源 2/4';render();");
assert.ok(appEl.innerHTML.includes('m209-boot-progress')&&appEl.innerHTML.includes('48%'),'v2.0.9 boot preload progress should render');
console.log('v2.0.9 release readiness regression passed');


// v2.1.0 release polish regression coverage
vm.runInThisContext("booting=false;returnOpen=false;settingsOpen=false;tab='home';render();");
assert.ok(appEl.innerHTML.includes('v216-star-route')&&appEl.innerHTML.includes('v216-chapter-line'),'v2.1.8 lobby chapter progress should render');
vm.runInThisContext("lastGacha=[{hero:STAR_EMBER_GAME.byId('h001'),featured:true,duplicate:false,fragmentsGained:0},{hero:STAR_EMBER_GAME.byId('h004'),featured:false,duplicate:true,fragmentsGained:10}];revealOpen=true;revealIndex=0;render();");
assert.ok(appEl.innerHTML.includes('m210-reveal-progress')&&appEl.innerHTML.includes('跳过全部'),'v2.1.0 contract reveal presentation should render');
vm.runInThisContext("revealOpen=false;settingsOpen=true;render();");
assert.ok(appEl.innerHTML.includes('触感反馈')&&appEl.innerHTML.includes('契约演出')&&appEl.innerHTML.includes('v2.2.3'),'v2.1.0 feedback settings should render');
console.log('v2.1.0 release polish regression passed');


// v2.1.1 play-session polish regression coverage
vm.runInThisContext("booting=false;returnOpen=false;settingsOpen=false;rewardFx=null;growthFx=null;gachaSummaryOpen=false;tab='home';render();");
assert.ok(appEl.innerHTML.includes('v216-lobby')&&appEl.innerHTML.includes('v216-progress-cards'),'v2.1.8 one-screen lobby core should remain present');
vm.runInThisContext("lastGacha=Array.from({length:10},(_,i)=>({hero:STAR_EMBER_GAME.byId(i===0?'h001':'h004'),featured:i===0,duplicate:i>1,fragmentsGained:i>1?10:0}));revealOpen=false;gachaSummaryOpen=true;gachaPool='limited';render();");
assert.ok(appEl.innerHTML.includes('m211-gacha-summary')&&appEl.innerHTML.includes('再次十连'),'v2.1.1 ten-pull summary should render');
vm.runInThisContext("gachaSummaryOpen=false;lastBattle={win:true,stage:4,rewards:{coin:510,tickets:1},drops:[],formationPower:2200,skillMode:'auto',stats:[{name:'青禾',damage:50,heal:240,shield:0}],timeline:[]};resultOpen=true;render();");
assert.ok(appEl.innerHTML.includes('m211-result-card')&&appEl.innerHTML.includes('本场 MVP')&&appEl.innerHTML.includes('继续推进'),'v2.1.1 battle settlement should render');
vm.runInThisContext("resultOpen=false;rewardFx={title:'测试奖励',subtitle:'',rows:[{icon:'◎',name:'契灵印',value:2}]};growthFx={heroId:'h004',name:'青禾',label:'等级提升',before:'Lv.1',after:'Lv.2',powerGain:20};render();");
assert.ok(appEl.innerHTML.includes('m211-reward-fx')&&appEl.innerHTML.includes('m211-growth-fx'),'v2.1.1 reward and growth feedback should render');
vm.runInThisContext("rewardFx=null;growthFx=null;state.tickets=20;ui.badgeSeen={};markBadgeSeen('gacha');render();");
assert.strictEqual(navBadge('gacha'),'','v2.1.1 acknowledged gacha badge should clear until condition changes');
console.log('v2.1.1 play session polish regression passed');


// v2.1.2 first-10-minute loop regression coverage
vm.runInThisContext("state=STAR_EMBER_GAME.newPlayer('journey-test');ui.tutorialDone=true;ui.firstContractDone=true;tab='home';resultOpen=false;lastBattle=null;render();");
assert.ok(appEl.innerHTML.includes('v216-star-route')&&appEl.innerHTML.includes('今日星轨'),'v2.1.8 home should expose the primary voyage route');
assert.strictEqual(vm.runInThisContext("journeyState().next.id"),'contract','v2.1.2 fresh player first target should be contract');
vm.runInThisContext("state.newbieGacha.claimed=true;render();");
assert.strictEqual(vm.runInThisContext("journeyState().next.id"),'growth','v2.1.2 post-contract target should be growth');
vm.runInThisContext("state.heroes.h004.level=2;state.heroes.h001={level:1,star:1,fragments:0,awakening:0,signature:null,equipment:{weapon:null,armor:null,charm:null}};state.heroes.h002={level:1,star:1,fragments:0,awakening:0,signature:null,equipment:{weapon:null,armor:null,charm:null}};state.formation=['h004'];tab='formation';render();");
assert.ok(appEl.innerHTML.includes('编队')&&appEl.innerHTML.includes('m204-back-home'),'v2.1.8 formation should expose explicit return header');
assert.strictEqual(vm.runInThisContext("journeyState().next.id"),'formation','v2.1.2 post-growth target should be formation');
vm.runInThisContext("state.formation=['h004','h001','h002'];state.formationRows={h004:'back',h001:'front',h002:'front'};tab='explore';render();");
assert.ok(appEl.innerHTML.includes('v218-explore-tabs')&&appEl.innerHTML.includes('m204-back-home'),'v2.1.8 explore should expose focused navigation and explicit return header');
assert.strictEqual(vm.runInThisContext("journeyState().next.id"),'battle','v2.1.2 post-formation target should be battle');
vm.runInThisContext("state.stage=2;state.daily.claimed.login=false;state.loginReward.totalClaims=0;state.loginReward.claimed=Array(7).fill(false);lastBattle={win:true,stage:1,rewards:{coin:200,tickets:1},drops:[],formationPower:1600,skillMode:'auto',stats:[{name:'青禾',damage:100,heal:20,shield:0}],timeline:[]};resultOpen=true;render();");
assert.ok(appEl.innerHTML.includes('resultClaim')||appEl.innerHTML.includes('去领奖'),'v2.1.2 first-win settlement should expose reward handoff when content is claimable');
vm.runInThisContext("lastBattle={win:false,stage:2,rewards:{},drops:[],formationPower:900,skillMode:'auto',stats:[],timeline:[]};resultOpen=true;render();");
assert.ok(appEl.innerHTML.includes('m212-recovery')&&appEl.innerHTML.includes('resultRecover'),'v2.1.2 defeat settlement should expose dynamic recovery route');
assert.ok(STAR_EMBER_GAME.newPlayer('econ-test').tickets>=10,'v2.1.2 starter tickets should cover first ten-pull');
assert.ok(STAR_EMBER_GAME.newPlayer('econ-test').coin>=200,'v2.1.2 starter coin should cover first level-up');
console.log('v2.1.2 first 10-minute loop regression passed');


// v2.1.3 midgame loop regression coverage
vm.runInThisContext("state=STAR_EMBER_GAME.newPlayer('midgame-test');ui.tutorialDone=true;state.newbieGacha.claimed=true;state.heroes.h004.level=2;state.formation=['h004'];state.stage=6;state.daily.claimed={login:true,battle3:true,win2:true,gacha5:true,upgrade1:true};state.daily.progress={login:1,battle3:3,win2:2,gacha5:5,upgrade1:1};state.daily.allClaimed=true;tab='home';render();");
assert.ok(appEl.innerHTML.includes('v216-star-route')&&appEl.innerHTML.includes('今日星轨'),'v2.1.8 midgame star route should render after first-voyage phase');
assert.ok(appEl.innerHTML.includes('v216-secondary-actions')&&appEl.innerHTML.includes('扫荡'),'v2.1.8 daily action summary should render');
vm.runInThisContext("tab='explore';exploreViewMode='campaign';render();");
assert.ok(appEl.innerHTML.includes('v218-explore-tabs')&&appEl.innerHTML.includes('扫荡 / 记录'),'v2.1.8 explore should expose independent action routes without inventing stamina');
vm.runInThisContext("exploreViewMode='resource';render();");assert.ok(appEl.innerHTML.includes('m213-resource-focus'),'v2.1.3 resource focus should remain reachable');
vm.runInThisContext("tab='hub';utilityViewMode='daily';state.daily.progress.battle3=0;state.daily.claimed.battle3=false;render();");
assert.ok(appEl.innerHTML.includes('data-action="taskGo"'),'v2.1.3 incomplete daily tasks should expose direct routing');
vm.runInThisContext("lastBattle={win:true,stage:6,rewards:{coin:590,tickets:1},drops:[{kind:'equipment',item:STAR_EMBER_GAME.equipmentById('eq002')}],formationPower:2500,skillMode:'auto',stats:[],timeline:[]};resultOpen=true;render();");
assert.ok(appEl.innerHTML.includes('m213-drop')&&appEl.innerHTML.includes('data-action="resultGear"'),'v2.1.3 battle drops should explain utility and route to gear');
assert.ok(vm.runInThisContext("taskRoute('resource5').target")==='explore','v2.1.3 weekly resource task should route to explore');
console.log('v2.1.3 midgame loop regression passed');

// v2.1.8 mobile UI redesign coverage
vm.runInThisContext("tab='home';moreOpen=false;settingsOpen=false;render();");
assert.ok(appEl.innerHTML.includes('v216-topbar')&&appEl.innerHTML.includes('v216-resource-drawer'),'v2.1.8 compact top resources should render');
assert.ok(appEl.innerHTML.includes('v216-nav')&&appEl.innerHTML.includes('首页')&&appEl.innerHTML.includes('探索')&&appEl.innerHTML.includes('编队')&&appEl.innerHTML.includes('活动')&&appEl.innerHTML.includes('事务所'),'v2.1.8 five-tab nav should render');
assert.ok(appEl.innerHTML.includes('data-tab="gacha"')&&appEl.innerHTML.includes('data-tab="shop"'),'v2.1.8 hidden systems should remain reachable from home');
vm.runInThisContext("moreOpen=true;render();");
assert.ok(appEl.innerHTML.includes('契约召唤')&&appEl.innerHTML.includes('契灵养成')&&appEl.innerHTML.includes('整备')&&appEl.innerHTML.includes('商店'),'v2.1.8 quick sheet should expose secondary systems');
vm.runInThisContext("tab='explore';exploreViewMode='campaign';render();");assert.ok(appEl.innerHTML.includes('v218-explore-screen')&&appEl.innerHTML.includes('v218-explore-tabs')&&appEl.innerHTML.includes('主线章节'),'v2.1.8 explore hub should use focused mode layout');
vm.runInThisContext("exploreViewMode='resource';render();");assert.ok(appEl.innerHTML.includes('资源裂境')&&appEl.innerHTML.includes('v218-page-stack'),'v2.1.8 resource mode should render independently');
vm.runInThisContext("tab='heroes';heroViewMode='overview';selectedHeroId='h004';render();");assert.ok(appEl.innerHTML.includes('v218-heroes-screen')&&appEl.innerHTML.includes('v218-hero-tabs'),'v2.1.8 hero page should use task tabs');
vm.runInThisContext("heroViewMode='growth';render();");assert.ok(appEl.innerHTML.includes('RESONANCE GROWTH'),'v2.1.8 hero growth mode should render');
vm.runInThisContext("tab='formation';render();");assert.ok(appEl.innerHTML.includes('v218-formation-screen')&&appEl.innerHTML.includes('队伍战力'),'v2.1.8 formation screen should render');
vm.runInThisContext("tab='event';render();");assert.ok(appEl.innerHTML.includes('v218-event-screen'),'v2.1.8 event shell should render');
vm.runInThisContext("tab='hub';render();");assert.ok(appEl.innerHTML.includes('v218-office-screen'),'v2.1.8 office shell should render');
console.log('v2.1.8 mobile UI redesign regression passed');

// v2.2.1 modal/nav hardening coverage
vm.runInThisContext("tab='home';moreOpen=true;render();");assert.ok(appEl.innerHTML.includes('m204-more-layer'),'v2.2.1 modal quick sheet should render');vm.runInThisContext("moreOpen=false;settingsOpen=false;tab='home';render();");assert.ok(appEl.innerHTML.includes('v218-nav'),'v2.2.1 primary page nav should return after modal closes');console.log('v2.2.1 modal/nav hardening regression passed');
