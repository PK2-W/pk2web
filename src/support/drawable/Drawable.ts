import * as PIXI from '@vendor/pixi';
import { EventEmitter } from 'eventemitter3';
import { DwHelper } from './DwHelper';
import { IDrawable } from './IDrawable';

/**
 * Clase base para el control de los elementos que deben pintarse en pantalla.
 *
 * - Un elemento tendrá el estado _invalidated_ si necesita reconstruir la forma en la que sus elementos aparecen en
 *   pantalla antes del próximo repintado. Cuando se produzca un cambio, el propio elemento será el responsable de
 *   llamar a {@link invalidate}.
 *
 * - Un elemento, además, podrá tener subelementos invalidados, sin que esto implique que este lo está. Solamente, sus
 *   subelementos afectados tendrán que redistribuir sus elementos, y por tanto tendrán el estado _invalidated_.
 *
 * - Si se ha propagado que algún subelemento necesita repintado (mediante llamada a {@link invalidate} o
 *   {@link onChildInvalidated}, el renderer llamará al método {@link getDrawable} del elemento superior, que irá
 *   llamando al {@link getDrawable} de todos los subelementos del árbol que requieran repintado (estos o sus
 *   subelementos).
 *
 * - Durante esta operación, {@link getDrawable} deberá llamar a __super.__{@link relayout}, que automáticamente
 *   reconstruirá los subelementos afectados, si los hay.
 *   Quedará por parte de la clase hija redistribuir sus elementos si tiene el estado _invalidated_, y responder a la
 *   llamada con el lienzo, haya sufrido cambios, o no.
 *
 * Con este procedimiento, __solo se repintan los elementos de la jerarquía que lo necesitan__ por el cambio sufrido,
 * permitiendo la repetición del proceso a altas velocidades (>30fps).
 *
 * @version 1.1-stable
 */
export abstract class Drawable extends EventEmitter implements IDrawable {
    // Drawable container
    protected _drawable: PIXI.Container;
    // Alpha
    private _alpha;
    
    // Indica si este elemento requiere redibujado o no
    private _invalidated: boolean;
    // Subelementos que requieren redibujado
    private _childsInvalidated: Drawable[];
    
    
    /**
     * Constructor base de está clase.
     * El lienzo nace invalidado por defecto.
     */
    protected constructor() {
        super();
        
        this._alpha = 1;
        this._invalidated = true;
        this._childsInvalidated = [];
    }
    
    
    /**
     * Puede ser invocado por la clase hija cuando alguno de los elementos de esta sea invalidado (el contenido en
     * cache del lienzo ya no es válido), de está manera se comunicará al renderer que si bien, la distribución de los
     * elemento no ha cambiado, pero sí estos.
     * Quedará en manos de la clase hija detectar el cambio en sus elementos y invocar a este método.
     *
     * @param child - El subelemento que necesita redibujado.
     * @emits DwHelper.EVT_NEEDS_RELAYOUT
     */
    protected onChildInvalidated(child: Drawable) {
        this._childsInvalidated.push(child);
        this.emit(DwHelper.EVT_NEEDS_RELAYOUT, this);
    }
    
    /**
     * Establece que el contenido en cache del lienzo ya no es válido y debe reconstruirse durante el próximo
     * ciclo de repintado.
     *
     * @param propagate - Por defecto TRUE, indica si la necesidad del redibujado se propaga hacia los elementos padre.
     * @emits DwHelper.EVT_NEEDS_RELAYOUT
     */
    public invalidate(propagate: boolean = true) {
        this._invalidated = true;
        
        if (propagate) {
            this.emit(DwHelper.EVT_NEEDS_RELAYOUT, this);
        }
    }
    
    /**
     * Determina si el elemento necesita redibujarse, o no.
     */
    public isInvalidated(): boolean {
        return this._invalidated === true;
    }
    
    /**
     * Determina si el elemento necesita redibujarse, o no.
     */
    public hasChildsInvalidated(): boolean {
        return this._childsInvalidated.length > 0;
    }
    
    /**
     * Establece que el contenido en cache del lienzo vuelve a ser válido.
     */
    protected revalidate() {
        this._invalidated = false;
    }
    
    /**
     * Redistribuye según sea o no necesario, el contenido que va a dibujarse en el próximo ciclo de repintado.
     */
    public relayout() {
        for (const child of this._childsInvalidated) {
            child.relayout();
        }
        this._childsInvalidated = [];
        
        this.revalidate();
        
        // Override and do what you want here...
    }
    
    /**
     * Devuelve el lienzo de este elemento, redibujando su contenido si este ha sido invalidado.
     */
    public abstract getDrawable(): PIXI.Container ;
    
    public get alpha(): number {
        return this._alpha;
    }
    
    public set alpha(v: number) {
        this._alpha =
            (v < 0) ? 0 :
                ((v > 1) ? 1 : v);
        
        this._drawable.alpha = this._alpha;
        
        this.invalidate();
    }
}
