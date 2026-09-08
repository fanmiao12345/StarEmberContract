import {director} from 'cc';
export type GameScene='Login'|'Home'|'Heroes'|'Gacha'|'Formation'|'Battle';
export class SceneRouter{static go(scene:GameScene){director.loadScene(scene)} static home(){this.go('Home')}}
