import { PkEngine } from '@ng/PkEngine';

export class PkInput {
    private readonly _engine: PkEngine;
    
    constructor(engine: PkEngine) {
        this._engine = engine;
    }
    
    public listenKeys(keys: string, fn: () => any) {
       /* hotkeys(keys, fn);*/
    }
    
    public unlistenKeys(keys: string, fn: () => any) {
    
    }
}
