const c=require('./lib/cloud');
exports.main=async()=>{try{const {db,auth}=c.init();const ctx=await c.playerContext(db,auth);const link=await c.createLinkCode(db,ctx.playerKey);return c.ok(link);}catch(e){return c.fail(e)}};
