import { PkImageTk } from '@ng/toolkit/PkImageTk';
import { PkImageImpl } from '@ng/types/pixi/PkImageImpl';
import { PkRectangleImpl } from '@ng/types/pixi/PkRectangleImpl';
import { PkImagePixels } from '@ng/types/PkImagePixels';
import { PkImageTexture } from '@ng/types/PkImageTexture';
import { PkRectangle } from '@ng/types/PkRectangle';
import * as PIXI from 'pixi.js';

export class PkImageTextureImpl implements PkImageTexture {
    private readonly _base: PkImageImpl;
    private _frame: PkRectangleImpl;
    private _pixi: PIXI.Texture;
    private _image: HTMLImageElement;
    
    public constructor(base: PkImageImpl, frame?: PkRectangle) {
        this._base = base;
        this._frame = PkRectangleImpl.fromRectangle(frame) ?? PkRectangleImpl.$(0, 0, base.width, base.height);
        this._frame.on(PkRectangle.EV_CHANGE, this._onFrameChanged, this);
        
        this._pixi = new PIXI.Texture(this._base.getPixiBaseTexture(), this._frame.getNative());
    }
    
    public getImage(): any {
        if (this._image == null) {
            this._image = PkImageTk.cropImage(this._base.getImage(), this._frame);
        }
        return this._image;
    }
    
    public getPixels(): PkImagePixels {
        return PkImagePixels.fromImageData(
            PkImageTk.imageToImageData(this._base.getImage(), this._frame));
    }
    
    public get frame(): PkRectangle { return this._frame; }
    public get width(): number { return this._frame.width; }
    public get height(): number { return this._frame.height; }
    
    public changeFrame(frame: PkRectangle): void {
        if (!this._frame.equals(frame)) {
            this._frame = PkRectangleImpl.fromRectangle(frame);
            this._image = null;
            this._pixi = new PIXI.Texture(this._base.getPixiBaseTexture(), this._frame.getNative());
        }
    }
    
    private _onFrameChanged() {
        this._pixi.updateUvs();
    }
    
    
    ///  PIXI Impl  ///
    
    public getPixiTexture(): PIXI.Texture {
        return this._pixi;
    }
    
    public static getImplNative(genImpl: PkImageTexture): PIXI.Texture {
        if (!(genImpl instanceof PkImageTextureImpl))
            throw new Error(`Conversion from ${ genImpl.constructor.name } to ${ this.constructor.name } not implemented.`);
        
        return genImpl.getPixiTexture();
    }
}
