import { PkFont } from '@ng/types/font/PkFont';
import { PK2Context } from '../../PK2Context';
import { TTextId } from '../../support/types';
import { UIText } from './UIText';

export class UIPlainText extends UIText {
    
    
    ///  Build  ///
    
    public constructor(context: PK2Context, textId: TTextId | string, fontId: PkFont, x: number = 0, y: number = 0) {
        super(context, textId, fontId, x, y);
        
        this.arrange();
    }
    
    
    ///  Graphics  ///
    
    private arrange(): void {
        this._font.writeText(this.text, this._drawable);
    }
}
