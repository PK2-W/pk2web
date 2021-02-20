import { PekkaContext } from '@game/PekkaContext';
import { TTextId } from '@game/support/types';
import { UIText } from '@game/ui/component/UIText';
import { PkFont } from '@fwk/types/font/PkFont';

export class UIPlainText extends UIText {
    private _shadowDepth: number;
    private _letterSpace: number;
    
    public constructor(context: PekkaContext, text: TTextId | string, font: PkFont, translatable: boolean = false, x: number = 0, y: number = 0) {
        super(context, text, font, translatable, x, y);
        
        this._shadowDepth = 0;
        
        this._refreshText();
    }
    
    
    ///  Properties  ///
    
    public get shadowDepth(): number { return this._shadowDepth; }
    public set shadowDepth(depth: number) { this.setShadowDepth(depth); }
    /** Sets the {@link shadowDepth} property. */
    public setShadowDepth(depth: number): this {
        this._shadowDepth = depth;
        this._refreshText();
        return this;
    }
    
    /**
     * Calculated width that must have this component.
     */
    public get width(): number {
        return this.getFinalText().length * this._font.charWidth;
    }
    
    
    ///  Drawing  ///
    
    protected _refreshText(): void {
        this.dw.clear();
        
        if (this.shadowDepth !== 0) {
            this.context.font4.writeText(this.getFinalText(), this.dw, this._shadowDepth, this._shadowDepth);
        }
        this.font.writeText(this.getFinalText(), this.dw);
    }
    
    public arrange(): void { }
}
