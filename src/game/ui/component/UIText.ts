import { PkFont } from '@ng/types/font/PkFont';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { PK2Context } from '@game/PK2Context';
import { TTextId } from '@game/support/types';

export abstract class UIText extends PkUIComponent {
    protected readonly _context: PK2Context;
    protected readonly _textId: TTextId;
    protected readonly _font: PkFont;
    
    
    protected constructor(context: PK2Context, textId: TTextId | string, font: PkFont, x: number = 0, y: number = 0) {
        super(context);
        
        this._textId = textId;
        this._font = font;
        
        this.x = x;
        this.y = y;
    }
    
    
    ///  Accessors  ///
    
    /**
     * Returns the appropriate translation for the text with the specified id.<br>
     * If a suitable translation is not found, the id will be returned.
     */
    public get text(): string {
        return this._context.tx.get(this._textId) || this._textId;
    }
    
    /**
     * Returns the font used in this text component.
     */
    public get font(): PkFont {
        return this._font;
    }
    
    /**
     * Returns the width, in pixels, taken by this text component as:<br>
     * *`number_of_chars × font_char_with`*.
     */
    public get width(): number {
        return this._font.charWidth * this.text.length;
    }
}
