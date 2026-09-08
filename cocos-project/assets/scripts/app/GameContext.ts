import type {GameApi} from '../core/GameApi';
import type {GameState} from '../model/GameState';
export class GameContext {
  private static _api:GameApi|null=null; private static _state:GameState|null=null;
  static install(api:GameApi,state:GameState){this._api=api;this._state=state;(globalThis as any).StarEmberApi=api;(globalThis as any).StarEmberState=state;}
  static get api():GameApi{if(!this._api)throw new Error('GameContext API not installed');return this._api}
  static get state():GameState{if(!this._state)throw new Error('GameContext state not installed');return this._state}
  static update(state:GameState){this._state=state;(globalThis as any).StarEmberState=state;}
}
