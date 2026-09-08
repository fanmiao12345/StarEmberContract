const game=require('./lib/game'); const c=require('./lib/cloud');
exports.main=async()=>{try{const {db,auth}=c.init();const ctx=await c.playerContext(db,auth);return c.ok({state:game.publicState(ctx.state),session:game.resumeBattleSession(ctx.state)});}catch(e){return c.fail(e)}};
