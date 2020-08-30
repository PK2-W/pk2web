import { Dw } from '@ng/drawable/dw/Dw';

export interface DwObject {
    /**
     * Devuelve el lienzo de este elemento, redibujando su contenido si este ha sido invalidado.<br>
     */
    getDrawable(): Dw<PIXI.DisplayObject>;
}
