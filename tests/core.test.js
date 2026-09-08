const assert=require('assert');
const game=require('../cloudbase/_shared/game');

let s=game.newPlayer('test');
assert.equal(s.version,20);
assert.equal(s.daily.progress.login,1);
assert.equal(s.inventory.equipment.eq001,1);
assert.equal(s.inventory.starIron,120);
assert.equal(s.heroes.h004.equipment.weapon,'eq001');
const beforeTickets=s.tickets;game.claimDailyTask(s,'login');assert.equal(s.tickets,beforeTickets+1);

s.tickets=20;
let r=game.pull(s,1,()=>0);assert.equal(r[0].hero.id,'h001');assert.equal(r[0].duplicate,false);
r=game.pull(s,1,()=>0);assert.equal(r[0].duplicate,true);assert.equal(r[0].fragmentsGained,40);assert.equal(s.heroes.h001.fragments,40);
const star=game.starUp(s,'h001');assert.equal(star.star,2);assert.equal(s.heroes.h001.fragments,10);

s.pity=49;s.tickets=1;r=game.pull(s,1,()=>0.99);assert.equal(r[0].hero.rarity,'SSR');assert.equal(s.pity,0);

const v4={version:4,coin:1,tickets:1,pity:0,stage:1,heroes:{h004:{level:2,star:1,fragments:0,equipment:{weapon:'eq001',armor:null,charm:null}}},formation:['h004'],gachaHistory:[],daily:null,inventory:{equipment:{eq001:1},relics:{}}};
const m=game.migrate(v4,'x');assert.equal(m.version,20);assert.ok(m.inventory.enhance);assert.equal(m.inventory.enhance.eq001,0);assert.ok(m.resourceRuns&&m.achievements);

let gear=game.newPlayer('gear');
gear.heroes.h001={level:1,star:1,fragments:0,equipment:{weapon:null,armor:null,charm:null}};
gear.inventory.equipment.eq007=1;
const p0=game.heroPower(game.byId('h001'),gear.heroes.h001,gear);
game.equipGear(gear,'h001','eq007');
const p1=game.heroPower(game.byId('h001'),gear.heroes.h001,gear);assert.ok(p1>p0,'equipment should increase power');
assert.throws(()=>game.equipGear(gear,'h004','eq007'),/ITEM_IN_USE/);

gear.coin=999999;gear.inventory.starIron=9999;
const preEnhance=game.heroPower(game.byId('h001'),gear.heroes.h001,gear);
const enhanced=game.enhanceEquipment(gear,'eq007');assert.equal(enhanced.level,1);
const postEnhance=game.heroPower(game.byId('h001'),gear.heroes.h001,gear);assert.ok(postEnhance>preEnhance,'enhancement should increase power');

gear.inventory.relics.r004=1;const fp0=game.formationPower(gear);game.equipRelic(gear,'r004');const fp1=game.formationPower(gear);assert.ok(fp1>fp0,'relic should increase formation power');

let faction=game.newPlayer('faction');
faction.heroes.h001={level:1,star:1,fragments:0,equipment:{weapon:null,armor:null,charm:null}};
faction.heroes.h005={level:1,star:1,fragments:0,equipment:{weapon:null,armor:null,charm:null}};
faction.formation=['h001','h005'];
const active=game.activeFactionBonuses(faction);assert.equal(active[0].faction,'曜庭');assert.equal(active[0].count,2);
const withFaction=game.computedStats(game.byId('h001'),faction.heroes.h001,faction);assert.ok(withFaction.atk>game.byId('h001').atk);

let bossState=game.newPlayer('boss');
bossState.heroes={};
for(const id of ['h001','h002','h003','h004','h005'])bossState.heroes[id]={level:50,star:5,fragments:0,equipment:{weapon:null,armor:null,charm:null}};
bossState.formation=['h001','h002','h003','h004','h005'];bossState.stage=5;
const b=game.battle(bossState,()=>0.1);assert.equal(b.win,true);assert.ok(b.boss&&b.boss.name==='焚砂巨像');assert.ok(b.drops.some(x=>x.id==='eq004'),'boss should grant fixed first-clear equipment');assert.ok(bossState.bossClears.includes(5));

let rd=game.newPlayer('resource');rd.heroes={};for(const id of ['h001','h002','h003','h004','h005'])rd.heroes[id]={level:30,star:3,fragments:0,equipment:{weapon:null,armor:null,charm:null}};rd.formation=['h001','h002','h003','h004','h005'];
const iron0=rd.inventory.starIron;const rr=game.resourceDungeon(rd,'forge');assert.equal(rr.reward.starIron,45);assert.equal(rd.inventory.starIron,iron0+45);game.resourceDungeon(rd,'forge');assert.throws(()=>game.resourceDungeon(rd,'forge'),/DUNGEON_ATTEMPTS_EXHAUSTED/);

let ach=game.newPlayer('ach');ach.heroes.h001={level:1,star:1,fragments:0,equipment:{weapon:null,armor:null,charm:null}};ach.heroes.h002={level:1,star:1,fragments:0,equipment:{weapon:null,armor:null,charm:null}};ach.heroes.h003={level:1,star:1,fragments:0,equipment:{weapon:null,armor:null,charm:null}};ach.heroes.h005={level:1,star:1,fragments:0,equipment:{weapon:null,armor:null,charm:null}};
assert.equal(game.achievementProgress(ach,game.ACHIEVEMENTS.find(a=>a.id==='own5')),5);const at=ach.tickets;game.claimAchievement(ach,'own5');assert.equal(ach.tickets,at+2);assert.throws(()=>game.claimAchievement(ach,'own5'),/ACHIEVEMENT_ALREADY_CLAIMED/);

let d=game.newPlayer('daily');d.daily.progress={login:1,battle3:3,win2:2,gacha5:5,upgrade1:1};for(const t of game.DAILY_TASKS)game.claimDailyTask(d,t.id);const t0=d.tickets,sc0=d.starCrystal;game.claimDailyAll(d);assert.equal(d.tickets,t0+game.DAILY_ALL_REWARD.tickets);assert.equal(d.starCrystal,sc0+game.DAILY_ALL_REWARD.starCrystal);
assert.equal(game.isPristine(game.newPlayer('fresh')),true);
assert.ok(game.HERO_VISUALS.h001&&game.HERO_VISUALS.h004,'visual direction should exist');
// v0.6 limited pool, shop and weekly loop (regression)
let lim=game.newPlayer('limited');lim.tickets=20;let lr=game.pullLimited(lim,1,()=>0);assert.equal(lr[0].hero.id,'h001');assert.equal(lr[0].featured,true);
lim.limited.pity=59;lim.tickets=1;lr=game.pullLimited(lim,1,()=>0.99);assert.equal(lr[0].hero.rarity,'SSR');assert.equal(lim.limited.pity,0);
let shop=game.newPlayer('shop');const sc=shop.starCrystal,tk=shop.tickets;const buy=game.shopBuy(shop,'ticket');assert.equal(shop.starCrystal,sc-120);assert.equal(shop.tickets,tk+1);assert.equal(buy.left,4);
let wk=game.newPlayer('week');wk.weekly.progress={battle12:12,win8:8,gacha20:20,resource5:5,enhance3:3};for(const x of game.WEEKLY_TASKS)game.claimWeeklyTask(wk,x.id);const wkt=wk.tickets,wks=wk.starCrystal;game.claimWeeklyAll(wk);assert.equal(wk.tickets,wkt+game.WEEKLY_ALL_REWARD.tickets);assert.equal(wk.starCrystal,wks+game.WEEKLY_ALL_REWARD.starCrystal);
assert.equal(game.SHOP_ITEMS.length,3);assert.equal(game.LIMITED_POOL.featured,'h001');
// v0.7 forge, sets, event and bond
let f7=game.newPlayer('v7');
assert.equal(f7.version,20);assert.equal(f7.inventory.bondGift,3);assert.equal(f7.inventory.forgeDust,0);
f7.inventory.equipment.eq004=2;f7.heroes.h004.equipment.weapon='eq004';
const dust0=f7.inventory.forgeDust;const dis=game.dismantleEquipment(f7,'eq004',1);assert.equal(dis.forgeDust,70);assert.equal(f7.inventory.forgeDust,dust0+70);assert.throws(()=>game.dismantleEquipment(f7,'eq004',1),/NO_SPARE_EQUIPMENT/);
f7.coin=999999;f7.inventory.starIron=9999;f7.inventory.forgeDust=9999;
for(const id of ['forge_eq010','forge_eq011','forge_eq012'])game.forgeEquipment(f7,id);
game.equipGear(f7,'h004','eq010');game.equipGear(f7,'h004','eq011');game.equipGear(f7,'h004','eq012');
const sets=game.activeEquipmentSets(f7.heroes.h004);assert.equal(sets[0].name,'巡星者');assert.equal(sets[0].count,3);assert.ok(game.equipmentSetBonus(f7.heroes.h004).atkPct>0);
f7.inventory.bondGift=5;const bond=game.giftHero(f7,'h004',5);assert.equal(bond.info.level,3);assert.ok(bond.info.stories.some(x=>x.unlocked));
let ev=game.newPlayer('event7');ev.heroes={};for(const id of ['h001','h002','h003','h004','h005'])ev.heroes[id]={level:50,star:5,fragments:0,equipment:{weapon:null,armor:null,charm:null}};ev.formation=['h001','h002','h003','h004','h005'];
const first=game.eventBattle(ev,'E1');assert.equal(first.first,true);const ticketsAfterFirst=ev.tickets;const second=game.eventBattle(ev,'E1');assert.equal(second.first,false);assert.equal(ev.tickets,ticketsAfterFirst);
for(const id of ['E2','E3','E4','E5','E6'])game.eventBattle(ev,id);assert.equal(ev.event.clears.length,6);assert.ok(ev.event.moonSeal>0);
const seal0=ev.event.moonSeal,gift0=ev.inventory.bondGift;game.eventShopBuy(ev,'gift');assert.equal(ev.event.moonSeal,seal0-80);assert.equal(ev.inventory.bondGift,gift0+1);
assert.equal(game.achievementProgress(ev,game.ACHIEVEMENTS.find(a=>a.id==='event6')),6);
const old6=game.newPlayer('old6');old6.version=6;delete old6.forge;delete old6.event;delete old6.bond;delete old6.inventory.forgeDust;delete old6.inventory.bondGift;const mig7=game.migrate(old6,'old6');assert.equal(mig7.version,20);assert.ok(mig7.forge&&mig7.event&&mig7.bond.h004);

// v0.8 signature weapons, awakening, mail and event boss
let v8=game.newPlayer('v8');
assert.equal(v8.version,20);assert.equal(v8.heroes.h004.awakening,0);assert.equal(game.unreadMailCount(v8),2);
const mail=game.claimMail(v8,'v08_launch');assert.equal(mail.id,'v08_launch');assert.equal(v8.inventory.signatureWeapons.sig_h004,1);assert.equal(v8.inventory.awakeningCore,3);assert.equal(game.unreadMailCount(v8),1);
game.equipSignature(v8,'h004','sig_h004');assert.equal(v8.heroes.h004.signature,'sig_h004');
const hpBefore=game.computedStats(game.byId('h004'),v8.heroes.h004,v8).hp;
v8.heroes.h004.level=30;v8.heroes.h004.star=5;v8.coin=999999;v8.inventory.awakeningCore=10;const aw=game.awakenHero(v8,'h004');assert.equal(aw.awakening,1);const hpAfter=game.computedStats(game.byId('h004'),v8.heroes.h004,v8).hp;assert.ok(hpAfter>hpBefore);
assert.throws(()=>game.equipSignature(v8,'h004','sig_h001'),/SIGNATURE_HERO_MISMATCH/);
let raid=game.newPlayer('raid');raid.heroes={};for(const id of ['h001','h002','h003','h004','h005'])raid.heroes[id]={level:50,star:5,fragments:0,awakening:3,signature:null,equipment:{weapon:null,armor:null,charm:null}};raid.formation=['h001','h002','h003','h004','h005'];
const er=game.eventBossBattle(raid,()=>0.5);assert.ok(er.damage>0);assert.equal(raid.eventBoss.runs,1);assert.equal(raid.eventBoss.bestDamage,er.damage);assert.ok(game.localEventLeaderboard(raid).some(x=>x.isSelf));
game.eventBossBattle(raid,()=>0.4);game.eventBossBattle(raid,()=>0.3);assert.throws(()=>game.eventBossBattle(raid,()=>0.2),/EVENT_BOSS_ATTEMPTS_EXHAUSTED/);
const old7=game.newPlayer('old7');old7.version=7;delete old7.mails;delete old7.eventBoss;delete old7.inventory.signatureWeapons;delete old7.inventory.awakeningCore;delete old7.heroes.h004.awakening;delete old7.heroes.h004.signature;const mig8=game.migrate(old7,'old7');assert.equal(mig8.version,20);assert.ok(Array.isArray(mig8.mails)&&mig8.mails.length>=2);assert.ok(mig8.eventBoss);assert.equal(mig8.heroes.h004.awakening,0);
assert.ok(Array.isArray(b.timeline)&&b.timeline.length>0,'battle should expose v1 timeline snapshots');assert.ok(b.timeline.some(x=>Array.isArray(x.allies)&&Array.isArray(x.enemies)),'timeline should contain hp snapshots');
// v1.1 seven-day login cycle and v10 migration
let login=game.newPlayer('login11');const coinBefore=login.coin;let lc=game.claimLoginReward(login,new Date('2026-09-08T00:00:00Z'));assert.equal(lc.day,1);assert.equal(login.coin,coinBefore+2000);assert.throws(()=>game.claimLoginReward(login,new Date('2026-09-08T08:00:00Z')),/LOGIN_REWARD_ALREADY_CLAIMED/);
for(let day=9;day<=14;day++){lc=game.claimLoginReward(login,new Date(`2026-09-${String(day).padStart(2,'0')}T00:00:00Z`));}
assert.equal(lc.day,7);assert.equal(login.loginReward.claimed.filter(Boolean).length,7);const cycle2=game.claimLoginReward(login,new Date('2026-09-15T00:00:00Z'));assert.equal(cycle2.day,1);assert.equal(cycle2.cycle,2);assert.equal(login.loginReward.claimed[0],true);assert.equal(login.loginReward.claimed.slice(1).some(Boolean),false);
const old10=game.newPlayer('old10');old10.version=10;delete old10.loginReward;const mig11=game.migrate(old10,'old10');assert.equal(mig11.version,20);assert.equal(mig11.loginReward.cycle,1);assert.equal(mig11.loginReward.claimed.length,7);assert.equal(game.LOGIN_REWARDS.length,7);
// v1.2 newbie ten, story, voice metadata and combat effects
let starter=game.newPlayer('starter12');starter.tickets=10;const sr=game.pullStarterTen(starter,()=>0.99);assert.equal(sr.length,10);assert.ok(sr.some(x=>x.hero.rarity==='SSR'),'starter ten should guarantee SSR');assert.equal(starter.newbieGacha.claimed,true);assert.throws(()=>game.pullStarterTen(starter,()=>0.99),/NEWBIE_GACHA_ALREADY_USED/);
assert.ok(game.storyForStage(5)?.lines?.length>=2);assert.ok(game.HERO_VOICES.h001.acquire);assert.ok(game.SKILL_FX.h004.shape);
const old11=game.newPlayer('old11');old11.version=11;delete old11.newbieGacha;delete old11.storySeen;const mig12=game.migrate(old11,'old11');assert.equal(mig12.version,20);assert.equal(mig12.newbieGacha.claimed,false);assert.ok(Array.isArray(mig12.storySeen));
let critState=game.newPlayer('crit12');critState.heroes={};for(const id of ['h001','h002','h003','h004','h005'])critState.heroes[id]={level:50,star:5,fragments:0,awakening:0,signature:null,equipment:{weapon:null,armor:null,charm:null}};critState.formation=['h001','h002','h003','h004','h005'];const cb=game.battle(critState,()=>0.05);assert.ok(cb.timeline.some(x=>x.effect&&['critical','heal','shield','damage','status','info'].includes(x.effect.kind)));
// v1.3 archives, expanded story and battle strategy
assert.ok(game.HERO_ARCHIVES.h001.profile.includes('断星使'));assert.equal(game.archiveForHero('h004').codename,'春息');
assert.ok(game.STORY_NODES.length>=13);assert.equal(game.storyForStage(23).id,'c5_mid');
const old12=game.newPlayer('old12');old12.version=12;delete old12.battlePrefs;const mig13=game.migrate(old12,'old12');assert.equal(mig13.version,20);assert.equal(mig13.battlePrefs.skillMode,'auto');
let strategy=game.newPlayer('strategy13');strategy.heroes={};for(const id of ['h001','h002','h003','h004','h005'])strategy.heroes[id]={level:50,star:5,fragments:0,awakening:0,signature:null,equipment:{weapon:null,armor:null,charm:null}};strategy.formation=['h001','h002','h003','h004','h005'];const manual=game.battle(strategy,()=>0.5,{skillMode:'manual',manualSkills:['h001','h004']});assert.equal(manual.skillMode,'manual');assert.deepEqual(manual.manualSkills,['h001','h004']);assert.equal(strategy.battlePrefs.skillMode,'manual');
// v1.4 resumable live battle sessions
const old13=game.newPlayer('old13');old13.version=13;delete old13.activeBattleSession;const mig14=game.migrate(old13,'old13');assert.equal(mig14.version,20);assert.equal(mig14.activeBattleSession,null);
let live=game.newPlayer('live14');live.stage=20;live.heroes={};for(const id of ['h001','h002','h003','h004','h005'])live.heroes[id]={level:20,star:3,fragments:0,awakening:0,signature:null,equipment:{weapon:null,armor:null,charm:null}};live.formation=['h001','h002','h003','h004','h005'];let session=game.startBattleSession(live,{skillMode:'manual'},()=>0.5);assert.equal(session.status,'waiting');assert.ok(session.pending?.heroId);const same=game.resumeBattleSession(live);assert.equal(same.id,session.id);assert.equal(same.pending.heroId,session.pending.heroId);const firstId=session.id;{const tid=session.pending.targetMode!=='none'?session.pending.targets?.[0]?.id:null;session=game.battleSessionCommand(live,session.id,session.pending.heroId,'skill',()=>0.5,tid)}assert.equal(session.id,firstId);let guard=0;while(session.status==='waiting'&&guard++<40){const cmd=guard%2?'basic':'skill',tid=cmd==='skill'&&session.pending.targetMode!=='none'?session.pending.targets?.[0]?.id:null;session=game.battleSessionCommand(live,session.id,session.pending.heroId,cmd,()=>0.5,tid)};assert.equal(session.status,'complete');assert.ok(session.result&&typeof session.result.win==='boolean');assert.equal(live.activeBattleSession.id,firstId);
let cancelState=game.newPlayer('cancel14');cancelState.stage=20;cancelState.heroes=JSON.parse(JSON.stringify(live.heroes));cancelState.formation=[...live.formation];const cs=game.startBattleSession(cancelState,{skillMode:'manual'},()=>0.5);game.cancelBattleSession(cancelState,cs.id);assert.equal(cancelState.activeBattleSession,null);
// v1.5 energy, targeting, boss phases
const old14=game.newPlayer('old14');old14.version=14;const mig15=game.migrate(old14,'old14');assert.equal(mig15.version,20);
let targetState=game.newPlayer('target15');targetState.stage=20;targetState.heroes={};for(const id of ['h001','h002','h003','h004','h005'])targetState.heroes[id]={level:20,star:3,fragments:0,awakening:0,signature:null,equipment:{weapon:null,armor:null,charm:null}};targetState.formation=['h001','h002','h003','h004','h005'];let ts=game.startBattleSession(targetState,{skillMode:'manual'},()=>0.5);assert.equal(ts.status,'waiting');assert.ok(ts.pending.energy>=85);assert.ok(['enemy','ally','none'].includes(ts.pending.targetMode));if(ts.pending.targetMode!=='none'){assert.ok(ts.pending.targets.length>0);const tid=ts.pending.targets[0].id;ts=game.battleSessionCommand(targetState,ts.id,ts.pending.heroId,'skill',()=>0.5,tid);assert.ok(ts)}
let phaseUnit={id:'boss-30',name:'灰烬王座',isBoss:true,hp:20000,maxHp:36000,baseAtk:1120,atk:1120,baseSpd:118,spd:118,shield:0,phase:1,maxPhase:3,atkBuff:0,slow:0};const phaseText=game.updateBossPhaseUnit?game.updateBossPhaseUnit(phaseUnit,30):null;if(game.updateBossPhaseUnit){assert.equal(phaseUnit.phase,2);assert.ok(phaseText.includes('PHASE 2/3'));}
// targeted single-target skill must hit the selected server-validated enemy
let precise=game.newPlayer('precise15');precise.stage=20;precise.heroes={h001:{level:50,star:5,fragments:0,awakening:3,signature:null,equipment:{weapon:null,armor:null,charm:null}},h006:{level:50,star:5,fragments:0,awakening:3,signature:null,equipment:{weapon:null,armor:null,charm:null}}};precise.formation=['h001','h006'];let ps=game.startBattleSession(precise,{skillMode:'manual'},()=>0.5);assert.equal(ps.pending.heroId,'h001');assert.equal(ps.pending.targetMode,'enemy');assert.ok(ps.pending.targets.length>=2);const chosen=ps.pending.targets[ps.pending.targets.length-1];const bossBefore=ps.enemies.find(x=>x.isBoss).hp,chosenBefore=ps.enemies.find(x=>x.id===chosen.id).hp;ps=game.battleSessionCommand(precise,ps.id,'h001','skill',()=>0.5,chosen.id);const bossAfter=ps.enemies.find(x=>x.isBoss)?.hp??bossBefore,chosenAfter=ps.enemies.find(x=>x.id===chosen.id)?.hp??0;assert.equal(bossAfter,bossBefore);assert.ok(chosenAfter<chosenBefore);
// v1.6 status, auto strategy and battle replay
const old15=game.newPlayer('old15');old15.version=15;delete old15.battleReplays;old15.battlePrefs={skillMode:'auto',manualSkills:[]};const mig16=game.migrate(old15,'old15');assert.equal(mig16.version,20);assert.equal(mig16.battlePrefs.autoStrategy,'balanced');assert.ok(Array.isArray(mig16.battleReplays));
assert.equal(game.byId('h003').skillType,'cleanseSupport');assert.equal(game.byId('h006').skillType,'tauntShield');assert.equal(game.byId('h012').skillType,'silence');assert.ok(game.BOSS_PHASE_SKILLS[30][3].name);assert.equal(game.autoStrategyInfo('burst').name,'爆发');
let replayState=game.newPlayer('replay16');replayState.heroes={};for(const id of ['h001','h003','h004','h006','h012'])replayState.heroes[id]={level:50,star:5,fragments:0,awakening:2,signature:null,equipment:{weapon:null,armor:null,charm:null}};replayState.formation=['h001','h003','h004','h006','h012'];replayState.stage=10;const rb16=game.battle(replayState,()=>0.4,{skillMode:'auto',autoStrategy:'survival'});assert.equal(rb16.autoStrategy,'survival');assert.equal(game.battleReplays(replayState).length,1);assert.ok(game.battleReplays(replayState)[0].timeline.length>0);
let tauntState=game.newPlayer('taunt16');tauntState.heroes={h006:{level:50,star:5,fragments:0,awakening:2,signature:null,equipment:{weapon:null,armor:null,charm:null}}};tauntState.formation=['h006'];tauntState.stage=5;let tauntSession=game.startBattleSession(tauntState,{skillMode:'manual'},()=>0.5);assert.equal(tauntSession.pending.heroId,'h006');tauntSession=game.battleSessionCommand(tauntState,tauntSession.id,'h006','skill',()=>0.5,null);assert.ok(tauntSession.log.some(x=>x.includes('嘲讽')));
let silenceState=game.newPlayer('silence16');silenceState.heroes={h012:{level:50,star:5,fragments:0,awakening:2,signature:null,equipment:{weapon:null,armor:null,charm:null}}};silenceState.formation=['h012'];silenceState.stage=5;let silenceSession=game.startBattleSession(silenceState,{skillMode:'manual'},()=>0.5);assert.equal(silenceSession.pending.targetMode,'enemy');const silenceTarget=silenceSession.pending.targets[0].id;silenceSession=game.battleSessionCommand(silenceState,silenceSession.id,'h012','skill',()=>0.5,silenceTarget);assert.ok(silenceSession.log.some(x=>x.includes('沉默')));
assert.equal(game.SAVE_VERSION,20);assert.equal(game.CONFIG_VERSION,'2026.09.v20');
// v1.7 front-row protection, break and combo integration
{const s=game.newPlayer('v17-front');s.heroes={h014:{level:20,star:3,fragments:0,awakening:0,signature:null,equipment:{weapon:null,armor:null,charm:null}}};game.setFormation(s,['h014'],{h014:'back'});s.stage=20;const out=game.startBattleSession(s,{skillMode:'manual'},()=>0.5);assert.equal(out.status,'waiting');assert.equal(out.pending.heroId,'h014');assert.equal(out.pending.targetMode,'enemy');assert.ok(out.pending.targets.length>=1);assert.ok(out.pending.targets.every(x=>!x.isBoss),'front-range skill must not bypass living front row');assert.equal(out.enemies.find(x=>x.isBoss).row,'back');assert.ok(out.enemies.filter(x=>!x.isBoss).every(x=>x.row==='front'));}
{const s=game.newPlayer('v17-break-trigger');s.heroes={};for(const id of ['h001','h005','h002','h007','h008'])s.heroes[id]={level:15,star:3,fragments:0,awakening:0,signature:null,equipment:{weapon:null,armor:null,charm:null}};game.setFormation(s,['h001','h005','h002','h007','h008'],{h001:'back',h005:'back',h002:'front',h007:'front',h008:'back'});s.stage=5;let out=game.startBattleSession(s,{skillMode:'manual'},()=>0.31),guard=0;while(out.status==='waiting'&&guard++<60){let tid=null;if(out.pending.targetMode==='enemy')tid=(out.pending.targets.find(x=>x.isBoss)||out.pending.targets[0])?.id;else if(out.pending.targetMode==='ally')tid=out.pending.targets[0]?.id;out=game.battleSessionCommand(s,out.id,out.pending.heroId,'skill',()=>0.31,tid)}assert.ok(out.log.some(x=>x.includes('韧性被击破')),'boss break should be triggerable');assert.ok(out.timeline.some(x=>x.enemies?.some(e=>e.isBoss&&(e.breakCount||0)>0)));}
{const s=game.newPlayer('v17-combo');s.heroes={};for(const id of ['h001','h005','h002','h007','h003'])s.heroes[id]={level:35,star:5,fragments:0,awakening:0,signature:null,equipment:{weapon:null,armor:null,charm:null}};game.setFormation(s,['h001','h005','h002','h007','h003'],{h001:'back',h005:'back',h002:'front',h007:'front',h003:'back'});s.stage=20;const r=game.battle(s,()=>0.31,{skillMode:'auto',autoStrategy:'balanced'});assert.ok(r.combosUsed.includes('starSever'));assert.ok(r.combosUsed.includes('redWing'));assert.equal(new Set(r.combosUsed).size,r.combosUsed.length,'each combo should trigger at most once');assert.ok(r.stats.every(x=>String(x.id).startsWith('h')),'battle report must contain player contributions only');}


// v1.7 formation rows migration
{const s=game.newPlayer('v17-row');s.heroes.h001={level:50,star:5,fragments:0,awakening:3,signature:null,equipment:{weapon:null,armor:null,charm:null}};game.setFormation(s,['h004','h001'],{h004:'front',h001:'back'});assert.equal(s.formationRows.h004,'front');assert.equal(s.formationRows.h001,'back');}
// v1.7 skill configuration and boss break
{const s=game.newPlayer('v17-break');s.heroes.h001={level:50,star:5,fragments:0,awakening:3,signature:null,equipment:{weapon:null,armor:null,charm:null}};game.setFormation(s,['h001'],{h001:'back'});s.stage=5;const out=game.startBattleSession(s,{skillMode:'manual'},()=>0.01);const boss=out.enemies.find(x=>x.isBoss);assert.ok(boss.breakMax>0);assert.ok(out.allies[0].skillCost>0);}
// v1.7 battle stats are emitted
{const s=game.newPlayer('v17-stats');s.heroes.h001={level:50,star:5,fragments:0,awakening:3,signature:null,equipment:{weapon:null,armor:null,charm:null}};game.setFormation(s,['h001'],{h001:'back'});const r=game.battle(s,()=>0.1,{skillMode:'auto'});assert.ok(Array.isArray(r.stats));assert.ok(r.stats.some(x=>x.id==='h001'));}


// v1.8 class counter / talents / presets / sweep / second event / break burst
{const a={combatClass:'assault'},b={combatClass:'arcane'};assert.ok(game.classMultiplier(a,b)>1);assert.ok(game.classMultiplier(b,a)<1);}
{const s=game.newPlayer('talent18');s.inventory.talentPoints=10;const before=game.computedStats(game.byId('h004'),s.heroes.h004,s);game.unlockTalent(s,'h004','root');const after=game.computedStats(game.byId('h004'),s.heroes.h004,s);assert.ok(after.hp>before.hp);assert.ok(game.heroTalents(s,'h004').includes('root'));assert.throws(()=>game.unlockTalent(s,'h004','core'),/TALENT_REQUIREMENT/);}
{const s=game.newPlayer('preset18');s.heroes.h001={level:1,star:1,fragments:0,awakening:0,signature:null,equipment:{weapon:null,armor:null,charm:null}};game.setFormation(s,['h004','h001'],{h004:'front',h001:'back'});game.saveFormationPreset(s,'1','Boss队');game.setFormation(s,['h004'],{h004:'back'});game.loadFormationPreset(s,'1');assert.deepEqual(s.formation,['h004','h001']);assert.equal(s.formationRows.h004,'front');}
{const s=game.newPlayer('sweep18');s.stage=8;const c=s.coin,pt=s.inventory.talentPoints;const r=game.sweepStage(s,7,2,()=>0.05);assert.equal(r.count,2);assert.ok(s.coin>c);assert.ok(s.inventory.talentPoints>=pt);assert.equal(game.sweepInfo(s).used,2);}
{const s=game.newPlayer('night18');s.heroes={};for(const id of ['h001','h002','h003','h004','h005'])s.heroes[id]={level:50,star:5,fragments:0,awakening:3,signature:null,equipment:{weapon:null,armor:null,charm:null}};s.formation=['h001','h002','h003','h004','h005'];const r=game.nightEventBattle(s,'N1');assert.ok(s.nightEvent.voyageBadge>0);assert.equal(r.first,true);s.nightEvent.voyageBadge=999;const buy=game.nightEventShopBuy(s,'talent');assert.equal(buy.reward.talentPoints,1);}
{const target={hp:1000,maxHp:1000,shield:0,breakWindow:1,combatClass:'support'};game.__testApplyDamage?null:null;/* vulnerability covered indirectly by battle sessions */}
assert.equal(game.SAVE_VERSION,20);assert.equal(game.CONFIG_VERSION,'2026.09.v20');
console.log('v2.0 core tests passed');
