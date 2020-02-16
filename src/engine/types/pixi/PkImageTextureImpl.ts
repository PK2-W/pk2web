import { PkImageTk } from '@ng/toolkit/PkImageTk';
import { PkImageImpl } from '@ng/types/pixi/PkImageImpl';
import { PkRectangleImpl } from '@ng/types/pixi/PkRectangleImpl';
import { PkImagePixels } from '@ng/types/PkImagePixels';
import * as PIXI from 'pixi.js';

export class PkImageTextureImpl {
    private readonly _base: PkImageImpl;
    private readonly _frame: PkRectangleImpl;
    private _native: PIXI.Texture;
    
    public constructor(base: PkImageImpl, frame?: PkRectangleImpl) {
        this._base = base;
        this._frame = frame;
    }
    
    public getPixels(): PkImagePixels {
        return new PkImagePixels(
            PkImageTk.imageToImageData(this._base.getImage(), this._frame));
    };
    
    
    ///  PIXI Impl  ///
    
    public getPixiTexture(): PIXI.Texture {
        if (this._native == null) {
            this._native = new PIXI.Texture(this._base.getPixiBaseTexture(), PkRectangleImpl.getPixiRectangle(this._frame));
        }
        return this._native;
    }
}
