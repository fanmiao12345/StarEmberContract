import {_decorator,Component,Node} from 'cc';
const{ccclass}=_decorator;
@ccclass('HomeBackgroundMotion')
export class HomeBackgroundMotion extends Component{
  private t=0;
  update(dt:number){this.t+=dt;this.node.setRotationFromEuler(0,0,this.t*2.4);const s=1+Math.sin(this.t*.65)*.018;this.node.setScale(s,s,1)}
}
