import { EventEmitter } from 'eventemitter3';

export abstract class PkRectangle extends EventEmitter {
    public abstract x: number;
    public abstract y: number;
    public abstract width: number;
    public abstract height: number;
    
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
    
    public abstract change(x: number, y: number, width: number, height: number): void;
    
    public abstract pack(separator: string): string;
    
    public abstract equals(other: PkRectangle): boolean;
    
    /** @deprecated */
    public abstract getNative(): unknown;
    
    
    ///  Eventos  ///
    
    public static readonly EV_CHANGE = Symbol('change.rectangle.ev');
}

