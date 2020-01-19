import { BlockContext } from '@game/tile/BlockContext';
import { BlockPrototype } from '@game/tile/BlockPrototype';
import { Drawable } from '@ng/drawable/Drawable';
import { BYTE, bool, int } from '../../support/types';

export class Block extends Drawable<PIXI.Container> {
    private _context: BlockContext;
    
    // Type of block
    private readonly _proto: BlockPrototype;
    // Id of the texture to use
    private readonly _textureId: string;
    
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
    
    public constructor(context: BlockContext, proto: BlockPrototype, textureId: string) {
        super(new PIXI.Container());
        
        this._context = context;
        this._proto = proto;
        this._textureId = textureId;
        
        this.relayout();
    }
    
    public relayout(): void {
        super.relayout();
        
        const texture = this._context.textureCache.getTexture(this._textureId, this._proto.getTextureArea());
        const tile = new PIXI.Sprite(texture);
        this._drawable.addChild(tile);
    }
}

export enum EBlocks {
    BLOCK_TAUSTA,          //BLOCK_BACKGROUND
    BLOCK_SEINA,           //BLOCK_WALL
    BLOCK_MAKI_OIKEA_YLOS, //BLOCK_MAX
    BLOCK_MAKI_VASEN_YLOS, //BLOCK_MAX_
    BLOCK_MAKI_OIKEA_ALAS, //BLOCK_MAX_
    BLOCK_MAKI_VASEN_ALAS, //BLOCK_MAX_
    BLOCK_MAKI_YLOS,       //BLOCK_MAX_UP
    BLOCK_MAKI_ALAS        //BLOCK_MAX_DOWN
}
