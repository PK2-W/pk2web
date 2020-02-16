import { Drawable } from '@ng/drawable/Drawable';
import { PkLanguage } from '@ng/PkLanguage';
import { PkUIComponent } from '@ng/screen/PkUIComponent';
import * as PIXI from 'pixi.js';
import { PK2Context } from '../../game/PK2Context';
import { int } from '../../support/types';
import { mod } from '../support/utils';

export abstract class PkScreen extends Drawable {
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
    
    // Loop
    private readonly _loopFnPtr: () => void;
    
    protected readonly _childs: Set<Drawable>;
    protected readonly _components: PkUIComponent[];
    private _focusedIdx: int;
    
    /**
     *
     */
    protected constructor(ctx: PK2Context) {
        super(new PIXI.Container());
        
        this._context = ctx;
        
        this._creationTime = this._context.time.now();
        this._loopFnPtr = this._tick.bind(this);
        
        this.alpha = 0;
        this._suspended = true;
        this._suspending = false;
        this._fadeSpeed = 0;
        
        this._childs = new Set();
        this._components = [];
    }
    
    
    ///  Timing  ///
    
    protected tick(delta: number, time: number): void {
    }
    private _tick(delta: number, time: number): void {
        this.context.time.add(this._loopFnPtr);
        
        this.tick(delta, time);
        
        if (this._fadeSpeed !== 0) {
            this.alpha += this._fadeSpeed * delta;
            
            if (this._fadeSpeed < 0 && this.alpha === 0 || this._fadeSpeed > 0 && this.alpha === 1) {
                this._fadeSpeed = 0;
            }
        }
        
        if (this._suspending && this.alpha === 0) {
            this._suspend();
        }
    }
    
    public get creationTime(): number { return this._creationTime; }
    public get lastResumeTime(): number { return this._lastResumeTime; }
    
    
    ///  LCS  ///
    
    public resume(ms: number = 0) {
        if (!this._suspended && !this._suspending)
            return;
        
        console.log(`       - Resuming screen "${ this.constructor.name }"`);
        
        this.doResume();
        
        this.context.time.add(this._loopFnPtr);
        
        this._lastResumeTime = this._context.time.now();
        this._fadeSpeed = (ms !== 0) ? (1 / ms) : 1;
    }
    protected doResume() {
        // ...
        this._suspended = false;
    }
    
    public suspend(ms: number = 0): void {
        if (this._suspended || this._suspending)
            return;
        
        console.log(`       - Suspending screen "${ this.constructor.name }"`);
        
        this._suspending = true;
        
        this._fadeSpeed = (ms !== 0) ? (-1 / ms) : -1;
    }
    private _suspend(): void {
        this.context.time.rem(this._loopFnPtr);
        
        this.doSuspend();
        
        this._suspending = false;
        this._suspended = true;
        
        this.emit(PkScreen.EVT_SUSPENDED);
    }
    protected doSuspend() {}
    
    public isSuspending(): boolean {
        return this._suspending === true;
    }
    
    public isSuspended(): boolean {
        return this._suspended === true;
    }
    
    
    ///  Contents  ///
    
    protected get container(): PIXI.Container {
        return this._drawable as PIXI.Container;
    }
    
    public add<T extends Drawable>(child: T): T {
        this._childs.add(child);
        this.container.addChild(child.getDrawable());
        
        if (child instanceof PkUIComponent /*&& child.isFocusable()*/) {
            this._components.push(child);
        }
        
        this.invalidate();
        
        return child;
    }
    
    public remove<T extends Drawable>(child: T): T {
        this._childs.delete(child);
        this.container.removeChild(child.getDrawable());
        
        if (child instanceof PkUIComponent && child.isFocusable()) {
            // TODO
            //  Array.
            //  this._components.push(child);
        }
        
        this.invalidate();
        
        return child;
    }
    
    public clean(): void {
        this._childs.clear();
        (this._drawable as PIXI.Container).removeChildren();
        
        this._components.length = 0;
        
        this.invalidate();
    }
    
    public hideAllComponents(): void {
        this._components.forEach((component) => {
            component.hide();
        });
    }
    
    
    ///  Focus  ///
    
    /**
     * Removes focus from currently focused component.
     */
    protected blur(): void {
        if (this._focusedIdx != null) {
            if (!this._components[this._focusedIdx].blur()) {
                //return false;
            }
            this._focusedIdx = null;
        }
        //return true;
    }
    
    /**
     * Puts focus on the specified component.
     */
    protected focus(component: PkUIComponent): void {
        const idx = this._components.indexOf(component);
        if (idx > -1) {
            this.blur();
            this._focusedIdx = idx;
            component.focus();
        }
    }
    
    /**
     * Change focus to the previous visible-focusable component.
     */
    protected focusPrevious() {
        let candidateIdx: int;
        let candidate: PkUIComponent;
        const oldIdx = (this._focusedIdx != null) ? this._focusedIdx : this._components.length;
        
        this.blur();
        
        for (let i = 1; i < this._components.length; i++) {
            candidateIdx = mod(oldIdx - i, this._components.length);
            candidate = this._components[candidateIdx];
            
            if (candidate.isFocusable() && candidate.isVisible()) {
                this._focusedIdx = candidateIdx;
                candidate.focus();
                console.debug(`PK M   - Focused: ${ this._focusedIdx }`);
                break;
            }
        }
    }
    
    /**
     * Change focus to the next visible-focusable component.
     */
    protected focusNext() {
        let candidateIdx: int;
        let candidate: PkUIComponent;
        const oldIdx = (this._focusedIdx != null) ? this._focusedIdx : -1;
        
        this.blur();
        
        for (let i = 1; i < this._components.length; i++) {
            candidateIdx = mod(oldIdx + i, this._components.length);
            candidate = this._components[candidateIdx];
            
            if (candidate.isFocusable() && candidate.isVisible()) {
                this._focusedIdx = candidateIdx;
                candidate.focus();
                console.debug(`PK M   - Focused: ${ this._focusedIdx }`);
                break;
            }
        }
    }
    
    
    ///  Shortcuts  ///
    
    protected get context(): PK2Context {
        return this._context;
    }
    
    protected get tx(): PkLanguage {
        return this._context.tx;
    }
    
    
    ///  Events  ///
    
    public static readonly EVT_SUSPENDED = 'suspended.screen.evt';
}
