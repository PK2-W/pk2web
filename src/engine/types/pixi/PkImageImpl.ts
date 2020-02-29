import { PkImageTk } from '@ng/toolkit/PkImageTk';
import { PkImageTextureImpl } from '@ng/types/pixi/PkImageTextureImpl';
import { PkColor } from '@ng/types/PkColor';
import { PkImageTexture } from '@ng/types/PkImageTexture';
import { PkRectangle } from '@ng/types/PkRectangle';
import * as PIXI from 'pixi.js';
import { PkImage } from '../PkImage';
import { PkImagePixels } from '../PkImagePixels';

export class PkImageImpl implements PkImage {
    private _image: HTMLImageElement;
    // --- Cached ---
    private _pixi: PIXI.BaseTexture;
    
    
    ///  Factory  ///
    
    public static from(image: HTMLImageElement) {
        return new PkImageImpl(image);
    }
    
    public constructor(image: HTMLImageElement) {
        this._image = image;
    }
    
    
    ///
    
    public getImage(): HTMLImageElement {
        return this._image;
    }
    private setImage(image: HTMLImageElement): this {
        this._image = image;
        
        if (this._pixi != null)
            this._pixi.destroy();
        this._pixi = null;
        
        return this;
    }
    
    public getTexture(frame?: PkRectangle): PkImageTexture {
        return new PkImageTextureImpl(this, frame);
    }
    
    public getPixels(): PkImagePixels {
        return PkImagePixels.fromImage(this._image);
    }
    
    public removeTransparentPixel(color?: PkColor): this {
        this.setImage(PkImageTk.imageRemoveTransparentPixel(this._image, color));
        return this;
    }
    
    
    ///  Accessors  ///
    
    public get width(): number {
        return this._image.width;
    }
    
    public get height(): number {
        return this._image.height;
    }
    
    
    ///  PIXI Impl  ///
    
    public getPixiBaseTexture(): PIXI.BaseTexture {
        if (this._pixi == null) {
            this._pixi = PIXI.BaseTexture.from(this._image);
        }
        return this._pixi;
    }
}
