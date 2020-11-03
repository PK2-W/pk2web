import { TEasingFunction } from '@ng/support/PkEasing';
import { PkTickable } from '@ng/support/PkTickable';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { EventEmitter } from 'eventemitter3';

export abstract class PkUiEffect extends EventEmitter implements PkTickable {
    private _component: PkUIComponent;
    private readonly _thenEffects: Set<PkUiEffect>;
    private readonly _thenActions: Set<(component: PkUIComponent) => void>;
    protected _easingFn: TEasingFunction;
    protected _elapsed: number;
    protected _cancelled: boolean;
    
    protected constructor() {
        super();
        
        this._elapsed = 0;
        this._thenEffects = new Set();
        this._thenActions = new Set();
    }
    
    public thenDo(...fn: ((component: PkUIComponent) => void)[]): this {
        fn.forEach(this._thenActions.add, this._thenActions);
        return this;
    };
    
    public then(...effects: PkUiEffect[]): this {
        effects.forEach(this._thenEffects.add, this._thenEffects);
        return this;
    }
    
    public applyTo(component: PkUIComponent): void {
        if (this._component == null) {
            this._component = component;
        }
        this._started();
    }
    
    
    protected _started(): void { }
    
    
    public tick(delta: number, time: number) {
        if (!this._cancelled) {
            // Prevent artifacts for long first tick
            if (this._elapsed === 0) {
                this._elapsed = 0.1;
            } else {
                this._elapsed += delta;
            }
        }
    }
    
    protected _whenFinished(): void {
        this.emit(PkUiEffect.EV_FINISHED, this, [...this._thenEffects], [...this._thenActions]);
    }
    
    public cancel(): void {
        this._cancelled = true;
        this.removeAllListeners();
        this._thenEffects.forEach(effect => effect.cancel());
        this._thenEffects.clear();
        this._thenActions.clear();
    }
    
    protected get component(): PkUIComponent {
        if (this._component == null) {
            throw new Error(`Target component for effect ${ this.constructor.name } not defined.`);
        }
        
        return this._component;
    }
    
    public static EV_FINISHED = 'finished.effect.ui.ev';
}