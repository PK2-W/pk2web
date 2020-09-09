import { PkDeviceAction } from '@ng/core/input/action/PkDeviceAction';
import { PkKeyboardAction } from '@ng/core/input/action/PkKeyboardAction';
import { PkKeyboardEvent } from '@ng/core/input/event/PkKeyboardEvent';
import { PkInputEvent } from '@ng/core/input/PkInputEvent';
import type { PkEngine } from '@ng/core/PkEngine';
import { Log } from '@ng/support/log/LoggerImpl';
import { EventEmitter } from 'eventemitter3';
import { Key } from 'ts-key-enum';

export { Key } from 'ts-key-enum';

/**
 * PkInput is the service in charge of linking the physical keys of a device with the virtual controls
 * required by the game.
 */
export class PkInput extends EventEmitter {
    private readonly _engine: PkEngine;
    
    private readonly _actingDeviceKeys: Set<string>;
    private readonly _actingGameActions: Set<string | number>;
    
    public keyCooldown: number;
    
    private _relations: DeviceGameActionRelation[];
    
    
    public constructor(engine: PkEngine) {
        super();
        
        this._engine = engine;
        
        this._actingDeviceKeys = new Set;
        this._actingGameActions = new Set;
        
        this.keyCooldown = 0;
        this._relations = [];
        
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('keypress', this.onKeyPress.bind(this));
        document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
        window.addEventListener('blur', this.onWindowBlur.bind(this));
        
        // HARCODED
        //this.attatchAction();
    }
    
    public listenKeys(keys: string, fn: () => any) {
        /* hotkeys(keys, fn);*/
    }
    
    public unlistenKeys(keys: string, fn: () => any) {
    
    }
    
    public attatchAction(keyCode: number, action: number | string) {
        
    }
    
    public isActing(action: number | string): boolean {
        return this._actingGameActions.has(action);
        
        // if (action === EInputAction.INPUT_LEFT)
        //     return this._activeDeviceKeys.has(Key.ArrowLeft);
        // if (action === EInputAction.INPUT_RIGHT)
        //     return this._activeDeviceKeys.has(Key.ArrowRight);
        // if (action === EInputAction.INPUT_JUMP)
        //     return this._activeDeviceKeys.has(Key.ArrowUp);
        // if (action === EInputAction.INPUT_DOWN)
        //     return this._activeDeviceKeys.has(Key.ArrowDown);
        //
        // if (action === EInputAction.INPUT_WALK_SLOW)
        //     return this._activeDeviceKeys.has(Key.AltGraph);
        //
        // if (action === EInputAction.INPUT_ATTACK1)
        //     return this._activeDeviceKeys.has(Key.Control);
        // if (action === EInputAction.INPUT_ATTACK2)
        //     return this._activeDeviceKeys.has(Key.Alt);
        //
        // if (action === EInputAction.INPUT_SUICIDE)
        //     return this._activeDeviceKeys.has(Key.Delete);
        // if (action === EInputAction.INPUT_PAUSE)
        //     return this._activeDeviceKeys.has('P');
        //
        // if (action === EInputAction.INPUT_GIFT_NEXT)
        //     return this._activeDeviceKeys.has(Key.Tab);
        // if (action === EInputAction.INPUT_GIFT_USE)
        //     return this._activeDeviceKeys.has(' ');
    }
    
    public triggerAction() {}
    
    public triggerDevice() {}
    
    public associateAction(deviceActns: PkKeyboardAction[], gameActns: (number | string)[]): void {
        this._relations.push({
            id: null,
            deviceActns: deviceActns,
            gameActns: gameActns
        });
    }
    
    public getGameActionsByDeviceActn(deviceActn: PkDeviceAction): (number | string)[] {
        return this._relations
            .filter(relation => relation.deviceActns.some(action => action.fullId === deviceActn.fullId))
            .map(relation => relation.gameActns)
            .reduce((result, current) => {
                result.push(...current);
                return result;
            }, []);
    }
    
    public getGameActionsById(fullId: string): (number | string)[] {
        return this._relations
            .filter(relation => relation.deviceActns.some(action => action.fullId === fullId))
            .map(relation => relation.gameActns)
            .reduce((result, current) => {
                result.push(...current);
                return result;
            }, []);
    }
    
    public getGameActionsByKeyId(keyId: string): (number | string)[] {
        return this._relations
            .filter(relation => relation.deviceActns.some(action => action.id === keyId))
            .map(relation => relation.gameActns)
            .reduce((result, current) => {
                result.push(...current);
                return result;
            }, []);
    }
    
    private _updateActiveGameActions() {
        this._actingGameActions.clear();
        
        this._actingDeviceKeys
            .forEach((keyId) => {
                this.getGameActionsByKeyId(keyId)
                    .forEach(this._actingGameActions.add, this._actingGameActions);
            });
    }
    
    ///  Events  ///
    
    private onKeyDown(ev: KeyboardEvent): void {
        if (ev.key == Key.Tab) {
            ev.preventDefault();
        }
        
        const deviceEvnt = new PkKeyboardEvent(ev);
        
        if (!this._actingDeviceKeys.has(deviceEvnt.action.id)) {
            this._actingDeviceKeys.add(deviceEvnt.action.id);
            this._updateActiveGameActions();
            
            Log.v('         Added to active (', this._actingDeviceKeys.size, ')');
        }
        
        const gameActns = this.getGameActionsByDeviceActn(deviceEvnt.action);
        const inputEvent = new PkInputEvent(deviceEvnt, gameActns);
        
        Log.v('[~Input] Device DOWN: "', deviceEvnt.action.fullId, '"');
        Log.v('         Triggers actions: [', gameActns.join(', '), ']');
        
        this.emit(PkInput.EV_KEYDOWN, inputEvent);
    }
    
    private onKeyUp(ev: KeyboardEvent): void {
        if (ev.key == Key.Tab) {
            ev.preventDefault();
        }
        
        const deviceEvnt = new PkKeyboardEvent(ev);
        const gameActns = this.getGameActionsByDeviceActn(deviceEvnt.action);
        
        Log.v('[~Input] Device UP: "', deviceEvnt.action.fullId, '"');
        Log.v('         Triggers actions: [', gameActns.join(', '), ']');
        
        if (this._actingDeviceKeys.has(deviceEvnt.action.id)) {
            this._actingDeviceKeys.delete(deviceEvnt.action.id);
            this._updateActiveGameActions();
            
            Log.v('         Removed from active (', this._actingDeviceKeys.size, ')');
        }
    }
    
    /** @deprecated */
    private onKeyPress(ev: KeyboardEvent): void {
    }
    
    private onVisibilityChange(): void {
        if (document.hidden) {
            this.onWindowBlur();
        }
    }
    
    private onWindowBlur(): void {
        this._actingDeviceKeys.clear();
        
        Log.v('[~Input] All keys released');
    }
    
    public static readonly EV_KEYUP = Symbol('up.key.input.evt');
    public static readonly EV_KEYDOWN = Symbol('down.key.input.evt');
}

type DeviceGameActionRelation = {
    id: string,
    deviceActns: PkDeviceAction[],
    gameActns: Array<number | string>
}