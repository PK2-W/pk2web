export interface PkRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    
    pack(separator: string): string;
    
    equals(other: PkRectangle): boolean;
    
    /** @deprecated */
    getNative(): unknown;
}

