import { NewTexture } from '@fwk/texture/NewTexture';
import { NewTextureResource } from '@fwk/texture/NewTextureResource';
import { PkRectangle } from '@fwk/types/PkRectangle';
import * as PIXI from 'pixi.js';

/** @deprecated */
export class NewTextureView<T extends NewTextureResource> {
    private readonly _base: NewTexture<T>;
    private readonly _frame: PkRectangle;
    
    private _cache_pixiTexture: PIXI.Texture;
    
    
    public constructor(texture: NewTexture<T>, frame: PkRectangle) {
        this._base = texture;
        this._frame = frame;
    }
    
    public get width(): number {
        return this._frame.width;
    }
    
    public get height(): number {
        return this._frame.height;
    }
    
    public get resource(): T {
        return this._base.resource;
    }
    
    public getPixiTexture(): PIXI.Texture {
        if (this._cache_pixiTexture == null) {
            this._cache_pixiTexture = new PIXI.Texture(this.getPixiBaseTexture(), this._frame);
        }
        return this._cache_pixiTexture;
    }
    
    public getPixiBaseTexture(): PIXI.BaseTexture {
        return this._base.getPixiBaseTexture();
    }
}