import { DwHelper } from '@ng/drawable/DwHelper';
import type { Dw } from '@ng/drawable/skeleton/Dw';
import type { DwContainer } from '@ng/drawable/skeleton/DwContainer';
import { ListenerFn, EventEmitter } from 'eventemitter3';
import * as PIXI from 'pixi.js';

export abstract class DwImpl<T extends PIXI.DisplayObject> extends EventEmitter implements Dw {
    public readonly iid: number;
    
    private _parent: DwContainer;
    
    private readonly _pixiBox: PIXI.Container;
    private readonly _pixiDbg: PIXI.Graphics;
    protected readonly _pixi: T;
    
    // Visibility
    //private readonly _alphaFilter: PIXI.filters.AlphaFilter;
    
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
        //this._alphaFilter = new PIXI.filters.AlphaFilter(1);
        // this._pixi.filters = [this._alphaFilter];
        this._pixiBox.addChild(this._pixi);
        
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
    }
    public setX(x: number): this {
        this.x = x;
        return this;
    }
    
    public get y(): number { return this.pixi.y; }
    public set y(y: number) {
        this.pixi.y = y;
    }
    public setY(y: number): this {
        this.y = y;
        return this;
    }
    
    public setPosition(x: number, y: number): this {
        this.pixi.x = x;
        this.pixi.y = y;
        return this;
    }
    
    public get alpha(): number { return this.pixi.alpha; }
    public set alpha(v: number) {
        //this._alphaFilter.alpha = minmax(v, 0, 1);
        this.pixi.alpha = v;
    }
    public setAlpha(value: number): this {
        this.alpha = value;
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
    
    
    ///  ~Container  ///
    
    public addTo(parent: DwContainer): this {
        parent.add(this);
        this._parent = parent;
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
