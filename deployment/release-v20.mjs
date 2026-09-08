import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),web=path.join(root,'web');
const manifestPath=path.join(web,'asset-manifest.v20.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const required=['index.html','styles.css','app.js','game-data.js','asset-loader.js','asset-manifest.v20.json','manifest.webmanifest','sw.js','release-preview-v20.html','version.json'];
const assets=[];
for(const group of ['backgrounds','status','bosses','bossSplash','frames'])Object.values(manifest[group]||{}).forEach(x=>assets.push(x));
for(const h of Object.values(manifest.heroes||{}))assets.push(h.portrait,h.full,h.skill);
if(manifest.release)assets.push(manifest.release.cover,manifest.release.visualBoard);
for(const x of manifest.critical||[])assets.push(x);
const uniq=[...new Set(assets)],missing=[];
for(const rel of uniq)if(!fs.existsSync(path.join(web,rel)))missing.push(rel);
for(const rel of required)if(!fs.existsSync(path.join(web,rel)))missing.push(rel);
if(manifest.version!=='v20')missing.push('manifest.version != v20');
if(manifest.release?.version!=='2.0.0')missing.push('release.version != 2.0.0');
const app=fs.readFileSync(path.join(web,'app.js'),'utf8'),sw=fs.readFileSync(path.join(web,'sw.js'),'utf8');
if(!app.includes("starEmber.save.v20"))missing.push('app save key not v20');
if(!sw.includes("star-ember-v20"))missing.push('service worker cache not v20');
if(missing.length){console.error('v2.0 release check FAILED');for(const m of missing)console.error(' -',m);process.exit(1)}
const hashes={};for(const rel of required.concat(uniq)){const p=path.join(web,rel);if(fs.existsSync(p)&&fs.statSync(p).isFile())hashes[rel]=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0,16)}
const report={version:'2.0.0',manifest:'v20',generatedAt:new Date().toISOString(),assetCount:uniq.length,requiredFileCount:required.length,missing:[],hashes};
fs.writeFileSync(path.join(root,'deployment','release-report-v20.json'),JSON.stringify(report,null,2));
console.log(`v2.0 release-check OK · ${uniq.length} assets · ${required.length} release files · 0 missing`);
