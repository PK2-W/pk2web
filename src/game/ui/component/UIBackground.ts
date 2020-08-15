import { PkUIComponentImpl } from '@ng/ui/PkUIComponentImpl';
import * as PIXI from 'pixi.js';
import { TColor } from '../../support/types';
import { PK2Context } from '../../PK2Context';

export class UIBackground extends PkUIComponentImpl {
    private _width: number;
    private _height: number;
    private _bgColor: TColor;
    
    private readonly _colorLayer: PIXI.Graphics;
    private _imageLayer: PIXI.Sprite;
    
    public constructor(context: PK2Context, width: number, height: number, color?: TColor) {
        super(context, new PIXI.Container());
        
        this._width = width;
        this._height = height;
        
        this._colorLayer = new PIXI.Graphics();
        this.container.addChild(this._colorLayer);
    }
    
    
    ///  Contents  ///
    
    protected get container(): PIXI.Container {
        return this._drawable as PIXI.Container;
    }
    
    public setColor(color: number): UIBackground {
        this._bgColor = color;
        
        this._colorLayer.clear();
        
        if (color != null) {
            this._colorLayer.beginFill(this._bgColor);
            this._colorLayer.drawRect(0, 0, this._width, this._height);
        }
        
        return this;
    }
    
    public setImage(image: HTMLImageElement, x: number, y: number): UIBackground {
        //this.this._imageLayer = clipTSprite(this._bgBaseTexture, 280, 80, 640, 480);
        
        return this;
    }
    
    public setTexture(): UIBackground {
        
        return this;
        
    }
    
    public setSprite(sprite: PIXI.Sprite): UIBackground {
        this._imageLayer = sprite;
        return this;
    }
}
