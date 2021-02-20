import { InputAction } from '@game/InputActions';
import { PkInputEvent } from '@fwk/core/input/PkInputEvent';
import { PkInput } from '@fwk/core/PkInput';
import { Log } from '@fwk/support/log/LoggerImpl';
import { PkEasing } from '@fwk/support/PkEasing';
import { mod } from '@fwk/support/utils';
import { PkUIComponent } from '@fwk/ui/component/PkUIComponent';
import { PkUIComponentContainer } from '@fwk/ui/component/PkUIComponentContainer';
import { PkUIEffectFadeIn } from '@fwk/ui/effect/PkUIEffectFadeIn';
import { PkUIEffectFadeOut } from '@fwk/ui/effect/PkUIEffectFadeOut';
import { PkUIContext } from '@fwk/ui/PkUIContext';

export interface PkIntent {
    actn: string,
    data: object
}

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
        
        this._creationTime = this.context.clock.now();
        
        this._status = PkScreenLCS.SUSPENDED;
        this.visible = false;
        this.setActive(false);
        
        this.on(PkInput.EV_KEYDOWN, (ev: PkInputEvent) => {
            if (ev.gameActns.includes(InputAction.UI_RIGHT) || ev.gameActns.includes(InputAction.UI_DOWN) || ev.gameActns.includes(InputAction.UI_NEXT)) {
                this.focusNext();
            }
        });
        this.on(PkInput.EV_KEYDOWN, (ev: PkInputEvent) => {
            if (ev.gameActns.includes(InputAction.UI_LEFT) || ev.gameActns.includes(InputAction.UI_UP)) {
                this.focusPrevious();
            }
        });
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
    
    public resume(ms: number = 0): Promise<this> {
        return new Promise((resolve) => {
            if (this.isOperating() || this.isResuming()) {
                resolve(this);
            }
            
            Log.d('[Screen] Resuming "', this.constructor.name, '"');
            
            //this._lastResumeTime = this._context.time.now();
            
            this._status = PkScreenLCS.RESUMING;
            this.emit(PkScreen.EV_RESUMING);
            
            this.visible = true;
            
            if (ms > 0) {
                this.getDrawable().globalAlpha = 0;
                this.applyEffect(PkUIEffectFadeIn.for(ms, PkEasing.outCubic)
                    .thenDo(() => {
                        this._resume();
                        Log.d('[Screen] Done');
                        
                        resolve(this);
                    }));
            } else {
                this._resume();
                resolve(this);
            }
        });
    }
    private _resume(): void {
        this._status = PkScreenLCS.OPERATING;
        this.emit(PkScreen.EV_RESUMED);
    }
    
    public suspend(ms: number = 0, intent?: PkIntent): Promise<this> {
        return new Promise((resolve) => {
            if (this.isSuspended() || this.isSuspending()) {
                resolve(this);
            }
            
            Log.d('[Screen] Suspending "', this.constructor.name, '"');
            
            this.setActive(false);
            this._status = PkScreenLCS.SUSPENDING;
            this.emit(PkScreen.EV_SUSPENDING);
            
            if (ms > 0) {
                this.applyEffect(PkUIEffectFadeOut.for(ms)
                    .thenDo(() => {
                        this._suspend(intent);
                        resolve();
                    }));
            } else {
                this._suspend(intent);
                resolve();
            }
        });
    }
    private _suspend(intent: PkIntent): void {
        this.visible = false;
        
        this._status = PkScreenLCS.SUSPENDED;
        this.emit(PkScreen.EV_SUSPENDED, intent);
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
    
    /**
     * Returns the focused component in the screen, if any.
     */
    public get focusedComponent(): PkUIComponent {
        return this._focusedComponent;
    }
    
    // Screen can't be focused.
    public setFocusable(focusable: false): this { return this; }
    // Screen can't be focused.
    public isFocused(): boolean { return false; }
    // Screen can't be focused.
    public canBeFocused(): boolean { return false; }
    
    /**
     * Called by a children component that demands be the new focused element in the screen.
     * @internal
     */
    public _demandsFocus(component: PkUIComponent): void {
        // Screen must be active
        if (!this._active)
            return;
        // Component mustn't be already focused
        if (this._focusedComponent === component)
            return;
        // Component is required and must be focusable
        if (component == null || !component.canBeFocused())
            return;
        // Component must be child
        if (component.screen !== this)
            return;
        
        const old = this._focusedComponent;
        if (old != null) {
            old.blur();
        }
        
        this._focusedComponent = component;
        
        component.emit(PkUIComponent.EV_FOCUS, component);
        this.emit(PkScreen.EV_FOCUS_CHANGED, old, component);
    }
    
    /**
     * Removes focus from the currently focused component, if any.
     */
    public blur(): this {
        const old = this._focusedComponent;
        if (old != null) {
            this._focusedComponent = null;
            
            old.emit(PkUIComponent.EV_BLUR, old);
            this.emit(PkScreen.EV_FOCUS_CHANGED, old, null);
        }
        return this;
    }
    
    /**
     * If none of the elements on the screen have focus, it focuses the first focusable element available.<br>
     */
    public focus(): this {
        if ((this.isOperating() || this.isResuming()) && this._active && this._focusedComponent != null) {
            this.focusNext();
        }
        return this;
    }
    
    /**
     * Focuses the specified element of the screen.
     */
    public focusChild(component: PkUIComponent): void {
        if (component.screen === this) {
            component.focus();
        }
    }
    
    /**
     * Change focus to the previous focusable component.<br>
     * If there is no element currently focused, it focuses the first focusable element available.
     */
    public focusPrevious() {
        // Get ordered list of focusable elements
        const list = [...this].filter(component => component.canBeFocused());
        
        // If there aren't focusable elements, no element can have the focus currently
        if (list.length === 0) {
            if (this._focusedComponent == null) {
                this.blur();
            }
            return;
        }
        
        if (this._focusedComponent == null) {
            list[0].focus();
        } else {
            const i = list.indexOf(this._focusedComponent);
            if (i < 0) {
                list[0].focus();
            } else {
                list[mod(i - 1, list.length)].focus();
            }
        }
    }
    
    /**
     * Change focus to the next focusable component.
     * If there is no element currently focused, it focuses the first focusable element available.
     */
    public focusNext() {
        const list = [...this].filter(component => component.canBeFocused());
        
        // If there aren't focusable elements, no element can have the focus currently
        if (list.length === 0) {
            if (this._focusedComponent == null) {
                this.blur();
            }
            return;
        }
        
        if (this._focusedComponent == null) {
            list[0].focus();
        } else {
            const i = list.indexOf(this._focusedComponent);
            if (i < 0) {
                list[0].focus();
            } else {
                list[mod(i + 1, list.length)].focus();
            }
        }
    }
   
    
    ///  Events  ///
    
    public static readonly EV_SUSPENDED = Symbol('suspended.screen.ev');
    public static readonly EV_SUSPENDING = Symbol('suspending.screen.ev');
    public static readonly EV_RESUMED = Symbol('resumed.screen.ev');
    public static readonly EV_RESUMING = Symbol('resuming.screen.ev');
    public static readonly EV_FOCUS_CHANGED = Symbol('changed.focus.screen.ev');
}

enum PkScreenLCS {
    RESUMING,
    OPERATING,
    SUSPENDING,
    SUSPENDED,
}