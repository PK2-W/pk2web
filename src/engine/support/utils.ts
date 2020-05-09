const TRIM_RX = /(^\s+|\s+$)/g;
const DUPL_SLASH_RX = /\/{2,}/g;

/**
 * Equivalente function for "atoi".
 *
 * @param str
 */
export function str2num(str: string): number {
    const num = Number(str);
    
    if (isNaN(num))
        throw new Error(`Failed parsing "${ str }" as a number.`);
    
    return num;
}

export function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}

export function minmax(n: number, min: number, max: number): number {
    if (n < min) return min;
    if (n > max) return max;
    return n;
}

export function ifnul<T>(nullable: T | null, replacement: T = null): T {
    return nullable != null ? nullable : replacement;
}

export function ifempty(str: string, replacement: any = null): string {
    return str !== '' ? str : replacement;
}

export function trim(str: string) {
    return str.replace(TRIM_RX, '');
}

export function cloneStruct(object: any) {
    return JSON.parse(JSON.stringify(object));
}

export function pathJoin(...segments: string[]): string {
    let out = '';
    
    for (let i = 0; i < segments.length; i++) {
        let segment = segments[i];
        
        if (segment == null) {
            console.warn('Segment with null value while path-joining, it will be replaced by "".');
            continue;
        } else {
            out += trim(segment).replace(DUPL_SLASH_RX, '/');
        }
        
        // Add final slash
        if (i < segments.length - 1 && segment.lastIndexOf('/') !== segment.length - 1) {
            out += '/';
        }
    }
    
    return out;
}

export function ab2str(ab) {
    return String.fromCharCode.apply(null, new Uint8Array(ab));
}

export function generate2DMatrix(width: number, height: number): null[][] ;
export function generate2DMatrix<T>(width: number, height: number, fillFn: () => T): T[][] ;
export function generate2DMatrix<T>(width: number, height: number, fillFn?: () => T): T[][] {
    return new Array(height)
        .fill(null)
        .map(() => fillFn != null
            ? new Array(width).fill(null).map(() => fillFn())
            : new Array(width).fill(null));
}
