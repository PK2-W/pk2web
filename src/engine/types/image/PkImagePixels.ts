import { PkImageTk } from '@fwk/toolkit/PkImageTk';
import { PkColor } from '@fwk/types/PkColor';

export class PkImagePixels {
    private _dt: ImageData;
    private readonly _width: number;
    private readonly _height: number;
    
    public static fromImage(image: HTMLImageElement): PkImagePixels {
        const obj = new PkImagePixels(image.width, image.height);
        obj._dt = PkImageTk.imageToImageData(image);
        return obj;
    }
    
    public static fromImageData(data: ImageData): PkImagePixels {
        const obj = new PkImagePixels(data.width, data.height);
        obj._dt = data;
        return obj;
    }
    
    public constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
    }
    
    public get(x: number, y: number): PkColor {
        if (this._dt == null)
            this.createImageData();
        
        const i = this.getIdx(x, y);
        return PkColor.rgba(this._dt.data[i], this._dt.data[i + 1], this._dt.data[i + 2], this._dt.data[i + 3]);
    }
    
    public set(x: number, y: number, color: PkColor): this {
        if (this._dt == null)
            this.createImageData();
        
        const i = this.getIdx(x, y);
        this._dt.data[i] = color.r;
        this._dt.data[i + 1] = color.g;
        this._dt.data[i + 2] = color.b;
        this._dt.data[i + 3] = color.a255;
        return this;
    }
    
    
    ///  Accessors  ///
    
    public get width(): number {
        return this._width;
    }
    
    public get height(): number {
        return this._height;
    }
    
    
    ///  Auxiliar  ///
    
    private createImageData(): void {
        this._dt = new ImageData(this.width, this.height);
    }
    
    private getIdx(x: number, y: number): number {
        return (y * this.width + x) * 4;
    }
}
