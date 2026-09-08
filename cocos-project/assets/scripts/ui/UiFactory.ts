import {Node,UITransform,Label,Graphics,Color,Button,EventTouch,HorizontalTextAlignment} from 'cc';import {Theme} from './Theme';
export class UiFactory{
 static node(name:string,w=100,h=100){const n=new Node(name);const t=n.addComponent(UITransform);t.setContentSize(w,h);return n}
 static panel(name:string,w:number,h:number,color:Color=Theme.panel,r=22){const n=this.node(name,w,h);const g=n.addComponent(Graphics);g.fillColor=color;g.strokeColor=new Color(145,119,194,70);g.lineWidth=1;g.roundRect(-w/2,-h/2,w,h,r);g.fill();g.stroke();return n}
 static label(text:string,size=28,color:Color=Theme.text,w=300,h=48){const n=this.node('Label',w,h);const l=n.addComponent(Label);l.string=text;l.fontSize=size;l.lineHeight=Math.round(size*1.25);l.color=color;l.horizontalAlign=HorizontalTextAlignment.LEFT;return n}
 static button(text:string,w=180,h=70,onClick?:()=>void,primary=false){const n=this.panel('Button',w,h,primary?new Color(112,78,155,255):new Color(27,34,57,245),16);n.addComponent(Button);const label=this.label(text,24,primary?new Color(248,235,202,255):Theme.text,w-20,h);n.addChild(label);label.setPosition(-w/2+12,0);if(onClick)n.on(EventTouch.TOUCH_END,onClick);return n}
 static stat(label:string,value:string,w=132){const n=this.panel('Stat',w,72,new Color(10,15,29,210),12);const a=this.label(label,17,Theme.muted,w-18,24);a.setPosition(-w/2+10,18);const b=this.label(value,23,Theme.text,w-18,30);b.setPosition(-w/2+10,-10);n.addChild(a);n.addChild(b);return n}
}
