import { PekkaContext } from '@game/PekkaContext';
import { TTextId } from '@game/support/types';
import { UIText } from '@game/ui/component/UIText';
import { PkFont } from '@ng/types/font/PkFont';

export class UIPlainText extends UIText {
    private _shadow: boolean;
    private _letterSpace: number;
    
    public constructor(context: PekkaContext, text: TTextId | string, font: PkFont, translatable: boolean = false, x: number = 0, y: number = 0) {
        super(context, text, font, translatable, x, y);
        
        this._shadow = false;
        
        this._refreshText();
    }
    
    
    ///  Properties  ///
    
    public get shadow(): boolean { return this._shadow; }
    public set shadow(shadow: boolean) { this.setShadow(shadow); }
    /** Sets the {@link shadow} property. */
    public setShadow(shadow: boolean): this {
        this._shadow = shadow === true;
        this._refreshText();
        return this;
    }
    
    
    ///  Drawing  ///
    
    protected _refreshText(): void {
        this.dw.clear();
        
        if (this.shadow) {
            this.context.font4.writeText(this.getFinalText(), this.dw, 3, 3);
        }
        this.font.writeText(this.getFinalText(), this.dw);
    }
    
    public arrange(): void { }
}
