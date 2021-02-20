import { uint8 } from '@fwk/shared/bx-ctypes';
import { ifnul } from '@fwk/support/utils';
import { PkBinary } from '@fwk/types/PkBinary';
import { PkColor } from '@fwk/types/PkColor';
import { EventEmitter } from 'eventemitter3';

export class Bitmap3Palette extends EventEmitter {
    private readonly _palette: PkBinary;
    private _size: uint8;
    
    public constructor(initialSize: uint8 = 256) {
        super();
        
        this._palette = new PkBinary(256);
        this._size = initialSize;
    }
    
    public fillFromStream(binary: PkBinary): void {
        for (let i = 0; i < this._size; i++) {
            this._palette[i] = PkColor.bgr(
                binary.streamReadUint8(),   // blue
                binary.streamReadUint8(),   // green
                binary.streamReadUint8());  // red
            binary.streamOffset++;          // must be zero
        }
    }
    
    /**
     * Returns the color of the bitmap's palette in the specified position.
     *
     * @param index - Index of the desired color in the bitmap's palette.
     */
    public get(index: uint8): PkColor {
        return ifnul(this._palette[index]);
    }
    
    /**
     * Returns the color of the bitmap's palette in the specified position.
     *
     * @param index - Index of the desired color in the bitmap's palette.
     * @param color - Color to set.
     */
    public set(index: uint8, color: PkColor): void {
        this._palette[index] = color.clone();
    }
    
    /**
     * Returns the last color in the bitmap's palette.<br>
     * Equivalent to getColor(paletteSize - 1).
     */
    public getLastColor(): PkColor {
        return this.get(this._size - 1);
    }
    
    
}