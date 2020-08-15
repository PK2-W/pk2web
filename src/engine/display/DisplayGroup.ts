import { DisplayObject } from '@ng/display/DisplayObject';
import * as PIXI from 'pixi.js';

export interface DisplayGroup extends DisplayObject<PIXI.Container> {
    
    addChild(...children: DisplayObject<any>[]): this;
    
    get(index: number);
    
}