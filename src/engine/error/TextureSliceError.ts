import { PkError } from '@ng/error/PkError';

export class TextureSliceError extends PkError {
    public constructor(frameSize: PIXI.Rectangle, imageWidth: number, imageHeight: number) {
        super(null);
        
        this.message = `The section to be cropped (${ frameSize.x }, ${ frameSize.y }, ${ frameSize.right }, ${ frameSize.bottom }) is outside the image boundaries (${ imageWidth }x${ imageHeight }).`;
    }
}