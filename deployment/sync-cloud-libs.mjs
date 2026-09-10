import fs from 'node:fs';import path from 'node:path';import url from 'node:url';
const root=path.resolve(path.dirname(url.fileURLToPath(import.meta.url)),'..'),shared=path.join(root,'cloudbase','_shared'),fnRoot=path.join(root,'cloudbase','functions');
let count=0;for(const ent of fs.readdirSync(fnRoot,{withFileTypes:true})){if(!ent.isDirectory())continue;const lib=path.join(fnRoot,ent.name,'lib');fs.mkdirSync(lib,{recursive:true});for(const name of ['game.js','cloud.js']){fs.copyFileSync(path.join(shared,name),path.join(lib,name));count++;}}
console.log(`cloud shared libs synced · ${count} files`);
