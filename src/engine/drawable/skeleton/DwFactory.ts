import { DwFactoryImpl } from '@ng/drawable/impl-pixi/DwFactoryImpl';
import type { DwCanvas } from '@ng/drawable/skeleton/DwCanvas';
import type { DwContainer } from '@ng/drawable/skeleton/DwContainer';
import type { DwSprite } from '@ng/drawable/skeleton/DwSprite';

export abstract class DwFactory {
    public static readonly new = new DwFactoryImpl();
    
    /**
     * Returns the appropriate implementation of a Drawable Container.
     */
    public abstract container(): DwContainer;
    /**
     * Returns the appropriate implementation of a Drawable Canvas.
     */
    public abstract canvas(): DwCanvas;
    /**
     * Returns the appropriate implementation of a Drawable Sprite.
     */
    public abstract sprite(): DwSprite;
}