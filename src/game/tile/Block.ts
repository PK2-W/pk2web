import { TBlockProtoCode } from '@game/tile/BlockPrototype';
import { EBlocks } from '@game/tile/DwBlock';

export interface Block {
    readonly code: TBlockProtoCode;
    
    readonly i: number;
    readonly j: number;
    readonly x: number;
    readonly y: number;
    
    // ...facing left
    toTheLeft: EBlocks;
    // ...facing right
    toTheRight: EBlocks;
    // ...faceing up
    toTheTop: EBlocks;
    // ...facing down
    toTheBottom: EBlocks;
    
    top: number;
    readonly right: number;
    bottom: number;
    readonly left: number;
    
    topMask?: number[];
    bottomMask?: number[];
    
    // Indicates if it's background tile
    tausta: boolean;
    edge: boolean;
    water: boolean;
}
