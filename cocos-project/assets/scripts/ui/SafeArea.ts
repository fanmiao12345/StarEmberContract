import {_decorator,Component,UITransform,view} from 'cc';const{ccclass}=_decorator;
@ccclass('SafeArea') export class SafeArea extends Component{start(){const v=view.getVisibleSize();const t=this.node.getComponent(UITransform)||this.node.addComponent(UITransform);t.setContentSize(v.width,v.height)}}
