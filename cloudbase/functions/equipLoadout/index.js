const game=require('./lib/game');const c=require('./lib/cloud');
exports.main=async(event={})=>{try{
  const type=String(event.type||''),heroId=String(event.heroId||''),itemId=String(event.itemId||''),slot=String(event.slot||''),requestId=String(event.requestId||'').slice(0,80);
  if(!requestId)throw game.codeError('REQUEST_ID_REQUIRED');const{db,auth}=c.init();const ctx=await c.playerContext(db,auth);
  const action=`loadout:${type}`;const out=await c.optimisticMutate(db,ctx.playerKey,requestId,action,state=>{
    if(type==='gear')return game.equipGear(state,heroId,itemId);
    if(type==='unequip')return game.unequipGear(state,heroId,slot);
    if(type==='relic')return game.equipRelic(state,itemId||null);
    throw game.codeError('INVALID_LOADOUT_ACTION');
  });
  return c.ok({state:game.publicState(out.state),loadout:out.result,idempotent:out.idempotent});
}catch(e){return c.fail(e)}};
