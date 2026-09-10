const assert=require('assert');
const game=require('../cloudbase/_shared/game');

function addHero(state,id,{level=30,star=3,awakening=0}={}){
  state.heroes[id]={level,star,fragments:0,awakening,signature:null,equipment:{weapon:null,armor:null,charm:null}};
  state.bond[id]||={points:0};
}
function strongTeam(tag='strong'){
  const s=game.newPlayer(tag);s.heroes={};s.bond={};
  for(const id of ['h001','h002','h003','h004','h005'])addHero(s,id,{level:50,star:5,awakening:3});
  s.formation=['h001','h002','h003','h004','h005'];
  s.formationRows={h001:'back',h002:'back',h003:'back',h004:'back',h005:'front'};
  return s;
}
function seeded(seed){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
function midTeam(stage){const s=game.newPlayer(`sim-${stage}`);s.heroes={};s.bond={};for(const id of ['h001','h002','h003','h004','h006'])addHero(s,id,{level:20,star:3});s.formation=['h001','h002','h003','h004','h006'];s.formationRows={h001:'back',h002:'back',h003:'back',h004:'back',h006:'front'};s.stage=stage;return s;}

// 1) Fragment shops must bank fragments instead of unlocking an unowned hero.
{
  const s=game.newPlayer('fragment-bank');s.event.moonSeal=999;
  const buy=game.eventShopBuy(s,'shadowFragments');
  assert.equal(buy.fragmentBanked,true);assert.equal(!!s.heroes.h008,false);assert.equal(game.pendingHeroFragments(s,'h008'),20);
  s.nightEvent.voyageBadge=999;const n=game.nightEventShopBuy(s,'soul');
  assert.equal(n.fragmentBanked,true);assert.equal(!!s.heroes.h001,false);assert.equal(game.pendingHeroFragments(s,'h001'),15);
  // Once the hero is genuinely obtained, banked fragments are merged, not lost.
  addHero(s,'h008',{level:1,star:1});const m=game.migrate(s,'fragment-bank');assert.equal(m.heroes.h008.fragments,20);assert.equal(game.pendingHeroFragments(m,'h008'),0);
}

// 2) Campaign completion closes repeatable story rewards; Stage 30 farming must use sweep limits.
{
  const s=strongTeam('campaign-end');s.stage=30;s.campaignCompleted=true;
  assert.throws(()=>game.battle(s,()=>0.1),/CAMPAIGN_COMPLETED/);
  assert.throws(()=>game.startBattleSession(s,{skillMode:'auto'},()=>0.1),/CAMPAIGN_COMPLETED/);
  const before=s.sweep.used;const out=game.sweepStage(s,30,1,()=>0.99);assert.equal(out.count,1);assert.equal(s.sweep.used,before+1);
}

// 3) Combat task progress must use one rule across resource/event/sweep/boss activities.
{
  const s=strongTeam('task-unify');
  game.resourceDungeon(s,'coin');
  assert.equal(s.daily.progress.battle3,1);assert.equal(s.daily.progress.win2,1);assert.equal(s.weekly.progress.battle12,1);assert.equal(s.weekly.progress.win8,1);assert.equal(s.weekly.progress.resource5,1);
  game.eventBattle(s,'E1');game.nightEventBattle(s,'N1');
  assert.equal(s.daily.progress.battle3,3);assert.equal(s.daily.progress.win2,2);assert.equal(s.weekly.progress.battle12,3);assert.equal(s.weekly.progress.win8,3);
  s.stage=8;game.sweepStage(s,7,2,()=>0.99);assert.equal(s.daily.progress.battle3,3);assert.equal(s.daily.progress.win2,2);assert.equal(s.weekly.progress.battle12,5);assert.equal(s.weekly.progress.win8,5);
  const wins=s.daily.progress.win2;game.eventBossBattle(s,()=>0.5);assert.equal(s.daily.progress.battle3,3);assert.equal(s.daily.progress.win2,wins,'damage challenge is a battle, not an automatic win');assert.equal(s.weekly.progress.battle12,6);assert.equal(s.weekly.progress.win8,5);
}

// 4) Growth tasks cannot be farmed by clicking the same equipment/relic repeatedly.
{
  const s=game.newPlayer('growth-noop');const p0=s.daily.progress.upgrade1;
  const same=game.equipGear(s,'h004','eq001');assert.equal(same.unchanged,true);assert.equal(s.daily.progress.upgrade1,p0);
  s.inventory.relics.r001=1;game.equipRelic(s,'r001');const p1=s.daily.progress.upgrade1;assert.equal(p1,1);
  const sameRelic=game.equipRelic(s,'r001');assert.equal(sameRelic.unchanged,true);assert.equal(s.daily.progress.upgrade1,p1);
  const t=game.newPlayer('growth-talent');t.inventory.talentPoints=10;game.unlockTalent(t,'h004','root');assert.equal(t.daily.progress.upgrade1,1);
}

// 5) Same equipment template is exclusive even when multiple copies exist; global enhancement cannot buff multiple heroes for free.
{
  const s=game.newPlayer('gear-exclusive');addHero(s,'h001',{level:1,star:1});s.inventory.equipment.eq004=2;
  game.equipGear(s,'h001','eq004');assert.throws(()=>game.equipGear(s,'h004','eq004'),/ITEM_IN_USE/);
}

// 6) Weekly activity stores reset, preventing dead currencies after permanent sell-out.
{
  const s=game.newPlayer('weekly-shop');s.event.shopWeek='1999-W01';s.event.shop={gift:5};s.nightEvent.shopWeek='1999-W01';s.nightEvent.shop={talent:4};
  game.ensureEventShop(s,new Date());game.ensureNightEventShop(s,new Date());
  assert.deepEqual(s.event.shop,{});assert.deepEqual(s.nightEvent.shop,{});
}

// 7) Dedicated resource stages must beat the flexible crystal-exchange route.
{
  const coin=game.RESOURCE_DUNGEONS.find(x=>x.id==='coin').reward.coin*2;
  const iron=game.RESOURCE_DUNGEONS.find(x=>x.id==='forge').reward.starIron*2;
  const crystal=game.RESOURCE_DUNGEONS.find(x=>x.id==='crystal').reward.starCrystal*2;
  const coinViaCrystal=crystal/60*2000; // shop coin pack: 60 crystal -> 2000 coin
  const ironViaCrystal=crystal/80*50;   // shop iron pack: 80 crystal -> 50 iron
  assert.ok(coin>coinViaCrystal,`coin dungeon ${coin} must exceed crystal equivalent ${coinViaCrystal}`);
  assert.ok(iron>ironViaCrystal,`forge dungeon ${iron} must exceed crystal equivalent ${ironViaCrystal}`);
}

// 8) Duplicate relic/signature inventory is sanitized into useful forge dust.
{
  let s=game.newPlayer('duplicate-convert');s.inventory.relics.r004=3;s.inventory.signatureWeapons.sig_h004=2;s.inventory.forgeDust=0;s=game.migrate(s);
  assert.equal(s.inventory.relics.r004,1);assert.equal(s.inventory.signatureWeapons.sig_h004,1);assert.equal(s.inventory.forgeDust,540); // 2*SSR relic 180 + 1*SR signature 180
}

// 9) Historical test compensation is legacy-only; permanent signature sources/backfills keep old saves whole.
{
  const fresh=game.newPlayer('fresh-mail');assert.equal(game.unreadMailCount(fresh),0);
  const bond=game.newPlayer('bond-source');bond.inventory.bondGift=5;game.giftHero(bond,'h004',5);assert.equal(game.bondInfo(bond,'h004').level,3);game.claimAchievement(bond,'bond3');assert.equal(bond.inventory.signatureWeapons.sig_h004,1);
  let legacy=game.newPlayer('old-ach');legacy.achievements.claimed.bond3=true;legacy.inventory.signatureWeapons={};delete legacy.rewardBackfills;legacy=game.migrate(legacy);assert.equal(legacy.inventory.signatureWeapons.sig_h004,1,'claimed old achievement gets one-time v2.1.5 backfill');
  const owned=game.newPlayer('owned-signature');owned.inventory.signatureWeapons.sig_h004=1;owned.bond.h004.points=220;const dust0=owned.inventory.forgeDust;const converted=game.claimAchievement(owned,'bond3');assert.equal(converted.reward.signatureWeapon,undefined);assert.equal(converted.reward.forgeDust,180);assert.equal(owned.inventory.forgeDust,dust0+180);
}

// 10) Bond gifts stop at the cap and never consume excess items.
{
  const s=game.newPlayer('bond-cap');s.bond.h004.points=790;s.inventory.bondGift=10;const r=game.giftHero(s,'h004',10);assert.equal(r.count,1);assert.equal(r.info.points,800);assert.equal(s.inventory.bondGift,9);assert.throws(()=>game.giftHero(s,'h004',1),/BOND_CAP/);
}

// 11) A non-trivial gameplay action means the save is no longer pristine.
{
  const s=game.newPlayer('pristine-action');assert.equal(game.isPristine(s),true);s.inventory.talentPoints=10;game.unlockTalent(s,'h004','root');assert.equal(game.isPristine(s),false);
  const e=game.newPlayer('pristine-event');e.event.runs=1;assert.equal(game.isPristine(e),false);
}

// 12) Control talent is a live combat modifier, not dead display text.
{
  const s=game.newPlayer('effect-talent');addHero(s,'h005',{level:1,star:1});s.inventory.talentPoints=10;game.unlockTalent(s,'h005','root');game.unlockTalent(s,'h005','edge');game.unlockTalent(s,'h005','core');assert.equal(game.talentBonus(s,'h005').effectPct,.12);
}

// 13) Battle reports must record real skill/combo activity without the old zero-skill placeholder.
{
  const s=game.newPlayer('battle-stats');s.heroes={};s.bond={};for(const id of ['h001','h005','h002','h007','h003'])addHero(s,id,{level:35,star:5});game.setFormation(s,['h001','h005','h002','h007','h003'],{h001:'back',h005:'back',h002:'front',h007:'front',h003:'back'});s.stage=20;
  const r=game.battle(s,()=>0.31,{skillMode:'auto',autoStrategy:'balanced'});assert.equal(r.win,true);assert.ok(r.stats.some(x=>x.skills>0));assert.ok(r.combosUsed.includes('starSever')&&r.combosUsed.includes('redWing'));assert.ok(r.stats.filter(x=>x.combo>0).length>=4);
}

// 14) Boss adds stay subordinate to the boss body.
{
  for(const stage of [25,30]){const team=game.enemyTeam(stage),boss=team.find(x=>x.isBoss),adds=team.filter(x=>!x.isBoss);assert.ok(adds.every(x=>x.atk<boss.atk),`stage ${stage} add atk must stay below boss`);assert.ok(adds.every(x=>x.hp<boss.hp*.3),`stage ${stage} add hp must stay below 30% boss hp`);}
}

// 15) Representative simulation: the pre-boss ordinary stage is no longer the hidden wall before Stage 25.
{
  let normalWins=0,bossWins=0;for(let i=0;i<30;i++){if(game.battle(midTeam(24),seeded(24000+i),{skillMode:'auto'}).win)normalWins++;if(game.battle(midTeam(25),seeded(25000+i),{skillMode:'auto'}).win)bossWins++;}
  assert.ok(normalWins>=24,`Stage 24 should be a reliable ordinary clear, got ${normalWins}/30`);assert.ok(bossWins<normalWins,`Stage 25 boss should remain the larger gate, got ${bossWins} vs ${normalWins}`);
}

console.log('v2.1.5 gameplay hardening regression passed');
