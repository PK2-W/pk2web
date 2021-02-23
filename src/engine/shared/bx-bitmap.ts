import { uint, uint16, uint32, uint8 } from '@fwk/shared/bx-ctypes';
import { Log } from '@fwk/support/log/LoggerImpl';
import { BitmapPalette } from '@fwk/shared/bx-bitmap-palette';
import { BitmapFormatError } from '@fwk/types/image/PkBitmapBT';
import { PkBinary } from '@fwk/types/PkBinary';
import { PkColor } from '@fwk/types/PkColor';
import { PkRectangle } from '@fwk/types/PkRectangle';
import { OutOfBoundsError } from '@sp/error/OutOfBoundsError';
import { EventEmitter } from 'eventemitter3';

export class Bitmap extends EventEmitter {
    /**
     * Final representacion as a [RGBA...] binary buffer.
     */
    private _imageBuffer: PkBinary;
    
    private _width: uint;
    private _height: uint;
    private _bitsPerPx: uint16;
    private _paletteColors: uint32;
    
    private _initialPalette: BitmapPalette;
    private _palette: BitmapPalette;
    /**
     * If the bitmap has palette, matrix of the color indexes in the palette.
     */
    private _colorMap: PkBinary;
    
    
    /**
     * The provided binary object is never changed.
     *
     * @param bin
     */
    public static fromBinary(bin: PkBinary): Bitmap {
        if (bin == null) {
            return null;
        }
        
        // Check format before any other thing
        const magic = bin.streamRead8Str(2);  // bmp::signature
        if (magic !== 'BM') {
            throw new BitmapFormatError('Target binary is not a valid BMP file.');
        }
        
        bin.streamOffset += 4; // filesize
        bin.streamOffset += 4; // reserved [00 00]
        bin.streamOffset += 4; // offset
        
        const dibBytes = bin.streamReadUint32();  // DIB header size
        if (dibBytes < 40) {
            throw new BitmapFormatError(`The DIB header is smaller than expected (${ dibBytes } < 40).`);
        }
        
        const width = bin.streamReadUint32();   // width
        const height = bin.streamReadUint32();  // height
        const bmp = new Bitmap(width, height);
        
        const planes = bin.streamReadUint16();  // planes
        if (planes > 1) {
            throw new Error('Unsupported number of planes: ' + planes + '.');
        }
        
        bmp._bitsPerPx = bin.streamReadUint16();  // bits/px
        if ([2, 16, 32].includes(bmp._bitsPerPx)) {
            throw new Error('Unsupported number of bits per pixel: ' + bmp._bitsPerPx + '.');
        }
        
        const compression = bin.streamReadUint32();  // compression
        if (compression !== 0) {
            throw new Error('Unsupported compression "' + compression + '".');
        }
        
        bin.streamOffset += 4;  // image size
        bin.streamOffset += 4;  // x resolution (px/meter)
        bin.streamOffset += 4;  // y resolution (px/meter)
        bmp._paletteColors = bin.streamReadUint32();  // number of colors in palette
        bin.streamReadUint32();  // important colors
        
        // Skip the remaining DIB header
        bin.streamOffset += dibBytes - 40;
        
        // PALETTE
        // Calculate palette size or take given value
        let paletteLen;
        if (bmp._bitsPerPx <= 8) {
            paletteLen = bmp._paletteColors === 0 ? 1 << bmp._bitsPerPx : bmp._paletteColors;
        } else {
            paletteLen = bmp._paletteColors;
        }
        // If final size > 0 -> instance new palette and fill
        if (paletteLen > 0) {
            bmp._initialPalette = new BitmapPalette(paletteLen);
            bmp._palette = bmp._initialPalette;
            for (let i = 0; i < paletteLen; i++) {
                bmp._palette.set(i, PkColor.bgr(
                    bin.streamReadUint8(),  // blue
                    bin.streamReadUint8(),  // green
                    bin.streamReadUint8())  // red
                );
                bin.streamOffset++;         // must be zero
            }
            bmp._palette.on(BitmapPalette.EV_CHANGE, bmp._onPaletteChange, bmp);
        }
        
        // Prepare image buffer
        bmp._imageBuffer = new PkBinary(bmp._width * bmp._height * 4);
        
        // If palette is applicable, fill color map
        if (bmp.usesPalette()) {
            let colorIdx: uint8,
                color: PkColor;
            
            bmp._colorMap = new PkBinary(bmp._width * bmp._height);
            
            for (let j = bmp._height - 1; j >= 0; j--) {
                for (let i = 0; i < bmp._width; i++) {
                    // Get palette index and save to raw buffer
                    colorIdx = bin.readUint8(bin.streamOffset + j * bmp._width + i);
                    bmp._colorMap.streamWriteUint8(colorIdx);
                    
                    // Obtain color an save to image buffer
                    color = bmp.palette.get(colorIdx);
                    bmp._imageBuffer.streamWriteUint8(color.r);
                    bmp._imageBuffer.streamWriteUint8(color.g);
                    bmp._imageBuffer.streamWriteUint8(color.b);
                    bmp._imageBuffer.streamWriteUint8(color.a255);
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
                    
                    // Save to color buffer
                    bmp._imageBuffer
                        .streamWriteUint8(r)
                        .streamWriteUint8(g)
                        .streamWriteUint8(b)
                        .streamWriteUint8(255);
                }
            }
        }
        
        //bmp._xPixiBT = PIXI.BaseTexture.fromBuffer(bmp._colorBuffer.getUint8Array(), bmp._width, bmp._height);
        
        // Testing PisteDraw2_RotatePalette => NOT SUPPORTED
        // setInterval(() => {
        //     const temp_color = bmp.getPaletteColor(239);
        //
        //     for (let i = 239; i > 224; i--)
        //         bmp.setPaletteColor(i, bmp.getPaletteColor(i - 1));
        //
        //     bmp.setPaletteColor(224, temp_color);
        //
        //     if (bmp._xPixiBT != null)
        //         bmp._xPixiBT.update();
        // }, 1000);
        
        return bmp;
    }
    
    public static fromBitmap(src: Bitmap, frame?: PkRectangle): Bitmap {
        //  if (frame.co)
        
        if (frame == null) {
            frame = PkRectangle.$(0, 0, src._width, src._height);
        }
        
        const dst = new Bitmap(frame.width, frame.height);
        
        dst._bitsPerPx = src._bitsPerPx;
        dst._paletteColors = src._paletteColors;
        
        dst._initialPalette = src._palette;
        dst._palette = src._palette;
        dst._palette.on(BitmapPalette.EV_CHANGE, dst._onPaletteChange, dst);
        
        dst._colorMap = new PkBinary(dst._width * dst._height);
        
        let index: uint8,
            color: PkColor;
        for (let j = frame.y1; j < frame.y2; j++) {
            for (let i = frame.x1; i < frame.x2; i++) {
                // Get palette index and save to raw buffer
                index = src.getPixelIndex(i, j);
                dst._colorMap.streamWriteUint8(index);
                
                // Update the buffer
                color = index === 255
                    ? PkColor.TRANSPARENT
                    : dst.palette.get(index);
                dst._imageBuffer.streamWriteUint8(color.r);
                dst._imageBuffer.streamWriteUint8(color.g);
                dst._imageBuffer.streamWriteUint8(color.b);
                dst._imageBuffer.streamWriteUint8(color.a255);
            }
        }
        
        return dst;
    }
    
    
    public constructor(width: number, height: number) {
        super();
        
        this._width = width;
        this._height = height;
        
        this._imageBuffer = new PkBinary(width * height * 4);
    }
    
    
    ///  Palette  ///
    
    /**
     *
     * @param palette
     */
    public setPalette(palette: BitmapPalette): void {
        if (palette.size < this._paletteColors) {
            throw new Error(`[Bitmap] Number of colors in replacement palette is lower than the required by the bitmap (${ this._paletteColors }).`);
        }
        if (palette.size > this._paletteColors) {
            Log.w(`[Bitmap] Number of colors in replacement palette is greater than the used by the bitmap (${ this._paletteColors }).`);
        }
        
        this._palette = palette;
        this._palette.on(BitmapPalette.EV_CHANGE, this._onPaletteChange, this);
        
        let colorIdx: uint8,
            color: PkColor;
        for (let j = 0; j < this._height; j++) {
            for (let i = 0; i < this._width; i++) {
                // Get palette index
                colorIdx = this.getPixelIndex(i, j);
                
                // Update the buffer
                color = colorIdx === 255
                    ? PkColor.TRANSPARENT
                    : this.palette.get(colorIdx);
                
                this._imageBuffer.writeUint8(j * this._width * 4 + i * 4, color.r);
                this._imageBuffer.writeUint8(j * this._width * 4 + i * 4 + 1, color.g);
                this._imageBuffer.writeUint8(j * this._width * 4 + i * 4 + 2, color.b);
                this._imageBuffer.writeUint8(j * this._width * 4 + i * 4 + 3, color.a255);
            }
        }
        
        this.emit(Bitmap.EV_CHANGE);
    }
    
    private _onPaletteChange(index: uint8, color: PkColor) {
        let colorIdx: uint8;
        
        for (let j = 0; j < this._height; j++) {
            for (let i = 0; i < this._width; i++) {
                // Get palette index
                colorIdx = this.getPixelIndex(i, j);
                
                if (colorIdx === index) {
                    this._imageBuffer.writeUint8(j * this._width * 4 + i * 4, color.r);
                    this._imageBuffer.writeUint8(j * this._width * 4 + i * 4 + 1, color.g);
                    this._imageBuffer.writeUint8(j * this._width * 4 + i * 4 + 2, color.b);
                    this._imageBuffer.writeUint8(j * this._width * 4 + i * 4 + 3, color.a255);
                }
            }
        }
        
        this.emit(Bitmap.EV_CHANGE);
    }
    
    /**
     * Number of colors in the palette.
     */
    public get palette(): BitmapPalette {
        return this._palette;
    }
    
    /**
     * Determines if the bitmap uses a palette, or instead directly lists the colors.
     */
    public usesPalette() {
        return this._palette != null;
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
        
        return this._colorMap.readUint8(j * this._width + i);
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
        if (index < 0 || index >= this._paletteColors) {
            throw new OutOfBoundsError(`The specified palette index (${ index }) is out of the palette range (${ this._bitsPerPx }bits [0-${ this.palette.size }]).`);
        }
        
        // Update the index buffer
        this._colorMap.writeUint8(j * this.width + i, index);
        
        // Update color buffer
        const pcolor = this.palette.get(index);
        this._imageBuffer.writeUint8((j * this.width + i) * 4, pcolor.r);
        this._imageBuffer.writeUint8((j * this.width + i) * 4 + 1, pcolor.g);
        this._imageBuffer.writeUint8((j * this.width + i) * 4 + 2, pcolor.b);
        this._imageBuffer.writeUint8((j * this.width + i) * 4 + 3, pcolor.a255);
        
        return this;
    }
    
    // /**
    //  * Returns the color of the bitmap's palette in the specified position.
    //  *
    //  * @param index - Index of the desired color in the bitmap's palette.
    //  */
    // public setPaletteColor(index: uint8, color: PkColor): void {
    //     this._palette[index] = color.clone();
    //
    //     for (let j = 0; j < this._height; j++) {
    //         for (let i = 0; i < this._width; i++) {
    //             if (this._indexBuffer.readUint8(j * this._width + i) === index) {
    //                 // Obtain color an save to color buffer
    //                 this._colorBuffer.writeUint8((j * this._width + i) * 4, color.r);
    //                 this._colorBuffer.writeUint8((j * this._width + i) * 4, color.g);
    //                 this._colorBuffer.writeUint8((j * this._width + i) * 4, color.b);
    //                 this._colorBuffer.writeUint8((j * this._width + i) * 4, this.isColorTransparent(color) ? 0 : 255);
    //             }
    //         }
    //     }
    // }
    
    public crop(frame: PkRectangle): Bitmap {
        return Bitmap.fromBitmap(this, frame);
    }
    
    public clone() {
        return Bitmap.fromBitmap(this);
    }
    
    private updateBuffer(): void {
        
        
        // for (let j = 0; j < dst._height; j++) {
        //     for (let i = 0; i < dst._width; i++) {
        //         dst._colorMap.streamWriteUint8(src.getPixelIndex(i, j));
        //
        //         // src.// Obtain color an save to image buffer
        //         //     color = bmp.palette.get(index);
        //         // bmp._imageBuffer.streamWriteUint8(color.r);
        //         // bmp._imageBuffer.streamWriteUint8(color.g);
        //         // bmp._imageBuffer.streamWriteUint8(color.b);
        //         // bmp._imageBuffer.streamWriteUint8(255);
        //     }
        // }
        //
        // for (let j = bmp._height - 1; j >= 0; j--) {
        //     for (let i = 0; i < bmp._width; i++) {
        //         // Get palette index and save to raw buffer
        //         index = bin.readUint8(bin.streamOffset + j * bmp._width + i);
        //         bmp._colorMap.streamWriteUint8(index);
        //
        //         // Obtain color an save to image buffer
        //         color = bmp.palette.get(index);
        //         bmp._imageBuffer.streamWriteUint8(color.r);
        //         bmp._imageBuffer.streamWriteUint8(color.g);
        //         bmp._imageBuffer.streamWriteUint8(color.b);
        //         bmp._imageBuffer.streamWriteUint8(255);
        //     }
        // }
    }
    
    public get width(): number {
        return this._width;
    }
    
    public get height(): number {
        return this._height;
    }
    
    public get buffer(): PkBinary {
        return this._imageBuffer;
    }
    
    
    ///  Events  ///
    
    public static readonly EV_CHANGE = Symbol('change.bitmap.ev');
}