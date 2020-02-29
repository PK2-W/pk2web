import { PkImageTk } from '@ng/toolkit/PkImageTk';
import { PkImageImpl } from '@ng/types/pixi/PkImageImpl';
import { PkRectangleImpl } from '@ng/types/pixi/PkRectangleImpl';
import { PkImagePixels } from '@ng/types/PkImagePixels';
import { PkImageTexture } from '@ng/types/PkImageTexture';
import { PkRectangle } from '@ng/types/PkRectangle';
import * as PIXI from 'pixi.js';

export class PkImageTextureImpl implements PkImageTexture {
    private readonly _base: PkImageImpl;
    private readonly _frame: PkRectangleImpl;
    private _native: PIXI.Texture;
    private _image: HTMLImageElement;
    
    public constructor(base: PkImageImpl, frame?: PkRectangle) {
        this._base = base;
        this._frame = PkRectangleImpl.fromRectangle(frame);
    }
    
    public getPixels(): PkImagePixels {
        return PkImagePixels.fromImageData(
            PkImageTk.imageToImageData(this._base.getImage(), this._frame));
    };
    
    
    ///  PIXI Impl  ///
    
    public getPixiTexture(): PIXI.Texture {
        if (this._native == null) {
            //this._native = new PIXI.Texture(this._base.getPixiBaseTexture(), PkRectangleImpl.getPixiRectangle(this._frame));
            this._image = PkImageTk.cropImage(this._base.getImage(), this._frame);
            this._native = new PIXI.Texture(new PIXI.BaseTexture(this._image));
        }
        return this._native;
    }
}
