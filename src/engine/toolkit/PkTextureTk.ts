import { PkColor } from '../../PkColor';

export class PkTextureTk {
    private constructructor() {}
    
    public static imageRemoveTransparentPixel(image: HTMLImageElement, color?: PkColor): HTMLImageElement {
        // Move image to auxiliar canvas
        const cvx = this.getAuxCanvas(image.width, image.height);
        cvx.drawImage(image, 0, 0);
        
        // Choose default transparent color
        if (color == null) {
            color = PkColor.rgb(155, 232, 224);
        }
        
        // Iterate and remove the transparent pixel
        const dt = cvx.getImageData(0, 0, image.width, image.height);
        for (let i = 0; i < dt.data.length; i += 4) {
            //const v = dt.data[i + 3] = 255;
            if (dt.data[i] === color.r && dt.data[i + 1] === color.g && dt.data[i + 2] === color.b) {
                dt.data[i + 3] = 0;
            }
        }
        cvx.putImageData(dt, 0, 0);
        
        // Move modified image to Image element
        const outImage = new Image();
        outImage.src = cvx.canvas.toDataURL();
        
        return outImage;
    }
    
    public static imageToBaseTexture(image: HTMLImageElement): PIXI.BaseTexture {
        return new PIXI.BaseTexture(image);
    }
    
    public static textureFromBaseTexture(baseTexture: PIXI.BaseTexture, x: number, y: number, size: number): PIXI.Texture ;
    public static textureFromBaseTexture(baseTexture: PIXI.BaseTexture, x: number, y: number, width: number, height: number): PIXI.Texture ;
    public static textureFromBaseTexture(baseTexture: PIXI.BaseTexture, x: number, y: number, w: number, h?: number): PIXI.Texture {
        return new PIXI.Texture(baseTexture, new PIXI.Rectangle(x, y, w, h == null ? w : h));
    }
    
    private static getAuxCanvas(width: number, height: number): CanvasRenderingContext2D {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        return context;
    }
}
