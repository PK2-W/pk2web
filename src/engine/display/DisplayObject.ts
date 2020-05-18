import * as PIXI from 'pixi.js';

export abstract class DisplayObject<T extends PIXI.DisplayObject> {
    protected _native: T;
    
    protected constructor(native: T) {
    }
}