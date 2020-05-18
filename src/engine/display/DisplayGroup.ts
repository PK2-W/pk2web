import { DisplayObject } from '@ng/display/DisplayObject';
import { ContainerWrapper } from '@ng/display/pixi/ContainerWrapper';
import { RenderContext } from '@ng/render/RenderContext';
import * as PIXI from 'pixi.js';

export interface DisplayGroup extends DisplayObject<PIXI.Container> {
    
    addChild(...children: DisplayObject<any>[]): this;
    
    get(index: number);
    
}