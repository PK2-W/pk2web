import { PkRectangleImpl } from '@ng/types/pixi/PkRectangleImpl';
import { PkImage } from '@ng/types/PkImage';
import { PkImageTexture } from '@ng/types/PkImageTexture';
import { PkRectangle } from '@ng/types/PkRectangle';

export class TextureCache {
    private _baseTextures: Map<string, PkImage>;
    private _textures: Map<string, PkImageTexture>;
    
    public constructor() {
        this._baseTextures = new Map();
        this._textures = new Map();
    }
    
    public add(id: string, baseTexture: PkImage): this {
        this._baseTextures.set(id, baseTexture);
        return this;
    }
    
    public getBaseTexture(id: string): PkImage {
        const bt = this._baseTextures.get(id);
        return bt != null ? bt : null;
    }
    
    public getTexture(id: string): PkImageTexture;
    public getTexture(id: string, rectangle: PkRectangle): PkImageTexture;
    public getTexture(id: string, x: number, y: number, w: number, h: number): PkImageTexture;
    public getTexture(id: string, a?: number | PkRectangle, y?: number, w?: number, h?: number): PkImageTexture {
        let key = '';
        let extension = '';
        let frame: PkRectangle;
        let texture: PkImageTexture;
        
        if (a != null) {
            frame = (typeof a !== 'number') ? a : PkRectangleImpl.$(a, y, w, h);
            extension = '::' + frame.x + ':' + frame.y + ':' + frame.width + ':' + frame.height;
        }
        
        // Try to get the requested texture
        key = id + extension;
        texture = this._textures.get(key);
        
        if (texture == null) {
            // Get base texture
            const bt = this.getBaseTexture(id);
            if (bt == null) {
                console.error('Couldn\'t get texture: ' + key);
                //return PIXI.Texture.EMPTY;
                throw new Error('Couldn\'t get texture: ' + key);
            }
            
            // Create the requested texture
            texture = bt.getTexture(frame);
            
            // Cache the texture
            this._textures.set(key, texture);
        }
        
        return texture;
    }
}
