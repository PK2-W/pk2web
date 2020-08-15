import type { Dw } from '@ng/drawable/skeleton/Dw';
import type { TPoint } from '@ng/types/IPoint';
import type { PkImageTexture } from '@ng/types/PkImageTexture';

export interface DwSprite extends Dw {
    texture: PkImageTexture;
    setTexture(texture: PkImageTexture): this;
    
    /**
     * Sprite origin position releative to itself.<br>
     * By default (0,0), meaning top-left corner.<br>
     * Possible values goes from 0 to 1, with (0.5, 0.5) being the middle and (1,1) the bottom-right corner.
     */
    anchor: TPoint;
    /**
     * Sets the {@link anchor} property.
     */
    setAnchor(anchor: TPoint): this;
    
    /**
     * Sprite scale, as a couple of multipliers for both axes.
     */
    scale: TPoint;
    /**
     * Sets the {@link scale} property.
     */
    setScale(scale: TPoint): this;
}