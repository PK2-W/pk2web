import { PkUIComponentImpl } from '@ng/ui/PkUIComponentImpl';
import * as PIXI from 'pixi.js';
import { TColor } from '../../support/types';
import { minmax } from '@ng/support/utils';
import { PekkaContext } from '../../PekkaContext';

export class UIProgressBar extends PkUIComponentImpl {
    private _width: number;
    private _height: number;
    private _color: TColor;
    
    private _progress: number;
    
    
    public constructor(context: PekkaContext, x: number, y: number, width: number, height: number, color: TColor) {
        super(context, new PIXI.Graphics());
        
        this._width = width;
        this._height = height;
        this._color = color;
        
        this.x = x;
        this.y = y;
        this._progress = 0;
    }
    
    
    ///  Contents  ///
    
    private get _canvas(): PIXI.Graphics { return this._drawable as PIXI.Graphics; }
    
    
    ///  Properties  ///
    
    public setWidth(width: number): this {
        this._width = width;
        this.layout();
        
        return this;
    }
    
    public setHeight(height: number): this {
        this._height = height;
        this.layout();
        
        return this;
    }
    
    public setColor(color: number): this {
        this._color = color;
        this.layout();
        
        return this;
    }
    
    public setProgress(progress: number): this {
        this._progress = minmax(progress, 0, 1);
        this.layout();
        
        return this;
    }
    
    
    ///  Render  ///
    
    private layout(): void {
        this._canvas.clear();
        
        const width = this._width * this._progress;
        
        // Shadow
        this._canvas.beginFill(0x000000, 0.4);
        this._canvas.drawRect(3, 3, width, this._height);
        // Fill
        this._canvas.beginFill(this._color);
        this._canvas.drawRect(0, 0, width, this._height);
        
        this.invalidate();
    }
}
