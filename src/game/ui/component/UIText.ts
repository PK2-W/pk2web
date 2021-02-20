import type { PekkaContext } from '@game/PekkaContext';
import type { TTextId } from '@game/support/types';
import type { PkFont } from '@fwk/types/font/PkFont';
import { PkUIComponent } from '@fwk/ui/component/PkUIComponent';

export abstract class UIText extends PkUIComponent<PekkaContext> {
    protected _text: TTextId | string;
    protected _font: PkFont;
    protected _translatable: boolean;
    
    protected constructor(context: PekkaContext, text: TTextId | string, font: PkFont, translatable: boolean = false, x: number = 0, y: number = 0) {
        super(context);
        
        this._text = text;
        this._font = font;
        this._translatable = translatable;
        
        this.x = x;
        this.y = y;
    }
    
    ///  Properties  ///
    
    public get text(): string { return this._text; }
    public set text(text: string) { this.setText(text); }
    /** Sets the {@link text} property. */
    public setText(text: string): this {
        this._text = text;
        this._refreshText();
        return this;
    }
    
    public get font(): PkFont { return this._font; }
    public set font(font: PkFont) { this.setFont(font); }
    /** Sets the {@link font} property. */
    public setFont(font: PkFont): this {
        this._font = font;
        this._refreshText();
        return this;
    }
    
    public get translatable(): boolean { return this._translatable; }
    public set translatable(translatable: boolean) { this.setTranslatable(translatable); }
    /** Sets the {@link translatable} property. */
    public setTranslatable(translatable: boolean): this {
        this._translatable = translatable === true;
        this._refreshText();
        return this;
    }
    
    
    ///  Drawing  ///
    
    protected _refreshText(): void {
        // ...
        this.arrange();
    }
    
    public arrange(): void {
    
    }
    
    
    ///  Computed properties  ///
    
    public getFinalText() {
        return this.translatable
            ? this.context.tx.get(this.text) || this.text.toLowerCase()
            : this.text.toLowerCase();
    }
}
