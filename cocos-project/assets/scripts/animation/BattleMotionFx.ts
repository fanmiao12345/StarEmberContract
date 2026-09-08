import {Node,Vec3,tween} from 'cc';
export class BattleMotionFx{
  static strike(node:Node,side:'ally'|'enemy',onDone?:()=>void){const base=node.position.clone(),dx=side==='ally'?42:-42;tween(node).to(.14,{position:new Vec3(base.x+dx,base.y+(side==='ally'?10:-10),base.z)}).to(.16,{position:base}).call(()=>onDone?.()).start()}
  static hit(node:Node){const base=node.position.clone();tween(node).to(.06,{position:new Vec3(base.x-8,base.y,base.z)}).to(.06,{position:new Vec3(base.x+7,base.y,base.z)}).to(.08,{position:base}).start()}
}
