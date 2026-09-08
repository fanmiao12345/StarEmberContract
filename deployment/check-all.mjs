import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const files = [
  'web/game-data.js','web/asset-loader.js','web/cloud-config.js','web/cloud-bridge.js','web/app.js',
  'cloudbase/_shared/game.js','cloudbase/_shared/cloud.js','web/sw.js'
];
const fnRoot='cloudbase/functions';
for (const d of fs.readdirSync(fnRoot,{withFileTypes:true})) if (d.isDirectory()) files.push(path.join(fnRoot,d.name,'index.js'));
for (const f of files) {
  const r=spawnSync(process.execPath,['--check',f],{stdio:'inherit'});
  if (r.status!==0) process.exit(r.status||1);
}
console.log(`syntax check passed · ${files.length} files`);
