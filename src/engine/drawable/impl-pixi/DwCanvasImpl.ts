import { DwCanvas } from '@ng/drawable/skeleton/DwCanvas';
import { DwImpl } from '@ng/drawable/impl-pixi/DwImpl';
import { PkColor, TColor } from '@ng/types/PkColor';

export class DwCanvasImpl extends DwImpl<PIXI.Graphics> implements DwCanvas {
    public constructor() {
        super(new PIXI.Graphics());
    }
    
    public beginFill(color: PkColor | TColor): this {
        let tr = 1;
        if (color instanceof PkColor) {
            tr = color.a01;
            color = color.toRGBInt();
        }
        this._pixi.beginFill(color, tr);
        return this;
    }
    
    public drawRect(x: number, y: number, w: number, h: number): this {
        this._pixi.drawRect(x, y, w, h);
        return this;
    }
    
    public drawRect2(x1: number, y1: number, x2: number, y2: number): this {
        this._pixi.drawRect(x1, y1, x2 - x1, y2 - y1);
        return this;
    }
    
    public clear(): this {
        this._pixi.clear();
        return this;
    }
}