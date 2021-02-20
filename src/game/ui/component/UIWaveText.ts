import { InputAction } from '@game/InputActions';
import { PekkaContext } from '@game/PekkaContext';
import { TTextId } from '@game/support/types';
import { UIText } from '@game/ui/component/UIText';
import { PkInputEvent } from '@fwk/core/input/PkInputEvent';
import { PkInput } from '@fwk/core/PkInput';
import { DwContainer } from '@fwk/drawable/dw/DwContainer';
import { PkFont } from '@fwk/types/font/PkFont';
import { PkRectangle } from '@fwk/types/PkRectangle';
import { PkUIComponent } from '@fwk/ui/component/PkUIComponent';

export class UIWaveText extends UIText {
    private _fast: boolean;
    private _shadow: boolean;
    
    private readonly _dwShadow: DwContainer;
    private readonly _dwFront: DwContainer;
    
    
    public constructor(context: PekkaContext, text: TTextId | string, font: PkFont, translatable: boolean = false, x: number = 0, y: number = 0) {
        super(context, text, font, translatable, x, y);
        
        this._fast = false;
        this._shadow = true;
        
        this._dwShadow = new DwContainer().addTo(this.dw);
        this._dwFront = new DwContainer().addTo(this.dw);
        
        this._refreshText();
        
        // this.listen('space', () => {
        //     this.emit(PkUIComponentImpl.EV_ACTION);
        // });
        
        
        //this.dw.pixi.interactiveChildren = false;
        
        // Special
        this.on(PkUIComponent.EV_POINTEROVER, () => this.focus());
        this.on(PkUIComponent.EV_POINTERMOVE, () => this.focus());
        this.on(PkUIComponent.EV_POINTEROUT, () => this.blur());
        this.on(PkUIComponent.EV_POINTERTAP, () => {
            if (this.isFocused()) {
                this.emit(UIWaveText.EV_ACTUATED, this);
            }
        });
        this.on(PkInput.EV_KEYDOWN, (ev: PkInputEvent) => {
            if (ev.gameActns.includes(InputAction.UI_ACTUATE)) {
                this.emit(UIWaveText.EV_ACTUATED, this);
            }
            //     if (!ev.gameActns.includes(InputAction.UI_DOWN)) {
            //         this._inputText('' + Math.floor(Math.random() * 10));
            //     }
        });
    }
    
    protected _refreshText(): void {
        const text = this.getFinalText();
        
        this._dwShadow.clear();
        this._dwFront.clear();
        
        if (this._shadow) {
            this.context.font4.writeText(text, this._dwShadow.clear());
        }
        this._getFont().writeText(text, this._dwFront.clear());
        
        const bounds: PkRectangle = this.dw.getLocalBounds();
        this.dw.hitArea = PkRectangle.$(bounds.x - 2, bounds.y - 2, bounds.width + 4, bounds.height + 4);
        
        this.arrange();
    }
    
    public arrange(): void {
        let xmov, ymov;
        let offset = 0;
        let shadowOffset;
        
        // For every letter....
        for (let i = 0; i < this._dwFront.length; i++) {
            if (this._fast || this.isFocused()) {
                ymov = this.context.entropy.sin(((i + this.context.entropy.degree) * 8) % 360) / 7;
                xmov = this.context.entropy.cos(((i + this.context.entropy.degree) * 8) % 360) / 9;
                shadowOffset = 3;
            } else {
                ymov = this.context.entropy.sin(((i + this.context.entropy.degree) * 4) % 360) / 9;
                xmov = this.context.entropy.cos(((i + this.context.entropy.degree) * 4) % 360) / 11;
                shadowOffset = 1;
            }
            
            if (this._shadow) {
                this._dwShadow.get(i).setPosition(offset - xmov + shadowOffset, ymov + shadowOffset);
            }
            this._dwFront.get(i).setPosition(offset - xmov, ymov);
            
            // TODO: settings option to disable shadow in slow
            
            offset += this._getFont().charWidth;
        }
    }
    
    
    ///   Properties  ///
    
    public get shadow(): boolean { return this._shadow; }
    public set shadow(shadow: boolean) { this.setShadow(shadow); }
    /** Sets the {@link shadow} property. */
    public setShadow(shadow: boolean): this {
        this._shadow = shadow === true;
        
        this._dwShadow.clear();
        this.arrange();
        
        return this;
    }
    
    public isFast(): boolean {
        return this._fast === true;
    }
    public setFast(ind: boolean = true): void {
        this._fast = (ind === true);
    }
    
    
    ///  Timing  ///
    
    public tick(delta: number, time: number): void {
        super.tick(delta, time);
        
        this.arrange();
    }
    
    
    ///  Graphics  ///
    
    public focus(): this {
        super.focus();
        this._refreshText();
        return this;
    }
    
    public blur(): this {
        super.blur();
        this._refreshText();
        return this;
    }
    
    private _getFont(): PkFont {
        return this.isFocused() ? this.context.font3 : this.context.font2;
    }
}
