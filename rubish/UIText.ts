import { PkFont } from '@ng/types/font/PkFont';
import { PkUIComponentImpl } from '@ng/screen/PkUIComponentImpl';
import * as PIXI from 'pixi.js';
import { TEXTID, FONTID } from '../../support/types';
import { PK2Context } from '../PK2Context';

export abstract class UIText extends PkUIComponentImpl {
    protected readonly _textId: TEXTID;
    protected readonly _fontId: FONTID;
    
    
    ///  Build  ///
    
    protected constructor(context: PK2Context, textId: TEXTID | string, fontId: FONTID, x: number = 0, y: number = 0) {
        super(context, new PIXI.Container());
        
        this._textId = textId;
        this._fontId = fontId;
        
        this.x = x;
        this.y = y;
    }
    
    
    ///  Accessors  ///
    
    public get text(): string {
        return this._context.tx.get(this._textId) || this._textId;
    }
    
    public get font(): PkFont {
        return this._context.getFont(this._fontId);
    }
    
    public get width(): number {
        return this.font.charWidth * this.text.length;
    }
    
    
    ///  Contents  ///
    
    protected get container(): PIXI.Container {
        return this._drawable as PIXI.Container;
    }
}
