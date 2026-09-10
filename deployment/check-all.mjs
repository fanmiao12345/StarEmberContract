import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import { spawnSync } from 'node:child_process';
const files=['web/game-data.js','web/asset-loader.js','web/cloud-config.js','web/cloud-bridge.js','web/app.js','cloudbase/_shared/game.js','cloudbase/_shared/cloud.js','web/sw.js'];
const fnRoot='cloudbase/functions',shared={game:fs.readFileSync('cloudbase/_shared/game.js'),cloud:fs.readFileSync('cloudbase/_shared/cloud.js')};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');const drift=[];
for(const d of fs.readdirSync(fnRoot,{withFileTypes:true}))if(d.isDirectory())for(const rel of ['index.js','lib/game.js','lib/cloud.js']){const f=path.join(fnRoot,d.name,rel);files.push(f);if(rel==='lib/game.js'&&hash(fs.readFileSync(f))!==hash(shared.game))drift.push(f);if(rel==='lib/cloud.js'&&hash(fs.readFileSync(f))!==hash(shared.cloud))drift.push(f);}
for(const f of files){const r=spawnSync(process.execPath,['--check',f],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}
if(drift.length){console.error('cloud helper drift detected:');for(const f of drift)console.error(' -',f);process.exit(1)}
console.log(`syntax/integrity check passed · ${files.length} files · cloud helper drift 0`);
