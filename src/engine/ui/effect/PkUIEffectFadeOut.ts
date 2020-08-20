import { TEasingFunction, PkEasing } from '@ng/support/PkEasing';
import { PkUiEffect } from '@ng/ui/effect/PkUiEffect';

export class PkUIEffectFadeOut extends PkUiEffect {
    private readonly _duration: number;
    
    public static for(ms: number, easingFn?: TEasingFunction): PkUIEffectFadeOut {
        return new PkUIEffectFadeOut(ms, easingFn);
    }
    
    public constructor(ms: number, easingFn?: TEasingFunction) {
        super();
        
        this._duration = ms;
        this._easingFn = easingFn ?? PkEasing.linear;
    }
    
    protected _started(): void {
        super._started();
        
        this.component.globalAlpha = 1;
        this.component.show();
    }
    
    protected _finished(): void {
        super._finished();
        
        this.component.hide();
    }
    
    public tick(delta: number, time: number) {
        super.tick(delta, time);
        this.component.globalAlpha = this._easingFn(1 - (this._elapsed / this._duration));
        
        if (this._elapsed >= this._duration) {
            this._finished();
        }
    }
}