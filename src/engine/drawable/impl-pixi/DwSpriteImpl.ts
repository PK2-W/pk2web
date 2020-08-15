import { DwImpl } from '@ng/drawable/impl-pixi/DwImpl';
import { DwSprite } from '@ng/drawable/skeleton/DwSprite';
import { TPoint } from '@ng/types/IPoint';
import type { PkImageTextureImpl } from '@ng/types/pixi/PkImageTextureImpl';

export class DwSpriteImpl extends DwImpl<PIXI.Sprite> implements DwSprite {
    private _texture: PkImageTextureImpl;
    
    public constructor() {
        super(new PIXI.Sprite());
    }
    
    public get texture(): PkImageTextureImpl {
        return this._texture;
    }
    public set texture(texture: PkImageTextureImpl) {
        this._texture = texture;
        this._pixi.texture = texture.getPixiTexture();
    }
    public setTexture(texture: PkImageTextureImpl): this {
        this.texture = texture;
        return this;
    }
    
    public get anchor(): TPoint { return this._pixi.anchor; }
    public set anchor(anchor: TPoint) {
        this._pixi.anchor.set(anchor.x, anchor.y);
    }
    public setAnchor(anchor: TPoint): this {
        this.anchor = anchor;
        return this;
    }
    
    public get scale(): TPoint { return this._pixi.scale; }
    public set scale(scale: TPoint) {
        this._pixi.scale.set(scale.x, scale.y);
    }
    public setScale(scale: TPoint): this {
        this.scale = scale;
        return this;
    }
}