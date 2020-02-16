import { PkEngine } from '@ng/PkEngine';
import { Log } from '@ng/support/log/LoggerImpl';
import hotkeys from 'hotkeys-js';
import { Key } from 'ts-key-enum';
import { InputAction } from '../support/constants';
import { str } from '../support/types';

export { Key } from 'ts-key-enum';

export class PkInput {
    private readonly _engine: PkEngine;
    
    private pressedKeys: Set<string>;
    private actionToInput;
    
    public constructor(engine: PkEngine) {
        this._engine = engine;
        
        this.pressedKeys = new Set;
        
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
        
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
        if (action === InputAction.INPUT_LEFT)
            return this.pressedKeys.has(Key.ArrowLeft);
        
        if (action === InputAction.INPUT_RIGHT)
            return this.pressedKeys.has(Key.ArrowRight);
        
        if (action === InputAction.INPUT_JUMP)
            return this.pressedKeys.has(Key.ArrowUp);
        
        if (action === InputAction.INPUT_DOWN)
            return this.pressedKeys.has(Key.ArrowDown);
        
        return false;
    }
    
    
    ///  Events  ///
    
    private onKeyDown(ev: KeyboardEvent): void {
        this.pressedKeys.add(ev.key);
        Log.v('Down ' + ev.key);
    }
    
    private onKeyUp(ev: KeyboardEvent): void {
        this.pressedKeys.delete(ev.key);
        Log.v('Up ' + ev.key);
    }
    
    private onVisibilityChange(): void {
        if (document.hidden) {
            this.pressedKeys.clear();
        }
    }
}
