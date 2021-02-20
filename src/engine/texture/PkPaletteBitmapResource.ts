import { NewTexture } from '@fwk/texture/NewTexture';
import { NewTextureResource } from '@fwk/texture/NewTextureResource';
import { Bitmap3 } from '@fwk/types/bitmap/Bitmap3';
import { Bitmap3Palette } from '@fwk/types/bitmap/Bitmap3Palette';
import { PkBinary } from '@fwk/types/PkBinary';
import { PkRectangle } from '@fwk/types/PkRectangle';
import * as PIXI from 'pixi.js';

export class PkPaletteBitmapResource extends NewTextureResource {
    private readonly _bitmap: Bitmap3;
    private _frame: PkRectangle;
    private _buffer: PkBinary;
    
    private _cache_texture: NewTexture<PkPaletteBitmapResource>;
    private _cache_pixiRes: PIXI.resources.BufferResource;
    private _cache_pixiBaseTexture: PIXI.BaseTexture;
    
    public static fromBinary(binary: PkBinary): PkPaletteBitmapResource {
        return this.fromBitmap(Bitmap3.fromBinary(binary));
    }
    
    public static fromBitmap(bitmap: Bitmap3): PkPaletteBitmapResource {
        return new PkPaletteBitmapResource(bitmap);
    }
    
    public constructor(bitmap: Bitmap3, frame?: PkRectangle) {
        super();
        
        this._bitmap = bitmap;
        this._frame = frame;
    }
    
    public project(frame: PkRectangle): PkPaletteBitmapResource {
        return new PkPaletteBitmapResource(this._bitmap, frame);
    }
    
    public crop(frame: PkRectangle): PkPaletteBitmapResource {
        return new PkPaletteBitmapResource(this._bitmap.crop(frame));
    }
    
    public get bitmap(): Bitmap3 {
        return this._bitmap;
    }
    
    public getTexture(): NewTexture<PkPaletteBitmapResource> {
        if (this._cache_texture == null) {
            this._cache_texture = new NewTexture<PkPaletteBitmapResource>(this);
        }
        return this._cache_texture;
    }
    
    public get width(): number {
        return this._frame != null ? this._frame.width : this._bitmap.width;
    }
    
    public get height(): number {
        return this._frame != null ? this._frame.height : this._bitmap.height;
    }
    
    private _rebuildLocalBuffer(): void {
        if (this._frame == null || (this._frame.width == this._bitmap.width && this._frame.height === this._bitmap.height)) {
            this._buffer = null;
            if (this._cache_pixiRes != null) {
                this._cache_pixiRes.data = this._bitmap.buffer.getUint8Array();
                this._cache_pixiRes.resize(this._bitmap.width, this._bitmap.height);
                this._cache_pixiRes.update();
            }
        } else {
            this._buffer = new PkBinary(this.width * this.height * 4);
            
            for (let j = this._frame.y1; j <= this._frame.y2; j++) {
                for (let i = this._frame.x1; i <= this._frame.x2; i++) {
                    this._buffer.streamWriteUint8(this._bitmap.buffer.readUint8(j * this._bitmap.width * 4 + i * 4));
                    this._buffer.streamWriteUint8(this._bitmap.buffer.readUint8(j * this._bitmap.width * 4 + i * 4 + 1));
                    this._buffer.streamWriteUint8(this._bitmap.buffer.readUint8(j * this._bitmap.width * 4 + i * 4 + 2));
                    this._buffer.streamWriteUint8(this._bitmap.buffer.readUint8(j * this._bitmap.width * 4 + i * 4 + 3));
                }
            }
            
            if (this._cache_pixiRes != null) {
                this._cache_pixiRes.data = this._buffer.getUint8Array();
                this._cache_pixiRes.resize(this._bitmap.width, this._bitmap.height);
                this._cache_pixiRes.update();
            }
        }
    }
    
    public update(): void {
        this.getPixiResource().update();
    }
    
    
    ///  PIXI  ///
    
    public getPixiResource(): PIXI.resources.Resource {
        if (this._cache_pixiRes == null) {
            this._cache_pixiRes = new PIXI.resources.BufferResource(this._bitmap.buffer.getUint8Array(), {
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