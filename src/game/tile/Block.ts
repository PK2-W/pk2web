import { TBlockProtoCode } from '@game/tile/BlockPrototype';

export interface Block {
    code: TBlockProtoCode;
    
    readonly i: number;
    readonly j: number;
    readonly x: number;
    readonly y: number;
    
    leftIsBarrier: boolean;
    rightIsBarrier: boolean;
    topIsBarrier: boolean;
    bottomIsBarrier: boolean;
    
    top: number;
    right: number;
    bottom: number;
    left: number;
    
    topMask?: number[];
    bottomMask?: number[];
    
    // Indicates if it's background tile
    tausta: boolean;
    edge: boolean;
    water: boolean;
}
