import * as PIXI from 'pixi.js';

/**
 * Interfaz con una serie de métodos que deben implementar todos aquellos elementos que puedan dibujarse en pantalla.
 *
 * @version 1.0-stable
 */
export interface IDrawable {
    
    /**
     * Devuelve el lienzo de este elemento, redibujando su contenido si este ha sido invalidado.<br>
     */
    getDrawable(): PIXI.DisplayObject;
    
    /**
     * Establece que el contenido en cache del lienzo ya no es válido y debe reconstruirse durante el próximo
     * ciclo de repintado.
     *
     * @param propagate - Por defecto TRUE, indica si la necesidad del redibujado se propaga hacia los elementos padre.
     */
    invalidate(propagate: boolean): void;
    
    /**
     * Determina si el elemento necesita redibujarse, o no.
     */
    isInvalidated(): boolean;
}
