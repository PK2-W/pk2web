import { DwContainer } from '@fwk/drawable/dw/DwContainer';
import { PkFont } from '@fwk/types/font/PkFont';
import { PkFontAsset } from '@fwk/types/font/PkFontAsset';
import * as EventEmitter from 'eventemitter3';

export class PkFontHolder extends EventEmitter implements PkFont {
    public static readonly EV_FONT_CHANGED = 'changed.font.pk.ev';
    
    private readonly _name: string;
    private _font: PkFontAsset;
    
    public constructor(name: string) {
        super();
        
        this._name = name;
    }
    
    public update(font: PkFontAsset): void {
        this._font = font;
        this.emit(PkFontHolder.EV_FONT_CHANGED);
    }
    
    /** @inheritDoc */
    public get charWidth(): number {
        this._fontRequired();
        return this._font.charWidth;
    }
    
    /** @inheritDoc */
    public writeText(text: string, target?: DwContainer, x?: number, y?: number): DwContainer {
        this._fontRequired();
        return this._font.writeText(text, target, x, y);
    }
    
    /**
     * Check if this holder has a font associated, else, it throws an exception.
     *
     * @private
     */
    private _fontRequired() {
        if (this._font == null) {
            throw new Error(`Font holder "${ this._name }" doesn't have a font associated.`);
        }
    }
}