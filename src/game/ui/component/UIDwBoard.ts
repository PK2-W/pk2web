import type { Dw } from '@ng/drawable/dw/Dw';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import type * as PIXI from 'pixi.js';
import type { PekkaContext } from '../../PekkaContext';

export class UIDwBoard extends PkUIComponent {
    
    public constructor(context: PekkaContext) {
        super(context);
    }
    
    
    ///  Expose DwContainer methods  ///
    
    /**
     * See {@link DwContainer#length}.
     */
    public get length(): number {
        return this._dw.length;
    }
    
    /**
     * See {@link DwContainer#get}.
     */
    public get(i: number): Dw<PIXI.DisplayObject> {
        return this._dw.get(i);
    }
    
    /**
     * See {@link DwContainer#has}.
     */
    public has(drawable: Dw<PIXI.DisplayObject>): boolean {
        return this._dw.has(drawable);
    }
    
    /**
     * See {@link DwContainer#add}.
     */
    public add(drawable: Dw<PIXI.DisplayObject>): this {
        this._dw.add(drawable);
        return this;
    }
    
    /**
     * See {@link DwContainer#remove}.
     */
    public remove(drawable: Dw<PIXI.DisplayObject>): this {
        this._dw.remove(drawable);
        return this;
    }
    
    /**
     * See {@link DwContainer#clear}.
     */
    public clear(): this {
        this._dw.clear();
        return this;
    }
}
