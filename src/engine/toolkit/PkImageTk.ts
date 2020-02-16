import { PkColor } from '@ng/types/PkColor';
import { PkRectangle } from '@ng/types/PkRectangle';

export class PkImageTk {
    private constructor() {}
    
    public static imageToImageData(image: HTMLImageElement, frame?: PkRectangle): ImageData {
        const x = frame != null ? frame.x : 0;
        const y = frame != null ? frame.y : 0;
        const w = frame != null ? frame.width : image.width;
        const h = frame != null ? frame.height : image.height;
        
        // Move image to auxiliar canvas
        const cvx = this.getAuxCanvas(w, h);
        cvx.drawImage(image, -x, -y);
        
        // Return pixels
        return cvx.getImageData(0, 0, w, h);
    }
    
    public static imageRemoveTransparentPixel(image: HTMLImageElement, color?: PkColor): HTMLImageElement {
        // Move image to auxiliar canvas
        const cvx = this.getAuxCanvas(image.width, image.height);
        cvx.drawImage(image, 0, 0);
        
        // Choose default transparent color
        if (color == null) {
            color = PkColor.rgb(155, 232, 224);
            color = PkColor.rgb(148, 209, 222);
        }
        
        // Iterate and remove the transparent pixel
        const dt = cvx.getImageData(0, 0, image.width, image.height);
        for (let i = 0; i < dt.data.length; i += 4) {
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
    
    private static getAuxCanvas(width: number, height: number): CanvasRenderingContext2D {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        return context;
    }
}
