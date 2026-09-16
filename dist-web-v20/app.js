const G=window.STAR_EMBER_GAME,CLOUD=window.StarEmberCloud;
const SAVE_KEY='starEmber.save.v20';
class SaveAdapter{
  load(){for(const key of [SAVE_KEY,'starEmber.save.v19','starEmber.save.v18','starEmber.save.v17','starEmber.save.v16','starEmber.save.v15','starEmber.save.v14','starEmber.save.v13','starEmber.save.v12','starEmber.save.v11','starEmber.save.v10','starEmber.save.v9','starEmber.save.v8','starEmber.save.v7','starEmber.save.v6','starEmber.save.v5','starEmber.save.v4','starEmber.save.v3','starEmber.save.v2','starEmber.save.v1']){try{const raw=localStorage.getItem(key);if(raw)return G.migrate(JSON.parse(raw),'local-player')}catch{}}return null}
  save(s){try{localStorage.setItem(SAVE_KEY,JSON.stringify(s))}catch(e){const err=new Error('LOCAL_SAVE_FAILED');err.code='LOCAL_SAVE_FAILED';err.cause=e;throw err}}
  backup(s){try{localStorage.setItem(SAVE_KEY+'.backup',JSON.stringify(s));return true}catch(e){console.warn('[local-backup]',e);return false}}
  reset(){['starEmber.save.v20','starEmber.save.v19','starEmber.save.v18','starEmber.save.v17','starEmber.save.v16','starEmber.save.v15','starEmber.save.v14','starEmber.save.v13','starEmber.save.v12','starEmber.save.v11','starEmber.save.v10','starEmber.save.v9','starEmber.save.v8','starEmber.save.v7','starEmber.save.v6','starEmber.save.v5','starEmber.save.v4','starEmber.save.v3','starEmber.save.v2','starEmber.save.v1'].forEach(k=>localStorage.removeItem(k))}
}
const saves=new SaveAdapter();
const loadedState=saves.load(),hadLocalSave=!!loadedState,previousLoginAt=loadedState?.lastLogin||null;
let state=loadedState||G.newPlayer('guest-'+Math.random().toString(36).slice(2,10));
let selectedBattleTargetId=null,battlePaused=false;let tab='home',lastGacha=[],gachaPool='standard',gachaViewPool='newbie',gearSlot='weapon',eventViewMode='eclipse',utilityViewMode='daily',exploreViewMode='campaign',heroViewMode='overview',battleLog=[],lastBattle=null,battleFrame=0,battleTimer=null,cloudMode=false,busy=false,busyMessage='正在处理',toastTimer,currentLink=null,eventLeaderboard=[],selectedHeroId=state.formation[0]||Object.keys(state.heroes)[0],settingsOpen=false,moreOpen=false,revealOpen=false,revealIndex=0,booting=true,bootProgress=8,bootMessage='正在载入星轨核心',bossIntroOpen=false,storyOpen=false,storyIndex=0,resultOpen=false,archiveOpen=false,archiveHeroId=null,liveSession=state.activeBattleSession||null,returnOpen=false,pwaInstallPrompt=null,pwaHelpOpen=false,pwaUpdateReady=false,pwaWaitingWorker=null,pwaReloadPending=false,networkOffline=(typeof navigator!=='undefined'&&navigator.onLine===false),lastHiddenAt=0,lastAutoCloudSync=0,cloudRestoreWarning=false;
let gachaSummaryOpen=false,sweepResult=null,linkCodeDraft='',growthFx=null,rewardFx=null,rewardFxTimer=null,growthFxTimer=null,gachaConfirm=null,gachaShowRates=false,duplicateReveal=null,eventShopCat='all',levelMaxConfirm=null;
/* 提示词02 第4条：关卡详情 —— 点击任意关卡行先看详情，不误触开战 */
let stageDetailN=null;
/* 提示词03 交互：满员时点击候选角色 → 进入"选择要替换的队位"状态（点击换位，不做拖拽） */
let replaceCandidateId=null;
/* 提示词07：邮件/成就分类 —— 引擎的真实数据结构为 {id,title,body,reward,claimed,claimedAt,createdAt}，
   没有分类字段。提示词明确要求"有真实分类字段才做分类Tab"，因此邮件不做分类 Tab；
   成就的 type 是真实字段，故成就保留按 type 分类。 */
let achFilter='all';
const ACH_CATS=[['all','全部'],['battle','战斗'],['growth','养成'],['collect','收集']];
function achCategory(type){
  if(['stage','boss','power'].includes(type))return 'battle';
  if(['heroCount','ssrCount','maxBondLevel','maxEnhance'].includes(type))return 'growth';
  return 'collect';
}
function achCatName(cat){const f=ACH_CATS.find(x=>x[0]===cat);return f?f[1]:'收集'}
/* 邮件时间显示（真实字段 createdAt / claimedAt） */
function mailTimeLabel(m){
  const iso=m.createdAt||m.claimedAt;
  if(!iso)return '';
  try{const d=new Date(iso);if(Number.isNaN(d.getTime()))return '';
    const diff=Date.now()-d.getTime(),day=86400000;
    if(diff<3600000)return '刚刚';
    if(diff<day)return `${Math.floor(diff/3600000)} 小时前`;
    if(diff<2*day)return '昨天';
    return `${d.getMonth()+1}月${d.getDate()}日`;
  }catch{return ''}
}
const interactionLocks=new Map();
const debugMode=(()=>{try{return new URLSearchParams(location.search||'').get('debug')==='1'}catch{return false}})();
const UI_KEY='starEmber.ui.v20';
function loadUi(){const base={tutorialDone:false,tutorialStep:0,firstContractDone:false,sound:true,music:true,voice:true,haptics:true,cinematicGacha:true,battleSpeed:1,skillMode:'auto',manualSkills:[],autoStrategy:'balanced',presetSlot:'1',fxQuality:'high',cloudAutoConnect:false,installDismissed:false,badgeSeen:{}};for(const key of [UI_KEY,'starEmber.ui.v19','starEmber.ui.v18','starEmber.ui.v17','starEmber.ui.v16','starEmber.ui.v15','starEmber.ui.v14','starEmber.ui.v13','starEmber.ui.v12','starEmber.ui.v11','starEmber.ui.v10']){try{const raw=localStorage.getItem(key);if(raw)return Object.assign(base,JSON.parse(raw))}catch{}}return base}
let ui=loadUi();ui.badgeSeen=ui.badgeSeen&&typeof ui.badgeSeen==='object'?ui.badgeSeen:{};function saveUi(){try{localStorage.setItem(UI_KEY,JSON.stringify(ui));return true}catch(e){console.warn('[ui-save]',e);return false}}
const returnGapHours=previousLoginAt?Math.max(0,(Date.now()-new Date(previousLoginAt).getTime())/36e5):0;
const requestedTab=(()=>{try{return new URLSearchParams(location.search||'').get('tab')||''}catch{return''}})();
if(ui.tutorialDone&&['home','heroes','gacha','formation','inventory','shop','event','hub','explore'].includes(requestedTab))tab=requestedTab;
let audioCtx=null;
function haptic(kind='tap'){if(!ui.haptics)return;try{const p={tap:7,gacha:[10,22,10],rare:[20,34,55],skill:14,hit:9,critical:[15,18,32],heal:8,break:[12,20,28],win:[16,25,42],defeat:24}[kind]||7;navigator.vibrate?.(p)}catch{}}
function sfx(kind='tap'){haptic(kind);if(!ui.sound)return;try{audioCtx||=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')void audioCtx.resume?.();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);const f={tap:420,gacha:620,rare:960,skill:760,hit:290,critical:1180,heal:680,break:520,win:1040,defeat:180}[kind]||480;o.type=['hit','defeat'].includes(kind)?'triangle':'sine';o.frequency.value=f;g.gain.setValueAtTime(kind==='tap'?.025:.042,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+(kind==='rare'?.22:.12));o.start();o.stop(audioCtx.currentTime+(kind==='rare'?.23:.13))}catch{}}
function screenPulse(kind='skill'){try{const root=document.documentElement;if(!root?.classList)return;['m210-fx-hit','m210-fx-critical','m210-fx-heal','m210-fx-break','m210-fx-win'].forEach(x=>root.classList.remove(x));const cls=kind==='critical'?'m210-fx-critical':kind==='heal'?'m210-fx-heal':kind==='break'?'m210-fx-break':kind==='win'?'m210-fx-win':kind==='hit'?'m210-fx-hit':'';if(!cls)return;void root.offsetWidth;root.classList.add(cls);setTimeout(()=>root.classList.remove(cls),420)}catch{}}
function combatFeedback(text='',effect={}){const kind=effect?.kind==='heal'?'heal':/BREAK|破韧|击破/.test(text)?'break':effect?.kind==='critical'||/CRITICAL|暴击/.test(text)?'critical':/胜利|VICTORY/.test(text)?'win':/伤害|攻击|施放|发动|斩|击/.test(text)?'hit':'skill';sfx(kind);screenPulse(kind)}
G.ensureDaily(state);

function playVoice(heroId,type='acquire'){if(!ui.voice)return;const cfg=G.HERO_VOICES?.[heroId],line=cfg?.[type];if(!line)return;try{if('speechSynthesis' in window){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(line);u.lang='zh-CN';u.rate=.95;u.pitch=1.02;window.speechSynthesis.speak(u)}}catch{}toast(`语音预览 · ${line}`)}

const skillText={burst:'高倍率单体爆发',aoe:'敌方全体伤害',cleanseSupport:'全队治疗、强化并净化异常',heal:'治疗生命最低队友',stun:'伤害并概率眩晕',tauntShield:'全队护盾并嘲讽敌方',multi:'随机三连击',execute:'优先攻击残血并获得斩杀加成',selfShield:'获得高额个人护盾',aoeLite:'小范围全体伤害',executeLite:'优先追击残血',silence:'伤害、减速并沉默目标',buff:'强化全队攻击',burstLite:'单体强击',healAll:'恢复全队生命'};
const slotName={weapon:'武器',armor:'护甲',charm:'饰物'};
function onlineNow(){return !networkOffline&&(typeof navigator==='undefined'||navigator.onLine!==false)}
function networkProfile(){const c=typeof navigator!=='undefined'?navigator.connection||navigator.mozConnection||navigator.webkitConnection:null;return{online:onlineNow(),effectiveType:c?.effectiveType||'unknown',saveData:!!c?.saveData}}
function weakNetwork(){const n=networkProfile();return !n.online||n.saveData||n.effectiveType==='slow-2g'||n.effectiveType==='2g'}
function isStandalone(){try{return window.matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true}catch{return false}}
function isIOS(){try{return /iphone|ipad|ipod/i.test(navigator.userAgent||'')}catch{return false}}
function canOfferInstall(){return !isStandalone()&&(!!pwaInstallPrompt||isIOS())}
function persist(){state.lastLogin=new Date().toISOString();if(!cloudMode)saves.save(state)}
function mirrorCloudState(){if(!cloudMode)return;try{saves.save(state)}catch(e){console.warn('[cloud-local-mirror]',e)}}
function toast(text,type='info'){try{document.querySelector('.toast')?.remove()}catch(e){}const el=document.createElement('div'),prefix=type==='error'?'⚠ ':type==='success'?'✦ ':'';el.className=`toast m208-toast ${type}`;el.textContent=prefix+text;el.setAttribute?.('role',type==='error'?'alert':'status');el.setAttribute?.('aria-live',type==='error'?'assertive':'polite');document.body.appendChild(el);clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.remove(),type==='error'?3200:2200)}
function errorText(code){return({NOT_ENOUGH_TICKETS:'契灵印不足',HERO_NOT_OWNED:'尚未拥有该契灵',INVALID_COUNT:'契约次数无效',NEWBIE_GACHA_ALREADY_USED:'新手十连已经完成',CAMPAIGN_COMPLETED:'主线终章已完成，请前往扫荡、活动或养成玩法',NETWORK_OFFLINE:'当前处于离线状态，云端操作已暂停',NETWORK_UNSTABLE:'网络连接不稳定，请稍后重试',CLOUDBASE_SDK_LOAD_FAILED:'云端组件加载失败，请检查网络后重试',ANONYMOUS_AUTH_UNAVAILABLE:'当前环境未开启匿名登录',BATTLE_SESSION_ACTOR_INVALID:'当前行动角色状态无效',BATTLE_TARGET_REQUIRED:'请先选择技能目标',INVALID_BATTLE_TARGET:'当前目标不可选',CLOUD_FUNCTION_FAILED:'云存档暂不可用，当前进度已保存在本机浏览器，请稍后再试',CLOUD_PERMISSION_DENIED:'云存档暂不可用，当前进度已保存在本机浏览器，请稍后再试',NOT_ENOUGH_COIN:'烬币不足',NOT_ENOUGH_FRAGMENTS:'角色碎片不足',STAR_CAP:'已达到5星',LEVEL_CAP:'已达到50级',INVALID_FORMATION:'阵容配置无效',CLOUD_NOT_CONFIGURED:'云存档尚未开放，当前进度已保存在本机浏览器',UNAUTHENTICATED:'云端身份未登录',CONFLICT_RETRY:'数据正在被另一设备更新，请重试',TASK_NOT_FOUND:'任务不存在',TASK_ALREADY_CLAIMED:'任务奖励已领取',TASK_NOT_READY:'任务尚未完成',DAILY_ALL_ALREADY_CLAIMED:'今日全勤奖励已领取',DAILY_ALL_NOT_READY:'请先领取全部每日任务奖励',INVALID_LINK_CODE:'迁移码无效',LINK_CODE_EXPIRED:'迁移码已过期，请重新生成',IDENTITY_ALREADY_LINKED:'当前身份已经绑定其他玩家数据',LINK_WOULD_REPLACE_PROGRESS:'当前设备已有游戏进度，为避免覆盖已阻止绑定',ITEM_NOT_FOUND:'装备或遗物不存在',ITEM_NOT_OWNED:'尚未获得该装备或遗物',ITEM_IN_USE:'这件装备已被其他角色占用',INVALID_SLOT:'装备槽位无效',INVALID_LOADOUT_ACTION:'装备操作无效',NOT_ENOUGH_STAR_IRON:'星铁不足',ENHANCE_CAP:'装备已强化至+10',DUNGEON_NOT_FOUND:'资源副本不存在',DUNGEON_ATTEMPTS_EXHAUSTED:'今日挑战次数已用完',POWER_TOO_LOW:'当前阵容战力不足',ACHIEVEMENT_NOT_FOUND:'成就不存在',ACHIEVEMENT_ALREADY_CLAIMED:'成就奖励已领取',ACHIEVEMENT_NOT_READY:'尚未达成该成就',WEEKLY_TASK_NOT_FOUND:'周任务不存在',WEEKLY_TASK_ALREADY_CLAIMED:'周任务奖励已领取',WEEKLY_TASK_NOT_READY:'周任务尚未完成',WEEKLY_ALL_ALREADY_CLAIMED:'本周全勤奖励已领取',WEEKLY_ALL_NOT_READY:'请先领取全部周任务奖励',SHOP_ITEM_NOT_FOUND:'商店商品不存在',SHOP_LIMIT_REACHED:'该商品今日已达购买上限',NOT_ENOUGH_STAR_CRYSTAL:'星髓不足',NO_SPARE_EQUIPMENT:'没有可分解的闲置装备',FORGE_RECIPE_NOT_FOUND:'锻造配方不存在',NOT_ENOUGH_FORGE_DUST:'锻造尘不足',NOT_ENOUGH_BOND_GIFT:'星语花不足',BOND_CAP:'该契灵羁绊已达到最高等级',EVENT_STAGE_NOT_FOUND:'活动关卡不存在',EVENT_SHOP_ITEM_NOT_FOUND:'活动商品不存在',EVENT_SHOP_LIMIT_REACHED:'该活动商品已兑换完',NOT_ENOUGH_MOON_SEAL:'月蚀印不足',EVENT_ATTEMPTS_EXHAUSTED:'今日活动挑战次数已用完',SIGNATURE_NOT_FOUND:'专属武器不存在',SIGNATURE_NOT_OWNED:'尚未获得该专属武器',SIGNATURE_HERO_MISMATCH:'该契印武装不属于这名角色',AWAKEN_CAP:'角色已完成三阶觉醒',AWAKEN_LEVEL_REQUIRED:'角色等级未达到觉醒要求',AWAKEN_STAR_REQUIRED:'角色需要达到5星才能觉醒',NOT_ENOUGH_AWAKENING_CORE:'觉醒核心不足',MAIL_NOT_FOUND:'邮件不存在',MAIL_ALREADY_CLAIMED:'邮件奖励已领取',NO_MAIL_REWARD:'没有可领取的邮件',EVENT_BOSS_ATTEMPTS_EXHAUSTED:'今日活动Boss挑战次数已用完',LOGIN_REWARD_ALREADY_CLAIMED:'今日登录奖励已经领取',ACTIVE_BATTLE_SESSION:'已有未结束的手动战斗，请继续或取消',BATTLE_SESSION_NOT_FOUND:'没有可恢复的战斗会话',BATTLE_SESSION_NOT_WAITING:'当前战斗未等待技能指令',BATTLE_SESSION_ACTOR_MISMATCH:'技能指令角色不匹配',INVALID_BATTLE_COMMAND:'无效的战斗指令',BATTLE_SESSION_ALREADY_COMPLETE:'战斗已经结束',TALENT_NOT_FOUND:'天赋节点不存在',TALENT_ALREADY_UNLOCKED:'该天赋已点亮',TALENT_REQUIREMENT:'请先解锁前置天赋',NOT_ENOUGH_TALENT_POINTS:'星痕点不足',INVALID_PRESET_SLOT:'阵容预设槽位无效',PRESET_NOT_FOUND:'该阵容预设尚未保存',PRESET_EMPTY:'阵容预设没有可用角色',STAGE_NOT_CLEARED:'该关卡尚未通关，无法扫荡',SWEEP_LIMIT:'今日扫荡次数不足',NIGHT_EVENT_STAGE_NOT_FOUND:'夜航活动关卡不存在',NIGHT_EVENT_ATTEMPTS_EXHAUSTED:'今日夜航挑战次数已用完',NIGHT_EVENT_SHOP_ITEM_NOT_FOUND:'夜航商品不存在',NIGHT_EVENT_SHOP_LIMIT:'该夜航商品已兑换完',NOT_ENOUGH_VOYAGE_BADGE:'航星徽不足',LOCAL_SAVE_FAILED:'本地存档写入失败，请检查浏览器存储空间或隐私设置',CLOUD_CONNECT_CANCELLED:'已取消连接云端，本地进度保持不变'}[code]||(debugMode&&code?String(code):'操作未完成，请稍后重试'))}
async function action(fn,label='正在处理',onError=null){if(busy)return;busy=true;busyMessage=label;render();try{await fn();mirrorCloudState()}catch(e){console.error(e);try{onError?.(e)}catch(_){}toast(errorText(e.code||e.message),'error')}finally{busy=false;busyMessage='正在处理';render()}}
function rarityRank(r){return r==='SSR'?3:r==='SR'?2:1}
function ownedList(){return Object.entries(state.heroes).map(([id,p])=>({...G.byId(id),...p})).filter(x=>x.id).sort((a,b)=>rarityRank(b.rarity)-rarityRank(a.rarity)||b.star-a.star||b.level-a.level)}
function stars(n){return '★'.repeat(n)+'☆'.repeat(5-n)}
function achievementDisplayReward(a){const r={...(a?.reward||{})};if(r.signatureWeapon&&(Number(state.inventory?.signatureWeapons?.[r.signatureWeapon])||0)>=1){const sig=G.signatureById(r.signatureWeapon);delete r.signatureWeapon;r.forgeDust=(Number(r.forgeDust)||0)+(sig?.rarity==='SSR'?300:sig?.rarity==='SR'?180:100);}return r}
function rewardText(r){return[r.coin?`烬币 ${r.coin}`:'',r.tickets?`契灵印 ${r.tickets}`:'',r.starCrystal?`星髓 ${r.starCrystal}`:'',r.starIron?`星铁 ${r.starIron}`:'',r.forgeDust?`锻造尘 ${r.forgeDust}`:'',r.bondGift?`星语花 ${r.bondGift}`:'',r.moonSeal?`月蚀印 ${r.moonSeal}`:'',r.awakeningCore?`觉醒核心 ${r.awakeningCore}`:'',r.talentPoints?`星痕点 ${r.talentPoints}`:'',r.voyageBadge?`航星徽 ${r.voyageBadge}`:'',r.signatureWeapon?`${G.signatureById(r.signatureWeapon)?.name||'专属武器'} ×1`:'',r.fragments?`角色碎片 ${r.fragments}`:''].filter(Boolean).join(' · ')}
function rewardEntries(r={}){const defs=[['coin','烬币','◈'],['tickets','契灵印','◎'],['starCrystal','星髓','◇'],['starIron','星铁','◆'],['forgeDust','锻造尘','✧'],['bondGift','星语花','❀'],['moonSeal','月蚀印','☾'],['awakeningCore','觉醒核心','✦'],['talentPoints','星痕点','⋆'],['voyageBadge','航星徽','⌁'],['fragments','角色碎片','✣']];const rows=defs.filter(([k])=>Number(r[k])>0).map(([k,name,icon])=>({key:k,name,icon,value:Number(r[k])}));if(r.signatureWeapon)rows.push({key:'signatureWeapon',name:G.signatureById(r.signatureWeapon)?.name||'专属武器',icon:'⚔',value:1});return rows}
function mergeRewards(list=[]){const out={};for(const r of list||[])for(const [k,v] of Object.entries(r||{})){if(k==='signatureWeapon'){out[k]=v;continue}if(typeof v==='number')out[k]=(Number(out[k])||0)+v}return out}
function showRewardFx(title,reward,subtitle=''){const rows=rewardEntries(reward);if(!rows.length)return;rewardFx={title,subtitle,rows};clearTimeout(rewardFxTimer);rewardFxTimer=setTimeout(()=>{rewardFx=null;try{render()}catch{}},1750);sfx(rows.length>1?'rare':'gacha')}
function rewardFeedbackOverlay(){if(!rewardFx)return'';return `<div class="m211-reward-fx" role="status"><div class="m211-reward-star">✦</div><div><div class="kicker">REWARD ACQUIRED</div><h3>${rewardFx.title}</h3>${rewardFx.subtitle?`<small>${rewardFx.subtitle}</small>`:''}<div class="m211-reward-items">${rewardFx.rows.map(x=>`<span><i>${x.icon}</i><b>${x.name}</b><em>+${x.value}</em></span>`).join('')}</div></div></div>`}
function showGrowthFx(hero,kind,before,after,beforePower,afterPower){if(!hero||!before||!after)return;const label=kind==='level'?'等级提升':kind==='star'?'星级突破':kind==='awaken'?'觉醒完成':'成长完成';growthFx={heroId:hero.id,name:hero.name,rarity:hero.rarity,label,before:kind==='level'?`Lv.${before.level}`:kind==='star'?`${before.star}★`:kind==='awaken'?`觉醒 ${before.awakening||0}`:'',after:kind==='level'?`Lv.${after.level}`:kind==='star'?`${after.star}★`:kind==='awaken'?`觉醒 ${after.awakening||0}`:'',powerGain:Math.max(0,Math.round((afterPower||0)-(beforePower||0)))};clearTimeout(growthFxTimer);growthFxTimer=setTimeout(()=>{growthFx=null;try{render()}catch{}},1850);sfx(kind==='star'||kind==='awaken'?'rare':'gacha')}
function growthFeedbackOverlay(){if(!growthFx)return'';const h=G.byId(growthFx.heroId);return `<div class="m211-growth-fx"><div class="m211-growth-art">${h?portrait(h,'result'):''}</div><div><div class="kicker">RESONANCE UP</div><h3>${growthFx.name} · ${growthFx.label}</h3><div class="m211-growth-shift"><span>${growthFx.before}</span><b>→</b><strong>${growthFx.after}</strong></div>${growthFx.powerGain?`<small>战力 +${growthFx.powerGain}</small>`:''}</div></div>`}
function interactionAllowed(el,key,risky=false){const now=Date.now(),wait=risky?620:220,last=interactionLocks.get(key)||0;if(now-last<wait)return false;interactionLocks.set(key,now);if(risky&&el){try{el.disabled=true;setTimeout(()=>{if(!busy&&el.isConnected)el.disabled=false},500)}catch{}}return true}
function statText(stats){return Object.entries(stats||{}).map(([k,v])=>`${({hp:'生命',atk:'攻击',def:'防御',spd:'速度'})[k]} +${v}`).join(' · ')}
function currentBoss(){return state.campaignCompleted?null:G.bossByStage(state.stage)}
function currentChapter(){return G.chapterByStage(state.stage)}
function classBadge(hero){const id=G.combatClassForHero(hero),c=G.combatClassInfo(id);return `<span class="v18-class ${id}">${c.icon} ${c.name}</span>`}
function skillIcon(heroId,cls='v19-skill-icon v20-skill-icon'){const src=window.StarEmberAssets?.skill(heroId)||`assets/ui/skills/${heroId}.svg`;return `<img class="${cls}" src="${src}" alt=""/>`}
function statusIcon(id,label=''){const src=window.StarEmberAssets?.status(id)||'';return src?`<span class="v19-status-chip"><img src="${src}" alt=""/>${label}</span>`:`<span class="v19-status-chip">${label}</span>`}
function bossEmblem(stage){const src=window.StarEmberAssets?.boss(stage)||`assets/ui/bosses/stage-${stage}.svg`;return `<img class="v19-boss-emblem" src="${src}" alt="Boss"/>`}
async function talentUnlock(heroId,nodeId){await action(async()=>{if(cloudMode){const d=await CLOUD.unlockTalent(heroId,nodeId);state=G.migrate(d.state)}else{G.unlockTalent(state,heroId,nodeId);persist()}toast('天赋已点亮')})}
async function presetAction(kind,slot){await action(async()=>{if(cloudMode){const d=await CLOUD.formationPreset(kind,slot,`阵容 ${slot}`);state=G.migrate(d.state)}else{kind==='save'?G.saveFormationPreset(state,slot,`阵容 ${slot}`):G.loadFormationPreset(state,slot);persist()}toast(kind==='save'?`阵容 ${slot} 已保存`:`已载入阵容 ${slot}`)})}
async function sweepRun(count=1){const stage=state.campaignCompleted?30:Math.max(1,state.stage-1);await action(async()=>{let r;if(cloudMode){const d=await CLOUD.sweep(stage,count);state=G.migrate(d.state);r=d.sweep}else{r=G.sweepStage(state,stage,count);persist()}sweepResult={stage,count,reward:r.reward||{},drops:r.drops||[],used:r.used,left:r.left};markBadgeSeen('explore');tab='explore'})}
async function nightRun(id){await action(async()=>{let r;if(cloudMode){const d=await CLOUD.nightVoyage('battle',id);state=G.migrate(d.state);r=d.result}else{r=G.nightEventBattle(state,id);persist()}toast(`夜航完成：${r.name}`);tab='event'})}
async function nightBuy(id){await action(async()=>{let r;if(cloudMode){const d=await CLOUD.nightVoyage('buy',id);state=G.migrate(d.state);r=d.result}else{r=G.nightEventShopBuy(state,id);persist()}const heroId=r.reward?.heroId,total=heroId?G.pendingHeroFragments(state,heroId):0;toast(r.fragmentBanked?`碎片已存入碎片仓 · 当前 ${total} 枚`:`兑换：${rewardText(r.reward)}`);tab='event'})}


async function gacha(count){gachaViewPool='standard';await action(async()=>{if(state.tickets<count)throw Object.assign(new Error('NOT_ENOUGH_TICKETS'),{code:'NOT_ENOUGH_TICKETS'});const starter=count===10&&!state.newbieGacha?.claimed;if(starter){ui.firstContractDone=true;saveUi()}if(cloudMode){const d=starter?await CLOUD.newbieGacha():await CLOUD.gacha(count);state=G.migrate(d.state);lastGacha=d.results}else{lastGacha=starter?G.pullStarterTen(state):G.pull(state,count);persist()}tab='gacha';revealOpen=true;gachaSummaryOpen=false;revealIndex=0;markBadgeSeen('gacha');if(lastGacha[0]?.hero)playVoice(lastGacha[0].hero.id,'acquire');sfx(lastGacha.some(x=>x.hero.rarity==='SSR')?'rare':'gacha')})}
async function limitedGacha(count){gachaViewPool='limited';await action(async()=>{if(state.tickets<count)throw Object.assign(new Error('NOT_ENOUGH_TICKETS'),{code:'NOT_ENOUGH_TICKETS'});if(cloudMode){const d=await CLOUD.limitedGacha(count);state=G.migrate(d.state);lastGacha=d.results}else{lastGacha=G.pullLimited(state,count);persist()}gachaPool='limited';tab='gacha';revealOpen=true;gachaSummaryOpen=false;revealIndex=0;markBadgeSeen('gacha');sfx(lastGacha.some(x=>x.hero.rarity==='SSR')?'rare':'gacha')})}
async function shopBuy(id){await action(async()=>{let d;if(cloudMode){d=await CLOUD.shopBuy(id);state=G.migrate(d.state)}else{d={purchase:G.shopBuy(state,id)};persist()}showRewardFx('补给兑换成功',d.purchase.reward,G.SHOP_ITEMS.find(x=>x.id===id)?.name||'星髓补给');toast(`兑换成功：${rewardText(d.purchase.reward)}`,'success');tab='shop'},'正在兑换补给')}
async function claimWeekly(taskId,claimAll=false){const expected=claimAll?G.WEEKLY_ALL_REWARD:G.WEEKLY_TASKS.find(x=>x.id===taskId)?.reward;await action(async()=>{if(cloudMode){const d=await CLOUD.claimWeekly(taskId,claimAll);state=G.migrate(d.state)}else{claimAll?G.claimWeeklyAll(state):G.claimWeeklyTask(state,taskId);persist()}showRewardFx(claimAll?'周度全勤奖励':'周任务奖励',expected||{});toast(claimAll?'本周全勤奖励已领取':'周任务奖励已领取','success')},'正在领取周任务奖励')}
async function upgrade(id,type){const h=G.byId(id),before={...(state.heroes[id]||{})},beforePower=h&&state.heroes[id]?G.heroPower(h,state.heroes[id],state):0;await action(async()=>{if(cloudMode){const d=await CLOUD.upgrade(id,type);state=G.migrate(d.state)}else{type==='star'?G.starUp(state,id):G.levelUp(state,id);persist()}const after={...(state.heroes[id]||{})},afterPower=h&&state.heroes[id]?G.heroPower(h,state.heroes[id],state):beforePower;showGrowthFx(h,type,before,after,beforePower,afterPower);markBadgeSeen('heroes');toast(`${h.name}${type==='level'?'升级成功':'升星成功'}`,'success')},type==='level'?'正在提升契灵等级':'正在进行星级突破')}
/* 提示词03 交互：满员时点击候选角色 → 进入换位态 → 点击队位完成替换（点击换位，不做拖拽） */
function replaceFormationSlot(slotHeroId){
  if(!replaceCandidateId)return;
  const incoming=replaceCandidateId;
  if(!state.formation.includes(slotHeroId)){replaceCandidateId=null;render();return}
  if(incoming===slotHeroId)return;
  const next=state.formation.map(id=>id===slotHeroId?incoming:id);
  const rows={...(state.formationRows||{})};
  /* 继承被替换者的站位；若来者原本有站位记录则优先沿用 */
  rows[incoming]=rows[incoming]||rows[slotHeroId]||'back';
  replaceCandidateId=null;
  action(async()=>{
    if(cloudMode){const d=await CLOUD.formation(next,rows);state=G.migrate(d.state)}
    else{G.setFormation(state,next,rows);persist()}
    toast(`${G.byId(incoming)?.name||'契灵'} 替换 ${G.byId(slotHeroId)?.name||''} 完成 · 战力 ${G.formationPower(state).toLocaleString()}`,'success');
  },'正在替换队位');
}
async function toggleFormation(id){const on=state.formation.includes(id),next=on?state.formation.filter(x=>x!==id):[...state.formation,id];if(next.length<1){toast('阵容至少保留1名角色');return}
  /* 提示词03 交互：满员后点击候选角色 → 进入"选择要替换的队位"，而不是静默忽略 */
  if(!on&&next.length>5){replaceCandidateId=id;render();toast(`${G.byId(id)?.name||'契灵'}：请点击要替换的队位`);return}
  replaceCandidateId=null;
  await action(async()=>{const rows={...(state.formationRows||{})};if(!on&&!rows[id]){const frontCount=next.filter(x=>rows[x]==='front').length;rows[id]=frontCount<2?'front':'back'}if(cloudMode){const d=await CLOUD.formation(next,rows);state=G.migrate(d.state)}else{G.setFormation(state,next,rows);persist()}if(!state.heroes[selectedHeroId])selectedHeroId=state.formation[0]||Object.keys(state.heroes)[0];markBadgeSeen('formation');toast(on?'已撤下阵容':'已加入阵容')})}
function adoptLiveSession(session){liveSession=session||null;if(!liveSession)return;if(liveSession.pending?.targets?.length&&!liveSession.pending.targets.some(x=>x.id===selectedBattleTargetId))selectedBattleTargetId=liveSession.pending.targets[0].id;battleLog=liveSession.log||[];battleFrame=Math.max(0,(liveSession.timeline?.length||1)-1);if(liveSession.status==='complete'&&liveSession.result){lastBattle=liveSession.result;resultOpen=true;sfx(lastBattle.win?'win':'skill');if(lastBattle.drops?.length)toast(`获得 ${lastBattle.drops.map(x=>x.item.name).join('、')}`)}}
function focusBattleView(){setTimeout(()=>document.querySelector('.m205-battle-focus')?.scrollIntoView?.({behavior:'smooth',block:'start'}),90)}
async function toggleBattleFullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen?.();else await document.documentElement?.requestFullscreen?.()}catch{toast('当前浏览器暂不支持全屏模式')}}
document.addEventListener?.('fullscreenchange',()=>document.documentElement?.classList?.toggle('m205-fullscreen',!!document.fullscreenElement));
async function startLiveBattle(){await action(async()=>{if(!state.formation.length)throw Object.assign(new Error('INVALID_FORMATION'),{code:'INVALID_FORMATION'});let session;if(cloudMode){const d=await CLOUD.battleSessionStart({skillMode:'manual',autoStrategy:ui.autoStrategy});state=G.migrate(d.state);session=d.session}else{session=G.startBattleSession(state,{skillMode:'manual',autoStrategy:ui.autoStrategy});persist()}adoptLiveSession(session);tab='explore'});focusBattleView()}
async function commandLiveBattle(command){await action(async()=>{if(!liveSession?.pending)throw Object.assign(new Error('BATTLE_SESSION_NOT_WAITING'),{code:'BATTLE_SESSION_NOT_WAITING'});let session;if(cloudMode){const d=await CLOUD.battleSessionCommand(liveSession.id,liveSession.pending.heroId,command,selectedBattleTargetId);state=G.migrate(d.state);session=d.session}else{session=G.battleSessionCommand(state,liveSession.id,liveSession.pending.heroId,command,undefined,selectedBattleTargetId);persist()}adoptLiveSession(session);const line=session?.log?.[session.log.length-1]||'';combatFeedback(line,session?.timeline?.[session.timeline.length-1]?.effect||{})})}
async function cancelLiveBattle(){await action(async()=>{if(!liveSession)return;if(cloudMode){const d=await CLOUD.battleSessionCancel(liveSession.id);state=G.migrate(d.state)}else{G.cancelBattleSession(state,liveSession.id);persist()}liveSession=null;battleLog=[];toast('已撤离当前战斗')})}
function legacyPlayBattleSummary(){if(battleTimer){clearInterval(battleTimer);battleTimer=null}const frames=lastBattle?.timeline||[];exploreViewMode='archive';battleFrame=0;resultOpen=false;render();focusBattleView();if(frames.length<=1){resultOpen=true;render();return}const step=Math.max(1,Math.ceil(frames.length/18)),delay=Math.max(110,Math.round(260/(Number(ui.battleSpeed)||1)));battleTimer=setInterval(()=>{battleFrame=Math.min(frames.length-1,battleFrame+step);const f=frames[battleFrame]||{};combatFeedback(f.text||'',f.effect||{});if(battleFrame>=frames.length-1){clearInterval(battleTimer);battleTimer=null;setTimeout(()=>{resultOpen=true;render()},220)}render()},delay)}
async function battle(){if(battleTimer){clearInterval(battleTimer);battleTimer=null;battlePaused=false}if(ui.skillMode==='manual')return startLiveBattle();await action(async()=>{if(!state.formation.length)throw Object.assign(new Error('INVALID_FORMATION'),{code:'INVALID_FORMATION'});let d;if(cloudMode){d=await CLOUD.battle({skillMode:'auto',autoStrategy:ui.autoStrategy});state=G.migrate(d.state);battleLog=d.battle.log}else{d={battle:G.battle(state,{skillMode:'auto',autoStrategy:ui.autoStrategy})};battleLog=d.battle.log;persist()}lastBattle=d.battle;liveSession=null;battleFrame=0;resultOpen=false;sfx(d.battle.win?'win':'defeat');screenPulse(d.battle.win?'win':'hit');if(d.battle.drops?.length){const converted=d.battle.drops.filter(x=>x.converted?.forgeDust).reduce((n,x)=>n+x.converted.forgeDust,0),kept=d.battle.drops.filter(x=>!x.converted?.forgeDust).map(x=>x.item.name);toast(converted?`${kept.length?`获得 ${kept.join('、')} · `:''}重复遗物转化锻造尘 +${converted}`:`获得 ${kept.join('、')}`);}tab='explore';exploreViewMode='archive'});playBattleSummary()}
async function claimDaily(taskId,claimAll=false){const expected=claimAll?G.DAILY_ALL_REWARD:G.DAILY_TASKS.find(x=>x.id===taskId)?.reward;await action(async()=>{if(cloudMode){const d=await CLOUD.claimDaily(taskId,claimAll);state=G.migrate(d.state)}else{claimAll?G.claimDailyAll(state):G.claimDailyTask(state,taskId);persist()}showRewardFx(claimAll?'今日全勤奖励':'每日任务奖励',expected||{});toast(claimAll?'全勤奖励已领取':'任务奖励已领取','success')},'正在领取每日奖励')}
async function claimLoginReward(){await action(async()=>{let d;if(cloudMode){d=await CLOUD.claimLoginReward();state=G.migrate(d.state)}else{d={claim:G.claimLoginReward(state)};persist()}showRewardFx(`第 ${d.claim.day} 日 · ${d.claim.name||'登录奖励'}`,d.claim.reward,'七曜登录契约');toast(`登录第${d.claim.day}日：${rewardText(d.claim.reward)}`,'success');sfx(d.claim.day===7?'rare':'gacha')},'正在领取登录奖励')}
/* v2.2.4 QC-2d：云端调用超时保护。
   真机实测：点「连接」后 CloudBase SDK 的首个请求可能长时间不返回，
   此时按钮会一直停在"正在连接云存档"转圈，玩家既进不去也退不出。
   这里给云存档连接/刷新加 10 秒闸门：超时就按不可用处理，回到本地试玩。 */
function cloudTimeout(ms=10000){
  return new Promise((_,reject)=>setTimeout(()=>{
    const e=new Error('NETWORK_UNSTABLE');e.code='NETWORK_UNSTABLE';reject(e);
  },ms));
}
async function connectCloudCore(){if(!onlineNow())throw Object.assign(new Error('NETWORK_OFFLINE'),{code:'NETWORK_OFFLINE'});if(!CLOUD.configured())throw Object.assign(new Error('CLOUD_NOT_CONFIGURED'),{code:'CLOUD_NOT_CONFIGURED'});if(!cloudMode&&hadLocalSave&&!G.isPristine(state)){saves.backup(state);const ok=window.confirm?.('检测到当前设备已有本地进度。连接云端可能切换到另一份存档。已先创建本地备份，是否继续连接？');if(ok===false)throw Object.assign(new Error('CLOUD_CONNECT_CANCELLED'),{code:'CLOUD_CONNECT_CANCELLED'});}const d=await Promise.race([CLOUD.connect(),cloudTimeout()]);state=G.migrate(d.state);cloudMode=true;remoteDenied=false;remoteUnavailable=false;ui.cloudAutoConnect=true;saveUi();lastAutoCloudSync=Date.now();moreOpen=false;liveSession=state.activeBattleSession||null;selectedHeroId=state.formation[0]||Object.keys(state.heroes)[0];lastGacha=[];battleLog=liveSession?.log||[];return d}
/* v2.2.4 QC-2：连接失败时统一记录远端状态，让三处入口与下一次提示保持一致 */
async function connectCloud(){await action(async()=>{await connectCloudCore();toast(liveSession?.status==='waiting'?'已连接云端，并恢复未完成战斗':'已连接云端账号','success')},'正在连接云存档',e=>markRemoteFailure(e.code||e.message))}
async function syncCloud(){await action(async()=>{if(!onlineNow())throw Object.assign(new Error('NETWORK_OFFLINE'),{code:'NETWORK_OFFLINE'});if(!cloudMode){await connectCloudCore();toast(liveSession?.status==='waiting'?'已连接云端，并恢复未完成战斗':'已连接云端账号','success');return}const d=await CLOUD.load();state=G.migrate(d.state);lastAutoCloudSync=Date.now();moreOpen=false;liveSession=state.activeBattleSession||null;battleLog=liveSession?.log||battleLog;toast(liveSession?.status==='waiting'?'云端进度已刷新 · 手动战斗可继续':'云端进度已刷新','success')},'正在刷新云存档',e=>markRemoteFailure(e.code||e.message))}
async function createLinkCode(){await action(async()=>{if(!cloudMode)throw Object.assign(new Error('UNAUTHENTICATED'),{code:'UNAUTHENTICATED'});currentLink=await CLOUD.createLinkCode();toast('迁移码已生成，有效期10分钟')})}
async function redeemLinkCode(){const code=(document.getElementById('linkCodeInput')?.value||linkCodeDraft||'').trim();if(!code){toast('请输入6位迁移码');return}await action(async()=>{if(!cloudMode){if(!G.isPristine(state))throw Object.assign(new Error('LINK_WOULD_REPLACE_PROGRESS'),{code:'LINK_WOULD_REPLACE_PROGRESS'});await connectCloudCore()}const d=await CLOUD.redeemLinkCode(code);state=G.migrate(d.state);cloudMode=true;ui.cloudAutoConnect=true;saveUi();lastAutoCloudSync=Date.now();moreOpen=false;liveSession=state.activeBattleSession||null;selectedHeroId=state.formation[0]||Object.keys(state.heroes)[0];battleLog=liveSession?.log||[];currentLink=null;linkCodeDraft='';toast('账号绑定成功，已切换到同一份云存档','success')})}
async function setLoadout(type,data){await action(async()=>{if(cloudMode){const d=await CLOUD.loadout({type,...data});state=G.migrate(d.state)}else{if(type==='gear')G.equipGear(state,data.heroId,data.itemId);else if(type==='unequip')G.unequipGear(state,data.heroId,data.slot);else G.equipRelic(state,data.itemId||null);persist()}toast(type==='relic'?'队伍遗物已更新':'装备已更新')})}

async function enhanceGear(itemId){await action(async()=>{const item=G.equipmentById(itemId);if(cloudMode){const d=await CLOUD.enhanceEquipment(itemId);state=G.migrate(d.state)}else{G.enhanceEquipment(state,itemId);persist()}toast(`${item.name} 强化成功`)})}
async function resourceDungeon(id){await action(async()=>{let d;if(cloudMode){d=await CLOUD.resourceDungeon(id);state=G.migrate(d.state)}else{d={run:G.resourceDungeon(state,id)};persist()}toast(`资源副本完成：${rewardText(d.run.reward)}`);tab='explore'})}
async function claimAchievement(id){const a=G.ACHIEVEMENTS.find(x=>x.id===id);await action(async()=>{let reward=achievementDisplayReward(a);if(cloudMode){const d=await CLOUD.claimAchievement(id);state=G.migrate(d.state);reward=d.achievement?.reward||reward}else{const d=G.claimAchievement(state,id);reward=d.reward||reward;persist()}showRewardFx('成就达成',reward,a?.name||'星烬成就');toast('成就奖励已领取','success')},'正在领取成就奖励')}
async function dismantleGear(itemId){await action(async()=>{const item=G.equipmentById(itemId);let d;if(cloudMode){d=await CLOUD.dismantleEquipment(itemId,1);state=G.migrate(d.state)}else{d={dismantle:G.dismantleEquipment(state,itemId,1)};persist()}toast(`${item.name} 已分解 · +${d.dismantle.forgeDust}锻造尘`)})}
async function forgeGear(recipeId){await action(async()=>{let d;if(cloudMode){d=await CLOUD.forgeEquipment(recipeId);state=G.migrate(d.state)}else{d={forge:G.forgeEquipment(state,recipeId)};persist()}toast(`锻造完成：${d.forge.item.name}`);tab='inventory'})}
async function runEvent(id){await action(async()=>{let d;if(cloudMode){d=await CLOUD.eventBattle(id);state=G.migrate(d.state)}else{d={run:G.eventBattle(state,id)};persist()}toast(`${d.run.name} 通关 · ${rewardText(d.run.reward)}`);tab='event'})}
async function eventBuy(id){await action(async()=>{let d;if(cloudMode){d=await CLOUD.eventShopBuy(id);state=G.migrate(d.state)}else{d={purchase:G.eventShopBuy(state,id)};persist()}const r=d.purchase||d.result||{},heroId=r.reward?.heroId,total=heroId?G.pendingHeroFragments(state,heroId):0;toast(r.fragmentBanked?`碎片已存入碎片仓 · 当前 ${total} 枚`:'活动商店兑换成功');tab='event'})}
async function giftBond(heroId){await action(async()=>{const h=G.byId(heroId);let d;if(cloudMode){d=await CLOUD.bondGift(heroId,1);state=G.migrate(d.state)}else{d={bond:G.giftHero(state,heroId,1)};persist()}toast(`${h.name} 好感提升至 Lv.${d.bond.info.level}`)})}

async function setSignature(heroId,signatureId){await action(async()=>{const sig=G.signatureById(signatureId);if(cloudMode){const d=await CLOUD.equipSignature(heroId,signatureId);state=G.migrate(d.state)}else{G.equipSignature(state,heroId,signatureId);persist()}toast(`已装备契印武装：${sig.name}`)})}
async function awaken(heroId){const h=G.byId(heroId),before={...(state.heroes[heroId]||{})},beforePower=h&&state.heroes[heroId]?G.heroPower(h,state.heroes[heroId],state):0;await action(async()=>{if(cloudMode){const d=await CLOUD.awakenHero(heroId);state=G.migrate(d.state)}else{G.awakenHero(state,heroId);persist()}const after={...(state.heroes[heroId]||{})},afterPower=h&&state.heroes[heroId]?G.heroPower(h,state.heroes[heroId],state):beforePower;showGrowthFx(h,'awaken',before,after,beforePower,afterPower);markBadgeSeen('heroes');toast(`${h.name} 觉醒成功`,'success')},'正在进行契灵觉醒')}
async function mailClaim(id,all=false){const expected=all?mergeRewards((state.mails||[]).filter(x=>!x.claimed).map(x=>x.reward)):((state.mails||[]).find(x=>x.id===id)?.reward||{});await action(async()=>{if(cloudMode){const d=await CLOUD.claimMail(id,all);state=G.migrate(d.state)}else{all?G.claimAllMail(state):G.claimMail(state,id);persist()}showRewardFx(all?'邮件奖励全部领取':'邮件奖励领取',expected,'星轨邮件');toast(all?'邮件奖励已全部领取':'邮件奖励已领取','success')},'正在领取邮件奖励')}
async function runEventBoss(){await action(async()=>{let d;if(cloudMode){d=await CLOUD.eventBoss();state=G.migrate(d.state);eventLeaderboard=d.leaderboard||[]}else{d={run:G.eventBossBattle(state)};eventLeaderboard=G.localEventLeaderboard(state);persist()}toast(`对月蚀兽造成 ${d.run.damage.toLocaleString()} 伤害`);tab='event'})}
async function refreshLeaderboard(){if(!cloudMode){eventLeaderboard=G.localEventLeaderboard(state);render();return}await action(async()=>{const d=await CLOUD.getLeaderboard();eventLeaderboard=d.leaderboard||[]})}

async function restoreCloudSilently(reason='启动'){
  if(!ui.cloudAutoConnect||cloudMode||!CLOUD.configured()||!onlineNow())return false;
  /* v2.2.4 QC-2b：已知云端不可用时不再白等一次超时 */
  if(remoteOffline()){cloudRestoreWarning=true;return false}
  try{
    bootMessage=reason==='启动'?'正在恢复云存档':'正在重新连接云存档';bootProgress=Math.max(bootProgress,72);if(booting)render();
    const d=await Promise.race([CLOUD.connect(),new Promise((_,reject)=>setTimeout(()=>{const e=new Error('NETWORK_UNSTABLE');e.code='NETWORK_UNSTABLE';reject(e)},2400))]);state=G.migrate(d.state);cloudMode=true;lastAutoCloudSync=Date.now();liveSession=state.activeBattleSession||null;selectedHeroId=state.formation[0]||Object.keys(state.heroes)[0];battleLog=liveSession?.log||battleLog;return true;
  }catch(e){console.warn('[cloud-auto-restore]',e);cloudRestoreWarning=true;return false}
}
async function refreshCloudSilently(reason='恢复前台'){
  if(!cloudMode||busy||!onlineNow()||Date.now()-lastAutoCloudSync<15000)return false;
  try{const d=await CLOUD.load();state=G.migrate(d.state);lastAutoCloudSync=Date.now();liveSession=state.activeBattleSession||null;battleLog=liveSession?.log||battleLog;render();toast(reason==='网络恢复'?'网络恢复 · 云存档已同步':'云存档已自动刷新','success');return true}catch(e){console.warn('[cloud-auto-refresh]',e);return false}
}
function networkStrip(){const n=networkProfile();if(!n.online)return `<div class="m209-network-strip offline"><b>离线模式</b><span>${cloudMode?'云端操作暂停；恢复网络后会自动同步。':'本地玩法仍可继续，云存档暂不可用。'}</span></div>`;if(weakNetwork())return `<div class="m209-network-strip weak"><b>弱网模式</b><span>已减少非必要资源预加载，优先保证战斗和存档。</span></div>`;return''}
function installNudge(){if(ui.installDismissed||!canOfferInstall())return'';return `<section class="m209-install-nudge"><span><b>▣ 添加到桌面</b><small>${isIOS()?'使用 Safari 添加到主屏幕，可获得更接近手游的全屏体验。':'安装为独立应用，减少浏览器地址栏干扰。'}</small></span><div><button class="btn primary compact" data-action="pwaInstall">${isIOS()?'查看方法':'立即安装'}</button><button class="btn ghost compact" data-action="pwaDismiss">稍后</button></div></section>`}
function returnOverlay(){if(!returnOpen||booting||!ui.tutorialDone)return'';const n=utilityBadgeCounts(),ev=eventStatus(),eventLeft=ev.eclipseLeft+ev.bossLeft+ev.nightLeft,active=liveSession&&liveSession.status!=='complete';return `<div class="v10-modal-layer m209-return-layer"><section class="m209-return-card"><div class="m209-return-star">✦</div><div class="kicker">WELCOME BACK · ${returnGapHours>=72?'LONG VOYAGE':'STAR TRACK'}</div><h2>${returnGapHours>=72?'久违了，引星者':'欢迎回来，引星者'}</h2><p>${active?'检测到一场未完成的手动战斗，可以直接继续。':`你已离开约 ${Math.max(1,Math.floor(returnGapHours))} 小时，星轨事务所和活动状态已经更新。`}</p><div class="m209-return-stats"><span><small>主线</small><b>Stage ${state.stage}</b></span><span><small>待处理</small><b>${n.total}</b></span><span><small>活动次数</small><b>${eventLeft}</b></span></div><div class="btnrow"><button class="btn ghost" data-action="returnDaily">查看今日</button><button class="btn primary" data-action="returnExplore">${active?'继续战斗':'继续探索'}</button></div><button class="m209-return-close" data-action="returnClose">进入大厅</button></section></div>`}
function pwaHelpOverlay(){if(!pwaHelpOpen)return'';return `<div class="v10-modal-layer m209-pwa-layer"><section class="m209-pwa-card"><button class="v10-close" data-action="pwaHelpClose">×</button><div class="m209-pwa-icon">▣</div><div class="kicker">INSTALL TO HOME SCREEN</div><h2>添加《星烬契约》到桌面</h2><p>${isIOS()?'在 Safari 底部点击“分享”按钮，再选择“添加到主屏幕”。之后从桌面图标启动即可进入独立全屏窗口。':'浏览器支持安装时，点击“立即安装”并确认即可。'}</p><div class="m209-pwa-steps"><span><b>1</b>打开浏览器菜单 / 分享</span><span><b>2</b>选择“安装应用”或“添加到主屏幕”</span><span><b>3</b>以后从桌面图标进入游戏</span></div><button class="btn primary wide" data-action="pwaHelpClose">知道了</button></section></div>`}
async function installPwa(){if(isStandalone()){toast('当前已经以桌面应用模式运行','success');return}if(pwaInstallPrompt){const prompt=pwaInstallPrompt;pwaInstallPrompt=null;try{await prompt.prompt();const choice=await prompt.userChoice;if(choice?.outcome==='accepted'){ui.installDismissed=true;saveUi();toast('安装已确认，可从桌面启动','success')}else toast('已取消安装，可稍后从“更多”再次安装')}catch{pwaHelpOpen=true}render();return}pwaHelpOpen=true;render()}
async function startBootSequence(){
  const started=Date.now();bootProgress=12;bootMessage=weakNetwork()?'弱网模式 · 正在载入必要资源':'正在预载关键资源';render();
  try{const preload=window.StarEmberAssets?.preloadCritical?.({reduced:weakNetwork()});if(preload)await Promise.race([preload,new Promise(resolve=>setTimeout(resolve,1500))])}catch(e){console.warn('[preload]',e)}
  bootProgress=Math.max(bootProgress,66);bootMessage='正在检查本地进度';render();
  const restored=await restoreCloudSilently('启动');
  /* v2.2.4 QC-2b：没走自动恢复（默认状态）时也探一次，保证入口状态从一开始就一致 */
  if(!restored)await probeCloudReach({silent:true});
  bootProgress=100;bootMessage=cloudMode?'云存档已恢复 · 星轨就绪':cloudRestoreWarning?'云存档恢复失败 · 已进入本地保护':'星轨已就绪';render();
  const wait=Math.max(0,520-(Date.now()-started));setTimeout(()=>{booting=false;if(cloudRestoreWarning&&ui.cloudAutoConnect)toast('云存档自动恢复失败，当前保留本地进度；可在设置中重试连接','error');returnOpen=hadLocalSave&&ui.tutorialDone&&returnGapHours>=12;render();try{window.StarEmberAssets?.preloadSecondary?.({reduced:weakNetwork()})}catch{}},wait+120)
}
function renderTop(){
  const meta=CLOUD.meta?.()||{},lead=G.byId(state.formation[0]||Object.keys(state.heroes)[0]||'h001'),leadP=state.heroes[lead?.id]||{},mail=G.unreadMailCount(state),notice=topNoticeCount();
  const status=cloudMode?(meta.identityKind==='wechat'?'微信云端':'云端账号'):'本地试玩';
  return `<header class="topbar v216-topbar">
    <div class="v216-player"><div class="v216-player-avatar">${lead?portrait(lead,'selected'):''}</div><div><strong>${lead?.name||'引星者'}</strong><small>Lv.${leadP.level||1} · ${status}</small></div></div>
    <details class="v216-resource-drawer"><summary aria-label="资源总览">${topResourceBlocks()}</summary><div class="v216-resource-pop m221-resource-pop"><div><i>◇</i><span><b>星髓 ${state.starCrystal.toLocaleString()}</b><small>日常、成就与活动奖励</small></span><button data-tab="shop">＋</button></div><div><i>◈</i><span><b>烬币 ${state.coin.toLocaleString()}</b><small>角色升级与主要养成货币</small></span><button data-action="midgameGo" data-target="explore" data-focus="m213-resource-focus">＋</button></div><div><i>◎</i><span><b>契灵印 ${state.tickets.toLocaleString()}</b><small>用于契约召唤</small></span><button data-tab="gacha">＋</button></div><div><i>◆</i><span><b>星铁 ${(state.inventory.starIron||0).toLocaleString()}</b><small>装备强化与锻造材料</small></span><button data-action="midgameGo" data-target="explore" data-focus="m213-resource-focus">＋</button></div><div><i>✧</i><span><b>锻造尘 ${(state.inventory.forgeDust||0).toLocaleString()}</b><small>分解装备或活动获取</small></span><button data-tab="inventory">＋</button></div><div><i>✦</i><span><b>觉醒核 ${(state.inventory.awakeningCore||0).toLocaleString()}</b><small>高阶活动与签到稀有奖励</small></span><button data-tab="event">＋</button></div></div></details>
    <div class="v216-top-actions"><button data-action="midgameGo" data-target="hub" data-view="mail" aria-label="邮件">✉${mail?`<i>${badgeText(mail)}</i>`:''}</button><button data-action="moreOpen" aria-label="快捷菜单">☷${notice?`<i>${badgeText(notice)}</i>`:''}</button><button data-action="settings" aria-label="设置">⚙</button></div>
  </header>`
}
/* 设计图(1)：顶栏三个资源常显，各带独立「＋」直达获取途径；数值过大时缩写 */
function compactNum(v){
  const n=Number(v)||0;
  if(n<10000) return String(n);
  if(n<100000000){const w=n/10000;return (w<100?Math.round(w*10)/10:Math.round(w))+'万';}
  return Math.round(n/1000000)/100+'亿';
}
function topResourceBlocks(){
  const rows=[
    ['crystal','◇',state.starCrystal,'星髓','data-tab="shop"'],
    ['coin','◈',state.coin,'烬币','data-action="midgameGo" data-target="explore" data-focus="m213-resource-focus"'],
    ['ticket','◎',state.tickets,'契灵印','data-tab="gacha"'],
  ];
  return rows.map(([cls,icon,value,label,route])=>
    `<span class="v216-res ${cls}" title="${label} ${Number(value||0).toLocaleString()}"><i>${icon}</i><b>${compactNum(value)}</b><button class="v216-res-plus" ${route} aria-label="${label} · 获取途径">＋</button></span>`).join('');
}
/* v2.2.4 QC-2（真机实测 P0-2）：统一云存档状态判定
   原状：CLOUD.configured() 只看"配置里填了 env"就返回 true，于是快捷菜单显示
   "CloudBase 已配置，可连接云端"，而真机点下去 403 → 报"云端权限未配置完成…"。
   一处说能连、一处报错，自相矛盾。
   做法：把"已配置"与"远端当前可用"拆开记录。连接失败时记下原因，
   UI 三处（首页入口 / 快捷菜单 / 账号页）与错误提示全部读同一个状态。 */
let remoteUnavailable=false,remoteDenied=false,remoteProbed=false,remoteProbeRunning=false;
const CLOUD_REACH_KEY='starEmber.cloudReach.v1';
function loadCloudReach(){try{const v=JSON.parse(localStorage.getItem(CLOUD_REACH_KEY)||'null');const fresh=v&&Number(v.at)&&(Date.now()-Number(v.at)<6*3600*1000);return fresh?v:null}catch(e){return null}}
function persistCloudReach(){try{localStorage.setItem(CLOUD_REACH_KEY,JSON.stringify({denied:remoteDenied,unavailable:remoteUnavailable,at:Date.now()}))}catch(e){}}
(function initCloudReach(){const v=loadCloudReach();if(!v)return;remoteDenied=!!v.denied;remoteUnavailable=!!v.unavailable;remoteProbed=true})();
function remoteOffline(){return remoteUnavailable||remoteDenied}
function markRemoteFailure(code){
  if(code==='CLOUD_PERMISSION_DENIED'){remoteDenied=true;remoteUnavailable=true}
  else if(code==='CLOUD_FUNCTION_FAILED'||code==='NETWORK_UNSTABLE'||code==='NETWORK_OFFLINE'||code==='CLOUDBASE_SDK_LOAD_FAILED'||code==='ANONYMOUS_AUTH_UNAVAILABLE'){remoteUnavailable=true}
  else if(code==='CLOUD_NOT_CONFIGURED'){remoteUnavailable=true}
  else return;
  remoteProbed=true;persistCloudReach();
  /* 开发者详情只进 console，玩家界面不出现 CloudBase 术语 */
  try{
    console.warn('[star-ember:cloud] 云存档不可用','code='+code,
      '\n 请检查：CloudBase 匿名登录是否开启 / 云函数调用权限 / 域名白名单（当前域名需加入安全域名）',
      '\n 玩家侧表现：本地存档继续可用，云存档入口显示"暂不可用"。');
  }catch(e){}
}
/* 玩家可见文案：统一取自这里，任何入口都不再各说一套 */
function cloudStatusNote(){
  if(cloudMode)return'云端已连接，进度会同步到账号。';
  if(!CLOUD.configured())return'云存档尚未开放，当前进度只保存在本浏览器。';
  if(remoteDenied)return'云存档暂不可用，当前进度已保存在本浏览器。';
  if(remoteUnavailable)return'云存档连接不稳定，当前进度已保存在本浏览器。';
  if(!remoteProbed)return'正在检查云存档可用性，当前进度已保存在本浏览器。';
  return'云存档可用，连接后可在多台设备间同步进度。';
}
function cloudActionLabel(){return cloudMode?'刷新云存档':remoteOffline()?'重试连接':remoteProbed?'连接':'检查中' }
function cloudNudge(){if(tab!=='home'||cloudMode||!CLOUD.configured())return'';return `<div class="m204-cloud-nudge m208-cloud-nudge"><span><b>☁ ${remoteOffline()?'云存档暂不可用':remoteProbed?'云存档尚未连接':'正在检查云存档'}</b><small>${remoteOffline()?'当前进度只保存在本浏览器，可稍后重试。':remoteProbed?'当前进度只保存在本浏览器。':'检查完成后会给出可连接状态。'}</small></span><button class="btn secondary compact" data-action="cloud">${cloudActionLabel()}</button></div>`}
/* v2.2.4 QC-2b：启动时主动探测一次"云端到底能不能用"，让三处入口从一开始就一致。
   原状：configured() 只看配置里有没有填 env 就返回 true → 快捷菜单显示"已配置，可连接"，
        同一屏的首页入口却因为点过失败而显示不可用 → 自相矛盾。
   做法：启动时静默跑一次轻量调用，把结果（能否可用）记下来，所有入口共用。
   结果按 6 小时内有效缓存，避免每次开游戏都白跑一次请求。
   安全约束：这台设备已经有本地进度、且用户没开过"自动恢复云存档"时，
             探测只记录可用性、不改动存档归属，避免把本地进度直接换成云存档。 */
async function probeCloudReach({silent=true}={}){
  if(remoteProbeRunning||cloudMode||!CLOUD.configured()||!onlineNow())return remoteOffline();
  const localExists=typeof hadLocalSave!=='undefined'&&hadLocalSave;
  const canAdopt=!!ui.cloudAutoConnect||!localExists;
  remoteProbeRunning=true;
  try{
    const d=await Promise.race([CLOUD.connect(),cloudTimeout()]);remoteDenied=false;remoteUnavailable=false;remoteProbed=true;persistCloudReach();
    if(canAdopt){
      state=G.migrate(d.state);cloudMode=true;
      ui.cloudAutoConnect=true;saveUi();lastAutoCloudSync=Date.now();
      liveSession=state.activeBattleSession||null;
      selectedHeroId=state.formation[0]||Object.keys(state.heroes)[0];
      battleLog=liveSession?.log||battleLog;
      if(!silent)toast('云存档已连接','success');
    }
    return true;
  }catch(e){
    remoteProbeRunning=false;
    markRemoteFailure(e.code||e.message);
    return false;
  }finally{
    remoteProbeRunning=false;
    render();
  }
}
/* 设计图(5)-02：卡池概率公示表 —— 分档 + 百分比 + 条形图 + 保底进度 */
function rateTable(limited){
  const pity=limited?(state.limited?.pity||0):(state.pity||0),max=limited?60:50,left=Math.max(0,max-pity);
  const rows=limited
    ? [['SSR','3%','含当期 UP',3],['SR','22%','重复转化碎片',22],['R','75%','重复转化碎片',75]]
    : [['SSR','3%',left<=0?'本次必出':'50 抽保底',3],['SR','22%','重复转化碎片',22],['R','75%','重复转化碎片',75]];
  return `<div class="m222-rate-table">
    ${rows.map(([label,pct,note,bar])=>`<div class="m222-rate-row"><b class="rarity-${label}">${label}</b><div class="m222-rate-bar"><i style="width:${bar}%"></i></div><strong>${pct}</strong><small>${note}</small></div>`).join('')}
  </div>
  <div class="m222-pity-note"><span>${limited?'限定保底':'SSR 保底'}</span><b>${pity} / ${max}</b><em>还差 ${left} 抽</em></div>
  <p class="m222-rate-rule">${limited?'限定池 60 抽保底；若 SSR 不是当期 UP，则下一次 SSR 必定为当期 UP。':'常驻池 50 抽保底；首次常驻十连额外执行新手 SSR 保障。'}重复契灵自动转化为碎片，不占用保底。</p>`;
}
/* 设计图(5)-03：召唤前二次确认（避免误触消耗契灵印） */
function gachaConfirmOverlay(){
  if(!gachaConfirm)return'';
  const c=gachaConfirm,label=c.pool==='limited'?'限定 · 月影流光':'常驻 · 星契轮';
  return `<div class="v10-modal-layer m222-confirm-layer"><section class="m222-confirm-card">
    <div class="kicker">CONTRACT CONFIRM</div><h2>确认召唤</h2>
    <p>是否消耗 <b>${c.count}</b> 张契灵印进行 <b>${c.count}</b> 次召唤？</p>
    <div class="m222-confirm-rows">
      <div><span>卡池</span><b>${label}</b></div>
      <div><span>持有契灵印</span><b>${state.tickets}</b></div>
      <div><span>消耗后剩余</span><b>${Math.max(0,state.tickets-c.count)}</b></div>
      <div><span>距离保底</span><b>${Math.max(0,(c.pool==='limited'?60:50)-(c.pool==='limited'?(state.limited?.pity||0):(state.pity||0)))} 抽</b></div>
    </div>
    <div class="btnrow"><button class="btn ghost" data-action="gachaConfirmCancel">取消</button><button class="btn primary" data-action="gachaConfirmOk">确认召唤 ×${c.count}</button></div>
  </section></div>`;
}

/* v2.2.4 QC-4（真机实测 P1-4）：剧情立绘此前用的是 276×852 的缩略图 h0xx.jpg，
   被 object-fit:cover 拉伸到约 820×610（放大近 3 倍）→ 严重模糊。
   'story' 加入高清档：改用 1082×1224 的 h0xx_full.jpg（无需放大）。
   注：.v12-story-art img 的 filter 只有 saturate/brightness，没有 blur，
   模糊不是滤镜造成的，纯粹是源图分辨率不足 —— 因此这里只换图，不动滤镜。 */
function portrait(h,size='card'){const v=G.HERO_VISUALS[h.id]||{},src=window.StarEmberAssets?.heroPortrait(h.id,size==='profile'||size==='archive'||size==='reveal'||size==='limited'||size==='story')||`assets/characters/${h.id}.jpg`,skill=window.StarEmberAssets?.skill(h.id)||`assets/ui/skills/${h.id}.svg`,eager=['profile','archive','reveal','limited','battle','story'].includes(size);return `<div class="hero-portrait ${size} portrait-${h.id} art-loaded" title="${v.title||h.name}"><img src="${src}" alt="${h.name}" loading="${eager?'eager':'lazy'}" decoding="async" fetchpriority="${eager?'high':'low'}" onerror="this.style.display='none';this.parentElement.classList.remove('art-loaded')"/><div class="portrait-aura"></div><div class="portrait-halo"></div><div class="portrait-body"></div><div class="portrait-face"></div><div class="portrait-hair"></div><div class="portrait-weapon"></div><img class="v19-portrait-skill" src="${skill}" alt="" loading="lazy" decoding="async"/><div class="portrait-sigil">✦</div></div>`}
/* 设计图(7)-04：成就页 —— 顶部进度环 + 分类标签 */
function achievementPanel(){
  const all=G.ACHIEVEMENTS.map(a=>({a,p:G.achievementProgress(state,a),claimed:!!state.achievements?.claimed?.[a.id]}));
  const doneCount=all.filter(x=>x.p>=x.a.goal).length,claimedCount=all.filter(x=>x.claimed).length,total=all.length;
  const pct=total?Math.round(claimedCount/total*100):0;
  const rows=all.filter(x=>achFilter==='all'||achCategory(x.a.type)===achFilter);
  const cats=ACH_CATS.map(([id,name])=>{const n=id==='all'?total:all.filter(x=>achCategory(x.a.type)===id).length;
    const d=id==='all'?doneCount:all.filter(x=>achCategory(x.a.type)===id&&x.p>=x.a.goal).length;
    return `<button class="${achFilter===id?'active':''}" data-action="achFilter" data-filter="${id}">${name}<em>${d}/${n}</em></button>`}).join('');
  const body=rows.map(({a,p,claimed})=>{const done=p>=a.goal;return `<div class="achievement ${claimed?'claimed':done?'ready':''}"><div class="achievement-icon">${claimed?'✓':done?'✦':'◇'}</div><div class="achievement-main"><strong>${a.name}</strong><span>${a.desc}</span><div class="task-progress"><i style="width:${Math.min(100,p/a.goal*100)}%"></i></div><small>${Math.min(p,a.goal)}/${a.goal} · ${rewardText(achievementDisplayReward(a))}</small></div><button class="btn ${done&&!claimed?'primary':'ghost'} compact" data-action="claimAchievement" data-id="${a.id}" ${!done||claimed?'disabled':''}>${claimed?'已领取':done?'领取':'未达成'}</button></div>`}).join('');
  return `<div class="panel m222-ach-panel">
    <div class="section-title"><div><div class="kicker">ACHIEVEMENTS</div><h3>星烬成就</h3></div><span class="small muted">长期目标</span></div>
    <div class="m222-ach-head">
      <div class="m222-ach-ring" style="--p:${pct}"><span><b>${claimedCount}</b><small>/ ${total}</small></span></div>
      <div class="m222-ach-meta"><strong>已达成成就 ${doneCount}/${total}</strong><span>已领取 ${claimedCount} 项 · 完成度 ${pct}%</span><em>${doneCount-claimedCount>0?`可领取 ${doneCount-claimedCount} 项`:'继续探索解锁更多成就'}</em></div>
    </div>
    <div class="m222-ach-cats">${cats}</div>
    ${body}
  </div>`;
}
/* 设计图(7)-02：任务页 —— 顶部活跃度进度条 */
function dailyPanel(){G.ensureDaily(state);const items=G.DAILY_TASKS.map(t=>{const p=state.daily.progress[t.id]||0,done=p>=t.goal,claimed=!!state.daily.claimed[t.id],route=taskRoute(t.id);return `<div class="task"><div class="task-main"><strong>${t.name}</strong><span>${t.desc}</span><div class="task-progress"><i style="width:${Math.min(100,p/t.goal*100)}%"></i></div><small>${p}/${t.goal} · ${rewardText(t.reward)}</small></div>${claimed?'<button class="btn ghost compact" disabled>已领取</button>':done?`<button class="btn primary compact" data-action="claimDaily" data-id="${t.id}">领取</button>`:`<button class="btn secondary compact" data-action="taskGo" data-id="${t.id}" data-target="${route.target}" data-focus="${route.focus||''}">${route.label}</button>`}</div>`}).join('');
  const claimedN=G.DAILY_TASKS.filter(t=>state.daily.claimed[t.id]).length,activeN=G.DAILY_TASKS.length,activePct=activeN?Math.round(claimedN/activeN*100):0;
  const allReady=G.DAILY_TASKS.every(t=>state.daily.claimed[t.id]);
  return `<div class="panel m213-daily-panel">
    <div class="section-title"><div><div class="kicker">DAILY CONTRACT</div><h3>今日星约</h3></div><span class="small muted">${state.daily.day}</span></div>
    <div class="m222-active-row"><div class="m222-active-bar"><i style="width:${activePct}%"></i></div><span>今日活跃度 <b>${claimedN}/${activeN}</b></span></div>
    ${items}
    <div class="all-reward"><div><strong>全勤契约</strong><div class="small muted">全部任务领取后可得 ${rewardText(G.DAILY_ALL_REWARD)}</div></div><button class="btn primary compact" data-action="claimAll" ${!allReady||state.daily.allClaimed?'disabled':''}>${state.daily.allClaimed?'已领取':'领取'}</button></div></div>`}
function weeklyPanel(){G.ensureWeekly(state);const items=G.WEEKLY_TASKS.map(w=>{const p=state.weekly.progress[w.id]||0,done=p>=w.goal,claimed=!!state.weekly.claimed[w.id],route=taskRoute(w.id);return `<div class="task weekly-task"><div class="task-main"><strong>${w.name}</strong><span>${w.desc}</span><div class="task-progress"><i style="width:${Math.min(100,p/w.goal*100)}%"></i></div><small>${p}/${w.goal} · ${rewardText(w.reward)}</small></div>${claimed?'<button class="btn ghost compact" disabled>已领取</button>':done?`<button class="btn primary compact" data-action="claimWeekly" data-id="${w.id}">领取</button>`:`<button class="btn secondary compact" data-action="taskGo" data-id="${w.id}" data-target="${route.target}" data-focus="${route.focus||''}">${route.label}</button>`}</div>`}).join('');const allReady=G.WEEKLY_TASKS.every(w=>state.weekly.claimed[w.id]);return `<div class="panel m213-weekly-panel"><div class="section-title"><h3>本周星途</h3><span class="small muted">周起始 ${state.weekly.week}</span></div>${items}<div class="all-reward"><div><strong>周度全勤</strong><div class="small muted">${rewardText(G.WEEKLY_ALL_REWARD)}</div></div><button class="btn primary compact" data-action="claimWeeklyAll" ${!allReady||state.weekly.allClaimed?'disabled':''}>${state.weekly.allClaimed?'已领取':'领取'}</button></div></div>`}
function loginRewardPanel(){const info=G.loginRewardInfo(state);const next=info.nextIndex;return `<div class="panel v11-login-panel"><div class="section-title"><div><div class="kicker">SEVEN-DAY CONTRACT · CYCLE ${info.cycle}</div><h3>七曜登录契约</h3></div><span class="small muted">累计 ${info.totalClaims} 日</span></div><div class="v11-login-track">${G.LOGIN_REWARDS.map((r,i)=>{const claimed=!!info.claimed[i],current=!info.claimedToday&&i===next;return `<div class="v11-login-day ${claimed?'claimed':''} ${current?'current':''}"><b>DAY ${r.day}</b><span>${r.name}</span><small>${rewardText(r.reward)}</small><i>${claimed?'✓':current?'✦':'◇'}</i></div>`}).join('')}</div><div class="all-reward"><div><strong>${info.claimedToday?'今日星契已完成':`下一份：${G.LOGIN_REWARDS[next]?.name||G.LOGIN_REWARDS[0].name}`}</strong><div class="small muted">连续签到不要求每天不断档；完成第7日后，下个游戏日进入新一轮。</div></div><button class="btn primary" data-action="loginReward" ${info.claimedToday?'disabled':''}>${info.claimedToday?'今日已领取':'领取登录奖励'}</button></div></div>`}
function accountPanel(){const configured=CLOUD.configured(),meta=CLOUD.meta?.()||{},identityLabel=cloudMode?(meta.identityKind==='wechat'?'微信身份':'CloudBase 身份'):'本地游客';return `<div class="panel"><div class="section-title"><h3>玩家账号</h3><span class="badge">${identityLabel}</span></div><div class="account-row"><div><div class="small muted">云存档</div><strong>${cloudMode?'已连接，可跨设备绑定':remoteOffline()?'暂不可用，进度已存在本机':'当前仅保存在本浏览器'}</strong></div><button class="btn secondary" data-action="cloud">${cloudMode?'刷新云存档':`${cloudActionLabel()}云端`}</button></div>${configured?cloudMode?`<div class="link-box"><div class="small muted">设备 A：生成迁移码</div><button class="btn ghost" data-action="linkCreate">生成6位迁移码</button>${currentLink?`<div class="link-code">${currentLink.code}</div><div class="btnrow"><button class="btn ghost compact" data-action="linkCopy">复制迁移码</button></div><div class="small muted">10分钟内在另一台设备输入</div>`:''}<div class="divider"></div><div class="small muted">设备 B：绑定到已有账号</div><div class="code-row"><input id="linkCodeInput" inputmode="numeric" pattern="[0-9]*" maxlength="6" value="${linkCodeDraft}" placeholder="输入迁移码"/><button class="btn primary" data-action="linkRedeem">绑定</button></div></div>`:'<div class="small muted" style="margin-top:8px">连接云端后可生成跨设备迁移码。</div>':'<div class="small muted" style="margin-top:8px">当前 CloudBase 尚未配置；本地玩法完整可用。</div>'}</div>`}
function factionPanel(){const active=G.activeFactionBonuses(state);return `<div class="panel resonance"><div class="section-title"><h3>阵营共鸣</h3><span class="small muted">按上阵角色实时生效</span></div>${active.length?active.map(x=>`<div class="resonance-row"><span class="faction-dot ${x.faction}"></span><strong>${x.faction} ×${x.count}</strong><span>${x.two}${x.three?` · ${x.three}`:''}</span></div>`).join(''):'<div class="empty slim">同阵营上阵 2 人即可激活第一层共鸣。</div>'}</div>`}
function eventBanner(){const hero=G.byId(G.LIMITED_POOL.featured),pity=state.limited?.pity||0;return `<section class="event-banner"><div class="event-art">${portrait(hero,'event')}</div><div class="event-copy"><div class="kicker">LIMITED CONTRACT · 月影流光</div><h3>${hero.name} 概率提升</h3><p>SSR 3% · 60抽保底 · 歪出后下次SSR必定为${hero.name}</p><div class="event-meta"><span>当前限定保底 ${pity}/60</span><span>${state.limited?.guaranteed?'下次SSR必定UP':'UP占SSR的50%'}</span></div><button class="btn primary compact" data-tab="gacha">前往契约</button></div></section>`}
function utilityBadgeCounts(){G.ensureDaily(state);G.ensureWeekly(state);const daily=G.DAILY_TASKS.filter(t=>(state.daily.progress[t.id]||0)>=t.goal&&!state.daily.claimed[t.id]).length,weekly=G.WEEKLY_TASKS.filter(t=>(state.weekly.progress[t.id]||0)>=t.goal&&!state.weekly.claimed[t.id]).length,ach=G.ACHIEVEMENTS.filter(a=>G.achievementProgress(state,a)>=a.goal&&!state.achievements?.claimed?.[a.id]).length,mail=G.unreadMailCount(state),login=G.loginRewardInfo(state).claimedToday?0:1;return{daily,weekly,ach,mail,login,total:daily+weekly+ach+mail+login}}
function eventStatus(){G.ensureEventShop(state);G.ensureNightEventShop(state);G.ensureEventBoss(state);const eclipseLeft=Math.max(0,G.EVENT_DAILY_ATTEMPTS-(state.event?.runs||0)),bossLeft=Math.max(0,G.EVENT_BOSS.dailyAttempts-(state.eventBoss?.runs||0)),nightLeft=Math.max(0,6-(state.nightEvent?.runs||0));return{eclipseLeft,bossLeft,nightLeft,moonSeal:state.event?.moonSeal||0,voyageBadge:state.nightEvent?.voyageBadge||0}}
function badgeText(n){n=Number(n)||0;return n>99?'99+':String(n)}
function topNoticeCount(){const n=utilityBadgeCounts(),ev=eventStatus();return n.total+(ev.eclipseLeft>0?1:0)+(ev.bossLeft>0?1:0)+(ev.nightLeft>0?1:0)}
function badgeSignal(key){if(key==='heroes')return (state.inventory.talentPoints||0)>0?`talent:${state.inventory.talentPoints}`:'';if(key==='gacha')return state.tickets>=10?`ten:${Math.floor(state.tickets/10)}`:'';if(key==='formation')return state.formation.length<5?`formation:${state.formation.length}`:'';if(key==='explore'){try{const x=G.sweepInfo?.(state);return state.stage>1&&x?.left?`sweep:${x.left}:${state.stage}`:''}catch{return''}}return''}
function markBadgeSeen(key){const sig=badgeSignal(key);ui.badgeSeen=ui.badgeSeen||{};if(sig)ui.badgeSeen[key]=sig;else delete ui.badgeSeen[key];saveUi()}
function navBadge(key){const sig=badgeSignal(key);if(!sig||ui.badgeSeen?.[key]===sig)return'';if(key==='heroes'||key==='formation')return'!';if(key==='gacha')return'10';if(key==='explore'){try{const x=G.sweepInfo?.(state);return String(Math.min(9,x?.left||0))}catch{return''}}return''}
function lobbyDock(){const n=utilityBadgeCounts(),ev=eventStatus(),eventLeft=ev.eclipseLeft+ev.bossLeft+ev.nightLeft;return `<section class="m208-lobby-dock"><button data-tab="hub" class="${n.total?'hot':''}"><b>✦</b><span>事务所</span><em>${n.total?`${n.total} 项待领`:'今日已清'}</em></button><button data-tab="event"><b>☾</b><span>限时活动</span><em>${eventLeft} 次可挑战</em></button><button data-action="cloud" class="${cloudMode?'online':''}" ${!CLOUD.configured()?'disabled':''}><b>☁</b><span>云存档</span><em>${cloudMode?'已连接 · 点击刷新':!CLOUD.configured()?'本地试玩 · 云存档未开放':remoteOffline()?'暂不可用 · 点击重试':'本地中 · 点击连接'}</em></button></section>`}
function journeyState(){
  const owned=Object.keys(state.heroes||{}),formationGoal=Math.max(1,Math.min(3,owned.length));
  const grew=Object.values(state.heroes||{}).some(p=>(Number(p.level)||1)>=2||(Number(p.star)||1)>=2||(Number(p.awakening)||0)>0);
  const claimed=(()=>{try{const login=G.loginRewardInfo(state);if((login.totalClaims||0)>0)return true}catch{};if(Object.values(state.daily?.claimed||{}).some(Boolean))return true;if(Object.values(state.weekly?.claimed||{}).some(Boolean))return true;if(Object.values(state.achievements?.claimed||{}).some(Boolean))return true;if((state.mails||[]).some(m=>m.claimed))return true;return false})();
  const milestones=[
    {id:'contract',label:'完成首契',target:'gacha',done:!!state.newbieGacha?.claimed,desc:`首次常驻十连必得 SSR · 当前契灵印 ${state.tickets}/10`},
    {id:'growth',label:'培养主力',target:'heroes',done:grew,desc:'任选一名主力升到 Lv.2，熟悉升级与战力变化'},
    {id:'formation',label:'编成星轨',target:'formation',done:state.formation.length>=formationGoal,desc:`将当前契灵编入阵容 · 初航目标 ${formationGoal} 人`},
    {id:'battle',label:'完成首战',target:'explore',done:state.stage>1||!!state.campaignCompleted,desc:'完成 Stage 1，确认阵容与战斗循环'},
    {id:'reward',label:'领取奖励',target:'hub',done:claimed,desc:'领取登录或任务奖励，完成首个资源回流'}
  ];
  const doneCount=milestones.filter(x=>x.done).length,next=milestones.find(x=>!x.done)||null;
  return{milestones,doneCount,next,complete:!next,formationGoal,ownedCount:owned.length}
}
function bestJourneyHeroId(){const rank={SSR:3,SR:2,R:1};return Object.keys(state.heroes||{}).sort((a,b)=>{const ha=G.byId(a),hb=G.byId(b),pa=state.heroes[a],pb=state.heroes[b];return (rank[hb?.rarity]||0)-(rank[ha?.rarity]||0)||(Number(pb?.level)||1)-(Number(pa?.level)||1)||(G.heroPower(hb,pb,state)||0)-(G.heroPower(ha,pa,state)||0)})[0]||state.formation[0]||'h004'}
function journeyGuide(){const j=journeyState();if(j.complete||state.stage>5)return'';const n=j.next,progress=j.doneCount/j.milestones.length*100;return `<section class="m212-journey"><div class="m212-journey-main"><span class="m212-route-icon">✦</span><div><div class="kicker">FIRST VOYAGE · ${j.doneCount}/${j.milestones.length}</div><strong>当前目标 · ${n.label}</strong><small>${n.desc}</small></div></div><div class="m212-route-progress"><i style="width:${progress}%"></i></div><div class="m212-route-steps">${j.milestones.map((x,i)=>`<span class="${x.done?'done':x.id===n.id?'current':''}"><b>${x.done?'✓':i+1}</b><em>${x.label}</em></span>`).join('')}</div><button class="btn primary compact" data-action="journeyGo" data-target="${n.target}">${n.target==='gacha'?'前往首契':n.target==='heroes'?'培养主力':n.target==='formation'?'配置阵容':n.target==='explore'?'开始首战':'领取奖励'}</button></section>`}
function journeyPageHint(page){const j=journeyState();if(j.complete||state.stage>5)return'';const n=j.next,same=n.target===page;return `<div class="m212-page-hint ${same?'current':''}"><span>✦</span><div><b>${same?'初航目标':'初航下一步'} · ${n.label}</b><small>${n.desc}</small></div>${same?'<em>完成后自动更新</em>':`<button class="btn secondary compact" data-action="journeyGo" data-target="${n.target}">前往</button>`}</div>`}
function recoveryAdvice(){const formation=state.formation||[];if(formation.length<Math.min(3,Object.keys(state.heroes||{}).length))return{target:'formation',label:'补全阵容',text:`当前仅 ${formation.length} 人上阵，先补足前后排再挑战。`};const low=formation.map(id=>({id,p:state.heroes[id]})).filter(x=>x.p&&(Number(x.p.level)||1)<50&&state.coin>=200*(Number(x.p.level)||1)).sort((a,b)=>(a.p.level||1)-(b.p.level||1))[0];if(low)return{target:'heroes',id:low.id,label:'提升主力',text:`${G.byId(low.id)?.name||'主力'}仍可直接升级，优先把基础战力抬高。`};for(const id of formation){const e=state.heroes[id]?.equipment||{},slot=['weapon','armor','charm'].find(slot=>!e[slot]&&G.EQUIPMENT.some(x=>x.slot===slot&&(state.inventory.equipment[x.id]||0)>0&&usedCount(x.id,id)<1));if(slot)return{target:'inventory',id,label:'补齐装备',text:`${G.byId(id)?.name||'上阵契灵'}的${slotName[slot]}槽有可用装备，先补齐整备。`}}const points=Number(state.inventory?.talentPoints)||0;if(points>0){for(const id of formation){const owned=G.heroTalents(state,id),node=G.talentTree(id).find(n=>!owned.includes(n.id)&&(!n.requires||owned.includes(n.requires))&&points>=n.cost);if(node)return{target:'heroes',id,label:'解锁天赋',text:`${G.byId(id)?.name||'主力'}可点亮「${node.name}」，消耗 ${node.cost} 星痕点。`}}}const resource=resourcePriority();if(resource)return{target:'explore',label:`补充${resource.name}`,text:resource.why};return{target:'formation',label:'调整站位',text:'当前没有可直接执行的养成项，尝试前后排、职业克制与阵营共鸣后重试。'}}
function compactReward(reward){if(reward?.heroId)return `${G.byId(reward.heroId)?.name||'契灵'}碎片 ${reward.fragments||0}`;return rewardText(reward)}

function taskRoute(id){
  if(['battle3','win2','battle12','win8'].includes(id))return{target:'explore',focus:'m213-attempt-strip',label:'前往战斗'};
  if(['gacha5','gacha20'].includes(id))return{target:'gacha',label:'前往契约'};
  if(id==='resource5')return{target:'explore',focus:'m213-resource-focus',label:'资源裂境'};
  if(id==='enhance3')return{target:'inventory',label:'强化装备'};
  if(id==='upgrade1'){const g=growthOpportunity();return g?{target:g.target,heroId:g.heroId,focus:g.focus,label:g.label}:{target:'heroes',heroId:bestJourneyHeroId(),label:'培养契灵'}};
  return{target:'home',label:'返回大厅'}
}
function bossRewardName(boss){if(!boss?.firstReward)return'章节奖励';if(boss.firstReward.equipment)return G.equipmentById(boss.firstReward.equipment)?.name||'稀有装备';if(boss.firstReward.relic)return G.relicById(boss.firstReward.relic)?.name||'稀有遗物';return'章节奖励'}
function nextBossMilestone(){const ch=currentChapter(),stage=ch.range[1],boss=G.bossByStage(stage),cleared=state.bossClears.includes(stage),distance=cleared?0:Math.max(0,stage-state.stage);return{chapter:ch,boss,stage,cleared,distance,reward:bossRewardName(boss)}}
function dailyAttemptState(){G.ensureResourceRuns(state);const sweep=G.sweepInfo(state),resourceLeft=G.RESOURCE_DUNGEONS.reduce((n,d)=>n+Math.max(0,d.attempts-(Number(state.resourceRuns.used[d.id])||0)),0),resourceLimit=G.RESOURCE_DUNGEONS.reduce((n,d)=>n+d.attempts,0),ev=eventStatus();return{sweep,resourceLeft,resourceLimit,eventLeft:ev.eclipseLeft+ev.bossLeft+ev.nightLeft,eclipseLeft:ev.eclipseLeft,bossLeft:ev.bossLeft,nightLeft:ev.nightLeft}}
function resourcePriority(){G.ensureResourceRuns(state);const power=G.formationPower(state),left=d=>Math.max(0,d.attempts-(Number(state.resourceRuns.used[d.id])||0)),available=G.RESOURCE_DUNGEONS.filter(d=>left(d)>0&&power>=d.power);if(!available.length)return null;const formation=(state.formation||[]).map(id=>state.heroes[id]).filter(Boolean),nextLevelCost=Math.min(...formation.filter(p=>(p.level||1)<50).map(p=>200*(p.level||1)).concat([Infinity]));if(state.coin<Math.min(8000,Number.isFinite(nextLevelCost)?nextLevelCost*3:8000)){const d=available.find(x=>x.id==='coin');if(d)return{...d,why:'当前烬币偏低，优先补角色升级资源'}}const equipped=[...new Set((state.formation||[]).flatMap(id=>Object.values(state.heroes[id]?.equipment||{})).filter(Boolean))],ironNeed=Math.min(...equipped.map(id=>{try{return G.enhanceCost(id,state).starIron}catch{return Infinity}}).concat([Infinity]));if(state.inventory.starIron<Math.min(120,Number.isFinite(ironNeed)?ironNeed*3:120)){const d=available.find(x=>x.id==='forge');if(d)return{...d,why:'星铁库存偏低，补充装备强化材料'}}if(state.tickets<10&&state.starCrystal<120){const d=available.find(x=>x.id==='crystal');if(d)return{...d,why:'契灵印不足，可先积累星髓用于补给兑换'}}const wp=state.weekly?.progress?.resource5||0;if(wp<5){const d=available[0];if(d)return{...d,why:`本周资源调度 ${wp}/5，顺手推进周任务`}}return{...available[0],why:'今日仍有资源裂境次数可用'} }
function growthOpportunity(){const formation=state.formation||[];for(const id of formation){const p=state.heroes[id],h=G.byId(id);if(!p||!h)continue;const cost=p.level<50?200*p.level:Infinity;if(state.coin>=cost&&p.level<50)return{target:'heroes',heroId:id,label:`提升 ${h.name}`,desc:`Lv.${p.level} 可直接升级，当前烬币足够。`};const starCost=p.star<5?G.STAR_COST[p.star]:Infinity;if((p.fragments||0)>=starCost)return{target:'heroes',heroId:id,label:`升星 ${h.name}`,desc:`碎片已满足 ${p.star}★ → ${p.star+1}★。`};const eq=p.equipment||{},missing=['weapon','armor','charm'].find(slot=>!eq[slot]&&G.EQUIPMENT.some(x=>x.slot===slot&&(state.inventory.equipment[x.id]||0)>0&&usedCount(x.id,id)<1));if(missing)return{target:'inventory',heroId:id,label:`补齐 ${h.name} ${slotName[missing]}`,desc:'背包中已有未占用装备，先把空槽位补齐。'}}const points=Number(state.inventory.talentPoints)||0;if(points>0){for(const id of formation){const owned=G.heroTalents(state,id),node=G.talentTree(id).find(n=>!owned.includes(n.id)&&(!n.requires||owned.includes(n.requires))&&points>=n.cost);if(node){const h=G.byId(id);return{target:'heroes',heroId:id,label:`点亮 ${h.name} · ${node.name}`,desc:`消耗 ${node.cost} 星痕点，当前持有 ${points}。`}}}}return null}
function eventOpportunity(){const ev=eventStatus(),power=G.formationPower(state);if(ev.eclipseLeft>0){const next=G.EVENT_STAGES.find(x=>!state.event?.firstClears?.includes(x.id)&&power>=x.power)||[...G.EVENT_STAGES].reverse().find(x=>power>=x.power);if(next)return{target:'event',view:'eclipse',label:`月蚀回廊 · ${next.name}`,desc:`剩余 ${ev.eclipseLeft} 次 · ${compactReward(next.reward)}${state.event?.firstClears?.includes(next.id)?'':' · 含首通奖励'}`}}if(ev.nightLeft>0){const next=G.NIGHT_EVENT_STAGES.find(x=>!state.nightEvent?.firstClears?.includes(x.id)&&power>=x.power)||[...G.NIGHT_EVENT_STAGES].reverse().find(x=>power>=x.power);if(next)return{target:'event',view:'night',label:`星港夜航 · ${next.name}`,desc:`剩余 ${ev.nightLeft} 次 · ${compactReward(next.reward)}`}}if(ev.bossLeft>0&&power>=G.EVENT_BOSS.recommendedPower*.45)return{target:'event',view:'boss',label:'挑战月蚀兽',desc:`今日剩余 ${ev.bossLeft} 次${power<G.EVENT_BOSS.recommendedPower?' · 当前低于推荐战力，但已达到挑战门槛':''}，伤害计入个人最佳与排行榜。`};return null}
function midgameState(){
  G.ensureDaily(state);G.ensureWeekly(state);const pending=utilityBadgeCounts(),boss=currentBoss(),milestone=nextBossMilestone(),attempt=dailyAttemptState(),resource=resourcePriority(),growth=growthOpportunity(),event=eventOpportunity(),sweep=attempt.sweep;
  const dailyDone=G.DAILY_TASKS.filter(t=>(state.daily.progress[t.id]||0)>=t.goal).length,weeklyDone=G.WEEKLY_TASKS.filter(t=>(state.weekly.progress[t.id]||0)>=t.goal).length;
  let goal;
  if(pending.total)goal={target:'hub',view:'daily',label:`领取 ${pending.total} 项奖励`,desc:'先把已完成内容兑换成养成资源，再继续推进。',icon:'✦'};
  else if(boss)goal={target:'explore',label:`击破 ${boss.name}`,desc:`章节 Boss 已抵达 · 首通 ${bossRewardName(boss)}`,icon:'♛'};
  else if((state.daily.progress.battle3||0)<3||(state.daily.progress.win2||0)<2){if(state.campaignCompleted&&sweep.left>0)goal={target:'explore',focus:'v18-sweep',label:'扫荡完成今日战斗目标',desc:`战斗 ${state.daily.progress.battle3||0}/3 · 胜利 ${state.daily.progress.win2||0}/2，主线已通关，扫荡可继续累计。`,icon:'↻'};else if(state.campaignCompleted&&resource)goal={target:'explore',focus:'m213-resource-focus',label:resource.name,desc:`主线已通关 · 通过资源裂境推进今日战斗目标。`,icon:resource.icon||'◆'};else if(state.campaignCompleted&&event)goal={...event,icon:'☾'};else goal={target:'explore',label:'推进今日战斗目标',desc:`战斗 ${state.daily.progress.battle3||0}/3 · 胜利 ${state.daily.progress.win2||0}/2，同时推进主线。`,icon:'▲'};}
  else if((state.weekly.progress.resource5||0)<5&&resource)goal={target:'explore',focus:'m213-resource-focus',label:resource.name,desc:resource.why,icon:resource.icon||'◆'};
  else if(growth)goal={...growth,icon:'✧'};
  else if(event)goal={...event,icon:'☾'};
  else if(sweep.left>0&&state.stage>1)goal={target:'explore',focus:'v18-sweep',label:`扫荡已通关裂境 ×${Math.min(5,sweep.left)}`,desc:`今日还可扫荡 ${sweep.left}/${sweep.limit} 次，快速补烬币、星铁与星痕点。`,icon:'↻'};
  else goal={target:'explore',label:state.campaignCompleted?'回顾裂境与活动':'继续主线探索',desc:state.campaignCompleted?'主线已完成，可转向活动、周任务和角色养成。':`Stage ${state.stage} · 距离 ${milestone.boss?.name||'章节 Boss'} ${milestone.distance} 关。`,icon:'▲'};
  return{goal,pending,milestone,attempt,dailyDone,weeklyDone,resource,growth,event}
}
function midgameGuide(){const j=journeyState();if(!j.complete&&state.stage<=5)return'';const m=midgameState(),g=m.goal,b=m.milestone,a=m.attempt;return `<section class="m213-compass"><div class="m213-compass-head"><div><div class="kicker">STAR ROUTE · MIDGAME</div><h3>今日星轨</h3></div><div class="m213-progress-pills"><span>日 ${m.dailyDone}/${G.DAILY_TASKS.length}</span><span>周 ${m.weeklyDone}/${G.WEEKLY_TASKS.length}</span></div></div><div class="m213-primary"><span class="m213-goal-icon">${g.icon||'✦'}</span><div><b>${g.label}</b><small>${g.desc}</small></div><button class="btn primary compact" data-action="midgameGo" data-target="${g.target}" data-view="${g.view||''}" data-focus="${g.focus||''}" data-id="${g.heroId||''}">前往</button></div><div class="m213-attempt-mini"><span><b>${a.sweep.left}</b><small>扫荡</small></span><span><b>${a.resourceLeft}</b><small>资源裂境</small></span><span><b>${a.eventLeft}</b><small>活动次数</small></span><span><b>${state.stage}/30</b><small>主线</small></span></div>${b.boss?`<div class="m213-boss-track"><span>${b.cleared?'✓':'♛'}</span><div><b>CH.${b.chapter.id} · ${b.boss.name}</b><small>${b.cleared?'章节 Boss 已击破':b.distance?`距离 ${b.distance} 关 · 首通 ${b.reward}`:`Boss 已抵达 · 首通 ${b.reward}`}</small></div></div>`:''}</section>`}
function midgameAttemptStrip(){const a=dailyAttemptState();return `<section class="m213-attempt-strip"><div><span>今日行动</span><b>次数独立刷新 · 无额外体力条</b></div><button data-action="midgameGo" data-target="explore" data-focus="v18-sweep"><strong>${a.sweep.left}/${a.sweep.limit}</strong><small>扫荡</small></button><button data-action="midgameGo" data-target="explore" data-focus="m213-resource-focus"><strong>${a.resourceLeft}/${a.resourceLimit}</strong><small>资源</small></button><button data-action="midgameGo" data-target="event" data-view="eclipse"><strong>${a.eclipseLeft}</strong><small>月蚀</small></button><button data-action="midgameGo" data-target="event" data-view="night"><strong>${a.nightLeft}</strong><small>夜航</small></button></section>`}
function routeToSystem(target='home',view='',focus='',heroId=''){if(heroId&&state.heroes[heroId])selectedHeroId=heroId;if(target==='event'&&view)eventViewMode=view;if(target==='hub'&&view)utilityViewMode=view;if(target==='explore'){if(focus==='m213-resource-focus')exploreViewMode='resource';else if(focus==='v18-sweep'||focus==='m205-replay-stage')exploreViewMode='archive';else if(view&&['campaign','resource','archive'].includes(view))exploreViewMode=view}if(target==='heroes'&&heroId)heroViewMode='growth';moreOpen=false;resultOpen=false;tab=target||'home';markBadgeSeen(tab);window.scrollTo?.(0,0);render();if(focus)setTimeout(()=>document.querySelector('.'+focus)?.scrollIntoView?.({behavior:'smooth',block:'start'}),80)}
function dropUsageHint(drop){if(!drop?.item)return'';if(drop.converted?.forgeDust)return`重复遗物已自动折算 · 锻造尘 +${drop.converted.forgeDust}`;if(drop.kind==='relic')return state.activeRelic?'可在整备中与当前队伍遗物比较':'当前未启用队伍遗物，可直接前往整备启用';const item=drop.item,slot=item.slot;for(const id of state.formation||[]){const p=state.heroes[id],h=G.byId(id);if(!p||!h)continue;const current=G.equipmentById(p.equipment?.[slot]);if(!current)return`可优先给 ${h.name} 补齐${slotName[slot]}`;if(rarityRank(item.rarity)>rarityRank(current.rarity))return`稀有度高于 ${h.name} 当前${slotName[slot]} · ${current.name}`;}return'可用于后续强化、套装搭配或分解为锻造尘'}

function shopProgress(){G.ensureShop(state);const limit=G.SHOP_ITEMS.reduce((n,x)=>n+x.dailyLimit,0),bought=G.SHOP_ITEMS.reduce((n,x)=>n+(Number(state.shop.purchases[x.id])||0),0);return{limit,bought,left:Math.max(0,limit-bought)}}
function shopView(){
  G.ensureShop(state);
  const prog=shopProgress();
  const recommend=state.tickets<10?'ticket':state.coin<6000?'coin':'iron';
  const cards=G.SHOP_ITEMS.map(i=>{const bought=Number(state.shop.purchases[i.id])||0,left=Math.max(0,i.dailyLimit-bought),can=left>0&&state.starCrystal>=i.cost.starCrystal,pct=Math.min(100,bought/i.dailyLimit*100),icon=i.id==='ticket'?'◎':i.id==='coin'?'◈':'◆';return `<article class="m207-shop-item ${i.id===recommend?'recommended':''}"><div class="m207-shop-icon">${icon}</div><div class="m207-shop-copy"><div><span>${i.id===recommend?'推荐补给':'DAILY SUPPLY'}</span><strong>${i.name}</strong></div><p>${i.desc}</p><div class="loot-chip">${rewardText(i.reward)}</div><div class="m207-shop-limit"><i style="width:${pct}%"></i></div><small>今日 ${bought}/${i.dailyLimit} · 剩余 ${left}</small></div><button class="m207-price ${can?'can':''}" data-action="shopBuy" data-id="${i.id}" ${!can?'disabled':''}><span>星髓</span><b>${i.cost.starCrystal}</b><em>${left?state.starCrystal<i.cost.starCrystal?'不足':'兑换':'售罄'}</em></button></article>`}).join('');
  return `${subpageHeader('¤','星髓补给站','每日资源兑换与当前库存')}<section class="m207-shop-wallet"><div><div class="kicker">SUPPLY WALLET</div><h2>今日补给</h2><p>按当前养成状态推荐资源；兑换次数在每日刷新时恢复。</p></div><div class="m207-wallet-balance"><small>当前星髓</small><strong>${state.starCrystal}</strong><span>今日可兑 ${prog.left}/${prog.limit}</span></div></section><section class="panel m207-shop-list"><div class="section-title"><div><h3>补给列表</h3><span class="small muted">推荐项仅根据当前资源缺口提示</span></div><button class="btn ghost compact" data-tab="gacha">前往契约</button></div>${cards}</section><details class="panel m207-rule-drawer"><summary><span><b>补给规则</b><small>每日限购 · 星髓直接扣除</small></span><em>查看</em></summary><p>补给站不会消耗烬币或契灵印。按钮置灰时表示星髓不足或该商品今日已售罄。每日刷新后限购次数恢复。</p></details>`
}
/* 提示词07：邮件页 —— 引擎无分类字段，故不做分类 Tab；改为时间 + 真实附件 + 批量领取 */
function mailPanel(){
  const all=state.mails||[],unread=G.unreadMailCount(state),unreadItems=all.filter(m=>!m.claimed);
  const list=all.length?all.map(m=>`<div class="mail-card ${m.claimed?'claimed':''}"><div class="mail-icon">${m.claimed?'✓':'✉'}</div><div class="mail-body"><div class="mail-top"><strong>${m.title}</strong><time>${mailTimeLabel(m)}</time></div><span>${m.body}</span><small class="mail-attach">附件 · ${rewardText(m.reward)}</small></div><button class="btn ${m.claimed?'ghost':'secondary'} compact" data-action="claimMail" data-id="${m.id}" ${m.claimed?'disabled':''}>${m.claimed?'已领取':'领取'}</button></div>`).join('')
    :`<div class="mail-empty"><div class="mail-empty-icon">✉</div><b>暂无邮件</b><span>系统补偿、活动奖励与维护公告会送到这里。</span><small>当前没有需要处理的邮件</small></div>`;
  return `<div class="panel mail-panel">
    <div class="section-title"><div><div class="kicker">STAR MAIL</div><h3>星轨邮件</h3></div><span class="loot-chip">未领取 ${unread} / 共 ${all.length}</span></div>
    <div class="mail-list">${list}</div>
    ${unread?`<div class="m222-mail-actions"><span>已选 ${unread} 封可领取</span><button class="btn primary compact" data-action="claimAllMail">一键领取全部</button></div>`:''}
  </div>`;
}
function home(){
  const ch=currentChapter(),boss=currentBoss(),lead=G.byId(state.formation[0]||'h001'),leadP=state.heroes[lead.id]||state.heroes[Object.keys(state.heroes)[0]],m=midgameState(),n=utilityBadgeCounts(),a=dailyAttemptState();
  G.ensureDaily(state);G.ensureWeekly(state);
  const dailyDone=G.DAILY_TASKS.filter(t=>(state.daily.progress[t.id]||0)>=t.goal).length,weeklyDone=G.WEEKLY_TASKS.filter(t=>(state.weekly.progress[t.id]||0)>=t.goal).length;
  const mainLabel=state.campaignCompleted?'前往终章扫荡':boss?'挑战章节 Boss':'继续主线';
  const mainAction=state.campaignCompleted?'data-action="midgameGo" data-target="explore" data-focus="v18-sweep"':'data-action="battle"';
  const chapterSpan=Math.max(1,ch.range[1]-ch.range[0]+1),chapterStep=Math.max(0,Math.min(chapterSpan,state.stage-ch.range[0]+1)),chapterPct=Math.round(chapterStep/chapterSpan*100);
  return `<section class="v216-lobby" style="--v216-bg:url('${window.StarEmberAssets?.bg('home-main')||'assets/release/home-main-v20.jpg'}')">
    <div class="v216-lobby-bg"></div><div class="v216-lobby-glow"></div>
    <div class="v216-hero-art"><img src="${window.StarEmberAssets?.heroPortrait(lead.id,true)||('assets/characters/'+(lead.id==='h001'?'h001_full.jpg':lead.id+'.jpg'))}" alt="${lead.name}" fetchpriority="high" decoding="async" onerror="this.style.display='none'"/></div>
    <div class="v216-lobby-copy"><span>STAR EMBER COVENANT</span><h1>星烬契约</h1><p>“即使是微弱的星火，也能照亮前行的路。”</p><small>${lead.name} · ${lead.faction} · ${lead.role} · Lv.${leadP?.level||1}</small></div>
    <aside class="v216-quick-rail" aria-label="快捷入口">
      <button data-tab="gacha"><b>◎</b><span>契约</span>${navBadge('gacha')?`<i>${navBadge('gacha')}</i>`:''}</button>
      <button data-action="midgameGo" data-target="hub" data-view="mail"><b>✉</b><span>邮件</span>${n.mail?`<i>${badgeText(n.mail)}</i>`:''}</button>
      <button data-action="midgameGo" data-target="hub" data-view="daily"><b>▣</b><span>福利</span>${n.daily+n.login?`<i>${badgeText(n.daily+n.login)}</i>`:''}</button>
      <button data-tab="shop"><b>¤</b><span>商店</span></button>
    </aside>
    <section class="v216-star-route">
      <div class="v216-route-head"><div><div class="kicker">TODAY'S STAR ROUTE</div><h2>今日星轨</h2></div><span>CH.${ch.id} · ${ch.name}</span></div>
      <div class="v216-route-title"><b>${state.campaignCompleted?'主线终章已经稳定':boss?boss.name:`第 ${state.stage} 裂境`}</b><small>${state.campaignCompleted?'继续通过扫荡、活动和养成获取资源。':boss?'章节 Boss 已苏醒，首通可获得稀有奖励。':m.goal?.desc||ch.theme}</small></div>
      <div class="v216-chapter-line"><span>章节进度 ${chapterStep}/${chapterSpan}</span><div><i style="width:${chapterPct}%"></i></div><em>战力 ${G.formationPower(state).toLocaleString()}</em></div>
      <button class="btn primary v216-main-cta" ${mainAction}>${mainLabel} <span>→</span></button>
      <div class="v216-secondary-actions"><button data-action="midgameGo" data-target="explore" data-focus="v18-sweep"><b>⚔</b><span>扫荡</span><small>${a.sweep.left}/${a.sweep.limit}</small></button><button data-tab="heroes"><b>✦</b><span>培养</span><small>${Object.keys(state.heroes).length}/15</small></button></div>
      <section class="v216-progress-cards"><button data-action="midgameGo" data-target="hub" data-view="daily"><span>✓</span><div><small>每日任务</small><b>${dailyDone}/${G.DAILY_TASKS.length}</b><i style="--p:${Math.round(dailyDone/Math.max(1,G.DAILY_TASKS.length)*100)}%"></i></div>${n.daily+n.login?'<em>可领取</em>':''}</button><button data-action="midgameGo" data-target="hub" data-view="goals"><span>✦</span><div><small>本周进度</small><b>${weeklyDone}/${G.WEEKLY_TASKS.length}</b><i style="--p:${Math.round(weeklyDone/Math.max(1,G.WEEKLY_TASKS.length)*100)}%"></i></div>${n.weekly+n.ach?'<em>有奖励</em>':''}</button></section>
    </section>
    ${lobbyDock()}
  </section>`
}
function subpageHeader(icon,title,subtitle=''){
  /* 提示词00 第7条：主要可点元素 ≥44×44。项目里 min-height 规则互相覆盖且多条带 !important，
     级联结果不可靠，这里直接以内联尺寸保证返回键与快捷键的命中区。 */
  const tapStyle='style="min-width:44px!important;min-height:44px!important;width:44px;height:44px"';
  return `<section class="m204-subpage-head v216-subpage-head v218-subpage-head"><button class="m204-back-home" data-tab="home" aria-label="返回首页" ${tapStyle}>‹</button><div class="m204-subpage-icon">${icon}</div><div><div class="kicker">STAR EMBER COVENANT</div><h2>${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div><button class="m204-subpage-more" data-action="moreOpen" ${tapStyle}>快捷</button></section>`
}
function heroSwitchRail(){return `<div class="m206-hero-switch" aria-label="切换契灵">${ownedList().map(x=>{const p=state.heroes[x.id];return `<button class="m206-hero-switch-item rarity-border-${x.rarity} ${x.id===selectedHeroId?'active':''}" data-action="selectHero" data-id="${x.id}">${portrait(x,'selected')}<span><b>${x.name}</b><small>Lv.${p.level} · ${x.rarity}</small></span></button>`}).join('')}</div>`}
/* 设计图(4)-05：一键穿戴（按稀有度+强化为每个空槽自动选最优，无空闲则跳过） */
async function autoEquipBest(){
  const h=G.byId(selectedHeroId),p=state.heroes[selectedHeroId];
  if(!h||!p){toast('请先选择契灵','error');return}
  const used={};
  for(const [hid,hp] of Object.entries(state.heroes)){
    for(const slot of ['weapon','armor','charm']){const iid=hp.equipment?.[slot];if(!iid)continue;if(hid===selectedHeroId)continue;used[iid]=(used[iid]||0)+1;}
  }
  const plan=[];
  for(const slot of ['weapon','armor','charm']){
    if(p.equipment?.[slot])continue;
    const cand=G.EQUIPMENT.filter(x=>x.slot===slot&&(state.inventory.equipment[x.id]||0)>(used[x.id]||0))
      .sort((a,b)=>rarityRank(b.rarity)-rarityRank(a.rarity)||(state.inventory.enhance?.[b.id]||0)-(state.inventory.enhance?.[a.id]||0));
    if(cand.length){plan.push({slot,itemId:cand[0].id});used[cand[0].id]=(used[cand[0].id]||0)+1;}
  }
  if(!plan.length){toast('没有可穿戴的空闲装备','error');return}
  await action(async()=>{
    for(const {slot,itemId} of plan){
      if(cloudMode){const d=await CLOUD.loadout({type:'gear',heroId:selectedHeroId,itemId});state=G.migrate(d.state)}
      else{G.equipGear(state,selectedHeroId,itemId);persist()}
    }
    toast(`一键穿戴完成 · ${plan.length} 件`,'success');
  },'正在自动穿戴装备');
}
/* 设计图(4)-05：一键卸下全部装备 */
async function unequipAll(){
  const p=state.heroes[selectedHeroId];
  if(!p){return}
  const slots=['weapon','armor','charm'].filter(s=>p.equipment?.[s]);
  if(!slots.length){toast('当前没有已穿戴的装备','error');return}
  await action(async()=>{
    for(const slot of slots){
      if(cloudMode){const d=await CLOUD.loadout({type:'unequip',heroId:selectedHeroId,slot});state=G.migrate(d.state)}
      else{G.unequipGear(state,selectedHeroId,slot);persist()}
    }
    toast(`已卸下 ${slots.length} 件装备`,'success');
  },'正在卸下装备');
}
/* 设计图(5)-05：重复获得独立页 —— 转化碎片与获得物品汇总 */
function duplicateRevealOverlay(){
  if(!duplicateReveal)return'';
  const d=duplicateReveal;
  return `<div class="v10-modal-layer m222-dup-layer"><section class="m222-dup-card">
    <div class="kicker">DUPLICATE CONVERTED</div><h2>重复获得</h2>
    <p class="m222-dup-note">已自动转化为碎片 · 星尘不浪费</p>
    <div class="m222-dup-grid">${d.dups.map(x=>`<article class="m222-dup-cell rarity-border-${x.hero.rarity}">${portrait(x.hero,'result')}<span class="rarity-${x.hero.rarity}">${x.hero.rarity}</span><strong>${x.hero.name}</strong><small>已转化为碎片 <b>+${x.fragmentsGained||0}</b></small></article>`).join('')}</div>
    <div class="m222-dup-sum"><div class="m222-reward-head"><b>获得物品汇总</b><span>本次契约共 ${d.total} 次重复</span></div>
      <div class="m222-reward-cells"><div class="m222-reward-cell"><i>✣</i><b>+${d.fragTotal}</b><small>角色碎片</small></div>${d.tickets?`<div class="m222-reward-cell"><i>◎</i><b>+${d.tickets}</b><small>契灵印</small></div>`:''}</div></div>
    <div class="btnrow"><button class="btn secondary" data-action="dupClose">完成</button><button class="btn primary" data-action="dupShop">前往商店</button></div>
  </section></div>`;
}
/* v2.2.4 QC-5（真机实测 P2-5）：一键最大升级会一次性把烬币花光，且没有任何确认。
   真机复现：烬币 5390 → 点「一键最大」→ 无确认直接连升到烬币耗尽（Lv.1→Lv.7）。
   做法（需求给出的方案二选一，这里取"确认框"方案，改动最小、玩家看得懂）：
     1) 按钮改名「直接升满」，含义不再含糊；
     2) 点击只打开确认框，列出"将升至 Lv.X · 消耗 N 烬币 · 剩余 M"，
        不确认就绝不执行 —— 单次点击不会再消耗任何费用；
     3) 费用计算与引擎共用同一函数，界面上写的就是实际会扣的。 */
function levelUpCostAt(level){return 200*level}
function levelMaxPlan(heroId){
  const p=state.heroes?.[heroId];if(!p)return null;
  let level=p.level,coin=Number(state.coin)||0,cost=0,gained=0;
  while(level<50){const c=levelUpCostAt(level);if(coin<c)break;coin-=c;cost+=c;level++;gained++;
    if(gained>=60)break}
  return {from:p.level,to:level,gained,cost,left:coin,nextCost:level<50?levelUpCostAt(level):null,cap:level>=50};
}
function levelMaxConfirmOverlay(){
  if(!levelMaxConfirm)return'';
  const h=G.byId(levelMaxConfirm),p=state.heroes[levelMaxConfirm],plan=levelMaxPlan(levelMaxConfirm);
  if(!h||!p||!plan){return''}
  return `<div class="v10-modal-layer m222-confirm-layer"><section class="m222-confirm-card">
    <div class="kicker">LEVEL UP CONFIRM</div><h2>直接升满</h2>
    <p>将把 <b>${h.name}</b> 从 <b>Lv.${plan.from}</b> 连续升到 <b>Lv.${plan.to}</b>，共 <b>${plan.gained}</b> 级。</p>
    <div class="m222-confirm-rows">
      <div><span>消耗烬币</span><b>${plan.cost.toLocaleString()}</b></div>
      <div><span>升级后剩余</span><b>${plan.left.toLocaleString()}</b></div>
      <div><span>升级后战力</span><b>Lv.${plan.to}</b></div>
    </div>
    <small class="m222-confirm-note">确认后立即连续升级，过程中不再逐级询问。${plan.cap?'（已达 Lv.50 上限）':''}</small>
    <div class="btnrow"><button class="btn ghost" data-action="levelMaxCancel">取消</button><button class="btn primary" data-action="levelMaxConfirm" ${plan.gained<1?'disabled':''}>确认升级</button></div>
  </section></div>`;
}
/* 设计图(4)-03：一键最大升级（按烬币上限连升） */
async function upgradeMax(heroId){
  const h=G.byId(heroId),p=state.heroes[heroId];
  if(!h||!p){toast('请先选择契灵','error');return}
  let count=0;
  await action(async()=>{
    while(p.level<50){
      const cost=levelUpCostAt(p.level);
      if(state.coin<cost)break;
      try{ if(cloudMode){const d=await CLOUD.upgrade(heroId,'level');state=G.migrate(d.state)}else{G.levelUp(state,heroId)} }
      catch(e){break}
      count++;
      if(count>=60)break;
    }
    if(!cloudMode)persist();
    toast(count?`已连续升级 ${count} 级`:'烬币不足，无法继续升级',count?'success':'error');
  },'正在连续升级');
}
/* 提示词04 属性页：可折叠的详细属性区 —— 全部字段取自引擎真实数据，不伪造 */
function statDetailFold(h,p){
  const stats=G.computedStats(h,p,state),bond=G.bondInfo(state,h.id),sig=G.signatureForHero(h.id);
  const aw=Math.max(0,Math.min(3,Number(p.awakening)||0));
  const rows=[
    ['职业定位',`${h.role} · ${G.combatClassInfo(G.combatClassForHero(h)).name}`, '引擎 COMBAT_CLASSES'],
    ['阵营', h.faction, '阵营共鸣按同阵营 2/3 人激活'],
    ['稀有度 / 星级', `${h.rarity} · ${p.star}★`, `碎片 ${p.fragments||0}`],
    ['觉醒阶数', `${aw}/3`, aw>0?`已获得 ${(aw*6)}% 全属性加成`:'未觉醒'],
    ['天赋点亮', `${G.heroTalents(state,h.id).length}/${G.talentTree(h.id).length}`, `星痕点 ${state.inventory.talentPoints||0}`],
    ['装备', ['weapon','armor','charm'].map(s=>{const it=G.equipmentById(p.equipment?.[s]);return it?`${slotName[s]} ${it.name}+${state.inventory.enhance?.[it.id]||0}`:`${slotName[s]} 空`}).join(' · '), '整备页可更换'],
    ['专属武装', sig?(p.signature===sig.id?`${sig.name}（已装备）`:(state.inventory.signatureWeapons?.[sig.id]||0)>0?`${sig.name}（可装备）`:`${sig.name}（未获得）`):'该角色无专属武装', '契印武装系统'],
    ['队伍遗物', G.relicById(state.activeRelic)?.name||'未装备', '全队唯一生效'],
    ['好感等级', `Lv.${bond.level}`, bond.next?`${bond.points}/${bond.next}`:'已满'],
  ];
  return `<details class="m222-stat-extra"><summary>详细属性与养成来源（${rows.length} 项）</summary><div class="m222-stat-extra-rows">
    ${rows.map(([k,v,note])=>`<div><span>${k}</span><b>${v}</b><i>${note}</i></div>`).join('')}
  </div></details>`;
}
function heroGrowthPanel(h,p){
  const levelCost=p.level<50?200*p.level:null,starCost=p.star<5?G.STAR_COST[p.star]:null,aw=G.awakenInfo(state,h.id),sig=G.signatureForHero(h.id),sigOwned=sig?(Number(state.inventory.signatureWeapons?.[sig.id])||0)>0:false,sigEquipped=!!sig&&p.signature===sig.id;
  const cur=G.computedStats(h,p,state),next=p.level<50?G.computedStats(h,{...p,level:p.level+1},state):null;
  const statRows=[['生命','hp'],['攻击','atk'],['防御','def'],['速度','spd']];
  /* 设计图(4)-03：升级材料格（图标 + 持有/需求）+ 一键添加/最大 + 多级升级 */
  const affordable=levelCost?Math.floor(state.coin/levelCost):0;
  const lastSeen=state.campaignCompleted?30:Math.max(1,(Number(state.stage)||1)-1);
  const levelBody=levelCost==null?`<div class="m221-level-cap">Lv.${p.level}<small>已达到当前等级上限</small></div>`
    :`<div class="m221-level-shift"><b>Lv.${p.level}</b><i>→</i><strong>Lv.${p.level+1}</strong></div>
      <div class="m221-level-stats">${statRows.map(([name,key])=>`<span><small>${name}</small><b>${cur[key]}</b><i>→</i><strong>${next[key]}</strong><em>+${Math.max(0,next[key]-cur[key])}</em></span>`).join('')}</div>
      <div class="m222-mat-grid">
        <div class="m222-mat-cell ${state.coin>=levelCost?'ok':'lack'}"><i>◈</i><b>${levelCost.toLocaleString()}</b><small>烬币 · 持有 ${state.coin.toLocaleString()}</small></div>
        <div class="m222-mat-cell ok"><i>✦</i><b>Lv.${p.level+1}</b><small>目标等级</small></div>
      </div>
      <div class="m222-mat-actions"><span>可升级 <b>${Math.max(0,Math.min(50-p.level,affordable))}</b> 级</span>
        <button class="btn ghost compact" data-action="levelMax" data-id="${h.id}" ${affordable<1?'disabled':''}>直接升满</button></div>
      <div class="m221-level-cost"><span>所需烬币</span><b>${state.coin.toLocaleString()} / ${levelCost.toLocaleString()}</b></div>
      ${state.coin<levelCost?`<div class="m222-lack-note"><span>还缺 <b>${(levelCost-state.coin).toLocaleString()}</b> 烬币${lastSeen?`，或先扫荡 Stage ${lastSeen}`:''}</span><button class="btn secondary compact" data-action="coinRoute">前往资源裂境</button></div>`:''}`;
  return `<div class="m204-growth"><div class="m204-growth-head"><div><div class="kicker">RESONANCE GROWTH</div><h3>契灵培养</h3></div><span class="small muted">碎片 ${p.fragments||0} · 觉醒核 ${state.inventory.awakeningCore||0}</span></div><div class="m221-level-panel">${levelBody}<button class="btn primary wide" data-action="level" data-id="${h.id}" ${levelCost==null||state.coin<levelCost?'disabled':''}>${levelCost==null?'已满级':`升级 · ${levelCost.toLocaleString()} 烬币`}</button></div><div class="m204-growth-grid"><div class="m204-growth-card"><span>星级</span><strong>${stars(p.star)}</strong><small>${starCost==null?'已满星':`碎片 ${p.fragments||0}/${starCost}`}</small><button class="btn secondary compact" data-action="star" data-id="${h.id}" ${starCost==null||(p.fragments||0)<starCost?'disabled':''}>${starCost==null?'已满星':'升星'}</button></div><div class="m204-growth-card"><span>觉醒</span><strong>${aw.next?aw.next.label:'三阶 · 星冠'}</strong><small>${aw.next?`Lv.${aw.next.level} · 5星 · 核心 ${aw.next.cores} · 烬币 ${aw.next.coin}`:'已完成全部觉醒'}</small><button class="btn ${aw.can?'primary':'ghost'} compact" data-action="awaken" data-id="${h.id}" ${!aw.next||!aw.can?'disabled':''}>${!aw.next?'已觉醒':`觉醒 ${aw.stage+1}/3`}</button></div><div class="m204-growth-card signature ${sig?'':'empty'}"><span>契印武装</span><strong>${sig?.name||'暂无专属武装'}</strong><small>${sig?`${sig.rarity} · ${sig.desc}`:'该角色当前没有专属武器配置'}</small>${sig?`<button class="btn ${sigOwned&&!sigEquipped?'primary':'ghost'} compact" data-action="equipSig" data-id="${h.id}" data-sig="${sig.id}" ${!sigOwned||sigEquipped?'disabled':''}>${sigEquipped?'已装备':sigOwned?'装备专武':'尚未获得'}</button>`:''}</div></div></div>`
}
function heroDetailPanel(){if(!state.heroes[selectedHeroId])selectedHeroId=state.formation[0]||Object.keys(state.heroes)[0];const h=G.byId(selectedHeroId),p=state.heroes[selectedHeroId],stats=G.computedStats(h,p,state),bond=G.bondInfo(state,h.id),sig=G.signatureForHero(h.id);
  /* 设计图(4)-02：属性区补齐暴击率/暴击伤害（取自战斗引擎的实际常量，不是编造值） */
  const CRIT={basic:G.CRIT_BASIC||0.12,skill:G.CRIT_SKILL||0.16,basicMult:G.CRIT_BASIC_MULT||1.65,skillMult:G.CRIT_SKILL_MULT||1.5};
  const critRate=Math.round(CRIT.skill*100),critDmg=Math.round(CRIT.skillMult*100);
  return `<section class="v09-hero-detail rarity-border-${h.rarity}"><div class="v09-detail-art">${portrait(h,'profile')}</div><div class="v09-detail-copy"><div class="kicker">${h.faction} · ${h.role} · ${classBadge(h)}</div><h2>${h.name} <span class="rarity-${h.rarity}">${h.rarity}</span></h2><div class="stars">${stars(p.star)}</div><p>${G.HERO_VISUALS[h.id]?.title||''}</p><div class="v09-stat-grid"><span><small>生命</small><b>${stats.hp}</b></span><span><small>攻击</small><b>${stats.atk}</b></span><span><small>防御</small><b>${stats.def}</b></span><span><small>速度</small><b>${stats.spd}</b></span><span><small>暴击率</small><b>${critRate}%</b></span><span><small>暴击伤害</small><b>${critDmg}%</b></span></div><div class="v09-skill v19-skill-detail">${skillIcon(h.id)}<div><b>${h.skill}</b><span>${skillText[h.skillType]||''}</span></div></div>${statDetailFold(h,p)}<div class="small muted">Lv.${p.level} · 战力 ${G.heroPower(h,p,state)} · 好感 Lv.${bond.level} · 觉醒 ${p.awakening||0}/3${sig?` · 专武 ${p.signature===sig.id?'已装备':(state.inventory.signatureWeapons?.[sig.id]||0)>0?'可装备':'未获得'}`:''}</div><div class="btnrow m204-hero-utility"><button class="btn ghost compact" data-action="openGear" data-id="${h.id}">整备</button><button class="btn ghost compact" data-action="giftBond" data-id="${h.id}" ${(state.inventory.bondGift||0)<1?'disabled':''}>赠礼</button><button class="btn ghost compact" data-action="archive" data-id="${h.id}">角色档案</button></div></div></section>`}

function heroRosterGrid(formationMode=false){return `<div class="v09-roster-grid">${ownedList().map(x=>{const p=state.heroes[x.id],on=state.formation.includes(x.id),full=formationMode&&state.formation.length>=5&&!on;return `<button class="v09-roster-card rarity-border-${x.rarity} ${x.id===selectedHeroId?'active':''} ${on?'in-formation':''} ${full?'formation-full':''} ${replaceCandidateId===x.id?'m222-replace-picked':''}" data-action="${formationMode?'form':'selectHero'}" data-id="${x.id}">${portrait(x,'roster')}<div class="v09-roster-meta"><span class="rarity-${x.rarity}">${x.rarity}</span><strong>${x.name}</strong><small>Lv.${p.level} · ${x.faction} · ${G.combatClassInfo(G.combatClassForHero(x)).name}</small>${formationMode?`<em>${on?'点击撤下':full?'点击替换':replaceCandidateId===x.id?'已选择':'点击上阵'}</em>`:''}</div>${on?'<i>上阵</i>':''}</button>`}).join('')}</div>`}
/* 设计图(3)-04：阵营共鸣进度条（按 2 人 / 3 人两档显示进度） */
function resonanceBars(active){
  const counts=G.factionCounts(state);
  const facs=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]);
  if(!facs.length)return `<div class="m222-resonance"><b>阵营共鸣</b><p class="muted">上阵同阵营 2 人即可激活第一层共鸣</p></div>`;
  return `<div class="m222-resonance"><div class="m222-res-head"><b>阵营共鸣</b><span>${active.length?`已激活 ${active.length} 组`:'同阵营上阵 2 人可激活'}</span></div>
    ${facs.map(f=>{const n=counts[f],two=n>=2,three=n>=3,tier=two?(three?2:1):0,pct=Math.min(100,Math.round(n/3*100));
      const label=two?(three?(active.find(x=>x.faction===f)?.three||G.FACTION_BONUSES[f]?.three?.label||''):(G.FACTION_BONUSES[f]?.two?.label||'')):(G.FACTION_BONUSES[f]?.two?.label||'');
      return `<div class="m222-res-row ${tier?'on':''}"><span class="m222-res-name"><i class="faction-dot ${f}"></i>${f} ×${n}</span>
        <div class="m222-res-bar"><i style="width:${pct}%"></i><em style="left:66%"></em></div>
        <small>${tier?label:'需 2 人'}</small></div>`}).join('')}
  </div>`;
}
function formationStage(){
  const active=G.activeFactionBonuses(state),relic=G.relicById?.(state.activeRelic),slots=Array.from({length:5},(_,i)=>state.formation[i]||null);
  /* 提示词03 第5条：每张队位卡显示 头像/半身图、名字、等级、稀有度、战力、站位 */
  const card=(id,i)=>{
    if(!id)return `<article class="m221-team-slot empty"><div class="m221-slot-empty"><b>＋</b><span>空位 ${i+1}</span></div><small>从下方选择契灵</small></article>`;
    const h=G.byId(id),p=state.heroes[id],row=state.formationRows?.[id]==='front'?'front':'back';
    const cls=G.combatClassInfo(G.combatClassForHero(h)),hp=G.heroPower(h,p,state);
    const replacing=replaceCandidateId&&replaceCandidateId!==id;
    return `<article class="m221-team-slot rarity-border-${h.rarity} ${row} ${replacing?'m222-replace-target':''}" ${replacing?`data-action="replaceSlot" data-id="${id}" role="button" tabindex="0"`:''}>
      <div class="m221-slot-art">${portrait(h,'formation')}<i>${i+1}</i><em class="m221-slot-rarity rarity-${h.rarity}">${h.rarity}</em></div>
      <strong>${h.name}</strong>
      <span class="m221-slot-stars">${stars(p.star)}</span>
      <span>${cls.icon} ${cls.name} · Lv.${p.level}</span>
      <small class="m221-slot-power">战力 <b>${hp.toLocaleString()}</b></small>
      <small>${row==='front'?'前排 · 承压':'后排 · 支援'}</small>
      ${replacing?`<span class="m222-replace-hint">点击替换此位</span>`
        :`<button class="btn ghost compact" data-action="formationRow" data-id="${id}">${row==='front'?'移至后排':'移至前排'}</button>`}</article>`};
  return `<section class="m221-formation-stage">
    ${teamPresetTabs()}
    <div class="m221-formation-head"><div><div class="kicker">TEAM FORMATION</div><h2>五人星轨编成</h2><p>五个队位一屏查看。点击队位下方按钮调整前后排；点击候选角色可上阵或撤下。</p></div><div class="m221-team-power"><small>队伍战力</small><strong>${G.formationPower(state).toLocaleString()}</strong><span>${state.formation.length}/5</span></div></div>
    <div class="m221-team-slots">${slots.map(card).join('')}</div>
    ${replaceCandidateId?`<div class="m222-replace-bar"><span>选择要替换的队位 · 上阵 <b>${G.byId(replaceCandidateId)?.name||''}</b></span><button class="btn ghost compact" data-action="replaceCancel">取消</button></div>`:''}
    <div class="m222-team-actions"><button class="btn secondary compact" data-action="quickFormation"><b>⚡</b> 快速编队</button><button class="btn primary compact" data-action="presetSave" data-slot="${ui.presetSlot||'1'}"><b>▤</b> 保存队伍</button></div>
    <div class="m221-team-meta"><span><small>前排</small><b>${state.formation.filter(id=>state.formationRows?.[id]==='front').length}</b></span><span><small>后排</small><b>${state.formation.filter(id=>state.formationRows?.[id]!=='front').length}</b></span><span><small>队伍遗物</small><b>${relic?.name||'未装备'}</b></span></div>
    ${resonanceBars(active)}
    ${deployReadyStrip()}
  </section>`
}
/* 设计图(4)-04：天赋树 —— 节点连线 + 前置锁定态 */
function talentPanel(heroId){
  const owned=G.heroTalents(state,heroId),tree=G.talentTree(heroId),pts=state.inventory.talentPoints||0;
  const nodeState=n=>({ok:owned.includes(n.id),req:!n.requires||owned.includes(n.requires),cost:n.cost,enough:pts>=n.cost});
  const lit=tree.filter(n=>nodeState(n).ok).length;
  return `<div class="panel v18-talent m222-talent"><div class="section-title"><div><div class="kicker">TALENT CONSTELLATION</div><h3>角色天赋</h3></div><span class="loot-chip">星痕点 ${pts} · 已点亮 ${lit}/${tree.length}</span></div>
    <div class="m222-talent-track">${tree.map(n=>{const s=nodeState(n);return `<i class="${s.ok?'on':''}"></i>`}).join('')}</div>
    <div class="m222-talent-tree">${tree.map((n,i)=>{const s=nodeState(n);const locked=!s.ok&&!s.req;
      return `<button class="m222-talent-node ${s.ok?'on':''} ${locked?'locked':''} ${!s.ok&&s.req&&!s.enough?'nopts':''}" data-action="talent" data-id="${heroId}" data-node="${n.id}" ${s.ok||!s.req||!s.enough?'disabled':''}>
        <span class="m222-talent-tier">${i+1}</span>
        <b>${s.ok?'✦':'◇'} ${n.name}</b>
        <small>${n.desc}</small>
        <em>${s.ok?'已点亮':locked?`需先点亮「${G.talentTree(heroId).find(x=>x.id===n.requires)?.name||'前置'}」`:s.enough?`消耗 ${n.cost} 星痕点`:`星痕点不足（需 ${n.cost}）`}</em>
      </button>`}).join('')}</div>
  </div>`;
}
function heroesView(formationMode=false){
  if(formationMode){
    const power=G.formationPower(state),active=G.activeFactionBonuses(state);
    return `<section class="v218-screen v218-formation-screen">${subpageHeader('◇','编队','组建专属的战斗小队')}<section class="v218-section-title v218-team-title"><div><div class="kicker">TEAM FORMATION</div><h2>队伍战力 ${power.toLocaleString()}</h2><p>${active.length?`已激活 ${active.length} 组阵营共鸣`:'调整前后排与职业组合，建立稳定阵容。'}</p></div><button class="btn secondary compact" data-action="quickFormation">快捷编队</button></section>${formationStage()}<section class="panel mf203-candidate-panel v218-roster-panel"><div class="section-title"><div><div class="kicker">CONTRACT ROSTER</div><h3>选择契灵</h3></div><span class="loot-chip">${state.formation.length}/5 上阵</span></div><p class="small muted mf203-help">点击角色加入或撤下队伍。阵容满员后请先撤下一名角色。</p>${heroRosterGrid(true)}</section>${presetPanel()}<details class="panel mf203-counter-details"><summary>职业克制与编队提示</summary>${classCounterPanel()}</details></section>`
  }
  if(!state.heroes[selectedHeroId])selectedHeroId=state.formation[0]||Object.keys(state.heroes)[0];
  const h=G.byId(selectedHeroId),p=state.heroes[selectedHeroId],bond=bondStoryCard(h);
  const tabs=`<div class="v218-segment v218-hero-tabs"><button class="${heroViewMode==='overview'?'active':''}" data-action="heroViewTab" data-view="overview"><b>✦</b><span>属性</span></button><button class="${heroViewMode==='growth'?'active':''}" data-action="heroViewTab" data-view="growth"><b>↑</b><span>升级</span></button><button class="${heroViewMode==='talent'?'active':''}" data-action="heroViewTab" data-view="talent"><b>✧</b><span>天赋</span></button><button data-tab="inventory"><b>⚔</b><span>装备</span></button><button class="${heroViewMode==='bond'?'active':''}" data-action="heroViewTab" data-view="bond"><b>♡</b><span>羁绊</span></button></div>`;
  const overview=`<section class="v218-hero-focus">${heroDetailPanel()}</section>`;
  const growth=`<section class="v218-page-stack"><section class="v218-section-title"><div><div class="kicker">RESONANCE GROWTH</div><h2>${h.name} · 成长</h2><p>升级、升星、觉醒与专属武装集中处理。</p></div><span>Lv.${p.level}</span></section>${heroGrowthPanel(h,p)}</section>`;
  const talent=`<section class="v218-page-stack"><section class="v218-section-title"><div><div class="kicker">TALENT CONSTELLATION</div><h2>${h.name} · 天赋</h2><p>只展示当前角色的专属成长节点。</p></div><span>星痕 ${state.inventory.talentPoints||0}</span></section><div class="panel v218-talent-panel">${talentPanel(selectedHeroId)}</div></section>`;
  const bondPage=`<section class="v218-page-stack"><section class="v218-section-title"><div><div class="kicker">CONTRACT BOND</div><h2>${h.name} · 羁绊</h2><p>赠送星语花，逐步解锁角色故事。</p></div><span>${state.inventory.bondGift||0} 花</span></section><div class="v218-single-bond">${bond}</div></section>`;
  const content=heroViewMode==='growth'?growth:heroViewMode==='talent'?talent:heroViewMode==='bond'?bondPage:overview;
  return `<section class="v218-screen v218-heroes-screen">${subpageHeader('✦','契灵','角色详情与养成')}<div class="v218-hero-rail">${heroSwitchRail()}</div>${tabs}${content}</section>`
}
function classCounterPanel(){return `<div class="panel v18-counter-panel"><div class="section-title"><h3>职业克制</h3><span class="small muted">克制 +18% · 被克制 -12%</span></div><div class="v18-counter-chain"><span>⚔ 突击</span><b>→</b><span>✧ 术式</span><b>→</b><span>⌁ 控制</span><b>→</b><span>◇ 守御</span><b>→</b><span>⚔ 突击</span><em>✦ 支援中立</em></div></div>`}
function presetPanel(){return `<div class="panel v18-presets"><div class="section-title"><h3>阵容预设</h3><span class="small muted">最多保存 3 套阵容/站位/遗物</span></div><div class="v18-preset-grid">${['1','2','3'].map(slot=>{const p=state.formationPresets?.[slot];return `<div class="v18-preset"><b>${p?.name||`阵容 ${slot}`}</b><small>${p?.formation?.map(id=>G.byId(id)?.name).filter(Boolean).join(' · ')||'尚未保存'}</small><div class="btnrow"><button class="btn ghost compact" data-action="presetSave" data-slot="${slot}">保存</button><button class="btn secondary compact" data-action="presetLoad" data-slot="${slot}" ${!p?'disabled':''}>载入</button></div></div>`}).join('')}</div></div>`}
function gachaView(){const pct=Math.min(100,state.pity/50*100),lp=Math.min(100,(state.limited?.pity||0)/60*100),up=G.byId(G.LIMITED_POOL.featured),limited=gachaViewPool==='limited',newbie=gachaViewPool==='newbie';const pity=limited?(state.limited?.pity||0):state.pity,pityMax=limited?60:50,pityPct=limited?lp:pct;
  /* 提示词05：卡池 Tab 为 首契 / 常驻 / 限定；首契展示"首次常驻十连必得 SSR"并复用真实新手保障 */
  const newbieClaimed=!!state.newbieGacha?.claimed;
  const poolTabs=`<div class="m206-pool-tabs m222-pool-tabs-3">
    <button class="${newbie?'active':''}" data-action="gachaPoolTab" data-pool="newbie"><span>首契</span><b>新手引导</b><small>${newbieClaimed?'已完成':'必得 SSR'}</small></button>
    <button class="${(!limited&&!newbie)?'active':''}" data-action="gachaPoolTab" data-pool="standard"><span>常驻</span><b>星契轮</b><small>距保底 ${Math.max(0,50-state.pity)} 抽</small></button>
    <button class="${limited?'active':''}" data-action="gachaPoolTab" data-pool="limited"><span>限定</span><b>月影流光</b><small>距保底 ${Math.max(0,60-(state.limited?.pity||0))} 抽</small></button></div>`;
  const newbieMain=`<div class="m206-gacha-art m222-newbie-art"><div class="m222-newbie-ring"><i>✦</i><b>SSR</b><small>至少 1 名</small></div></div><div class="m206-gacha-copy"><div class="kicker">FIRST CONTRACT · 新手首契</div><h2>首次常驻十连</h2><p>首次常驻十连必定获得至少 1 名 SSR · 与常驻池共用 50 抽保底</p><div class="v12-newbie-badge ${newbieClaimed?'used':''}">${newbieClaimed?'新手十连已完成':'NEW · 首次常驻十连必得 SSR'}</div></div>`;
  const normalBanner=limited?`<div class="m206-gacha-art">${portrait(up,'limited')}</div><div class="m206-gacha-copy"><div class="kicker">LIMITED CONTRACT · 月影流光</div><h2>${up.name}</h2><p>SSR 概率 3% · 60 抽保底 · 非 UP 后下一次 SSR 必定为 ${up.name}</p><div class="m206-guarantee ${state.limited?.guaranteed?'ready':''}">${state.limited?.guaranteed?'✦ 下次 SSR 必定 UP':'◇ 首次 SSR：UP 概率 50%'}</div></div>`:`<div class="m206-standard-orbit"><i></i><b>◎</b><span>STAR CONTRACT</span></div><div class="m206-gacha-copy"><div class="kicker">STANDARD CONTRACT</div><h2>常驻星契轮</h2><p>SSR 3% · SR 22% · R 75% · 50 抽内必得 SSR</p><div class="v12-newbie-badge ${newbieClaimed?'used':''}">${newbieClaimed?'新手十连已完成':'NEW · 首次常驻十连必得 SSR'}</div></div>`;
  const banner=newbie?newbieMain:normalBanner;
  const results=lastGacha.length?`<section class="panel m206-gacha-results"><div class="section-title"><div><div class="kicker">LAST CONTRACT</div><h3>最近契约结果</h3></div><span class="small muted">${gachaPool==='limited'?'限定':'常驻'} · ${lastGacha.length} 次</span></div><div class="m206-result-rail">${lastGacha.map(r=>`<div class="result rarity-border-${r.hero.rarity} ${r.featured?'featured-result':''}">${portrait(r.hero,'result')}<span class="rarity-${r.hero.rarity}">${r.hero.rarity}</span><strong>${r.hero.name}</strong><small>${r.featured?'UP · ':''}${r.duplicate?`重复 · +${r.fragmentsGained}碎片`:'新契灵'}</small></div>`).join('')}</div></section>`:'';return `<section class="v218-screen v218-gacha-screen">${subpageHeader('◎','星契轮','切换卡池并快速完成契约')}${journeyPageHint('gacha')}${poolTabs}<section class="m206-gacha-stage ${limited?'limited':newbie?'newbie':'standard'}">${banner}<div class="m206-pity"><div><span>${limited?'限定保底':'SSR 保底'}</span><b>距保底还差 ${Math.max(0,pityMax-pity)} 抽</b><small>${pity}/${pityMax}</small></div><div class="progress"><i style="width:${pityPct}%"></i></div></div><div class="m206-ticket-line"><span>契灵印</span><strong>${state.tickets}</strong><small>${state.tickets>=10?'可进行十连 · 消耗 10':state.tickets>0?'可进行单抽 · 消耗 1':'契灵印不足（需 1 / 10）'}</small></div><div class="m206-gacha-actions"><button class="btn ghost" data-action="${limited?'limited1':'gacha1'}" ${state.tickets<1?'disabled':''}>契约 1 次 <small>×1</small></button><button class="btn primary" data-action="${limited?'limited10':'gacha10'}" ${state.tickets<10?'disabled':''}>${!newbieClaimed?'开始首契十连':'契约 10 次'} <small>×10</small></button></div></section><details class="panel m206-rate-details" ${gachaShowRates?'open':''}><summary><span>卡池规则与概率</span><em>${gachaShowRates?'收起':'查看'}</em></summary>${rateTable(limited)}</details>${results}</section>`}
function usedCount(itemId,exceptHero){let n=0;for(const [hid,p] of Object.entries(state.heroes)){if(hid===exceptHero)continue;for(const id of Object.values(p.equipment||{}))if(id===itemId)n++;}return n}
/* 提示词04 修复：点「装备」会切到整备页（另一套页面），原实现没有回到契灵页的入口，
   导致「羁绊/属性/升级/天赋」在装备之后无法再进入。这里补一条角色 Tab 栏保持可达。 */
function heroContextTabs(current){
  const item=(id,icon,name)=>`<button class="${current===id?'active':''}" data-action="heroViewTab" data-view="${id}"><b>${icon}</b><span>${name}</span></button>`;
  return `<div class="v218-segment v218-hero-tabs v218-hero-context-tabs">${item('overview','✦','属性')}${item('growth','↑','升级')}${item('talent','✧','天赋')}<button class="active" data-tab="inventory"><b>⚔</b><span>装备</span></button>${item('bond','♡','羁绊')}</div>`;
}
function inventoryView(){if(!state.heroes[selectedHeroId])selectedHeroId=state.formation[0]||Object.keys(state.heroes)[0];if(!['weapon','armor','charm'].includes(gearSlot))gearSlot='weapon';const h=G.byId(selectedHeroId),p=state.heroes[selectedHeroId],heroChoices=ownedList().map(x=>`<button class="m206-gear-hero ${x.id===selectedHeroId?'active':''}" data-action="selectHero" data-id="${x.id}">${portrait(x,'selected')}<span><b class="rarity-${x.rarity}">${x.name}</b><small>Lv.${x.level}</small></span></button>`).join('');const slotTabs=['weapon','armor','charm'].map(slot=>{const item=G.equipmentById(p.equipment?.[slot]);return `<button class="m206-slot-tab ${gearSlot===slot?'active':''}" data-action="gearSlot" data-slot="${slot}"><span>${slot==='weapon'?'⚔':slot==='armor'?'◇':'✦'}</span><div><small>${slotName[slot]}</small><b class="${item?`rarity-${item.rarity}`:''}">${item?.name||'未装备'}</b></div></button>`}).join('');const current=G.equipmentById(p.equipment?.[gearSlot]),owned=G.EQUIPMENT.filter(x=>x.slot===gearSlot&&(state.inventory.equipment[x.id]||0)>0).sort((a,b)=>rarityRank(b.rarity)-rarityRank(a.rarity)||(state.inventory.enhance?.[b.id]||0)-(state.inventory.enhance?.[a.id]||0));const options=owned.map(item=>{const total=state.inventory.equipment[item.id]||0,occupied=usedCount(item.id,selectedHeroId)>0,free=occupied?0:total,isOn=p.equipment?.[gearSlot]===item.id,enh=state.inventory.enhance?.[item.id]||0;return `<article class="m206-gear-option ${isOn?'active':''} rarity-border-${item.rarity}"><button class="m206-gear-main" data-action="equip" data-id="${item.id}" ${!isOn&&free<=0?'disabled':''}><span class="m206-gear-rarity rarity-${item.rarity}">${item.rarity}</span><div><strong>${item.name} <em>+${enh}</em></strong><small>${statText(G.equipmentStats({equipment:{[gearSlot]:item.id}},state))}</small>${item.set?`<i>${G.EQUIPMENT_SETS[item.set]?.name||''}套装</i>`:''}</div><b>${isOn?'使用中':free>0?`可用 ${free}/${total}`:'同型号已占用'}</b></button><button class="m206-enhance" data-action="enhanceGear" data-id="${item.id}" ${enh>=10?'disabled':''}>强化${enh>=10?' MAX':''}</button></article>`}).join('')||'<div class="empty slim">尚未获得该槽位装备</div>';const relics=G.RELICS.filter(r=>(state.inventory.relics[r.id]||0)>0),currentRelic=G.relicById(state.activeRelic);return `<section class="v218-screen v218-gear-screen">${subpageHeader('▣','契灵整备','角色、装备、遗物与锻造集中管理')}${heroContextTabs('inventory')}<section class="panel m206-loadout"><div class="m206-gear-heroes">${heroChoices}</div><div class="m206-selected-hero">${portrait(h,'selected')}<div><div class="kicker">CURRENT CONTRACTOR</div><h3>${h.name}</h3><p>Lv.${p.level} · 战力 ${G.heroPower(h,p,state)}</p></div><button class="btn ghost compact" data-tab="heroes">培养</button></div><div class="m206-slot-tabs">${slotTabs}</div><div class="m206-current-gear"><div><span>${slotName[gearSlot]} · 当前</span><strong class="${current?`rarity-${current.rarity}`:''}">${current?.name||'未装备'}</strong><small>${current?statText(G.equipmentStats({equipment:{[gearSlot]:current.id}},state)):'选择下方装备即可穿戴'}</small></div><div class="m222-gear-btns"><button class="btn ghost compact" data-action="autoEquip">一键穿戴</button><button class="btn ghost compact" data-action="unequipAll">一键卸下</button></div></div><div class="m206-gear-list">${options}</div></section><details class="panel m206-gear-drawer" open><summary><span><b>队伍遗物</b><small>${currentRelic?`当前 · ${currentRelic.name}`:'全队唯一生效'}</small></span><em>展开</em></summary><div class="m206-relic-rail">${relics.map(r=>`<button class="relic-card ${state.activeRelic===r.id?'active':''}" data-action="relic" data-id="${r.id}"><span class="rarity-${r.rarity}">${r.rarity}</span><strong>${r.name}</strong><small>${r.desc}</small></button>`).join('')||'<div class="empty slim">击败第 10/20/30 关 Boss 可获得核心遗物。</div>'}</div>${currentRelic?'<button class="btn ghost compact" data-action="relicClear">卸下当前遗物</button>':''}</details><details class="panel m206-gear-drawer m206-forge-drawer"><summary><span><b>星烬锻造</b><small>锻造、套装与闲置装备分解</small></span><em>展开</em></summary>${forgePanel()}</details></section>`}

function forgePanel(){const spare=G.EQUIPMENT.filter(i=>(state.inventory.equipment[i.id]||0)>0).map(i=>{const total=Number(state.inventory.equipment[i.id])||0,used=usedCount(i.id,null),free=Math.max(0,total-used);return `<div class="forge-row"><div><strong class="rarity-${i.rarity}">${i.name}</strong><small>${i.set?`${G.EQUIPMENT_SETS[i.set]?.name}套装 · `:''}持有 ${total} · 闲置 ${free}</small></div><button class="btn ghost compact" data-action="dismantle" data-id="${i.id}" ${free<1?'disabled':''}>分解 +${G.DISMANTLE_DUST[i.rarity]}</button></div>`}).join('');return `<div class="forge-panel m206-forge-inner"><div class="section-title"><h3>星烬锻造</h3><span class="small muted">锻造尘 ${state.inventory.forgeDust||0} · 星铁 ${state.inventory.starIron||0}</span></div><p class="small muted">强化采用同名装备共鸣等级；为避免一份强化同时复制到多名角色，同名装备仅可装备给 1 名角色，额外副本用于分解或收藏。</p><div class="set-guide">${Object.values(G.EQUIPMENT_SETS).map(z=>`<div><strong>${z.name}套装</strong><span>${z.two.label} · ${z.three.label}</span></div>`).join('')}</div><div class="forge-recipes">${G.FORGE_RECIPES.map(r=>{const i=G.equipmentById(r.itemId),c=r.cost,ok=state.coin>=c.coin&&(state.inventory.starIron||0)>=c.starIron&&(state.inventory.forgeDust||0)>=c.forgeDust;return `<div class="forge-recipe"><div><span class="rarity-${i.rarity}">${i.rarity}</span><strong>${i.name}</strong><small>${G.EQUIPMENT_SETS[i.set]?.name||''} · ${statText(i.stats)}</small><em>锻造尘 ${c.forgeDust} · 星铁 ${c.starIron} · 烬币 ${c.coin}</em></div><button class="btn ${ok?'primary':'ghost'} compact" data-action="forge" data-id="${r.id}" ${!ok?'disabled':''}>锻造</button></div>`}).join('')}</div><details class="dismantle-box"><summary>分解闲置装备</summary>${spare||'<div class="empty slim">暂无可分解装备</div>'}</details></div>`}
function bondStoryCard(x){const b=G.bondInfo(state,x.id);return `<div class="bond-card"><div class="bond-head">${portrait(x,'bond')}<div><strong>${x.name}</strong><span>好感 Lv.${b.level}</span><small>${b.points}${b.next?` / ${b.next}`:' · MAX'}</small></div></div><div class="bond-stories">${b.stories.map(st=>`<div class="story ${st.unlocked?'open':'locked'}"><span>${st.unlocked?'✦':'◇'}</span><div><strong>${st.title}</strong><small>好感 Lv.${st.level} ${st.unlocked?'已解锁':'解锁'}</small></div></div>`).join('')}</div><button class="btn secondary compact wide" data-action="giftBond" data-id="${x.id}" ${b.level>=5||(state.inventory.bondGift||0)<1?'disabled':''}>${b.level>=5?'羁绊已满':'赠送星语花 · 持有 '+(state.inventory.bondGift||0)}</button></div>`}
function eventBossPanel(){
  G.ensureEventBoss(state);const b=state.eventBoss,left=Math.max(0,G.EVENT_BOSS.dailyAttempts-b.runs),board=eventLeaderboard.length?eventLeaderboard:G.localEventLeaderboard(state),power=G.formationPower(state),eligible=power>=G.EVENT_BOSS.recommendedPower*.45,ready=eligible&&left>0;
  return `<section class="m207-boss-raid"><div class="m207-boss-raid-head"><div><div class="kicker">ECLIPSE RAID</div><h2>${G.EVENT_BOSS.name}</h2><p>伤害挑战 · 云端模式下单次最佳计入全服伤害榜。</p><div class="m207-raid-tags"><span>推荐战力 ${G.EVENT_BOSS.recommendedPower}</span><span>当前 ${power}</span><span>今日 ${left}/${G.EVENT_BOSS.dailyAttempts}</span></div></div><div class="boss-damage"><small>个人最佳</small><strong>${Number(b.bestDamage||0).toLocaleString()}</strong><span>${ready?(power>=G.EVENT_BOSS.recommendedPower?'星轨稳定，可发起讨伐':'可挑战 · 当前低于推荐战力'):left<=0?'今日次数已耗尽':'战力不足，暂不可挑战'}</span></div></div><div class="m207-raid-actions"><button class="btn primary" data-action="eventBoss" ${!ready?'disabled':''}>讨伐一次</button><button class="btn ghost" data-action="leaderboard">刷新伤害榜</button></div><div class="m207-leaderboard"><div class="m207-rank-title"><b>伤害榜</b><small>${cloudMode?'全服实时排行':'本地模拟排行'} · 展示前 6 名</small></div>${board.slice(0,6).map(x=>`<div class="rank-row ${x.isSelf?'self':''}"><b>#${x.rank}</b><span>${x.name||'引星者'}</span><strong>${Number(x.damage||0).toLocaleString()}</strong></div>`).join('')}</div></section>`
}
function nightEventPanel(){
  const ev=state.nightEvent||{},left=Math.max(0,6-(ev.runs||0)),power=G.formationPower(state);
  const stages=G.NIGHT_EVENT_STAGES.map(st=>{const done=ev.clears?.includes(st.id),first=ev.firstClears?.includes(st.id),can=power>=st.power&&left>0;return `<button class="m207-night-stage ${done?'done':''}" data-action="nightRun" data-id="${st.id}" ${!can?'disabled':''}><span>${st.id}</span><div><strong>${st.name}</strong><small>推荐 ${st.power} · ${compactReward(st.reward)}</small>${!first?`<em>首通 ${compactReward(st.first)}</em>`:'<em>首通已领取</em>'}</div><b>${can?'出航':left<=0?'次数耗尽':'战力不足'}</b></button>`}).join('');
  const goods=G.NIGHT_EVENT_SHOP.map(i=>{const bought=ev.shop?.[i.id]||0,leftBuy=Math.max(0,i.limit-bought),can=leftBuy>0&&(ev.voyageBadge||0)>=i.cost,bank=i.reward?.heroId&&!state.heroes[i.reward.heroId]?` · 碎片仓 ${G.pendingHeroFragments(state,i.reward.heroId)} 枚` :'';return `<article class="m207-event-good"><div><span>航星徽 ${i.cost}</span><strong>${i.name}</strong><small>${compactReward(i.reward)} · 本周剩余 ${leftBuy}/${i.limit}${bank}</small></div><button class="btn secondary compact" data-action="nightBuy" data-id="${i.id}" ${!can?'disabled':''}>兑换</button></article>`}).join('');
  return `<section class="m207-night"><div class="m207-event-section-head"><div><div class="kicker">STAR HARBOR VOYAGE</div><h3>${G.NIGHT_EVENT_CONFIG.name}</h3><p>${G.NIGHT_EVENT_CONFIG.subtitle}</p></div><div class="m207-event-token"><small>航星徽</small><strong>${ev.voyageBadge||0}</strong><span>今日 ${left}/6</span></div></div><div class="m207-night-rail">${stages}</div><details class="m207-event-drawer"><summary><span>夜航补给 · 每周刷新</span><em>${ev.voyageBadge||0} 航星徽</em></summary><div class="m207-event-goods">${goods}</div></details></section>`
}
function eventView(){
  const featured=G.byId('h008'),clears=state.event?.clears||[],seal=state.event?.moonSeal||0,status=eventStatus(),power=G.formationPower(state);
  const tabs=[['eclipse','☾','月蚀回廊',`${status.eclipseLeft} 次`],['boss','♛','月蚀兽',`${status.bossLeft} 次`],['night','✧','星港夜航',`${status.nightLeft} 次`],['bond','♡','契灵羁绊',`${state.inventory.bondGift||0} 花`]];
  const tabbar=`<div class="m207-system-tabs m207-event-tabs">${tabs.map(([id,icon,name,badge])=>`<button class="${eventViewMode===id?'active':''}" data-action="eventViewTab" data-view="${id}"><b>${icon}</b><span>${name}</span><em>${badge}</em></button>`).join('')}</div>`;
  const eclipseStages=`<div class="m207-event-stage-rail">${G.EVENT_STAGES.map((st,index)=>{const done=clears.includes(st.id),first=state.event?.firstClears?.includes(st.id),left=status.eclipseLeft,can=power>=st.power&&left>0;return `<article class="m207-event-stage ${done?'done':''}"><div class="m207-stage-no">${String(index+1).padStart(2,'0')}</div><div><span>${st.id}</span><strong>${st.name}</strong><small>推荐战力 ${st.power}</small><em>${compactReward(st.reward)}</em>${!first?`<i>首通 ${compactReward(st.first)}</i>`:'<i>首通已领取</i>'}</div><button class="btn ${can?'primary':'ghost'} compact" data-action="eventRun" data-id="${st.id}" ${!can?'disabled':''}>${done?'再战':can?'挑战':left<=0?'次数耗尽':'战力不足'}</button></article>`}).join('')}</div>`;
  /* 设计图(2)-05：活动商店 —— 分类标签 + 商品卡 + 奖励详情 */
  const goodsCat=(id)=>{const s=String(id);if(/ticket|talent|core/.test(s))return 'ticket';if(/coin|iron|dust|crystal/i.test(s))return 'material';return 'other'};
  const cats=[['all','全部'],['ticket','道具'],['material','材料'],['other','其他']];
  const catName=id=>{const f=cats.find(x=>x[0]===goodsCat(id));return f?f[1]:'其他'};
  const shopCats=cats.map(([id,name])=>{const n=id==='all'?G.EVENT_SHOP.length:G.EVENT_SHOP.filter(x=>goodsCat(x.id)===id).length;
    return `<button class="${eventShopCat===id?'active':''}" data-action="eventShopCat" data-cat="${id}">${name}<em>${n}</em></button>`}).join('');
  const eclipseGoods=G.EVENT_SHOP.filter(i=>eventShopCat==='all'||goodsCat(i.id)===eventShopCat).map(i=>{
    const bought=Number(state.event?.shop?.[i.id])||0,left=Math.max(0,i.limit-bought),can=left>0&&seal>=i.cost;
    const bank=i.reward?.heroId&&!state.heroes[i.reward.heroId]?` · 碎片仓 ${G.pendingHeroFragments(state,i.reward.heroId)} 枚`:'';
    return `<article class="m207-event-good"><div><span>${catName(i.id)} · 月蚀印 ${i.cost}</span><strong>${i.name}</strong><small>${compactReward(i.reward)} · 本周剩余 ${left}/${i.limit}${bank}</small></div><button class="btn secondary compact" data-action="eventBuy" data-id="${i.id}" ${!can?'disabled':''}>${left<=0?'已兑完':can?'兑换':'印记不足'}</button></article>`}).join('')
    ||'<div class="empty slim">该分类下暂无商品</div>';
  const eclipseShopBar=`<div class="m222-shop-cats">${shopCats}</div>`;
  const rewardDetail=`<div class="m222-shop-detail"><b>奖励详情</b><span>月蚀印</span><small>通过「月蚀回廊」关卡获得，每次挑战 +55~180，本周商店刷新后限量重置。</small></div>`;
  const eclipse=`<section class="m207-event-main"><div class="m207-event-section-head"><div><div class="kicker">ECLIPSE CORRIDOR</div><h3>月蚀回廊</h3><p>活动挑战与兑换收束在同一条主线中，优先完成未领取首通奖励的关卡。</p></div><div class="m207-event-token"><small>月蚀印</small><strong>${seal}</strong><span>今日 ${status.eclipseLeft}/${G.EVENT_DAILY_ATTEMPTS}</span></div></div>${eclipseStages}<details class="m207-event-drawer" open><summary><span>月蚀商店 · 每周刷新</span><em>${seal} 月蚀印</em></summary>${eclipseShopBar}<div class="m207-event-goods">${eclipseGoods}</div>${rewardDetail}</details></section>`;
  const bonds=`<section class="m207-bond-center"><div class="m207-event-section-head"><div><div class="kicker">CONTRACT BOND</div><h3>契灵羁绊</h3><p>赠送星语花提升好感等级并解锁个人剧情。</p></div><div class="m207-event-token"><small>星语花</small><strong>${state.inventory.bondGift||0}</strong><span>已缔结 ${ownedList().length}</span></div></div><div class="m207-bond-rail">${ownedList().map(bondStoryCard).join('')}</div></section>`;
  const content=eventViewMode==='boss'?eventBossPanel():eventViewMode==='night'?nightEventPanel():eventViewMode==='bond'?bonds:eclipse;
  return `<section class="v218-screen v218-event-screen">${subpageHeader('☾','限时活动','月蚀、讨伐、夜航与羁绊集中入口')}<section class="m207-event-hero"><div class="m207-event-art">${portrait(featured,'limited')}</div><div><div class="kicker">LIVE OPERATIONS</div><h2>月蚀季 · 星港夜航</h2><p>选择下方活动类型，页面只保留当前玩法，减少竖屏反复滚动。</p><div class="m207-event-overview"><span>战力 <b>${power}</b></span><span>月蚀印 <b>${seal}</b></span><span>航星徽 <b>${status.voyageBadge}</b></span></div></div></section>${tabbar}${content}</section>`
}
/* 设计图(3)-01：队伍预设标签条（对齐设计图的「队伍1~4」） */
function teamPresetTabs(){
  const cur=ui.presetSlot||'1';
  return `<div class="m222-team-tabs" role="tablist">${['1','2','3'].map((slot,i)=>{
    const p=state.formationPresets?.[slot],using=cur===slot;
    return `<button class="${using?'active':''}" data-action="presetSlot" data-slot="${slot}" role="tab" aria-selected="${using}"><b>队伍${i+1}</b><small>${p?(p.formation?.length?`${p.formation.length} 人`:'空'):'未保存'}</small></button>`}).join('')}</div>`;
}
/* 设计图(3)-04：出战准备 —— 推荐战力对比条 */
function deployReadyStrip(){
  const boss=currentBoss(),power=G.formationPower(state);
  const rec=boss?Number(boss.recommendedPower||boss.power||0):Math.round(1200+state.stage*420);
  const ok=power>=rec,ratio=rec?Math.min(100,Math.round(power/rec*100)):100;
  return `<div class="m222-deploy ${ok?'ok':'low'}">
    <div class="m222-deploy-head"><span>出战准备 · 第 ${state.stage} 裂境</span><b>${ok?'战力充足 ✓':'战力偏低'}</b></div>
    <div class="m222-deploy-bar"><i style="width:${ratio}%"></i></div>
    <div class="m222-deploy-nums"><span>推荐战力 <b>${rec.toLocaleString()}</b></span><span>当前战力 <b>${power.toLocaleString()}</b></span></div>
  </div>`;
}
/* 设计图(7)-05：公告页 —— 版本动态 / 活动资讯 / 维护公告 */
function noticePanel(){
  const ver=(window.STAR_EMBER_BUILD||'2.2.5');
  const chapters=G.CHAPTERS||[];
  const ev=eventStatus();
  const items=[
    {tag:'版本',hot:true,title:`v${ver} 全界面重构与体验修复`,body:'首页资源常显、战斗演出与结算、扫荡结果弹窗、卡池概率公示与召唤确认。',date:'最近更新'},
    {tag:'活动',hot:ev.eclipseLeft>0||ev.nightLeft>0,title:'月蚀季 · 星港夜航',body:`月蚀回廊剩余 ${ev.eclipseLeft} 次 · 星港夜航剩余 ${ev.nightLeft} 次 · 月蚀兽 ${ev.bossLeft} 次。`,date:'进行中'},
    {tag:'玩法',hot:false,title:`主线进度：${chapters.length?chapters.length:6} 章 · 30 关`,body:'每 5 关为一个章节节点，Boss 首通可获得固定稀有奖励。',date:'长期'},
    {tag:'系统',hot:false,title:'云存档与跨设备迁移',body:'在「账号」页连接云端后可生成 6 位迁移码，在另一台设备绑定同一进度。',date:'长期'},
    {tag:'提示',hot:false,title:'本地试玩说明',body:'未连接云端时进度只保存在本浏览器，清理浏览器数据会丢失进度。',date:'长期'},
  ];
  return `<div class="panel m222-notice-panel">
    <div class="section-title"><div><div class="kicker">ANNOUNCEMENT</div><h3>公告与资讯</h3></div><span class="small muted">${items.length} 条</span></div>
    ${items.map(x=>`<article class="m222-notice ${x.hot?'hot':''}"><div class="m222-notice-tag">${x.tag}</div><div><strong>${x.title}</strong><span>${x.body}</span></div><small>${x.date}</small></article>`).join('')}
  </div>`;
}
function utilityView(){
  const n=utilityBadgeCounts();
  const tabs=[['daily','✦','今日',n.daily+n.login],['goals','◇','目标',n.weekly+n.ach],['mail','✉','邮件',n.mail],['notice','▤','公告',''],['account','☁','账号',cloudMode?'ON':'']];
  const tabbar=`<div class="m207-system-tabs m207-office-tabs">${tabs.map(([id,icon,name,badge])=>`<button class="${utilityViewMode===id?'active':''}" data-action="hubViewTab" data-view="${id}"><b>${icon}</b><span>${name}</span>${badge!==''?`<em class="${Number(badge)>0?'hot':''}">${badge}</em>`:''}</button>`).join('')}</div>`;
  const daily=`<div class="m207-office-stack">${loginRewardPanel()}${dailyPanel()}</div>`;
  const goals=`<div class="m207-office-stack">${weeklyPanel()}${achievementPanel()}${factionPanel()}</div>`;
  const mail=`<div class="m207-office-stack">${mailPanel()}</div>`;
  const account=`<div class="m207-office-stack">${accountPanel()}<div class="panel m207-account-note"><b>${cloudMode?'☁ 云存档已连接':'◇ 当前为本地存档'}</b><p>${cloudMode?'关键进度会通过云函数同步；跨设备请使用迁移码。':'建议在正式游玩前连接 CloudBase，避免清理浏览器数据导致本地进度丢失。'}</p></div></div>`;
  const notice=`<div class="m207-office-stack">${noticePanel()}</div>`;
  const content=utilityViewMode==='goals'?goals:utilityViewMode==='mail'?mail:utilityViewMode==='notice'?notice:utilityViewMode==='account'?account:daily;
  return `<section class="v218-screen v218-office-screen">${subpageHeader('✦','星轨事务所','奖励、目标、邮件与账号集中管理')}<section class="m207-office-summary"><div><div class="kicker">STAR OFFICE</div><h2>${n.total?`${n.total} 项待处理`:'星轨事务正常'}</h2><p>${n.total?'优先领取已完成任务与邮件奖励。':'今日暂无可领取奖励，可继续探索裂境。'}</p></div><div class="m207-office-counters"><span><small>今日</small><b>${n.daily+n.login}</b></span><span><small>目标</small><b>${n.weekly+n.ach}</b></span><span><small>邮件</small><b>${n.mail}</b></span></div></section>${tabbar}${content}</section>`
}
function resourcePanel(){G.ensureResourceRuns(state);const priority=resourcePriority();return `<div class="panel m213-resource-focus"><div class="section-title"><div><h3>资源裂境</h3><span class="small muted">每日独立挑战次数 · 推荐项会随资源缺口变化</span></div>${priority?`<span class="loot-chip">推荐 · ${priority.name}</span>`:''}</div><div class="dungeon-grid">${G.RESOURCE_DUNGEONS.map(d=>{const used=Number(state.resourceRuns.used[d.id])||0,left=Math.max(0,d.attempts-used),ok=G.formationPower(state)>=d.power,recommended=priority?.id===d.id;return `<div class="dungeon-card ${recommended?'m213-resource-recommended':''}"><div class="dungeon-icon">${d.icon}</div><div class="dungeon-main"><strong>${d.name}${recommended?' · 推荐':''}</strong><span>${d.desc}</span><small>推荐战力 ${d.power} · 今日剩余 ${left}/${d.attempts}</small><div class="loot-chip">${rewardText(d.reward)}</div>${recommended?`<em class="m213-resource-reason">${priority.why}</em>`:''}</div><button class="btn ${ok&&left?'primary':'ghost'} compact" data-action="resourceDungeon" data-id="${d.id}" ${!ok||!left?'disabled':''}>${!left?'已用尽':ok?'挑战':'战力不足'}</button></div>`}).join('')}</div></div>`}
function battleArena(){
  if(!lastBattle)return'';
  const timeline=lastBattle.timeline||[],maxIndex=Math.max(0,timeline.length-1),frame=timeline[Math.min(battleFrame,maxIndex)]||null;
  const enemies=frame?.enemies||G.enemyTeam(lastBattle.stage).map(e=>({...e,maxHp:e.hp,shield:0}));
  const allies=frame?.allies||state.formation.map(id=>{const h=G.byId(id),z=G.computedStats(h,state.heroes[id],state);return{id,name:h.name,hp:z.hp,maxHp:z.hp,shield:0}});
  const lastSkill=frame?.text||battleLog[Math.min(battleFrame,Math.max(0,battleLog.length-1))]||'',effect=frame?.effect||{kind:'info',value:0},fx=frame?.actor?.id?G.SKILL_FX?.[frame.actor.id]:null;
  const isSkill=/施放|发动|终焉|群体|治疗|护盾/.test(lastSkill),progress=timeline.length?Math.round((Math.min(battleFrame+1,timeline.length)/timeline.length)*100):100;
  const unit=(u,side)=>{const hp=Math.max(0,Math.min(100,(u.hp||0)/(u.maxHp||1)*100)),h=side==='ally'?G.byId(u.id):null,acting=frame?.actor?.id===u.id&&frame?.side===(side==='ally'?'a':'e'),hit=!acting&&lastSkill.includes(u.name),dead=(u.hp||0)<=0;return `<div class="v10-battle-unit m205-replay-unit ${side} ${u.isBoss?'boss-unit':''} ${acting?'v11-acting':''} ${hit?'v11-hit':''} ${dead?'v11-down':''}" data-unit="${u.id}">${h?portrait(h,'battle'):(u.isBoss?`<div class="m221-boss-unit-art">${bossEmblem(lastBattle.stage)}</div>`:`<div class="enemy-core">◆</div>`)}<div class="v10-unit-meta"><strong>${u.name}</strong><div class="hpbar"><i style="width:${hp}%"></i></div><small>${Math.round(u.hp||0)} / ${Math.round(u.maxHp||0)}${u.shield?` · 护盾 ${Math.round(u.shield)}`:''}</small><em class="m205-hp-percent">${Math.round(hp)}%</em>${u.stun?'<em class="v11-status">眩晕</em>':''}</div></div>`};
  const value=Number(effect.value)||0,label=effect.kind==='heal'?`+${value}`:effect.kind==='shield'?`◇ ${value||''}`:value?`-${value}`:'';
  return `<section class="panel battle-visual v10-battle-stage v11-battle-stage v12-battle-stage m205-battle-focus m205-replay-stage ${lastBattle.win?'win':'loss'}">
    <div class="m205-battle-hud"><div><div class="kicker">${lastBattle.replay?'BATTLE ARCHIVE':'BATTLE RESULT'} · STAGE ${lastBattle.stage}</div><h3>${lastBattle.boss?`Boss · ${lastBattle.boss.name||'裂境首领'}`:'裂境战斗记录'}</h3></div><div class="m205-hud-actions"><span class="m205-result-badge ${lastBattle.win?'win':'loss'}">${lastBattle.win?'VICTORY':'DEFEAT'}</span><button class="m205-icon-btn" data-action="battleFullscreen" title="全屏">⛶</button><button class="m205-icon-btn" data-action="battleRecordClose" title="收起战报">×</button></div></div>
    <div class="m205-replay-progress"><i style="width:${progress}%"></i><span>${timeline.length?`${Math.min(battleFrame+1,timeline.length)}/${timeline.length}`:'战报'}</span></div>

    <div class="se-battle-hud"><div class="se-power"><small>POWER</small><b>${G.formationPower(state).toLocaleString()}</b></div><div class="se-bond">${resonanceChips()}</div><small class="se-sub">阵容 · ${allies.length} v ${enemies.length} · 自动战斗</small></div>
    <div class="se-scene" id="battleScene">
      <div class="se-lane-head" id="battleLaneHead">${lastSkill||'星烬回响仍在战场中消散'}</div>
      <section class="side" id="side-enemy"><div class="team-label"><b id="lbl-enemy">敌方 · ${enemies.length}</b> · ENEMY</div><div class="row" data-side="enemy" data-row="1"></div><div class="row" data-side="enemy" data-row="0"></div></section>
      <section class="side" id="side-ally"><div class="row" data-side="ally" data-row="0"></div><div class="row" data-side="ally" data-row="1"></div><div class="team-label ally"><b id="lbl-ally">我方 · ${allies.length}</b> · ALLY</div></section>
      <canvas class="se-canvas" id="battleCanvas" aria-hidden="true"></canvas>
      <div class="se-fx" id="battleFx" aria-hidden="true"></div>
    </div>

    <div class="battle-controls m205-replay-controls"><button class="btn ghost compact" data-action="battleReplay">${battleTimer&&!battlePaused?'播放中':battleFrame>=maxIndex&&timeline.length>1?'从头播放':'播放战斗'}</button><button class="btn ghost compact" data-action="battlePause">${battlePaused?'继续':'暂停'}</button><button class="btn ghost compact" data-action="battleSpeed">×${ui.battleSpeed}</button><button class="btn primary compact" data-action="showResult">查看结算</button></div>
  </section>`
}
/* ============================================================================
   v2.2.5 动态编阵战斗界面 + 打斗特效
   模块：web/star-ember-battle.js（由 battle-preview.html 原型提炼）
   原则：战斗规则、数值、时间线全部仍由 game-data.js 产出，这里只负责"演出来"
   ========================================================================== */
let battleScene=null,battleFrames=[],battleSeenFrames=new Set();
const BATTLE_MOD=()=>window.StarEmberBattle;

/* 阵营共鸣 chips（读引擎 FACTION_BONUSES，只做展示，不叠加数值） */
function resonanceChips(){
  const count={};state.formation.forEach(id=>{const h=G.byId(id);if(h)count[h.faction]=(count[h.faction]||0)+1});
  return Object.entries(count).map(([f,n])=>{
    const conf=(G.FACTION_BONUSES||{})[f]||{},on=n>=2,tier=n>=3?conf.three:conf.two;
    const label=tier&&tier.label?String(tier.label).replace(/^[0-9]+人：/,''):'已激活';
    return `<span class="chip ${on?'on':'off'}"><i>✦</i><b>${f}×${n>=3?3:n>=2?2:1}</b><em>${on?label:'未激活'}</em></span>`;
  }).join('');
}
/* 角色的立绘数据：palette 来自引擎 HERO_VISUALS，保证配色与游戏一致 */
function battleHeroArt(h){
  const v=(G.HERO_VISUALS||{})[h.id]||{};
  return {name:h.name,pal:v.palette||['#f6d365','#6a5acd','#101426'],hair:v.hair||'',
    cls:G.combatClassForHero(h),role:h.role,tint:(v.palette||[])[0]||'#f0d18a'};
}
/* 我方上阵单位：前排（贴敌方）在前，后排在后 */
function battleAllyUnits(){
  return state.formation.filter(id=>state.heroes[id]&&G.byId(id)).map(id=>{
    const h=G.byId(id),z=G.computedStats(h,state.heroes[id],state),art=battleHeroArt(h);
    return {uid:'ally-'+id,id,name:h.name,rarity:h.rarity,role:h.role,faction:h.faction,
      hp:z.hp,maxHp:z.hp,shield:0,row:(state.formationRows?.[id]==='front'?0:1),
      isEnemy:false,tint:art.tint,art};
  }).sort((a,b)=>a.row-b.row||state.formation.indexOf(a.id)-state.formation.indexOf(b.id));
}
function battleEnemyUnits(src){
  return (src||[]).map((e,i)=>({
    uid:'enemy-'+e.id,id:e.id,name:e.name,rarity:e.isBoss?'ELITE':(i===0?'ELITE':'GRUNT'),role:'',faction:'裂境',
    hp:e.hp,maxHp:e.maxHp||e.hp,shield:e.shield||0,row:(e.row==='back'?1:0),isEnemy:true,isBoss:!!e.isBoss,
    tint:e.isBoss?'#ffd257':'#ff8f6b',
    art:{name:e.name,pal:e.isBoss?['#ffd257','#7c2d12','#1b0f14']:['#ff8f6b','#7c2d12','#1b0f14'],cls:'assault'}}));
}
const battleFxHigh=()=>ui.fxQuality!=='low';
function initBattleScene(){
  const M=BATTLE_MOD();if(!M)return null;
  const stage=document.getElementById('battleScene');if(!stage)return null;
  if(battleScene&&battleScene.stage===stage&&battleScene.fxHigh===battleFxHigh())return battleScene;
  if(battleScene){try{battleScene.dispose()}catch(e){}}
  battleScene=M.createLayer({stage,fxLayer:document.getElementById('battleFx'),
    canvas:document.getElementById('battleCanvas'),shakeHost:document.querySelector('.v218-app')||stage,fxHigh:battleFxHigh()});
  return battleScene;
}
/* 用当前帧把卡牌铺到舞台上（含实测收缩，保证 460px 窄列也不溢出） */
function paintBattleScene(frame){
  const M=BATTLE_MOD();if(!M)return null;
  const stage=document.getElementById('battleScene');if(!stage)return null;
  const layer=initBattleScene();if(!layer)return null;
  const f=frame||battleFrames[0]||{allies:[],enemies:[]};
  const allies=battleAllyUnits(),enemies=battleEnemyUnits(f.enemies);
  (f.allies||[]).forEach(a=>{const u=allies.find(x=>x.id===a.id);if(u){u.hp=a.hp;u.maxHp=a.maxHp||u.maxHp;u.shield=a.shield||0;u.row=a.row==='front'?0:u.row}});
  (f.enemies||[]).forEach(e=>{const u=enemies.find(x=>x.id===e.id);if(u){u.hp=e.hp;u.maxHp=e.maxHp||u.maxHp;u.shield=e.shield||0;u.row=e.row==='back'?1:0}});
  layer.setUnits(allies,enemies);
  M.renderFormation(stage,{allies,enemies,stageW:stage.clientWidth,stageH:stage.clientHeight,stage});
  if(M.computeLayout(stage.clientWidth,stage.clientHeight,allies.length,enemies.length).cw<52)stage.classList.add('se-tight');
  layer.syncAll();
  layer.resize();
  return layer;
}
/* 帧驱动：同步数值 → 按 effect 播特效 */
async function battleApplyFrame(index){
  const f=battleFrames[Math.min(index,battleFrames.length-1)];
  if(!f||!battleScene)return;
  (f.allies||[]).forEach(a=>{const u=battleScene.unitOf('ally-'+a.id);if(u){u.hp=a.hp;u.maxHp=a.maxHp||u.maxHp;u.shield=a.shield||0;u.downed=a.hp<=0}});
  (f.enemies||[]).forEach(e=>{const u=battleScene.unitOf('enemy-'+e.id);if(u){u.hp=e.hp;u.maxHp=e.maxHp||u.maxHp;u.shield=e.shield||0;u.downed=e.hp<=0}});
  const head=document.getElementById('battleLaneHead');if(head&&f.text)head.textContent=f.text;
  const before=battleFrames[Math.max(0,index-1)];
  if(f.actor&&f.actor.id&&f.effect&&!battleSeenFrames.has(index)){
    battleSeenFrames.add(index);
    const actorUid=(f.side==='a'?'ally-':'enemy-')+f.actor.id;
    await battleScene.playEffect(actorUid,battleFrameTargets(f,before),f.effect,f.text,f.side);
  }
  battleScene.syncAll();
}
/* 受击方：用与上一帧的血量/护盾差分推断，保证特效落在真正掉血的那张卡上 */
function battleFrameTargets(f,before){
  const pick=(cur,prev,prefix,test)=>cur.filter(c=>{const p=(prev||[]).find(x=>x.id===c.id);return p&&test(c,p)}).map(c=>prefix+c.id);
  let out=[...pick(f.enemies||[],before?.enemies||[],'enemy-',(c,p)=>c.hp<p.hp),...pick(f.allies||[],before?.allies||[],'ally-',(c,p)=>c.hp<p.hp)];
  if(!out.length)out=[...pick(f.allies||[],before?.allies||[],'ally-',(c,p)=>c.hp>p.hp),...pick(f.enemies||[],before?.enemies||[],'enemy-',(c,p)=>c.hp>p.hp)];
  if(!out.length)out=[...pick(f.allies||[],before?.allies||[],'ally-',(c,p)=>(c.shield||0)>(p.shield||0))];
  if(!out.length){const side=f.side==='a'?'enemy-':'ally-';out=[...battleScene.state.units.keys()].filter(u=>u.indexOf(side)===0).slice(0,1)}
  return out;
}
async function playBattleSummary(){
  if(battleTimer){clearInterval(battleTimer);battleTimer=null}
  const frames=(lastBattle?.timeline||[]).map(x=>({...x}));
  exploreViewMode='archive';battleFrame=0;resultOpen=false;render();focusBattleView();
  if(frames.length<=1||!BATTLE_MOD()||!document.getElementById('battleScene')){
    resultOpen=true;render();return;
  }
  battleFrames=frames;battleSeenFrames=new Set();
  paintBattleScene(frames[0]);
  const delay=Math.max(150,Math.round(620/(Number(ui.battleSpeed)||1)));
  let i=0;
  await battleApplyFrame(0);battleScene.syncAll();
  battleTimer=setInterval(async()=>{
    if(battlePaused)return;
    i++;
    if(i>=battleFrames.length){
      clearInterval(battleTimer);battleTimer=null;battleFrame=battleFrames.length-1;
      if(lastBattle&&lastBattle.win&&battleScene)battleScene.victory();
      setTimeout(()=>{resultOpen=true;render()},lastBattle&&lastBattle.win?1600:420);
      return;
    }
    battleFrame=i;
    const head=document.getElementById('battleLaneHead');const f=battleFrames[i];
    if(head&&f&&f.text)head.textContent=f.text;
    await battleApplyFrame(i);
  },delay);
}

async function quickFormation(){
  const rank={SSR:3,SR:2,R:1},owned=ownedList().sort((a,b)=>(rank[b.rarity]||0)-(rank[a.rarity]||0)||G.heroPower(b,state.heroes[b.id],state)-G.heroPower(a,state.heroes[a.id],state));
  if(!owned.length){toast('当前没有可编队契灵','error');return}
  const picks=owned.slice(0,5).map(x=>x.id),rows={};for(const id of picks){const cls=G.combatClassForHero(G.byId(id));rows[id]=['guard','assault'].includes(cls)?'front':'back'}
  const same=picks.length===state.formation.length&&picks.every((id,i)=>state.formation[i]===id)&&picks.every(id=>(state.formationRows?.[id]||'back')===rows[id]);if(same){toast('当前已是系统推荐阵容，无需调整','success');return}
  await action(async()=>{if(cloudMode){const d=await CLOUD.formation(picks,rows);state=G.migrate(d.state)}else{G.setFormation(state,picks,rows);persist()}toast(`快捷编队完成 · 战力 ${G.formationPower(state).toLocaleString()}`,'success')},'正在生成推荐阵容')
}
async function toggleFormationRow(id){if(!state.formation.includes(id))return;const rows={...(state.formationRows||{})};rows[id]=rows[id]==='front'?'back':'front';await action(async()=>{if(cloudMode){const d=await CLOUD.formation(state.formation,rows);state=G.migrate(d.state)}else{G.setFormation(state,state.formation,rows);persist()}toast(`${G.byId(id)?.name||'角色'}已调整至${rows[id]==='front'?'前排':'后排'}`)})}
function liveBattlePanel(){
  if(!liveSession||liveSession.status==='complete')return'';
  const p=liveSession.pending,bossUnit=liveSession.enemies.find(x=>x.isBoss),phase=liveSession.boss?.phase||bossUnit?.phase||1;
  const energy=u=>Math.max(0,Math.min(100,Math.round((Number(u.energy)||0)/Math.max(1,Number(u.skillCost)||100)*100)));
  const breakHtml=bossUnit?.breakMax?`<div class="v17-break-wrap m205-break ${bossUnit.breakWindow?'v18-break-window':''}"><div class="m205-break-head"><span>${bossUnit.breakWindow?'✦ BREAK WINDOW · 易伤 +35%':'BREAK 韧性'}</span><b>${bossUnit.breakGauge}/${bossUnit.breakMax}</b></div><div class="v17-breakbar"><i style="width:${Math.max(0,Math.min(100,bossUnit.breakGauge/bossUnit.breakMax*100))}%"></i></div><small>已击破 ${bossUnit.breakCount||0} 次</small></div>`:'';
  const status=(u)=>[u.silence?statusIcon('silence','沉默'):'',u.taunt?statusIcon('taunt','嘲讽'):'',u.stun?statusIcon('stun','眩晕'):''].filter(Boolean).join('');
  const unit=(u,side)=>{const h=side==='ally'?G.byId(u.id):null,hp=Math.max(0,Math.min(100,(Number(u.hp)||0)/Math.max(1,Number(u.maxHp)||1)*100)),canTarget=!!(p&&((p.targetMode==='enemy'&&side==='enemy')||(p.targetMode==='ally'&&side==='ally'))&&u.hp>0),row=side==='ally'?(state.formationRows?.[u.id]==='front'?'前排':'后排'):'';return `<button class="v15-targetable v14-live-unit m205-live-unit ${side} ${u.hp<=0?'down':''} ${selectedBattleTargetId===u.id?'targeted':''}" ${canTarget?`data-action="sessionTarget" data-id="${u.id}"`:''} ${!canTarget?'tabindex="-1"':''}>${h?portrait(h,'battle'):`<span class="m205-enemy-core ${u.isBoss?'boss':''}">${u.isBoss?'♛':'◆'}</span>`}<div class="m205-live-unit-copy"><div class="m205-live-name"><strong>${u.name}${u.isBoss?` · P${u.phase||phase}`:''}</strong>${row?`<em>${row}</em>`:''}</div><div class="v14-hp"><i style="width:${hp}%"></i></div><small>${Math.max(0,Math.round(u.hp||0))} / ${Math.round(u.maxHp||0)}${u.shield?` · 护盾 ${Math.round(u.shield)}`:''}</small><div class="m205-live-status">${status(u)}</div></div>${canTarget?'<span class="m205-target-mark">选择</span>':''}</button>`};
  const skills=liveSession.allies.map(u=>{const h=G.byId(u.id),ready=p?.heroId===u.id,eng=energy(u);return `<button class="v15-skill-slot m205-skill-slot ${ready?'ready':eng>0?'charging':''} ${u.hp<=0?'down':''}" ${ready?'data-action="sessionSkill"':''} data-id="${u.id}" style="--energy:${eng*3.6}deg"><span class="v15-energy-ring">${portrait(h,'battle')}</span><b>${h?.name||u.name}</b>${h?skillIcon(h.id,'v19-mini-skill'):''}<small>${h?.skill||''}${u.cooldownLeft?` · CD ${u.cooldownLeft}`:''}</small><em>${ready?'READY':`${eng}%`}</em></button>`}).join('');
  const selected=p?.targets?.find?.(x=>x.id===selectedBattleTargetId),targetLabel=p?.targetMode==='none'?'无需目标':selected?.name||'请选择目标';
  const targetHint=p?.targets?.length?`<div class="v15-target-hint m205-target-hint"><b>${p.targetMode==='enemy'?'选择攻击目标':'选择治疗目标'}</b><span>${targetLabel}</span></div>`:'';
  return `<section class="panel v14-live-session v15-live-session m205-live-battle m205-battle-focus">
    <div class="m205-battle-hud"><div><div class="kicker">LIVE BATTLE · ROUND ${liveSession.round}</div><h3>${liveSession.boss?`${liveSession.boss.name||bossUnit?.name||'Boss'} · PHASE ${phase}/3`:'手动技能战斗'}</h3></div><div class="m205-hud-actions"><span class="v14-session-state">${liveSession.status==='waiting'?'等待指令':'战斗推进'}</span><button class="m205-icon-btn" data-action="battleFullscreen" title="全屏">⛶</button><button class="m205-icon-btn danger" data-action="sessionCancel" title="撤离">×</button></div></div>
    ${breakHtml}
    ${targetHint}
    <div class="v14-live-field m205-live-field"><div class="m205-team-strip enemy">${liveSession.enemies.map(x=>unit(x,'enemy')).join('')}</div><div class="v14-live-star">✦</div><div class="m205-team-strip ally">${liveSession.allies.map(x=>unit(x,'ally')).join('')}</div></div>
    <div class="v15-skill-dock m205-skill-dock"><div class="m205-dock-head"><div><div class="kicker">SKILL DECK</div><b>技能充能</b></div><small>横向滑动查看全部契灵</small></div><div class="v15-skill-grid">${skills}</div></div>
    ${p?`<div class="v14-command v15-command m205-command-dock"><div class="v14-command-orb">✦</div><div class="m205-command-copy"><div class="kicker">SKILL READY · ${p.heroName} · 能量 ${Math.round((p.energy||0)/Math.max(1,p.skillCost||100)*100)}%</div><h3>${p.skill}</h3><p>${p.targetMode==='none'?'技能无需选择目标。':p.targetMode==='ally'?'点击上方我方角色选择治疗目标。':'点击上方敌方角色选择攻击目标。'}</p><strong class="m205-selected-target">目标：${targetLabel}</strong></div><div class="btnrow"><button class="btn ghost" data-action="sessionBasic">普通攻击</button><button class="btn primary" data-action="sessionSkill" ${(p.targetMode!=='none'&&!selectedBattleTargetId)?'disabled':''}>释放技能</button></div></div>`:'<div class="m205-live-wait">星轨推进中，正在等待下一名契灵充能完成…</div>'}
    <div class="m205-session-foot"><span>会话 ${liveSession.id.slice(-8)}</span><span>目标与技能由服务器校验</span><button class="text-btn" data-action="sessionCancel">撤离战斗</button></div>
  </section>`
}
function formationSummary(){return state.formation.map(id=>{const h=G.byId(id),p=state.heroes[id];return `<span class="formation-chip rarity-${h.rarity}">${h.name} Lv.${p.level}</span>`}).join('')}
function chapterRoad(){return `<div class="chapter-road">${G.CHAPTERS.map(c=>{const boss=G.bossByStage(c.range[1]),done=state.bossClears.includes(c.range[1]),active=state.stage>=c.range[0]&&state.stage<=c.range[1];return `<div class="chapter-node ${done?'done':active?'active':''}"><div class="node-index">${done?'✓':c.id}</div><div><strong>${c.name}</strong><small>${c.range[0]}-${c.range[1]} · Boss ${boss.name}</small></div></div>`}).join('')}</div>`}
/* 设计图(6)-01：章节列表页 —— 每章一行：编号 / 名称 / 主题 / 进度 / 状态 */
function chapterListPanel(){
  const cur=Math.min(30,Number(state.stage)||1);
  return `<section class="panel m222-chapter-list"><div class="section-title"><div><div class="kicker">CHAPTER ROUTE</div><h3>章节列表</h3></div><span class="loot-chip">Stage ${cur}/30</span></div>
    ${G.CHAPTERS.map(c=>{
      const boss=G.bossByStage(c.range[1]),done=state.bossClears.includes(c.range[1]);
      const total=c.range[1]-c.range[0]+1;
      const step=Math.max(0,Math.min(total,cur-c.range[0]+1));
      const active=!done&&cur>=c.range[0]&&cur<=c.range[1];
      const locked=!done&&!active;
      const pct=Math.round(step/total*100);
      return `<button class="m222-chapter-row ${done?'done':active?'active':'locked'}" data-action="chapterOpen" data-chapter="${c.id}" ${locked?'disabled':''}>
        <span class="m222-chapter-no">${done?'✓':c.id}</span>
        <span class="m222-chapter-copy"><b>第${c.id}章 · ${c.name}</b><small>${c.theme}</small>
          <span class="m222-chapter-bar"><i style="width:${pct}%"></i></span>
          <em>${c.range[0]}-${c.range[1]} · Boss ${boss?boss.name:''} · ${step}/${total}</em></span>
        <span class="m222-chapter-state">${done?'已通关':active?'进行中':'未解锁'}</span></button>`}).join('')}
  </section>`;
}
/* 设计图(6)-04：关卡详情 —— 奖励图标格 */
function rewardIconGrid(reward,title='通关奖励',note=''){
  const rows=rewardEntries(reward||{});
  if(!rows.length)return '';
  return `<div class="m222-reward-grid"><div class="m222-reward-head"><b>${title}</b>${note?`<span>${note}</span>`:''}</div>
    <div class="m222-reward-cells">${rows.slice(0,6).map(r=>`<div class="m222-reward-cell"><i>${r.icon}</i><b>+${r.value}</b><small>${r.name}</small></div>`).join('')}</div></div>`;
}
/* 提示词02 第4条：关卡详情面板 —— 关卡名/敌方信息/Boss标签/战力对比/克制提示/通关奖励/首通奖励/开始挑战 */
function stageDetailPanel(n){
  const ch=currentChapter(),current=Math.min(30,Number(state.stage)||1),power=G.formationPower(state);
  const boss=G.bossByStage(n),cleared=state.campaignCompleted||n<current,now=!state.campaignCompleted&&n===current,locked=!cleared&&!now;
  const foes=G.enemyTeam(n),rec=boss?Math.round(3500+boss.stage*520):null;
  const rewards={coin:350+n*40,tickets:n%5===0?2:1},first=boss?.firstReward||null;
  /* 己方职业构成（用于克制参考，克制关系来自引擎 COMBAT_CLASSES / CLASS_ADVANTAGE） */
  const myClasses=[...new Set((state.formation||[]).map(id=>{const h=G.byId(id);return h?G.combatClassInfo(G.combatClassForHero(h))?.name:null}).filter(Boolean))];
  const phases=G.BOSS_PHASES?.[n]||null;
  return `<section class="m222-stage-detail ${cleared?'is-cleared':now?'is-current':'is-locked'}" id="m222-stage-detail">
    <div class="m222-sd-head">
      <div><div class="kicker">STAGE ${ch.id}-${n-ch.range[0]+1}</div>
        <h4>${boss?boss.name:`第 ${n} 裂境`}</h4>
        <small>${cleared?'已通关':now?'当前目标 · 可挑战':'尚未解锁'}</small></div>
      <span class="m222-sd-state ${cleared?'done':now?'current':'locked'}">${cleared?'已通关':now?'当前目标':'未解锁'}</span>
    </div>
    <div class="m222-sd-sec"><b>敌方信息</b>
      <div class="m222-sd-foes">${foes.map(f=>`<span class="${f.isBoss?'boss':''}"><i>${f.isBoss?'♛':'✦'}</i><b>${f.name}</b><small>HP ${Number(f.hp).toLocaleString()}${f.atk?` · 攻 ${Number(f.atk).toLocaleString()}`:''}</small></span>`).join('')}</div>
      ${boss?`<div class="m222-sd-tags"><em class="boss">BOSS</em>${phases?`<em>${phases.length} 阶段</em>`:''}${boss.faction?`<em>${boss.faction}</em>`:''}</div>
        ${phases?`<div class="m222-sd-phases">${phases.map((x,i)=>`<span><i>${i+1}</i>${x}</span>`).join('')}</div>`:''}
        <p class="m222-sd-note">首领技能 · ${boss.skill||'未知'}</p>`:''}
    </div>
    <div class="m222-sd-sec"><b>战力对比</b>
      <div class="m222-sd-power"><span>当前战力 <b>${power.toLocaleString()}</b></span>
        ${rec?`<span>推荐战力 <b>${rec.toLocaleString()}</b><i>参考值 · 非硬门槛</i></span>`:'<span>推荐战力 <i>该关无推荐门槛</i></span>'}</div>
    </div>
    <div class="m222-sd-sec"><b>克制提示</b>
      <p class="m222-sd-note">克制 +18% · 被克制 −12%（${myClasses.length?`当前上阵：${myClasses.join(' / ')}`:'尚未编队'}）</p>
      <div class="m222-sd-chain"><span>⚔ 突击</span><b>→</b><span>✧ 术式</span><b>→</b><span>⌁ 控制</span><b>→</b><span>◇ 守御</span><b>→</b><span>⚔ 突击</span><em>✦ 支援中立</em></div>
    </div>
    ${locked?'':rewardIconGrid(rewards,'通关奖励',boss?'Boss 关额外掉落':'按关卡规则结算')}
    ${!locked&&first?rewardIconGrid(first,'首通奖励',state.bossClears.includes(n)?'已领取':'首次通关获得'):''}
    <div class="m222-sd-actions">
      <button class="btn ghost" data-action="stageDetailClose">收起</button>
      ${locked?`<button class="btn ghost" disabled>尚未解锁</button>`
        :cleared&&!state.campaignCompleted?`<button class="btn secondary" data-action="stageRoute" data-stage="${n}">前往扫荡</button>`
        :`<button class="btn primary" data-action="battle">${boss?'进入 Boss 战':'开始挑战'}</button>`}
    </div>
  </section>`;
}
function stageListPanel(){
  const ch=currentChapter(),power=G.formationPower(state),current=Math.min(30,Number(state.stage)||1);
  const stages=[];for(let n=ch.range[0];n<=ch.range[1];n++){const boss=G.bossByStage(n),cleared=state.campaignCompleted||n<current,now=!state.campaignCompleted&&n===current,locked=!cleared&&!now;stages.push(`<button class="m221-stage-row ${cleared?'cleared':now?'current':'locked'}" data-action="stageRoute" data-stage="${n}" ${locked?'disabled':''}><span class="m221-stage-index">${ch.id}-${n-ch.range[0]+1}</span><span class="m221-stage-copy"><b>${boss?boss.name:`第 ${n} 裂境`}</b><small>${boss?'BOSS · ':''}${cleared?'已通关 · ★★★':now?'当前目标':'尚未解锁'}</small></span><em>${cleared?'✓':now?'›':'🔒'}</em></button>`)}
  const boss=G.bossByStage(current),rec=boss?Number(boss.recommendedPower||boss.power||0):0;
  /* 提示词02 第4条：详情区展示"被点选的关卡"，默认跟随当前关卡 */
  const focusN=(stageDetailN!=null&&stageDetailN>=ch.range[0]&&stageDetailN<=ch.range[1])?stageDetailN:current;
  const detail=state.campaignCompleted?'':stageDetailPanel(focusN);
  const legacyReward={coin:350+current*40,tickets:current%5===0?2:1};
  return `<section class="panel m221-stage-panel"><div class="section-title"><div><div class="kicker">STAGE ROUTE</div><h3>${ch.name} · 关卡列表</h3></div><span class="loot-chip">${Math.max(0,Math.min(ch.range[1]-ch.range[0]+1,current-ch.range[0]))}/${ch.range[1]-ch.range[0]+1}</span></div><div class="m221-stage-list">${stages.join('')}</div>${detail}</section>`
}
function battleStrategyPanel(){const manual=ui.skillMode==='manual',strategy=G.AUTO_STRATEGIES?.[ui.autoStrategy]||G.AUTO_STRATEGIES?.balanced;return `<div class="panel v13-strategy v14-strategy v16-strategy m205-strategy"><div class="section-title"><div><div class="kicker">BATTLE CONTROL</div><h3>战斗模式</h3></div><button class="toggle ${manual?'on':''}" data-action="skillMode">${manual?'手动技能':'全自动'}</button></div><p class="small muted">${manual?'技能充能后暂停，由你选择目标并决定是否释放技能。':'自动完成战斗结算；策略决定技能和目标优先级。'}</p>${!manual?`<div class="v16-auto-strategies">${Object.entries(G.AUTO_STRATEGIES||{}).map(([id,x])=>`<button class="${ui.autoStrategy===id?'active':''}" data-action="autoStrategy" data-id="${id}"><b>${x.name}</b><small>${x.desc}</small></button>`).join('')}</div><div class="m205-strategy-current">当前策略：<b>${strategy?.name||'均衡'}</b></div>`:'<div class="v14-manual-note">✦ 充能完成后进入指令阶段；支持目标选择、断线恢复、沉默与嘲讽状态。</div>'}</div>`}
function replayPanel(){const rows=G.battleReplays?.(state)||[];return `<div class="panel v16-replays"><div class="section-title"><div><div class="kicker">BATTLE ARCHIVE</div><h3>最近战斗录像</h3></div><span class="small muted">最多保存 5 场 · 回放不重复结算</span></div>${rows.length?rows.map(r=>`<button class="v16-replay-row" data-action="replayOpen" data-id="${r.id}"><span>${r.win?'✦':'◇'} Stage ${r.stage}${r.boss?` · ${r.boss.name}`:''}</span><small>${r.skillMode==='manual'?'手动':'AUTO '+(G.autoStrategyInfo?.(r.autoStrategy)?.name||'均衡')} · ${new Date(r.createdAt).toLocaleString()}</small></button>`).join(''):'<div class="empty">完成一场战斗后会生成录像。</div>'}</div>`}
function battleStatsPanel(){const rows=lastBattle?.stats||liveSession?.stats||[];const combos=lastBattle?.combosUsed||liveSession?.combosUsed||[];return `<div class="panel v17-stats"><div class="section-title"><div><div class="kicker">BATTLE REPORT</div><h3>战斗统计</h3></div><span class="small muted">伤害 · 治疗 · 护盾</span></div>${rows.length?`<div class="v17-stat-grid">${rows.slice(0,6).map((x,i)=>`<div class="v17-stat-row"><b>#${i+1} ${x.name}</b><span>伤害 ${x.damage||0}</span><span>治疗 ${x.heal||0}</span><span>护盾 ${x.shield||0}</span><span>技能 ${x.skills||0}</span><span>连携 ${x.combo||0}</span></div>`).join('')}</div>`:'<div class="empty slim">完成战斗后显示本场贡献统计。</div>'}${combos.length?`<div class="v17-combos">连携技：${combos.map(id=>G.COMBO_SKILLS?.find(c=>c.id===id)?.name||id).join(' · ')}</div>`:''}</div>`}
function sweepPanel(){const info=G.sweepInfo(state),stage=state.campaignCompleted?30:Math.max(1,state.stage-1),can=state.campaignCompleted||state.stage>1;return `<div class="panel v18-sweep"><div class="section-title"><div><div class="kicker">EXPEDITION</div><h3>裂境扫荡</h3></div><span class="loot-chip">今日 ${info.left}/${info.limit}</span></div><p class="small muted">对已通关 Stage ${stage} 快速结算，不推进主线；可获得烬币、星铁和星痕点，高阶裂境还有概率掉落 SSR 装备与遗物。</p><div class="btnrow"><button class="btn secondary" data-action="sweep" data-count="1" ${!can||info.left<1?'disabled':''}>扫荡 ×1</button><button class="btn primary" data-action="sweep" data-count="5" ${!can||info.left<5?'disabled':''}>扫荡 ×5</button></div></div>`}
function explore(){
  const boss=currentBoss(),ch=currentChapter(),active=!!(liveSession&&liveSession.status!=='complete'),hasRecord=!!lastBattle,power=G.formationPower(state),a=dailyAttemptState();
  if(active)return `<section class="v218-screen v218-battle-screen">${liveBattlePanel()}<details class="panel m205-battle-drawer"><summary>战斗信息与设置</summary>${battleStrategyPanel()}${factionPanel()}</details></section>`;
  const heroTitle=state.campaignCompleted?'终焉王座 · 已稳定':boss?boss.name:`第 ${state.stage} 裂境`;
  const heroText=state.campaignCompleted?'主线已经完成。继续通过扫荡、资源裂境和活动积累养成资源。':boss?'章节 Boss 已抵达，确认阵容后发起挑战。':`推进至 Stage ${ch.range[1]}，击破章节 Boss。`;
  const start=state.campaignCompleted?`<button class="btn primary v218-hero-cta" data-action="exploreViewTab" data-view="archive">前往终章扫荡 <span>→</span></button>`:`<button class="btn primary v218-hero-cta" data-action="battle">${boss?'挑战章节 Boss':ui.skillMode==='manual'?'开始手动战斗':'开始主线战斗'} <span>→</span></button>`;
  const banner=`<section class="v218-explore-hero chapter-${ch.id}"><div class="v218-explore-visual"></div><div class="v218-explore-copy"><div class="kicker">CHAPTER ${ch.id} · ${ch.name}</div><h2>${heroTitle}</h2><p>${heroText}</p><div class="v218-explore-stats"><span>当前战力 <b>${power.toLocaleString()}</b></span><span>主线 <b>${Math.min(30,state.stage)}/30</b></span></div>${start}</div></section>`;
  const tabs=`<div class="v218-segment v218-explore-tabs"><button class="${exploreViewMode==='campaign'?'active':''}" data-action="exploreViewTab" data-view="campaign"><b>✦</b><span>主线章节</span><small>${ch.name}</small></button><button class="${exploreViewMode==='chapters'?'active':''}" data-action="exploreViewTab" data-view="chapters"><b>▤</b><span>章节列表</span><small>${Math.min(30,state.stage)}/30</small></button><button class="${exploreViewMode==='resource'?'active':''}" data-action="exploreViewTab" data-view="resource"><b>◆</b><span>资源裂境</span><small>${a.resourceLeft}/${a.resourceLimit} 次</small></button><button class="${exploreViewMode==='archive'?'active':''}" data-action="exploreViewTab" data-view="archive"><b>⚔</b><span>扫荡 / 记录</span><small>${a.sweep.left}/${a.sweep.limit} 次</small></button></div>`;
  const campaign=`<section class="v218-page-stack">${banner}<section class="panel v218-chapter-panel"><div class="section-title"><div><div class="kicker">CHAPTER ROUTE</div><h3>章节进度</h3></div><span class="loot-chip">Stage ${Math.min(30,state.stage)}</span></div>${stageListPanel()}<details class="m221-chapter-all"><summary>查看六章总览</summary>${chapterRoad()}</details></section>${battleStrategyPanel()}${factionPanel()}</section>`;
  const resource=`<section class="v218-page-stack"><section class="v218-section-title"><div><div class="kicker">RESOURCE RIFT</div><h2>资源裂境</h2><p>直接选择当前最缺的养成资源，次数独立刷新。</p></div><span>${a.resourceLeft}/${a.resourceLimit}</span></section>${resourcePanel()}</section>`;
  const record=hasRecord?`${battleArena()}${battleStatsPanel()}${battleLog.length?`<details class="panel m205-log-details"><summary>战斗记录 · ${battleLog.length} 条</summary><div class="battle-log">${battleLog.map((x,i)=>`<div class="${x.startsWith('⚠')?'boss-log':x.startsWith('✦')?'loot-log':i===battleLog.length-1?(x.startsWith('胜利')?'battle-win':x.startsWith('挑战失败')?'battle-loss':''):''}">${x}</div>`).join('')}</div></details>`:''}`:'';
  const archive=`<section class="v218-page-stack"><section class="v218-section-title"><div><div class="kicker">EXPEDITION</div><h2>扫荡与战斗档案</h2><p>重复获取已通关奖励，或复盘最近的战斗表现。</p></div><span>${a.sweep.left}/${a.sweep.limit}</span></section>${sweepPanel()}${record}${replayPanel()}</section>`;
  const chapters=`<section class="v218-page-stack">${chapterListPanel()}${chapterRoad()}</section>`;
  const content=exploreViewMode==='resource'?resource:exploreViewMode==='archive'?archive:exploreViewMode==='chapters'?chapters:campaign;
  return `<section class="v218-screen v218-explore-screen">${subpageHeader('▲','探索','章节、关卡与资源裂境')}${tabs}${content}${debugMode&&!cloudMode?`<div class="panel"><h3>开发者选项</h3><button class="btn ghost" data-action="reset">重置本地存档</button></div>`:''}</section>`
}
function bootOverlay(){return booting?`<div class="v10-boot m209-boot"><div class="v10-boot-stars"></div><div class="v10-boot-mark">✦</div><div class="v10-boot-title">星烬契约</div><div class="v10-boot-en">STAR EMBER CONTRACT</div><div class="v10-boot-line"></div><small>${bootMessage}</small><div class="m209-boot-progress"><i style="width:${Math.max(6,Math.min(100,bootProgress))}%"></i></div><em>${Math.round(bootProgress)}%</em></div>`:''}
function tutorialOverlay(){if(ui.tutorialDone||booting)return'';const steps=[{title:'欢迎，引星者',text:'这是功能介绍，不会替你完成任何任务。先从契约召唤开始认识核心入口。',cta:'前往契约'},{title:'缔结契约',text:'契灵印用于召唤。首次常驻十连会在真正确认消费后才开始。',cta:'下一步：认识契灵'},{title:'认识契灵',text:'每名契灵拥有阵营、职业和独立技能。升级、升星、觉醒会提升实战能力。',cta:'下一步：配置阵容'},{title:'编成星轨',text:'最多五人出战。前后排、职业克制与阵营共鸣都会影响战斗。',cta:'下一步：开始探索'},{title:'踏入裂境',text:'主线会先展示剧情与战斗过程，结束后进入胜负结算和奖励页。',cta:'完成导览'}],x=steps[Math.min(ui.tutorialStep,steps.length-1)];return `<div class="v10-modal-layer tutorial-layer"><div class="v10-tutorial"><div class="kicker">NEW VOYAGE · ${ui.tutorialStep+1}/${steps.length}</div><h2>${x.title}</h2><p>${x.text}</p><div class="v10-tutorial-orbit">✦</div><div class="btnrow"><button class="btn ghost" data-action="tutorialSkip">跳过</button><button class="btn primary" data-action="tutorialNext">${x.cta}</button></div></div></div>`}
function gachaRevealOverlay(){if(!revealOpen||!lastGacha.length)return'';const idx=Math.min(revealIndex,lastGacha.length-1),r=lastGacha[idx],h=r.hero,v=G.HERO_VISUALS[h.id]||{},total=lastGacha.length,rarity=h.rarity||'R',cinematic=ui.cinematicGacha!==false;const dots=total>1?`<div class="m210-reveal-progress">${lastGacha.map((x,i)=>`<i class="${i<idx?'done':i===idx?'active':''} rarity-${x.hero.rarity}"></i>`).join('')}</div>`:'';return `<div class="v10-modal-layer reveal-layer rarity-bg-${rarity} m210-reveal-layer rarity-${rarity} ${cinematic?'cinematic':'simple'}"><img class="v11-reveal-bg" src="${window.StarEmberAssets?.heroPortrait(h.id,true)||('assets/characters/'+(h.id==='h001'?'h001_full.jpg':h.id+'.jpg'))}" alt="" fetchpriority="high" decoding="async"/><div class="m210-reveal-particles"><i></i><i></i><i></i><i></i><i></i><i></i></div>${rarity==='SSR'?'<div class="m210-ssr-flare"></div>':''}<div class="v10-reveal-wheel v19-reveal-wheel" style="background-image:url('${window.StarEmberAssets?.bg('gacha-orbit')||'assets/ui/backgrounds/gacha-orbit.svg'}')"><div class="wheel-a"></div><div class="wheel-b"></div><span>✦</span></div><div class="m210-reveal-count">${idx+1}<small> / ${total}</small></div><div class="v10-reveal-card rarity-border-${rarity}">${portrait(h,'reveal')}<div class="v10-reveal-copy"><div class="kicker">${r.featured?'FEATURED · ':''}${rarity} CONTRACT</div><h2>${h.name}</h2><p>${v.title||h.faction+' · '+h.role}</p><div class="m210-reveal-tags"><span>${h.faction}</span><span>${h.role}</span><span>${r.duplicate?'DUPLICATE':'NEW'}</span>${r.featured?'<span class="up">UP</span>':''}</div><div class="stars">${stars(state.heroes[h.id]?.star||1)}</div><small>${r.duplicate?`重复契约 · 转化 ${r.fragmentsGained} 碎片`:'首次缔约 · 已加入契灵名册'}</small></div></div>${dots}<div class="v10-reveal-actions"><button class="btn ghost" data-action="revealClose">跳过全部</button><button class="btn primary" data-action="revealNext">${idx<total-1?`继续 · ${idx+1}/${total}`:'查看结果'}</button></div></div>`}
function gachaSummaryOverlay(){if(!gachaSummaryOpen||!lastGacha.length)return'';const ssr=lastGacha.filter(x=>x.hero.rarity==='SSR').length,sr=lastGacha.filter(x=>x.hero.rarity==='SR').length,newCount=lastGacha.filter(x=>!x.duplicate).length,frags=lastGacha.reduce((n,x)=>n+(Number(x.fragmentsGained)||0),0),limited=gachaPool==='limited',journey=journeyState(),growthNext=journey.next?.id==='growth';return `<div class="v10-modal-layer m211-gacha-summary-layer"><section class="m211-gacha-summary"><div class="m211-summary-head"><div><div class="kicker">CONTRACT COMPLETE · ${limited?'LIMITED':'STANDARD'}</div><h2>十连契约结果</h2><p>${ssr?`星轨回应强烈 · 获得 ${ssr} 名 SSR`:'本次契约已完成，保底进度已更新。'}</p></div><button class="v10-close" data-action="gachaSummaryClose">×</button></div><div class="m211-summary-stats"><span><small>SSR</small><b>${ssr}</b></span><span><small>SR</small><b>${sr}</b></span><span><small>NEW</small><b>${newCount}</b></span><span><small>碎片</small><b>+${frags}</b></span></div><div class="m211-ten-grid">${lastGacha.map((r,i)=>`<article class="m211-ten-card rarity-border-${r.hero.rarity} ${r.featured?'featured':''}">${portrait(r.hero,'result')}<i>${i+1}</i><span class="rarity-${r.hero.rarity}">${r.hero.rarity}</span><strong>${r.hero.name}</strong><small>${r.featured?'UP · ':''}${r.duplicate?`+${r.fragmentsGained} 碎片`:'NEW'}</small></article>`).join('')}</div>${growthNext?`<div class="m212-summary-next"><span>✦</span><div><b>下一步 · 培养主力</b><small>已自动推荐本次获得的高稀有契灵，升到 Lv.2 后再去编队。</small></div></div>`:''}<div class="m211-summary-actions"><button class="btn ${growthNext?'primary':'ghost'}" data-action="gachaSummaryHeroes">${growthNext?'培养契灵':'查看契灵'}</button>${frags?`<button class="btn ghost" data-action="dupOpen">重复获得 <small>+${frags} 碎片</small></button>`:''}<button class="btn secondary" data-action="gachaSummaryClose">完成</button><button class="btn ${growthNext?'ghost':'primary'}" data-action="gachaSummaryAgain" ${state.tickets<10?'disabled':''}>再次十连 <small>契灵印 ×10</small></button></div></section></div>`}
function bossIntroOverlay(){const boss=currentBoss();if(!bossIntroOpen||!boss)return'';const chapter=currentChapter();return `<div class="v10-modal-layer v11-boss-layer"><div class="v11-boss-intro"><div class="v20-boss-visual"><img src="${window.StarEmberAssets?.bossSplash?.(boss.stage)||window.StarEmberAssets?.boss(boss.stage)||`assets/ui/bosses/stage-${boss.stage}.svg`}" alt="${boss.name}"/></div><div class="kicker">CHAPTER ${chapter.id} · BOSS AWAKENING</div><h2>${boss.name}</h2><p>${boss.skill}</p><div class="v11-boss-threat"><span>参考战力 · 非硬门槛</span><strong>${Math.round(3500+boss.stage*520).toLocaleString()}</strong><small>当前 ${G.formationPower(state).toLocaleString()}</small></div><div class="btnrow"><button class="btn ghost" data-action="bossCancel">暂不挑战</button><button class="btn danger" data-action="bossChallenge">进入 Boss 战</button></div></div></div>`}
function currentStory(){return G.storyForStage?.(state.stage)||null}
function storyOverlay(){const st=currentStory();if(!storyOpen||!st)return'';const line=st.lines[Math.min(storyIndex,st.lines.length-1)],hero=line.heroId?G.byId(line.heroId):null;return `<div class="v10-modal-layer v12-story-layer"><div class="v12-story-scene">${hero?`<div class="v12-story-art">${portrait(hero,'story')}</div>`:'<div class="v12-story-star">✦</div>'}<div class="v12-story-chapter"><div class="kicker">CHAPTER ${st.chapter} · STORY</div><h2>${st.title}</h2></div><div class="v12-dialogue"><strong>${line.speaker}</strong><p>${line.text}</p><div class="btnrow"><button class="btn ghost" data-action="storySkip">跳过剧情</button><button class="btn primary" data-action="storyNext">${storyIndex<st.lines.length-1?'继续':'进入战斗'}</button></div></div></div></div>`}
function battleResultOverlay(){if(!resultOpen||!lastBattle)return'';const r=lastBattle,voiceHero=state.formation[0],stats=[...(r.stats||[])].sort((a,b)=>(Number(b.damage)||0)+(Number(b.heal)||0)+(Number(b.shield)||0)-((Number(a.damage)||0)+(Number(a.heal)||0)+(Number(a.shield)||0))),mvp=stats[0],nextStage=r.win?Math.min(30,Number(r.stage||1)+1):Number(r.stage||1),replay=!!r.replay,pending=utilityBadgeCounts().total,recover=recoveryAdvice(),journey=journeyState(),rewardNext=journey.next?.id==='reward',drops=r.drops||[],secondary=pending?`<button class="btn secondary" data-action="resultClaim">去领奖 ${pending}</button>`:drops.length?'<button class="btn secondary" data-action="resultGear">整理掉落</button>':voiceHero?`<button class="btn secondary" data-action="voice" data-id="${voiceHero}" data-voice="victory">胜利语音</button>`:'';return `<div class="v10-modal-layer v12-result-layer m211-result-layer"><section class="v12-result-card m211-result-card ${r.win?'victory':'defeat'}"><div class="m211-result-shine"></div><div class="v12-result-emblem">${r.win?'✦':'◇'}</div><div class="kicker">${r.win?'BATTLE COMPLETE':'RESONANCE LOST'} · STAGE ${r.stage}</div><h2>${r.win?'战斗胜利':'挑战失败'}</h2><p>${r.win?(Number(r.stage)>=30?'终焉王座已经稳定 · 六章主线完成':`裂境已稳定 · 下一目标 Stage ${nextStage}`):'阵容没有被清除，可按当前短板提升后再次挑战。'}</p><div class="m211-result-overview"><span><small>阵容战力</small><b>${Number(r.formationPower||0).toLocaleString()}</b></span><span><small>战斗模式</small><b>${r.skillMode==='manual'?'手动':'AUTO'}</b></span>${mvp?`<span class="mvp"><small>本场 MVP</small><b>${mvp.name}</b></span>`:''}</div>${r.win?`<div class="m211-result-loot"><div class="m211-loot-title"><b>战利品</b><span>${drops.length?'掉落会自动进入背包':'基础通关奖励'}</span></div><div class="v12-result-loot"><div><small>烬币</small><strong>+${r.rewards?.coin||0}</strong></div><div><small>契灵印</small><strong>+${r.rewards?.tickets||0}</strong></div>${drops.map(x=>`<div class="drop m213-drop"><small>${x.kind==='relic'?'遗物':'装备'}</small><strong class="rarity-${x.item.rarity}">${x.item.name}</strong><em>${dropUsageHint(x)}</em></div>`).join('')}</div>${drops.length?'<button class="text-btn m213-loot-route" data-action="resultGear">前往整备 · 查看掉落用途</button>':''}</div>${rewardNext?`<div class="m212-first-win"><span>✓</span><div><b>首战循环已打通</b><small>${pending?`事务所有 ${pending} 项可领取内容，领取后完成初航闭环。`:'继续推进或回大厅查看新的成长目标。'}</small></div></div>`:''}`:`<div class="m212-recovery"><span>◇</span><div><b>推荐 · ${recover.label}</b><small>${recover.text}</small></div><button class="btn secondary compact" data-action="resultRecover">按建议提升</button></div>`}${stats.length?`<details class="m211-result-stats"><summary>战斗统计 · 查看本场贡献</summary>${stats.slice(0,5).map((x,i)=>`<div><b>#${i+1} ${x.name}</b><span>伤害 ${x.damage||0}</span><span>治疗 ${x.heal||0}</span><span>护盾 ${x.shield||0}</span><span>技能 ${x.skills||0}</span><span>连携 ${x.combo||0}</span></div>`).join('')}</details>`:''}<div class="m211-result-actions">${replay?`<button class="btn primary wide" data-action="resultClose">关闭回放结算</button>`:r.win?`<button class="btn ghost" data-action="resultHome">返回大厅</button>${secondary}${Number(r.stage)>=30?'<button class="btn primary" data-action="resultHome">完成终章</button>':'<button class="btn primary" data-action="resultContinue">继续推进</button>'}`:`<button class="btn ghost" data-action="resultHome">返回大厅</button><button class="btn secondary" data-action="resultRecover">${recover.label}</button><button class="btn primary" data-action="resultRetry">再次挑战</button>`}</div></section></div>`}
function archiveOverlay(){if(!archiveOpen)return'';const id=archiveHeroId||selectedHeroId,h=G.byId(id),a=G.archiveForHero?.(id);if(!h||!a)return'';return `<div class="v10-modal-layer v13-archive-layer"><div class="v13-archive"><button class="v10-close" data-action="archiveClose">×</button><div class="v13-archive-art">${portrait(h,'archive')}</div><div class="v13-archive-copy"><div class="kicker">CONTRACT ARCHIVE · ${h.rarity}</div><h2>${h.name} <small>「${a.codename}」</small></h2><div class="v13-archive-tags"><span>${h.faction}</span><span>${h.role}</span><span>${a.affiliation}</span></div><p>${a.profile}</p><dl><dt>出身</dt><dd>${a.origin}</dd><dt>记忆片段</dt><dd>${a.memory}</dd><dt>偏好</dt><dd>${a.likes}</dd><dt>不擅长</dt><dd>${a.dislikes}</dd><dt>人物关系</dt><dd>${a.relation}</dd></dl><div class="btnrow"><button class="btn secondary" data-action="voice" data-id="${id}" data-voice="acquire">契约语音</button><button class="btn ghost" data-action="archiveClose">关闭档案</button></div></div></div></div>`}
function firstContractOverlay(){if(booting||ui.tutorialDone===false||ui.firstContractDone||state.newbieGacha?.claimed||tab!=='gacha')return'';return `<div class="v10-modal-layer v13-first-contract"><div class="v13-first-card"><div class="v13-first-orbit">✦</div><div class="kicker">FIRST CONTRACT</div><h2>完成你的第一次十连契约</h2><p>首次常驻十连必定获得至少 1 名 SSR。完成后，新手首契引导永久结束。</p><div class="loot-chip">当前契灵印 ${state.tickets} / 10</div><div class="btnrow"><button class="btn ghost" data-action="firstContractLater">稍后</button><button class="btn primary" data-action="firstContractStart" ${state.tickets<10?'disabled':''}>开始首契十连</button></div></div></div>`}
function moreOverlay(){if(!moreOpen)return'';const n=utilityBadgeCounts(),ev=eventStatus(),items=[['gacha','◎','契约召唤','限定 · 常驻 · 保底',navBadge('gacha')],['heroes','✦','契灵养成','等级 · 升星 · 天赋',''],['inventory','▣','整备','装备 · 遗物 · 锻造',''],['shop','¤','商店','星髓补给与资源兑换',''],['event','☾','活动','月蚀 · 讨伐 · 夜航',String(ev.eclipseLeft+ev.bossLeft+ev.nightLeft)],['hub','⌂','事务所','任务 · 邮件 · 账号',n.total?String(n.total):'']];return `<div class="m204-more-layer" data-action="moreClose"><section class="m204-more-sheet m207-more-sheet v216-more-sheet"><div class="m204-more-grab"></div><div class="section-title"><div><div class="kicker">QUICK DOCK</div><h2>快捷入口</h2></div><button class="v10-close" data-action="moreClose">×</button></div><div class="m204-more-grid">${items.map(([k,icon,name,desc,badge])=>`<button class="m204-more-item ${tab===k?'active':''}" data-tab="${k}"><b>${icon}</b><span><strong>${name}</strong><small>${desc}</small></span>${badge?`<em class="m207-menu-badge">${badge}</em>`:''}</button>`).join('')}</div><div class="m204-more-actions"><button class="btn ${cloudMode?'ghost':'secondary'}" data-action="cloud">${cloudMode?'刷新云存档':`☁ ${cloudActionLabel()}云端`}</button>${canOfferInstall()?'<button class="btn ghost" data-action="pwaInstall">▣ 安装到桌面</button>':''}<button class="btn ghost" data-action="settings">⚙ 设置</button></div><small class="m204-more-status">${cloudStatusNote()}</small></section></div>`}
function pwaUpdateOverlay(){if(!pwaUpdateReady)return'';return `<div class="m221-update-bar" role="status"><span class="m221-update-label"><b>发现新版本</b><small>更新不会丢失本地存档</small></span><button class="btn primary compact" data-action="pwaRefresh">立即刷新</button><button class="btn ghost compact" data-action="pwaLater">稍后</button></div>`}
function settingsOverlay(){if(!settingsOpen)return'';const n=networkProfile();return `<div class="v10-modal-layer"><div class="v10-settings m210-settings"><div class="section-title"><div><div class="kicker">SYSTEM</div><h2>设置</h2></div><button class="v10-close" data-action="settingsClose">×</button></div><div class="setting-row"><span>音效</span><button class="toggle ${ui.sound?'on':''}" data-action="toggleSound">${ui.sound?'开启':'关闭'}</button></div><div class="setting-row"><span>角色语音预览</span><button class="toggle ${ui.voice?'on':''}" data-action="toggleVoice">${ui.voice?'开启':'关闭'}</button></div><div class="setting-row"><span><b>触感反馈</b><small class="m209-setting-note">支持的手机会在抽卡、技能、暴击等关键操作产生轻微震动</small></span><button class="toggle ${ui.haptics?'on':''}" data-action="toggleHaptics">${ui.haptics?'开启':'关闭'}</button></div><div class="setting-row"><span><b>契约演出</b><small class="m209-setting-note">关闭后保留结果卡面，但减少旋转、粒子和闪光演出</small></span><button class="toggle ${ui.cinematicGacha?'on':''}" data-action="toggleCinematicGacha">${ui.cinematicGacha?'完整':'精简'}</button></div><div class="setting-row"><span>战斗演出速度</span><button class="toggle on" data-action="battleSpeed">×${ui.battleSpeed}</button></div><div class="setting-row"><span>视觉特效质量</span><button class="toggle on" data-action="fxQuality">${ui.fxQuality==='high'?'高':ui.fxQuality==='medium'?'中':'省电'}</button></div><div class="setting-row"><span><b>自动恢复云存档</b><small class="m209-setting-note">连接过云端后，下次打开自动恢复同一份进度</small></span><button class="toggle ${ui.cloudAutoConnect?'on':''}" data-action="toggleCloudAuto">${ui.cloudAutoConnect?'开启':'关闭'}</button></div><div class="setting-row"><span><b>网络状态</b><small class="m209-setting-note">${n.online?(weakNetwork()?'弱网 · 已降低预加载':'在线 · '+n.effectiveType):'离线 · 本地模式可继续'}</small></span>${canOfferInstall()?'<button class="toggle on" data-action="pwaInstall">安装到桌面</button>':'<span class="m209-setting-state">'+(isStandalone()?'桌面模式':'浏览器模式')+'</span>'}</div><div class="panel subtle m210-version-card"><b>v2.2.5 · 动态编阵战斗</b><p class="small muted">完整界面重构：手机框架、聚焦式分页、五大导航与大触控操作。</p></div></div></div>`}
function sweepResultOverlay(){if(!sweepResult)return'';const r=sweepResult,rows=rewardEntries(r.reward||{});return `<div class="v10-modal-layer v12-result-layer m221-sweep-result-layer" role="dialog" aria-modal="true" aria-label="扫荡完成"><section class="v12-result-card m221-sweep-result"><button class="v10-close" data-action="sweepResultClose" aria-label="关闭扫荡结果">×</button><div class="v12-result-emblem">↻</div><div class="kicker">EXPEDITION COMPLETE · STAGE ${r.stage}</div><h2>扫荡完成</h2><p>已完成 ${r.count} 次扫荡${Number.isFinite(r.left)?` · 今日剩余 ${r.left} 次`:''}</p><div class="m221-sweep-loot">${rows.map(x=>`<span><i>${x.icon}</i><b>${x.name}</b><strong>+${x.value}</strong></span>`).join('')||'<span><b>本次无基础资源</b></span>'}</div>${(r.drops||[]).length?`<div class="m221-sweep-drops">${r.drops.map(x=>`<span>${x.item?.name||'掉落'} · ${x.item?.rarity||''}</span>`).join('')}</div>`:''}<div class="m211-result-actions"><button class="btn ghost" data-action="sweepResultClose">确定</button><button class="btn primary" data-action="sweepResultAgain" data-count="${r.count}" ${Number.isFinite(r.left)&&r.left<r.count?'disabled':''}>再次扫荡 ×${r.count}</button></div></section></div>`}
function modalActive(){return !!(revealOpen||gachaSummaryOpen||sweepResult||storyOpen||bossIntroOpen||resultOpen||archiveOpen||returnOpen||pwaHelpOpen||moreOpen||settingsOpen||busy||duplicateReveal||gachaConfirm||levelMaxConfirm)}
/* 提示词11 修复：busy（加载遮罩）不是真正的模态 —— 它由 action() 在每次数据操作时
   短暂显示，如果把它也算作模态，scroll 锁会在每次点击时开合一次，
   造成"点一下界面就跳"。真正需要锁滚动的是会话型弹层。 */
function scrollLockTarget(){return !!(revealOpen||gachaSummaryOpen||sweepResult||storyOpen||bossIntroOpen||resultOpen||archiveOpen||returnOpen||pwaHelpOpen||moreOpen||settingsOpen||duplicateReveal||gachaConfirm||levelMaxConfirm)}
/* 提示词10：模态打开前记录 scrollY，关闭后恢复（避免锁滚动造成的横向跳/位置丢失） */
let lockedScrollY=0,modalWasOpen=false,preModalFocus=null;
function syncModalScrollLock(open){
  const body=(typeof document!=='undefined')?document.body:null;if(!body||!body.classList)return;
  if(open&&!modalWasOpen){
    lockedScrollY=(typeof window!=='undefined'?(window.scrollY||window.pageYOffset||0):0);
    preModalFocus=(typeof HTMLElement!=='undefined'&&document.activeElement instanceof HTMLElement)?document.activeElement:null;
    body.classList.add('modal-open');
    body.style.top=`-${lockedScrollY}px`;
    modalWasOpen=true;
  }else if(!open&&modalWasOpen){
    body.classList.remove('modal-open');
    body.style.top='';
    modalWasOpen=false;
    const y=lockedScrollY;
    if(typeof window!=='undefined')window.scrollTo({top:y,left:0,behavior:'auto'});
    /* 关闭后恢复焦点到触发元素（若仍存在） */
    if(preModalFocus&&document.contains(preModalFocus)){try{preModalFocus.focus({preventScroll:true})}catch{}}
    preModalFocus=null;
  }
}
function showMainNav(){return ['home','explore','formation','event','hub'].includes(tab)&&!modalActive()}
function nav(){const aliases={heroes:'formation',inventory:'formation',gacha:'home',shop:'home'},active=aliases[tab]||tab,items=[['home','首页','⌂'],['explore','探索','✦'],['formation','编队','♢'],['event','活动','☾'],['hub','事务所','▥']];return `<nav class="nav v09-nav m208-nav v216-nav v218-nav">${items.map(([k,n,icon])=>{const badge=k==='explore'?navBadge('explore'):k==='formation'?navBadge('formation'):k==='event'?((eventStatus().eclipseLeft+eventStatus().nightLeft)>0?badgeText(eventStatus().eclipseLeft+eventStatus().nightLeft):''):k==='hub'?(utilityBadgeCounts().total?badgeText(utilityBadgeCounts().total):''):'';return `<button class="${active===k?'active':''}" data-tab="${k}"><span class="nav-icon">${icon}</span><em>${n}</em>${badge?`<i class="m208-nav-badge">${badge}</i>`:''}</button>`}).join('')}</nav>`}
/* v2.2.4 QC-2c：render() 防重入。
   真机实测：点云存档失败时，action() 的 finally、markRemoteFailure 的 finally
   以及 busy 状态切换会在同一次调用栈里连续请求渲染，形成 render→bind→handler→render
   的自激循环，页面卡死（实测渲染进程 CPU 打满）。这里加一把同步重入锁：
   渲染进行中再次请求渲染直接返回，避免同栈自激；异步回调里的渲染不受影响。 */
let renderInFlight=false;
function render(){if(renderInFlight)return;renderInFlight=true;try{renderNow()}finally{renderInFlight=false}}
function renderNow(){const body=tab==='home'?home():tab==='heroes'?heroesView(false):tab==='gacha'?gachaView():tab==='formation'?heroesView(true):tab==='inventory'?inventoryView():tab==='shop'?shopView():tab==='event'?eventView():tab==='hub'?utilityView():explore();document.getElementById('app').innerHTML=`<main class="app v10-app v11-app v19-app v20-app v216-app v218-app fx-${ui.fxQuality} m210-release ${busy?'busy':''} ${tab==='explore'&&liveSession&&liveSession.status!=='complete'?'m205-battle-active':''}">${renderTop()}${pwaUpdateOverlay()}${networkStrip()}${cloudNudge()}<div class="m208-page m208-page-${tab}">${body}</div></main>${nav()}${bootOverlay()}${tutorialOverlay()}${gachaRevealOverlay()}${gachaSummaryOverlay()}${sweepResultOverlay()}${storyOverlay()}${bossIntroOverlay()}${battleResultOverlay()}${growthFeedbackOverlay()}${rewardFeedbackOverlay()}${archiveOverlay()}${firstContractOverlay()}${gachaConfirmOverlay()}${duplicateRevealOverlay()}${levelMaxConfirmOverlay()}${returnOverlay()}${pwaHelpOverlay()}${moreOverlay()}${settingsOverlay()}${busy?`<div class="loading m208-loading"><div class="m208-loading-card"><i></i><span>${busyMessage}</span><small>${cloudMode?'正在与星轨云端同步':'正在更新本地星轨'}</small></div></div>`:''}`;bind();document.body?.classList?.toggle?.('modal-open',modalActive());document.body?.classList?.toggle?.('busy-lock',!!busy);syncModalScrollLock(scrollLockTarget());document.querySelectorAll('.v10-modal-layer,.m204-more-layer,.m211-gacha-summary-layer,.m221-sweep-result-layer').forEach(el=>{el.setAttribute('role','dialog');el.setAttribute('aria-modal','true')});document.querySelectorAll('.v10-close').forEach(el=>{if(!el.getAttribute('aria-label'))el.setAttribute('aria-label','关闭')});document.querySelectorAll('.nav button').forEach(el=>{if(el.classList.contains('active'))el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});
  /* v2.2.5：编阵舞台每次渲染后重新对齐卡牌尺寸与画布，并回填当前帧数值 */
  if(document.getElementById('battleScene')&&window.StarEmberBattle){try{
    const cur=battleFrames[Math.min(Math.max(0,battleFrame),Math.max(0,battleFrames.length-1))];
    if(cur)paintBattleScene(cur);else initBattleScene();
  }catch(e){console.warn('[battle-layer]',e)}}}
function bind(){
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{if(busy)return;if(battleTimer){clearInterval(battleTimer);battleTimer=null;battlePaused=false}if(scrollLockTarget()&&!b.closest('.m204-more-layer,.v10-modal-layer,.m211-gacha-summary-layer,.v11-story-layer,.v11-boss-layer,.v12-result-layer,.v13-first-layer,.m209-return-layer,.m210-pwa-layer'))return;const next=b.dataset.tab,key=`tab:${next}`;if(!interactionAllowed(b,key,false))return;moreOpen=false;settingsOpen=false;gachaSummaryOpen=false;resultOpen=false;tab=next;markBadgeSeen(next);window.scrollTo?.(0,0);render()});
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.action,id=b.dataset.id,slot=b.dataset.slot,sig=b.dataset.sig,pool=b.dataset.pool,view=b.dataset.view,risky=new Set(['gacha1','gacha10','limited1','limited10','level','star','awaken','form','formationRow','presetSave','presetLoad','sweep','shopBuy','claimDaily','claimAll','claimWeekly','claimWeeklyAll','cloud','linkCreate','linkRedeem','equip','unequip','relic','relicClear','enhanceGear','resourceDungeon','claimAchievement','dismantle','forge','eventRun','eventBuy','giftBond','equipSig','claimMail','claimAllMail','eventBoss','nightRun','nightBuy','sessionSkill','sessionBasic','sessionCancel','bossChallenge','firstContractStart','gachaSummaryAgain','resultRetry']);const lockKey=`${a}:${id||''}:${slot||''}:${sig||''}:${pool||''}:${view||''}`;if(!interactionAllowed(b,lockKey,risky))return;sfx('tap');
    if(a==='sweepResultClose'){sweepResult=null;render()}else if(a==='sweepResultAgain'){const c=Number(b.dataset.count)||1;sweepResult=null;sweepRun(c)}else if(a==='gachaSummaryClose'){gachaSummaryOpen=false;render()}else if(a==='gachaSummaryHeroes'){gachaSummaryOpen=false;selectedHeroId=bestJourneyHeroId();tab='heroes';markBadgeSeen('heroes');window.scrollTo?.(0,0);render()}else if(a==='journeyGo'){const target=b.dataset.target||journeyState().next?.target||'home';if(target==='heroes')selectedHeroId=bestJourneyHeroId();if(target==='hub')utilityViewMode='daily';resultOpen=false;gachaSummaryOpen=false;moreOpen=false;tab=target;markBadgeSeen(target);window.scrollTo?.(0,0);render()}else if(a==='midgameGo'){routeToSystem(b.dataset.target||'home',b.dataset.view||'',b.dataset.focus||'',id||'')}else if(a==='taskGo'){const r=taskRoute(id);routeToSystem(b.dataset.target||r.target,'',b.dataset.focus||r.focus||'',r.heroId||'')}else if(a==='gachaSummaryAgain'){gachaSummaryOpen=false;if(gachaPool==='limited')limitedGacha(10);else gacha(10)}else if(a==='pwaRefresh'){pwaReloadPending=true;pwaWaitingWorker?.postMessage?.({type:'SKIP_WAITING'});if(!pwaWaitingWorker)location.reload()}else if(a==='pwaLater'){pwaUpdateReady=false;render()}else if(a==='pwaInstall'){installPwa()}else if(a==='pwaDismiss'){ui.installDismissed=true;saveUi();render()}else if(a==='pwaHelpClose'){pwaHelpOpen=false;render()}else if(a==='returnClose'){returnOpen=false;render()}else if(a==='returnDaily'){returnOpen=false;tab='hub';utilityViewMode='daily';window.scrollTo?.(0,0);render()}else if(a==='returnExplore'){returnOpen=false;tab='explore';window.scrollTo?.(0,0);render()}else if(a==='toggleCloudAuto'){ui.cloudAutoConnect=!ui.cloudAutoConnect;saveUi();render()}else if(a==='moreOpen'){moreOpen=true;render()}else if(a==='moreClose'){moreOpen=false;render()}else if(a==='exploreViewTab'){exploreViewMode=['campaign','chapters','resource','archive'].includes(view)?view:'campaign';render()}else if(a==='chapterOpen'){const cid=Number(b.dataset.chapter)||1;const c=G.CHAPTERS.find(x=>x.id===cid);if(c&&(state.bossClears.includes(c.range[1])||(state.stage>=c.range[0]&&state.stage<=c.range[1]))){exploreViewMode='campaign';window.scrollTo?.(0,0);render();setTimeout(()=>document.querySelector('.m221-stage-panel')?.scrollIntoView?.({behavior:'smooth',block:'start'}),80)}}else if(a==='heroViewTab'){heroViewMode=['overview','growth','talent','bond'].includes(view)?view:'overview';if(tab==='inventory'){tab='heroes';window.scrollTo?.(0,0)}render()}else if(a==='eventViewTab'){eventViewMode=['eclipse','boss','night','bond'].includes(view)?view:'eclipse';render()}else if(a==='hubViewTab'){utilityViewMode=['daily','goals','mail','notice','account'].includes(view)?view:'daily';render()}else if(a==='achFilter'){achFilter=ACH_CATS.some(x=>x[0]===b.dataset.filter)?b.dataset.filter:'all';render()}else if(a==='gachaPoolTab'){gachaViewPool=['standard','limited','newbie'].includes(pool)?pool:'standard';render()}else if(a==='gearSlot'){gearSlot=['weapon','armor','charm'].includes(slot)?slot:'weapon';render()}else if(a==='battleFullscreen'){toggleBattleFullscreen()}else if(a==='battleRecordClose'){clearInterval(battleTimer);battleTimer=null;battlePaused=false;lastBattle=null;battleLog=[];battleFrame=0;resultOpen=false;render()}else if(a==='gacha1'){gachaPool='standard';gachaConfirm={pool:'standard',count:1};render()}else if(a==='gacha10'){gachaPool='standard';gachaConfirm={pool:'standard',count:10};render()}else if(a==='limited1'){gachaConfirm={pool:'limited',count:1};render()}else if(a==='limited10'){gachaConfirm={pool:'limited',count:10};render()}else if(a==='gachaConfirmCancel'){gachaConfirm=null;render()}else if(a==='gachaConfirmOk'){const c=gachaConfirm;gachaConfirm=null;if(c){c.pool==='limited'?limitedGacha(c.count):(gachaPool='standard',gacha(c.count))}else render()}else if(a==='gachaRateToggle'){gachaShowRates=!gachaShowRates;render()}else if(a==='quickFormation')quickFormation();else if(a==='level')upgrade(id,'level');else if(a==='coinRoute'){exploreViewMode='resource';tab='explore';window.scrollTo?.(0,0);render();}else if(a==='star')upgrade(id,'star');else if(a==='form')toggleFormation(id);else if(a==='replaceSlot')replaceFormationSlot(id);else if(a==='replaceCancel'){replaceCandidateId=null;render()}else if(a==='formationRow')toggleFormationRow(id);else if(a==='talent')talentUnlock(id,b.dataset.node);else if(a==='eventShopCat'){eventShopCat=['all','ticket','material','other'].includes(b.dataset.cat)?b.dataset.cat:'all';render()}else if(a==='levelMax'){const pl=levelMaxPlan(id);if(!pl||pl.gained<1){toast('烬币不足，无法升级','error');return}levelMaxConfirm=id;render()}else if(a==='levelMaxCancel'){levelMaxConfirm=null;render()}else if(a==='levelMaxConfirm'){const hid=levelMaxConfirm;levelMaxConfirm=null;if(hid)upgradeMax(hid);else render()}else if(a==='autoEquip')autoEquipBest();else if(a==='unequipAll')unequipAll();else if(a==='dupOpen'){const d=lastGacha.filter(x=>x.duplicate);if(!d.length){toast('本次没有重复契灵','success');return}duplicateReveal={dups:d.slice(0,6),total:d.length,fragTotal:d.reduce((n,x)=>n+(Number(x.fragmentsGained)||0),0)};render()}else if(a==='dupClose'){duplicateReveal=null;render()}else if(a==='dupShop'){duplicateReveal=null;gachaSummaryOpen=false;tab='shop';window.scrollTo?.(0,0);render()}else if(a==='presetSlot'){ui.presetSlot=['1','2','3'].includes(b.dataset.slot)?b.dataset.slot:'1';saveUi();render()}else if(a==='presetSave')presetAction('save',slot);else if(a==='presetLoad')presetAction('load',slot);else if(a==='sweep')sweepRun(Number(b.dataset.count)||1);else if(a==='nightRun')nightRun(id);else if(a==='nightBuy')nightBuy(id);else if(a==='stageRoute'){const n=Number(b.dataset.stage)||0;
      const cleared=state.campaignCompleted||n<state.stage,now=!state.campaignCompleted&&n===state.stage,locked=!cleared&&!now;
      if(locked)return;
      /* 提示词02 交互：点击关卡行先看详情，不误触开战；再点一次才进入战斗/扫荡 */
      if(stageDetailN!==n){stageDetailN=n;render();setTimeout(()=>document.querySelector('#m222-stage-detail')?.scrollIntoView?.({behavior:'smooth',block:'center'}),60);return}
      if(now){const st=currentStory();if(st&&!state.storySeen?.includes(st.id)){storyOpen=true;storyIndex=0;render()}else if(currentBoss()){bossIntroOpen=true;render()}else battle()}
      else if(cleared){exploreViewMode='archive';window.scrollTo?.(0,0);render()}}
    else if(a==='stageDetailClose'){stageDetailN=null;render()}else if(a==='battle'){const st=currentStory();if(st&&!state.storySeen?.includes(st.id)){storyOpen=true;storyIndex=0;render()}else if(currentBoss()){bossIntroOpen=true;render()}else battle();}else if(a==='bossChallenge'){bossIntroOpen=false,storyOpen=false,storyIndex=0,resultOpen=false;battle()}else if(a==='bossCancel'){bossIntroOpen=false,storyOpen=false,storyIndex=0,resultOpen=false;render()}else if(a==='loginReward')claimLoginReward();else if(a==='claimDaily')claimDaily(id,false);else if(a==='claimAll')claimDaily('',true);else if(a==='claimWeekly')claimWeekly(id,false);else if(a==='claimWeeklyAll')claimWeekly('',true);else if(a==='shopBuy')shopBuy(id);else if(a==='cloud')(cloudMode?syncCloud():connectCloud());else if(a==='linkCreate')createLinkCode();else if(a==='linkCopy'){if(currentLink?.code){navigator.clipboard?.writeText?.(String(currentLink.code)).then(()=>toast('迁移码已复制','success')).catch(()=>toast('复制失败，请手动复制','error'))}}else if(a==='linkRedeem')redeemLinkCode();else if(a==='openGear'){selectedHeroId=id;tab='inventory';render()}else if(a==='selectHero'){selectedHeroId=id;render()}else if(a==='equip')setLoadout('gear',{heroId:selectedHeroId,itemId:id});else if(a==='unequip')setLoadout('unequip',{heroId:selectedHeroId,slot});else if(a==='relic')setLoadout('relic',{itemId:id});else if(a==='relicClear')setLoadout('relic',{itemId:null});else if(a==='enhanceGear')enhanceGear(id);else if(a==='resourceDungeon')resourceDungeon(id);else if(a==='claimAchievement')claimAchievement(id);else if(a==='dismantle')dismantleGear(id);else if(a==='forge')forgeGear(id);else if(a==='eventRun')runEvent(id);else if(a==='eventBuy')eventBuy(id);else if(a==='giftBond')giftBond(id);else if(a==='equipSig')setSignature(id,sig);else if(a==='awaken')awaken(id);else if(a==='claimMail')mailClaim(id,false);else if(a==='claimAllMail')mailClaim('',true);else if(a==='eventBoss')runEventBoss();else if(a==='leaderboard')refreshLeaderboard();else if(a==='battleReplay'){clearInterval(battleTimer);battlePaused=false;battleFrame=0;render();const frames=lastBattle?.timeline?.length||battleLog.length;battleTimer=setInterval(()=>{battleFrame++;const f=lastBattle?.timeline?.[battleFrame]||{},text=f.text||'';combatFeedback(text,f.effect||{});if(battleFrame>=frames-1){clearInterval(battleTimer);battleTimer=null;resultOpen=true}render()},Math.round(520/ui.battleSpeed))}else if(a==='battlePause'){if(battleTimer){clearInterval(battleTimer);battleTimer=null;battlePaused=true}else if(lastBattle?.timeline?.length&&battleFrame<lastBattle.timeline.length-1){battlePaused=false;const frames=lastBattle.timeline.length;battleTimer=setInterval(()=>{battleFrame++;const f=lastBattle?.timeline?.[battleFrame]||{};combatFeedback(f.text||'',f.effect||{});if(battleFrame>=frames-1){clearInterval(battleTimer);battleTimer=null;resultOpen=true}render()},Math.round(520/ui.battleSpeed))}render()}else if(a==='battle2x'){ui.battleSpeed=2;saveUi();battlePaused=false;render()}else if(a==='battleSpeed'){ui.battleSpeed=ui.battleSpeed===1?1.5:ui.battleSpeed===1.5?2:1;saveUi();render()}else if(a==='fxQuality'){ui.fxQuality=ui.fxQuality==='high'?'medium':ui.fxQuality==='medium'?'low':'high';saveUi();if(battleScene){battleScene.fxHigh=battleFxHigh();battleScene.resize()}render()}else if(a==='settings'){moreOpen=false;settingsOpen=true;render()}else if(a==='settingsClose'){settingsOpen=false;render()}else if(a==='toggleSound'){ui.sound=!ui.sound;saveUi();render()}else if(a==='toggleMusic'){ui.music=!ui.music;saveUi();render()}else if(a==='toggleVoice'){ui.voice=!ui.voice;saveUi();render()}else if(a==='toggleHaptics'){ui.haptics=!ui.haptics;saveUi();if(ui.haptics)haptic('rare');render()}else if(a==='toggleCinematicGacha'){ui.cinematicGacha=!ui.cinematicGacha;saveUi();render()}else if(a==='voice'){playVoice(id,b.dataset.voice||'acquire')}else if(a==='storySkip'){storyOpen=false;storyIndex=0;if(currentBoss()){bossIntroOpen=true;render()}else battle()}else if(a==='storyNext'){const st=currentStory();if(st&&storyIndex<st.lines.length-1){storyIndex++;render()}else{storyOpen=false;storyIndex=0;if(currentBoss()){bossIntroOpen=true;render()}else battle()}}else if(a==='showResult'){if(battleTimer){clearInterval(battleTimer);battleTimer=null;battlePaused=false}battleFrame=Math.max(0,(lastBattle?.timeline?.length||1)-1);resultOpen=true;render()}else if(a==='resultClose'){resultOpen=false;render()}else if(a==='resultHome'){resultOpen=false;tab='home';window.scrollTo?.(0,0);render()}else if(a==='resultGear'){resultOpen=false;tab='inventory';window.scrollTo?.(0,0);render()}else if(a==='resultRecover'){const rec=recoveryAdvice();resultOpen=false;if(rec.id)selectedHeroId=rec.id;tab=rec.target;window.scrollTo?.(0,0);render()}else if(a==='resultClaim'){resultOpen=false;utilityViewMode='daily';tab='hub';window.scrollTo?.(0,0);render()}else if(a==='resultRetry'){resultOpen=false;battle()}else if(a==='resultContinue'){resultOpen=false;tab=lastBattle?.win?'explore':'inventory';if(tab==='explore')exploreViewMode='campaign';window.scrollTo?.(0,0);render()}else if(a==='tutorialSkip'){ui.tutorialDone=true;saveUi();render()}else if(a==='tutorialNext'){const steps=['gacha','heroes','formation','explore'];if(ui.tutorialStep>=4){ui.tutorialDone=true;saveUi();tab='explore'}else{tab=steps[ui.tutorialStep]||'home';ui.tutorialStep++;saveUi()}render()}else if(a==='revealNext'){if(revealIndex<lastGacha.length-1){revealIndex++;const h=lastGacha[revealIndex]?.hero;sfx(h?.rarity==='SSR'?'rare':h?.rarity==='SR'?'gacha':'tap');if(h?.rarity==='SSR')screenPulse('win');if(h)playVoice(h.id,'acquire');render()}else{revealOpen=false;gachaSummaryOpen=lastGacha.length>=10;markBadgeSeen('gacha');render()}}else if(a==='revealClose'){revealOpen=false;gachaSummaryOpen=lastGacha.length>=10;markBadgeSeen('gacha');render()}else if(a==='archive'){archiveHeroId=id;archiveOpen=true;render()}else if(a==='archiveClose'){archiveOpen=false;archiveHeroId=null;render()}else if(a==='autoStrategy'){if(G.AUTO_STRATEGIES?.[id]){ui.autoStrategy=id;saveUi();toast(`AUTO策略：${G.AUTO_STRATEGIES[id].name}`);render()}}else if(a==='replayOpen'){const r=(G.battleReplays?.(state)||[]).find(x=>x.id===id);if(r){lastBattle={...r,replay:true};battleLog=[...(r.log||[])];battleFrame=0;resultOpen=false;toast(`载入 Stage ${r.stage} 战斗录像`);render()}}else if(a==='skillMode'){if(liveSession&&['running','waiting'].includes(liveSession.status)){toast('请先完成或撤离当前手动战斗');return}ui.skillMode=ui.skillMode==='auto'?'manual':'auto';saveUi();window.scrollTo?.(0,0);render()}else if(a==='sessionTarget'){selectedBattleTargetId=id;render()}else if(a==='sessionSkill'){commandLiveBattle('skill')}else if(a==='sessionBasic'){commandLiveBattle('basic')}else if(a==='sessionCancel'){cancelLiveBattle()}else if(a==='firstContractStart'){ui.firstContractDone=true;saveUi();gachaViewPool='standard';gachaPool='standard';gachaConfirm={pool:'standard',count:10};render()}else if(a==='firstContractLater'){ui.firstContractDone=true;saveUi();render()}else if(a==='reset'&&!cloudMode&&confirm('确定重置本地试玩进度吗？')){saves.reset();state=G.newPlayer('guest-'+Math.random().toString(36).slice(2,10));selectedHeroId='h004';lastGacha=[];battleLog=[];battleFrame=0;persist();tab='home';render()}
  })
  const linkInput=document.getElementById('linkCodeInput');if(linkInput)linkInput.oninput=()=>{linkCodeDraft=String(linkInput.value||'').replace(/\D/g,'').slice(0,6);if(linkInput.value!==linkCodeDraft)linkInput.value=linkCodeDraft};
  const moreSheet=document.querySelector('.m204-more-sheet');if(moreSheet)moreSheet.onclick=e=>e.stopPropagation();
}
persist();render();startBootSequence();if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js?v=2.2.5').then(reg=>{const ready=w=>{pwaWaitingWorker=w||reg.waiting;if(!pwaWaitingWorker)return;pwaUpdateReady=true;try{render()}catch{}};if(reg.waiting&&navigator.serviceWorker.controller)ready(reg.waiting);reg.addEventListener?.('updatefound',()=>{const w=reg.installing;w?.addEventListener?.('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)ready(w)})});try{reg.update()}catch{}}).catch(()=>{});navigator.serviceWorker?.addEventListener?.('controllerchange',()=>{if(pwaReloadPending)location.reload()});

const unlockAudio=()=>{try{if(!ui.sound)return;audioCtx||=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')void audioCtx.resume?.()}catch{}};window.addEventListener?.('pointerdown',unlockAudio,{once:true,passive:true});window.addEventListener?.('touchstart',unlockAudio,{once:true,passive:true});
window.addEventListener?.('beforeinstallprompt',e=>{e.preventDefault();pwaInstallPrompt=e;if(!ui.installDismissed&&!isStandalone())render()});
window.addEventListener?.('appinstalled',()=>{pwaInstallPrompt=null;ui.installDismissed=true;saveUi();toast('已安装到桌面','success');render()});
window.addEventListener?.('offline',()=>{networkOffline=true;render();toast('网络已断开，已切换到离线保护','error')});
window.addEventListener?.('online',()=>{networkOffline=false;render();toast('网络已恢复','success');if(cloudMode)void refreshCloudSilently('网络恢复');else if(ui.cloudAutoConnect)void restoreCloudSilently('网络恢复').then(ok=>{if(ok){render();toast('云存档已自动恢复','success')}})});
try{const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;connection?.addEventListener?.('change',()=>render())}catch{}
document.addEventListener?.('visibilitychange',()=>{if(document.visibilityState==='hidden'){lastHiddenAt=Date.now();return}if(lastHiddenAt&&Date.now()-lastHiddenAt>60000){if(cloudMode)void refreshCloudSilently('恢复前台');else if(ui.cloudAutoConnect)void restoreCloudSilently('恢复前台').then(ok=>ok&&render())}});
window.addEventListener?.('star-ember-preload-progress',e=>{if(!booting)return;const d=e.detail||{};bootProgress=Math.max(bootProgress,Math.max(12,Math.min(64,12+(Number(d.ratio)||0)*52)));bootMessage=d.reduced?'弱网模式 · 正在载入必要资源':`正在预载关键资源 ${d.loaded||0}/${d.total||0}`;render()});
window.addEventListener?.('star-ember-assets-ready',()=>{try{render()}catch{}});
