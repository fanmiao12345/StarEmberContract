const CACHE='star-ember-v21-ui-fidelity220';
const CORE=['./','./index.html','./styles.css','./game-data.js','./app.js','./asset-loader.js','./asset-manifest.v20.json','./version.json','./manifest.webmanifest','./cloud-config.js','./cloud-bridge.js','./assets/icons/icon-192.png','./assets/icons/icon-512.png'];
const STATIC=['./assets/release/home-main-v20.jpg','./assets/release/release-cover-v20.jpg','./assets/characters/h001_full.jpg'];
const TIMEOUT=2600;
async function cachePut(req,res){if(res&&res.ok){const c=await caches.open(CACHE);await c.put(req,res.clone())}return res}
async function networkFirst(req,fallback='./index.html'){const net=fetch(req).then(r=>cachePut(req,r));try{return await Promise.race([net,new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),TIMEOUT))])}catch{const cached=await caches.match(req);if(cached)return cached;if(fallback)return caches.match(fallback);throw new Error('offline')}}
async function staleWhileRevalidate(req){const cached=await caches.match(req),update=fetch(req).then(r=>cachePut(req,r)).catch(()=>null);return cached||update}
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll([...CORE,...STATIC])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));try{if(self.registration.navigationPreload)await self.registration.navigationPreload.enable()}catch{}await self.clients.claim()})()));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(url.origin!==self.location.origin)return;const dynamic=e.request.mode==='navigate'||/\.(?:html|css|js|json|webmanifest)$/.test(url.pathname);e.respondWith(dynamic?networkFirst(e.request,e.request.mode==='navigate'?'./index.html':null):staleWhileRevalidate(e.request))});
