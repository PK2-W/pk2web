import type { DwContainer } from '@ng/drawable/skeleton/DwContainer';
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
    
    visible: boolean;
    setVisible(visible: boolean): this;
    
    renderable: boolean;
    setRenderable(renderable: boolean): this;
    
    alpha: number;
    setAlpha(value: number): this;
    
    addTo(container: DwContainer): this;
}