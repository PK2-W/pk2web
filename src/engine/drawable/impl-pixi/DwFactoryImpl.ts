import { DwCanvas } from '@ng/drawable/skeleton/DwCanvas';
import { DwContainer } from '@ng/drawable/skeleton/DwContainer';
import { DwFactory } from '@ng/drawable/skeleton/DwFactory';
import { DwSprite } from '@ng/drawable/skeleton/DwSprite';
import { DwCanvasImpl } from '@ng/drawable/impl-pixi/DwCanvasImpl';
import { DwContainerImpl } from '@ng/drawable/impl-pixi/DwContainerImpl';
import { DwSpriteImpl } from '@ng/drawable/impl-pixi/DwSpriteImpl';

export class DwFactoryImpl implements DwFactory {
    public canvas(): DwCanvas {
        return new DwCanvasImpl();
    }
    
    public container(): DwContainer {
        return new DwContainerImpl();
    }
    
    public sprite(): DwSprite {
        return new DwSpriteImpl();
    }
}