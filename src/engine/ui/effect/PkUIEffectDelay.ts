import { PkUiEffect } from '@ng/ui/effect/PkUiEffect';

export class PkUIEffectDelay extends PkUiEffect {
    private readonly _duration: number;
    
    public static for(ms: number): PkUIEffectDelay {
        return new PkUIEffectDelay(ms);
    }
    
    public constructor(ms: number) {
        super();
        
        this._duration = ms;
    }
    
    public tick(delta: number, time: number) {
        super.tick(delta, time);
        
        if (this._elapsed >= this._duration) {
            this._finished();
        }
    }
}