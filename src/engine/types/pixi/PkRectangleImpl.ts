import { PkRectangle } from '@ng/types/PkRectangle';
import * as PIXI from 'pixi.js';

export class PkRectangleImpl implements PkRectangle {
    private readonly _rect: PIXI.Rectangle;
    
    public static $(x: number, y: number, width: number, height: number): PkRectangleImpl {
        return new PkRectangleImpl(x, y, width, height);
    }
    
    public static fromRectangle(rect: PkRectangle): PkRectangleImpl {
        if (rect == null) {
            return null;
        } else if (rect instanceof PkRectangleImpl) {
            return rect;
        } else {
            return new PkRectangleImpl(rect.x, rect.y, rect.width, rect.height);
        }
    }
    
    public static getPixiRectangle(rect: PkRectangle): PIXI.Rectangle {
        if (rect == null) {
            return null;
        } else if (rect instanceof PkRectangleImpl) {
            return rect.getNative();
        } else {
            return new PIXI.Rectangle(rect.x, rect.y, rect.width, rect.height);
        }
    }
    
    public constructor(x: number, y: number, width: number, height: number) {
        if (!PkRectangleImpl.checkInput(x) || !PkRectangleImpl.checkInput(y) || !PkRectangleImpl.checkInput(width) || !PkRectangleImpl.checkInput(height)) {
            throw new TypeError('Trying to create a Rectangle wit a non numeric or null coordinate.');
        }
        
        this._rect = new PIXI.Rectangle(x, y, width, height);
    }
    
    public get x(): number {
        return this._rect.x;
    }
    public get x1(): number {
        return this.x;
    }
    
    public get y(): number {
        return this._rect.y;
    }
    public get y1(): number {
        return this.y;
    }
    
    public get width(): number {
        return this._rect.width;
    }
    
    public get height(): number {
        return this._rect.height;
    }
    
    public get x2(): number {
        return this.x1 + this.width;
    }
    
    public get y2(): number {
        return this.y1 + this.height;
    }
    
    // TODO: Cachear
    public pack(separator: string = ''): string {
        return this.x + separator + this.y + separator + this.width + separator + this.height;
    }
    
    public getNative(): PIXI.Rectangle {
        return this._rect;
    }
    
    private static checkInput(n: unknown): boolean {
        return typeof n === 'number';
    }
    
    public inspect(): string {
        return `{ ${ this.pack(', ') } }`;
    }
}
