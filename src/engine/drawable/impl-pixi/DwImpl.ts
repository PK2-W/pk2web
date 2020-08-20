import { DwHelper } from '@ng/drawable/DwHelper';
import type { Dw } from '@ng/drawable/skeleton/Dw';
import type { DwContainer } from '@ng/drawable/skeleton/DwContainer';
import { minmax } from '@ng/support/utils';
import { PkRectangleImpl } from '@ng/types/pixi/PkRectangleImpl';
import { PkRectangle } from '@ng/types/PkRectangle';
import { PkUIComponentContainer } from '@ng/ui/component/PkUIComponentContainer';
import { ListenerFn, EventEmitter } from 'eventemitter3';
import * as PIXI from 'pixi.js';

export abstract class DwImpl<T extends PIXI.DisplayObject> extends EventEmitter implements Dw {
    public readonly iid: number;
    
    private _parent: DwContainer;
    
    private readonly _pixiBox: PIXI.Container;
    private readonly _pixiDbg: PIXI.Graphics;
    protected readonly _pixi: T;
    
    // Visibility
    private readonly _alphaFilter: PIXI.filters.AlphaFilter;
    
    private readonly _dbgCanvas: PIXI.Graphics;
    private _dbgBorder: boolean;
    private _dbgBorderColor: string;
    private _dbgBorderWidth: number;
    private _dbgFill: boolean;
    private _dbgFillColor: string;
    
    
    protected constructor(native: T) {
        super();
        
        this.iid = DwHelper.getIID();
        
        this._pixiBox = new PIXI.Container();
        this._pixiBox['__pk__'] = this;
        
        this._pixi = native;
        this._pixiBox.addChild(this._pixi);
        
        this._alphaFilter = new PIXI.filters.AlphaFilter(1);
        this.pixi.filters = [];
        
        // this._pixiDbg = new PIXI.Graphics();
        // this._pixiDbg.beginFill(0xFF0000);
        // this._pixiDbg.drawRect(0, 0, 2, 2);
        // this._pixiBox.addChild(this._pixiDbg);
        
        //this._pixiBox.interactiveChildren = false;
        this.pixi.on('pointerover', (ev) => this.emit(DwHelper.EV_POINTEROVER));
        this.pixi.on('pointerout', (ev) => this.emit(DwHelper.EV_POINTEROUT));
        this.pixi.on('pointertap', (ev) => this.emit(DwHelper.EV_POINTERTAP));
    }
    
    
    ///  Graphics  ///
    
    public get pixi(): PIXI.Container { return this._pixi; }
    
    
    ///  Interaction  ///
    
    public on(event: symbol, fn: ListenerFn, context?: any): this {
        // Enable pointer events
        if (event.description.indexOf('pointer') > -1) {
            this.pixi.interactive = true;
        }
        return super.on(event, fn, context);
    }
    
    public once(event: symbol, fn: ListenerFn, context?: any): this {
        // Enable pointer events
        if (event.description.indexOf('pointer') > -1) {
            this.pixi.interactive = true;
        }
        return super.once(event, fn, context);
    }
    
    public removeAllListeners(event?: string | symbol): this {
        this.pixi.interactive = false;
        return super.removeAllListeners(event);
    }
    
    
    ///  Properties  ///
    
    public get x(): number { return this.pixi.x; }
    public set x(x: number) {
        this.pixi.x = x;
        this._updateTransforms();
    }
    public setX(x: number): this {
        this.x = x;
        return this;
    }
    
    public get y(): number { return this.pixi.y; }
    public set y(y: number) {
        this.pixi.y = y;
        this._updateTransforms();
    }
    public setY(y: number): this {
        this.y = y;
        return this;
    }
    
    public setPosition(x: number, y: number): this {
        this.pixi.x = x;
        this.pixi.y = y;
        this._updateTransforms();
        return this;
    }
    
    public get alpha(): number { return this.pixi.alpha; }
    public set alpha(alpha: number) {
        this.pixi.alpha = minmax(alpha, 0, 1);
    }
    public setAlpha(alpha: number): this {
        this.alpha = alpha;
        return this;
    }
    
    public get globalAlpha(): number { return this._alphaFilter.alpha; }
    public set globalAlpha(alpha: number) {
        this._alphaFilter.alpha = minmax(alpha, 0, 1);
        if (alpha >= 1) {
            const i = this.pixi.filters.indexOf(this._alphaFilter);
            if (i > -1) {
                this.pixi.filters.splice(i, 1);
            }
        } else {
            if (!this.pixi.filters.includes(this._alphaFilter)) {
                this._pixi.filters.push(this._alphaFilter);
            }
        }
        this._alphaFilter.alpha = minmax(alpha, 0, 1);
    }
    public setGlobalAlpha(alpha: number): this {
        this.globalAlpha = alpha;
        return this;
    }
    
    public get visible(): boolean { return this.pixi.visible; }
    public set visible(visible: boolean) {
        this.pixi.visible = visible == true;
    }
    public setVisible(visible: boolean): this {
        this.visible = visible;
        return this;
    }
    
    public get renderable(): boolean { return this.pixi.renderable; }
    public set renderable(renderable: boolean) {
        this.pixi.renderable = renderable == true;
    }
    public setRenderable(renderable: boolean): this {
        this.renderable = renderable;
        return this;
    }
    
    public get hitArea(): PkRectangle { return null; }
    public set hitArea(hitArea: PkRectangle) { this.setHitArea(hitArea); }
    public setHitArea(hitArea: PkRectangle): this {
        this.pixi.hitArea = (hitArea as PkRectangleImpl).getNative();
        return this;
    }
    
    public getBounds(): PkRectangle {
        const bounds = this.pixi.getLocalBounds();
        return PkRectangleImpl.$(bounds.x, bounds.y, bounds.width, bounds.height);
    }
    
    
    ///  ~Container  ///
    
    public addTo(container: DwContainer): this;
    public addTo(container: DwContainer, x: number, y: number): this;
    public addTo(container: DwContainer, x?: number, y?: number): this {
        container.add(this);
        this._parent = container;
        
        if (x != null && y != null) {
            this.setPosition(x, y);
        }
        
        return this;
    }
    
    /**
     *
     * @param parent
     * @internal
     */
    protected _childOf(parent: DwContainer) {
        this._parent = parent;
    }
    
    
    ///  PIXI Optimizations  ///
    
    protected _updateTransforms(): void {
        if (this.renderable && this.pixi.parent != null) {
            this.pixi.updateTransform();
        }
    }
    
    
    ///  Debug  ///
    
    public set dbgBorder(value: boolean) {
        this._dbgBorder = value;
    }
    
    public set dbgBorderColor(value: string) {
        this._dbgBorderColor = value;
    }
    
    public set dbgBorderWidth(value: number) {
        this._dbgBorderWidth = value;
    }
    
    public set dbgFill(value: boolean) {
        this._dbgFill = value;
    }
    
    public set dbgFillColor(value: string) {
        this._dbgFillColor = value;
    }
}
