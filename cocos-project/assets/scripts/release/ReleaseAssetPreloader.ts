import {AssetLoader} from '../assets/AssetLoader';
export class ReleaseAssetPreloader{static critical(){const m=AssetLoader.manifest;return [...(m?.critical||[])];}static heroFull(id:string){return AssetLoader.hero(id)?.full||''}static bossSplash(stage:number){return AssetLoader.bossSplash(stage)}static cover(){return AssetLoader.release()?.cover||''}}
