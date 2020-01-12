import { ab2str } from '@ng/support/utils';
import { int, uint, uint8 } from '../../support/types';

export class Binary {
    private _ab: ArrayBuffer;
    
    private _streamOffset: number;
    
    
    ///
    
    public constructor(ab: ArrayBuffer) {
        this._ab = ab;
        this._streamOffset = 0;
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
    
    
    ///  Stream  ///
    
    public streamRewind(): this {
        this._streamOffset = 0;
        return this;
    }
    
    public get streamOffset(): number { return this._streamOffset; }
    public set streamOffset(v: number) { this._streamOffset = v; }
    
    public streamReset(): void {
        this._streamOffset = 0;
    }
    
    /**
     * Alias of {@link streamRead8}.
     */
    public streamRead(byteCount: number): Uint8Array {
        return this.streamRead8(byteCount);
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
    
    public streamReadC(byteCount: number): Uint8Array {
        return this.streamRead8C(byteCount);
    }
    
    public streamRead8C(byteCount: number): Uint8Array {
        return Binary.truncateToNullChar(this.streamRead8(byteCount));
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
        return String.fromCharCode.apply(null, this.streamRead8C(byteCount));
    }
    
    public streamReadUint(byteCount: number): uint8 {
        return this.streamRead8Uint(byteCount);
    }
    
    public streamRead8Uint(byteCount: number): uint8 {
        const v = this.streamRead8(byteCount);
        const dv = new DataView(v.buffer, v.byteOffset, v.byteLength);
        
        if (byteCount === 1) return dv.getUint8(0);
        if (byteCount === 2) return dv.getUint16(0, true);
        if (byteCount === 4) return dv.getUint32(0, true);
        
        throw  new Error('Unsigned integer is restricted to 1, 2 or 4 bytes.');
    }
    
    public streamReadByte(): uint8 {
        return this.streamRead8Byte();
    }
    
    public streamRead8Byte(): uint8 {
        return this.streamRead8Uint(1);
    }
    
    public streamReadInt(byteCount: number): int {
        return this.streamRead8Int(byteCount);
    }
    
    public streamRead8Int(byteCount: number): int {
        const v = this.streamRead8(byteCount);
        const dv = new DataView(v.buffer, v.byteOffset, v.byteLength);
        
        if (byteCount === 1) return dv.getInt8(0);
        if (byteCount === 2) return dv.getInt16(0, true);
        if (byteCount === 4) return dv.getInt32(0, true);
        
        throw  new Error('Integer is restricted to 1, 2 or 4 bytes.');
    }
    
    public streamReadDouble(byteCount: number): number {
        return this.streamRead8Double(byteCount);
    }
    
    public streamRead8Double(byteCount: number): number {
        const v = this.streamRead8(byteCount);
        const dv = new DataView(v.buffer, v.byteOffset, v.byteLength);
        
        if (byteCount === 4) return dv.getFloat32(0, true);
        if (byteCount === 8) return dv.getFloat64(0, true);
        
        throw  new Error('Double is restricted to 4 or 8 bytes.');
    }
    
    public streamReadBool(byteCount: number = 1): boolean {
        return this.streamRead8Bool(byteCount);
    }
    
    public streamRead8Bool(byteCount: number = 1): boolean {
        return this.streamRead8Uint(byteCount) === 1;
    }
    
    ///  Statics  ///
    
    private static truncateToNullChar(bin: Uint8Array): Uint8Array {
        const pos = bin.indexOf(0);
        return pos < 0 ? bin : new Uint8Array(bin.buffer, bin.byteOffset, pos);
    }
}
