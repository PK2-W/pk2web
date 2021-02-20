import { PkBitmapBT } from '@fwk/types/image/PkBitmapBT';
import { PkColor } from '@fwk/types/PkColor';
import { PkRectangle } from '@fwk/types/PkRectangle';

export class PkImagePixels {
    private readonly _bitmap: PkBitmapBT;
    private readonly _frame: PkRectangle;
    
    public constructor(bitmap: PkBitmapBT, frame?: PkRectangle) {
        this._bitmap = bitmap;
        this._frame = frame;
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
