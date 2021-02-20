import { PkEasing, TEasingFunction } from '@fwk/support/PkEasing';
import { PkUiEffect } from '@fwk/ui/effect/PkUiEffect';

export class PkUIEffectFadeIn extends PkUiEffect {
    private readonly _duration: number;
    
    public static for(ms: number, easingFn?: TEasingFunction): PkUIEffectFadeIn {
        return new PkUIEffectFadeIn(ms, easingFn);
    }
    
    public constructor(ms: number, easingFn?: TEasingFunction) {
        super();
        
        this._duration = ms;
        this._easingFn = easingFn ?? PkEasing.linear;
    }
    
    protected _started(): void {
        super._started();
        
        this.component.globalAlpha = 0.0001;
        this.component.show();
    }
    
    public tick(delta: number, time: number) {
        super.tick(delta, time);
        this.component.globalAlpha = this._easingFn(this._elapsed / this._duration);
        
        if (this._elapsed >= this._duration) {
            this._whenFinished();
        }
    }
}