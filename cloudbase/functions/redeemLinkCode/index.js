const game=require('./lib/game'); const c=require('./lib/cloud');
exports.main=async(event={})=>{try{const code=String(event.code||'');const {db,auth}=c.init();const id=c.identity(auth);const state=await c.redeemLinkCode(db,id.key,id.kind,code);return c.ok({state:game.publicState(state),linked:true});}catch(e){return c.fail(e)}};
