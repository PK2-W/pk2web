import { DwHelper } from '@ng/drawable/DwHelper';
import { DwObjectBase } from '@ng/drawable/object/DwObjectBase';
import { DwContainer } from '@ng/drawable/skeleton/DwContainer';
import { DwFactory } from '@ng/drawable/skeleton/DwFactory';
import type { PkTickable } from '@ng/support/PkTickable';
import type { PkUIComponentContainer } from '@ng/ui/component/PkUIComponentContainer';
import { PkUiEffect } from '@ng/ui/effect/PkUiEffect';
import type { PkScreen } from '@ng/ui/PkScreen';
import type { PkUIContext } from '@ng/ui/PkUIContext';

export abstract class PkUIComponent<T extends PkUIContext = PkUIContext>
    extends DwObjectBase<DwContainer>
    implements PkTickable {
    
    protected readonly _context: T;
    private readonly _effects: Set<PkUiEffect>;
    private _focusable: boolean;
    
    private _parent: PkUIComponentContainer;
    
    protected constructor(context: T) {
        super(DwFactory.new.container());
        
        this._context = context;
        this._effects = new Set();
        
        // Mouse events
        this._drawable.on(DwHelper.EV_POINTEROVER, () => this.emit(PkUIComponent.EV_POINTEROVER));
        this._drawable.on(DwHelper.EV_POINTEROUT, () => this.emit(PkUIComponent.EV_POINTEROUT));
        this._drawable.on(DwHelper.EV_POINTERTAP, () => this.emit(PkUIComponent.EV_POINTERTAP));
    }
    
    /**
     * Adds this component as child to a parent container component.
     *
     * @param container - Target parent component.
     */
    public addTo(container: PkUIComponentContainer): this {
        container.add(this);
        return this;
    }
    
    /**
     *
     * @param parent
     * @internal
     */
    protected _childOf(parent: PkUIComponentContainer) {
        // If it's already attached to a screen, clear relations
        if (this.screen != null) {
            // TODO
        }
        
        this._parent = parent;
    }
    
    /**
     * Makes this component the focused component of his screen.<br>
     * Component must be inside a screen and be focusable.
     */
    public focus(): void {
        // Component must be inside a screen
        if (this.screen == null)
            return;
        
        this.screen.focus(this);
    }
    
    /**
     * Removes focus from this component.
     */
    public blur(): void {
        // Component must be focused
        if (!this.isFocused())
            return;
        
        this.screen.blur();
    }
    
    /**
     * Sets {@link visible} property to TRUE.<br>
     * Returns instance.
     */
    public show(): this {
        this.visible = true;
        return this;
    }
    
    /**
     * Sets {@link visible} property to FALSE.<br>
     * Returns instance.
     */
    public hide(): this {
        this.visible = false;
        return this;
    }
    
    /**
     * Returns the screen where this component is included.<br>
     * If the component is not in a screen, NULL is returned.
     */
    public get screen(): PkScreen {
        // If standalone -> no screen
        if (this._parent == null)
            return null;
        
        // Walk the parents to the root
        let root = this._parent;
        while (root.parent != null) {
            root = root.parent;
        }
        
        // If root component is not screen -> no screen
        // Check here for type PkScreen causes circular dependency, so we check for a known method
        if (typeof (root as PkScreen).resume !== 'function')
            return null;
        
        return root as PkScreen;
    }
    
    /** Returns the parent component which this component is child of. */
    public get parent(): PkUIComponentContainer {
        return this._parent;
    }
    
    /** Returns the x-coordinate of the current position of the component. */
    public get x(): number { return this._drawable.x; }
    public set x(value: number) { this._drawable.x = value; }
    
    /** Returns the y-coordinate of the current position of the component. */
    public get y(): number { return this._drawable.y; }
    public set y(value: number) { this._drawable.y = value; }
    
    public setPosition(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }
    
    public get visible(): boolean { return this._drawable.visible; }
    public set visible(value: boolean) { this.setVisible(value); }
    public setVisible(value: boolean): this {
        this._drawable.visible = value;
        return this;
    }
    
    public get renderable(): boolean { return this._drawable.renderable; }
    public set renderable(value: boolean) { this.setRenderable(value); }
    public setRenderable(value: boolean): this {
        this._drawable.renderable = value;
        return this;
    }
    
    public get focusable(): boolean { return this._focusable; }
    public set focusable(value: boolean) { this.setFocusable(value); }
    public setFocusable(value: boolean = true): this {
        this._focusable = value;
        return this;
    }
    
    public isFocused(): boolean {
        return this.screen != null
            && this.screen.isFocused(this);
    }
    
    public get alpha(): number { return this._drawable.alpha; }
    public set alpha(value: number) { this._drawable.alpha = value; }
    public setAlpha(value: number): this {
        this.alpha = value;
        return this;
    }
    
    
    ///  Input  ///
    
    /**
     * @internal
     */
    private _inputEvent(event: any): void {
    
    }
    
    
    ///  Effects  ///
    
    public applyEffect(...effects: PkUiEffect[]): this {
        for (let effect of effects) {
            this._effects.add(effect);
            
            effect.once(PkUiEffect.EV_FINISHED, (effect: PkUiEffect, thenEffects: PkUiEffect[], thenActions: ((component: PkUIComponent) => void)[]) => {
                this._effects.delete(effect);
                // Apply THEN effects
                this.applyEffect(...thenEffects);
                // Apply THEN callbacks
                thenActions.forEach(fn => fn(this));
            });
            effect.prepare(this);
        }
        
        return this;
    }
    
    
    ///  Game loop  ///
    
    public tick(delta: number, time: number): void {
        // Tick effects
        for (let effect of this._effects) {
            effect.tick(delta, time);
        }
    }
    
    
    ///  Events  ///
    
    public static readonly EV_BLUR = Symbol('blur.component.ui.evt');
    public static readonly EV_FOCUS = Symbol('focus.component.ui.evt');
    public static readonly EV_POINTEROVER = Symbol('over.pointer.component.ui.evt');
    public static readonly EV_POINTEROUT = Symbol('out.pointer.component.ui.evt');
    public static readonly EV_POINTERTAP = Symbol('click.pointer.component.ui.evt');
    public static readonly EV_KEYUP = Symbol('up.key.component.ui.evt');
    public static readonly EV_KEYDOWN = Symbol('down.key.component.ui.evt');
    public static readonly EV_KEYPRESS = Symbol('press.key.component.ui.evt');
}