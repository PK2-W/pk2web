import { PkUIComponent } from '@ng/screen/PkUIComponent';
import { FONTID, TEXTID } from '../../support/types';
import { PK2Context } from '../PK2Context';
import { UIText } from './UIText';

export class UIWaveText extends UIText {
    // Fast/slow wave animation
    private _fast: boolean;
    
    
    ///  Build  ///
    
    public constructor(context: PK2Context, textId: TEXTID, fontId: FONTID, x: number, y: number, fast: boolean = false) {
        super(context, textId, fontId, x, y);
        this._fast = fast;
        
        this.createText();
        
        this.listen('space', () => {
            this.emit(PkUIComponent.EVT_ACTION);
        });
    }
    
    private createText(): void {
        const text = this.text;
        let xs, ys, dw, vali = 0;
        
        // For every letter...
        for (let i = 0; i < text.length; i++) {
            ys = this.sin(((i + this._context.entropy.degree) * 8) % 360) / 7;
            xs = this.cos(((i + this._context.entropy.degree) * 8) % 360) / 9;
            
            // TODO: Font shadow -> PisteDraw2_Font_Write(fontti4, kirjain, x + vali - xs + 3, y + ys + 3);
            dw = this.font.writeText(text[i]);
            dw.x = vali - xs + 3;
            dw.y = ys + 3;
            this.container.addChild(dw);
            
            vali += this.font.charWidth;
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
        this.layout();
    }
    
    
    ///  Graphics  ///
    
    private layout(): void {
        let xmov, ymov, offset = 0;
        
        // For every letter....
        for (let i = 0; i < this.container.children.length; i++) {
            if (this._fast || this.isFocused()) {
                ymov = this.sin(((i + this._context.entropy.degree) * 8) % 360) / 7;
                xmov = this.cos(((i + this._context.entropy.degree) * 8) % 360) / 9;
            } else {
                ymov = this.sin(((i + this._context.entropy.degree) * 4) % 360) / 9;
                xmov = this.cos(((i + this._context.entropy.degree) * 4) % 360) / 11;
            }
            
            // PisteDraw2_Font_Write(fontti4, kirjain, x + offset - xmov + 3, y + ymov + 3);
            this.container.children[i].x = offset - xmov + 3;
            this.container.children[i].y = ymov + 3;
            
            offset += this.font.charWidth;
        }
    }
    
    /** @deprecated */
    public sin(deg): number {
        //return Math.sin(deg * Math.PI / 180) * 180 / Math.PI;
        return Math.sin(2 * Math.PI * (deg % 360) / 180) * 33;
    }
    /** @deprecated */
    public cos(deg): number {
        //return Math.cos(deg * Math.PI / 180) * 180 / Math.PI;
        return Math.cos(2 * Math.PI * (deg % 360) / 180) * 33;
    }
}
