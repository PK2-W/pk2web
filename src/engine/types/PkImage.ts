import { PkColor } from '@ng/types/PkColor';
import { PkImagePixels } from '@ng/types/PkImagePixels';
import { PkImageTexture } from '@ng/types/PkImageTexture';
import { PkRectangle } from '@ng/types/PkRectangle';

export interface PkImage {
    /**
     * Returns the native {@link HTMLImageElement} object inside this image.<br>
     * The returned object is still shared with this instance.
     */
    getImage(): HTMLImageElement;
    
    /**
     * Returns a {@link PkImageTexture} from this image.<br>
     * Any change in this image will be reflected in the returned PkImageTexture.
     *
     * @param frame - If provided, the returned PkImageTexture represents a portion of this image.
     */
    getTexture(frame?: PkRectangle): PkImageTexture;
    
    getPixels(): PkImagePixels;
    removeTransparentPixel(color?: PkColor): this;
    
    /** Width of the image. */
    width: number;
    /** Height of the image. */
    height: number
}
