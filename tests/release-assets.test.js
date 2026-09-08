const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..','web');
const m=JSON.parse(fs.readFileSync(path.join(root,'asset-manifest.v20.json'),'utf8'));
assert.equal(m.version,'v20');assert.equal(m.release.version,'2.0.0');assert.equal(Object.keys(m.heroes).length,15);assert.equal(Object.keys(m.status).length,8);assert.equal(Object.keys(m.bosses).length,6);assert.equal(Object.keys(m.bossSplash).length,6);
for(const h of Object.values(m.heroes)){for(const k of ['portrait','full','skill'])assert.ok(fs.existsSync(path.join(root,h[k])),`missing ${h[k]}`)}
for(const grp of ['backgrounds','status','bosses','bossSplash','frames'])for(const f of Object.values(m[grp]))assert.ok(fs.existsSync(path.join(root,f)),`missing ${f}`);
for(const f of [m.release.cover,m.release.visualBoard])assert.ok(fs.existsSync(path.join(root,f)),`missing ${f}`);
assert.ok(fs.existsSync(path.join(__dirname,'..','deployment','deploy-web-cloudbase-v20.sh')));
assert.ok(fs.existsSync(path.join(__dirname,'..','cocos-project','assets','resources','config','asset-manifest.v20.json')));
console.log('v2.0 release asset test passed');
