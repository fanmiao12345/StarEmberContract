window.STAR_EMBER_GAME = (()=>{


const HEROES = [
 {id:'h001',name:'夜岚',rarity:'SSR',faction:'曜庭',role:'强攻',skill:'断星斩',skillType:'burst',hp:1680,atk:245,def:92,spd:108},
 {id:'h002',name:'绯歌',rarity:'SSR',faction:'赤环',role:'术式',skill:'赤环坠火',skillType:'aoe',hp:1420,atk:272,def:76,spd:101},
 {id:'h003',name:'白砚',rarity:'SSR',faction:'镜海',role:'辅助',skill:'镜潮回响',skillType:'cleanseSupport',hp:1770,atk:178,def:112,spd:114},
 {id:'h004',name:'青禾',rarity:'SR',faction:'青原',role:'治疗',skill:'春息',skillType:'heal',hp:1540,atk:164,def:91,spd:105},
 {id:'h005',name:'司南',rarity:'SR',faction:'曜庭',role:'控制',skill:'引磁域',skillType:'stun',hp:1450,atk:186,def:88,spd:111},
 {id:'h006',name:'乌澜',rarity:'SR',faction:'镜海',role:'防御',skill:'深潮壁垒',skillType:'tauntShield',hp:1940,atk:145,def:132,spd:82},
 {id:'h007',name:'洛弥',rarity:'SR',faction:'赤环',role:'强攻',skill:'灼羽连袭',skillType:'multi',hp:1510,atk:218,def:83,spd:106},
 {id:'h008',name:'逐影',rarity:'SR',faction:'灰境',role:'刺击',skill:'无灯步',skillType:'execute',hp:1370,atk:231,def:74,spd:122},
 {id:'h009',name:'石钺',rarity:'R',faction:'青原',role:'防御',skill:'岩守',skillType:'selfShield',hp:1680,atk:122,def:118,spd:74},
 {id:'h010',name:'明砂',rarity:'R',faction:'赤环',role:'术式',skill:'砂焰',skillType:'aoeLite',hp:1210,atk:177,def:65,spd:95},
 {id:'h011',name:'渡鸦',rarity:'R',faction:'灰境',role:'刺击',skill:'黑羽',skillType:'executeLite',hp:1180,atk:184,def:62,spd:112},
 {id:'h012',name:'雪芒',rarity:'R',faction:'镜海',role:'控制',skill:'霜痕',skillType:'silence',hp:1280,atk:156,def:74,spd:101},
 {id:'h013',name:'墨灯',rarity:'R',faction:'曜庭',role:'辅助',skill:'引烬灯',skillType:'buff',hp:1330,atk:142,def:78,spd:99},
 {id:'h014',name:'阿洛',rarity:'R',faction:'青原',role:'强攻',skill:'疾木突',skillType:'burstLite',hp:1260,atk:172,def:71,spd:103},
 {id:'h015',name:'潮生',rarity:'R',faction:'镜海',role:'治疗',skill:'回潮',skillType:'healAll',hp:1400,atk:138,def:83,spd:96},
];

const EQUIPMENT = [
 {id:'eq001',name:'烬锋短刃',rarity:'R',slot:'weapon',desc:'残留着低温星烬的制式短刃。',stats:{atk:35}},
 {id:'eq002',name:'潮纹护甲',rarity:'R',slot:'armor',desc:'镜海工坊常见的防护甲片。',stats:{hp:220}},
 {id:'eq003',name:'曜石坠饰',rarity:'R',slot:'charm',desc:'能稳定契灵呼吸节奏的曜石饰物。',stats:{def:18}},
 {id:'eq004',name:'赤羽长刃',rarity:'SR',slot:'weapon',desc:'赤环执火者使用的高热长刃。',stats:{atk:70}},
 {id:'eq005',name:'镜潮战衣',rarity:'SR',slot:'armor',desc:'以镜海纤维编织，可缓冲裂境冲击。',stats:{hp:430,def:12}},
 {id:'eq006',name:'星轨徽章',rarity:'SR',slot:'charm',desc:'记录星轨偏移的精密徽章。',stats:{spd:7,def:10}},
 {id:'eq007',name:'断界星刃',rarity:'SSR',slot:'weapon',desc:'传说能在裂境边缘留下永久切痕。',stats:{atk:125,spd:5}},
 {id:'eq008',name:'深海圣甲',rarity:'SSR',slot:'armor',desc:'由镜海深层遗物重铸而成。',stats:{hp:720,def:28}},
 {id:'eq009',name:'灰境时针',rarity:'SSR',slot:'charm',desc:'指针从不指向现实中的任何时间。',stats:{spd:13,atk:40}},
 {id:'eq010',name:'巡星刃',rarity:'SR',slot:'weapon',set:'starpath',desc:'巡星者套装武器，以轻量星轨合金锻造。',stats:{atk:82,spd:2}},
 {id:'eq011',name:'巡星衣',rarity:'SR',slot:'armor',set:'starpath',desc:'巡星者套装护甲，适合高速穿越裂境。',stats:{hp:470,def:14}},
 {id:'eq012',name:'巡星徽',rarity:'SR',slot:'charm',set:'starpath',desc:'巡星者套装饰物，可稳定短时星轨偏移。',stats:{spd:8,atk:18}},
 {id:'eq013',name:'寂潮刃',rarity:'SSR',slot:'weapon',set:'silenttide',desc:'从无声潮汐中重铸的黑蓝长刃。',stats:{atk:138,def:10}},
 {id:'eq014',name:'寂潮圣甲',rarity:'SSR',slot:'armor',set:'silenttide',desc:'寂潮套装核心甲胄，表面没有任何回声。',stats:{hp:790,def:34}},
 {id:'eq015',name:'寂潮镜',rarity:'SSR',slot:'charm',set:'silenttide',desc:'能映出裂境另一侧潮汐的古镜。',stats:{atk:48,spd:14}},
];

const RELICS = [
 {id:'r001',name:'烬心灯',rarity:'R',desc:'全队攻击 +4%',bonus:{atkPct:.04}},
 {id:'r002',name:'潮汐核',rarity:'SR',desc:'全队生命 +8%',bonus:{hpPct:.08}},
 {id:'r003',name:'曜星罗盘',rarity:'SR',desc:'全队速度 +5',bonus:{spdFlat:5}},
 {id:'r004',name:'断界王印',rarity:'SSR',desc:'全队攻击 +10%，生命 +8%',bonus:{atkPct:.10,hpPct:.08}},
 {id:'r005',name:'镜海圣瓶',rarity:'SSR',desc:'开战时获得最大生命 12% 的护盾',bonus:{startShieldPct:.12}},
 {id:'r006',name:'灰烬沙漏',rarity:'SSR',desc:'全队速度 +9，防御 +8%',bonus:{spdFlat:9,defPct:.08}},
];

const BOSSES = [
 {stage:5,chapter:1,name:'焚砂巨像',faction:'赤环',skill:'熔核践踏',skillType:'bossAoe',hp:6200,atk:330,def:145,spd:78,firstReward:{equipment:'eq004'}},
 {stage:10,chapter:2,name:'镜潮守望者',faction:'镜海',skill:'镜潮回响',skillType:'bossShield',hp:9800,atk:430,def:220,spd:92,firstReward:{relic:'r002'}},
 {stage:15,chapter:3,name:'无灯猎王',faction:'灰境',skill:'猎影突袭',skillType:'bossExecute',hp:13800,atk:570,def:250,spd:126,firstReward:{equipment:'eq005'}},
 {stage:20,chapter:4,name:'星陨裁决者',faction:'曜庭',skill:'星轨裁决',skillType:'bossStun',hp:19000,atk:720,def:330,spd:108,firstReward:{relic:'r003'}},
 {stage:25,chapter:5,name:'裂空古兽',faction:'青原',skill:'裂空咆哮',skillType:'bossAoe',hp:26000,atk:890,def:410,spd:104,firstReward:{equipment:'eq007'}},
 {stage:30,chapter:6,name:'灰烬王座',faction:'灰境',skill:'终焉星坠',skillType:'bossFinal',hp:36000,atk:1120,def:520,spd:118,firstReward:{relic:'r004'}},
];

const BOSS_PHASES = {
 5:['熔核苏醒','赤砂暴走','巨像熔毁'],
 10:['镜潮巡弋','回声折返','深潮镜界'],
 15:['猎影潜行','无灯追猎','终夜收割'],
 20:['裁决待机','星轨超载','终端裁决'],
 25:['裂空低鸣','断层震怒','古兽狂潮'],
 30:['王座静默','灰烬加冕','终焉降临'],
};
const BOSS_PHASE_SKILLS = {
 5:{2:{name:'灼砂咆哮',mult:.72,status:'silence',chance:.28},3:{name:'熔核禁域',mult:1.02,status:'silence',chance:.48}},
 10:{2:{name:'反照潮镜',mult:.64,shieldPct:.08},3:{name:'镜海封言',mult:.82,status:'silence',chance:.42}},
 15:{2:{name:'无灯标记',mult:1.55,target:'lowest'},3:{name:'终夜收割',mult:2.15,target:'lowest'}},
 20:{2:{name:'裁决静默',mult:.72,status:'silence',chance:.35},3:{name:'绝对裁决',mult:.94,status:'stun',chance:.30}},
 25:{2:{name:'断层震荡',mult:.74,status:'slow',chance:.55},3:{name:'裂空怒潮',mult:1.06,status:'slow',chance:.75}},
 30:{2:{name:'王座敕令',mult:.88,status:'silence',chance:.45},3:{name:'终焉诏令',mult:1.18,status:'silence',chance:.70}},
};
const AUTO_STRATEGIES={balanced:{name:'均衡',desc:'稳定释放技能，兼顾输出与生存。'},burst:{name:'爆发',desc:'单体技能优先压低血量目标，快速形成击杀。'},survival:{name:'生存',desc:'治疗、护盾与净化优先，低血量时减少冒进。'}};

const SKILL_RULES={
 h001:{cost:100,gain:38,cooldown:1,range:'any'},h002:{cost:105,gain:36,cooldown:2,range:'any'},h003:{cost:100,gain:34,cooldown:2,range:'any'},
 h004:{cost:90,gain:40,cooldown:2,range:'any'},h005:{cost:95,gain:40,cooldown:2,range:'any'},h006:{cost:90,gain:36,cooldown:2,range:'front'},
 h007:{cost:90,gain:42,cooldown:1,range:'front'},h008:{cost:85,gain:44,cooldown:1,range:'any'},h009:{cost:85,gain:38,cooldown:2,range:'front'},
 h010:{cost:90,gain:38,cooldown:1,range:'any'},h011:{cost:85,gain:42,cooldown:1,range:'any'},h012:{cost:90,gain:38,cooldown:2,range:'any'},
 h013:{cost:90,gain:38,cooldown:2,range:'any'},h014:{cost:85,gain:42,cooldown:1,range:'front'},h015:{cost:90,gain:40,cooldown:2,range:'any'}
};
const COMBO_SKILLS=[
 {id:'starSever',name:'星轨断界',members:['h001','h005'],type:'damage',desc:'夜岚与司南同时校准星轨，对敌方全体造成连携伤害并大幅削韧。'},
 {id:'mirrorTide',name:'镜海共潮',members:['h003','h006'],type:'support',desc:'白砚与乌澜共鸣镜海潮汐，为全队恢复生命并生成护盾。'},
 {id:'redWing',name:'赤羽焚天',members:['h002','h007'],type:'damage',desc:'绯歌与洛弥引燃赤羽轨迹，对敌方全体造成高额火焰伤害。'}
];
const BOSS_BREAK_RULES={5:110,10:130,15:150,20:170,25:190,30:220};
const ROLE_CLASS={'强攻':'assault','刺击':'assault','术式':'arcane','控制':'control','防御':'guard','辅助':'support','治疗':'support'};
const COMBAT_CLASSES={
 assault:{name:'突击',icon:'⚔',strong:'arcane',desc:'克制术式'},
 arcane:{name:'术式',icon:'✧',strong:'control',desc:'克制控制'},
 control:{name:'控制',icon:'⌁',strong:'guard',desc:'克制守御'},
 guard:{name:'守御',icon:'◇',strong:'assault',desc:'克制突击'},
 support:{name:'支援',icon:'✦',strong:null,desc:'无克制关系'}
};
const CLASS_ADVANTAGE=1.18,CLASS_DISADVANTAGE=.88;
const TALENT_COSTS=[1,2,3];
const TALENT_TREES=Object.fromEntries(HEROES.map(h=>[h.id,[
 {id:'root',name:'星息共鸣',cost:1,requires:null,desc:'基础生命 +5%',bonus:{hpPct:.05}},
 {id:'edge',name:'星轨锋芒',cost:2,requires:'root',desc:'基础攻击 +6%',bonus:{atkPct:.06}},
 {id:'core',name:`${h.skill}·本命`,cost:3,requires:'edge',desc:({'强攻':'技能伤害 +12%','刺击':'斩杀伤害 +14%','术式':'技能伤害 +10%','控制':'效果命中 +12%','防御':'防御 +10%，护盾 +10%','辅助':'治疗/护盾 +12%','治疗':'治疗 +14%'})[h.role]||'核心能力强化',bonus:h.role==='防御'?{defPct:.10,shieldPct:.10}:h.role==='治疗'?{healPct:.14}:h.role==='辅助'?{healPct:.12,shieldPct:.12}:h.role==='控制'?{effectPct:.12}:h.role==='刺击'?{skillPct:.14}:h.role==='术式'?{skillPct:.10}:{skillPct:.12}}
]]));
const SWEEP_DAILY_LIMIT=10;
const NIGHT_EVENT_CONFIG={id:'starHarborNight',name:'星港夜航',currencyName:'航星徽',subtitle:'第二限定活动 · 护送星港列车穿越流光风暴'};
const NIGHT_EVENT_STAGES=[
 {id:'N1',name:'暮色站台',power:2400,reward:{voyageBadge:45,coin:650},first:{talentPoints:1}},
 {id:'N2',name:'流光隧道',power:3800,reward:{voyageBadge:60,starIron:25},first:{starCrystal:80}},
 {id:'N3',name:'断轨列车',power:5600,reward:{voyageBadge:80,coin:1000},first:{talentPoints:1}},
 {id:'N4',name:'星港风暴眼',power:7600,reward:{voyageBadge:110,starCrystal:70},first:{tickets:2}},
 {id:'N5',name:'夜航终点',power:9800,reward:{voyageBadge:160,forgeDust:100},first:{talentPoints:2,tickets:2}},
];
const NIGHT_EVENT_SHOP=[
 {id:'talent',name:'星痕点',cost:90,reward:{talentPoints:1},limit:4},
 {id:'core',name:'觉醒核心',cost:180,reward:{awakeningCore:1},limit:2},
 {id:'ticket',name:'契灵印',cost:130,reward:{tickets:1},limit:4},
 {id:'soul',name:'夜岚碎片',cost:150,reward:{heroId:'h001',fragments:15},limit:3},
];



const CHAPTERS = [
 {id:1,name:'焚砂边界',range:[1,5],theme:'赤色砂海与第一次裂境暴走'},
 {id:2,name:'镜潮旧港',range:[6,10],theme:'沉没港区中回响的旧日信号'},
 {id:3,name:'无灯长夜',range:[11,15],theme:'灰境猎手盘踞的永夜走廊'},
 {id:4,name:'曜庭残环',range:[16,20],theme:'星轨失衡后的裁决遗迹'},
 {id:5,name:'青原断层',range:[21,25],theme:'巨兽苏醒后的浮空断层'},
 {id:6,name:'终焉王座',range:[26,30],theme:'裂潮源点与最终王座'},
];


const RESOURCE_DUNGEONS = [
 {id:'coin',name:'烬币矿脉',desc:'稳定产出角色升级所需烬币。',attempts:2,reward:{coin:1800},power:1200,icon:'◈'},
 {id:'forge',name:'星铁熔炉',desc:'产出装备强化材料「星铁」。',attempts:2,reward:{starIron:45},power:1800,icon:'◆'},
 {id:'crystal',name:'星髓回廊',desc:'产出星髓，用于后续商店与活动兑换。',attempts:2,reward:{starCrystal:90},power:2500,icon:'✦'},
];

const ACHIEVEMENTS = [
 {id:'own5',name:'初具规模',desc:'契约 5 名不同角色',type:'heroCount',goal:5,reward:{tickets:2}},
 {id:'own10',name:'群星汇聚',desc:'契约 10 名不同角色',type:'heroCount',goal:10,reward:{tickets:5}},
 {id:'firstSSR',name:'金色契约',desc:'首次获得 SSR 契灵',type:'ssrCount',goal:1,reward:{starCrystal:180}},
 {id:'stage10',name:'越过镜潮',desc:'主线推进至第 10 关',type:'stage',goal:10,reward:{tickets:3}},
 {id:'stage20',name:'重返曜庭',desc:'主线推进至第 20 关',type:'stage',goal:20,reward:{tickets:5}},
 {id:'boss3',name:'裂境猎手',desc:'击破 3 名章节 Boss',type:'bossCount',goal:3,reward:{coin:3000}},
 {id:'gear5',name:'精工整备',desc:'任意装备强化至 +5',type:'maxEnhance',goal:5,reward:{starCrystal:120}},
 {id:'power8000',name:'星烬成军',desc:'阵容战力达到 8000',type:'power',goal:8000,reward:{tickets:4}},
 {id:'forge1',name:'第一炉星火',desc:'完成 1 次装备锻造',type:'craftedCount',goal:1,reward:{starCrystal:120}},
 {id:'bond3',name:'星语相知',desc:'任意契灵好感达到 3 级',type:'maxBondLevel',goal:3,reward:{tickets:2}},
 {id:'event6',name:'月蚀尽头',desc:'通关月蚀回廊 6 个活动关卡',type:'eventClears',goal:6,reward:{bondGift:2}},
];

const HERO_VISUALS = {
 h001:{title:'曜庭断星使',palette:['#f6d365','#6a5acd','#101426'],hair:'银黑短发',weapon:'折光长刀',motif:'金色星轨与断裂光环'},
 h002:{title:'赤环焚歌者',palette:['#ff6b6b','#c2416c','#241126'],hair:'深红长发',weapon:'环刃法器',motif:'灼热羽片与赤色环火'},
 h003:{title:'镜海谕潮师',palette:['#9cecfb','#65c7f7','#16304a'],hair:'雪白长发',weapon:'悬浮镜片',motif:'水镜、潮纹与冷色星光'},
 h004:{title:'青原春息医师',palette:['#7ee8a2','#5fb49c','#163126'],hair:'墨绿双辫',weapon:'藤木药杖',motif:'嫩芽、萤光与轻盈布带'},
 h005:{title:'曜庭引磁官',palette:['#ffe08a','#6d83f2','#181b3a'],hair:'蓝黑高马尾',weapon:'磁轨圆盘',motif:'几何星盘与电磁线圈'},
 h006:{title:'镜海潮盾卫',palette:['#7dd3fc','#2563eb','#10233d'],hair:'深蓝短发',weapon:'重型潮盾',motif:'厚甲、海潮折线与透明护壁'},
 h007:{title:'赤环灼羽剑士',palette:['#fb7185','#f59e0b','#35151c'],hair:'橙红短发',weapon:'双刃',motif:'火羽与高速残影'},
 h008:{title:'灰境无灯客',palette:['#c4b5fd','#64748b','#0f1020'],hair:'灰紫长发',weapon:'影刃',motif:'黑雾、月牙与低饱和冷光'},
 h009:{title:'青原岩卫',palette:['#86efac','#6b8e5a','#252d23'],hair:'棕色寸发',weapon:'岩钺',motif:'岩层与苔纹'},
 h010:{title:'赤环砂术师',palette:['#fdba74','#ef4444','#321812'],hair:'沙金短发',weapon:'砂焰瓶',motif:'沙流与细小火星'},
 h011:{title:'灰境黑羽斥候',palette:['#a78bfa','#475569','#10111a'],hair:'黑灰碎发',weapon:'羽刃',motif:'鸦羽与消散阴影'},
 h012:{title:'镜海霜痕使',palette:['#bae6fd','#93c5fd','#162537'],hair:'冰蓝长发',weapon:'霜晶针',motif:'霜花与细线冰晶'},
 h013:{title:'曜庭引烬灯师',palette:['#fde68a','#8b5cf6','#21172e'],hair:'浅金卷发',weapon:'星烬提灯',motif:'灯火与悬浮符片'},
 h014:{title:'青原疾木枪手',palette:['#bbf7d0','#4ade80','#163322'],hair:'青棕短发',weapon:'木枪',motif:'叶片与风痕'},
 h015:{title:'镜海回潮医者',palette:['#a5f3fc','#38bdf8','#102a38'],hair:'湖蓝短发',weapon:'潮汐铃',motif:'水滴、波纹与柔光'},
};

const FACTION_BONUSES = {
 '曜庭':{two:{atkPct:.06,label:'2人：攻击 +6%'},three:{spdPct:.05,label:'3人：速度 +5%'}},
 '赤环':{two:{atkPct:.07,label:'2人：攻击 +7%'},three:{hpPct:.06,label:'3人：生命 +6%'}},
 '镜海':{two:{hpPct:.08,label:'2人：生命 +8%'},three:{defPct:.10,label:'3人：防御 +10%'}},
 '青原':{two:{defPct:.08,label:'2人：防御 +8%'},three:{hpPct:.10,label:'3人：生命 +10%'}},
 '灰境':{two:{spdPct:.06,label:'2人：速度 +6%'},three:{atkPct:.08,label:'3人：攻击 +8%'}},
};

const byId = id => HEROES.find(h => h.id === id);
const equipmentById = id => EQUIPMENT.find(x=>x.id===id);
const relicById = id => RELICS.find(x=>x.id===id);
const signatureById = id => SIGNATURE_WEAPONS.find(x=>x.id===id);
const bossByStage = stage => BOSSES.find(x=>x.stage===Number(stage));
const chapterByStage = stage => CHAPTERS.find(c=>stage>=c.range[0]&&stage<=c.range[1]) || CHAPTERS[CHAPTERS.length-1];
const CONFIG_VERSION = '2026.09.v20';
const SAVE_VERSION = 20;
const FRAGMENTS_PER_DUP = { R: 10, SR: 20, SSR: 40 };
const STAR_COST = { 1: 30, 2: 60, 3: 120, 4: 200 };
const DAILY_TASKS = [
 {id:'login',name:'星烬签到',desc:'今日登录游戏',goal:1,reward:{tickets:1}},
 {id:'battle3',name:'裂境试炼',desc:'完成3场战斗',goal:3,reward:{tickets:2}},
 {id:'win2',name:'稳定裂境',desc:'赢得2场战斗',goal:2,reward:{coin:900}},
 {id:'gacha5',name:'缔结契约',desc:'完成5次契约',goal:5,reward:{starCrystal:80}},
 {id:'upgrade1',name:'契灵成长',desc:'升级、升星或装备1次',goal:1,reward:{coin:600}},
];
const DAILY_ALL_REWARD = {tickets:2,starCrystal:120};
const LOGIN_REWARDS = [
 {day:1,name:'初燃之礼',reward:{coin:2000}},
 {day:2,name:'契约回响',reward:{tickets:2}},
 {day:3,name:'星髓结晶',reward:{starCrystal:160}},
 {day:4,name:'整备补给',reward:{starIron:100}},
 {day:5,name:'星语赠礼',reward:{bondGift:2}},
 {day:6,name:'觉醒前兆',reward:{awakeningCore:1}},
 {day:7,name:'七曜星契',reward:{tickets:5,starCrystal:300}},
];

const WEEKLY_TASKS = [
 {id:'battle12',name:'巡猎裂境',desc:'本周完成12场战斗',goal:12,reward:{tickets:4}},
 {id:'win8',name:'稳定星轨',desc:'本周赢得8场战斗',goal:8,reward:{starCrystal:220}},
 {id:'gacha20',name:'群星契约',desc:'本周完成20次契约',goal:20,reward:{tickets:5}},
 {id:'resource5',name:'资源调度',desc:'本周完成5次资源副本',goal:5,reward:{starIron:100}},
 {id:'enhance3',name:'整备升级',desc:'本周强化装备3次',goal:3,reward:{coin:4000}},
];
const WEEKLY_ALL_REWARD = {tickets:8,starCrystal:300};
const SHOP_ITEMS = [
 {id:'ticket',name:'契灵印',desc:'星髓兑换契约机会',cost:{starCrystal:120},reward:{tickets:1},dailyLimit:5},
 {id:'coin',name:'烬币补给',desc:'快速补充角色升级资源',cost:{starCrystal:60},reward:{coin:2000},dailyLimit:3},
 {id:'iron',name:'星铁箱',desc:'用于装备强化',cost:{starCrystal:80},reward:{starIron:50},dailyLimit:2},
];
const LIMITED_POOL = {id:'moonlight',name:'月影流光',featured:'h001',featuredSR:'h007',ssrRate:.03,pity:60,featuredChance:.5};
const EQUIPMENT_SETS = {
 starpath:{id:'starpath',name:'巡星者',two:{atkPct:.08,label:'2件：攻击 +8%'},three:{spdFlat:8,label:'3件：速度 +8'}},
 silenttide:{id:'silenttide',name:'寂潮',two:{hpPct:.12,label:'2件：生命 +12%'},three:{atkPct:.10,defPct:.10,label:'3件：攻击 +10% · 防御 +10%'}}
};
const FORGE_RECIPES = [
 {id:'forge_eq010',itemId:'eq010',cost:{forgeDust:140,starIron:70,coin:2200}},
 {id:'forge_eq011',itemId:'eq011',cost:{forgeDust:140,starIron:70,coin:2200}},
 {id:'forge_eq012',itemId:'eq012',cost:{forgeDust:140,starIron:70,coin:2200}},
 {id:'forge_eq013',itemId:'eq013',cost:{forgeDust:420,starIron:180,coin:6800}},
 {id:'forge_eq014',itemId:'eq014',cost:{forgeDust:420,starIron:180,coin:6800}},
 {id:'forge_eq015',itemId:'eq015',cost:{forgeDust:420,starIron:180,coin:6800}},
];
const DISMANTLE_DUST = {R:25,SR:70,SSR:180};
const EVENT_CONFIG = {id:'eclipseCorridor',name:'月蚀回廊',currencyName:'月蚀印',subtitle:'限定活动 · 追踪消失在灰境边缘的星轨信号'};
const EVENT_DAILY_ATTEMPTS=8;
const EVENT_STAGES = [
 {id:'E1',name:'月影入口',power:1400,reward:{moonSeal:55,coin:500},first:{tickets:1}},
 {id:'E2',name:'失真长廊',power:2200,reward:{moonSeal:65,coin:650},first:{bondGift:1}},
 {id:'E3',name:'无声镜室',power:3200,reward:{moonSeal:80,starIron:20},first:{forgeDust:80}},
 {id:'E4',name:'残月祭台',power:4500,reward:{moonSeal:95,coin:900},first:{tickets:2}},
 {id:'E5',name:'星蚀观测站',power:6200,reward:{moonSeal:120,starCrystal:60},first:{bondGift:1}},
 {id:'E6',name:'终末月环',power:8200,reward:{moonSeal:180,starCrystal:90},first:{tickets:3,forgeDust:120}},
];
const EVENT_SHOP = [
 {id:'gift',name:'星语花',desc:'提升契灵好感度的赠礼',cost:80,reward:{bondGift:1},limit:5},
 {id:'dust',name:'锻造尘',desc:'装备锻造的核心材料',cost:60,reward:{forgeDust:120},limit:8},
 {id:'shadowFragments',name:'逐影碎片',desc:'灰境无灯客的契灵碎片',cost:120,reward:{heroId:'h008',fragments:20},limit:3},
 {id:'ticket',name:'契灵印',desc:'用于星契轮召唤',cost:150,reward:{tickets:1},limit:3},
];
const SIGNATURE_WEAPONS = [
 {id:'sig_h001',heroId:'h001',name:'断星·夜裁',rarity:'SSR',stats:{atk:165,spd:8},bonus:{atkPct:.10,skillPct:.18},desc:'夜岚专属契印武装。提高攻击与速度，强化技能爆发。'},
 {id:'sig_h002',heroId:'h002',name:'赤环·焚歌',rarity:'SSR',stats:{atk:178},bonus:{atkPct:.12,skillPct:.15},desc:'绯歌专属契印武装。强化术式输出与群体技能。'},
 {id:'sig_h003',heroId:'h003',name:'镜海·潮生',rarity:'SSR',stats:{hp:520,def:42},bonus:{hpPct:.10,healPct:.18},desc:'白砚专属契印武装。强化生存与治疗效果。'},
 {id:'sig_h004',heroId:'h004',name:'青原·春灯',rarity:'SR',stats:{hp:360,atk:72},bonus:{hpPct:.08,healPct:.14},desc:'青禾专属契印武装。提高生命并强化春息治疗。'},
 {id:'sig_h008',heroId:'h008',name:'无灯·月蚀',rarity:'SSR',stats:{atk:170,spd:10},bonus:{atkPct:.10,executePct:.20},desc:'逐影专属契印武装。对残血目标的追击更加致命。'},
];
const AWAKEN_COST = [
 {stage:1,level:30,star:5,cores:1,coin:8000,label:'一阶 · 星火'},
 {stage:2,level:40,star:5,cores:2,coin:15000,label:'二阶 · 星轨'},
 {stage:3,level:50,star:5,cores:3,coin:30000,label:'三阶 · 星冠'},
];
const SYSTEM_MAILS = [
 {id:'v08_launch',title:'v0.8 星轨更新补给',body:'契印武装与觉醒系统已开放。感谢引星者参与测试。',reward:{tickets:5,starCrystal:300,awakeningCore:3,signatureWeapon:'sig_h004'}},
 {id:'v08_event',title:'月蚀讨伐前线补给',body:'月蚀兽·涅槃已出现在活动深处，请收下前线整备物资。',reward:{coin:6000,starIron:120,forgeDust:180,bondGift:2}},
];
const EVENT_BOSS = {id:'eclipsePhoenix',name:'月蚀兽·涅槃',dailyAttempts:3,recommendedPower:9000,maxHp:3000000,subtitle:'全服讨伐原型 · 单次伤害计入个人最佳与排行榜'};
const BOND_THRESHOLDS=[0,80,220,460,800];
const BOND_STORIES={
 h001:['断星之前','曜庭旧约','月下的归途'],h002:['赤羽初鸣','未熄之歌','焚尽之后'],h003:['潮声来信','镜中的名字','海尽头的约定'],
 h004:['春息药圃','一盏草木茶','青原的灯火'],h005:['失控星盘','磁轨误差','坐标之外'],h006:['潮盾之下','沉港守夜','深海回声'],
 h007:['灼羽试锋','第二次落败','火光与笑声'],h008:['无灯之路','灰境旧影','月蚀之后'],h009:['岩层里的种子','旧城门','不退之盾'],
 h010:['砂瓶实验','赤环市集','燃烧的风'],h011:['黑羽密信','没有名字的巷子','归巢'],h012:['第一片霜','镜海冬夜','融冰'],
 h013:['提灯巡夜','熄灭的符片','星烬灯会'],h014:['疾木训练','青原赛跑','风停的时候'],h015:['潮汐铃声','回潮诊所','海风的答案']
};


const HERO_ARCHIVES = {
 h001:{codename:'断星',origin:'曜庭第七码头',affiliation:'曜庭残环',profile:'沉默而精准的断星使，曾负责守卫旧曜庭的星轨主环。裂潮后，她拒绝执行失控的裁决命令，带着被封存的星轨图离开。',memory:'她习惯在战斗结束后独自校准刀刃，因为那是她确认“今天仍然活着”的方式。',likes:'安静的高处、旧式星图',dislikes:'无意义的命令',relation:'与司南曾同属曜庭星轨序列；对逐影保持谨慎信任。'},
 h002:{codename:'焚歌',origin:'赤环第三热井',affiliation:'赤环自由术式团',profile:'能把星烬术式编成“歌”的术式师。她把危险的高热能量当成舞台灯火，却比任何人都清楚失控意味着什么。',memory:'每次施术结束，她都会记下火焰的颜色，声称那是裂境留下的“乐谱”。',likes:'热饮、旧唱片、夸张的舞台',dislikes:'潮湿的房间',relation:'与洛弥经常争论谁的火焰更快。'},
 h003:{codename:'潮镜',origin:'镜海沉港',affiliation:'镜海回声院',profile:'以水镜读取残留信息的谕潮师。她能够从破碎场景中复原短暂“回声”，也是队伍最可靠的情报来源之一。',memory:'她从不主动谈论沉港最后一夜，但会保存每一封无法投递的旧信。',likes:'海风、纸质信件',dislikes:'被打断的回声',relation:'与乌澜来自同一沉港守备体系。'},
 h004:{codename:'春息',origin:'青原北坡药圃',affiliation:'青原巡疗队',profile:'巡疗队出身的年轻医师，对星烬污染造成的伤势有异常敏锐的判断。她看起来温和，却会在任何人试图带伤继续战斗时立刻变得强硬。',memory:'随身药杖里夹着一片早已干枯的青原叶片，是她离开故乡时唯一带走的东西。',likes:'草木茶、晴天晒药材',dislikes:'隐瞒伤势',relation:'与阿洛是青原旧识；对夜岚的旧伤非常在意。'},
 h005:{codename:'引磁',origin:'曜庭轨道学院',affiliation:'曜庭残环',profile:'负责星轨坐标与磁场校正的技术官。极度相信数据，却在裂潮后第一次承认“无法计算的选择”也可能是正确答案。',memory:'他的个人终端里保留着一次无法解释的 0.003 度误差，并一直没有删除。',likes:'精密仪器、整齐的数据表',dislikes:'未经校准的设备',relation:'与夜岚曾是同一行动组。'},
 h006:{codename:'潮盾',origin:'镜海沉港',affiliation:'镜海旧港卫队',profile:'重装潮盾卫，习惯把自己放在所有危险的最前面。沉港坠落时，他是最后离开防波堤的人。',memory:'盾牌内侧刻着旧港所有撤离艇的编号。',likes:'结实的工具、安静值夜',dislikes:'撤退时的混乱',relation:'把白砚视为必须守护的“旧港证人”。'},
 h007:{codename:'灼羽',origin:'赤环浮炉城',affiliation:'赤环自由术式团',profile:'高速双刃剑士，把战斗理解为一场永远必须向前的竞速。她看似莽撞，但对队友位置的判断精确得惊人。',memory:'她从未承认自己在第一次和绯歌比试时输了三次。',likes:'速度、辣味食物',dislikes:'漫长等待',relation:'把绯歌视为必须超越的对手。'},
 h008:{codename:'无灯',origin:'灰境无名区',affiliation:'无',profile:'从灰境长夜中走出的影刃客。她擅长在没有光源和导航的区域行动，过去身份几乎全部被主动抹去。',memory:'她只记得一盏熄灭的路灯，以及灯下有人说过“往前走”。',likes:'月光、安静的屋顶',dislikes:'被追问过去',relation:'与夜岚在数次行动后建立了克制的信任。'},
 h009:{codename:'岩守',origin:'青原旧城门',affiliation:'青原民卫',profile:'旧城门守卫出身的重装战士。没有华丽技巧，但只要他站在那里，队伍就有一条可以后退的线。',memory:'他在裂潮当天守了十二个小时的城门，直到最后一个孩子撤离。',likes:'石雕、烤根茎',dislikes:'轻易放弃',relation:'对青禾像照顾晚辈一样可靠。'},
 h010:{codename:'砂焰',origin:'赤环市集',affiliation:'赤环术式研究所见习',profile:'把一切危险材料都装进瓶子里的年轻术式师。大多数事故并非判断失误，而是她“想知道会发生什么”。',memory:'实验记录第一页写着：不要相信第一次爆炸。',likes:'稀有矿砂、实验',dislikes:'别人碰她的瓶子',relation:'经常被绯歌强制收走高危材料。'},
 h011:{codename:'黑羽',origin:'灰境边缘站',affiliation:'灰境情报线',profile:'情报斥候，擅长伪装、追踪和把复杂消息压缩成一句话。名字是否真实，没有人知道。',memory:'他会给每个安全屋留下一枚黑羽标记，但从不在同一处睡两晚。',likes:'高处、短句',dislikes:'多余的问题',relation:'与逐影共享一部分灰境情报渠道。'},
 h012:{codename:'霜痕',origin:'镜海北环',affiliation:'镜海冰晶站',profile:'负责抑制星烬过热的控场术式师。情绪极少外露，但战斗时的冰晶轨迹总是异常漂亮。',memory:'她第一次看到真正的雪是在裂潮之后。',likes:'低温、玻璃工艺',dislikes:'过热的设备',relation:'与潮生长期合作处理污染伤者。'},
 h013:{codename:'引烬灯',origin:'曜庭旧居民区',affiliation:'民间引烬师',profile:'相信星烬首先应该照亮生活、而非制造武器的灯师。她负责维护队伍的野外星烬灯与简易结界。',memory:'她保留着一盏裂潮前的街灯灯芯。',likes:'灯会、手工修理',dislikes:'把星烬只当武器',relation:'司南对她“不标准”的设备十分头疼，却从未真正禁止。'},
 h014:{codename:'疾木',origin:'青原风谷',affiliation:'青原巡路队',profile:'使用轻木长枪的巡路者，方向感惊人。对他而言，地图只是参考，风才是真正的路标。',memory:'他声称自己能从风里听出回家的方向。',likes:'奔跑、树顶',dislikes:'封闭走廊',relation:'与青禾从小认识。'},
 h015:{codename:'回潮',origin:'镜海西岸',affiliation:'镜海流动诊所',profile:'携带潮汐铃巡诊的治疗者，擅长维持长时间作战中的整体状态。声音轻，却总能让慌乱的人慢慢平静下来。',memory:'她把每一次成功救治都记成一枚小贝壳挂在铃上。',likes:'海边、铃声',dislikes:'过度逞强',relation:'与雪芒共同执行过多次污染区救援。'}
};
function archiveForHero(heroId){return HERO_ARCHIVES[heroId]||null;}

const STORY_NODES = [
 {stage:1,id:'prologue',chapter:1,title:'裂潮之后',lines:[{speaker:'青禾',heroId:'h004',text:'星轨又偏移了。前面的裂境，不像自然形成的。'},{speaker:'引星者',heroId:null,text:'先稳定坐标。我们从这里开始。'},{speaker:'青禾',heroId:'h004',text:'嗯。只要星烬还亮着，就还有路。'}]},
 {stage:5,id:'boss_c1',chapter:1,title:'焚砂巨像',lines:[{speaker:'司南',heroId:'h005',text:'磁场读数暴涨……大型裂境核心正在苏醒。'},{speaker:'夜岚',heroId:'h001',text:'退到我身后。巨像的核心只有一瞬会暴露。'},{speaker:'引星者',heroId:null,text:'全员准备，切入星轨。'}]},
 {stage:10,id:'boss_c2',chapter:2,title:'镜潮的回声',lines:[{speaker:'白砚',heroId:'h003',text:'这段回声来自旧港沉没前的最后一夜。'},{speaker:'青禾',heroId:'h004',text:'守望者还在执行已经结束的命令。'},{speaker:'引星者',heroId:null,text:'那就替它结束这场守望。'}]},
 {stage:15,id:'boss_c3',chapter:3,title:'无灯长夜',lines:[{speaker:'逐影',heroId:'h008',text:'这里没有灯。灰境的人靠脚步声判断敌友。'},{speaker:'夜岚',heroId:'h001',text:'你认识前面的猎王？'},{speaker:'逐影',heroId:'h008',text:'认识。所以这一刀，我来带路。'}]},
 {stage:20,id:'boss_c4',chapter:4,title:'残环裁决',lines:[{speaker:'司南',heroId:'h005',text:'曜庭裁决序列还在运行，它把所有活物都标记成了异常。'},{speaker:'夜岚',heroId:'h001',text:'旧规则已经保护不了任何人。'},{speaker:'引星者',heroId:null,text:'关闭裁决序列。'}]},
 {stage:25,id:'boss_c5',chapter:5,title:'断层之上',lines:[{speaker:'青禾',heroId:'h004',text:'青原的风……以前不是这样的。'},{speaker:'乌澜',heroId:'h006',text:'古兽正在吸收断层里的星烬。再拖下去，整片浮岛都会坠落。'},{speaker:'引星者',heroId:null,text:'在它吞完之前阻止它。'}]},
 {stage:30,id:'finale',chapter:6,title:'终焉王座',lines:[{speaker:'白砚',heroId:'h003',text:'所有裂潮信号都汇聚在王座后方。'},{speaker:'逐影',heroId:'h008',text:'走到这里的人，从来没有回去过。'},{speaker:'夜岚',heroId:'h001',text:'那就让我们成为第一次。'},{speaker:'引星者',heroId:null,text:'星烬契约——最终坐标，确认。'}]},
 {stage:3,id:'c1_mid',chapter:1,title:'砂海里的信号',lines:[{speaker:'青禾',heroId:'h004',text:'这段信号一直在重复同一句话：不要靠近热井。'},{speaker:'司南',heroId:'h005',text:'发送时间是三年前。可它刚刚才被重新激活。'},{speaker:'引星者',heroId:null,text:'记录坐标。我们去看看是谁在让过去重新说话。'}]},
 {stage:7,id:'c2_mid',chapter:2,title:'沉港灯火',lines:[{speaker:'乌澜',heroId:'h006',text:'以前这里每晚都有航标灯。沉港之后，它们本该全部熄灭。'},{speaker:'白砚',heroId:'h003',text:'可前面的灯正在按旧港的归航频率闪烁。'},{speaker:'引星者',heroId:null,text:'也许有人还在等一艘不会回来的船。'}]},
 {stage:12,id:'c3_mid',chapter:3,title:'没有灯的路',lines:[{speaker:'逐影',heroId:'h008',text:'从这里开始，不要相信看到的影子。'},{speaker:'洛弥',heroId:'h007',text:'那我相信什么？'},{speaker:'逐影',heroId:'h008',text:'脚下。还有身边的人。'}]},
 {stage:18,id:'c4_mid',chapter:4,title:'旧曜庭档案',lines:[{speaker:'司南',heroId:'h005',text:'我找到了裂潮前最后一次裁决记录。签署人被全部涂黑。'},{speaker:'夜岚',heroId:'h001',text:'不用找名字。看命令最终流向哪里。'},{speaker:'引星者',heroId:null,text:'王座。又是那个坐标。'}]},
 {stage:23,id:'c5_mid',chapter:5,title:'青原的风',lines:[{speaker:'阿洛',heroId:'h014',text:'风向变了。以前它会从北坡一直吹到药圃。'},{speaker:'青禾',heroId:'h004',text:'断层切断了整条风谷。'},{speaker:'引星者',heroId:null,text:'那就先让这条路重新连起来。'}]},
 {stage:28,id:'c6_mid',chapter:6,title:'最后的坐标',lines:[{speaker:'白砚',heroId:'h003',text:'回声越来越少了。这里像是在吞掉所有过去。'},{speaker:'逐影',heroId:'h008',text:'那就别回头。'},{speaker:'夜岚',heroId:'h001',text:'前面就是终点，也是答案。'}]},
];
const HERO_VOICES = {
 h001:{acquire:'星轨已确认。夜岚，接受契约。',skill:'断星。',victory:'下一处裂境。',assets:{acquire:'voice/h001/acquire',skill:'voice/h001/skill',victory:'voice/h001/victory'}},
 h002:{acquire:'听见了吗？火焰也会唱歌。',skill:'赤环，坠火！',victory:'余烬还很漂亮。',assets:{acquire:'voice/h002/acquire',skill:'voice/h002/skill',victory:'voice/h002/victory'}},
 h003:{acquire:'镜海的潮声，会替我记住这次相遇。',skill:'镜潮回响。',victory:'潮汐已经平静。',assets:{acquire:'voice/h003/acquire',skill:'voice/h003/skill',victory:'voice/h003/victory'}},
 h004:{acquire:'我是青禾。受伤的话，记得告诉我。',skill:'春息，别怕。',victory:'大家都没事就好。',assets:{acquire:'voice/h004/acquire',skill:'voice/h004/skill',victory:'voice/h004/victory'}},
 h005:{acquire:'坐标锁定。司南，加入星轨。',skill:'引磁域，展开。',victory:'误差归零。',assets:{acquire:'voice/h005/acquire',skill:'voice/h005/skill',victory:'voice/h005/victory'}},
 h006:{acquire:'潮盾卫乌澜。站到我身后。',skill:'深潮壁垒！',victory:'防线仍在。',assets:{acquire:'voice/h006/acquire',skill:'voice/h006/skill',victory:'voice/h006/victory'}},
 h007:{acquire:'洛弥。要比谁先冲到终点吗？',skill:'灼羽，连袭！',victory:'还不够快。',assets:{acquire:'voice/h007/acquire',skill:'voice/h007/skill',victory:'voice/h007/victory'}},
 h008:{acquire:'逐影。名字不重要，方向才重要。',skill:'无灯步。',victory:'影子会替我们收尾。',assets:{acquire:'voice/h008/acquire',skill:'voice/h008/skill',victory:'voice/h008/victory'}},
 h009:{acquire:'石钺。守住这里就行。',skill:'岩守！',victory:'没退一步。',assets:{acquire:'voice/h009/acquire',skill:'voice/h009/skill',victory:'voice/h009/victory'}},
 h010:{acquire:'明砂，赤环术式见习。别碰我的瓶子。',skill:'砂焰起！',victory:'实验成功。',assets:{acquire:'voice/h010/acquire',skill:'voice/h010/skill',victory:'voice/h010/victory'}},
 h011:{acquire:'渡鸦。情报比名字值钱。',skill:'黑羽。',victory:'目标消失。',assets:{acquire:'voice/h011/acquire',skill:'voice/h011/skill',victory:'voice/h011/victory'}},
 h012:{acquire:'雪芒。温度正在下降。',skill:'霜痕，凝结。',victory:'冰会记住裂痕。',assets:{acquire:'voice/h012/acquire',skill:'voice/h012/skill',victory:'voice/h012/victory'}},
 h013:{acquire:'墨灯。星烬不该只用来战斗。',skill:'引烬灯，亮。',victory:'灯还亮着。',assets:{acquire:'voice/h013/acquire',skill:'voice/h013/skill',victory:'voice/h013/victory'}},
 h014:{acquire:'阿洛！风往哪边，我就往哪边。',skill:'疾木突！',victory:'追上风了。',assets:{acquire:'voice/h014/acquire',skill:'voice/h014/skill',victory:'voice/h014/victory'}},
 h015:{acquire:'潮生。需要治疗就摇铃。',skill:'回潮。',victory:'呼吸稳定了。',assets:{acquire:'voice/h015/acquire',skill:'voice/h015/skill',victory:'voice/h015/victory'}},
};
const SKILL_FX = {
 h001:{shape:'starSlash',accent:'#ead99a',motion:'dash'},h002:{shape:'fireRing',accent:'#ff6b7d',motion:'burst'},h003:{shape:'mirrorTide',accent:'#9cecff',motion:'wave'},
 h004:{shape:'springBloom',accent:'#7ee8a2',motion:'bloom'},h005:{shape:'magnetGrid',accent:'#8ca8ff',motion:'pulse'},h006:{shape:'tideShield',accent:'#75c9ff',motion:'guard'},
 h007:{shape:'emberFeather',accent:'#ff9c68',motion:'multi'},h008:{shape:'shadowMoon',accent:'#bfa9ef',motion:'blink'},h009:{shape:'stoneGuard',accent:'#94c58b',motion:'guard'},
 h010:{shape:'sandFlame',accent:'#ffb16f',motion:'burst'},h011:{shape:'blackFeather',accent:'#9b91be',motion:'blink'},h012:{shape:'frostTrace',accent:'#b6e9ff',motion:'freeze'},
 h013:{shape:'emberLamp',accent:'#e9cf86',motion:'pulse'},h014:{shape:'woodRush',accent:'#8ade9d',motion:'dash'},h015:{shape:'tideBell',accent:'#8ddff2',motion:'wave'}
};
function storyForStage(stage){return STORY_NODES.find(x=>x.stage===Number(stage))||null;}

function makeSystemMails(){return SYSTEM_MAILS.map(x=>({...JSON.parse(JSON.stringify(x)),claimed:false,createdAt:nowIso()}));}
function mergeSystemMails(mails){const out=Array.isArray(mails)?mails.map(x=>({...x})):[];for(const t of SYSTEM_MAILS)if(!out.some(x=>x.id===t.id))out.push({...JSON.parse(JSON.stringify(t)),claimed:false,createdAt:nowIso()});return out;}
function unreadMailCount(state){return (state.mails||[]).filter(x=>!x.claimed).length;}
function claimMail(state,id){state.mails=mergeSystemMails(state.mails);const m=state.mails.find(x=>x.id===id);if(!m)throw codeError('MAIL_NOT_FOUND');if(m.claimed)throw codeError('MAIL_ALREADY_CLAIMED');rewardState(state,m.reward||{});m.claimed=true;m.claimedAt=nowIso();state.updatedAt=nowIso();return{id:m.id,reward:m.reward};}
function claimAllMail(state){state.mails=mergeSystemMails(state.mails);const claimed=[];for(const m of state.mails)if(!m.claimed){rewardState(state,m.reward||{});m.claimed=true;m.claimedAt=nowIso();claimed.push({id:m.id,reward:m.reward});}if(!claimed.length)throw codeError('NO_MAIL_REWARD');state.updatedAt=nowIso();return{claimed};}
function ensureEventBoss(state,date=new Date()){const day=gameDay(date);if(!state.eventBoss||state.eventBoss.day!==day)state.eventBoss={day,runs:0,bestDamage:Number(state.eventBoss?.bestDamage)||0,totalDamage:Number(state.eventBoss?.totalDamage)||0,lastDamage:0};state.eventBoss.runs=Math.max(0,Number(state.eventBoss.runs)||0);state.eventBoss.bestDamage=Math.max(0,Number(state.eventBoss.bestDamage)||0);state.eventBoss.totalDamage=Math.max(0,Number(state.eventBoss.totalDamage)||0);return state.eventBoss;}
function signatureForHero(heroId){return SIGNATURE_WEAPONS.find(x=>x.heroId===heroId)||null;}
function combatClassForHero(heroOrId){const h=typeof heroOrId==='string'?byId(heroOrId):heroOrId;return ROLE_CLASS[h?.role]||'support';}
function combatClassInfo(id){return COMBAT_CLASSES[id]||COMBAT_CLASSES.support;}
function classMultiplier(actor,target){const a=actor?.combatClass||'support',b=target?.combatClass||'support';if(a==='support'||b==='support')return 1;if(COMBAT_CLASSES[a]?.strong===b)return CLASS_ADVANTAGE;if(COMBAT_CLASSES[b]?.strong===a)return CLASS_DISADVANTAGE;return 1;}
function talentTree(heroId){return TALENT_TREES[heroId]||[];}
function heroTalents(state,heroId){state.talents||={};state.talents[heroId]=Array.isArray(state.talents[heroId])?[...new Set(state.talents[heroId])]:[];return state.talents[heroId];}
function talentBonus(state,heroId){const out={hpPct:0,atkPct:0,defPct:0,skillPct:0,healPct:0,shieldPct:0,effectPct:0};for(const id of heroTalents(state,heroId)){const n=talentTree(heroId).find(x=>x.id===id);if(n?.bonus)for(const k of Object.keys(out))out[k]+=Number(n.bonus[k])||0;}return out;}
function unlockTalent(state,heroId,nodeId){if(!state.heroes[heroId])throw codeError('HERO_NOT_OWNED');const node=talentTree(heroId).find(x=>x.id===nodeId);if(!node)throw codeError('TALENT_NOT_FOUND');const owned=heroTalents(state,heroId);if(owned.includes(nodeId))throw codeError('TALENT_ALREADY_UNLOCKED');if(node.requires&&!owned.includes(node.requires))throw codeError('TALENT_REQUIREMENT');if((Number(state.inventory?.talentPoints)||0)<node.cost)throw codeError('NOT_ENOUGH_TALENT_POINTS');state.inventory.talentPoints-=node.cost;owned.push(nodeId);state.updatedAt=nowIso();return{heroId,nodeId,cost:node.cost,talents:[...owned]};}

function equipSignature(state,heroId,signatureId){const p=state.heroes[heroId],h=byId(heroId);if(!p||!h)throw codeError('HERO_NOT_OWNED');if(signatureId==null){p.signature=null;state.updatedAt=nowIso();return{heroId,signature:null};}const sig=signatureById(signatureId);if(!sig)throw codeError('SIGNATURE_NOT_FOUND');if(sig.heroId!==heroId)throw codeError('SIGNATURE_HERO_MISMATCH');if((Number(state.inventory.signatureWeapons?.[signatureId])||0)<1)throw codeError('SIGNATURE_NOT_OWNED');p.signature=signatureId;state.updatedAt=nowIso();return{heroId,signature:signatureId,item:sig};}
function awakenInfo(state,heroId){const p=state.heroes[heroId];if(!p)throw codeError('HERO_NOT_OWNED');const stage=Number(p.awakening)||0,next=AWAKEN_COST[stage]||null;return{stage,next,can:!!next&&p.level>=next.level&&p.star>=next.star&&(Number(state.inventory.awakeningCore)||0)>=next.cores&&state.coin>=next.coin};}
function awakenHero(state,heroId){const p=state.heroes[heroId],h=byId(heroId);if(!p||!h)throw codeError('HERO_NOT_OWNED');const info=awakenInfo(state,heroId);if(!info.next)throw codeError('AWAKEN_CAP');if(p.level<info.next.level)throw codeError('AWAKEN_LEVEL_REQUIRED');if(p.star<info.next.star)throw codeError('AWAKEN_STAR_REQUIRED');if((Number(state.inventory.awakeningCore)||0)<info.next.cores)throw codeError('NOT_ENOUGH_AWAKENING_CORE');if(state.coin<info.next.coin)throw codeError('NOT_ENOUGH_COIN');state.inventory.awakeningCore-=info.next.cores;state.coin-=info.next.coin;p.awakening=(Number(p.awakening)||0)+1;state.updatedAt=nowIso();return{heroId,awakening:p.awakening,cost:info.next};}
function eventBossBattle(state,rng=rand01){ensureEventBoss(state);if(state.eventBoss.runs>=EVENT_BOSS.dailyAttempts)throw codeError('EVENT_BOSS_ATTEMPTS_EXHAUSTED');const power=formationPower(state);if(power<EVENT_BOSS.recommendedPower*.45)throw codeError('POWER_TOO_LOW');const damage=Math.max(1,Math.round(power*(7.6+rng()*2.4)));state.eventBoss.runs++;state.eventBoss.lastDamage=damage;state.eventBoss.totalDamage+=damage;state.eventBoss.bestDamage=Math.max(state.eventBoss.bestDamage,damage);const reward={moonSeal:Math.min(260,45+Math.floor(damage/6500)),coin:800+Math.floor(damage/80)};if(damage>=120000)reward.awakeningCore=1;rewardState(state,reward);weeklyProgress(state,'battle12',1);weeklyProgress(state,'win8',1);state.updatedAt=nowIso();return{boss:EVENT_BOSS,damage,reward,bestDamage:state.eventBoss.bestDamage,runs:state.eventBoss.runs,left:EVENT_BOSS.dailyAttempts-state.eventBoss.runs};}
function localEventLeaderboard(state){const own=Number(state.eventBoss?.bestDamage)||0;const rows=[['夜航者',168420],['北辰',142880],['镜海听潮',128600],['赤环余烬',117320],['青原旅人',98600],['引星者',own]].map(([name,damage])=>({name,damage:Number(damage)})).sort((a,b)=>b.damage-a.damage);return rows.slice(0,10).map((x,i)=>({...x,rank:i+1,isSelf:x.name==='引星者'}));}

function nowIso(){ return new Date().toISOString(); }
function gameDay(date=new Date()){
  const shifted = new Date(date.getTime() + 8*60*60*1000);
  return shifted.toISOString().slice(0,10);
}
function emptyDaily(day=gameDay()){
  const progress={}; const claimed={};
  for(const t of DAILY_TASKS){ progress[t.id]=t.id==='login'?1:0; claimed[t.id]=false; }
  return {day,progress,claimed,allClaimed:false};
}
function gameWeek(date=new Date()){
  const shifted=new Date(date.getTime()+8*60*60*1000),day=shifted.getUTCDay(),diff=(day+6)%7;
  shifted.setUTCDate(shifted.getUTCDate()-diff);return shifted.toISOString().slice(0,10);
}
function emptyWeekly(week=gameWeek()){const progress={},claimed={};for(const t of WEEKLY_TASKS){progress[t.id]=0;claimed[t.id]=false;}return{week,progress,claimed,allClaimed:false};}
function blankEquipment(){ return {weapon:null,armor:null,charm:null}; }
function newPlayer(ownerId='guest'){
  const created=nowIso();
  return {
    version:SAVE_VERSION, configVersion:CONFIG_VERSION, ownerId, level:1, exp:0,
    coin:5000, starCrystal:300, tickets:30, pity:0, stage:1, revision:0,
    heroes:{ h004:{level:1,star:1,fragments:0,awakening:0,signature:null,equipment:{weapon:'eq001',armor:null,charm:null}} },
    formation:['h004'], formationRows:{h004:'back'}, gachaHistory:[], inventory:{equipment:{eq001:1},relics:{},signatureWeapons:{},starIron:120,forgeDust:0,bondGift:3,awakeningCore:0,talentPoints:3,enhance:{eq001:0}}, activeRelic:null,
    bossClears:[], campaignCompleted:false,
    resourceRuns:{day:gameDay(),used:{}}, achievements:{claimed:{}},
    daily:emptyDaily(), weekly:emptyWeekly(), loginReward:{cycle:1,claimed:Array(7).fill(false),lastClaimDay:null,totalClaims:0}, shop:{day:gameDay(),purchases:{}},
    limited:{pity:0,guaranteed:false}, forge:{crafted:0,dismantled:0},
    event:{id:EVENT_CONFIG.id,moonSeal:0,clears:[],firstClears:[],shop:{},day:gameDay(),runs:0}, eventBoss:{day:gameDay(),runs:0,bestDamage:0,totalDamage:0,lastDamage:0}, bond:{h004:{points:0}}, mails:makeSystemMails(),
    profile:{displayName:'引星者',linked:false}, newbieGacha:{claimed:false}, storySeen:[], battlePrefs:{skillMode:'auto',manualSkills:[],autoStrategy:'balanced'}, formationPresets:{},talents:{},sweep:{day:gameDay(),used:0},nightEvent:{id:NIGHT_EVENT_CONFIG.id,voyageBadge:0,clears:[],firstClears:[],shop:{},day:gameDay(),runs:0}, activeBattleSession:null, battleReplays:[],
    lastAction:null, createdAt:created, updatedAt:created, lastLogin:created
  };
}
function ensureDaily(state,date=new Date()){
  const day=gameDay(date);
  if(!state.daily || state.daily.day!==day) state.daily=emptyDaily(day);
  for(const t of DAILY_TASKS){ state.daily.progress[t.id] ??= (t.id==='login'?1:0); state.daily.claimed[t.id] ??= false; }
  state.daily.allClaimed=!!state.daily.allClaimed;
  return state.daily;
}
function ensureWeekly(state,date=new Date()){const week=gameWeek(date);if(!state.weekly||state.weekly.week!==week)state.weekly=emptyWeekly(week);for(const t of WEEKLY_TASKS){state.weekly.progress[t.id]??=0;state.weekly.claimed[t.id]??=false;}state.weekly.allClaimed=!!state.weekly.allClaimed;return state.weekly;}
function ensureShop(state,date=new Date()){const day=gameDay(date);if(!state.shop||state.shop.day!==day)state.shop={day,purchases:{}};state.shop.purchases||={};return state.shop;}
function migrate(input,ownerId='guest'){
  const s=input?JSON.parse(JSON.stringify(input)):newPlayer(ownerId);
  s.version=SAVE_VERSION; s.configVersion=CONFIG_VERSION; s.ownerId=s.ownerId||ownerId;
  s.level??=1;s.exp??=0;s.coin??=5000;s.starCrystal??=300;s.tickets??=30;s.pity??=0;s.stage??=1;s.revision??=0;
  s.heroes||={};s.formation||=[];s.gachaHistory||=[];s.createdAt||=nowIso();s.updatedAt||=nowIso();s.lastLogin||=nowIso();
  s.profile||={displayName:'引星者',linked:false};s.profile.displayName||='引星者';s.profile.linked=!!s.profile.linked;s.newbieGacha||={claimed:false};s.newbieGacha.claimed=!!s.newbieGacha.claimed;s.storySeen=Array.isArray(s.storySeen)?[...new Set(s.storySeen.map(String))]:[];s.battlePrefs||={skillMode:'auto',manualSkills:[],autoStrategy:'balanced'};s.battlePrefs.skillMode=s.battlePrefs.skillMode==='manual'?'manual':'auto';s.battlePrefs.manualSkills=Array.isArray(s.battlePrefs.manualSkills)?s.battlePrefs.manualSkills.filter(id=>s.heroes?.[id]).slice(0,3):[];s.battlePrefs.autoStrategy=AUTO_STRATEGIES[s.battlePrefs.autoStrategy]?s.battlePrefs.autoStrategy:'balanced';s.battleReplays=Array.isArray(s.battleReplays)?s.battleReplays.slice(0,5):[];s.activeBattleSession=(s.activeBattleSession&&typeof s.activeBattleSession==='object')?s.activeBattleSession:null;if(s.activeBattleSession&&s.activeBattleSession.stage!==s.stage&&s.activeBattleSession.status!=='complete')s.activeBattleSession=null;if(s.activeBattleSession){s.activeBattleSession.stats=s.activeBattleSession.stats||{};s.activeBattleSession.skillCasts=s.activeBattleSession.skillCasts||{};s.activeBattleSession.combosUsed=Array.isArray(s.activeBattleSession.combosUsed)?s.activeBattleSession.combosUsed:[];for(const team of [s.activeBattleSession.allies||[],s.activeBattleSession.enemies||[]])for(const u of team){u.silence=Math.max(0,Number(u.silence)||0);u.taunt=Math.max(0,Number(u.taunt)||0);u.row=['front','back'].includes(u.row)?u.row:'front';u.range=u.range||'any';u.skillCost=Math.max(1,Number(u.skillCost)||100);u.energyGain=Math.max(1,Number(u.energyGain)||34);u.skillCooldown=Math.max(0,Number(u.skillCooldown)||0);u.cooldownLeft=Math.max(0,Number(u.cooldownLeft)||0);u.combatClass=u.combatClass||'support';u.breakWindow=Math.max(0,Number(u.breakWindow)||0);if(u.isBoss){u.breakMax=Math.max(1,Number(u.breakMax)||BOSS_BREAK_RULES[s.activeBattleSession.stage]||150);u.breakGauge=Math.max(0,Math.min(u.breakMax,Number(u.breakGauge)||u.breakMax));u.breakCount=Math.max(0,Number(u.breakCount)||0);}}}
  s.inventory||={equipment:{},relics:{},signatureWeapons:{},starIron:0,forgeDust:0,bondGift:0,awakeningCore:0,enhance:{}};s.inventory.equipment||={};s.inventory.relics||={};s.inventory.signatureWeapons||={};s.inventory.starIron=Number(s.inventory.starIron)||0;s.inventory.forgeDust=Number(s.inventory.forgeDust)||0;s.inventory.bondGift=Number(s.inventory.bondGift)||0;s.inventory.awakeningCore=Number(s.inventory.awakeningCore)||0;s.inventory.talentPoints=Math.max(0,Number(s.inventory.talentPoints)||0);s.inventory.enhance||={};
  for(const item of EQUIPMENT)s.inventory.enhance[item.id]=Math.max(0,Math.min(10,Number(s.inventory.enhance[item.id])||0));
  s.resourceRuns||={day:gameDay(),used:{}};if(s.resourceRuns.day!==gameDay())s.resourceRuns={day:gameDay(),used:{}};s.resourceRuns.used||={};
  s.achievements||={claimed:{}};s.achievements.claimed||={};
  s.limited||={pity:0,guaranteed:false};s.limited.pity=Math.max(0,Number(s.limited.pity)||0);s.limited.guaranteed=!!s.limited.guaranteed;
  s.forge||={crafted:0,dismantled:0};s.forge.crafted=Number(s.forge.crafted)||0;s.forge.dismantled=Number(s.forge.dismantled)||0;
  s.event||={id:EVENT_CONFIG.id,moonSeal:0,clears:[],firstClears:[],shop:{},day:gameDay(),runs:0};if(s.event.id!==EVENT_CONFIG.id)s.event={id:EVENT_CONFIG.id,moonSeal:0,clears:[],firstClears:[],shop:{},day:gameDay(),runs:0};s.event.moonSeal=Number(s.event.moonSeal)||0;s.event.clears=Array.isArray(s.event.clears)?s.event.clears:[];s.event.firstClears=Array.isArray(s.event.firstClears)?s.event.firstClears:[];s.event.shop||={};if(s.event.day!==gameDay()){s.event.day=gameDay();s.event.runs=0;}s.event.runs=Math.max(0,Number(s.event.runs)||0);
  ensureEventBoss(s);s.mails=mergeSystemMails(s.mails);
  s.bond||={};
  s.loginReward||={cycle:1,claimed:Array(7).fill(false),lastClaimDay:null,totalClaims:0};
  s.loginReward.cycle=Math.max(1,Number(s.loginReward.cycle)||1);
  s.loginReward.claimed=Array.from({length:7},(_,i)=>!!(Array.isArray(s.loginReward.claimed)&&s.loginReward.claimed[i]));
  s.loginReward.lastClaimDay=s.loginReward.lastClaimDay||null;
  s.loginReward.totalClaims=Math.max(0,Number(s.loginReward.totalClaims)||s.loginReward.claimed.filter(Boolean).length);
  ensureWeekly(s);ensureShop(s);s.formationPresets=(s.formationPresets&&typeof s.formationPresets==='object')?s.formationPresets:{};s.talents=(s.talents&&typeof s.talents==='object')?s.talents:{};for(const id of Object.keys(s.heroes||{}))heroTalents(s,id);const gd=gameDay();s.sweep=(s.sweep&&typeof s.sweep==='object')?s.sweep:{day:gd,used:0};if(s.sweep.day!==gd)s.sweep={day:gd,used:0};s.sweep.used=Math.max(0,Number(s.sweep.used)||0);s.nightEvent=(s.nightEvent&&s.nightEvent.id===NIGHT_EVENT_CONFIG.id)?s.nightEvent:{id:NIGHT_EVENT_CONFIG.id,voyageBadge:0,clears:[],firstClears:[],shop:{},day:gd,runs:0};s.nightEvent.voyageBadge=Math.max(0,Number(s.nightEvent.voyageBadge)||0);s.nightEvent.clears=Array.isArray(s.nightEvent.clears)?s.nightEvent.clears:[];s.nightEvent.firstClears=Array.isArray(s.nightEvent.firstClears)?s.nightEvent.firstClears:[];s.nightEvent.shop=s.nightEvent.shop||{};if(s.nightEvent.day!==gd){s.nightEvent.day=gd;s.nightEvent.runs=0;}s.nightEvent.runs=Math.max(0,Number(s.nightEvent.runs)||0);
  s.activeRelic = s.activeRelic && relicById(s.activeRelic) ? s.activeRelic : null;
  s.bossClears=Array.isArray(s.bossClears)?[...new Set(s.bossClears.map(Number).filter(n=>bossByStage(n)))]:[];
  s.campaignCompleted=!!s.campaignCompleted;
  for(const [id,p] of Object.entries(s.heroes)){
    const h=byId(id);if(!h)continue;
    p.level=Math.max(1,Math.min(50,Number(p.level)||1));p.star=Math.max(1,Math.min(5,Number(p.star)||1));p.awakening=Math.max(0,Math.min(3,Number(p.awakening)||0));p.signature=(p.signature&&signatureById(p.signature)?.heroId===id)?p.signature:null;
    if(p.fragments==null){const copies=Math.max(1,Number(p.copies)||1);p.fragments=Math.max(0,copies-1)*FRAGMENTS_PER_DUP[h.rarity];}
    delete p.copies;p.equipment||=blankEquipment();
    for(const slot of ['weapon','armor','charm']){const item=equipmentById(p.equipment[slot]);if(!item||item.slot!==slot)p.equipment[slot]=null;}
    s.bond[id]||={points:0};s.bond[id].points=Math.max(0,Number(s.bond[id].points)||0);
  }
  // v0.3 migration grants one starter blade if the player has no equipment at all.
  if(!Object.keys(s.inventory.equipment).length){s.inventory.equipment.eq001=1;if(s.heroes.h004&&!s.heroes.h004.equipment.weapon)s.heroes.h004.equipment.weapon='eq001';}
  s.formation=s.formation.filter(id=>s.heroes[id]).slice(0,5);if(!s.formation.length&&s.heroes.h004)s.formation=['h004'];s.formationRows=(s.formationRows&&typeof s.formationRows==='object')?s.formationRows:{};s.formation.forEach((id,i)=>{if(!['front','back'].includes(s.formationRows[id]))s.formationRows[id]=i<2?'front':'back';});for(const id of Object.keys(s.formationRows))if(!s.formation.includes(id))delete s.formationRows[id];
  if(s.stage>30){s.stage=30;s.campaignCompleted=true;} if(s.stage<1)s.stage=1;
  ensureDaily(s);ensureWeekly(s);ensureShop(s);return s;
}
function rewardState(state,reward){state.coin+=Number(reward.coin)||0;state.tickets+=Number(reward.tickets)||0;state.starCrystal+=Number(reward.starCrystal)||0;if(reward.starIron)state.inventory.starIron=(Number(state.inventory.starIron)||0)+Number(reward.starIron);if(reward.forgeDust)state.inventory.forgeDust=(Number(state.inventory.forgeDust)||0)+Number(reward.forgeDust);if(reward.bondGift)state.inventory.bondGift=(Number(state.inventory.bondGift)||0)+Number(reward.bondGift);if(reward.awakeningCore)state.inventory.awakeningCore=(Number(state.inventory.awakeningCore)||0)+Number(reward.awakeningCore);if(reward.talentPoints)state.inventory.talentPoints=(Number(state.inventory.talentPoints)||0)+Number(reward.talentPoints);if(reward.voyageBadge){state.nightEvent||={id:NIGHT_EVENT_CONFIG.id,voyageBadge:0,clears:[],firstClears:[],shop:{},day:gameDay(),runs:0};state.nightEvent.voyageBadge=(Number(state.nightEvent.voyageBadge)||0)+Number(reward.voyageBadge);}if(reward.signatureWeapon){state.inventory.signatureWeapons||={};state.inventory.signatureWeapons[reward.signatureWeapon]=(Number(state.inventory.signatureWeapons[reward.signatureWeapon])||0)+1;}if(reward.moonSeal){state.event||={id:EVENT_CONFIG.id,moonSeal:0,clears:[],firstClears:[],shop:{}};state.event.moonSeal=(Number(state.event.moonSeal)||0)+Number(reward.moonSeal);}}
function dailyProgress(state,id,amount=1){ensureDaily(state);const task=DAILY_TASKS.find(t=>t.id===id);if(!task)return;state.daily.progress[id]=Math.min(task.goal,(Number(state.daily.progress[id])||0)+amount);}
function weeklyProgress(state,id,amount=1){ensureWeekly(state);const task=WEEKLY_TASKS.find(t=>t.id===id);if(!task)return;state.weekly.progress[id]=Math.min(task.goal,(Number(state.weekly.progress[id])||0)+amount);}
function claimWeeklyTask(state,taskId){ensureWeekly(state);const task=WEEKLY_TASKS.find(t=>t.id===taskId);if(!task)throw codeError('WEEKLY_TASK_NOT_FOUND');if(state.weekly.claimed[taskId])throw codeError('WEEKLY_TASK_ALREADY_CLAIMED');if((state.weekly.progress[taskId]||0)<task.goal)throw codeError('WEEKLY_TASK_NOT_READY');rewardState(state,task.reward);state.weekly.claimed[taskId]=true;state.updatedAt=nowIso();return{taskId,reward:task.reward};}
function claimWeeklyAll(state){ensureWeekly(state);if(state.weekly.allClaimed)throw codeError('WEEKLY_ALL_ALREADY_CLAIMED');if(!WEEKLY_TASKS.every(t=>state.weekly.claimed[t.id]))throw codeError('WEEKLY_ALL_NOT_READY');rewardState(state,WEEKLY_ALL_REWARD);state.weekly.allClaimed=true;state.updatedAt=nowIso();return{reward:WEEKLY_ALL_REWARD};}
function shopBuy(state,id){ensureShop(state);const item=SHOP_ITEMS.find(x=>x.id===id);if(!item)throw codeError('SHOP_ITEM_NOT_FOUND');const bought=Number(state.shop.purchases[id])||0;if(bought>=item.dailyLimit)throw codeError('SHOP_LIMIT_REACHED');if(state.starCrystal<(item.cost.starCrystal||0))throw codeError('NOT_ENOUGH_STAR_CRYSTAL');state.starCrystal-=item.cost.starCrystal||0;rewardState(state,item.reward);state.shop.purchases[id]=bought+1;state.updatedAt=nowIso();return{id,reward:item.reward,bought:bought+1,left:item.dailyLimit-bought-1};}
function claimDailyTask(state,taskId){ensureDaily(state);const task=DAILY_TASKS.find(t=>t.id===taskId);if(!task)throw codeError('TASK_NOT_FOUND');if(state.daily.claimed[taskId])throw codeError('TASK_ALREADY_CLAIMED');if((state.daily.progress[taskId]||0)<task.goal)throw codeError('TASK_NOT_READY');rewardState(state,task.reward);state.daily.claimed[taskId]=true;state.updatedAt=nowIso();return{taskId,reward:task.reward};}
function claimDailyAll(state){ensureDaily(state);if(state.daily.allClaimed)throw codeError('DAILY_ALL_ALREADY_CLAIMED');if(!DAILY_TASKS.every(t=>state.daily.claimed[t.id]))throw codeError('DAILY_ALL_NOT_READY');rewardState(state,DAILY_ALL_REWARD);state.daily.allClaimed=true;state.updatedAt=nowIso();return{reward:DAILY_ALL_REWARD};}
function loginRewardInfo(state,date=new Date()){
  const today=gameDay(date);const lr=state.loginReward||(state.loginReward={cycle:1,claimed:Array(7).fill(false),lastClaimDay:null,totalClaims:0});
  lr.claimed=Array.from({length:7},(_,i)=>!!(Array.isArray(lr.claimed)&&lr.claimed[i]));
  const claimedToday=lr.lastClaimDay===today,rolloverReady=lr.claimed.every(Boolean)&&!claimedToday,displayClaimed=rolloverReady?Array(7).fill(false):[...lr.claimed];
  let nextIndex=displayClaimed.findIndex(x=>!x);if(nextIndex<0)nextIndex=0;
  return {cycle:Math.max(1,Number(lr.cycle)||1)+(rolloverReady?1:0),claimed:displayClaimed,lastClaimDay:lr.lastClaimDay||null,claimedToday,nextIndex,totalClaims:Math.max(0,Number(lr.totalClaims)||0),rewards:LOGIN_REWARDS};
}
function claimLoginReward(state,date=new Date()){
  const today=gameDay(date);const info=loginRewardInfo(state,date);const lr=state.loginReward;
  if(info.claimedToday)throw codeError('LOGIN_REWARD_ALREADY_CLAIMED');
  let idx=lr.claimed.findIndex(x=>!x);
  if(idx<0){lr.cycle=Math.max(1,Number(lr.cycle)||1)+1;lr.claimed=Array(7).fill(false);idx=0;}
  const item=LOGIN_REWARDS[idx];rewardState(state,item.reward);lr.claimed[idx]=true;lr.lastClaimDay=today;lr.totalClaims=(Number(lr.totalClaims)||0)+1;state.updatedAt=nowIso();
  return {cycle:lr.cycle,day:item.day,name:item.name,reward:item.reward,totalClaims:lr.totalClaims};
}
function rand01(){return Math.random();}
function randomPick(arr,rng=rand01){return arr[Math.min(arr.length-1,Math.floor(rng()*arr.length))];}
function rollOne(state,rng=rand01){
  if(state.tickets<1)throw codeError('NOT_ENOUGH_TICKETS');state.tickets--;state.pity++;
  const rarity=state.pity>=50?'SSR':((x)=>x<.03?'SSR':x<.25?'SR':'R')(rng());if(rarity==='SSR')state.pity=0;
  const hero=randomPick(HEROES.filter(h=>h.rarity===rarity),rng);const p=state.heroes[hero.id];let duplicate=false,fragmentsGained=0;
  if(!p)state.heroes[hero.id]={level:1,star:1,fragments:0,awakening:0,signature:null,equipment:blankEquipment()};else{duplicate=true;fragmentsGained=FRAGMENTS_PER_DUP[hero.rarity];p.fragments+=fragmentsGained;}
  if(state.formation.length<5&&!state.formation.includes(hero.id))state.formation.push(hero.id);
  state.gachaHistory.unshift({heroId:hero.id,rarity:hero.rarity,duplicate,fragmentsGained,at:nowIso()});state.gachaHistory=state.gachaHistory.slice(0,100);
  return{hero,duplicate,fragmentsGained};
}
function pull(state,count,rng=rand01){if(![1,10].includes(count))throw codeError('INVALID_COUNT');if(state.tickets<count)throw codeError('NOT_ENOUGH_TICKETS');const results=[];for(let i=0;i<count;i++)results.push(rollOne(state,rng));dailyProgress(state,'gacha5',count);weeklyProgress(state,'gacha20',count);state.updatedAt=nowIso();return results;}

function forcedStandardSSR(state,rng=rand01){if(state.tickets<1)throw codeError('NOT_ENOUGH_TICKETS');state.tickets--;state.pity=0;const hero=randomPick(HEROES.filter(h=>h.rarity==='SSR'),rng),p=state.heroes[hero.id];let duplicate=false,fragmentsGained=0;if(!p)state.heroes[hero.id]={level:1,star:1,fragments:0,awakening:0,signature:null,equipment:blankEquipment()};else{duplicate=true;fragmentsGained=FRAGMENTS_PER_DUP.SSR;p.fragments+=fragmentsGained;}if(state.formation.length<5&&!state.formation.includes(hero.id))state.formation.push(hero.id);state.gachaHistory.unshift({heroId:hero.id,rarity:'SSR',duplicate,fragmentsGained,pool:'newbie',guaranteed:true,at:nowIso()});state.gachaHistory=state.gachaHistory.slice(0,100);return{hero,duplicate,fragmentsGained,newbieGuaranteed:true};}
function pullStarterTen(state,rng=rand01){state.newbieGacha||={claimed:false};if(state.newbieGacha.claimed)throw codeError('NEWBIE_GACHA_ALREADY_USED');if(state.tickets<10)throw codeError('NOT_ENOUGH_TICKETS');const results=[];for(let i=0;i<9;i++)results.push(rollOne(state,rng));results.push(results.some(x=>x.hero.rarity==='SSR')?rollOne(state,rng):forcedStandardSSR(state,rng));state.newbieGacha.claimed=true;dailyProgress(state,'gacha5',10);weeklyProgress(state,'gacha20',10);state.updatedAt=nowIso();return results;}

function rollLimitedOne(state,rng=rand01){
  if(state.tickets<1)throw codeError('NOT_ENOUGH_TICKETS');state.tickets--;state.limited.pity++;
  const rarity=state.limited.pity>=LIMITED_POOL.pity?'SSR':((x)=>x<LIMITED_POOL.ssrRate?'SSR':x<.25?'SR':'R')(rng());let hero;
  if(rarity==='SSR'){state.limited.pity=0;if(state.limited.guaranteed||rng()<LIMITED_POOL.featuredChance){hero=byId(LIMITED_POOL.featured);state.limited.guaranteed=false;}else{hero=randomPick(HEROES.filter(h=>h.rarity==='SSR'&&h.id!==LIMITED_POOL.featured),rng);state.limited.guaranteed=true;}}
  else if(rarity==='SR'&&rng()<.35)hero=byId(LIMITED_POOL.featuredSR);else hero=randomPick(HEROES.filter(h=>h.rarity===rarity),rng);
  const p=state.heroes[hero.id];let duplicate=false,fragmentsGained=0;if(!p)state.heroes[hero.id]={level:1,star:1,fragments:0,awakening:0,signature:null,equipment:blankEquipment()};else{duplicate=true;fragmentsGained=FRAGMENTS_PER_DUP[hero.rarity];p.fragments+=fragmentsGained;}
  if(state.formation.length<5&&!state.formation.includes(hero.id))state.formation.push(hero.id);state.gachaHistory.unshift({heroId:hero.id,rarity:hero.rarity,duplicate,fragmentsGained,pool:LIMITED_POOL.id,at:nowIso()});state.gachaHistory=state.gachaHistory.slice(0,100);return{hero,duplicate,fragmentsGained,featured:hero.id===LIMITED_POOL.featured};
}
function pullLimited(state,count,rng=rand01){if(![1,10].includes(count))throw codeError('INVALID_COUNT');if(state.tickets<count)throw codeError('NOT_ENOUGH_TICKETS');const results=[];for(let i=0;i<count;i++)results.push(rollLimitedOne(state,rng));dailyProgress(state,'gacha5',count);weeklyProgress(state,'gacha20',count);state.updatedAt=nowIso();return results;}
function levelUp(state,heroId){const p=state.heroes[heroId],h=byId(heroId);if(!p||!h)throw codeError('HERO_NOT_OWNED');if(p.level>=50)throw codeError('LEVEL_CAP');const cost=200*p.level;if(state.coin<cost)throw codeError('NOT_ENOUGH_COIN');state.coin-=cost;p.level++;dailyProgress(state,'upgrade1',1);state.updatedAt=nowIso();return{heroId,level:p.level,cost};}
function starUp(state,heroId){const p=state.heroes[heroId],h=byId(heroId);if(!p||!h)throw codeError('HERO_NOT_OWNED');if(p.star>=5)throw codeError('STAR_CAP');const cost=STAR_COST[p.star];if(p.fragments<cost)throw codeError('NOT_ENOUGH_FRAGMENTS');p.fragments-=cost;p.star++;dailyProgress(state,'upgrade1',1);state.updatedAt=nowIso();return{heroId,star:p.star,cost};}
function setFormation(state,formation,rows=null){if(!Array.isArray(formation)||formation.length<1||formation.length>5)throw codeError('INVALID_FORMATION');const unique=[...new Set(formation)];if(unique.length!==formation.length)throw codeError('INVALID_FORMATION');if(unique.some(id=>!state.heroes[id]))throw codeError('HERO_NOT_OWNED');state.formation=unique;state.formationRows=state.formationRows||{};for(const [i,id] of unique.entries()){const row=rows?.[id];state.formationRows[id]=['front','back'].includes(row)?row:(state.formationRows[id]|| (i<2?'front':'back'));}for(const id of Object.keys(state.formationRows))if(!unique.includes(id))delete state.formationRows[id];state.updatedAt=nowIso();return state.formation;}


function saveFormationPreset(state,slot,name=null){slot=String(slot);if(!['1','2','3'].includes(slot))throw codeError('INVALID_PRESET_SLOT');state.formationPresets||={};state.formationPresets[slot]={name:String(name||`阵容 ${slot}`).slice(0,20),formation:[...state.formation],rows:{...(state.formationRows||{})},relic:state.activeRelic||null,updatedAt:nowIso()};state.updatedAt=nowIso();return JSON.parse(JSON.stringify(state.formationPresets[slot]));}
function loadFormationPreset(state,slot){slot=String(slot);const p=state.formationPresets?.[slot];if(!p)throw codeError('PRESET_NOT_FOUND');const formation=(p.formation||[]).filter(id=>state.heroes[id]).slice(0,5);if(!formation.length)throw codeError('PRESET_EMPTY');setFormation(state,formation,p.rows||{});if(p.relic&&state.inventory.relics?.[p.relic])state.activeRelic=p.relic;state.updatedAt=nowIso();return{formation:[...state.formation],rows:{...state.formationRows},relic:state.activeRelic};}
function sweepInfo(state){const d=gameDay();if(!state.sweep||state.sweep.day!==d)state.sweep={day:d,used:0};return{day:d,used:state.sweep.used||0,left:Math.max(0,SWEEP_DAILY_LIMIT-(state.sweep.used||0)),limit:SWEEP_DAILY_LIMIT};}
function sweepStage(state,stage,count=1,rng=rand01){stage=Math.floor(Number(stage)||0);count=Math.max(1,Math.min(5,Math.floor(Number(count)||1)));const cleared=state.campaignCompleted||stage<state.stage;if(stage<1||stage>30||!cleared)throw codeError('STAGE_NOT_CLEARED');const info=sweepInfo(state);if(info.left<count)throw codeError('SWEEP_LIMIT');let coin=0,starIron=0,talentPoints=0,drops=[];for(let i=0;i<count;i++){coin+=180+stage*25;starIron+=stage>=10?8:4;if(rng()<.12){talentPoints++;}if(rng()<.16){const pool=EQUIPMENT.filter(e=>e.rarity===(stage>=20?'SR':'R'));if(pool.length){const item=randomPick(pool,rng);drops.push(addLoot(state,'equipment',item.id));}}}state.coin+=coin;state.inventory.starIron=(state.inventory.starIron||0)+starIron;state.inventory.talentPoints=(state.inventory.talentPoints||0)+talentPoints;state.sweep.used+=count;state.updatedAt=nowIso();return{stage,count,reward:{coin,starIron,talentPoints},drops,info:sweepInfo(state)};}
function nightEventStageById(id){return NIGHT_EVENT_STAGES.find(x=>x.id===id);}
function nightEventBattle(state,id){const st=nightEventStageById(id);if(!st)throw codeError('NIGHT_EVENT_STAGE_NOT_FOUND');if(formationPower(state)<st.power)throw codeError('POWER_TOO_LOW');const d=gameDay();state.nightEvent||={id:NIGHT_EVENT_CONFIG.id,voyageBadge:0,clears:[],firstClears:[],shop:{},day:d,runs:0};if(state.nightEvent.day!==d){state.nightEvent.day=d;state.nightEvent.runs=0;}if(state.nightEvent.runs>=6)throw codeError('NIGHT_EVENT_ATTEMPTS_EXHAUSTED');state.nightEvent.runs++;rewardState(state,st.reward);const first=!state.nightEvent.firstClears.includes(id);if(first){state.nightEvent.firstClears.push(id);rewardState(state,st.first||{});}if(!state.nightEvent.clears.includes(id))state.nightEvent.clears.push(id);state.updatedAt=nowIso();return{id,name:st.name,reward:st.reward,firstReward:first?st.first:null,first};}
function nightEventShopBuy(state,id){const item=NIGHT_EVENT_SHOP.find(x=>x.id===id);if(!item)throw codeError('NIGHT_EVENT_SHOP_ITEM_NOT_FOUND');state.nightEvent||={id:NIGHT_EVENT_CONFIG.id,voyageBadge:0,clears:[],firstClears:[],shop:{},day:gameDay(),runs:0};const bought=Number(state.nightEvent.shop?.[id])||0;if(bought>=item.limit)throw codeError('NIGHT_EVENT_SHOP_LIMIT');if(state.nightEvent.voyageBadge<item.cost)throw codeError('NOT_ENOUGH_VOYAGE_BADGE');state.nightEvent.voyageBadge-=item.cost;state.nightEvent.shop||={};state.nightEvent.shop[id]=bought+1;if(item.reward.heroId){const h=byId(item.reward.heroId),p=state.heroes[item.reward.heroId];if(!p)state.heroes[item.reward.heroId]={level:1,star:1,fragments:item.reward.fragments||0,awakening:0,signature:null,equipment:blankEquipment()};else p.fragments+=(item.reward.fragments||0);state.bond[item.reward.heroId]||={points:0};}else rewardState(state,item.reward);state.updatedAt=nowIso();return{id,reward:item.reward,bought:bought+1,left:item.limit-bought-1};}

function equipmentSetCounts(p){const counts={};for(const id of Object.values(p?.equipment||{})){const set=equipmentById(id)?.set;if(set)counts[set]=(counts[set]||0)+1;}return counts;}
function equipmentSetBonus(p){const counts=equipmentSetCounts(p),out={hpPct:0,atkPct:0,defPct:0,spdPct:0,spdFlat:0};for(const [id,n] of Object.entries(counts)){const set=EQUIPMENT_SETS[id];if(!set)continue;for(const cfg of [n>=2?set.two:null,n>=3?set.three:null])if(cfg)for(const k of ['hpPct','atkPct','defPct','spdPct','spdFlat'])out[k]+=(Number(cfg[k])||0);}return out;}
function activeEquipmentSets(p){return Object.entries(equipmentSetCounts(p)).map(([id,count])=>({id,count,name:EQUIPMENT_SETS[id]?.name||id,two:count>=2?EQUIPMENT_SETS[id]?.two?.label:'',three:count>=3?EQUIPMENT_SETS[id]?.three?.label:''})).filter(x=>x.count>=2);}
function equipmentStats(p,state=null){const out={hp:0,atk:0,def:0,spd:0};for(const id of Object.values(p?.equipment||{})){const item=equipmentById(id);if(!item)continue;const lv=state?Math.max(0,Math.min(10,Number(state.inventory?.enhance?.[id])||0)):0;const mul=1+lv*.12;for(const [k,v] of Object.entries(item.stats||{}))out[k]=(out[k]||0)+Math.round(Number(v||0)*mul);}return out;}
function countEquipped(state,itemId,exceptHeroId=null){let n=0;for(const [hid,p] of Object.entries(state.heroes)){if(hid===exceptHeroId)continue;for(const x of Object.values(p.equipment||{}))if(x===itemId)n++;}return n;}
function equipGear(state,heroId,itemId){const p=state.heroes[heroId],item=equipmentById(itemId);if(!p)throw codeError('HERO_NOT_OWNED');if(!item)throw codeError('ITEM_NOT_FOUND');const owned=Number(state.inventory?.equipment?.[itemId])||0;if(owned<=0)throw codeError('ITEM_NOT_OWNED');if(countEquipped(state,itemId,heroId)>=owned)throw codeError('ITEM_IN_USE');p.equipment||=blankEquipment();p.equipment[item.slot]=itemId;dailyProgress(state,'upgrade1',1);state.updatedAt=nowIso();return{heroId,itemId,slot:item.slot};}
function unequipGear(state,heroId,slot){const p=state.heroes[heroId];if(!p)throw codeError('HERO_NOT_OWNED');if(!['weapon','armor','charm'].includes(slot))throw codeError('INVALID_SLOT');p.equipment||=blankEquipment();const old=p.equipment[slot]||null;p.equipment[slot]=null;state.updatedAt=nowIso();return{heroId,slot,itemId:old};}
function equipRelic(state,relicId){if(relicId==null||relicId===''){state.activeRelic=null;state.updatedAt=nowIso();return{relicId:null};}const relic=relicById(relicId);if(!relic)throw codeError('ITEM_NOT_FOUND');if((Number(state.inventory?.relics?.[relicId])||0)<=0)throw codeError('ITEM_NOT_OWNED');state.activeRelic=relicId;dailyProgress(state,'upgrade1',1);state.updatedAt=nowIso();return{relicId};}
function addLoot(state,kind,id,count=1){const bag=kind==='relic'?state.inventory.relics:state.inventory.equipment;bag[id]=(Number(bag[id])||0)+count;return{kind,id,count,item:kind==='relic'?relicById(id):equipmentById(id)};}

function enhanceCost(itemId,state){const item=equipmentById(itemId);if(!item)throw codeError('ITEM_NOT_FOUND');const lv=Math.max(0,Math.min(10,Number(state.inventory?.enhance?.[itemId])||0));const rarityMul=item.rarity==='SSR'?2.2:item.rarity==='SR'?1.55:1;return{level:lv,coin:Math.round((300+lv*220)*rarityMul),starIron:Math.round((12+lv*8)*rarityMul)};}
function enhanceEquipment(state,itemId){const item=equipmentById(itemId);if(!item)throw codeError('ITEM_NOT_FOUND');if((Number(state.inventory?.equipment?.[itemId])||0)<=0)throw codeError('ITEM_NOT_OWNED');const c=enhanceCost(itemId,state);if(c.level>=10)throw codeError('ENHANCE_CAP');if(state.coin<c.coin)throw codeError('NOT_ENOUGH_COIN');if((Number(state.inventory.starIron)||0)<c.starIron)throw codeError('NOT_ENOUGH_STAR_IRON');state.coin-=c.coin;state.inventory.starIron-=c.starIron;state.inventory.enhance[itemId]=c.level+1;dailyProgress(state,'upgrade1',1);weeklyProgress(state,'enhance3',1);state.updatedAt=nowIso();return{itemId,level:c.level+1,cost:{coin:c.coin,starIron:c.starIron}};}
function dismantleEquipment(state,itemId,count=1){const item=equipmentById(itemId);count=Math.max(1,Math.floor(Number(count)||1));if(!item)throw codeError('ITEM_NOT_FOUND');const owned=Number(state.inventory?.equipment?.[itemId])||0,used=countEquipped(state,itemId);if(owned-used<count)throw codeError('NO_SPARE_EQUIPMENT');const dust=(DISMANTLE_DUST[item.rarity]||25)*count;state.inventory.equipment[itemId]=owned-count;state.inventory.forgeDust=(Number(state.inventory.forgeDust)||0)+dust;state.forge||={crafted:0,dismantled:0};state.forge.dismantled+=count;state.updatedAt=nowIso();return{itemId,count,forgeDust:dust};}
function forgeRecipeById(id){return FORGE_RECIPES.find(x=>x.id===id);}
function forgeEquipment(state,recipeId){const r=forgeRecipeById(recipeId);if(!r)throw codeError('FORGE_RECIPE_NOT_FOUND');const c=r.cost;if(state.coin<c.coin)throw codeError('NOT_ENOUGH_COIN');if((Number(state.inventory.starIron)||0)<c.starIron)throw codeError('NOT_ENOUGH_STAR_IRON');if((Number(state.inventory.forgeDust)||0)<c.forgeDust)throw codeError('NOT_ENOUGH_FORGE_DUST');state.coin-=c.coin;state.inventory.starIron-=c.starIron;state.inventory.forgeDust-=c.forgeDust;state.inventory.equipment[r.itemId]=(Number(state.inventory.equipment[r.itemId])||0)+1;state.inventory.enhance[r.itemId]??=0;state.forge||={crafted:0,dismantled:0};state.forge.crafted++;dailyProgress(state,'upgrade1',1);state.updatedAt=nowIso();return{recipeId,itemId:r.itemId,item:equipmentById(r.itemId),cost:c};}
function bondInfo(state,heroId){if(!state.heroes[heroId])throw codeError('HERO_NOT_OWNED');state.bond||={};state.bond[heroId]||={points:0};const points=Number(state.bond[heroId].points)||0;let level=1;for(let i=1;i<BOND_THRESHOLDS.length;i++)if(points>=BOND_THRESHOLDS[i])level=i+1;const next=level>=5?null:BOND_THRESHOLDS[level];return{heroId,points,level,next,stories:(BOND_STORIES[heroId]||[]).map((title,i)=>({level:[2,3,5][i],title,unlocked:level>=[2,3,5][i]}))};}
function giftHero(state,heroId,count=1){count=Math.max(1,Math.floor(Number(count)||1));if(!state.heroes[heroId])throw codeError('HERO_NOT_OWNED');if((Number(state.inventory.bondGift)||0)<count)throw codeError('NOT_ENOUGH_BOND_GIFT');state.inventory.bondGift-=count;state.bond||={};state.bond[heroId]||={points:0};state.bond[heroId].points=(Number(state.bond[heroId].points)||0)+count*50;state.updatedAt=nowIso();return{count,info:bondInfo(state,heroId)};}
function eventStageById(id){return EVENT_STAGES.find(x=>x.id===id);}
function eventBattle(state,id){const st=eventStageById(id);if(!st)throw codeError('EVENT_STAGE_NOT_FOUND');if(formationPower(state)<st.power)throw codeError('POWER_TOO_LOW');state.event||={id:EVENT_CONFIG.id,moonSeal:0,clears:[],firstClears:[],shop:{},day:gameDay(),runs:0};if(state.event.day!==gameDay()){state.event.day=gameDay();state.event.runs=0;}if((Number(state.event.runs)||0)>=EVENT_DAILY_ATTEMPTS)throw codeError('EVENT_ATTEMPTS_EXHAUSTED');state.event.runs=(Number(state.event.runs)||0)+1;rewardState(state,st.reward);const first=!state.event.firstClears.includes(id);if(first){state.event.firstClears.push(id);rewardState(state,st.first||{});}if(!state.event.clears.includes(id))state.event.clears.push(id);weeklyProgress(state,'battle12',1);weeklyProgress(state,'win8',1);state.updatedAt=nowIso();return{id,name:st.name,reward:st.reward,firstReward:first?st.first:null,first};}
function eventShopBuy(state,id){const item=EVENT_SHOP.find(x=>x.id===id);if(!item)throw codeError('EVENT_SHOP_ITEM_NOT_FOUND');state.event||={id:EVENT_CONFIG.id,moonSeal:0,clears:[],firstClears:[],shop:{}};state.event.shop||={};const bought=Number(state.event.shop[id])||0;if(bought>=item.limit)throw codeError('EVENT_SHOP_LIMIT_REACHED');if((Number(state.event.moonSeal)||0)<item.cost)throw codeError('NOT_ENOUGH_MOON_SEAL');state.event.moonSeal-=item.cost;if(item.reward.heroId){const p=state.heroes[item.reward.heroId];if(!p)state.heroes[item.reward.heroId]={level:1,star:1,fragments:item.reward.fragments||0,awakening:0,signature:null,equipment:blankEquipment()};else p.fragments+=(item.reward.fragments||0);state.bond[item.reward.heroId]||={points:0};}else rewardState(state,item.reward);state.event.shop[id]=bought+1;state.updatedAt=nowIso();return{id,reward:item.reward,bought:bought+1,left:item.limit-bought-1};}

function ensureResourceRuns(state,date=new Date()){const day=gameDay(date);if(!state.resourceRuns||state.resourceRuns.day!==day)state.resourceRuns={day,used:{}};state.resourceRuns.used||={};return state.resourceRuns;}
function resourceDungeonById(id){return RESOURCE_DUNGEONS.find(x=>x.id===id);}
function resourceDungeon(state,id){ensureResourceRuns(state);const d=resourceDungeonById(id);if(!d)throw codeError('DUNGEON_NOT_FOUND');const used=Number(state.resourceRuns.used[id])||0;if(used>=d.attempts)throw codeError('DUNGEON_ATTEMPTS_EXHAUSTED');if(formationPower(state)<d.power)throw codeError('POWER_TOO_LOW');state.resourceRuns.used[id]=used+1;rewardState(state,d.reward);dailyProgress(state,'battle3',1);dailyProgress(state,'win2',1);weeklyProgress(state,'battle12',1);weeklyProgress(state,'win8',1);weeklyProgress(state,'resource5',1);state.updatedAt=nowIso();return{id,name:d.name,reward:d.reward,used:used+1,left:d.attempts-used-1};}
function achievementProgress(state,a){if(a.type==='heroCount')return Object.keys(state.heroes).length;if(a.type==='ssrCount')return Object.keys(state.heroes).filter(id=>byId(id)?.rarity==='SSR').length;if(a.type==='stage')return state.campaignCompleted?30:state.stage;if(a.type==='bossCount')return state.bossClears.length;if(a.type==='maxEnhance')return Math.max(0,...Object.values(state.inventory?.enhance||{}).map(Number));if(a.type==='power')return formationPower(state);if(a.type==='craftedCount')return Number(state.forge?.crafted)||0;if(a.type==='maxBondLevel')return Math.max(1,...Object.keys(state.heroes).map(id=>bondInfo(state,id).level));if(a.type==='eventClears')return state.event?.clears?.length||0;return 0;}
function claimAchievement(state,id){const a=ACHIEVEMENTS.find(x=>x.id===id);if(!a)throw codeError('ACHIEVEMENT_NOT_FOUND');if(state.achievements?.claimed?.[id])throw codeError('ACHIEVEMENT_ALREADY_CLAIMED');const p=achievementProgress(state,a);if(p<a.goal)throw codeError('ACHIEVEMENT_NOT_READY');rewardState(state,a.reward);state.achievements.claimed[id]=true;state.updatedAt=nowIso();return{id,reward:a.reward,progress:p};}

function factionCounts(state){const counts={};for(const id of state.formation){const h=byId(id);if(h)counts[h.faction]=(counts[h.faction]||0)+1;}return counts;}
function factionBonusFor(state,hero){const c=factionCounts(state)[hero.faction]||0,cfg=FACTION_BONUSES[hero.faction]||{},out={hpPct:0,atkPct:0,defPct:0,spdPct:0};if(c>=2)Object.assign(out,mergeBonus(out,cfg.two));if(c>=3)Object.assign(out,mergeBonus(out,cfg.three));return out;}
function mergeBonus(a,b={}){return{hpPct:(a.hpPct||0)+(b.hpPct||0),atkPct:(a.atkPct||0)+(b.atkPct||0),defPct:(a.defPct||0)+(b.defPct||0),spdPct:(a.spdPct||0)+(b.spdPct||0)};}
function activeFactionBonuses(state){const counts=factionCounts(state);return Object.entries(counts).filter(([,n])=>n>=2).map(([faction,count])=>({faction,count,two:FACTION_BONUSES[faction]?.two?.label||'',three:count>=3?(FACTION_BONUSES[faction]?.three?.label||''):''}));}
function relicBonus(state){return relicById(state.activeRelic)?.bonus||{};}
function statScale(p){return(1+(p.level-1)*.085)*(1+(p.star-1)*.12);}
function computedStats(h,p,state=null){const s=statScale(p),gear=equipmentStats(p,state),f=state?factionBonusFor(state,h):{},r=state?relicBonus(state):{},set=equipmentSetBonus(p),sig=(p.signature&&signatureById(p.signature)?.heroId===h.id)?signatureById(p.signature):null,aw=Math.max(0,Math.min(3,Number(p.awakening)||0)),awPct=aw*.06,tal=state?talentBonus(state,h.id):{};return{
  hp:Math.round((h.hp*s+gear.hp+(sig?.stats?.hp||0))*(1+(f.hpPct||0)+(r.hpPct||0)+(set.hpPct||0)+(sig?.bonus?.hpPct||0)+awPct+(tal.hpPct||0))),
  atk:Math.round((h.atk*s+gear.atk+(sig?.stats?.atk||0))*(1+(f.atkPct||0)+(r.atkPct||0)+(set.atkPct||0)+(sig?.bonus?.atkPct||0)+awPct+(tal.atkPct||0))),
  def:Math.round((h.def*s+gear.def+(sig?.stats?.def||0))*(1+(f.defPct||0)+(r.defPct||0)+(set.defPct||0)+awPct+(tal.defPct||0))),
  spd:Math.round((h.spd+gear.spd+(sig?.stats?.spd||0))*(1+(f.spdPct||0)+(set.spdPct||0))+(r.spdFlat||0)+(set.spdFlat||0)+aw*2)
};}
function heroPower(h,p,state=null){const z=computedStats(h,p,state);return Math.floor(z.hp*.18+z.atk*2+z.def*1.35+z.spd*.8);}
function formationPower(state){return state.formation.reduce((n,id)=>{const h=byId(id),p=state.heroes[id];return h&&p?n+heroPower(h,p,state):n},0);}

function enemyCombatClass(stage,index=0,isBoss=false){if(isBoss){return({5:'arcane',10:'guard',15:'assault',20:'control',25:'guard',30:'assault'})[stage]||'guard';}return ['guard','control','arcane','assault'][Math.abs(stage+index)%4];}
function enemyTeam(stage){
  const boss=bossByStage(stage);
  if(boss){const minionScale=1+(stage-1)*.09;const minions=Array.from({length:2},(_,i)=>({id:`m${i}`,name:`裂境侍从 ${stage}-${i+1}`,hp:Math.round((700+stage*70)*minionScale),atk:Math.round((90+stage*9)*minionScale),def:Math.round((45+stage*4)*minionScale),spd:84+i*5+Math.floor(stage/2),skill:'裂境冲击',skillType:'enemy'}));return[{...boss,id:`boss-${stage}`,isBoss:true},...minions];}
  const size=Math.min(5,2+Math.floor((stage-1)/3)),scale=1+(stage-1)*.12;
  return Array.from({length:size},(_,i)=>({id:`e${i}`,name:`裂境体 ${stage}-${i+1}`,hp:Math.round((900+stage*95)*scale),atk:Math.round((115+stage*13)*scale),def:Math.round((58+stage*5)*scale),spd:80+i*4+stage,skill:'裂境冲击',skillType:'enemy'}));
}
function skillRuleFor(id){return SKILL_RULES[id]||{cost:100,gain:34,cooldown:1,range:'any'};}
function makeUnit(h,p,state,row='front'){const z=computedStats(h,p,state),r=relicBonus(state),sig=(p.signature&&signatureById(p.signature)?.heroId===h.id)?signatureById(p.signature):null,rule=skillRuleFor(h.id);return{id:h.id,name:h.name,hp:z.hp,maxHp:z.hp,atk:z.atk,baseAtk:z.atk,def:z.def,spd:z.spd,baseSpd:z.spd,skill:h.skill,skillType:h.skillType,combatClass:combatClassForHero(h),talentBonus:talentBonus(state,h.id),signatureBonus:sig?.bonus||{},turns:0,stun:0,silence:0,taunt:0,shield:Math.round(z.hp*(r.startShieldPct||0)),atkBuff:0,slow:0,energy:0,skillCost:rule.cost,energyGain:rule.gain,skillCooldown:rule.cooldown,cooldownLeft:0,row,range:rule.range||'any',phase:1,maxPhase:1};}
function living(team){return team.filter(x=>x.hp>0);}
function applyDamage(target,amount,actor=null){let scaled=Number(amount)||0;if(actor)scaled*=classMultiplier(actor,target);if((target.breakWindow||0)>0)scaled*=1.35;let dmg=Math.max(1,Math.round(scaled));const absorbed=Math.min(target.shield||0,dmg);target.shield=Math.max(0,(target.shield||0)-absorbed);dmg-=absorbed;target.hp=Math.max(0,target.hp-dmg);return{hpDamage:dmg,absorbed};}
function targetable(actor,targets){const alive=living(targets),taunter=alive.find(x=>(x.taunt||0)>0);if(taunter)return[taunter];if(actor?.range==='any')return alive;const front=alive.filter(x=>x.row==='front');return front.length?front:alive;}
function preferredTarget(targets,rng,targetId=null,actor=null){const pool=targetable(actor,targets),picked=targetId?pool.find(x=>x.id===targetId):null;if(picked)return picked;return randomPick(pool,rng);}
function applyBossBreak(target,amount){if(!target?.isBoss||target.hp<=0)return;target.breakMax=Math.max(1,Number(target.breakMax)||150);target.breakGauge=Math.max(0,Number(target.breakGauge??target.breakMax)-Math.max(1,Math.round(amount)));if(target.breakGauge<=0){target.breakCount=(Number(target.breakCount)||0)+1;target.breakGauge=target.breakMax;target.stun=Math.max(target.stun||0,1);target.breakWindow=1;target.breakNotice=`✦ ${target.name}韧性被击破！进入失衡状态 1 回合`;}}
function flushBreakNotices(targets,log){for(const t of targets){if(t.breakNotice){log.push(t.breakNotice);delete t.breakNotice;}}}
function basicAttack(actor,targets,rng,log,targetId=null){const t=preferredTarget(targets,rng,targetId,actor),raw=actor.atk,crit=rng()<.12,dealt=applyDamage(t,Math.max(1,raw*(crit?1.65:1)-t.def*.55+(rng()*18-9)),actor);applyBossBreak(t,crit?18:10);log.push(`${actor.name}攻击 ${t.name}，${crit?'暴击！':''}造成 ${dealt.hpDamage} 伤害${dealt.absorbed?`（护盾吸收${dealt.absorbed}）`:''}${t.hp===0?'，击倒':''}`);flushBreakNotices(targets,log);}
function skillTargetMode(skillType){if(skillType==='heal')return'ally';if(['burst','burstLite','stun','slow','silence','execute','executeLite'].includes(skillType))return'enemy';return'none';}
function skillAction(actor,allies,enemies,rng,log,targetId=null){
  const foes=living(enemies),friends=living(allies);if(!foes.length)return;const targetRandom=()=>preferredTarget(foes,rng,targetId,actor),skillBoost=1+(actor.signatureBonus?.skillPct||0),hit=(t,mult)=>{const talentSkill=1+(actor.talentBonus?.skillPct||0),crit=rng()<.16,d=applyDamage(t,actor.atk*mult*skillBoost*talentSkill*(crit?1.5:1)-t.def*.42+(rng()*12-6),actor);applyBossBreak(t,crit?28:18);return{...d,crit};},mark=d=>d.crit?' · 暴击':'';
  switch(actor.skillType){
    case'burst':{const t=targetRandom(),d=hit(t,2.2);log.push(`${actor.name}施放「${actor.skill}」，对 ${t.name} 造成 ${d.hpDamage} 爆发伤害${mark(d)}${t.hp===0?'，击倒':''}`);break;}
    case'burstLite':{const t=targetRandom(),d=hit(t,1.75);log.push(`${actor.name}施放「${actor.skill}」，造成 ${d.hpDamage} 伤害${mark(d)}`);break;}
    case'aoe':{let total=0;for(const t of foes)total+=hit(t,1.05).hpDamage;log.push(`${actor.name}施放「${actor.skill}」，席卷全体敌人，总计造成 ${total} 伤害`);break;}
    case'aoeLite':{let total=0;for(const t of foes)total+=hit(t,.82).hpDamage;log.push(`${actor.name}施放「${actor.skill}」，对敌方全体造成 ${total} 伤害`);break;}
    case'heal':{const t=friends.find(x=>x.id===targetId)||[...friends].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],heal=Math.round(actor.atk*1.65*(1+(actor.signatureBonus?.healPct||0)+(actor.talentBonus?.healPct||0))),actual=Math.min(heal,t.maxHp-t.hp);t.hp+=actual;log.push(`${actor.name}施放「${actor.skill}」，为 ${t.name} 恢复 ${actual} 生命`);break;}
    case'healAll':{let total=0;for(const t of friends){const actual=Math.min(Math.round(actor.atk*.65*(1+(actor.talentBonus?.healPct||0))),t.maxHp-t.hp);t.hp+=actual;total+=actual;}log.push(`${actor.name}施放「${actor.skill}」，全队共恢复 ${total} 生命`);break;}
    case'cleanseSupport':{let total=0,clean=0;for(const t of friends){const actual=Math.min(Math.round(actor.atk*.45*(1+(actor.talentBonus?.healPct||0))),t.maxHp-t.hp);t.hp+=actual;t.atkBuff=Math.max(t.atkBuff,2);if(t.stun||t.silence||t.slow){clean++;t.stun=0;t.silence=0;t.slow=0;}total+=actual;}log.push(`${actor.name}施放「${actor.skill}」，恢复全队 ${total} 生命、强化攻击并净化 ${clean} 个异常状态`);break;}
    case'buff':{for(const t of friends)t.atkBuff=Math.max(t.atkBuff,2);log.push(`${actor.name}点亮「${actor.skill}」，全队攻击提升2回合`);break;}
    case'stun':{const t=targetRandom(),d=hit(t,1.1),ok=rng()<.38;if(ok)t.stun=Math.max(t.stun,1);log.push(`${actor.name}施放「${actor.skill}」，造成 ${d.hpDamage} 伤害${mark(d)}${ok?'并眩晕目标':''}`);break;}
    case'silence':{const t=targetRandom(),d=hit(t,1.05);t.slow=Math.max(t.slow,1);t.silence=Math.max(t.silence,1);log.push(`${actor.name}施放「${actor.skill}」，造成 ${d.hpDamage} 伤害${mark(d)}并使 ${t.name} 沉默1回合`);break;}
    case'tauntShield':{for(const t of friends)t.shield+=Math.round(actor.def*.45*(1+(actor.talentBonus?.shieldPct||0)));actor.shield+=Math.round(actor.def*1.35*(1+(actor.talentBonus?.shieldPct||0)));actor.taunt=Math.max(actor.taunt,2);log.push(`${actor.name}施放「${actor.skill}」，为全队生成护盾并嘲讽敌方2回合`);break;}
    case'selfShield':{actor.shield+=Math.round(actor.def*2*(1+(actor.talentBonus?.shieldPct||0)));log.push(`${actor.name}施放「${actor.skill}」，获得 ${Math.round(actor.def*2*(1+(actor.talentBonus?.shieldPct||0)))} 护盾`);break;}
    case'multi':{let total=0;for(let i=0;i<3&&living(enemies).length;i++){const t=randomPick(targetable(actor,enemies),rng);total+=hit(t,.76).hpDamage;}log.push(`${actor.name}施放「${actor.skill}」，三连击共造成 ${total} 伤害`);break;}
    case'execute':{const t=foes.find(x=>x.id===targetId)||[...foes].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],mult=(t.hp/t.maxHp<.35?2.75:1.85)*(1+(actor.signatureBonus?.executePct||0)),d=hit(t,mult);log.push(`${actor.name}施放「${actor.skill}」，追击 ${t.name} 造成 ${d.hpDamage} 伤害${mark(d)}${t.hp===0?'，完成斩杀':''}`);break;}
    case'executeLite':{const t=foes.find(x=>x.id===targetId)||[...foes].sort((a,b)=>a.hp-b.hp)[0],mult=t.hp/t.maxHp<.3?2.15:1.55,d=hit(t,mult);log.push(`${actor.name}施放「${actor.skill}」，造成 ${d.hpDamage} 伤害${mark(d)}`);break;}
    default:{const t=targetRandom(),d=hit(t,1.55);log.push(`${actor.name}施放「${actor.skill}」，造成 ${d.hpDamage} 伤害`);}
  }
  flushBreakNotices(enemies,log);
}
function bossSkillAction(actor,allies,enemies,rng,log){const foes=living(enemies);if(!foes.length)return;const phaseCfg=BOSS_PHASE_SKILLS[actor.stage]?.[actor.phase];if(phaseCfg){if(phaseCfg.shieldPct)actor.shield+=Math.round(actor.maxHp*phaseCfg.shieldPct);if(phaseCfg.target==='lowest'){const t=[...foes].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],d=applyDamage(t,actor.atk*phaseCfg.mult-t.def*.32);log.push(`⚠ ${actor.name}发动阶段技能「${phaseCfg.name}」，对 ${t.name} 造成 ${d.hpDamage} 伤害`);return;}let total=0,affected=0;for(const t of foes){total+=applyDamage(t,actor.atk*phaseCfg.mult-t.def*.30).hpDamage;if(phaseCfg.status&&rng()<phaseCfg.chance){if(phaseCfg.status==='stun')t.stun=Math.max(t.stun,1);if(phaseCfg.status==='silence')t.silence=Math.max(t.silence,1);if(phaseCfg.status==='slow')t.slow=Math.max(t.slow,2);affected++;}}log.push(`⚠ ${actor.name}发动阶段技能「${phaseCfg.name}」，造成 ${total} 群体伤害${phaseCfg.shieldPct?'并获得阶段护盾':''}${affected?`，附加${phaseCfg.status==='silence'?'沉默':phaseCfg.status==='stun'?'眩晕':'减速'} ${affected} 人`:''}`);return;}switch(actor.skillType){
  case'bossAoe':{let total=0;for(const t of foes)total+=applyDamage(t,actor.atk*.82-t.def*.35,actor).hpDamage;log.push(`⚠ ${actor.name}发动「${actor.skill}」，全队受到 ${total} 伤害`);break;}
  case'bossShield':{actor.shield+=Math.round(actor.maxHp*.13);const t=randomPick(foes,rng),d=applyDamage(t,actor.atk*1.25-t.def*.4,actor);log.push(`⚠ ${actor.name}发动「${actor.skill}」，获得护盾并对 ${t.name} 造成 ${d.hpDamage} 伤害`);break;}
  case'bossExecute':{const t=[...foes].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],d=applyDamage(t,actor.atk*2.05-t.def*.35,actor);log.push(`⚠ ${actor.name}发动「${actor.skill}」，猎杀 ${t.name} 造成 ${d.hpDamage} 伤害`);break;}
  case'bossStun':{let total=0,stuns=0;for(const t of foes){total+=applyDamage(t,actor.atk*.72-t.def*.3,actor).hpDamage;if(rng()<.25){t.stun=Math.max(t.stun,1);stuns++;}}log.push(`⚠ ${actor.name}发动「${actor.skill}」，造成 ${total} 群体伤害${stuns?`并眩晕 ${stuns} 人`:''}`);break;}
  case'bossFinal':{let total=0;for(const t of foes)total+=applyDamage(t,actor.atk*1.05-t.def*.3,actor).hpDamage;actor.atkBuff=Math.max(actor.atkBuff,2);log.push(`⚠ ${actor.name}发动「${actor.skill}」，造成 ${total} 终焉伤害并强化自身`);break;}
  default:{const t=randomPick(foes,rng),d=applyDamage(t,actor.atk*1.45-t.def*.5);log.push(`${actor.name}施放「${actor.skill}」，造成 ${d.hpDamage} 伤害`);}
}}
function effectiveSpeed(u){const phaseSpd=u.isBoss&&u.phase>=3?1.12:1;return Math.round(u.baseSpd*phaseSpd*(u.slow>0?.78:1));}
function refreshActor(u){const phaseAtk=u.isBoss?(u.phase>=3?1.42:u.phase===2?1.18:1):1;u.atk=Math.round(u.baseAtk*phaseAtk*(u.atkBuff>0?1.18:1));}
function endActorTurn(u){if(u.atkBuff>0)u.atkBuff--;if(u.slow>0)u.slow--;if(u.silence>0)u.silence--;if(u.taunt>0)u.taunt--;refreshActor(u);}
function rollLoot(state,stage,rng,isBoss){const drops=[];const boss=bossByStage(stage);if(isBoss&&boss&&!state.bossClears.includes(stage)){state.bossClears.push(stage);if(boss.firstReward?.equipment)drops.push(addLoot(state,'equipment',boss.firstReward.equipment));if(boss.firstReward?.relic)drops.push(addLoot(state,'relic',boss.firstReward.relic));}
  if(rng()<.36){let rarity='R';const x=rng();if(stage>=20&&x<.06)rarity='SSR';else if(stage>=10&&x<.28)rarity='SR';const canRelic=stage>=10&&rng()<.18;const pool=canRelic?RELICS.filter(r=>r.rarity===rarity):EQUIPMENT.filter(e=>e.rarity===rarity);if(pool.length){const item=randomPick(pool,rng);drops.push(addLoot(state,canRelic?'relic':'equipment',item.id));}}
  return drops;
}


function metricSnapshot(friends,foes){return{friendHp:living(friends).reduce((n,x)=>n+x.hp,0),friendShield:friends.reduce((n,x)=>n+(x.shield||0),0),foeHp:living(foes).reduce((n,x)=>n+x.hp,0)};}
function ensureStat(stats,id,name){stats[id]||={id,name,damage:0,heal:0,shield:0,skills:0,combo:0};return stats[id];}
function recordMetrics(stats,actor,before,friends,foes){if(!actor||!before)return;const st=ensureStat(stats,actor.id,actor.name),after=metricSnapshot(friends,foes);st.damage+=Math.max(0,before.foeHp-after.foeHp);st.heal+=Math.max(0,after.friendHp-before.friendHp);st.shield+=Math.max(0,after.friendShield-before.friendShield);}
function battleStatRows(stats={}){return Object.values(stats).map(x=>({...x})).sort((a,b)=>(b.damage+b.heal*.7+b.shield*.35)-(a.damage+a.heal*.7+a.shield*.35));}
function comboForCast(skillCasts,used,formation){return COMBO_SKILLS.find(c=>!used.includes(c.id)&&c.members.every(id=>formation.includes(id)&&skillCasts[id]));}
function triggerCombo(allies,enemies,skillCasts,used,stats,log){const formation=allies.map(x=>x.id);let c;while((c=comboForCast(skillCasts,used,formation))){used.push(c.id);const members=c.members.map(id=>allies.find(x=>x.id===id)).filter(Boolean);if(members.length<2)break;if(c.id==='mirrorTide'){let heal=0,shield=0;for(const t of living(allies)){const h=Math.min(Math.round(t.maxHp*.12),t.maxHp-t.hp);t.hp+=h;const sh=Math.round(t.maxHp*.08);t.shield+=sh;heal+=h;shield+=sh;}log.push(`✦ 连携技「${c.name}」发动：全队恢复 ${heal} 生命并获得 ${shield} 护盾`);}else{const power=members.reduce((n,x)=>n+x.atk,0),mult=c.id==='starSever'?.78:.68;let total=0;for(const t of living(enemies)){const d=applyDamage(t,power*mult-t.def*.22);total+=d.hpDamage;applyBossBreak(t,c.id==='starSever'?28:18);}log.push(`✦ 连携技「${c.name}」发动，对敌方全体造成 ${total} 伤害`);flushBreakNotices(enemies,log);}}}
function classifyBattleEvent(text=''){const nums=[...String(text).matchAll(/([0-9,]+)/g)].map(x=>Number(x[1].replace(/,/g,'')));if(/恢复/.test(text))return{kind:'heal',value:nums.length?nums[nums.length-1]:0};if(/护盾/.test(text)&&!/吸收/.test(text))return{kind:'shield',value:nums.length?nums[nums.length-1]:0};if(/暴击/.test(text))return{kind:'critical',value:nums.length?nums[nums.length-1]:0};if(/伤害|攻击/.test(text))return{kind:'damage',value:nums.length?nums[nums.length-1]:0};if(/净化/.test(text))return{kind:'status',status:'cleanse'};if(/沉默/.test(text))return{kind:'status',status:'silence'};if(/嘲讽/.test(text))return{kind:'status',status:'taunt'};if(/眩晕/.test(text))return{kind:'status',status:'stun'};return{kind:'info',value:0};}

function autoStrategyInfo(id){return AUTO_STRATEGIES[id]||AUTO_STRATEGIES.balanced;}
function teamHealthRatio(team){const alive=living(team);if(!alive.length)return 0;return alive.reduce((n,u)=>n+u.hp/u.maxHp,0)/alive.length;}
function shouldAutoUseSkill(actor,friends,enemies,strategy='balanced'){if((actor.silence||0)>0)return false;if(strategy==='survival'){if(['heal','healAll','cleanseSupport','tauntShield','selfShield','buff'].includes(actor.skillType))return true;return teamHealthRatio(friends)>.42;}if(strategy==='burst'&&['heal','healAll','cleanseSupport','tauntShield','selfShield'].includes(actor.skillType))return teamHealthRatio(friends)<.78;return true;}
function autoTargetFor(actor,friends,enemies,strategy='balanced'){const mode=skillTargetMode(actor.skillType);if(mode==='ally')return [...living(friends)].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]?.id||null;if(mode==='enemy'&&strategy==='burst')return [...targetable(actor,enemies)].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]?.id||null;return null;}
function recordBattleReplay(state,result){state.battleReplays=Array.isArray(state.battleReplays)?state.battleReplays:[];const replay={id:`rp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`,createdAt:nowIso(),stage:result.stage,win:!!result.win,formationPower:result.formationPower||0,skillMode:result.skillMode||'auto',autoStrategy:result.autoStrategy||state.battlePrefs?.autoStrategy||'balanced',boss:result.boss||null,rewards:result.rewards||{},drops:result.drops||[],log:(result.log||[]).slice(-120),timeline:(result.timeline||[]).slice(-260),stats:result.stats||[],combosUsed:result.combosUsed||[]};state.battleReplays.unshift(replay);state.battleReplays=state.battleReplays.slice(0,5);return replay;}
function battleReplays(state){return (state.battleReplays||[]).map(x=>JSON.parse(JSON.stringify(x)));}
function battleSessionView(session){if(!session)return null;return JSON.parse(JSON.stringify({id:session.id,status:session.status,stage:session.stage,round:session.round,pending:session.pending,allies:session.allies,enemies:session.enemies,log:session.log,timeline:session.timeline,result:session.result,formationPower:session.formationPower,boss:session.boss,mode:session.mode,autoStrategy:session.autoStrategy||'balanced',stats:battleStatRows(session.stats||{}),combosUsed:session.combosUsed||[],startedAt:session.startedAt,updatedAt:session.updatedAt}));}
function sessionSnapshot(session,text,actor=null,side=null){session.timeline.push({round:session.round,text,effect:classifyBattleEvent(text),actor:actor?{id:actor.id,name:actor.name}:null,side,allies:session.allies.map(u=>({id:u.id,name:u.name,hp:u.hp,maxHp:u.maxHp,shield:u.shield||0,stun:u.stun||0,silence:u.silence||0,taunt:u.taunt||0,energy:u.energy||0,skillCost:u.skillCost||100,cooldownLeft:u.cooldownLeft||0,row:u.row||'front',range:u.range||'any',combatClass:u.combatClass||'support',breakWindow:u.breakWindow||0,phase:u.phase||1,maxPhase:u.maxPhase||1})),enemies:session.enemies.map(u=>({id:u.id,name:u.name,hp:u.hp,maxHp:u.maxHp,shield:u.shield||0,stun:u.stun||0,silence:u.silence||0,taunt:u.taunt||0,energy:u.energy||0,skillCost:u.skillCost||100,cooldownLeft:u.cooldownLeft||0,row:u.row||'front',range:u.range||'any',combatClass:u.combatClass||'support',breakWindow:u.breakWindow||0,isBoss:!!u.isBoss,breakGauge:u.breakGauge||0,breakMax:u.breakMax||0,breakCount:u.breakCount||0,phase:u.phase||1,maxPhase:u.maxPhase||1}))});}
function bossPhaseInfo(unit,stage=null){if(!unit?.isBoss)return null;const names=BOSS_PHASES[Number(stage)||Number(String(unit.id||'').replace('boss-',''))]||['阶段一','阶段二','阶段三'];return{phase:unit.phase||1,maxPhase:3,namePhase:names[(unit.phase||1)-1]||`阶段${unit.phase||1}`,hpPct:unit.maxHp?unit.hp/unit.maxHp:1,breakGauge:unit.breakGauge||0,breakMax:unit.breakMax||0,breakCount:unit.breakCount||0,breakWindow:unit.breakWindow||0};}
function updateBossPhaseUnit(unit,stage=null){if(!unit?.isBoss||unit.hp<=0)return null;const pct=unit.hp/unit.maxHp,target=pct<=.30?3:pct<=.65?2:1;if(target<=(unit.phase||1))return null;unit.phase=target;unit.maxPhase=3;if(target===2)unit.shield=(unit.shield||0)+Math.round(unit.maxHp*.08);else if(target===3)unit.shield=(unit.shield||0)+Math.round(unit.maxHp*.05);refreshActor(unit);const info=bossPhaseInfo(unit,stage);return`⚠ ${unit.name}进入 ${info.namePhase} · PHASE ${target}/3${target===2?'，获得裂境护盾':'，攻击与速度大幅提升'}`;}
function sessionTargetData(session,actor){const mode=skillTargetMode(actor.skillType),pool=mode==='ally'?living(session.allies):mode==='enemy'?targetable(actor,session.enemies):[];return{targetMode:mode,targets:pool.map(x=>({id:x.id,name:x.name,hp:x.hp,maxHp:x.maxHp,isBoss:!!x.isBoss}))};}
function sessionActor(session,ref){return(ref.side==='a'?session.allies:session.enemies).find(u=>u.id===ref.id);}
function finalizeBattleSession(state,session,rng=rand01){if(session.result)return battleSessionView(session);const win=living(session.allies).length>0&&living(session.enemies).length===0;let rewards={coin:0,tickets:0},drops=[];dailyProgress(state,'battle3',1);weeklyProgress(state,'battle12',1);if(win){dailyProgress(state,'win2',1);weeklyProgress(state,'win8',1);rewards={coin:350+session.stage*40+(session.boss?500:0),tickets:session.stage%5===0?2:1};rewardState(state,rewards);drops=rollLoot(state,session.stage,rng,!!session.boss);if(state.stage===session.stage){if(session.stage<30)state.stage++;else state.campaignCompleted=true;}session.log.push(`胜利！获得烬币 ${rewards.coin}、契灵印 ${rewards.tickets}`);for(const d of drops)session.log.push(`✦ 获得${d.kind==='relic'?'遗物':'装备'}「${d.item.name}」${d.item.rarity}`);}else session.log.push('挑战失败，可提升角色、调整装备、激活阵营共鸣后重试。');sessionSnapshot(session,session.log[session.log.length-1]);session.status='complete';session.pending=null;session.updatedAt=nowIso();session.result={win,stage:session.stage,rewards,drops,log:[...session.log],timeline:[...session.timeline],formationPower:session.formationPower,skillMode:session.mode,manualSkills:[],autoStrategy:session.autoStrategy||'balanced',boss:session.boss,stats:battleStatRows(session.stats||{}),combosUsed:[...(session.combosUsed||[])]};recordBattleReplay(state,session.result);state.updatedAt=nowIso();return battleSessionView(session);}
function advanceBattleSession(state,rng=rand01){const s=state.activeBattleSession;if(!s)throw codeError('BATTLE_SESSION_NOT_FOUND');if(s.status==='waiting'||s.status==='complete')return battleSessionView(s);while(s.status==='running'){if(!living(s.allies).length||!living(s.enemies).length||s.round>=36)return finalizeBattleSession(state,s,rng);if(!Array.isArray(s.actorOrder)||s.actorIndex>=s.actorOrder.length){s.round++;if(s.round>36)return finalizeBattleSession(state,s,rng);s.log.push(`— 第 ${s.round} 回合 —`);s.actorOrder=[...s.allies.map(u=>({side:'a',id:u.id})),...s.enemies.map(u=>({side:'e',id:u.id}))].filter(x=>{const u=sessionActor(s,x);return u&&u.hp>0}).sort((a,b)=>effectiveSpeed(sessionActor(s,b))-effectiveSpeed(sessionActor(s,a)));s.actorIndex=0;continue;}const ref=s.actorOrder[s.actorIndex],actor=sessionActor(s,ref);if(!actor||actor.hp<=0){s.actorIndex++;continue;}if(actor.stun>0){actor.stun--;if(actor.breakWindow>0)actor.breakWindow--;const text=`${actor.name}处于眩晕，本次无法行动`;s.log.push(text);sessionSnapshot(s,text,actor,ref.side);s.actorIndex++;continue;}const foes=ref.side==='a'?s.enemies:s.allies,friends=ref.side==='a'?s.allies:s.enemies;if(!living(foes).length)return finalizeBattleSession(state,s,rng);actor.turns++;if(actor.cooldownLeft>0)actor.cooldownLeft--;actor.energy=Math.min(120,(actor.energy||0)+(actor.energyGain||34));refreshActor(actor);const skillReady=actor.energy>=(actor.skillCost||100)&&actor.cooldownLeft<=0,canSkill=skillReady&&(actor.silence||0)<=0;if(ref.side==='a'&&s.mode==='manual'&&skillReady&&!canSkill){const text=`${actor.name}处于沉默，技能充能被压制，本次改为普通攻击`;s.log.push(text);basicAttack(actor,foes,rng,s.log);actor.energy=Math.min(actor.energy,Math.max(0,(actor.skillCost||100)-20));sessionSnapshot(s,text,actor,'a');endActorTurn(actor);s.actorIndex++;continue;}if(ref.side==='a'&&s.mode==='manual'&&canSkill){const td=sessionTargetData(s,actor);s.pending={heroId:actor.id,heroName:actor.name,skill:actor.skill,round:s.round,energy:actor.energy,skillCost:actor.skillCost||100,cooldownLeft:actor.cooldownLeft||0,commands:['skill','basic'],...td};s.status='waiting';const text=`✦ ${actor.name}「${actor.skill}」充能完成，等待引星者指令`;s.log.push(text);sessionSnapshot(s,text,actor,'a');s.updatedAt=nowIso();state.updatedAt=nowIso();return battleSessionView(s);}const before=s.log.length,metricBefore=metricSnapshot(friends,foes);if(canSkill&&ref.side==='a'){const strategy=s.autoStrategy||'balanced';if(shouldAutoUseSkill(actor,friends,foes,strategy)){skillAction(actor,friends,foes,rng,s.log,autoTargetFor(actor,friends,foes,strategy));actor.energy=Math.max(0,actor.energy-(actor.skillCost||100));actor.cooldownLeft=actor.skillCooldown||0;s.skillCasts[actor.id]=(s.skillCasts[actor.id]||0)+1;triggerCombo(s.allies,s.enemies,s.skillCasts,s.combosUsed,s.stats,s.log);}else basicAttack(actor,foes,rng,s.log);}else if(canSkill&&actor.isBoss){bossSkillAction(actor,friends,foes,rng,s.log);actor.energy=Math.max(0,actor.energy-(actor.skillCost||100));actor.cooldownLeft=actor.skillCooldown||0;}else if(canSkill){const t=preferredTarget(foes,rng,null,actor),d=applyDamage(t,actor.atk*1.45-t.def*.5+(rng()*12-6),actor);s.log.push(`${actor.name}施放「${actor.skill}」，对 ${t.name} 造成 ${d.hpDamage} 伤害`);actor.energy=Math.max(0,actor.energy-(actor.skillCost||100));actor.cooldownLeft=actor.skillCooldown||0;}else basicAttack(actor,foes,rng,s.log);if(ref.side==='a')recordMetrics(s.stats,actor,metricBefore,friends,foes);if(s.log.length>before)sessionSnapshot(s,s.log[s.log.length-1],actor,ref.side);const bossUnit=s.enemies.find(x=>x.isBoss&&x.hp>0),phaseText=updateBossPhaseUnit(bossUnit,s.stage);if(phaseText){s.log.push(phaseText);sessionSnapshot(s,phaseText,bossUnit,'e');s.boss={...(s.boss||{}),...bossPhaseInfo(bossUnit,s.stage)};}endActorTurn(actor);s.actorIndex++;s.updatedAt=nowIso();}return battleSessionView(s);}
function startBattleSession(state,options={},rng=rand01){if(typeof options==='function'){rng=options;options={};}if(!state.formation.length)throw codeError('INVALID_FORMATION');const old=state.activeBattleSession;if(old&&['running','waiting'].includes(old.status))throw codeError('ACTIVE_BATTLE_SESSION');const mode=options.skillMode==='manual'?'manual':'auto',autoStrategy=AUTO_STRATEGIES[options.autoStrategy]?options.autoStrategy:(state.battlePrefs?.autoStrategy||'balanced');state.battlePrefs={skillMode:mode,manualSkills:[],autoStrategy};const stage=state.stage,story=storyForStage(stage);state.storySeen||=[];if(story&&!state.storySeen.includes(story.id))state.storySeen.push(story.id);const boss=bossByStage(stage),allies=state.formation.map((id,i)=>makeUnit(byId(id),state.heroes[id],state,state.formationRows?.[id]||(i<2?'front':'back'))),enemies=enemyTeam(stage).map((e,i)=>({...e,maxHp:e.hp,baseAtk:e.atk,baseSpd:e.spd,turns:0,stun:0,silence:0,taunt:0,shield:0,atkBuff:0,slow:0,energy:0,skillCost:100,energyGain:34,skillCooldown:1,cooldownLeft:0,row:e.row||(e.isBoss?'back':boss?'front':i<2?'front':'back'),range:e.isBoss?'any':'front',combatClass:enemyCombatClass(stage,i,!!e.isBoss),breakWindow:0,breakMax:e.isBoss?(BOSS_BREAK_RULES[stage]||150):0,breakGauge:e.isBoss?(BOSS_BREAK_RULES[stage]||150):0,breakCount:0,phase:1,maxPhase:e.isBoss?3:1}));const session={id:`bs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`,status:'running',mode,autoStrategy,stage,round:0,actorOrder:[],actorIndex:0,pending:null,allies,enemies,log:[],timeline:[],result:null,stats:{},skillCasts:{},combosUsed:[],formationPower:formationPower(state),boss:boss?{stage:boss.stage,name:boss.name,phase:1,maxPhase:3,namePhase:(BOSS_PHASES[stage]||[])[0]||'阶段一'}:null,startedAt:nowIso(),updatedAt:nowIso()};if(boss){session.log.push(`⚠ Boss 战：${boss.name} · ${boss.skill}`);sessionSnapshot(session,session.log[0]);}state.activeBattleSession=session;return advanceBattleSession(state,rng);}
function battleSessionCommand(state,sessionId,heroId,command='skill',rng=rand01,targetId=null){const s=state.activeBattleSession;if(!s||s.id!==sessionId)throw codeError('BATTLE_SESSION_NOT_FOUND');if(s.status!=='waiting'||!s.pending)throw codeError('BATTLE_SESSION_NOT_WAITING');if(s.pending.heroId!==heroId)throw codeError('BATTLE_SESSION_ACTOR_MISMATCH');if(!['skill','basic'].includes(command))throw codeError('INVALID_BATTLE_COMMAND');const actor=s.allies.find(u=>u.id===heroId);if(!actor||actor.hp<=0)throw codeError('BATTLE_SESSION_ACTOR_INVALID');const mode=s.pending.targetMode||'none',valid=(s.pending.targets||[]).map(x=>x.id);if(targetId&&mode!=='none'&&!valid.includes(targetId))throw codeError('INVALID_BATTLE_TARGET');if(command==='skill'&&mode!=='none'&&!targetId)throw codeError('BATTLE_TARGET_REQUIRED');const foes=s.enemies,friends=s.allies,before=s.log.length,metricBefore=metricSnapshot(friends,foes);if(command==='skill'){skillAction(actor,friends,foes,rng,s.log,targetId);actor.energy=Math.max(0,actor.energy-(actor.skillCost||100));actor.cooldownLeft=actor.skillCooldown||0;s.skillCasts[actor.id]=(s.skillCasts[actor.id]||0)+1;triggerCombo(s.allies,s.enemies,s.skillCasts,s.combosUsed,s.stats,s.log);}else basicAttack(actor,foes,rng,s.log,targetId&&targetable(actor,foes).some(x=>x.id===targetId)?targetId:null);recordMetrics(s.stats,actor,metricBefore,friends,foes);if(s.log.length>before)sessionSnapshot(s,s.log[s.log.length-1],actor,'a');const bossUnit=s.enemies.find(x=>x.isBoss&&x.hp>0),phaseText=updateBossPhaseUnit(bossUnit,s.stage);if(phaseText){s.log.push(phaseText);sessionSnapshot(s,phaseText,bossUnit,'e');s.boss={...(s.boss||{}),...bossPhaseInfo(bossUnit,s.stage)};}endActorTurn(actor);s.pending=null;s.status='running';s.actorIndex++;s.updatedAt=nowIso();return advanceBattleSession(state,rng);}
function resumeBattleSession(state){const s=state.activeBattleSession;if(!s)throw codeError('BATTLE_SESSION_NOT_FOUND');return battleSessionView(s);}
function cancelBattleSession(state,sessionId){const s=state.activeBattleSession;if(!s||s.id!==sessionId)throw codeError('BATTLE_SESSION_NOT_FOUND');if(s.status==='complete')throw codeError('BATTLE_SESSION_ALREADY_COMPLETE');state.activeBattleSession=null;state.updatedAt=nowIso();return{id:sessionId,cancelled:true};}

function battle(state,rng=rand01,options={}){
  if(typeof rng==='object'&&rng!==null){options=rng;rng=rand01;}
  if(!state.formation.length)throw codeError('INVALID_FORMATION');const skillMode=options.skillMode==='manual'?'manual':'auto',manualSkills=[...new Set((options.manualSkills||[]).filter(id=>state.formation.includes(id)))].slice(0,3),autoStrategy=AUTO_STRATEGIES[options.autoStrategy]?options.autoStrategy:(state.battlePrefs?.autoStrategy||'balanced');state.battlePrefs={skillMode,manualSkills,autoStrategy};const stage=state.stage,story=storyForStage(stage);state.storySeen||=[];if(story&&!state.storySeen.includes(story.id))state.storySeen.push(story.id);const boss=bossByStage(stage),allies=state.formation.map((id,i)=>makeUnit(byId(id),state.heroes[id],state,state.formationRows?.[id]||(i<2?'front':'back')));
  const enemies=enemyTeam(stage).map((e,i)=>({...e,maxHp:e.hp,baseAtk:e.atk,baseSpd:e.spd,turns:0,stun:0,silence:0,taunt:0,shield:0,atkBuff:0,slow:0,energy:0,skillCost:100,energyGain:34,skillCooldown:1,cooldownLeft:0,row:e.row||(e.isBoss?'back':boss?'front':i<2?'front':'back'),range:e.isBoss?'any':'front',combatClass:enemyCombatClass(stage,i,!!e.isBoss),breakWindow:0,breakMax:e.isBoss?(BOSS_BREAK_RULES[stage]||150):0,breakGauge:e.isBoss?(BOSS_BREAK_RULES[stage]||150):0,breakCount:0,phase:1,maxPhase:e.isBoss?3:1}));const log=[],timeline=[],stats={},skillCasts={},combosUsed=[];
  const snapshot=(round,text,actor=null,side=null)=>timeline.push({round,text,effect:classifyBattleEvent(text),actor:actor?{id:actor.id,name:actor.name}:null,side,allies:allies.map(u=>({id:u.id,name:u.name,hp:u.hp,maxHp:u.maxHp,shield:u.shield||0,stun:u.stun||0,silence:u.silence||0,taunt:u.taunt||0,energy:u.energy||0,skillCost:u.skillCost||100,cooldownLeft:u.cooldownLeft||0,row:u.row||'front',range:u.range||'any',combatClass:u.combatClass||'support',breakWindow:u.breakWindow||0,phase:u.phase||1,maxPhase:u.maxPhase||1})),enemies:enemies.map(u=>({id:u.id,name:u.name,hp:u.hp,maxHp:u.maxHp,shield:u.shield||0,stun:u.stun||0,silence:u.silence||0,taunt:u.taunt||0,energy:u.energy||0,skillCost:u.skillCost||100,cooldownLeft:u.cooldownLeft||0,row:u.row||'front',range:u.range||'any',combatClass:u.combatClass||'support',breakWindow:u.breakWindow||0,isBoss:!!u.isBoss,breakGauge:u.breakGauge||0,breakMax:u.breakMax||0,breakCount:u.breakCount||0,phase:u.phase||1,maxPhase:u.maxPhase||1}))});
  if(boss){log.push(`⚠ Boss 战：${boss.name} · ${boss.skill}`);snapshot(0,log[log.length-1]);}
  let round=0;
  while(living(allies).length&&living(enemies).length&&round<36){round++;log.push(`— 第 ${round} 回合 —`);const actors=[...allies.map(u=>({side:'a',u})),...enemies.map(u=>({side:'e',u}))].filter(x=>x.u.hp>0).sort((a,b)=>effectiveSpeed(b.u)-effectiveSpeed(a.u));
    for(const a of actors){if(a.u.hp<=0)continue;if(a.u.stun>0){a.u.stun--;if(a.u.breakWindow>0)a.u.breakWindow--;const text=`${a.u.name}处于眩晕，本次无法行动`;log.push(text);snapshot(round,text,a.u,a.side);continue;}const foes=a.side==='a'?enemies:allies,friends=a.side==='a'?allies:enemies;if(!living(foes).length)break;a.u.turns++;if(a.u.cooldownLeft>0)a.u.cooldownLeft--;a.u.energy=Math.min(120,(a.u.energy||0)+(a.u.energyGain||34));refreshActor(a.u);const before=log.length,metricBefore=metricSnapshot(friends,foes),skillReady=a.u.energy>=(a.u.skillCost||100)&&a.u.cooldownLeft<=0,canSkill=skillReady&&(a.u.silence||0)<=0,useSkill=canSkill&&(a.side!=='a'||skillMode==='auto'||manualSkills.includes(a.u.id));if(skillReady&&!canSkill){const text=`${a.u.name}处于沉默，无法释放技能`;log.push(text);snapshot(round,text,a.u,a.side);basicAttack(a.u,foes,rng,log);a.u.energy=Math.min(a.u.energy,Math.max(0,(a.u.skillCost||100)-20));}else if(skillReady&&a.side==='a'&&skillMode==='manual'&&!manualSkills.includes(a.u.id)){const text=`${a.u.name}技能就绪，但手动策略未授权释放`;log.push(text);snapshot(round,text,a.u,a.side);basicAttack(a.u,foes,rng,log);}else if(useSkill&&a.side==='a'){if(shouldAutoUseSkill(a.u,friends,foes,autoStrategy)){skillAction(a.u,friends,foes,rng,log,autoTargetFor(a.u,friends,foes,autoStrategy));a.u.energy=Math.max(0,a.u.energy-(a.u.skillCost||100));a.u.cooldownLeft=a.u.skillCooldown||0;skillCasts[a.u.id]=(skillCasts[a.u.id]||0)+1;triggerCombo(allies,enemies,skillCasts,combosUsed,stats,log);}else basicAttack(a.u,foes,rng,log);}else if(useSkill&&a.u.isBoss){bossSkillAction(a.u,friends,foes,rng,log);a.u.energy=Math.max(0,a.u.energy-(a.u.skillCost||100));a.u.cooldownLeft=a.u.skillCooldown||0;}else if(useSkill){const t=preferredTarget(foes,rng,null,a.u),d=applyDamage(t,a.u.atk*1.45-t.def*.5+(rng()*12-6),a.u);log.push(`${a.u.name}施放「${a.u.skill}」，对 ${t.name} 造成 ${d.hpDamage} 伤害`);a.u.energy=Math.max(0,a.u.energy-(a.u.skillCost||100));a.u.cooldownLeft=a.u.skillCooldown||0;}else basicAttack(a.u,foes,rng,log);if(a.side==='a')recordMetrics(stats,a.u,metricBefore,friends,foes);const text=log[log.length-1]||'';if(log.length>before)snapshot(round,text,a.u,a.side);const bossUnit=enemies.find(x=>x.isBoss&&x.hp>0),phaseText=updateBossPhaseUnit(bossUnit,stage);if(phaseText){log.push(phaseText);snapshot(round,phaseText,bossUnit,'e');}endActorTurn(a.u);}
  }
  const win=living(allies).length>0&&living(enemies).length===0;let rewards={coin:0,tickets:0},drops=[];dailyProgress(state,'battle3',1);weeklyProgress(state,'battle12',1);
  if(win){dailyProgress(state,'win2',1);weeklyProgress(state,'win8',1);rewards={coin:350+stage*40+(boss?500:0),tickets:stage%5===0?2:1};rewardState(state,rewards);drops=rollLoot(state,stage,rng,!!boss);if(stage<30)state.stage++;else state.campaignCompleted=true;log.push(`胜利！获得烬币 ${rewards.coin}、契灵印 ${rewards.tickets}`);for(const d of drops)log.push(`✦ 获得${d.kind==='relic'?'遗物':'装备'}「${d.item.name}」${d.item.rarity}`);}
  else log.push('挑战失败，可提升角色、调整装备、激活阵营共鸣后重试。');snapshot(round,log[log.length-1]);const result={win,stage,rewards,drops,log,timeline,formationPower:formationPower(state),skillMode,manualSkills,autoStrategy,boss:boss?{stage:boss.stage,name:boss.name}:null,stats:battleStatRows(stats),combosUsed};recordBattleReplay(state,result);state.updatedAt=nowIso();return result;
}
function codeError(code){const e=new Error(code);e.code=code;return e;}
function publicState(s){const x=JSON.parse(JSON.stringify(s));delete x._openid;delete x.ownerId;return x;}
function isPristine(state){const s=migrate(state);return s.stage===1&&Object.keys(s.heroes).length===1&&!!s.heroes.h004&&s.coin===5000&&s.tickets===30&&s.starCrystal===300&&s.gachaHistory.length===0;}
return {HEROES,EQUIPMENT,RELICS,BOSSES,BOSS_PHASES,BOSS_PHASE_SKILLS,AUTO_STRATEGIES,SKILL_RULES,COMBO_SKILLS,BOSS_BREAK_RULES,ROLE_CLASS,COMBAT_CLASSES,CLASS_ADVANTAGE,CLASS_DISADVANTAGE,TALENT_TREES,TALENT_COSTS,SWEEP_DAILY_LIMIT,NIGHT_EVENT_CONFIG,NIGHT_EVENT_STAGES,NIGHT_EVENT_SHOP,CHAPTERS,FACTION_BONUSES,RESOURCE_DUNGEONS,ACHIEVEMENTS,HERO_VISUALS,EQUIPMENT_SETS,FORGE_RECIPES,DISMANTLE_DUST,EVENT_CONFIG,EVENT_DAILY_ATTEMPTS,EVENT_STAGES,EVENT_SHOP,SIGNATURE_WEAPONS,AWAKEN_COST,SYSTEM_MAILS,EVENT_BOSS,BOND_THRESHOLDS,BOND_STORIES,HERO_ARCHIVES,STORY_NODES,HERO_VOICES,SKILL_FX,CONFIG_VERSION,SAVE_VERSION,FRAGMENTS_PER_DUP,STAR_COST,DAILY_TASKS,DAILY_ALL_REWARD,LOGIN_REWARDS,WEEKLY_TASKS,WEEKLY_ALL_REWARD,SHOP_ITEMS,LIMITED_POOL,byId,equipmentById,relicById,signatureById,signatureForHero,bossByStage,chapterByStage,resourceDungeonById,eventStageById,storyForStage,archiveForHero,newPlayer,migrate,ensureDaily,ensureWeekly,ensureShop,ensureEventBoss,ensureResourceRuns,dailyProgress,weeklyProgress,claimDailyTask,claimDailyAll,loginRewardInfo,claimLoginReward,claimWeeklyTask,claimWeeklyAll,shopBuy,pull,pullStarterTen,pullLimited,levelUp,starUp,setFormation,saveFormationPreset,loadFormationPreset,sweepInfo,sweepStage,talentTree,heroTalents,talentBonus,unlockTalent,combatClassForHero,combatClassInfo,classMultiplier,nightEventStageById,nightEventBattle,nightEventShopBuy,equipGear,unequipGear,equipRelic,enhanceCost,enhanceEquipment,dismantleEquipment,forgeRecipeById,forgeEquipment,equipSignature,awakenInfo,awakenHero,unreadMailCount,claimMail,claimAllMail,bondInfo,giftHero,eventBattle,eventShopBuy,eventBossBattle,localEventLeaderboard,resourceDungeon,achievementProgress,claimAchievement,equipmentSetCounts,equipmentSetBonus,activeEquipmentSets,equipmentStats,factionCounts,activeFactionBonuses,computedStats,heroPower,formationPower,enemyTeam,bossPhaseInfo,updateBossPhaseUnit,skillTargetMode,autoStrategyInfo,battleStatRows,battleReplays,battle,battleSessionView,startBattleSession,battleSessionCommand,resumeBattleSession,cancelBattleSession,advanceBattleSession,codeError,publicState,nowIso,gameDay,isPristine,uuid:()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`};


})();
