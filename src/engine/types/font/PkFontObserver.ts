import { PkFont } from '@ng/types/font/PkFont';
import { PkFontInterface } from '@ng/types/font/PkFontInterface';
import * as EventEmitter from 'eventemitter3';

export class PkFontObserver extends EventEmitter implements PkFontInterface {
    public static readonly EV_FONT_CHANGED = 'changed.font.pk.ev';
    
    private _font: PkFont;
    
    public update(font: PkFont): void {
        this._font = font;
        this.emit(PkFontObserver.EV_FONT_CHANGED);
    }
    
    /** @inheritDoc */
    public get charWidth(): number {
        return this._font.charWidth;
    }
    
    /** @inheritDoc */
    public writeText(text: string, target?: PIXI.Container): PIXI.Container {
        return this._font.writeText(text, target);
    }
}