window.StarEmberCloud = (()=>{
  let app=null,auth=null,ready=false,ensurePromise=null,identity='',meta={identityKind:'guest',linked:false};
  const cfg=()=>window.STAR_EMBER_CLOUD_CONFIG||{};
  function loadScript(src){return new Promise((resolve,reject)=>{if(window.cloudbase)return resolve();const existing=document.querySelector?.('script[data-star-ember-cloudbase]');if(existing){existing.addEventListener?.('load',resolve,{once:true});existing.addEventListener?.('error',()=>reject(new Error('CLOUDBASE_SDK_LOAD_FAILED')),{once:true});return}const s=document.createElement('script');s.src=src;s.dataset.starEmberCloudbase='1';s.onload=resolve;s.onerror=()=>reject(new Error('CLOUDBASE_SDK_LOAD_FAILED'));document.head.appendChild(s)})}
  /* v2.2.4 QC-2e：SDK 初始化闸门 + 不可挂死。
     真机实测：CloudBase JS SDK 的 init / 匿名登录在弱网或权限被拒时可能永远不 settle。
     原实现 ensure() 把这条 pending 的 promise 缓存在 ensurePromise 上，
     于是启动探测超时之后，玩家再点「连接云存档」会重新 await 同一条永不落地的 promise——
     表现为按钮一直转圈、页面主线程被卡住，玩家既连不上也退不出。
     现在：① 15 秒闸门；② 超时即清空缓存并标记 notReady，后续可重试；③ 失败不缓存。 */
  function ensureGate(ms=15000){
    let timer=null;
    const gate=new Promise((_,reject)=>{timer=setTimeout(()=>{
      const e=new Error('NETWORK_UNSTABLE');e.code='NETWORK_UNSTABLE';reject(e);
    },ms)});
    return {gate,clear:()=>{if(timer)clearTimeout(timer)}};
  }
  async function ensure(){
    if(ready)return;if(ensurePromise)return ensurePromise;
    const {gate,clear}=ensureGate();
    ensurePromise=(async()=>{const c=cfg();if(!c.enabled||!c.env)throw new Error('CLOUD_NOT_CONFIGURED');
      await loadScript(c.sdkUrl);const opts={env:c.env,region:c.region||'ap-shanghai'};if(c.accessKey)opts.accessKey=c.accessKey;
      app=window.cloudbase.init(opts);auth=typeof app.auth==='function'?app.auth():app.auth;
      let session=null;if(auth?.getSession){try{const r=await auth.getSession();session=r?.data?.session||r?.session||null}catch{}}
      if(!session){if(!auth?.signInAnonymously)throw new Error('ANONYMOUS_AUTH_UNAVAILABLE');const r=await auth.signInAnonymously();if(r?.error)throw new Error(r.error.message||'ANONYMOUS_LOGIN_FAILED')}
      if(auth?.getSession){try{const r=await auth.getSession();identity=r?.data?.user?.id||r?.data?.session?.sub||''}catch{}}
      ready=true;
    })();
    try{return await Promise.race([ensurePromise,gate])}
    catch(e){ ready=false; ensurePromise=null; throw e }
    finally{ clear(); }
  }
  function unwrap(raw){let r=raw?.result??raw?.data?.result??raw?.data??raw;if(typeof r==='string'){try{r=JSON.parse(r)}catch{}}return r}
  async function call(name,data={}){if(typeof navigator!=='undefined'&&navigator.onLine===false){const e=new Error('NETWORK_OFFLINE');e.code='NETWORK_OFFLINE';throw e}if(!ready)await ensure();let raw;try{raw=await app.callFunction({name,data,parse:true})}catch(err){const offline=typeof navigator!=='undefined'&&navigator.onLine===false,msg=String(err?.message||err?.code||''),denied=/EXCEED_AUTHORITY|403|authority|forbidden/i.test(msg),code=offline?'NETWORK_OFFLINE':denied?'CLOUD_PERMISSION_DENIED':'NETWORK_UNSTABLE',e=new Error(code);e.code=code;e.cause=err;throw e}const r=unwrap(raw);if(!r?.ok){const e=new Error(r?.code||'CLOUD_FUNCTION_FAILED');e.code=r?.code;e.detail=r;throw e}return r.data}
  function absorb(data){if(data?.identityKind)meta.identityKind=data.identityKind;if(typeof data?.linked==='boolean')meta.linked=data.linked;return data}
  async function connect(){await ensure();return absorb(await call('bootstrapPlayer'))}
  return {
    configured:()=>!!(cfg().enabled&&cfg().env),connected:()=>ready,identity:()=>identity,meta:()=>({...meta}),connect,
    load:async()=>absorb(await call('loadPlayer')),
    gacha:async(count)=>call('gacha',{count,requestId:window.STAR_EMBER_GAME.uuid()}),
    newbieGacha:async()=>call('newbieGacha',{requestId:window.STAR_EMBER_GAME.uuid()}),
    limitedGacha:async(count)=>call('limitedGacha',{count,requestId:window.STAR_EMBER_GAME.uuid()}),
    upgrade:async(heroId,type)=>call('upgradeHero',{heroId,type,requestId:window.STAR_EMBER_GAME.uuid()}),
    formation:async(formation,rows=null)=>call('saveFormation',{formation,rows,requestId:window.STAR_EMBER_GAME.uuid()}),
    battle:async(opts={})=>call('battle',{...opts,requestId:window.STAR_EMBER_GAME.uuid()}),
    battleSessionStart:async(opts={})=>call('battleSessionStart',{...opts,requestId:window.STAR_EMBER_GAME.uuid()}),
    battleSessionCommand:async(sessionId,heroId,command,targetId=null)=>call('battleSessionCommand',{sessionId,heroId,command,targetId,requestId:window.STAR_EMBER_GAME.uuid()}),
    battleSessionResume:async()=>call('battleSessionResume'),
    battleSessionCancel:async(sessionId)=>call('battleSessionCancel',{sessionId,requestId:window.STAR_EMBER_GAME.uuid()}),
    claimDaily:async(taskId,claimAll=false)=>call('claimDaily',{taskId,claimAll,requestId:window.STAR_EMBER_GAME.uuid()}),
    claimLoginReward:async()=>call('claimLoginReward',{requestId:window.STAR_EMBER_GAME.uuid()}),
    loadout:async(data)=>call('equipLoadout',{...data,requestId:window.STAR_EMBER_GAME.uuid()}),
    enhanceEquipment:async(itemId)=>call('enhanceEquipment',{itemId,requestId:window.STAR_EMBER_GAME.uuid()}),
    resourceDungeon:async(id)=>call('resourceDungeon',{id,requestId:window.STAR_EMBER_GAME.uuid()}),
    claimAchievement:async(id)=>call('claimAchievement',{id,requestId:window.STAR_EMBER_GAME.uuid()}),
    claimWeekly:async(taskId,claimAll=false)=>call('claimWeekly',{taskId,claimAll,requestId:window.STAR_EMBER_GAME.uuid()}),
    shopBuy:async(id)=>call('shopBuy',{id,requestId:window.STAR_EMBER_GAME.uuid()}),
    dismantleEquipment:async(itemId,count=1)=>call('dismantleEquipment',{itemId,count,requestId:window.STAR_EMBER_GAME.uuid()}),
    forgeEquipment:async(recipeId)=>call('forgeEquipment',{recipeId,requestId:window.STAR_EMBER_GAME.uuid()}),
    eventBattle:async(id)=>call('eventBattle',{id,requestId:window.STAR_EMBER_GAME.uuid()}),
    eventShopBuy:async(id)=>call('eventShopBuy',{id,requestId:window.STAR_EMBER_GAME.uuid()}),
    bondGift:async(heroId,count=1)=>call('bondGift',{heroId,count,requestId:window.STAR_EMBER_GAME.uuid()}),
    equipSignature:async(heroId,signatureId)=>call('equipSignature',{heroId,signatureId,requestId:window.STAR_EMBER_GAME.uuid()}),
    awakenHero:async(heroId)=>call('awakenHero',{heroId,requestId:window.STAR_EMBER_GAME.uuid()}),
    claimMail:async(id,claimAll=false)=>call('claimMail',{id,claimAll,requestId:window.STAR_EMBER_GAME.uuid()}),
    eventBoss:async()=>call('eventBoss',{requestId:window.STAR_EMBER_GAME.uuid()}),
    getLeaderboard:async()=>call('getLeaderboard'),
    formationPreset:async(action,slot,name='')=>call('formationPreset',{action,slot,name,requestId:window.STAR_EMBER_GAME.uuid()}),
    unlockTalent:async(heroId,nodeId)=>call('unlockTalent',{heroId,nodeId,requestId:window.STAR_EMBER_GAME.uuid()}),
    sweep:async(stage,count=1)=>call('sweep',{stage,count,requestId:window.STAR_EMBER_GAME.uuid()}),
    nightVoyage:async(action,id)=>call('nightVoyage',{action,id,requestId:window.STAR_EMBER_GAME.uuid()}),
    createLinkCode:async()=>call('createLinkCode'),
    redeemLinkCode:async(code)=>{const data=await call('redeemLinkCode',{code});meta.linked=true;return data}
  };
})();
