import { int, uint8, uint32, uint16 } from '@fwk/shared/bx-ctypes';
import { PkError } from '@fwk/error/PkError';
import { cloneArrayBuffer } from '@fwk/support/utils';

export class PkBinary {
    private readonly _ab: ArrayBuffer;
    private _view: DataView;
    
    private _streamOffset: number;
    
    /// Cached
    private _xBlob: Blob;
    private _xUint8Array: Uint8Array;
    
    
    public constructor(initSize: int);
    public constructor(ab: ArrayBuffer);
    public constructor(k: int | ArrayBuffer) {
        this._ab = (k instanceof ArrayBuffer) ? k : new ArrayBuffer(k);
        this._view = new DataView(this._ab);
        
        this._streamOffset = 0;
    }
    
    public clone(): PkBinary {
        return new PkBinary(cloneArrayBuffer(this._ab));
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
    
    public readUint1(byteOffset: number, bitOffset: number): uint8 {
        if (bitOffset > 7) {
            throw new PkError('Bit offset out of byte.');
        }
        return this._view.getUint8(byteOffset) >> (8 - 1 - bitOffset) & 0x1;
    }
    
    public readUint2(byteOffset: number, bitOffset: number): uint8 {
        if (bitOffset > 6) {
            throw new PkError('Bit offset out of byte.');
        }
        return this._view.getUint8(byteOffset) >> (8 - 2 - bitOffset) & 0x3;
    }
    
    public readUint4(byteOffset: number, bitOffset: number): uint8 {
        if (bitOffset > 4) {
            throw new PkError('Bit offset out of byte.');
        }
        return this._view.getUint8(byteOffset) >> (8 - 4 - bitOffset) & 0xf;
    }
    
    /**
     * Reads an unsigned integer from the next byte.
     */
    public readUint8(byteOffset: number): uint8 {
        return this._view.getUint8(byteOffset);
    }
    
    /**
     * Reads an unsigned integer from the next 2 bytes.
     */
    public readUint16(byteOffset: number): uint16 {
        return this._view.getUint16(byteOffset, true);
    }
    
    /**
     * Reads an unsigned integer from the next 4 bytes.
     */
    public readUint32(byteOffset: number): uint32 {
        return this._view.getUint32(byteOffset, true);
    }
    
    /**
     * Writes an unsigned integer to the next byte.
     */
    public writeUint8(byteOffset: number, value: uint8): void {
        this._view.setUint8(byteOffset, value);
    }
    
    /**
     * Writes an unsigned integer to the next 2 bytes.
     */
    public writeUint16(byteOffset: number, value: uint16): void {
        this._view.setUint16(byteOffset, value);
    }
    
    /**
     * Writes an unsigned integer to the next 4 bytes.
     */
    public writeUint32(byteOffset: number, value: uint32): void {
        this._view.setUint32(byteOffset, value);
    }
    
    public getUint8Array(): Uint8Array {
        if (this._xUint8Array == null) {
            this._xUint8Array = new Uint8Array(this._ab);
        }
        return this._xUint8Array;
    }
    
    public getDataView(): DataView {
        return this._view;
    }
    
    public getBlob(): Blob {
        if (this._xBlob == null) {
            this._xBlob = new Blob([this._ab]);
        }
        return this._xBlob;
    }
    
    public get buffer(): ArrayBuffer {
        return this._ab;
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
        return PkBinary.truncateToNullChar(this.streamRead8(byteCount));
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
     * SDL: <code>ifstream::read</code>.
     *
     * @param byteCount - Number of bytes to read.
     */
    public streamRead8CStr(byteCount: number): string {
        return String.fromCharCode.apply(null, this.streamRead8C(byteCount));
    }
    
    /**
     * Reads an unsigned integer from the next byte.
     */
    public streamReadUint8(): uint8 {
        const value = this.readUint8(this._streamOffset);
        this._streamOffset++;
        return value;
    }
    
    /**
     * Reads an unsigned integer from the next 2 bytes.
     */
    public streamReadUint16(): uint16 {
        const value = this.readUint16(this._streamOffset);
        this._streamOffset += 2;
        return value;
    }
    
    /**
     * Reads an unsigned integer from the next 4 bytes.
     */
    public streamReadUint32(): uint32 {
        const value = this.readUint32(this._streamOffset);
        this._streamOffset += 4;
        return value;
    }
    
    /**
     * Writes an unsigned integer to the next byte.
     */
    public streamWriteUint8(v: uint8): this {
        this._view.setUint8(this._streamOffset, v);
        this._streamOffset++;
        return this;
    }
    
    /**
     * Writes an unsigned integer to the next 2 bytes.
     */
    public streamWriteUint16(v: uint16): this {
        this._view.setUint16(this._streamOffset, v);
        this._streamOffset += 2;
        return this;
    }
    
    /**
     * Writes an unsigned integer to the next 4 bytes.
     */
    public streamWriteUint32(v: uint32): this {
        this._view.setUint32(this._streamOffset, v);
        this._streamOffset += 4;
        return this;
    }
    
    public streamReadByte(): uint8 {
        return this.streamRead8Byte();
    }
    
    public streamRead8Byte(): uint8 {
        return this.streamReadUint8();
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
    
    public streamReadBool(): boolean {
        return this.streamReadUint8() === 1;
    }
    
    
    ///  Statics  ///
    
    private static truncateToNullChar(bin: Uint8Array): Uint8Array {
        const pos = bin.indexOf(0);
        return pos < 0 ? bin : new Uint8Array(bin.buffer, bin.byteOffset, pos);
    }
}
