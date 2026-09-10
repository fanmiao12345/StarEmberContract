(function(){
  const fallback={version:'v20',heroes:{},status:{},bosses:{},backgrounds:{},frames:{}};
  let manifest=fallback,ready=false;
  const path=(p)=>p||'';
  async function load(){try{const r=await fetch('./asset-manifest.v20.json',{cache:'no-cache'});if(r.ok)manifest=await r.json()}catch(e){console.warn('[assets] manifest fallback',e)}ready=true;try{window.dispatchEvent(new CustomEvent('star-ember-assets-ready',{detail:manifest}))}catch{}return manifest}
  function heroPortrait(id,full=false){const h=manifest.heroes?.[id];return path(full?h?.full:h?.portrait)||`assets/characters/${id}.jpg`}
  function skill(id){return path(manifest.heroes?.[id]?.skill)||`assets/ui/skills/${id}.svg`}
  function status(id){return path(manifest.status?.[id])||''}
  function boss(stage){return path(manifest.bosses?.[String(stage)])||''}
  function bossSplash(stage){return path(manifest.bossSplash?.[String(stage)])||boss(stage)}
  function bg(id){return path(manifest.backgrounds?.[id])||''}
  const preloaded=new Set();
  function preloadImages(list=[]){if(typeof Image==='undefined')return Promise.resolve();return Promise.allSettled(list.filter(Boolean).filter(x=>!preloaded.has(x)).map(src=>new Promise(resolve=>{preloaded.add(src);const img=new Image();img.onload=img.onerror=resolve;img.decoding='async';img.loading='eager';img.src=src})))}
  async function preloadCritical(options={}){const m=ready?manifest:await load(),all=[...(m.critical||[])],reduced=!!options.reduced,list=reduced?all.slice(0,Math.min(2,all.length)):all;let loaded=0;const emit=(src='')=>{try{window.dispatchEvent(new CustomEvent('star-ember-preload-progress',{detail:{loaded,total:list.length,ratio:list.length?loaded/list.length:1,src,reduced}}))}catch{}};emit();if(typeof Image==='undefined'){loaded=list.length;emit();return m}await Promise.all(list.map(src=>new Promise(resolve=>{const img=new Image();img.onload=img.onerror=()=>{loaded++;emit(src);resolve()};img.decoding='async';img.src=src})));return m}
  function preloadSecondary(options={}){if(options.reduced)return Promise.resolve(manifest);const run=async()=>{const m=ready?manifest:await load(),list=[m.release?.cover,m.release?.visualBoard,m.backgrounds?.['battle'],m.backgrounds?.['gacha'],m.backgrounds?.['event'],m.heroes?.h002?.portrait,m.heroes?.h003?.portrait,m.heroes?.h004?.portrait].filter(Boolean);await preloadImages(list);return m};return new Promise(resolve=>{const job=()=>run().then(resolve).catch(()=>resolve(manifest));if(typeof requestIdleCallback==='function')requestIdleCallback(job,{timeout:1800});else setTimeout(job,700)})}
  window.StarEmberAssets={load,preloadCritical,preloadSecondary,heroPortrait,skill,status,boss,bossSplash,bg,get manifest(){return manifest},get ready(){return ready}};
  load();
})();
