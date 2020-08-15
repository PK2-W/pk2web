import { PK2Context } from '@game/PK2Context';
import { TTextId } from '@game/support/types';
import { UIText } from '@game/ui/component/UIText';
import { Dw } from '@ng/drawable/skeleton/Dw';
import { PkFont } from '@ng/types/font/PkFont';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';

export class UIWaveText extends UIText {
    // Fast/slow wave animation
    private _fast: boolean;
    
    
    ///  Build  ///
    
    public constructor(context: PK2Context, textId: TTextId, fontId: PkFont, x: number = 0, y: number = 0, fast: boolean = false) {
        super(context, textId, fontId, x, y);
        this._fast = fast;
        
        this._createText();
        
        // this.listen('space', () => {
        //     this.emit(PkUIComponentImpl.EV_ACTION);
        // });
        
        const b: PIXI.Rectangle = this.dw.pixi.getLocalBounds();
        this.dw.pixi.hitArea = new PIXI.Rectangle(b.x - 2, b.y - 2, b.width + 4, b.height + 4);
        this.dw.pixi.interactiveChildren = false;
        
        // Special
        this.on(PkUIComponent.EV_POINTEROVER, () => {
            this.focus();
        });
        this.on(PkUIComponent.EV_POINTEROUT, () => {
            this.blur();
        });
    }
    
    private _createText(): void {
        const text = this.text;
        let xs, ys, dw: Dw, vali = 0;
        
        this._drawable.clear();
        
        // For every letter...
        for (let i = 0; i < text.length; i++) {
            ys = this.sin(((i + this._context.entropy.degree) * 8) % 360) / 7;
            xs = this.cos(((i + this._context.entropy.degree) * 8) % 360) / 9;
            
            // TODO: Font shadow -> PisteDraw2_Font_Write(fontti4, kirjain, x + vali - xs + 3, y + ys + 3);
            dw = this._getFont().writeText(text[i]);
            dw.x = vali - xs + 3;
            dw.y = ys + 3;
            this._drawable.add(dw);
            
            vali += this._font.charWidth;
        }
    }
    
    
    ///   Properties  ///
    
    public isFast(): boolean {
        return this._fast === true;
    }
    public setFast(ind: boolean = true): void {
        this._fast = (ind === true);
    }
    
    
    ///  Timing  ///
    
    public tick(delta: number, time: number): void {
        super.tick(delta, time);
        
        this.layout();
    }
    
    
    ///  Graphics  ///
    
    public focus(): void {
        super.focus();
        this._createText();
    }
    
    public blur(): void {
        super.blur();
        this._createText();
    }
    
    private layout(): void {
        let xmov, ymov, offset = 0;
        
        // For every letter....
        for (let i = 0; i < this._drawable.children; i++) {
            if (this._fast || this.isFocused()) {
                ymov = this.sin(((i + this._context.entropy.degree) * 8) % 360) / 7;
                xmov = this.cos(((i + this._context.entropy.degree) * 8) % 360) / 9;
            } else {
                ymov = this.sin(((i + this._context.entropy.degree) * 4) % 360) / 9;
                xmov = this.cos(((i + this._context.entropy.degree) * 4) % 360) / 11;
            }
            
            // TODO: Shadow +1 if slow, shadow +3 if fast
            // TODO: settings option to disable shadow in slow
            // PisteDraw2_Font_Write(fontti4, kirjain, x + offset - xmov + 3, y + ymov + 3);
            this._drawable.get(i).x = offset - xmov + 3;
            this._drawable.get(i).y = ymov + 3;
            
            offset += this._getFont().charWidth;
        }
    }
    
    private _getFont(): PkFont {
        return this.isFocused() ? this._context.font3 : this._context.font2;
    }
    
    /** @deprecated */
    public sin(deg): number {
        //return Math.sin(deg * Math.PI / 180) * 180 / Math.PI;
        // return Math.sin(2 * Math.PI * (deg % 360) / 180) * 33;
        return this._context.entropy.sin(deg);
    }
    /** @deprecated */
    public cos(deg): number {
        //return Math.cos(deg * Math.PI / 180) * 180 / Math.PI;
        //     return Math.cos(2 * Math.PI * (deg % 360) / 180) * 33;
        return this._context.entropy.cos(deg);
    }
}
