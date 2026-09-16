const CACHE='star-ember-v223-release';
const CORE=['./','./index.html','./styles.css','./game-data.js','./app.js','./asset-loader.js','./asset-manifest.v20.json','./version.json','./manifest.webmanifest','./cloud-config.js','./cloud-bridge.js','./assets/icons/icon-192.png','./assets/icons/icon-512.png'];
const STATIC=['./assets/release/home-main-v20.jpg','./assets/release/release-cover-v20.jpg','./assets/characters/h001_full.jpg'];
const TIMEOUT=2600;
async function cachePut(req,res){if(res&&res.ok){const c=await caches.open(CACHE);await c.put(req,res.clone())}return res}
/*
  v2.2.3 修复（提示词10 · 弹层层级滚动响应式 / 提示词12 · 验收回归）：
  原实现用 2.6 秒超时与网络请求竞速，超时即回退缓存。后果是弱网或慢设备上，
  用户会持续拿到旧的 styles.css / app.js，界面改动永远不生效
  （这也是"改完看不到效果/界面还是旧的"这类反馈的根因之一）。
  现改为：网络请求不再被超时打断；只有网络真正失败时才回退缓存。
  离线仍可打开（命中缓存），在线时始终获取最新资源。
*/
async function networkFirst(req,fallback='./index.html'){
  try{
    const res=await fetch(req);
    if(res&&res.ok){cachePut(req,res.clone());return res}
    const cached=await caches.match(req);
    if(cached)return cached;
    if(fallback)return caches.match(fallback);
    return res;
  }catch(err){
    const cached=await caches.match(req);
    if(cached)return cached;
    if(fallback)return caches.match(fallback);
    throw new Error('offline');
  }
}
async function staleWhileRevalidate(req){const cached=await caches.match(req),update=fetch(req).then(r=>cachePut(req,r)).catch(()=>null);return cached||update}
async function precacheBestEffort(){const c=await caches.open(CACHE);await Promise.all([...CORE,...STATIC].map(async url=>{try{const r=await fetch(url,{cache:'reload'});if(r&&r.ok)await c.put(url,r.clone())}catch(err){console.warn('[sw-precache]',url,err?.message||err)}}))}
self.addEventListener('install',e=>e.waitUntil(precacheBestEffort()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));try{if(self.registration.navigationPreload)await self.registration.navigationPreload.enable()}catch{}await self.clients.claim()})()));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(url.origin!==self.location.origin)return;const dynamic=e.request.mode==='navigate'||/\.(?:html|css|js|json|webmanifest)$/.test(url.pathname);e.respondWith(dynamic?networkFirst(e.request,e.request.mode==='navigate'?'./index.html':null):staleWhileRevalidate(e.request))});
