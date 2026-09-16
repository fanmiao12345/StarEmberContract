const CACHE='star-ember-v225-release';
const CORE=['./','./index.html','./styles.fedc14ae8f.css','./game-data.dfedfd181d.js','./star-ember-battle.3e529a511f.js','./app.9be3fca6fa.js','./asset-loader.78c53591d4.js','./asset-manifest.v20.json','./version.json','./manifest.webmanifest','./cloud-config.13f702bf7b.js','./cloud-bridge.f62f35c506.js','./assets/icons/icon-192.png','./assets/icons/icon-512.png'];
const STATIC=['./assets/release/home-main-v20.jpg','./assets/release/release-cover-v20.jpg','./assets/characters/h001_full.jpg'];
async function cachePut(req,res){if(res&&res.ok){const c=await caches.open(CACHE);await c.put(req,res.clone())}return res}
/*
  v2.2.4 修复（提示词10 · 弹层层级滚动响应式 / 提示词12 · 验收回归）：
  原实现用 2.6 秒超时与网络请求竞速，超时即回退缓存。后果是弱网或慢设备上，
  用户会持续拿到旧的 styles.css / app.js，界面改动永远不生效
  （这也是"改完看不到效果 / 界面还是旧的"这类反馈的根因之一）。
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
  }catch(e){
    const cached=await caches.match(req);
    if(cached)return cached;
    if(fallback)return caches.match(fallback);
    throw e;
  }
}
async function cacheFirst(req){
  const cached=await caches.match(req);
  if(cached)return cached;
  const res=await fetch(req);
  cachePut(req,res.clone());
  return res;
}
async function staleWhileRevalidate(req){
  const cached=await caches.match(req),update=fetch(req).then(r=>cachePut(req,r)).catch(()=>null);
  return cached||update||fetch(req);
}
async function precacheBestEffort(){
  const c=await caches.open(CACHE);
  await Promise.all([...CORE,...STATIC].map(url=>c.add(url).catch(()=>null)));
}
self.addEventListener('install',e=>e.waitUntil(precacheBestEffort()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE&&/^star-ember-/.test(k)).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;
  if(req.mode==='navigate'){e.respondWith(networkFirst(req,'./index.html'));return}
  if(/\/assets\//.test(url.pathname)){e.respondWith(cacheFirst(req));return}
  if(/\.(?:js|css|json|webmanifest)$/.test(url.pathname)){e.respondWith(staleWhileRevalidate(req));return}
  e.respondWith(networkFirst(req,null));
});
self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();
});
