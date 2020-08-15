/**
 * Clase auxiliar para la asistencia al renderizado de elementos en pantalla.
 *
 * @version 1.1-stable
 */
import * as PIXI from 'pixi.js';

export const clipDSprite = (baseTexture: PIXI.BaseTexture, x, y, w, h) => {
    const texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(x, y, w, h));
    return new PIXI.Sprite(texture);
};

export const clipTSprite = (baseTexture: PIXI.BaseTexture, x1, y1, x2, y2) => {
    return clipDSprite(baseTexture, x1, y1, x2 - x1, y2 - y1);
};

export class DwHelper {
    // Instance unique identifier
    private static IID: number = 0;
    
    public static getIID(): number {
        return DwHelper.IID++;
    }
    
    
    ///  Eventos  ///
    public static readonly EV_POINTEROVER = Symbol('over.pointer.drawable.ev');
    public static readonly EV_POINTEROUT = Symbol('out.pointer.drawable.ev');
    public static readonly EV_POINTERTAP = Symbol('click.pointer.drawable.ev');
    /**
     * Se emite cuando el elemento actual, que implementa IDrawable, se invalida y debe redibujarse.
     * @event DwHelper.EVT_INVALIDATED
     * @property {Drawable} element - Elemento que necesita ser redibujado.
     */
    public static readonly EV_NEEDS_RELAYOUT = 'invalidated.drawable.ev';
}
