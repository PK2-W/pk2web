import { Drawable } from '../../support/drawable/Drawable';
import { i18nSchema } from '../../support/i18nSchema';
import * as PIXI from '../../vendor/pixi';
import { PK2Context } from '../PK2Context';

export abstract class Screen extends Drawable {
    // Application context
    protected readonly _context: PK2Context;
    
    // LCS
    private readonly _creationTime: number;
    private _lastResumeTime: number;
    //
    private _suspended: boolean;
    private _suspending: boolean;
    // (En unidades por ms)
    private _fadeSpeed: number;
    
    // Visibility
    private readonly _alphaFilter: PIXI.filters.AlphaFilter;
    
    // Loop
    private readonly _loopFnPtr: () => void;
    
    /**
     *
     */
    protected constructor(ctx: PK2Context) {
        super();
        
        this._context = ctx;
        
        this._suspended = true;
        this._suspending = false;
        this._fadeSpeed = 0;
        
        this._drawable = new PIXI.Container();
        this._alphaFilter = new PIXI.filters.AlphaFilter(0);
        this._drawable.filters = [this._alphaFilter];
        
        this._creationTime = this._context.gt.now();
        this._loopFnPtr = this._tick.bind(this);
    }
    
    
    ///  Game loop  ///
    
    protected tick(delta: number, time: number) {
    }
    private _tick(delta: number, time: number) {
        this.context.gt.add(this._loopFnPtr);
        
        this.tick(delta, time);
        
        if (this._fadeSpeed !== 0) {
            this.alpha += this._fadeSpeed * delta;
            
            if (this._fadeSpeed < 0 && this.alpha === 0 || this._fadeSpeed > 0 && this.alpha === 1) {
                this._fadeSpeed = 0;
            }
        }
        
        if (this._suspending && this.alpha === 0) {
            this.context.gt.rem(this._loopFnPtr);
            this.doSuspend();
            return;
        }
    }
    
    
    ///  LCS  ///
    
    public resume(ms: number = 0) {
        if (!this._suspended && !this._suspending)
            return;
        
        this.doResume();
        
        this.context.gt.add(this._loopFnPtr);
        
        this._lastResumeTime = this._context.gt.now();
        this._fadeSpeed = (ms !== 0) ? (1 / ms) : 1;
    }
    protected doResume() {
        // ...
        this._suspended = false;
    }
    
    public suspend(ms: number = 0) {
        if (this._suspended || this._suspending)
            return;
        
        this._suspending = true;
        
        this._fadeSpeed = (ms !== 0) ? (-1 / ms) : 1;
    }
    protected doSuspend() {
        // ...
        this._suspending = false;
        this._suspended = true;
    }
    
    public isSuspending() {
        return this._suspending === true;
    }
    
    public isSuspended() {
        return this._suspended === true;
    }
    
    
    ///  Visibility  ///
    
    public get alpha(): number {
        return this._alphaFilter.alpha;
    }
    
    public set alpha(v: number) {
        this._alphaFilter.alpha =
            (v < 0) ? 0 :
                ((v > 1) ? 1 : v);
        
        this.invalidate();
    }
    
    
    ///  Shortcuts  ///
    
    protected get context(): PK2Context {
        return this._context;
    }
    
    protected get tx(): typeof i18nSchema {
        return this._context.tx;
    }
    
    public getDrawable(): PIXI.Container {
        return this._drawable;
    }
}
