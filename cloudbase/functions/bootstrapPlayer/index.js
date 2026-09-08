const game=require('./lib/game'); const c=require('./lib/cloud');
exports.main=async()=>{try{const {db,auth}=c.init();const ctx=await c.playerContext(db,auth);game.ensureDaily(ctx.state);return c.ok({state:game.publicState(ctx.state),identityKind:ctx.kind,linked:ctx.playerKey!==ctx.key||!!ctx.state.profile?.linked});}catch(e){return c.fail(e)}};
