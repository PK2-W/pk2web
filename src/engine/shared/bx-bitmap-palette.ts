import { uint8 } from './bx-ctypes';
import { ifnul } from '@fwk/support/utils';
import { PkColor } from '@fwk/types/PkColor';
import { EventEmitter } from 'eventemitter3';

export class BitmapPalette extends EventEmitter {
    private _colorList: PkColor[];
    private _size: uint8;
    
    public constructor(size: uint8 = 256) {
        super();
        
        this._colorList = new Array(size);
        this._size = size;
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
        return ifnul(this._colorList[index]);
    }
    
    /**
     * Returns the color of the bitmap's palette in the specified position.
     *
     * @param index - Index of the desired color in the bitmap's palette.
     * @param color - Color to set.
     */
    public set(index: uint8, color: PkColor): void {
        this._colorList[index] = color;
        
        this.emit(BitmapPalette.EV_CHANGE, index, color);
    }
    
    
    ///  Last color  ///
    
    /**
     * Returns the last color in the bitmap's palette.<br>
     * Equivalent to getColor(paletteSize - 1).
     */
    public getLastColor(): PkColor {
        return this.get(this._size - 1);
    }
    
    /**
     * Determines if the last color in the palette is set to be transparent.
     */
    public isLastColorTransparent(): boolean {
        return this.getLastColor().a255 === 0;
    }
    
    /**
     * Marks last color in palette to be transparent.
     */
    public setLastColorTransparent(transparent: boolean = true): void {
        if (this.isLastColorTransparent() !== transparent) {
            this.set(this._size - 1,
                this.getLastColor().mutate(null, null, null, transparent ? 0 : 255));
        }
    }
    
    
    ///  Events  ///
    
    /**
     * Returns a copy of this palette.
     */
    public clone(): BitmapPalette {
        const clone = new BitmapPalette(this._size);
        clone._colorList = [...this._colorList];
        return clone;
    }
    
    
    ///  Events  ///
    
    public static readonly EV_CHANGE = Symbol('change.palette.ev');
}