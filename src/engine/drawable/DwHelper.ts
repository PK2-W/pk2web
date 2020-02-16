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
    
    
    ///  Eventos  ///
    
    /**
     * Se emite cuando el elemento actual, que implementa IDrawable, se invalida y debe redibujarse.
     * @event DwHelper.EVT_INVALIDATED
     * @property {Drawable} element - Elemento que necesita ser redibujado.
     */
    public static readonly EVT_NEEDS_RELAYOUT = 'invalidated.drawable.ev';
}
