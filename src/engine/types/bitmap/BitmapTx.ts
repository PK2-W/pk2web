import { Bitmap3 } from '@fwk/types/bitmap/Bitmap3';
import { PkRectangle } from '@fwk/types/PkRectangle';
import * as PIXI from 'pixi.js';

/** @deprecated */
export class BitmapTx {
    private _parent: BitmapTx;
    private _parentFrame: PkRectangle;
    private _parentTweaks: any[];
    
    private _localBitmap: Bitmap3;
    
    public static create(bitmap: Bitmap3): BitmapTx {
        const self = new BitmapTx();
        self._localBitmap = bitmap;
        return self;
    }
    
    private static derive(bitmapTx: BitmapTx): BitmapTx {
        const self = new BitmapTx();
        self._parent = bitmapTx;
        return self;
    }
    
    public crop() {
    
    }
    
    public get texture(): PIXI.Texture {
    
    }
}

class BitmapResource extends  PIXI.resources.BufferResource{

}