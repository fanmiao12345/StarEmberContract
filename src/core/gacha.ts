import type {HeroConfig,PlayerState,Rarity} from './models';
const fragments:Record<Rarity,number>={R:10,SR:20,SSR:40};
export class GachaService{
  constructor(private heroes:HeroConfig[]){}
  pull(state:PlayerState,rng=Math.random){
    if(state.tickets<1)throw new Error('NOT_ENOUGH_TICKETS');state.tickets--;state.pity++;
    const rarity:Rarity=state.pity>=50?'SSR':((r=>r<.03?'SSR':r<.25?'SR':'R')(rng()));if(rarity==='SSR')state.pity=0;
    const pool=this.heroes.filter(x=>x.rarity===rarity),hero=pool[Math.floor(rng()*pool.length)],owned=state.heroes[hero.id];
    let duplicate=false,fragmentsGained=0;
    if(owned){duplicate=true;fragmentsGained=fragments[rarity];owned.fragments+=fragmentsGained}
    else state.heroes[hero.id]={level:1,star:1,fragments:0,awakening:0,signature:null,equipment:{weapon:null,armor:null,charm:null}};
    if(state.formation.length<5&&!state.formation.includes(hero.id))state.formation.push(hero.id);
    state.gachaHistory.unshift({heroId:hero.id,rarity,duplicate,fragmentsGained,at:new Date().toISOString()});
    if(state.daily?.progress?.gacha5!=null)state.daily.progress.gacha5=Math.min(5,state.daily.progress.gacha5+1);
    return{hero,duplicate,fragmentsGained};
  }
}
