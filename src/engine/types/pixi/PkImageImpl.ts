import { PkImageTk } from '@ng/toolkit/PkImageTk';
import { PkImageTextureImpl } from '@ng/types/pixi/PkImageTextureImpl';
import { PkColor } from '@ng/types/PkColor';
import { PkImage } from '@ng/types/PkImage';
import { PkImagePixels } from '@ng/types/PkImagePixels';
import { PkImageTexture } from '@ng/types/PkImageTexture';
import { PkRectangle } from '@ng/types/PkRectangle';
import * as PIXI from 'pixi.js';

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
    
    /** @inheritDoc */
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
    
    /** @inheritDoc */
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
    
    public static getImplNative(genImpl: PkImage): PIXI.BaseTexture {
        if (!(genImpl instanceof PkImageImpl)) {
            throw new Error(`Conversion from ${genImpl.constructor.name} to ${this.constructor.name} not implemented.`);
        }
        return (genImpl as PkImageImpl).getPixiBaseTexture();
    }
}
