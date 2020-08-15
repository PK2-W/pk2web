import type { Dw } from '@ng/drawable/skeleton/Dw';
import type { PkColor, TColor } from '@ng/types/PkColor';

export interface DwCanvas extends Dw {
    beginFill(color: PkColor | TColor): this;
    drawRect(x: number, y: number, w: number, h: number): this;
    drawRect2(x1: number, y1: number, x2: number, y2: number): this
    clear(): this;
}