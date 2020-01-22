import { PkRectangle, Rectangle } from '@ng/wrapper/Rectangle';

export class TextureCache {
    private _baseTextures: Map<string, PIXI.BaseTexture>;
    private _textures: Map<string, PIXI.Texture>;
    
    public constructor() {
        this._baseTextures = new Map();
        this._textures = new Map();
    }
    
    public add(id: string, texture: PIXI.BaseTexture): this {
        this._baseTextures.set(id, texture);
        return this;
    }
    
    public getBaseTexture(id: string): PIXI.BaseTexture {
        const bt = this._baseTextures.get(id);
        return bt != null ? bt : null;
    }
    
    public getTexture(id: string): PIXI.Texture;
    public getTexture(id: string, rectangle: Rectangle): PIXI.Texture;
    public getTexture(id: string, x: number, y: number, w: number, h: number);
    public getTexture(id: string, a?: number | Rectangle, y?: number, w?: number, h?: number): PIXI.Texture {
        let key = '';
        let extension = '';
        let area: Rectangle;
        let texture: PIXI.Texture;
        
        if (a != null) {
            area = (typeof a !== 'number') ? a : PkRectangle.$(a, y, w, h);
            extension = '::' + area.x + ':' + area.y + ':' + area.width + ':' + area.height;
        }
        
        // Try to get the requested texture
        key = id + extension;
        texture = this._textures.get(key);
        
        if (texture == null) {
            // Get base texture
            const bt = this.getBaseTexture(id);
            if (bt == null) {
                console.error('Couldn\'t get texture: ' + key);
                return PIXI.Texture.EMPTY;
            }
            
            // Create the requested texture
            texture = new PIXI.Texture(bt, (area != null ? area.getNative() : null) as PIXI.Rectangle);
            
            // Cache the texture
            this._textures.set(key, texture);
        }
        
        return texture;
    }
}
