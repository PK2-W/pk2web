import { TBlockProtoCode } from '@game/tile/BlockPrototype';

export interface BlockCollider {
    code: TBlockProtoCode;
    
    i: number;
    j: number;
    x: number;
    y: number;
    
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
