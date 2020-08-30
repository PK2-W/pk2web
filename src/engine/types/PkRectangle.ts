import { EventEmitter } from 'eventemitter3';
import * as PIXI from 'pixi.js';

export class PkRectangle extends EventEmitter implements PIXI.Rectangle {
    private _rect: PIXI.Rectangle;
    public readonly type = PIXI.SHAPES.RECT;
    
    public static $(x: number, y: number, width: number, height: number): PkRectangle {
        return new PkRectangle(x, y, width, height);
    }
    
    public static fromRectangle(rect: PIXI.Rectangle): PkRectangle {
        if (rect == null) {
            return null;
        } else {
            return new PkRectangle(rect.x, rect.y, rect.width, rect.height);
        }
    }
    
    public static asRectangle(rect: PIXI.Rectangle): PkRectangle {
        if (rect == null) {
            return null;
        } else if (rect instanceof PkRectangle) {
            return rect;
        } else {
            return new PkRectangle(rect.x, rect.y, rect.width, rect.height);
        }
    }
    
    private static checkInput(n: unknown): boolean {
        return typeof n === 'number';
    }
    
    public constructor(x: number, y: number, width: number, height: number) {
        super();
        
        if (!PkRectangle.checkInput(x) || !PkRectangle.checkInput(y) || !PkRectangle.checkInput(width) || !PkRectangle.checkInput(height)) {
            throw new TypeError('Trying to create a Rectangle with a non numeric or null coordinate.');
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
    
    public get x1(): number { return this.x; }
    public set x1(x: number) { this.x = x; }
    public get left(): number { return this.x; }
    public set left(l: number) { this.x = l; }
    
    public get y1(): number { return this.y; }
    public set y1(y: number) { this.y = y; }
    public get top(): number { return this.y; }
    public set top(t: number) { this.y = t; }
    
    public get x2(): number { return this.x1 + this.width; }
    public set x2(x2: number) { this.width = x2 - this.x1; }
    public get right(): number { return this.x2; }
    public set right(r: number) { this.width = r - this.x1; }
    
    public get y2(): number { return this.y1 + this.height; }
    public set y2(y2: number) { this.height = y2 - this.y1; }
    public get bottom(): number { return this.y2; }
    public set bottom(r: number) { this.height = r - this.y1; }
    
    public change(x: number, y: number, width: number, height: number): void {
        this._rect.x = x;
        this._rect.y = y;
        this._rect.width = width;
        this._rect.height = height;
        
        this.emit(PkRectangle.EV_CHANGE, this);
    }
    
    public ceil(resolution?: number, eps?: number): PIXI.Rectangle {
        return this._rect.ceil(resolution, eps);
    }
    
    public copyFrom(rectangle: PIXI.Rectangle): PIXI.Rectangle {
        return this._rect.copyFrom(rectangle);
    }
    
    public clone(): PkRectangle {
        return PkRectangle.fromRectangle(this);
    }
    
    public copyTo<T extends PIXI.Rectangle>(rectangle: T): T {
        rectangle.x = this.x;
        rectangle.y = this.y;
        rectangle.width = this.width;
        rectangle.height = this.height;
        return rectangle;
    }
    
    public contains(x: number, y: number): boolean {
        return this._rect.contains(x, y);
    }
    
    public enlarge(rectangle: PIXI.Rectangle): this {
        this._rect.enlarge(rectangle);
        return this;
    }
    
    public pad(paddingX?: number, paddingY?: number): this {
        this._rect.pad(paddingX, paddingY);
        return this;
    }
    
    public fit(rectangle: PIXI.Rectangle): PkRectangle {
        this._rect.fit(rectangle);
        return this;
    }
    
    // TODO: Cachear
    public pack(separator: string = ''): string {
        return this.x + separator + this.y + separator + this.width + separator + this.height;
    }
    
    public equals(other: PIXI.Rectangle): boolean {
        return this.x == other.x
            && this.y == other.y
            && this.width == other.width
            && this.height == other.height;
    }
    
    public toString(): string {
        return this.pack(', ');
    }
    
    public inspect(): string {
        return `{ ${ this.toString() } }`;
    }
    
    
    ///  Eventos  ///
    
    public static readonly EV_CHANGE = Symbol('change.rectangle.ev');
}

