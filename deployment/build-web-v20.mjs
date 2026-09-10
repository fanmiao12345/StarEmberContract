import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..'),src=path.join(root,'web'),dst=path.join(root,'dist-web-v20');
execFileSync(process.execPath,[path.join(root,'deployment','release-v20.mjs')],{stdio:'inherit'});
fs.rmSync(dst,{recursive:true,force:true});fs.cpSync(src,dst,{recursive:true});
const version=JSON.parse(fs.readFileSync(path.join(src,'version.json'),'utf8'));
const core=['styles.css','asset-loader.js','game-data.js','cloud-config.js','cloud-bridge.js','app.js'];
const mapped={};
for(const rel of core){const p=path.join(dst,rel),buf=fs.readFileSync(p),hash=crypto.createHash('sha256').update(buf).digest('hex').slice(0,10),ext=path.extname(rel),base=rel.slice(0,-ext.length),out=`${base}.${hash}${ext}`;fs.copyFileSync(p,path.join(dst,out));mapped[rel]=out;}
let html=fs.readFileSync(path.join(dst,'index.html'),'utf8');
for(const [from,to] of Object.entries(mapped))html=html.replaceAll(`./${from}`,`./${to}`);
html=html.replace('</head>',`  <meta name="star-ember-build" content="${version.version}" />\n</head>`);
fs.writeFileSync(path.join(dst,'index.html'),html);
let sw=fs.readFileSync(path.join(dst,'sw.js'),'utf8');
for(const [from,to] of Object.entries(mapped))sw=sw.replaceAll(`./${from}`,`./${to}`);
fs.writeFileSync(path.join(dst,'sw.js'),sw);
const info={version:version.version,configVersion:version.configVersion,channel:version.channel||'release-preview',builtAt:new Date().toISOString(),cacheStrategy:'content-hash',assets:mapped};
fs.writeFileSync(path.join(dst,'release-info.json'),JSON.stringify(info,null,2));
fs.writeFileSync(path.join(dst,`release-probe-${version.version}.json`),JSON.stringify({version:version.version,builtAt:info.builtAt,cacheStrategy:info.cacheStrategy},null,2));
console.log('dist-web-v20 ready:',dst);console.log('cache-safe assets:',mapped);
