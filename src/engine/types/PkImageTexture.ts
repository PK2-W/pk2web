import { PkImagePixels } from '@ng/types/PkImagePixels';
import { PkRectangle } from '@ng/types/PkRectangle';

export interface PkImageTexture {
    changeFrame(frame: PkRectangle): void
    
    getPixels(): PkImagePixels;
}
