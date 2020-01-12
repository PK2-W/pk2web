import { OutOfBoundsError } from '../error/OutOfBoundsError';

export class StrictArray<T> extends Array<T> {
    private readonly _maxLength: number;
    
    public constructor(maxLength: number, initialLength?: number) {
        super(initialLength);
        
        this._maxLength = maxLength;
    }
    
    
    ///  Overrided  ///
    
    public push(...items): number {
        if (this.length + items.length > this._maxLength)
            this._throwOOBSizeError(this.length + items.length);
        
        return super.push(...items);
    }
    
    public unshift(...items): number {
        if (this.length + items.length > this._maxLength)
            this._throwOOBSizeError(this.length + items.length);
        
        return super.unshift(...items);
    }
    
    /**
     * Safe [i].
     * @param i
     */
    public get(i: number): T {
        if (i >= this._maxLength)
            this._throwOOBAccessError(i);
        
        return this[i];
    }
    
    
    ///  Support  ///
    
    private _throwOOBSizeError(length: number) {
        throw new OutOfBoundsError(`Array length (${ length }) exceed the array max length (${ this._maxLength }).`);
    }
    
    private _throwOOBAccessError(index: number) {
        throw new OutOfBoundsError(`The required index ${ index } exceed the array max length (${ this._maxLength }).`);
    }
    
    
    ///  Accessors  ///
    
    /**
     *
     */
    public get maxLength(): number {
        return this._maxLength;
    }
}
