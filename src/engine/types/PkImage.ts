import { PkColor } from '@ng/types/PkColor';
import { PkImagePixels } from '@ng/types/PkImagePixels';
import { PkImageTexture } from '@ng/types/PkImageTexture';
import { PkRectangle } from '@ng/types/PkRectangle';
import { int } from '../../support/types';

export interface PkImage {
    getImage(): HTMLImageElement;
    
    getTexture(frame?: PkRectangle): PkImageTexture;
    
    getPixels(): PkImagePixels;
    removeTransparentPixel(color?: PkColor): this;
    
    width: int;
    height: int
}
