import { PkError } from '@ng/error/PkError';
import { Log } from '@ng/support/log/LoggerImpl';
import { ifnul } from '@ng/support/utils';
import { PkBaseTexture } from '@ng/types/image/PkBaseTexture';
import { PkBinary } from '@ng/types/PkBinary';
import { PkColor } from '@ng/types/PkColor';
import { PkTexture } from '@ng/types/PkTexture';
import { OutOfBoundsError } from '@sp/error/OutOfBoundsError';
import { uint32, uint, uint16, uint8 } from '@sp/types';
import * as PIXI from 'pixi.js';

export class PkBitmapBT implements PkBaseTexture {
    private _dibBytes: uint32;
    private _width: uint;
    private _height: uint;
    private _bitsPerPx: uint16;
    private _paletteColors: uint32;
    private _palette: PkColor[];
    
    /**
     * Buffer with the color values or the palette index as it comes from the source.<br>
     * Values are sequential, there is no padding.<br>
     * Color ordering is [R, G, B, X].
     * @private
     */
    private _indexBuffer: PkBinary;
    /**
     * Buffer with the color value of every pixel in the format [R, G, B, A, R, G, B, A, ...].<br>
     * Origin is top-left.<br>
     * It will be updated automatically when palette is updated in 8 or less bits bitmaps.
     * @private
     */
    private _colorBuffer: PkBinary;
    
    /// Cached
    private _xPixiBT: PIXI.BaseTexture;
    
    
    ///  Factory  ///
    
    /**
     * The provided binary object is never changed.
     *
     * @param bin
     */
    public static async fromBinary(bin: PkBinary): Promise<PkBitmapBT> {
        const magic = bin.streamRead8Str(2);  // signature
        if (magic !== 'BM') {
            throw new BitmapFormatError('Target binary is not a valid BMP file.');
        }
        
        const bmp = new PkBitmapBT();
        
        bin.streamOffset += 4; // filesize
        bin.streamOffset += 4; // reserved [00 00]
        bin.streamOffset += 4; // offset
        
        bmp._dibBytes = bin.streamReadUint32(); // DIB header size
        bmp._width = bin.streamReadUint32();   // width
        bmp._height = bin.streamReadUint32();  // height
        const planes = bin.streamReadUint16();  // planes
        if (planes > 1) {
            throw new Error('Unsupported number of planes: ' + planes + '.');
        }
        bmp._bitsPerPx = bin.streamReadUint16(); // bits/px
        if ([2, 16, 32].includes(bmp._bitsPerPx)) {
            throw new Error('Unsupported number of bits per pixel: ' + bmp._bitsPerPx + '.');
        }
        
        const compression = bin.streamReadUint32();  // compression
        if (compression !== 0) {
            throw new Error('Unsupported compression "' + compression + '".');
        }
        
        bin.streamOffset += 4; // image size
        bin.streamOffset += 4; // x resolution (px/meter)
        bin.streamOffset += 4; // y resolution (px/meter)
        bmp._paletteColors = bin.streamReadUint32(); // number of colors in palette
        bin.streamReadUint32(); // important colors
        
        // Skip the remaining DIB header
        if (bmp._dibBytes < 40) {
            throw new BitmapFormatError(`The DIB header is smaller than expected (${ bmp._dibBytes } < 40).`);
        }
        bin.streamOffset += bmp._dibBytes - 40;
        
        // Read palette
        let paletteLen;
        if (bmp._bitsPerPx <= 8) {
            paletteLen = bmp._paletteColors === 0 ? 1 << bmp._bitsPerPx : bmp._paletteColors;
        } else {
            paletteLen = bmp._paletteColors;
        }
        bmp._palette = new Array(paletteLen);
        
        for (let i = 0; i < paletteLen; i++) {
            bmp._palette[i] = PkColor.bgr(
                bin.streamReadUint8(),   // blue
                bin.streamReadUint8(),   // green
                bin.streamReadUint8());  // red
            bin.streamOffset++;          // must be zero
        }
        
        // Get image
        //bmp.setImage(await PkImageTk.binaryToImage(bin));
        //bmp.removeTransparentPixel();
        
        // Experimental: Editable BITMAPS!! :)
        bmp._colorBuffer = new PkBinary(bmp._width * bmp._height * 4);
        bmp._indexBuffer = new PkBinary(bmp._width * bmp._height);
        
        if (bmp.usesPalette()) {
            for (let j = bmp._height - 1; j >= 0; j--) {
                for (let i = 0; i < bmp._width; i++) {
                    // Get palette index and save to raw buffer
                    const index = bin.readUint8(bin.streamOffset + j * bmp._width + i);
                    bmp._indexBuffer.streamWriteUint8(index);
                    
                    // Obtain color an save to color buffer
                    bmp._colorBuffer.streamWriteUint8(bmp.getPaletteColor(index).r);
                    bmp._colorBuffer.streamWriteUint8(bmp.getPaletteColor(index).g);
                    bmp._colorBuffer.streamWriteUint8(bmp.getPaletteColor(index).b);
                    bmp._colorBuffer.streamWriteUint8(255);
                }
            }
        } else {
            let row = Math.ceil(bmp._bitsPerPx * bmp._width / 32) * 4;
            
            for (let j = bmp._height - 1; j >= 0; j--) {
                for (let i = 0; i < bmp._width; i++) {
                    let b: uint, g: uint, r: uint;
                    
                    // 16 bit per px (b8, g8, r8, x8)
                    // Unsuppoted
                    
                    // 24 bit per px (b8, g8, r8)
                    b = bin.readUint8(bin.streamOffset + j + row + i);
                    g = bin.readUint8(bin.streamOffset + j + row + i + 1);
                    r = bin.readUint8(bin.streamOffset + j + row + i + 2);
                    
                    // 32 bit per px (b8, g8, r8, x8)
                    // Unsuppoted
                    
                    // Save to raw buffer
                    bmp._indexBuffer
                        .streamWriteUint8(r)
                        .streamWriteUint8(g)
                        .streamWriteUint8(b)
                        .streamWriteUint8(255);
                    // Save to color buffer
                    bmp._colorBuffer
                        .streamWriteUint8(r)
                        .streamWriteUint8(g)
                        .streamWriteUint8(b)
                        .streamWriteUint8(255);
                }
            }
        }
        
        bmp._xPixiBT = PIXI.BaseTexture.fromBuffer(bmp._colorBuffer.getUint8Array(), bmp._width, bmp._height);
        
        return bmp;
    }
    
    private constructor() {}
    
    public clone(): PkBitmapBT {
        const bmp = new PkBitmapBT();
        
        bmp._dibBytes = this._dibBytes;
        bmp._width = this._width;
        bmp._height = this._height;
        bmp._bitsPerPx = this._bitsPerPx;
        bmp._paletteColors = this._paletteColors;
        bmp._palette = this._palette.map(color => color.clone());
        bmp._indexBuffer = this._indexBuffer.clone();
        bmp._colorBuffer = this._colorBuffer.clone();
        
        return bmp;
    }
    
    public getTexture(frame?: PIXI.Rectangle): PkTexture<PkBitmapBT> {
        return new PkTexture(this, frame);
    }
    
    
    ///  Accessors  ///
    
    public get width(): number {
        return this._width;
    }
    
    public get height(): number {
        return this._height;
    }
    
    /**
     * Returns the bits-per-pixel property of this bitmap.
     */
    public get bits(): number {
        return this._bitsPerPx;
    }
    
    
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
        if (i < 0 || j < 0 || i > this._width || j > this._height) {
            throw new OutOfBoundsError(`Requested pixel (${ i }, ${ j }) is out of the bitmap dimensions (${ this._width }x${ this._height }).`);
        }
        
        const w4 = this._width * 4;
        return PkColor.rgba(
            this._colorBuffer.readUint8(j * w4 + i * 4),
            this._colorBuffer.readUint8(j * w4 + i * 4 + 1),
            this._colorBuffer.readUint8(j * w4 + i * 4 + 2),
            this._colorBuffer.readUint8(j * w4 + i * 4 + 3));
    }
    
    /**
     * Sets the color for the pixel in the specified position.<br>
     * If the pixel position is out of the image dimensions, an OutOfBoundsError is thrown.
     * If the bitmap is using palette it's not possible assign color to individual pixels, so an BitmapFormatError is thrown.
     *
     * @param i - Coordinate in x-axis.
     * @param j - Coordinate in y-axis.
     * @param color - Color to be set.
     */
    public setPixelColor(i: uint, j: uint, color: PkColor): this {
        // Check that the position is inside image
        if (i < 0 || j < 0 || i > this._width || j > this._height) {
            throw new OutOfBoundsError(`Requested pixel (${ i }, ${ j }) is out of the bitmap dimensions (${ this._width }x${ this._height }).`);
        }
        // Ensure this bitmap is not indexed
        if (this.usesPalette()) {
            throw new BitmapFormatError('Cannot set color for an individual pixel if the bitmap uses palette.');
        }
        
        // Update color buffer
        this._colorBuffer.writeUint8((j * this.width + i) * 4, color.r);
        this._colorBuffer.writeUint8((j * this.width + i) * 4 + 1, color.g);
        this._colorBuffer.writeUint8((j * this.width + i) * 4 + 2, color.b);
        
        return this;
    }
    
    /**
     * Returns the palette index which the pixel points to.<br>
     * If the pixel position is out of the image dimensions, an OutOfBoundsError is thrown.
     * If the bitmap is not using palette, an BitmapFormatError is thrown.
     *
     * @param i - Coordinate in x-axis.
     * @param j - Coordinate in y-axis.
     */
    public getPixelIndex(i: uint, j: uint): uint8 {
        // Check that the position is inside image
        if (i < 0 || j < 0 || i > this._width || j > this._height) {
            throw new OutOfBoundsError(`Requested pixel (${ i }, ${ j }) is out of the bitmap dimensions (${ this._width }x${ this._height }).`);
        }
        // Ensure this bitmap is indexed
        if (!this.usesPalette()) {
            throw new BitmapFormatError('Cannot get a palette index beacuse this bitmap doesn\'t use palette (non-indexed).');
        }
        
        return this._indexBuffer.readUint8(j * this._width + i);
    }
    
    /**
     * Sets the palette index for the pixel in the specified position.<br>
     * If the pixel position is out of the image dimensions, an OutOfBoundsError is thrown.
     * If the bitmap is not using palette, an BitmapFormatError is thrown.
     * If the specified index is out of the palette range, an OutOfBoundsError is thrown.
     *
     * @param i - Coordinate in x-axis.
     * @param j - Coordinate in y-axis.
     * @param index - Color to be set.
     */
    public setPixelIndex(i: uint, j: uint, index: uint8): this {
        // Check that the position is inside image
        if (i < 0 || j < 0 || i > this._width || j > this._height) {
            throw new OutOfBoundsError(`Requested pixel (${ i }, ${ j }) is out of the bitmap dimensions (${ this._width }x${ this._height }).`);
        }
        // Ensure this bitmap is indexed
        if (!this.usesPalette()) {
            throw new BitmapFormatError('Cannot get a palette index beacuse this bitmap doesn\'t use palette (non-indexed).');
        }
        // Check index format
        if (index < 0 || index >= this.paletteSize) {
            throw new OutOfBoundsError(`The specified palette index (${ index }) is out of the palette range (${ this._bitsPerPx }bits [0-${ this.paletteSize }]).`);
        }
        
        // Update the index buffer
        this._indexBuffer.writeUint8(j * this.width + i, index);
        
        // Update color buffer
        const pcolor = this.getPaletteColor(index);
        this._colorBuffer.writeUint8((j * this.width + i) * 4, pcolor.r);
        this._colorBuffer.writeUint8((j * this.width + i) * 4 + 1, pcolor.g);
        this._colorBuffer.writeUint8((j * this.width + i) * 4 + 2, pcolor.b);
        
        return this;
    }
    
    /**
     * Turns transparent each occurrence of a particular color.<br>
     * If a color is provided, the modification will be applied to each the pixel using that color.<br>
     * If no color is provided and bitmap uses palette, last palette color is assumed.<br>
     * In any other case, no changes are made and a log message is emitted.
     *
     * @param color - The color to make transparent.
     */
    public makeColorTransparent(color?: PkColor): this {
        // If no color provided, use the last palette color if any
        if (color == null && this.usesPalette()) {
            color = this.getLastColor();
        }
        
        // If no color provided and no palette, do nothing
        if (color == null) {
            Log.d(`[${ this.constructor.name }] `, 'Call to make pixel transparent, but no color provided and the bitmap have no palette.');
            return;
        }
        
        // Set alpha to 0 when color matches
        for (let i = 0; i < this._width * this._height * 4; i += 4) {
            if (color.r === this._colorBuffer.readUint8(i) &&
                color.g === this._colorBuffer.readUint8(i + 1) &&
                color.b === this._colorBuffer.readUint8(i + 2)) {
                
                this._colorBuffer.writeUint8(i + 3, 0);
            }
        }
        
        return this;
    }
    
    // public resetTransparentColors(color?: PkColor): this {
    //     // If no color provided, use the last palette color if any
    //     // color = color ?? this.getLastColor();
    //
    //     // if (color != null) {
    //     //     this.setImage(PkImageTk.imageRemoveTransparentPixel(this.getImage(), color));
    //     // }
    //     return this;
    // }
    
    
    ///  Palette  ///
    
    /**
     * Number of colors in the palette.
     */
    public get paletteSize(): number {
        return this._palette.length;
    }
    
    /**
     * Determines if the bitmap uses a palette, or instead directly lists the colors.
     */
    public usesPalette() {
        return this._bitsPerPx <= 8;
    }
    
    /**
     * Returns the color of the bitmap's palette in the specified position.
     *
     * @param index - Index of the desired color in the bitmap's palette.
     */
    public getPaletteColor(index: uint8): PkColor {
        return ifnul(this._palette[index]);
    }
    
    /**
     * Returns the last color in the bitmap's palette.<br>
     * Equivalent to getColor(paletteSize - 1).
     */
    public getLastColor(): PkColor {
        return this.getPaletteColor(this.paletteSize - 1);
    }
    
    
    ///  PIXI  ///
    
    public get pixi(): PIXI.BaseTexture {
        if (this._xPixiBT == null) {
            this._xPixiBT = PIXI.BaseTexture.fromBuffer(this._colorBuffer.getUint8Array(), this.width, this.height);
        }
        return this._xPixiBT;
    }
}

export class BitmapFormatError extends PkError {
}