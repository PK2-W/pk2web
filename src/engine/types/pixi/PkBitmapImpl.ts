import { ifnul } from '@ng/support/utils';
import { PkImageTk } from '@ng/toolkit/PkImageTk';
import { PkImageImpl } from '@ng/types/pixi/PkImageImpl';
import { PkBinary } from '@ng/types/PkBinary';
import { PkBitmap } from '@ng/types/PkBitmap';
import { PkColor } from '@ng/types/PkColor';
import { PkImagePixels } from '@ng/types/PkImagePixels';
import { PkImageTexture } from '@ng/types/PkImageTexture';
import { PkRectangle } from '@ng/types/PkRectangle';
import { uint } from '../../../support/types';

export class PkBitmapImpl implements PkBitmap {
    private _palette: PkColor[];
    private _numBits: uint;
    private _numColors: uint;
    private _compression: uint;
    private _image: PkImageImpl;
    
    
    ///  Factory  ///
    
    public static async fromBinary(bin: PkBinary): Promise<PkBitmap> {
        const magic = bin.streamRead8Str(2);
        if (magic !== 'BM') {
            throw new Error('BMP: Invalid BMP file.');
        }
        
        const bmp = new PkBitmapImpl();
        
        bin.streamOffset += 4; // filesize
        bin.streamOffset += 4; // reserved [00 00]
        bin.streamOffset += 4; // offset
        
        bin.streamOffset += 4; // div header size
        bin.streamOffset += 4; // width
        bin.streamOffset += 4; // height
        bin.streamOffset += 2; // planes
        bmp._numBits = bin.streamReadUint(2); // bits/px
        
        bmp._compression = bin.streamReadUint(4);
        if (bmp._compression !== 0) {
            throw new Error('BMP: Unsupported compression "' + bmp._compression + '".');
        }
        
        bin.streamOffset += 4; // image size
        bin.streamOffset += 4; // x resolution (px/m)
        bin.streamOffset += 4; // y resolution (px/m)
        bmp._numColors = bin.streamReadUint(4);
        bin.streamReadUint(4); // important colors
        
        // Read palette
        let tableLen;
        if (bmp._numBits < 15) {
            tableLen = bmp._numColors === 0 ? 1 << bmp._numBits : bmp._numColors;
        } else {
            tableLen = bmp._numColors;
        }
        bmp._palette = new Array(tableLen);
        
        for (let i = 0; i < tableLen; i++) {
            bmp._palette[i] = PkColor.bgr(
                bin.streamReadUint(1),
                bin.streamReadUint(1),
                bin.streamReadUint(1));
            bin.streamOffset++; // must be zero
        }
        
        // Get image
        bmp.setImage(await PkImageTk.binaryToImage(bin));
        
        return bmp;
    }
    
    private constructor() { }
    
    
    ///
    
    public getImage(): HTMLImageElement {
        return this._image.getImage();
    }
    private setImage(image: HTMLImageElement): this {
        this._image = PkImageImpl.from(image);
        return this;
    }
    
    public getTexture(frame?: PkRectangle): PkImageTexture {
        return this._image.getTexture(frame);
    }
    
    public getPixels(): PkImagePixels {
        return PkImagePixels.fromImage(this._image.getImage());
    }
    
    public removeTransparentPixel(color?: PkColor): this {
        //debugger;
        if (color == null) {
            color = this.getLastColor();
            if (color != null) {
                this.setImage(PkImageTk.imageRemoveTransparentPixel(this._image.getImage(), this.getLastColor()));
            }
        } else {
            this.setImage(PkImageTk.imageRemoveTransparentPixel(this._image.getImage(), color));
        }
        return this;
    }
    
    public getColor(index: uint): PkColor {
        return ifnul(this._palette[index]);
    }
    
    public getLastColor(): PkColor {
        return this.getColor(this.paletteSize - 1);
    }
    
    
    ///  Accessors  ///
    
    public get width(): uint {
        return this._image.width;
    }
    
    public get height(): uint {
        return this._image.height;
    }
    
    public get bits(): uint {
        return this._numBits;
    }
    
    public get paletteSize(): uint {
        return this._palette.length;
    }
}
