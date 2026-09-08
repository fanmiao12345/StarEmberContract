const crypto = require('crypto');
const cloudbase = require('@cloudbase/js-sdk');
const game = require('./game');

function init(){
  const app = cloudbase.init({});
  const db = app.database();
  const auth = typeof app.auth === 'function' ? app.auth() : app.auth;
  return {app,db,auth};
}
function identity(auth){
  const info = auth.getUserInfo();
  const raw = info?.uid || info?.openId;
  if(!raw) throw game.codeError('UNAUTHENTICATED');
  const key = crypto.createHash('sha256').update(String(raw)).digest('hex');
  return {key, kind:info?.openId?'wechat':'uid'};
}
async function resolvePlayerKey(db,identityKey,kind='uid'){
  const ref=db.collection('identity_links').doc(identityKey);
  try{
    const got=await ref.get(); const data=Array.isArray(got?.data)?got.data[0]:got?.data;
    if(data?.playerKey) return {playerKey:data.playerKey,kind:data.kind||kind,linked:true};
  }catch{}
  await ref.set({playerKey:identityKey,kind,createdAt:game.nowIso(),updatedAt:game.nowIso()});
  return {playerKey:identityKey,kind,linked:false};
}
async function getOrCreate(db,key){
  const ref=db.collection('players').doc(key);
  try{
    const got=await ref.get(); const data=Array.isArray(got?.data)?got.data[0]:got?.data;
    if(data) return game.migrate(data,key);
  }catch(e){}
  const state=game.newPlayer(key); await ref.set({...state}); return state;
}
async function playerContext(db,auth){
  const id=identity(auth); const link=await resolvePlayerKey(db,id.key,id.kind); const state=await getOrCreate(db,link.playerKey);
  return {...id,...link,state};
}
async function optimisticMutate(db,key,requestId,action,mutator,maxTry=5){
  for(let attempt=0;attempt<maxTry;attempt++){
    const got=await db.collection('players').doc(key).get(); const raw=Array.isArray(got?.data)?got.data[0]:got?.data;
    if(!raw) throw game.codeError('PLAYER_NOT_FOUND'); const state=game.migrate(raw,key);
    if(requestId && state.lastAction?.requestId===requestId && state.lastAction?.action===action) return {state,result:state.lastAction.result,idempotent:true};
    const baseRevision=Number(state.revision)||0; const result=await mutator(state); state.revision=baseRevision+1;
    state.lastAction={requestId:requestId||null,action,result,at:game.nowIso()}; state.updatedAt=game.nowIso();
    const payload={...state}; delete payload._id;
    const res=await db.collection('players').where({_id:key,revision:baseRevision}).update(payload);
    const updated=res?.updated ?? res?.stats?.updated ?? res?.matched ?? 0;
    if(updated>0) return {state,result,idempotent:false};
  }
  throw game.codeError('CONFLICT_RETRY');
}
function linkCode(){ return crypto.randomInt(0,36**6).toString(36).toUpperCase().padStart(6,'0'); }
async function createLinkCode(db,playerKey){
  const code=linkCode(), expiresAt=Date.now()+10*60*1000;
  await db.collection('link_codes').doc(code).set({playerKey,expiresAt,used:false,createdAt:game.nowIso()});
  return {code,expiresAt};
}
async function redeemLinkCode(db,identityKey,kind,code){
  const normalized=String(code||'').trim().toUpperCase(); if(!/^[0-9A-Z]{6}$/.test(normalized)) throw game.codeError('INVALID_LINK_CODE');
  const got=await db.collection('link_codes').doc(normalized).get(); const data=Array.isArray(got?.data)?got.data[0]:got?.data;
  if(!data||data.used) throw game.codeError('INVALID_LINK_CODE'); if(Number(data.expiresAt)<Date.now()) throw game.codeError('LINK_CODE_EXPIRED');
  const existing=await resolvePlayerKey(db,identityKey,kind);
  if(existing.playerKey!==identityKey && existing.playerKey!==data.playerKey) throw game.codeError('IDENTITY_ALREADY_LINKED');
  if(existing.playerKey===identityKey && identityKey!==data.playerKey){
    const current=await getOrCreate(db,identityKey); if(!game.isPristine(current)) throw game.codeError('LINK_WOULD_REPLACE_PROGRESS');
  }
  await db.collection('identity_links').doc(identityKey).set({playerKey:data.playerKey,kind,linkedAt:game.nowIso(),updatedAt:game.nowIso()});
  await db.collection('link_codes').doc(normalized).update({used:true,usedBy:identityKey,usedAt:game.nowIso()});
  const state=await getOrCreate(db,data.playerKey); state.profile ||= {displayName:'引星者'}; state.profile.linked=true;
  const payload={...state,updatedAt:game.nowIso()}; delete payload._id; await db.collection('players').doc(data.playerKey).update(payload);
  return state;
}
function ok(data){return {ok:true,data};}
function fail(e){return {ok:false,code:e?.code||e?.message||'SERVER_ERROR',message:e?.message||String(e)};}
module.exports={init,identity,resolvePlayerKey,getOrCreate,playerContext,optimisticMutate,createLinkCode,redeemLinkCode,ok,fail};
