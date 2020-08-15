import { PkTickable } from '@ng/support/PkTickable';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { EventEmitter } from 'eventemitter3';

export abstract class PkUiEffect extends EventEmitter implements PkTickable {
    protected _elapsed: number;
    private _component: PkUIComponent;
    private readonly _thenEffects: Set<PkUiEffect>;
    private readonly _thenActions: Set<(component: PkUIComponent) => void>;
    
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
    
    public prepare(component: PkUIComponent): void {
        this._component = component;
    }
    
    public tick(delta: number, time: number) {
        this._elapsed += delta;
    }
    
    protected _finished(): void {
        this.emit(PkUiEffect.EV_FINISHED, this, [...this._thenEffects], [...this._thenActions]);
    }
    
    protected get component(): PkUIComponent {
        if (this._component == null) {
            throw new Error(`Target component for effect ${ this.constructor.name } not defined.`);
        }
        
        return this._component;
    }
    
    public static EV_FINISHED = 'finished.effect.ui.ev';
}