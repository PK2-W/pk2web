export class PkColor {
    private _red: number;
    private _green: number;
    private _blue: number;
    private _alpha: number;
    
    public static bgr(b: number, g: number, r: number): PkColor {
        const color = new PkColor();
        
        color._red = r;
        color._green = g;
        color._blue = b;
        color._alpha = 255;
        
        return color;
    }
    
    public static rgba(r: number, g: number, b: number, a255: number = 255): PkColor {
        const color = new PkColor();
        
        color._red = r;
        color._green = g;
        color._blue = b;
        color._alpha = a255;
        
        return color;
    }
    
    public static rgba1(r: number, g: number, b: number, a01: number): PkColor {
        const color = new PkColor();
        
        color._red = r;
        color._green = g;
        color._blue = b;
        color._alpha = a01 * 255;
        
        return color;
    }
    
    public get r(): number {
        return this._red;
    }
    
    public get g(): number {
        return this._green;
    }
    
    public get b(): number {
        return this._blue;
    }
    
    public get a255(): number {
        return this._alpha;
    }
    
    public get a01(): number {
        return this._alpha / 255;
    }
    
    public toRGBInt(): number {
        return ((1 << 24) + (this.r << 16) + (this.g << 8) + this.b);
    }
    
    public equalsRGB(other: PkColor): boolean {
        return this._red === other._red
            && this._green === other._green
            && this._blue === other._blue;
    }
    
    public equalsRGBA(other: PkColor): boolean {
        return this.equalsRGB(other)
            && this._alpha === other._alpha;
    }
    
    public clone(): PkColor {
        return PkColor.rgba(this.r, this.g, this.b, this.a255);
    }
}

export type TColor = number;