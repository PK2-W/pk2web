import type { Dw } from '@ng/drawable/skeleton/Dw';

/**
 * Interfaz con una serie de métodos que deben implementar todos aquellos elementos que puedan dibujarse en pantalla.
 *
 * @version 1.0-stable
 */
export interface DwObject {
    
    /**
     * Devuelve el lienzo de este elemento, redibujando su contenido si este ha sido invalidado.<br>
     */
    getDrawable(): Dw;
}
