import { Dw } from '@ng/drawable/dw/Dw';
import { TPoint } from '@ng/types/IPoint';
import type { PkTexture } from '@ng/types/PkTexture';

export class DwSprite extends Dw<PIXI.Sprite> {
    private _texture: PkTexture<any>;
    
    public constructor() {
        super(new PIXI.Sprite());
    }
    
    public get texture(): PkTexture<any> {
        return this._texture;
    }
    public set texture(texture: PkTexture<any>) { this.setTexture(texture); }
    /**
     * Sets the {@link texture} property.
     */
    public setTexture(texture: PkTexture<any>): this {
        this._texture = texture;
        this._pixi.texture = texture.getPixiTexture();
        return this;
    }
    
    /**
     * Sprite origin position releative to itself.<br>
     * By default (0,0), meaning top-left corner.<br>
     * Possible values goes from 0 to 1, with (0.5, 0.5) being the middle and (1,1) the bottom-right corner.
     */
    public get anchor(): TPoint { return this._pixi.anchor; }
    public set anchor(anchor: TPoint) {
        this._pixi.anchor.set(anchor.x, anchor.y);
    }
    /**
     * Sets the {@link anchor} property.
     */
    public setAnchor(anchor: TPoint): this {
        this.anchor = anchor;
        return this;
    }
    
    /**
     * Sprite scale, as a couple of multipliers for both axes.
     */
    public get scale(): TPoint { return this._pixi.scale; }
    public set scale(scale: TPoint) {
        this._pixi.scale.set(scale.x, scale.y);
    }
    /**
     * Sets the {@link scale} property.
     */
    public setScale(scale: TPoint): this {
        this.scale = scale;
        return this;
    }
}