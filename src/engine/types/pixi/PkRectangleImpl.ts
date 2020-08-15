import { PkRectangle } from '@ng/types/PkRectangle';
import * as PIXI from 'pixi.js';

export class PkRectangleImpl extends PkRectangle {
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
        super();
        
        if (!PkRectangleImpl.checkInput(x) || !PkRectangleImpl.checkInput(y) || !PkRectangleImpl.checkInput(width) || !PkRectangleImpl.checkInput(height)) {
            throw new TypeError('Trying to create a Rectangle wit a non numeric or null coordinate.');
        }
        
        this._rect = new PIXI.Rectangle(x, y, width, height);
    }
    
    public get x(): number { return this._rect.x; }
    public set x(x: number) {
        this._rect.x = x;
        this.emit(PkRectangle.EV_CHANGE, this);
    }
    
    public get y(): number { return this._rect.y; }
    public set y(y: number) {
        this._rect.y = y;
        this.emit(PkRectangle.EV_CHANGE, this);
    }
    
    public get width(): number { return this._rect.width; }
    public set width(width: number) {
        this._rect.width = width;
        this.emit(PkRectangle.EV_CHANGE, this);
    }
    
    public get height(): number { return this._rect.height; }
    public set height(height: number) {
        this._rect.height = height;
        this.emit(PkRectangle.EV_CHANGE, this);
    }
    
    public change(x: number, y: number, width: number, height: number): void {
        this._rect.x = x;
        this._rect.y = y;
        this._rect.width = width;
        this._rect.height = height;
        
        this.emit(PkRectangle.EV_CHANGE, this);
    }
    
    // TODO: Cachear
    public pack(separator: string = ''): string {
        return this.x + separator + this.y + separator + this.width + separator + this.height;
    }
    
    public equals(other: PkRectangle): boolean {
        return this._rect.x == other.x
            && this._rect.y == other.y
            && this._rect.width == other.width
            && this._rect.height == other.height;
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
