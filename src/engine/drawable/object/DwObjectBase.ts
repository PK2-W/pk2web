import { DwObject } from '@ng/drawable/object/DwObject';
import { Dw } from '@ng/drawable/skeleton/Dw';
import { EventEmitter } from 'eventemitter3';

export abstract class DwObjectBase<T extends Dw> extends EventEmitter implements DwObject {
    protected _drawable: T;
    
    protected constructor(drawable: T) {
        super();
        
        this._drawable = drawable;
    }
    
    protected get dw(): T {
        return this._drawable;
    }
    
    public getDrawable(): Dw {
        return this._drawable;
    }
    
    
    ///  ~Inherited  ///
    
    /** X coordinate of the drawable object. */
    public get x(): number { return this.dw.x; };
    /** Y coordinate of the drawable object. */
    public get y(): number { return this.dw.y; };
    
    /**
     * Opacity of the elements in the drawable object.<br>
     * This property sets the alpha property of all the descendants individually;
     * To achieve a global opacity effect across all the descentents as a whole, use {@link globalAlpha} instead.
     */
    public get alpha(): number { return this.dw.alpha; };
    public get globalAlpha(): number { return this.dw.globalAlpha; };
    public get visible(): boolean { return this.dw.visible; }
    public get renderable(): boolean { return this.dw.renderable; }
}
