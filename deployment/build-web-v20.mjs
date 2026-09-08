import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..'),src=path.join(root,'web'),dst=path.join(root,'dist-web-v20');
execFileSync(process.execPath,[path.join(root,'deployment','release-v20.mjs')],{stdio:'inherit'});
fs.rmSync(dst,{recursive:true,force:true});fs.cpSync(src,dst,{recursive:true});
fs.writeFileSync(path.join(dst,'release-info.json'),JSON.stringify({version:'2.0.0',channel:'playtest',builtAt:new Date().toISOString()},null,2));
console.log('dist-web-v20 ready:',dst);
