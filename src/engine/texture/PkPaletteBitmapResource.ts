import { PkResource } from '@fwk/filesystem/PkResource';
import { NewTexture } from '@fwk/texture/NewTexture';
import { NewTextureResource } from '@fwk/texture/NewTextureResource';
import { Bitmap } from '@fwk/shared/bx-bitmap';
import { BitmapPalette } from '@fwk/shared/bx-bitmap-palette';
import { PkBinary } from '@fwk/types/PkBinary';
import { PkRectangle } from '@fwk/types/PkRectangle';
import { PekkaContext } from '@game/PekkaContext';
import * as PIXI from 'pixi.js';

export class PkPaletteBitmapResource extends NewTextureResource implements PkResource {
    private readonly _internal: Bitmap;
    private _frame: PkRectangle;
    private _buffer: PkBinary;
    
    private _cache_texture: NewTexture<PkPaletteBitmapResource>;
    private _cache_pixiRes: PIXI.resources.BufferResource;
    private _cache_pixiBaseTexture: PIXI.BaseTexture;
    
    public static async fetch(uris: string[], context: PekkaContext, child: boolean = false) {
        const binary = await context.fs.fetchBinary(uris, true);
        const instance = this.fromBinary(binary.resource);
        instance.uri = binary.uri;
        return instance;
    }
    
    public static fromBinary(binary: PkBinary): PkPaletteBitmapResource {
        return this.fromBitmap(Bitmap.fromBinary(binary));
    }
    
    public static fromBitmap(bitmap: Bitmap): PkPaletteBitmapResource {
        return new PkPaletteBitmapResource(bitmap);
    }
    
    public constructor(bitmap: Bitmap, frame?: PkRectangle) {
        super();
        
        this._internal = bitmap;
        this._frame = frame;
        
        this._internal.on(Bitmap.EV_CHANGE, this.update, this);
    }
    
    public crop(frame: PkRectangle): PkPaletteBitmapResource {
        return new PkPaletteBitmapResource(this._internal.crop(frame));
    }
    
    public get internal(): Bitmap {
        return this._internal;
    }
    
    public getTexture(frame?: PkRectangle): NewTexture<PkPaletteBitmapResource> {
        if (frame != null) {
            return new NewTexture(this, frame);
        }
        
        if (this._cache_texture == null) {
            this._cache_texture = new NewTexture<PkPaletteBitmapResource>(this);
        }
        return this._cache_texture;
    }
    
    public get width(): number {
        return this._frame != null ? this._frame.width : this._internal.width;
    }
    
    public get height(): number {
        return this._frame != null ? this._frame.height : this._internal.height;
    }
    
    private _rebuildLocalBuffer(): void {
        if (this._frame == null || (this._frame.width == this._internal.width && this._frame.height === this._internal.height)) {
            this._buffer = null;
            if (this._cache_pixiRes != null) {
                this._cache_pixiRes.data = this._internal.buffer.getUint8Array();
                this._cache_pixiRes.resize(this._internal.width, this._internal.height);
                this._cache_pixiRes.update();
            }
        } else {
            this._buffer = new PkBinary(this.width * this.height * 4);
            
            for (let j = this._frame.y1; j <= this._frame.y2; j++) {
                for (let i = this._frame.x1; i <= this._frame.x2; i++) {
                    this._buffer.streamWriteUint8(this._internal.buffer.readUint8(j * this._internal.width * 4 + i * 4));
                    this._buffer.streamWriteUint8(this._internal.buffer.readUint8(j * this._internal.width * 4 + i * 4 + 1));
                    this._buffer.streamWriteUint8(this._internal.buffer.readUint8(j * this._internal.width * 4 + i * 4 + 2));
                    this._buffer.streamWriteUint8(this._internal.buffer.readUint8(j * this._internal.width * 4 + i * 4 + 3));
                }
            }
            
            if (this._cache_pixiRes != null) {
                this._cache_pixiRes.data = this._buffer.getUint8Array();
                this._cache_pixiRes.resize(this._internal.width, this._internal.height);
                this._cache_pixiRes.update();
            }
        }
    }
    
    public update(): void {
        if (this._cache_pixiRes != null) {
            this.getPixiResource().update();
        }
    }
    
    public clone(): PkPaletteBitmapResource {
        return PkPaletteBitmapResource.fromBitmap(this._internal.clone());
    }
    
    
    ///  PIXI  ///
    
    public getPixiResource(): PIXI.resources.Resource {
        if (this._cache_pixiRes == null) {
            this._cache_pixiRes = new PIXI.resources.BufferResource(this._internal.buffer.getUint8Array(), {
                width: this.width,
                height: this.height
            });
        }
        return this._cache_pixiRes;
    }
    
    public getPixiBaseTexture(): PIXI.BaseTexture {
        if (this._cache_pixiBaseTexture == null) {
            this._cache_pixiBaseTexture = new PIXI.BaseTexture(this.getPixiResource());
        }
        return this._cache_pixiBaseTexture;
    }
}