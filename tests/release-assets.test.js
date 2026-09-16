const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..','web');
const m=JSON.parse(fs.readFileSync(path.join(root,'asset-manifest.v20.json'),'utf8'));
const version=JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8'));
assert.equal(m.version,'v20');assert.equal(m.release.version,version.version);assert.equal(Object.keys(m.heroes).length,15);assert.equal(Object.keys(m.status).length,8);assert.equal(Object.keys(m.bosses).length,6);assert.equal(Object.keys(m.bossSplash).length,6);
for(const h of Object.values(m.heroes)){for(const k of ['portrait','full','skill'])assert.ok(fs.existsSync(path.join(root,h[k])),`missing ${h[k]}`)}
for(const grp of ['backgrounds','status','bosses','bossSplash','frames'])for(const f of Object.values(m[grp]))assert.ok(fs.existsSync(path.join(root,f)),`missing ${f}`);
for(const f of [m.release.cover,m.release.visualBoard])assert.ok(fs.existsSync(path.join(root,f)),`missing ${f}`);
assert.ok(fs.existsSync(path.join(__dirname,'..','deployment','deploy-web-cloudbase-v20.sh')));
assert.ok(fs.existsSync(path.join(__dirname,'..','cocos-project','assets','resources','config','asset-manifest.v20.json')));
console.log('release asset test passed · '+version.version);
const build=fs.readFileSync(path.join(__dirname,'..','deployment','build-web-v20.mjs'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert.ok(build.includes("crypto.createHash('sha256')")&&build.includes('cache-safe assets:'),'release build must content-hash core assets');
/* v2.2.3：缓存名从 star-ember-v221-report-hardening 升级为 star-ember-v223-release。
   原因：旧 SW 的 networkFirst 带 2.6s 超时竞速，超时即回退缓存，导致弱网/慢设备用户
   长期拿到旧 styles.css 与 app.js，UI 更新不生效。本次同时改了缓存名与回退策略，
   缓存名必须随之变更，否则 activate 阶段的清理不会生效。
   （命名需保持 star-ember-v(20|21|22) 前缀，以匹配 deployment/release-v20.mjs 的校验） */
assert.ok(sw.includes('star-ember-v223-release'),'service worker cache key must be v2.2.3 cache-safe');
assert.ok(!/Promise\.race/.test(sw),'service worker must not race the network against a timeout (stale-asset regression)');
