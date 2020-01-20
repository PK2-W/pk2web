import { BLOCK_SIZE } from '@game/tile/BlockConstants';
import { BlockContext } from '@game/tile/BlockContext';
import { BlockPrototype } from '@game/tile/BlockPrototype';
import { IDrawable } from '@ng/drawable/IDrawable';
import { BYTE, bool, int } from '../../support/types';

export class Block extends BlockPrototype implements IDrawable {
    private _context: BlockContext;
    private _drawable: PIXI.Container;
    
    // Type of block
    private readonly _proto: BlockPrototype;
    // Id of the texture to use
    private readonly _textureId: string;
    
    private _x: number;
    private _y: number;
    // Indicates if it's background tile
    private _tausta: bool;
    // ...facing left
    private _vasemmalle: EBlocks;
    // ...facing right
    private _oikealle: EBlocks;
    // ...faceing up
    private _ylos: EBlocks;
    // ...facing down
    private _alas: EBlocks;
    private _vasen: int;
    private _oikea: int;
    private _reuna: bool;
    
    
    public constructor(context: BlockContext, proto: BlockPrototype, textureId: string) {
        super(proto);
        
        this._context = context;
        this._textureId = textureId;
        
        this.relayout();
    }
    
    
    ///  Accessors  ///
    
    public get x(): number {
        return this._x;
    }
    public set x(x: number) {
        this._x = x;
        this._drawable.x = x;
    }
    public get y(): number {
        return this._y;
    }
    public set y(y: number) {
        this._y = y;
        this._drawable.y = y;
    }
    public get top(): number {
        return this.y;
    }
    public get right(): number {
        return this.x + BLOCK_SIZE;
    }
    public get bottom(): number {
        return this.y + BLOCK_SIZE;
    }
    public get left(): number {
        return this.x;
    }
    
    public get toTheTop(): EBlocks {
        return this._ylos;
    }
    public get toTheRight(): EBlocks {
        return this._oikealle;
    }
    public get toTheBottom(): EBlocks {
        return this._alas;
    }
    public get toTheLeft(): EBlocks {
        return this._vasemmalle;
    }
    
    
    ///  Graphics  ///
    
    public relayout(): void {
        const texture = this._context.textureCache.getTexture(this._textureId, this._proto.getTextureArea());
        const tile = new PIXI.Sprite(texture);
        this._drawable.addChild(tile);
    }
    
    public getDrawable(): PIXI.DisplayObject {
        return this._drawable;
    }
    
    public invalidate(propagate: boolean): void {
    }
    
    public isInvalidated(): boolean {
        return false;
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
