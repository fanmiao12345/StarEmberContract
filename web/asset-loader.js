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
  async function preloadCritical(){const m=ready?manifest:await load();await Promise.all((m.critical||[]).map(src=>new Promise(resolve=>{const img=new Image();img.onload=img.onerror=resolve;img.src=src})));return m}
  window.StarEmberAssets={load,preloadCritical,heroPortrait,skill,status,boss,bossSplash,bg,get manifest(){return manifest},get ready(){return ready}};
  load();
})();
