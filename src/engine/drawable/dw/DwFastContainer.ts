import { Dw } from '@fwk/drawable/dw/Dw';
import { ifnul } from '@fwk/support/utils';
import * as PIXI from 'pixi.js';

export class DwFastContainer extends Dw<PIXI.ParticleContainer> {
    private _children: Dw<PIXI.DisplayObject>[];
    
    
    public constructor() {
        super(new PIXI.ParticleContainer);
        
        this._children = [];
    }
    
    public get length(): number {
        return this._children.length;
    }
    
    public get(i: number): Dw<PIXI.DisplayObject> {
        return ifnul(this._children[i]);
    }
    
    public has(drawable: Dw<PIXI.DisplayObject>): boolean {
        return this._children.includes(drawable);
    }
    
    public add(drawable: Dw<PIXI.DisplayObject>): this {
        this._children.push(drawable);
        drawable.__parent = this;
        
        this._pixi.addChild(drawable.pixi);
        drawable.pixi.updateTransform();
        
        return this;
    }
    
    public remove(drawable: Dw<PIXI.DisplayObject>): this {
        const pos = this._children.indexOf(drawable);
        if (pos > -1) {
            this._pixi.removeChild(drawable.pixi);
            this._children.splice(pos, 1);
            
            drawable.__parent = null;
        }
        
        return this;
    }
    
    public clear(): this {
        if (this.length > 0) {
            this._children.forEach(
                child => child.__parent = null);
            
            this._children = [];
            this._pixi.removeChildren();
        }
        
        return this;
    }
    
    public countRenderable(): number {
        if (this.renderable) {
            return 1 + this._children.reduce((prv, c) => {
                return prv + c.countRenderable();
            }, 0);
        } else {
            return 0;
        }
    }
    
    
    /// Interaction  ///
    
    public get interactiveChildren(): boolean {
        return this._pixi.interactiveChildren;
    }
    public set interactiveChildren(value: boolean) {
        this._pixi.interactiveChildren = value;
    }
    
    
    ///  Graphics  ///
    
    public get pixi(): PIXI.Container { return super.pixi as PIXI.Container; }
}