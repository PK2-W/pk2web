import { DwContainer } from '@ng/drawable/dw/DwContainer';
import { DwHelper } from '@ng/drawable/DwHelper';
import { minmax } from '@ng/support/utils';
import { PkRectangle } from '@ng/types/PkRectangle';
import { EventEmitter, ListenerFn } from 'eventemitter3';
import * as PIXI from 'pixi.js';

export abstract class Dw<T extends PIXI.DisplayObject> extends EventEmitter {
    public readonly iid: number;
    
    protected readonly _pixi: T;
    private readonly _pixiBox: PIXI.Container;
    private readonly _pixiDbg: PIXI.Graphics;
    
    public __parent: DwContainer;
    private readonly _alphaFilter: PIXI.filters.AlphaFilter;
    
    private readonly _dbgCanvas: PIXI.Graphics;
    private _dbgBorder: boolean;
    private _dbgBorderColor: string;
    private _dbgBorderWidth: number;
    private _dbgFill: boolean;
    private _dbgFillColor: string;
    
    
    protected constructor(pixi: T) {
        super();
        
        this.iid = DwHelper.getIID();
        
        this._pixiBox = new PIXI.Container();
        this['__pk__'] = this;
        
        this._pixi = pixi;
        this._pixiBox.addChild(this._pixi);
        
        this._alphaFilter = new PIXI.filters.AlphaFilter(1);
        this.pixi.filters = [];
        
        // this._pixiDbg = new PIXI.Graphics();
        // this._pixiDbg.beginFill(0x0000FF);
        // this._pixiDbg.drawRect(-2, -2, 4, 4);
        // this._pixiBox.addChild(this._pixiDbg);
        
        //this._pixiBox.interactiveChildren = false;
    }
    
    
    ///  Graphics  ///
    
    public get pixi(): PIXI.DisplayObject { return this._pixiBox; }
    
    
    ///  Interaction  ///
    
    public on(event: string | symbol, fn: ListenerFn, context?: any): this {
        // Enable pointer events
        if (event.indexOf('pointer') > -1) {
            this.pixi.interactive = true;
        }
        return super.on(event, fn, context);
    }
    
    public once(event: string | symbol, fn: ListenerFn, context?: any): this {
        // Enable pointer events
        if (event.indexOf('pointer') > -1) {
            this.pixi.interactive = true;
        }
        return super.once(event, fn, context);
    }
    
    public removeAllListeners(event?: string | symbol): this {
        this.pixi.interactive = false;
        return super.removeAllListeners(event);
    }
    
    
    ///  Properties  ///
    
    /**
     * X coordinate of the drawable element.
     */
    public get x(): number { return this.pixi.transform.position.x; }
    public set x(x: number) { this.setX(x); }
    /**
     * Sets the {@link x} property.
     */
    public setX(x: number): this {
        this.pixi.transform.position.x = x;
        this._updateTransform();
        return this;
    }
    
    /**
     * Y coordinate of the drawable element.
     */
    public get y(): number { return this.pixi.transform.position.y; }
    public set y(y: number) { this.setY(y); }
    /**
     * Sets the {@link y} property.
     */
    public setY(y: number): this {
        this.pixi.transform.position.y = y;
        this._updateTransform();
        return this;
    }
    
    /**
     * Sets both coordinates X and Y for the drawable element.
     */
    public setPosition(x: number, y: number): this;
    public setPosition(x: number, y: number): this {
        this.pixi.transform.position.set(x, y);
        this._updateTransform();
        return this;
    }
    
    /**
     * Opacity of the drawable element applied to its descendants individually.<br>
     * To achieve a global opacity effect across all the descentents as a whole use {@link globalAlpha} instead.
     */
    public get alpha(): number { return this.pixi.alpha; }
    public set alpha(alpha: number) { this.setAlpha(alpha); }
    /**
     * Sets the {@link alpha} property.
     */
    public setAlpha(alpha: number): this {
        this.pixi.alpha = alpha;
        return this;
    }
    
    /**
     * Opacity of the drawable element applied to all its descendants as a whole.<br>
     * To apply opacity to descendants individually use {@link alpha} instead.
     */
    public get globalAlpha(): number { return this._alphaFilter.alpha; }
    public set globalAlpha(alpha: number) { this.setGlobalAlpha(alpha); }
    /**
     * Sets the {@link globalAlpha} property.
     */
    public setGlobalAlpha(alpha: number): this {
        this._alphaFilter.alpha = minmax(alpha, 0, 1);
        if (alpha >= 1) {
            const i = this.pixi.filters.indexOf(this._alphaFilter);
            if (i > -1) {
                this.pixi.filters.splice(i, 1);
            }
        } else {
            if (!this.pixi.filters.includes(this._alphaFilter)) {
                this.pixi.filters.push(this._alphaFilter);
            }
        }
        this._alphaFilter.alpha = minmax(alpha, 0, 1);
        return this;
    }
    
    /**
     * See {@link PIXI.DisplayObject#visible}.
     */
    public get visible(): boolean { return this.pixi.visible; }
    public set visible(visible: boolean) { this.setVisible(visible); }
    /**
     * Sets the {@link visible} property.
     */
    public setVisible(visible: boolean): this {
        this.pixi.visible = visible;
        return this;
    };
    
    /**
     * See {@link PIXI.DisplayObject#renderable}.
     */
    public get renderable(): boolean { return this.pixi.renderable; }
    public set renderable(renderable: boolean) { this.setRenderable(renderable); }
    /**
     * Sets the {@link renderable} property.
     */
    public setRenderable(renderable: boolean): this {
        this.pixi.renderable = renderable;
        this._updateTransform();
        return this;
    };
    
    /**
     * See {@link PIXI.DisplayObject#hitArea}.
     */
    public get hitArea(): PkRectangle { return null; }
    public set hitArea(hitArea: PkRectangle) { this.setHitArea(hitArea); }
    /**
     * Sets the {@link hitArea} property.
     */
    public setHitArea(hitArea: PkRectangle): this {
        this.pixi.hitArea = hitArea;
        return this;
    };
    
    /**
     * See {@link PIXI.DisplayObject#getBounds}.
     */
    public getBounds(skipUpdate?: boolean, rect?: PIXI.Rectangle): PkRectangle {
        return PkRectangle.asRectangle(this.pixi.getBounds(skipUpdate, rect));
    }
    /**
     * See {@link PIXI.DisplayObject#getLocalBounds}.
     */
    public getLocalBounds(rect?: PIXI.Rectangle): PkRectangle {
        return PkRectangle.asRectangle(this.pixi.getLocalBounds(rect));
    }
    
    
    ///  ~Container  ///
    
    /**
     * Parent container which this drawable belongs to.
     */
    public get parent(): DwContainer { return this.__parent; }
    
    /**
     * Adds this drawable element to the specified container as a child.<br>
     * It's a shortcut to the container {@link DwContainer#add} method.
     *
     * @param container - Container element that will become the parent of this element.
     */
    public addTo(container: DwContainer): this;
    /**
     * Adds this drawable element to the specified container as a child.<br>
     * Also, set the position to the specified.
     *
     * @param container - Container element that will become the parent of this element.
     * @param x - Desired position in the x axis.
     * @param y - Desired position in the y axis.
     */
    public addTo(container: DwContainer, x: number, y: number): this;
    public addTo(container: DwContainer, x?: number, y?: number): this {
        container.add(this);
        
        if (x != null && y != null) {
            this.setPosition(x, y);
        }
        
        return this;
    }
    
    
    ///  PIXI Optimization  ///
    
    protected _updateTransform(): void {
        if (this.pixi.renderable && this.__parent != null) {
            this.pixi.updateTransform();
        }
    }
    
    public destroy(): void {
    
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
    
    
    ///  Events  ///
    
    public static readonly EV_ADDED = 'added';
    public static readonly EV_CLICK = 'click';
    public static readonly EV_MOUSEDOWN = 'mousedown';
    public static readonly EV_MOUSEMOVE = 'mousemove';
    public static readonly EV_MOUSEOUT = 'mouseout';
    public static readonly EV_MOUSEOVER = 'mouseover';
    public static readonly EV_MOUSEUP = 'mouseup';
    public static readonly EV_MOUSEUPOUTSIDE = 'mouseupoutside';
    public static readonly EV_POINTERCANCEL = 'pointercancel';
    public static readonly EV_POINTERDOWN = 'pointerdown';
    public static readonly EV_POINTERMOVE = 'pointermove';
    public static readonly EV_POINTEROUT = 'pointerout';
    public static readonly EV_POINTEROVER = 'pointerover';
    public static readonly EV_POINTERTAP = 'pointertap';
    public static readonly EV_POINTERUP = 'pointerup';
    public static readonly EV_POINTERUPOUTSIDE = 'pointerupoutside';
    public static readonly EV_REMOVED = 'removed';
    public static readonly EV_RIGHTCLICK = 'rightclick';
    public static readonly EV_RIGHTDOWN = 'rightdown';
    public static readonly EV_RIGHTUP = 'rightup';
    public static readonly EV_RIGHTUPOUTSIDE = 'rightupoutside';
    public static readonly EV_TAP = 'tap';
    public static readonly EV_TOUCHCANCEL = 'touchcancel';
    public static readonly EV_TOUCHEND = 'touchend';
    public static readonly EV_TOUCHENDOUTSIDE = 'touchendoutside';
    public static readonly EV_TOUCHMOVE = 'touchmove';
    public static readonly EV_TOUCHSTART = 'touchstart';
}
