export class PkColor {
    private _red: number;
    private _green: number;
    private _blue: number;
    private _alpha: number;
    
    public static rgb(r: number, g: number, b: number): PkColor {
        const color = new PkColor();
        
        color._red = r;
        color._green = g;
        color._blue = b;
        color._alpha = 255;
        
        return color;
    }
    
    public static bgr(b: number, g: number, r: number): PkColor {
        const color = new PkColor();
        
        color._red = r;
        color._green = g;
        color._blue = b;
        color._alpha = 255;
        
        return color;
    }
    
    public static rgba(r: number, g: number, b: number, a: number): PkColor {
        const color = new PkColor();
        
        color._red = r;
        color._green = g;
        color._blue = b;
        color._alpha = a;
        
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
    
    public get a(): number {
        return this._alpha;
    }
}
