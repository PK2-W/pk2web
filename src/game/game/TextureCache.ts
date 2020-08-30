import { PkBaseTexture } from '@ng/types/image/PkBaseTexture';
import { PkRectangle } from '@ng/types/PkRectangle';
import { PkTexture } from '@ng/types/PkTexture';

export class TextureCache {
    private _baseTextures: Map<string, PkBaseTexture>;
    private _textures: Map<string, PkTexture>;
    
    public constructor() {
        this._baseTextures = new Map();
        this._textures = new Map();
    }
    
    public add(id: string, baseTexture: PkBaseTexture): this {
        this._baseTextures.set(id, baseTexture);
        return this;
    }
    
    public getBaseTexture(id: string): PkBaseTexture {
        const bt = this._baseTextures.get(id);
        return bt != null ? bt : null;
    }
    
    public getTexture(id: string): PkTexture;
    public getTexture(id: string, rectangle: PkRectangle): PkTexture;
    public getTexture(id: string, x: number, y: number, w: number, h: number): PkTexture;
    public getTexture(id: string, a?: number | PkRectangle, y?: number, w?: number, h?: number): PkTexture {
        let key = '';
        let extension = '';
        let frame: PkRectangle;
        let texture: PkTexture;
        
        if (a != null) {
            frame = (typeof a !== 'number') ? a : PkRectangle.$(a, y, w, h);
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
