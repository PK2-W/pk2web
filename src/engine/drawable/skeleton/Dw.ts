import type { DwContainer } from '@ng/drawable/skeleton/DwContainer';
import { PkRectangle } from '@ng/types/PkRectangle';
import { EventEmitter } from 'eventemitter3';

export interface Dw extends EventEmitter.EventEmitter {
    readonly iid: number;
    
    /** X coordinate of the drawable element. */
    x: number;
    /** Sets the X coordinate of the drawable element. */
    setX(x: number): this;
    /** Y coordinate of the drawable element. */
    y: number;
    /** Sets the Y coordinate of the drawable element. */
    setY(y: number): this;
    
    /**
     * Sets both coordinates X and Y for the drawable element.
     */
    setPosition(x: number, y: number): this;
    
    /**
     * Opacity of the drawable element applied to its descendants individually.<br>
     * To achieve a global opacity effect across all the descentents as a whole use {@link globalAlpha} instead.
     */
    alpha: number;
    /** Sets the {@link alpha} property. */
    setAlpha(alpha: number): this;
    
    /**
     * Opacity of the drawable element applied to all its descendants as a whole.<br>
     * To apply opacity to descendants individually use {@link alpha} instead.
     */
    globalAlpha: number;
    /** Sets the {@link globalAlpha} property. */
    setGlobalAlpha(alpha: number): this;
    
    visible: boolean;
    /** Sets the {@link visible} property. */
    setVisible(visible: boolean): this;
    
    renderable: boolean;
    /** Sets the {@link renderable} property. */
    setRenderable(renderable: boolean): this;
    
    hitArea: PkRectangle;
    /** Sets the {@link hitArea} property. */
    setHitArea(renderable: PkRectangle): this;
    
    getBounds(): PkRectangle;
    
    
    ///  Hierarchy  ///
    
    /**
     * Adds this drawable element to the specified container as a child.<br>
     * It's a shortcut to the container {@link DwContainer#add} method.
     *
     * @param container - Container element that will become the parent of this element.
     */
    addTo(container: DwContainer): this;
    addTo(container: DwContainer, x: number, y: number): this;
}