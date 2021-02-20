import { TextureSliceError } from '@fwk/error/TextureSliceError';
import { PkBaseTexture } from '@fwk/types/image/PkBaseTexture';
import { PkColor } from '@fwk/types/PkColor';
import { PkRectangle } from '@fwk/types/PkRectangle';
import { OutOfBoundsError } from '@sp/error/OutOfBoundsError';
import { uint } from '@sp/types';
import * as PIXI from 'pixi.js';

/** @deprecated */
export class PkTexture<T extends PkBaseTexture = PkBaseTexture> {
    private readonly _base: T;
    private readonly _frame: PkRectangle;
    private readonly _pixi: PIXI.Texture;
    
    public constructor(base: T, frame?: PIXI.Rectangle) {
        if (frame != null && (frame.right > base.width || frame.bottom > base.height)) {
            throw new TextureSliceError(frame, base.width, base.height);
        }
        
        this._base = base;
        this._frame = PkRectangle.fromRectangle(frame) ?? PkRectangle.$(0, 0, base.width, base.height);
        this._pixi = new PIXI.Texture(base.pixi, this._frame);
        
        this._frame.on(PkRectangle.EV_CHANGE, this._onFrameChanged, this);
    }
    
    // public getImage(): any {
    //     if (this._hImage == null) {
    //         this._hImage = PkImageTk.cropImage(this._image.getImage(), this._frame);
    //     }
    //     return this._hImage;
    // }
    
    // public getPixels(): PkImagePixels {
    //     return PkImagePixels.fromImageData(
    //         PkImageTk.imageToImageData(this._image.getImage(), this._frame));
    // }
    
    ///  Pixels  ///
    
    /**
     * Returns the color for the pixel in the specified position.<br>
     * If the pixel position is out of the image dimensions, an OutOfBoundsError is thrown.
     *
     * @param i - Coordinate in x-axis.
     * @param j - Coordinate in y-axis.
     */
    public getPixelColor(i: uint, j: uint): PkColor {
        // Check that the position is inside image
        if (i < 0 || j < 0 || i > this._frame.width || j > this._frame.height) {
            throw new OutOfBoundsError(`Requested pixel (${ i }, ${ j }) is out of the frame dimensions (${ this._frame.width }x${ this._frame.height }).`);
        }
        return this._base.getPixelColor(this._frame.x + i, this._frame.y + j);
    }
    
    public get frame(): PkRectangle { return this._frame; }
    public get width(): number { return this._frame.width; }
    public get height(): number { return this._frame.height; }
    
    public get base(): T {
        return this._base;
    }
    
    private _onFrameChanged() {
        this._pixi.updateUvs();
    }
    
    
    ///  PIXI Impl  ///
    
    public getPixiTexture(): PIXI.Texture {
        return this._pixi;
    }
}
