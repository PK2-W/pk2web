import { PK2Context } from '@game/PK2Context';
import { Dw } from '@ng/drawable/Dw';
import { ITickable } from '@ng/ITickable';
import { PkScreen } from '@ng/ui/PkScreen';
import * as PIXI from 'pixi.js';

/** @deprecated */
export abstract class PkUIComponentImpl{
    protected _context: PK2Context;
    
    private _visible: boolean;
    
    private _focusable: boolean;
    private _focused: boolean;
    protected _focusLock: boolean;
    
    private _keyMap: KayMapT[];
    
    
    protected constructor(context: PK2Context, dw: PIXI.DisplayObject) {
        
        this._context = context;
        
        this.setVisible(true);
        
        this._focused = false;
        this._focusLock = false;
        this.setFocusable(false);
        
        this._keyMap = [];
    }
    
    
    public x: number;
    public y: number;
    
    ///  Self Content  ///
    
    public addTo(screen: PkScreen): this {
        screen.add(this);
        return this;
    }
    
    
    ///  Keyboard  ///
    
    protected listen(keys: string, fn: () => any) {
        this._context.input.listenKeys(keys, this.keyListener.bind(this, fn));
    }
    
    private keyListener(fn) {
        if (this.isFocusable() && this.isVisible() && this.isFocused()) {
            fn();
        }
    }
    
    
    ///  Visibility  ///
    
    public isVisible(): boolean {
        return this._visible === true;
    }
    
    public setVisible(visible: boolean = true): this {
        this._visible = (visible === true);
        
        this._drawable.visible = visible;
        // TODO: Forced blur
        
        return this;
    }
    
    public show(): this { return this.setVisible(true); }
    
    public hide(): this { return this.setVisible(false); }
    
    
    ///  Focus  ///
    
    public isFocusable(): boolean {
        return this._focusable;
    }
    
    public setFocusable(focusable: boolean = true): this {
        this._focusable = (focusable === true);
        
        // TODO: Reject if focused
        
        return this;
    }
    
    public isFocused(): boolean {
        return this._focused === true;
    }
    
    public focus(): boolean {
        if (!this.isFocusable())
            return false;
        
        this._focused = true;
    }
    
    public blur(): boolean {
        if (this._focusLock)
            return false;
        
        this._focused = false;
        
        return true;
    }
    
    
    ///  Timing  ///
    
    /** @inheritDoc */
    public tick(delta: number, time: number): void {}
    
    
    ///  Events  ///
    
    public static readonly EV_ACTION = 'action.component.ui.evt';
}

type KayMapT = {
    keys: string,
    fn: () => any
};
