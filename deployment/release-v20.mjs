import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),web=path.join(root,'web');
const manifestPath=path.join(web,'asset-manifest.v20.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8')),version=JSON.parse(fs.readFileSync(path.join(web,'version.json'),'utf8'));
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
if(manifest.release?.version!==version.version)missing.push(`release.version != ${version.version}`);
const app=fs.readFileSync(path.join(web,'app.js'),'utf8'),sw=fs.readFileSync(path.join(web,'sw.js'),'utf8');
if(!app.includes("starEmber.save.v20"))missing.push('app save key not v20');
if(!/star-ember-v(?:20|21|22)/.test(sw))missing.push('service worker cache id invalid');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')),html=fs.readFileSync(path.join(web,'index.html'),'utf8'),game=fs.readFileSync(path.join(web,'game-data.js'),'utf8'),cloudGame=fs.readFileSync(path.join(root,'cloudbase','_shared','game.js'),'utf8'),cocos=fs.readFileSync(path.join(root,'cocos-project','assets','scripts','release','ReleaseConfig.ts'),'utf8');
if(pkg.version!==version.version)missing.push(`package.version != ${version.version}`);
if(!html.includes(`v${version.version}`))missing.push(`index metadata missing v${version.version}`);
if(!game.includes(`CONFIG_VERSION = '${version.configVersion}'`))missing.push(`web CONFIG_VERSION != ${version.configVersion}`);
if(!cloudGame.includes(`CONFIG_VERSION = '${version.configVersion}'`))missing.push(`cloud CONFIG_VERSION != ${version.configVersion}`);
if(!cocos.includes(`version:'${version.version}'`)||!cocos.includes(`configVersion:'${version.configVersion}'`))missing.push('Cocos release metadata drift');
if(missing.length){console.error(`${version.version} release check FAILED`);for(const m of missing)console.error(' -',m);process.exit(1)}
const hashes={};for(const rel of required.concat(uniq)){const p=path.join(web,rel);if(fs.existsSync(p)&&fs.statSync(p).isFile())hashes[rel]=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0,16)}
const report={version:version.version,configVersion:version.configVersion,channel:version.channel,manifest:'v20',generatedAt:new Date().toISOString(),assetCount:uniq.length,requiredFileCount:required.length,missing:[],hashes};
fs.writeFileSync(path.join(root,'deployment','release-report-v20.json'),JSON.stringify(report,null,2));
console.log(`${version.version} release-check OK · ${uniq.length} assets · ${required.length} release files · 0 missing`);
