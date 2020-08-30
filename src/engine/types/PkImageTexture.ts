import { PkRectangle } from '@ng/types/PkRectangle';

export interface PkImageTexture {
    frame: PkRectangle;
    readonly width: number
    readonly height: number
    
    changeFrame(frame: PkRectangle): void
    
    //getPixels(): PkImagePixels;
}
