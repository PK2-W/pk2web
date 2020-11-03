import { PkEasing, TEasingFunction } from '@ng/support/PkEasing';
import { PkUiEffect } from '@ng/ui/effect/PkUiEffect';

export class PkUIEffectMove extends PkUiEffect {
    private readonly _duration: number;
    private readonly xOffset: number;
    private readonly yOffset: number;
    private xFrom: number;
    private yFrom: number;
    
    public static for(ms: number, xOffset: number = 0, yOffset: number = 0, easingFn?: TEasingFunction): PkUIEffectMove {
        return new PkUIEffectMove(ms, xOffset, yOffset, easingFn);
    }
    
    public constructor(ms: number, xOffset: number = 0, yOffset: number = 0, easingFn?: TEasingFunction) {
        super();
        
        this._duration = ms;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this._easingFn = easingFn ?? PkEasing.linear;
    }
    
    protected _started(): void {
        super._started();
        
        this.xFrom = this.component.x;
        this.yFrom = this.component.y;
    }
    
    public tick(delta: number, time: number) {
        super.tick(delta, time);
        this.component.setPosition(
            this.xFrom + this.xOffset * this._easingFn(this._elapsed / this._duration),
            this.yFrom + this.yOffset * this._easingFn(this._elapsed / this._duration));
        
        if (this._elapsed >= this._duration) {
            this._whenFinished();
        }
    }
}