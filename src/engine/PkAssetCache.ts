import { Log } from '@ng/support/log/LoggerImpl';
import { ifnul } from '@ng/support/utils';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';
import { PkRectangleImpl } from '@ng/types/pixi/PkRectangleImpl';
import { PkBitmap } from '@ng/types/PkBitmap';
import { PkImage } from '@ng/types/PkImage';
import { PkImageTexture } from '@ng/types/PkImageTexture';
import { PkRectangle } from '@ng/types/PkRectangle';
import { PkSound } from '@ng/types/PkSound';

export class PkAssetCache {
    private _imageIndex: Map<string, PkImage>;
    private _bitmapIndex: Map<string, PkBitmap>;
    private _soundIndex: Map<string, PkSound>;
    private _textureIndex: Map<string, PkImageTexture>;
    
    
    public constructor() {
        this._imageIndex = new Map();
        this._bitmapIndex = new Map();
        this._soundIndex = new Map();
        this._textureIndex = new Map();
    }
    
    private static _getByUrl<T>(map: Map<string, T>, url: string) {
        return ifnul(map.get('u::' + url));
    }
    
    private static _getByKey<T>(map: Map<string, T>, cacheKey: string) {
        return ifnul(map.get('k::' + cacheKey));
    }
    
    
    ///  PkImage  ///
    
    public async fetchImage(url: string, cacheKey?: string): Promise<PkImage> {
        let asset = this.getImageByUrl(url);
        if (asset == null) {
            asset = await PkAssetTk.getImage(url);
            
            this._imageIndex.set('u::' + url, asset);
            if (cacheKey != null) {
                this._imageIndex.set('k::' + cacheKey, asset);
            }
            
            Log.d('[PkAssetCache] Cached image on "', url, '"',
                cacheKey != null ? ' with key "' + cacheKey + '"' : '');
        }
        
        return asset;
    }
    
    public getImageByUrl(url: string): PkImage {
        return PkAssetCache._getByUrl(this._imageIndex, url);
    }
    
    public getImageByKey(cacheKey: string): PkImage {
        return PkAssetCache._getByKey(this._imageIndex, cacheKey);
    }
    
    
    ///  PkBitmap  ///
    
    public async fetchBitmap(url: string, cacheKey?: string): Promise<PkBitmap> {
        let asset = this.getBitmapByUrl(url);
        if (asset == null) {
            asset = await PkAssetTk.getBitmap(url);
            
            this._bitmapIndex.set('u::' + url, asset);
            if (cacheKey != null) {
                this._bitmapIndex.set('k::' + cacheKey, asset);
            }
            this._imageIndex.set('u::' + url, asset);
            if (cacheKey != null) {
                this._imageIndex.set('k::' + cacheKey, asset);
            }
            
            Log.d('[PkAssetCache] Cached bitmap on "', url, '"',
                cacheKey != null ? ' with key "' + cacheKey + '"' : '');
        }
        
        return asset;
    }
    
    public getBitmapByUrl(url: string): PkBitmap {
        return PkAssetCache._getByUrl(this._bitmapIndex, url);
    }
    
    public getBitmapByKey(cacheKey: string): PkBitmap {
        return PkAssetCache._getByKey(this._bitmapIndex, cacheKey);
    }
    
    
    ///  PkSound  ///
    
    public async fetchSound(url: string, cacheKey?: string): Promise<PkSound> {
        let asset = this.getSoundByUrl(url);
        if (asset == null) {
            asset = await PkAssetTk.getSound(url);
            
            this._soundIndex.set('u::' + url, asset);
            if (cacheKey != null) {
                this._soundIndex.set('k::' + cacheKey, asset);
            }
            
            Log.d('[PkAssetCache] Cached sound on "', url, '"',
                cacheKey != null ? ' with key "' + cacheKey + '"' : '');
        }
        
        return asset;
    }
    
    public getSoundByUrl(url: string): PkSound {
        return PkAssetCache._getByUrl(this._soundIndex, url);
    }
    
    public getSoundByKey(cacheKey: string): PkSound {
        return PkAssetCache._getByKey(this._soundIndex, cacheKey);
    }
    
    
    ///  PkTextureImage  ///
    
    public getTextureByUrl(url: string, a?: number | PkRectangle, y?: number, w?: number, h?: number): PkImageTexture {
        if (a == null || typeof a === 'number') {
            return this._getTextureByIndex('u::' + url, a as number, y, w, h);
        } else {
            return this._getTextureByIndex('u::' + url, a.x, a.y, a.width, a.height);
        }
    }
    
    public getTextureByKey(url: string, a?: number | PkRectangle, y?: number, w?: number, h?: number): PkImageTexture {
        if (a == null || typeof a === 'number') {
            return this._getTextureByIndex('k::' + url, a as number, y, w, h);
        } else {
            return this._getTextureByIndex('k::' + url, a.x, a.y, a.width, a.height);
        }
    }
    
    private _getTextureByIndex(baseKey: string, x: number, y: number, w: number, h: number): PkImageTexture {
        let key = '';
        let extension = '';
        let frame: PkRectangle;
        let texture: PkImageTexture;
        
        if (x != null) {
            frame = PkRectangleImpl.$(x, y, w, h);
            extension = '::' + frame.x + ':' + frame.y + ':' + frame.width + ':' + frame.height;
        }
        
        // Try to get the requested texture
        key = baseKey + extension;
        texture = this._textureIndex.get(key);
        
        if (texture == null) {
            // Get image
            const image = this._imageIndex.get(baseKey);
            if (image == null) {
                console.error('Couldn\'t get texture: ' + baseKey);
                //return PIXI.Texture.EMPTY;
                throw new Error('Couldn\'t get texture: ' + baseKey);
            }
            
            // Create the requested texture
            texture = image.getTexture(frame);
            
            // Cache the texture
            this._textureIndex.set(key, texture);
        }
        
        return texture;
    }
}