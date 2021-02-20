import { NewTextureResource } from '@fwk/texture/NewTextureResource';
import * as PIXI from 'pixi.js';

export class NewTexture<T extends NewTextureResource> {
    private readonly _resource: T;
    
    private _cache_pixiTexture: PIXI.Texture;
    
    
    public constructor(resource: T) {
        this._resource = resource;
    }
    
    public get width(): number {
        return this._resource.width;
    }
    
    public get height(): number {
        return this._resource.height;
    }
    
    public get resource(): T {
        return this._resource;
    }
    
    public getPixiTexture(): PIXI.Texture {
        if (this._cache_pixiTexture == null) {
            this._cache_pixiTexture = new PIXI.Texture(this.getPixiBaseTexture());
        }
        return this._cache_pixiTexture;
    }
    
    public getPixiBaseTexture(): PIXI.BaseTexture {
        return this._resource.getPixiBaseTexture();
    }
}