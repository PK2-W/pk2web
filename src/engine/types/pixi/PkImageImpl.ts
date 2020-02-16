import { PkImageTk } from '@ng/toolkit/PkImageTk';
import { PkImageTextureImpl } from '@ng/types/pixi/PkImageTextureImpl';
import { PkRectangleImpl } from '@ng/types/pixi/PkRectangleImpl';
import { PkColor } from '@ng/types/PkColor';
import { PkImageTexture } from '@ng/types/PkImageTexture';
import * as PIXI from 'pixi.js';
import { PkImage } from '../PkImage';
import { PkImagePixels } from '../PkImagePixels';

export class PkImageImpl implements PkImage {
    private _image: HTMLImageElement;
    private _native: PIXI.BaseTexture;
    
    public static from(image: HTMLImageElement) {
        return new PkImageImpl(image);
    }
    
    public constructor(image: HTMLImageElement) {
        this._image = image;
    }
    
    public getImage(): HTMLImageElement {
        return this._image;
    }
    public setImage(image: HTMLImageElement): this {
        this._image = image;
        
        if (this._native != null)
            this._native.destroy();
        this._native = null;
        
        return this;
    }
    
    public getTexture(frame?: PkRectangleImpl): PkImageTexture {
        return new PkImageTextureImpl(this, frame);
    }
    
    public getPixels(): PkImagePixels {
        return new PkImagePixels(this._image);
    }
    
    public removeTransparentPixel(color?: PkColor): this {
        this.setImage(PkImageTk.imageRemoveTransparentPixel(this._image, color));
        return this;
    }
    
    
    ///  PIXI Impl  ///
    
    public getPixiBaseTexture(): PIXI.BaseTexture {
        if (this._native == null) {
            this._native = PIXI.BaseTexture.from(this._image);
        }
        return this._native;
    }
}
