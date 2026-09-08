declare module 'cc' {
  export class Vec2 { constructor(x?:number,y?:number); x:number; y:number }
  export class Vec3 { constructor(x?:number,y?:number,z?:number); x:number; y:number; z:number; clone():Vec3; static ZERO:Vec3 }
  export class Color { constructor(r?:number,g?:number,b?:number,a?:number); static WHITE:Color; static BLACK:Color }
  export class Component { node:Node; scheduleOnce(cb:()=>void,delay?:number):void }
  export class Node { constructor(name?:string); name:string; active:boolean; parent:Node|null; children:Node[]; position:Vec3; angle:number; addChild(n:Node):void; removeAllChildren():void; setPosition(x:number|Vec3,y?:number,z?:number):void; setScale(x:number|Vec3,y?:number,z?:number):void; setRotationFromEuler(x:number,y:number,z:number):void; destroy():void; getComponent<T>(c:new()=>T):T|null; addComponent<T>(c:new()=>T):T; on(type:string,cb:(...a:any[])=>void,target?:any):void; emit(type:string,...a:any[]):void }
  export class UITransform { setContentSize(w:number,h:number):void; width:number;height:number; anchorX:number;anchorY:number }
  export class Label { string:string; fontSize:number; lineHeight:number; color:Color; horizontalAlign:number; verticalAlign:number; overflow:number }
  export class Sprite { color:Color }
  export class Graphics { fillColor:Color; strokeColor:Color; lineWidth:number; clear():void; rect(x:number,y:number,w:number,h:number):void; roundRect(x:number,y:number,w:number,h:number,r:number):void; fill():void; stroke():void; circle(x:number,y:number,r:number):void }
  export class Widget { isAlignTop:boolean;isAlignBottom:boolean;isAlignLeft:boolean;isAlignRight:boolean;top:number;bottom:number;left:number;right:number;updateAlignment():void }
  export class Button { interactable:boolean }
  export class ScrollView { content:Node|null }
  export class Layout { type:number; resizeMode:number; spacingX:number; spacingY:number; paddingLeft:number;paddingRight:number;paddingTop:number;paddingBottom:number }
  export class tween<T> {}
  export function tween<T>(target:T):{to(duration:number,props:any,opts?:any):any;by(duration:number,props:any,opts?:any):any;delay(duration:number):any;call(cb:()=>void):any;repeatForever(action:any):any;start():void;stop():void}
  export const director:{loadScene(name:string):void; getScene():Node|null};
  export const view:{getVisibleSize():{width:number;height:number};getDesignResolutionSize():{width:number;height:number}};
  export const sys:{os:string;OS:{IOS:string;ANDROID:string};isMobile:boolean};
  export const _decorator:{ccclass(name:string):ClassDecorator;property:(...args:any[])=>any};
  export const EventTouch:{TOUCH_END:string};
  export const HorizontalTextAlignment:{LEFT:number;CENTER:number;RIGHT:number};
  export const VerticalTextAlignment:{TOP:number;CENTER:number;BOTTOM:number};
}
