import { Log } from '@ng/support/log/LoggerImpl';
import { mod } from '@ng/support/utils';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { PkUIComponentContainer } from '@ng/ui/component/PkUIComponentContainer';
import { PkUIEffectFadeIn } from '@ng/ui/effect/PkUIEffectFadeIn';
import { PkUIEffectFadeOut } from '@ng/ui/effect/PkUIEffectFadeOut';
import { PkUIContext } from '@ng/ui/PkUIContext';

export abstract class PkScreen<T extends PkUIContext = PkUIContext> extends PkUIComponentContainer<T> {
    // LCS
    private readonly _creationTime: number;
    private _lastResumeTime: number;
    
    private _active: boolean;
    private _status: PkScreenLCS;
    
    private _focusedComponent: PkUIComponent;
    
    
    /**
     *
     */
    protected constructor(context: T) {
        super(context);
        
        this._creationTime = this._context.time.now();
        
        this._status = PkScreenLCS.SUSPENDED;
        this.renderable = false;
        this.setActive(false);
    }
    
    
    ///  Timing  ///
    
    public get creationTime(): number { return this._creationTime; }
    public get lastResumeTime(): number { return this._lastResumeTime; }
    
    
    ///  Lifecycle  ///
    
    public setActive(active: boolean): this {
        if (active && !this.isOperating() && !this.isResuming()) {
            return this;
        }
        
        this._active = active;
        
        if (active) {
            this.propagatePointerEvents = true;
            this.focusNext();
        } else {
            this.propagatePointerEvents = false;
            this.blur();
        }
        
        return this;
    }
    
    public resume(ms: number = 0) {
        if (this.isOperating() || this.isResuming()) {
            return;
        }
        
        Log.d('[Screen] Resuming "', this.constructor.name, '"');
        
        //this._lastResumeTime = this._context.time.now();
        this._status = PkScreenLCS.RESUMING;
        this.renderable = true;
        if (ms > 0) {
            this.alpha = 0;
            this.applyEffect(PkUIEffectFadeIn.for(ms)
                .thenDo(() => this._resume()));
        }
        
    }
    private _resume(): void {
        this.renderable = true;
        
        this._status = PkScreenLCS.OPERATING;
        this.emit(PkScreen.EV_RESUMED);
    }
    
    public suspend(ms: number = 0): this {
        if (this.isSuspended() || this.isSuspending()) {
            return this;
        }
        
        Log.d('[Screen] Suspending "', this.constructor.name, '"');
        
        this._status = PkScreenLCS.SUSPENDING;
        this.setActive(false);
        
        if (ms > 0) {
            this.applyEffect(PkUIEffectFadeOut.for(ms)
                .thenDo(() => this._suspend()));
        }
        this.emit(PkScreen.EV_SUSPENDING);
    }
    private _suspend(): void {
        this.renderable = false;
        
        this._status = PkScreenLCS.SUSPENDED;
        this.emit(PkScreen.EV_SUSPENDED);
    }
    
    public isResuming(): boolean {
        return this._status === PkScreenLCS.RESUMING;
    }
    public isOperating(): boolean {
        return this._status === PkScreenLCS.OPERATING;
    }
    public isSuspending(): boolean {
        return this._status === PkScreenLCS.SUSPENDING;
    }
    public isSuspended(): boolean {
        return this._status === PkScreenLCS.SUSPENDED;
    }
    
    
    ///  Focus  ///
    
    public isFocused(component?: PkUIComponent): boolean {
        // Screen is never focused
        if (component == null)
            return false;
        
        return this._focusedComponent === component;
    }
    
    /**
     * Removes focus from the currently focused component.
     */
    public blur(): void {
        const old = this._focusedComponent;
        if (old != null) {
            this._focusedComponent = null;
            
            old.emit(PkUIComponent.EV_BLUR, old);
            this.emit(PkScreen.EV_FOCUS_CHANGED, old, null);
        }
    }
    
    /**
     * Puts focus on the specified component.
     */
    public focus(component?: PkUIComponent): void {
        // Component mustn't be already focused
        if (this._focusedComponent === component)
            return;
        
        // Component is required and must be focusable
        if (component == null || !component.focusable)
            return;
        
        // Component must be child
        if (component.screen !== this)
            return;
        
        const old = this._focusedComponent;
        
        this._focusedComponent = component;
        
        component.emit(PkUIComponent.EV_BLUR, old);
        component.emit(PkUIComponent.EV_FOCUS, component);
        this.emit(PkScreen.EV_FOCUS_CHANGED, old, null);
    }
    
    /**
     * Change focus to the previous visible-focusable component.
     */
    protected focusPrevious() {
        let candidateIdx: number;
        let candidate: PkUIComponentImpl;
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
        // let candidateIdx: number;
        // let candidate: PkUIComponentImpl;
        // const oldIdx = (this._focusedIdx != null) ? this._focusedIdx : -1;
        //
        // this.blur();
        //
        // for (let i = 1; i < this._components.length; i++) {
        //     candidateIdx = mod(oldIdx + i, this._components.length);
        //     candidate = this._components[candidateIdx];
        //
        //     if (candidate.isFocusable() && candidate.isVisible()) {
        //         this._focusedIdx = candidateIdx;
        //         candidate.focus();
        //         console.debug(`PK M   - Focused: ${ this._focusedIdx }`);
        //         break;
        //     }
        // }
    }
    
    
    ///  Events  ///
    
    public static readonly EV_SUSPENDED = 'suspended.screen.ev';
    public static readonly EV_SUSPENDING = 'suspending.screen.ev';
    public static readonly EV_RESUMED = 'resumed.screen.ev';
    public static readonly EV_FOCUS_CHANGED = 'changed.focus.screen.ev';
}

enum PkScreenLCS {
    RESUMING,
    OPERATING,
    SUSPENDING,
    SUSPENDED,
}