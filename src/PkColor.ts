export class PkColor {
    private _red: number;
    private _green: number;
    private _blue: number;
    
    public static rgb(r: number, g: number, b: number): PkColor {
        const color = new PkColor();
        
        color._red = r;
        color._green = g;
        color._blue = b;
        
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
}
