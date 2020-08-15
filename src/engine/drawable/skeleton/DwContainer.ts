import type { Dw } from '@ng/drawable/skeleton/Dw';

export interface DwContainer extends Dw {
    readonly children: number;
    
    get(i: number): Dw;
    has(drawable: Dw): boolean;
    add(drawable: Dw): this;
    remove(drawable: Dw): this;
    clear(): this;
    
    propagatePointerEvents: boolean
}