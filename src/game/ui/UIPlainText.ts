import { TEXTID, FONTID } from '../../support/types';
import { PK2Context } from '../PK2Context';
import { UIText } from './UIText';

export class UIPlainText extends UIText {
    
    
    ///  Build  ///
    
    public constructor(context: PK2Context, textId: TEXTID | string, fontId: FONTID, x: number = 0, y: number = 0) {
        super(context, textId, fontId, x, y);
        
        this.layout();
    }
    
    
    ///  Graphics  ///
    
    private layout(): void {
        this.font.writeText(this.text, this._drawable);
    }
}
