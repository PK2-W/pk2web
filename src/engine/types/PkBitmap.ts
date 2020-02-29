import { PkColor } from '@ng/types/PkColor';
import { PkImage } from '@ng/types/PkImage';
import { uint } from '../../support/types';

export interface PkBitmap extends PkImage {
    getColor(index: uint): PkColor;
    getLastColor(): PkColor;
    
    
    ///  Accessors  ///
    
    bits: uint;
    paletteSize: uint;
}
