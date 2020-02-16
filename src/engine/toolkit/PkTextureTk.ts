import { PkColor } from '../types/PkColor';
import * as PIXI from 'pixi.js';

export class PkTextureTk {
    private constructor() {}
    

    
    public static imageToBaseTexture(image: HTMLImageElement): PIXI.BaseTexture {
        return new PIXI.BaseTexture(image);
    }
    
    public static textureFromBaseTexture(baseTexture: PIXI.BaseTexture, x: number, y: number, size: number): PIXI.Texture ;
    public static textureFromBaseTexture(baseTexture: PIXI.BaseTexture, x: number, y: number, width: number, height: number): PIXI.Texture ;
    public static textureFromBaseTexture(baseTexture: PIXI.BaseTexture, x: number, y: number, w: number, h?: number): PIXI.Texture {
        return new PIXI.Texture(baseTexture, new PIXI.Rectangle(x, y, w, h == null ? w : h));
    }
    
    public static textureToImagePixels(texture: PIXI.Texture) {
        if (texture.baseTexture.resource instanceof PIXI.resources.BaseImageResource) {
        
        }
    }
    
    private static getAuxCanvas(width: number, height: number): CanvasRenderingContext2D {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        return context;
    }
}
