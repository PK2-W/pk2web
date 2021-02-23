import { ifnul } from '@fwk/support/utils';
import { NewTextureResource } from '@fwk/texture/NewTextureResource';
import { NewTextureView } from '@fwk/texture/NewTextureView';
import { PkRectangle } from '@fwk/types/PkRectangle';
import * as PIXI from 'pixi.js';

export class NewTexture<T extends NewTextureResource = NewTextureResource> {
    private readonly _resource: T;
    private readonly _frame: PkRectangle;
    
    private _cache_pixiTexture: PIXI.Texture;
    
    
    public constructor(resource: T, frame?: PkRectangle) {
        this._resource = resource;
        this._frame = ifnul(frame);
    }
    
    public get frame(): PkRectangle {
        return this._frame != null
            ? this._frame.clone()
            : null;
    }
    
    public get width(): number {
        return this._frame != null
            ? this._frame.width
            : this._resource.width;
    }
    
    public get height(): number {
        return this._frame != null
            ? this._frame.height
            : this._resource.height;
    }
    
    public get resource(): T {
        return this._resource;
    }
    
    public project(frame: PkRectangle): NewTextureView<T> {
        return new NewTextureView<T>(this, frame);
    }
    
    public getPixiTexture(): PIXI.Texture {
        if (this._cache_pixiTexture == null) {
            this._cache_pixiTexture = new PIXI.Texture(this.getPixiBaseTexture(), this._frame);
        }
        return this._cache_pixiTexture;
    }
    
    public getPixiBaseTexture(): PIXI.BaseTexture {
        return this._resource.getPixiBaseTexture();
    }
}