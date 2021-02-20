import { PkBaseTexture } from '@fwk/types/image/PkBaseTexture';
import { PkColor } from '@fwk/types/PkColor';
import { PkRectangle } from '@fwk/types/PkRectangle';
import { PkTexture } from '@fwk/types/PkTexture';
import * as PIXI from 'pixi.js';

export class PkImageBitmapBT implements PkBaseTexture {
    /**
     * Internal PIXI BT.
     */
    private _pixiBT: PIXI.BaseTexture;
    
    
    ///  Factory  ///
    
    // public static fromImage(image: HTMLImageElement): PkImageBitmapBT {
    //     const obj = new PkImageBitmapBT();
    //     obj._image = image;
    //     return obj;
    // }
    
    public static fromImageBitmap(imageBitmap: ImageBitmap): PkImageBitmapBT {
        const obj = new PkImageBitmapBT();
        obj._pixiBT = PIXI.BaseTexture.from(imageBitmap);
        return obj;
    }
    
    private constructor() {}
    
    public clone(): PkImageBitmapBT {}
    
    ///
    
    /** @inheritDoc */
    public getTexture(frame?: PkRectangle): PkTexture<PkImageBitmapBT> {
        return new PkTexture(this, frame);
    }
    
    // public getPixels(): PkImagePixels {
    //     return PkImagePixels.fromImage(this._image);
    // }
    
    public removeTransparentPixel(color?: PkColor): this {
        //this.setImage(PkImageTk.imageRemoveTransparentPixel(this._image, color));
        return this;
    }
    
    
    ///  Accessors  ///
    
    public get width(): number {
        return this._pixiBT.width;
    }
    
    public get height(): number {
        return this._pixiBT.height;
    }
    
    
    ///  PIXI  ///
    
    public get pixi(): PIXI.BaseTexture {
        return this._pixiBT;
    }
}
