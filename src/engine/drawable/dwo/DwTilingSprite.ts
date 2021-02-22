import { DwContainer } from '@fwk/drawable/dw/DwContainer';
import { DwSprite } from '@fwk/drawable/dw/DwSprite';
import { DwObjectBase } from '@fwk/drawable/dwo/DwObjectBase';
import { NewTexture } from '@fwk/texture/NewTexture';
import { PkPaletteBitmapResource } from '@fwk/texture/PkPaletteBitmapResource';
import { PkBaseTexture } from '@fwk/types/image/PkBaseTexture';
import { TPoint } from '@fwk/types/IPoint';
import { PkTexture } from '@fwk/types/PkTexture';

export class DwTilingSprite extends DwObjectBase<DwContainer> {
    private _width: number;
    private _height: number;
    private _anchor: TPoint;
    private _scale: TPoint;
    private _spriteBuffer: DwSprite[];
    private _texture: NewTexture;
    
    public constructor(texture: NewTexture, width: number, height: number) {
        super(new DwContainer);
        
        this._texture = texture;
        this._width = width;
        this._height = height;
        
        this._anchor = { x: 0, y: 0 };
        this._spriteBuffer = [];
        
        this.arrange();
    }
    
    /** X coordinate of the drawable object. */
    public get x(): number { return this.dw.x; };
    public set x(x: number) {
        this.dw.x = x;
    }
    /** Sets the X coordinate of the drawable object. */
    public setX(x: number): this {
        this.x = x;
        return this;
    }
    
    /** Y coordinate of the drawable object. */
    public get y(): number { return this.dw.y; };
    public set y(y: number) {
        this.dw.y = y;
    }
    /** Sets the Y coordinate of the drawable object. */
    public setY(y: number): this {
        this.y = y;
        return this;
    }
    
    /**
     * Sets both coordinates X and Y for the drawable object.
     */
    public setPosition(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }
    
    public get width(): number { return this._width; }
    public set width(width: number) {
        this._width = width;
        this.arrange();
    }
    public setWidth(width: number): this {
        this.width = width;
        return this;
    }
    
    public get height(): number { return this._height; }
    public set height(height: number) {
        this._height = height;
        this.arrange();
    }
    public setHeight(height: number): this {
        this.height = height;
        return this;
    }
    
    public get texture(): NewTexture {
        return this._texture;
    }
    public set texture(texture: NewTexture) {
        this._texture = texture;
        this.arrange();
    }
    public setTexture(texture: NewTexture): this {
        this.texture = texture;
        return this;
    }
    
    public get anchor(): TPoint { return this._anchor; }
    public set anchor(anchor: TPoint) {
        this._anchor = anchor;
        this.arrange();
    }
    public setAnchor(anchor: TPoint): this {
        this.anchor = anchor;
        return this;
    }
    
    private arrange() {
        if (this._texture == null) {
            // If no texture, empty
            this.dw.clear();
        } else {
            const iCount = Math.ceil(this._width / this._texture.width);
            const jCount = Math.ceil(this._height / this._texture.height);
            const count = iCount * jCount;
            
            if (this._spriteBuffer.length > count) {
                this._spriteBuffer.splice(count);
            } else if (this._spriteBuffer.length < count) {
                while (this._spriteBuffer.length < count) {
                    this._spriteBuffer.push(new DwSprite());
                }
            }
            
            let spr: DwSprite;
            for (let j = 0; j < jCount; j++) {
                for (let i = 0; i < iCount; i++) {
                    spr = this._spriteBuffer[j * iCount + i]
                        .setNewTexture(this._texture)
                        .setPosition(i * this._texture.width, j * this._texture.height)
                        .addTo(this.dw);
                }
            }
        }
    }
}