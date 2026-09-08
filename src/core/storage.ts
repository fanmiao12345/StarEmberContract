import type {PlayerState} from './models';
export interface SavePort{load():Promise<PlayerState|null>|PlayerState|null;save(state:PlayerState):Promise<void>|void}
export class BrowserLocalSave implements SavePort{
  constructor(private key='starEmber.save.v8'){}
  load(){try{return JSON.parse(localStorage.getItem(this.key)||'null') as PlayerState|null}catch{return null}}
  save(state:PlayerState){localStorage.setItem(this.key,JSON.stringify(state))}
}
