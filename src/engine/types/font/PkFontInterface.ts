import * as PIXI from 'pixi.js';

export interface PkFontInterface {
    
    charWidth: number;
    
    writeText(text: string, target?: PIXI.Container): PIXI.Container;
}
