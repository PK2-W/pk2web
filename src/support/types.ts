/** Signed int (4 bytes). */
export type int = number;
export type uint = uint8;
export type bool = boolean;

/** Unsigned int 1 byte (uint8). */
export type uint8 = number;
export type BYTE = uint8;
/** Unsigned int 2 bytes (uint16). */
export type uint16 = number;
export type WORD = uint16;
/** Unsigned int 4 bytes (uint32). */
export type uint32 = number;
export type DWORD = uint32;

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
