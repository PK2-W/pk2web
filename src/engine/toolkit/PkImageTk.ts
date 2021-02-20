import { PkBinary } from '@fwk/types/PkBinary';
import { PkColor } from '@fwk/types/PkColor';
import { PkRectangle } from '@fwk/types/PkRectangle';

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
    
    public static imageRemoveTransparentPixel(image: HTMLImageElement, color: PkColor): HTMLImageElement {
        // Move image to auxiliar canvas
        const cvx = this.getAuxCanvas(image.width, image.height);
        cvx.drawImage(image, 0, 0);
        
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
        outImage.src = cvx.canvas.toDataURL('image/bmp');
        
        return outImage;
    }
    
    public static async binaryToImage(binary: PkBinary): Promise<HTMLImageElement> {
        const uri = URL.createObjectURL(binary.getBlob());
        return await PkImageTk.getImage(uri);
    }
    
    public static cropImage(image: HTMLImageElement, frame?: PkRectangle): HTMLImageElement {
        // return new Promise(async (resolve, reject) => {
        const x = frame != null ? frame.x : 0;
        const y = frame != null ? frame.y : 0;
        const w = frame != null ? frame.width : image.width;
        const h = frame != null ? frame.height : image.height;
        
        // Move image to auxiliar canvas
        const cvx = this.getAuxCanvas(w, h);
        cvx.drawImage(image, -x, -y);
        
        // Return image
        const image2 = new Image(w, h);
        // image2.onload = () => resolve(image2);
        //  image2.onerror = () => reject();
        image2.src = cvx.canvas.toDataURL('image/png');
        return image2;
        //  });
    }
    
    public static getImage(safeUri: string): Promise<HTMLImageElement> {
        return new Promise(async (resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject();
            image.src = safeUri;
        });
    }
    
    private static getAuxCanvas(width: number, height: number): CanvasRenderingContext2D {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        return context;
    }
}
