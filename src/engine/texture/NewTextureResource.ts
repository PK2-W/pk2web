import type * as PIXI from 'pixi.js';

export abstract class NewTextureResource {
    public readonly abstract width: number;
    public readonly abstract height: number;
    
    public abstract getPixiResource(): PIXI.resources.Resource;
    public abstract getPixiBaseTexture(): PIXI.BaseTexture ;
}