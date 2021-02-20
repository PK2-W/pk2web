import { PkError } from '@fwk/error/PkError';
import { Log } from '@fwk/support/log/LoggerImpl';
import { ifnul } from '@fwk/support/utils';
import { PkAssetTk } from '@fwk/toolkit/PkAssetTk';
import { PkBitmapBT } from '@fwk/types/image/PkBitmapBT';
import { PkImageBitmapBT } from '@fwk/types/image/PkImageBitmapBT';
import { PkBinary } from '@fwk/types/PkBinary';
import { PkImageTexture } from '@fwk/types/PkImageTexture';
import { PkRectangle } from '@fwk/types/PkRectangle';
import { PkSound } from '@fwk/types/PkSound';

export class PkAssetCache {
    private readonly _binaryIndex: Map<string, PkBinary>;
    private readonly _imageIndex: Map<string, PkImageBitmapBT>;
    private readonly _bitmapIndex: Map<string, PkBitmapBT>;
    private readonly _soundIndex: Map<string, PkSound>;
    private readonly _textureIndex: Map<string, any>;
    
    
    public constructor() {
        this._binaryIndex = new Map();
        this._imageIndex = new Map();
        this._bitmapIndex = new Map();
        this._soundIndex = new Map();
        this._textureIndex = new Map();
    }
    
    private static _getByUrl<T>(map: Map<string, T>, url: string): T {
        return ifnul(map.get('u::' + url));
    }
    
    private static _getByKey<T>(map: Map<string, T>, cacheKey: string): T {
        return ifnul(map.get('k::' + cacheKey));
    }
    
    private static async _fetchOne<T>(calls: (() => Promise<T>)[]) {
        const errors = [];
        
        for (let call of calls) {
            try {
                return await call();
            } catch (err) {
                errors.push(err);
            }
        }
        
        Log.e('[~AssetCache]',
            new Error('Couldn\'t load the resource from any of the provided locations:\n' + errors.map(e => ' · ' + e.message).join('\n')));
    }
    
    
    ///  PkBinary  ///
    
    public async fetchBinary(url: string | string[], cacheKey?: string): Promise<PkBinary> {
        if (Array.isArray(url)) {
            return PkAssetCache._fetchOne(url.map(url => this.fetchBinary.bind(this, url, cacheKey)));
        } else {
            let asset = this.getBinaryByUrl(url);
            if (asset == null) {
                asset = await PkAssetTk.getBinary(url);
                
                this._binaryIndex.set('u::' + url, asset);
                if (cacheKey != null) {
                    this._binaryIndex.set('k::' + cacheKey, asset);
                }
                
                Log.d('[~AssetCache] Cached binary on "', url, '"',
                    cacheKey != null ? ' with key "' + cacheKey + '"' : '');
            }
            
            return asset;
        }
    }
    
    public getBinaryByUrl(url: string): PkBinary {
        return PkAssetCache._getByUrl(this._binaryIndex, url);
    }
    
    public getBinaryByKey(cacheKey: string): PkBinary {
        return PkAssetCache._getByKey(this._binaryIndex, cacheKey);
    }
    
    
    ///  PkImage  ///
    
    public async fetchImage(url: string | string[], cacheKey?: string): Promise<PkImageBitmapBT> {
        if (Array.isArray(url)) {
            return PkAssetCache._fetchOne(url.map(url => this.fetchImage.bind(this, url, cacheKey)));
        } else {
            let asset = this.getImageByUrl(url);
            if (asset == null) {
                asset = await PkAssetTk.getImage(url);
                
                this._imageIndex.set('u::' + url, asset);
                if (cacheKey != null) {
                    this._imageIndex.set('k::' + cacheKey, asset);
                }
                
                Log.d('[~AssetCache] Cached image on "', url, '"',
                    cacheKey != null ? ' with key "' + cacheKey + '"' : '');
            }
            
            return asset;
        }
    }
    
    public getImageByUrl(url: string): PkImageBitmapBT {
        return PkAssetCache._getByUrl(this._imageIndex, url);
    }
    
    public getImageByKey(cacheKey: string): PkImageBitmapBT {
        return PkAssetCache._getByKey(this._imageIndex, cacheKey);
    }
    
    
    ///   PkBitmap  ///
    
    public addBitmap(key: string, bitmap: PkBitmapBT) {
        if (bitmap == null) {
            throw new AssetCacheError(`The resource to be cached is null.`);
        }
        this._bitmapIndex.set(key, bitmap);
    }
    
    public getBitmap(key: string) {
        return this._bitmapIndex.get(key);
    }
    
    public async fetchBitmap(url: string | string[], cacheKey?: string): Promise<PkBitmapBT> {
        if (Array.isArray(url)) {
            return PkAssetCache._fetchOne(url.map(url => this.fetchBitmap.bind(this, url, cacheKey)));
        } else {
            let asset = this.getBitmapByUrl(url);
            if (asset == null) {
                asset = await PkAssetTk.getBitmap(url);
                
                this._bitmapIndex.set('u::' + url, asset);
                if (cacheKey != null) {
                    this._bitmapIndex.set('k::' + cacheKey, asset);
                }
                // this._imageIndex.set('u::' + url, asset);
                // if (cacheKey != null) {
                //     this._imageIndex.set('k::' + cacheKey, asset);
                // }
                
                Log.d('[~AssetCache] Cached bitmap on "', url, '"',
                    cacheKey != null ? ' with key "' + cacheKey + '"' : '');
            }
            
            return asset;
        }
    }
    
    public getBitmapByUrl(url: string): PkBitmapBT {
        return PkAssetCache._getByUrl(this._bitmapIndex, url);
    }
    
    public getBitmapByKey(cacheKey: string): PkBitmapBT {
        return PkAssetCache._getByKey(this._bitmapIndex, cacheKey);
    }
    
    
    ///  PkSound  ///
    
    public addSound(key: string, sound: PkSound) {
        if (sound == null) {
            throw new AssetCacheError(`The resource to be cached is null.`);
        }
        this._soundIndex.set(key, sound);
    }
    
    public getSound(key: string) {
        return this._soundIndex.get(key);
    }
    
    
    public async fetchSound(url: string | string[], cacheKey?: string): Promise<PkSound> {
        if (Array.isArray(url)) {
            return PkAssetCache._fetchOne(url.map(url => this.fetchSound.bind(this, url, cacheKey)));
        } else {
            let asset = this.getSoundByUrl(url);
            if (asset == null) {
                asset = await PkAssetTk.getSound(url);
                
                this._soundIndex.set('u::' + url, asset);
                if (cacheKey != null) {
                    this._soundIndex.set('k::' + cacheKey, asset);
                }
                
                Log.d('[~AssetCache] Cached sound on "', url, '"',
                    cacheKey != null ? ' with key "' + cacheKey + '"' : '');
            }
            
            return asset;
        }
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
            frame = PkRectangle.$(x, y, w, h);
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

export class AssetCacheError extends PkError {
}