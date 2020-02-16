import { PkColor } from '@ng/types/PkColor';
import { PkImagePixels } from '@ng/types/PkImagePixels';
import { PkImageTexture } from '@ng/types/PkImageTexture';
import { PkRectangle } from '@ng/types/PkRectangle';

export interface PkImage {
    getImage(): HTMLImageElement;
    setImage(image: HTMLImageElement): this;
    
    getTexture(frame?: PkRectangle): PkImageTexture;
    
    getPixels(): PkImagePixels;
    removeTransparentPixel(color?: PkColor): this;
}
