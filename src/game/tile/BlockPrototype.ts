import { BLOCK_ESTO_ALAS, BLOCK_KYTKIN1, BLOCK_KYTKIN3 } from '@game/map/PK2Map';
import { EBlocks } from '@game/tile/Block';
import { EBlockProtoCode, BLOCK_RAW_SIZE } from '@game/tile/BlockConstants';
import { Rectangle, PkRectangle } from '@ng/wrapper/Rectangle';
import { BYTE, bool, int } from '../../support/types';

export class BlockPrototype {
    // Type of block
    private _koodi: TBlockProtoCode;
    // Indicates if it's background tile
    private _tausta: bool;
    // ...facing left
    private _vasemmalle: BYTE;
    // ...facing right
    private _oikealle: BYTE;
    // ...faceing up
    private _ylos: BYTE;
    // ...facing down
    private _alas: BYTE;
    private _vasen: int;
    private _oikea: int;
    private _yla: int;
    private _ala: int;
    private _vesi: bool;
    private _reuna: bool;
    
    public constructor(proto?: BlockPrototype) {
        if (proto != null) {
            for (let k in proto) {
                if (proto.hasOwnProperty(k)) {
                    this[k] = proto[k];
                }
            }
        }
    }
    
    /**
     * Block prototypes are generated by the game itself.<br>
     * This factory takes care of it, returning an iterable structure with the 150 prototypes.
     */
    public static generatePrecalculatedBlocks(): BlockPrototype[] {
        const protoLst: BlockPrototype[] = [];
        
        let proto: BlockPrototype;
        for (let i = 0; i < 150; i++) {
            proto = new BlockPrototype();
            
            proto._vasen = 0;
            proto._oikea = 0; //32
            proto._yla = 0;
            proto._ala = 0; //32
            
            proto._koodi = i;
            
            if ((i < 80 || i > 139) && i !== 255) {
                proto._tausta = false;
                
                proto._oikealle = EBlocks.BLOCK_SEINA;
                proto._vasemmalle = EBlocks.BLOCK_SEINA;
                proto._ylos = EBlocks.BLOCK_SEINA;
                proto._alas = EBlocks.BLOCK_SEINA;
                
                // Erikoislattiat
                
                if (i > 139) {
                    proto._oikealle = EBlocks.BLOCK_TAUSTA;
                    proto._vasemmalle = EBlocks.BLOCK_TAUSTA;
                    proto._ylos = EBlocks.BLOCK_TAUSTA;
                    proto._alas = EBlocks.BLOCK_TAUSTA;
                }
                
                // L�pik�velt�v� lattia
                
                if (i === BLOCK_ESTO_ALAS) {
                    proto._oikealle = EBlocks.BLOCK_TAUSTA;
                    proto._ylos = EBlocks.BLOCK_TAUSTA;
                    proto._alas = EBlocks.BLOCK_SEINA;
                    proto._vasemmalle = EBlocks.BLOCK_TAUSTA;
                    proto._ala -= 27;
                }
                
                // M�et
                
                if (i > 49 && i < 60) {
                    proto._oikealle = EBlocks.BLOCK_TAUSTA;
                    proto._ylos = EBlocks.BLOCK_SEINA;
                    proto._alas = EBlocks.BLOCK_SEINA;
                    proto._vasemmalle = EBlocks.BLOCK_TAUSTA;
                    proto._ala += 1;
                }
                
                // Kytkimet
                
                if (i >= BLOCK_KYTKIN1 && i <= BLOCK_KYTKIN3) {
                    proto._oikealle = EBlocks.BLOCK_SEINA;
                    proto._ylos = EBlocks.BLOCK_SEINA;
                    proto._alas = EBlocks.BLOCK_SEINA;
                    proto._vasemmalle = EBlocks.BLOCK_SEINA;
                }
            } else {
                proto._tausta = true;
                
                proto._oikealle = EBlocks.BLOCK_TAUSTA;
                proto._vasemmalle = EBlocks.BLOCK_TAUSTA;
                proto._ylos = EBlocks.BLOCK_TAUSTA;
                proto._alas = EBlocks.BLOCK_TAUSTA;
            }
            
            proto._vesi = (i > 131 && i < 140);
            
            protoLst.push(proto);
        }
        
        return protoLst;
    }
    
    // TODO: Cachear rectangulos
    public getTextureArea(frame: number = 0): Rectangle {
        return PkRectangle.$(
            ((this._koodi + frame) % 10) * BLOCK_RAW_SIZE,
            Math.floor((this._koodi + frame) / 10) * BLOCK_RAW_SIZE,
            BLOCK_RAW_SIZE,
            BLOCK_RAW_SIZE);
    }
    
    public isWater(): boolean {
        return this._vesi === true;
    }
    
    
    ///  Accessors  ///
    
    public get code(): TBlockProtoCode {
        return this._koodi;
    }
}

export type TBlockProtoCode = EBlockProtoCode | BYTE;
