import { DwImpl } from '@ng/drawable/impl-pixi/DwImpl';
import { Dw } from '@ng/drawable/skeleton/Dw';
import { DwContainer } from '@ng/drawable/skeleton/DwContainer';
import { ifnul } from '@ng/support/utils';

export class DwContainerImpl extends DwImpl<PIXI.Container> implements DwContainer {
    private _children: DwImpl<PIXI.DisplayObject>[];
    
    
    public constructor() {
        super(new PIXI.Container());
        
        this._children = [];
    }
    
    public get children(): number {
        return this._children.length;
    }
    
    public get(i: number): Dw {
        return ifnul(this._children[i]);
    }
    
    public has(drawable: DwImpl<PIXI.DisplayObject>): boolean {
        return this._children.includes(drawable);
    }
    
    public add(drawable: DwImpl<PIXI.DisplayObject>): this {
        this._children.push(drawable);
        this._pixi.addChild(drawable.pixi);
        
        // @ts-ignore
        drawable._childOf(this);
        
        return this;
    }
    
    public remove(drawable: DwImpl<PIXI.DisplayObject>): this {
        const pos = this._children.indexOf(drawable);
        if (pos > -1) {
            this._pixi.removeChild(drawable.pixi);
            this._children.splice(pos, 1);
            
            // @ts-ignore
            drawable._childOf(null);
        }
        
        return this;
    }
    
    public clear(): this {
        if (this.children > 0) {
            this._children.forEach(
                // @ts-ignore
                child => child._childOf(null));
            
            this._children = [];
            this._pixi.removeChildren();
        }
        
        return this;
    }
    
    
    /// Interaction  ///
    
    public get propagatePointerEvents(): boolean {
        return this.pixi.interactiveChildren;
    }
    public set propagatePointerEvents(value: boolean) {
        this.pixi.interactiveChildren = value;
    }
}