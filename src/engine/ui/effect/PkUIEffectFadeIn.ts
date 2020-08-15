import { PkUiEffect } from '@ng/ui/effect/PkUiEffect';

export class PkUIEffectFadeIn extends PkUiEffect {
    private readonly _duration: number;
    
    public static for(ms: number): PkUIEffectFadeIn {
        return new PkUIEffectFadeIn(ms);
    }
    
    public constructor(ms: number) {
        super();
        
        this._duration = ms;
    }
    
    public tick(delta: number, time: number) {
        super.tick(delta, time);
        this.component.alpha = this._elapsed / this._duration;
        
        if (this._elapsed >= this._duration) {
            this._finished();
        }
    }
}