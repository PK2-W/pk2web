export type int = number;
export type uint = number;
export type bool = boolean;

/** uint8 */
export type BYTE = uint;
/** uint16 */
export type WORD = uint;
/** uint32 */
export type DWORD = uint;

/**
 * CHAR ARRAY
 */
export type str<N> = string;

const RAND_MAX = 3276700;

// TODO: En cada ejecución debería devolver lo mismo
export function rand(): int {
    return Math.round(Math.random() * RAND_MAX);
}

export type CVect<T> = T[] & {
    sizeof: int
};

/**
 * Creates an arrray with metadata, for c++ compatibility.
 */
export function cvect<T>(sizeof: int, fillFn?: (i: int) => T): CVect<T> {
    let array = new Array(sizeof) as CVect<T>;
    
    // Fill
    array.fill(null);
    if (fillFn != null) {
        array = array.map((v, i) => fillFn(i)) as CVect<T>;
    }
    
    // Max theorically size
    array.sizeof = sizeof;
    
    return array;
}

export function sizeof(cvect: CVect<any>) {
    return cvect.sizeof;
}

export type TEXTID = string;
export type FONTID = int;
export type SCREENID = int;
export type t_color = int;
