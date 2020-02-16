import { Drawable } from '@ng/drawable/Drawable';
import { ITickable } from '@ng/ITickable';
import * as PIXI from 'pixi.js';
import { int, t_color } from '../../../support/types';


export class MenuSquare extends Drawable implements ITickable {
    // Set of 11 colors used to draw the square
    private _palette: int[];
    
    // Current coordinates of the square
    private _current: { x1: number, y1: number, x2: number, y2: number };
    // Target coordinates of the square after resize
    private _target: { x1: number, y1: number, x2: number, y2: number };
    
    // Oscillator
    private _degree = 0;
    
    
    public constructor(x1: number, y1: number, x2: number, y2: number, palette: number[]) {
        super(new PIXI.Graphics());
        
        this._palette = palette;
        
        this._canvas.x = x1;
        this._canvas.y = y1;
        
        x2 = x2 - x1;
        y2 = y2 - y1;
        x1 = 0;
        y1 = 0;
        
        this._current = { x1: x1 - x1, y1: y1 - y1, x2: x2 - x1, y2: y2 - y1 };
        this._target = { x1: x1 - x1, y1: y1 - y1, x2: x2 - x1, y2: y2 - y1 };
    }
    
    
    ///  Contents  ///
    
    private get _canvas(): PIXI.Graphics { return this._drawable as PIXI.Graphics; }
    
    /**
     * Sets the new coordinates of the destination for the transition to.
     */
    public setTarget(x1: number, y1: number, x2: number, y2: number) {
        this._target = {
            x1: x1 - this._canvas.x,
            y1: y1 - this._canvas.y,
            x2: x2 - this._canvas.x,
            y2: y2 - this._canvas.y
        };
    }
    
    /**
     *
     * @param palette
     */
    public setPalette(palette: number[]): void {
        if (palette.length < 11)
            throw new Error(`Trying to set a palette with less than 11 colors.`);
        
        // Apply new colors
        this._layout(0);
    }
    
    /** @inheritDoc */
    public tick(delta: number, time: number): void {
        // Movable elements variation after delta time
        const variation = delta / 10; //-> 1px every 10ms
        
        for (let i = 0; i < variation; i++) {
            this._degree = 1 + this._degree % 360;
        }
        
        this._layout(variation);
    }
    
    
    ///  Render  ///
    
    private _layout(variation: number): void {
        let x1, x2, y1, y2;
        
        // Step to target
        if (this._current.x1 < this._target.x1)
            this._current.x1 += variation;
        else if (this._current.x1 > this._target.x1)
            this._current.x1 -= variation;
        //
        if (this._current.x2 < this._target.x2)
            this._current.x2 += variation;
        else if (this._current.x2 > this._target.x2)
            this._current.x2 -= variation;
        //
        if (this._current.y1 < this._target.y1)
            this._current.y1 += variation;
        else if (this._current.y1 > this._target.y1)
            this._current.y1 -= variation;
        //
        if (this._current.y2 < this._target.y2)
            this._current.y2 += variation;
        else if (this._current.y2 > this._target.y2)
            this._current.y2 -= variation;
        
        // Load new current
        x1 = this._current.x1;
        y1 = this._current.y1;
        x2 = this._current.x2;
        y2 = this._current.y2;
        
        // Apply oscillation
        x1 += Math.floor(this._sin((this._degree * 2) % 359) / 2.0);
        y1 += Math.floor(this._cos((this._degree * 2) % 359) / 2.0);
        x2 += Math.floor(this._sin(((this._degree * 2) + 20) % 359) / 2.0);
        y2 += Math.floor(this._cos(((this._degree * 2) + 40) % 359) / 2.0);
        
        // Clean canvas
        this._canvas.clear();
        
        // Draw base square
        // this._drawRect(x1, y1, x2, y2, 0x230051);
        
        const gridW = (x2 - x1) / 19;
        const gridH = (y2 - y1) / 19;
        let color: t_color = 0;
        let toggle: boolean = true;
        
        for (let y = 0; y < 19; y++) {
            for (let x = 0; x < 19; x++) {
                //color = (x+y) / 6;
                color = (x / 4) + (y / 3);
                color = Math.floor((toggle)
                    ? color / 2
                    : color);
                
                this._drawRect(
                    x1 + x * gridW, y1 + y * gridH,
                    x1 + x * gridW + gridW, y1 + y * gridH + gridH,
                    this._palette[color]);
                
                toggle = !toggle;
            }
        }
        
        // Square borders I (perspective)
        this._drawRect(x1 - 1, y1 - 1, x2 + 1, y1 + 2, 0);
        this._drawRect(x1 - 1, y1 - 1, x1 + 2, y2 + 1, 0);
        this._drawRect(x1 - 1, y2 - 2, x2 + 1, y2 + 1, 0);
        this._drawRect(x2 - 2, y1 - 1, x2 + 1, y2 + 1, 0);
        
        // Square borders II (filling)
        this._drawRect(x1 - 1 + 1, y1 - 1 + 1, x2 + 1 + 1, y1 + 2 + 1, 0);
        this._drawRect(x1 - 1 + 1, y1 - 1 + 1, x1 + 2 + 1, y2 + 1 + 1, 0);
        this._drawRect(x1 - 1 + 1, y2 - 2 + 1, x2 + 1 + 1, y2 + 1 + 1, 0);
        this._drawRect(x2 - 2 + 1, y1 - 1 + 1, x2 + 1 + 1, y2 + 1 + 1, 0);
        
        // Square borders III (color)
        this._drawRect(x1, y1, x2, y1 + 1, 0xFFFFC4);
        this._drawRect(x1, y1, x1 + 1, y2, 0xFFA054);
        this._drawRect(x1, y2 - 1, x2, y2, 0x95383B);
        this._drawRect(x2 - 1, y1, x2, y2, 0x95383B);
    }
    
    private _drawRect(x1: number, y1: number, x2: number, y2: number, color: t_color) {
        this._canvas.beginFill(color);
        this._canvas.drawRect(x1, y1, x2 - x1, y2 - y1);
    }
    
    private _sin(deg): number {
        //return Math.sin(deg * Math.PI / 180) * 180 / Math.PI;
        return Math.sin(2 * Math.PI * (deg % 360) / 180) * 33;
    }
    private _cos(deg): number {
        //return Math.cos(deg * Math.PI / 180) * 180 / Math.PI;
        return Math.cos(2 * Math.PI * (deg % 360) / 180) * 33;
    }
}
