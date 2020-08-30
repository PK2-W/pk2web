import { Dw } from '@ng/drawable/dw/Dw';
import { DwContainer } from '@ng/drawable/dw/DwContainer';
import { DwObjectBase } from '@ng/drawable/dwo/DwObjectBase';
import type { PkTickable } from '@ng/support/PkTickable';
import { minmax } from '@ng/support/utils';
import type { PkUIComponentContainer } from '@ng/ui/component/PkUIComponentContainer';
import { PkUiEffect } from '@ng/ui/effect/PkUiEffect';
import type { PkScreen } from '@ng/ui/PkScreen';
import type { PkUIContext } from '@ng/ui/PkUIContext';

export abstract class PkUIComponent<T extends PkUIContext = PkUIContext>
    extends DwObjectBase<DwContainer>
    implements PkTickable {
    
    public readonly context: T;
    private readonly _effects: Set<PkUiEffect>;
    private _focusable: boolean;
    
    private _parent: PkUIComponentContainer;
    
    protected constructor(context: T) {
        super(new DwContainer());
        
        this.context = context;
        this._effects = new Set();
        this._focusable = false;
        
        // Mouse events
        this._drawable.on(Dw.EV_POINTEROVER, () => this.emit(PkUIComponent.EV_POINTEROVER));
        this._drawable.on(Dw.EV_POINTERMOVE, () => this.emit(PkUIComponent.EV_POINTERMOVE));
        this._drawable.on(Dw.EV_POINTEROUT, () => this.emit(PkUIComponent.EV_POINTEROUT));
        this._drawable.on(Dw.EV_POINTERTAP, () => this.emit(PkUIComponent.EV_POINTERTAP));
    }
    
    /**
     * Adds this component as child to a parent container component.
     *
     * @param container - Target parent component.
     */
    public addTo(container: PkUIComponentContainer): this
    /**
     * Adds this component as child to a parent container component at the specified position.
     *
     * @param container - Target parent component.
     * @param x - Position x-coordinate.
     * @param y - Position y-coordinate.
     */
    public addTo(container: PkUIComponentContainer, x: number, y: number): this
    public addTo(container: PkUIComponentContainer, x?: number, y?: number): this {
        container.add(this);
        
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
    public focus(): this {
        // Component must be inside a screen
        if (this.screen == null)
            return;
        
        this.screen._demandsFocus(this);
        
        return this;
    }
    
    /**
     * Removes focus from this component.
     */
    public blur(): this {
        // Component must be focused
        if (!this.isFocused())
            return;
        
        this.screen.blur();
        
        return this;
    }
    
    /**
     * Sets {@link visible} and {@link renderable} properties to TRUE.<br>
     * Returns instance.
     */
    public show(): this {
        this.renderable = true;
        this.visible = true;
        return this;
    }
    
    /**
     * Sets {@link visible} and {@link renderable} properties FALSE.<br>
     * Returns instance.
     */
    public hide(): this {
        this.renderable = false;
        this.visible = false;
        return this;
    }
    
    /**
     * Returns the screen where this component is included.<br>
     * If the component is not in a screen, NULL is returned.
     */
    public get screen(): PkScreen | null {
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
    
    public get visible(): boolean { return this.dw.visible; }
    public set visible(visible: boolean) { this.setVisible(visible); }
    /** Sets the {@link visible} property. */
    public setVisible(visible: boolean): this {
        this.dw.visible = visible === true;
        return this;
    }
    
    public get worldVisible(): boolean {
        return this.dw.pixi.worldVisible;
    }
    
    public get renderable(): boolean { return this.dw.renderable; }
    public set renderable(renderable: boolean) { this.setRenderable(renderable); }
    /** Sets the {@link renderable} property. */
    public setRenderable(renderable: boolean): this {
        this.dw.renderable = renderable;
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
            && this.screen.focusedComponent === this;
    }
    
    public canBeFocused(): boolean {
        return this.focusable && this.worldVisible && this.renderable && this.alpha > 0 && this.globalAlpha > 0;
    }
    
    public get alpha(): number { return this._drawable.alpha; }
    public set alpha(value: number) { this._drawable.alpha = minmax(value, 0, 1); }
    public setAlpha(value: number): this {
        this.alpha = value;
        return this;
    }
    
    public get globalAlpha(): number { return this.dw.globalAlpha; }
    public set globalAlpha(alpha: number) { this.setGlobalAlpha(alpha); }
    /** Sets the {@link globalAlpha} property. */
    public setGlobalAlpha(alpha: number): this {
        this.dw.globalAlpha = minmax(alpha, 0, 1);
        return this;
    }
    
    
    ///  Statics  ///
    
    /**
     * Static shortcut for {@link PkUIComponent#show}.
     *
     * @param component - Target component.
     */
    public static show(component: PkUIComponent): void {
        component.show();
    }
    
    /**
     * Static shortcut for {@link PkUIComponent#hide}.
     *
     * @param component - Target component.
     */
    public static hide(component: PkUIComponent): void {
        component.hide();
    }
    
    /**
     * Static shortcut for {@link PkUIComponent#canBeFocused}.
     *
     * @param component - Target component.
     */
    public static canBeFocused(component: PkUIComponent): boolean {
        return component.canBeFocused();
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
            effect.applyTo(this);
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
    public static readonly EV_POINTERMOVE = Symbol('move.pointer.component.ui.evt');
    public static readonly EV_POINTERTAP = Symbol('click.pointer.component.ui.evt');
    public static readonly EV_ACTUATED = Symbol('actuated.component.ui.evt');
}