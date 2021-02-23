import { Dw } from '@fwk/drawable/dw/Dw';
import { NewTexture } from '@fwk/texture/NewTexture';
import { NewTextureResource } from '@fwk/texture/NewTextureResource';
import { PkPaletteBitmapResource } from '@fwk/texture/PkPaletteBitmapResource';
import { TPoint } from '@fwk/types/IPoint';
import type { PkTexture } from '@fwk/types/PkTexture';

export class DwSprite extends Dw<PIXI.Sprite> {
    /** @deprecated */
    private _oldTexture: PkTexture<any>;
    private _texture: NewTexture;
    
    public constructor() {
        super(new PIXI.Sprite());
    }
    
    public get oldTexture(): PkTexture<any> {
        return this._oldTexture;
    }
    public set oldTexture(texture: PkTexture<any>) { this.setOldTexture(texture); }
    /**
     * @deprecated
     * Sets the {@link oldTexture} property.
     */
    public setOldTexture(texture: PkTexture<any>): this {
        this._oldTexture = texture;
        this._pixi.texture = texture.getPixiTexture();
        return this;
    }
    
    public getTexture(): NewTexture {
        return this._texture;
    }
    
    public setTexture(texture: NewTexture): this {
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