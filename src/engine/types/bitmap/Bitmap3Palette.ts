import { uint8 } from '@fwk/shared/bx-ctypes';
import { ifnul } from '@fwk/support/utils';
import { PkColor } from '@fwk/types/PkColor';
import { EventEmitter } from 'eventemitter3';

export class Bitmap3Palette extends EventEmitter {
    private _colorMap: PkColor[];
    private _size: uint8;
    
    public constructor(size: uint8 = 256) {
        super();
        
        this._colorMap = new Array(size);
        this._size = size;
    }
    
    /**
     * Returns a copy of the specified instance.
     */
    public static clone(palette: Bitmap3Palette): Bitmap3Palette {
        const self = new Bitmap3Palette(palette._size);
        self._colorMap = [...palette._colorMap];
        return self;
    }
    
    /**
     * Returns the size of the palette.
     */
    public get size(): uint8 {
        return this._size;
    }
    
    /**
     * Returns the color of the bitmap's palette in the specified position.
     *
     * @param index - Index of the desired color in the bitmap's palette.
     */
    public get(index: uint8): PkColor {
        return ifnul(this._colorMap[index]);
    }
    
    /**
     * Returns the color of the bitmap's palette in the specified position.
     *
     * @param index - Index of the desired color in the bitmap's palette.
     * @param color - Color to set.
     */
    public set(index: uint8, color: PkColor): void {
        this._colorMap[index] = color.clone();
        
        this.emit(Bitmap3Palette.EV_CHANGE, index, color);
    }
    
    /**
     * Returns the last color in the bitmap's palette.<br>
     * Equivalent to getColor(paletteSize - 1).
     */
    public getLastColor(): PkColor {
        return this.get(this._size - 1);
    }
    
    /**
     * Returns a copy of this palette.
     */
    public clone(): Bitmap3Palette {
        return Bitmap3Palette.clone(this);
    }
    
    
    ///  Events  ///
    
    public static readonly EV_CHANGE = Symbol('change.palette.ev');
}