import { ab2str } from '@ng/support/utils';

export class Binary {
    private _ab: ArrayBuffer;
    
    private _streamOffset: number;
    
    
    ///
    
    public constructor(ab: ArrayBuffer) {
        this._ab = ab;
    }
    
    
    ///
    
    /**
     * Alias of {@link read8}.
     */
    public read(byteOffset: number, byteCount: number): Uint8Array {
        return this.read8(byteOffset, byteCount);
    }
    
    public read8(byteOffset: number, byteCount: number): Uint8Array {
        return new Uint8Array(this._ab, byteOffset, byteCount);
    }
    
    public read16(byteOffset: number, byteCount: number): Uint16Array {
        return new Uint16Array(this._ab, byteOffset, byteCount);
    }
    
    
    ///  Stream  ///
    
    public get streamOffset(): number { return this._streamOffset; }
    public set streamOffset(v: number) { this._streamOffset = v; }
    
    public streamReset(): void {
        this._streamOffset = 0;
    }
    
    /**
     * Alias of {@link streamRead8}.
     */
    public streamRead(len: number): Uint8Array {
        return this.streamRead8(len);
    }
    
    /**
     * Reads the specified number of bytes from the binary stream.
     *
     * @param byteCount - Number of bytes to read.
     */
    public streamRead8(byteCount: number): Uint8Array {
        const tmp = this.read8(this._streamOffset, byteCount);
        this._streamOffset += byteCount;
        return tmp;
    }
    
    public streamRead16(byteCount: number): Uint16Array {
        const tmp = this.read16(this._streamOffset, byteCount);
        this._streamOffset += byteCount;
        return tmp;
    }
    
    /**
     * Alias of {@link streamRead8Str}.
     */
    public streamReadStr(byteCount: number): string {
        return this.streamRead8Str(byteCount);
    }
    
    /**
     * Reads the specified number of bytes from the binary stream as a string.
     *
     * @param byteCount - Number of bytes to read.
     */
    public streamRead8Str(byteCount: number): string {
        return String.fromCharCode.apply(null, this.streamRead8(byteCount));
    }
    
    public streamRead16Str(byteCount: number): string {
        return String.fromCharCode.apply(null, this.streamRead16(byteCount));
    }
    
    /**
     * Alias of {@link streamRead8CStr}.
     */
    public streamReadCStr(byteCount: number): string {
        return this.streamRead8CStr(byteCount);
    }
    
    /**
     * Reads the specified number of bytes from the binary stream as a C++ string.<br>
     * If string contains \0 (null caracter) the string is truncated, else it returns the specified number of bytes.<br>
     * Source: <code>ifstream::read</code>.
     *
     * @param byteCount - Number of bytes to read.
     */
    public streamRead8CStr(byteCount: number): string {
        return Binary._truncateToNullChar(this.streamRead8Str(byteCount));
    }
    
    public streamRead16CStr(byteCount: number): string {
        return Binary._truncateToNullChar(this.streamRead16Str(byteCount));
    }
    
    ///  Statics  ///
    
    private static _truncateToNullChar(str: string): string {
        const pos = str.indexOf('\0');
        return pos < 0 ? str : str.substr(0, pos);
    }
}
