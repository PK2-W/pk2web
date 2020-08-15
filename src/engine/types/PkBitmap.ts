import { PkColor } from '@ng/types/PkColor';
import { PkImage } from '@ng/types/PkImage';

export interface PkBitmap extends PkImage {
    /**
     * Returns the color of the bitmap's palette in the specified position.
     *
     * @param index - Index of the desired color in the bitmap's palette.
     */
    getColor(index: number): PkColor;
    
    /**
     * Returns the last color in the bitmap's palette.<br>
     * Equivalent to getColor(paletteSize - 1).
     */
    getLastColor(): PkColor;
    
    
    ///  Accessors  ///
    
    bits: number;
    paletteSize: number;
}
