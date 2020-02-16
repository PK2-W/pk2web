import { PkImageTk } from '@ng/toolkit/PkImageTk';
import { PkColor } from '@ng/types/PkColor';

export class PkImagePixels {
    private readonly dt: ImageData;
    
    public constructor(data: HTMLImageElement | ImageData) {
        if (data instanceof ImageData) {
            this.dt = data;
        } else {
            this.dt = PkImageTk.imageToImageData(data);
        }
    }
    
    public get(x: number, y: number): PkColor {
        const i = this.getIdx(x, y);
        return PkColor.rgba(this.dt.data[i], this.dt.data[i + 1], this.dt.data[i + 2], this.dt.data[i + 3]);
    }
    
    public set(x: number, y: number, color: PkColor): this {
        const i = this.getIdx(x, y);
        this.dt.data[i] = color.r;
        this.dt.data[i + 1] = color.g;
        this.dt.data[i + 2] = color.b;
        this.dt.data[i + 3] = color.a;
        return this;
    }
    
    private getIdx(x: number, y: number): number {
        return (y * this.dt.width + x) * 4;
    }
}
