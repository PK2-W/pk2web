import { uint } from '@game/support/types';
import { BlockCollider } from '@game/tile/BlockCollider';
import { BLOCK_SIZE } from '@game/tile/BlockConstants';
import { BlockContext } from '@game/tile/BlockContext';
import { BlockPrototype, TBlockProtoCode } from '@game/tile/BlockPrototype';
import { Dw } from '@fwk/drawable/dw/Dw';
import { DwSprite } from '@fwk/drawable/dw/DwSprite';
import { DwObjectBase } from '@fwk/drawable/dwo/DwObjectBase';

export class Block extends DwObjectBase<DwSprite> {
    private readonly _context: BlockContext;
    
    // Type of block
    private readonly _proto: BlockPrototype;
    // Id of the texture to use
    private readonly _textureId: string;
    private _textureOffset: uint;
    
    private readonly _i: number;
    private readonly _j: number;
    private _xOffset: number;
    private _yOffset: number;
    
    // ...facing left
    private _vasemmalle: EBlocks;
    // ...facing right
    private _oikealle: EBlocks;
    // ...faceing up
    private _ylos: EBlocks;
    // ...facing down
    private _alas: EBlocks;
    
    
    public constructor(context: BlockContext, proto: BlockPrototype, i: number, j: number, textureId: string) {
        super(new DwSprite());
        
        this._context = context;
        this._proto = proto;
        this._textureId = textureId;
        
        this._i = i;
        this._j = j;
        this._xOffset = 0;
        this._yOffset = 0;
        
        
        this.relayout();
        
        this.dw.x = this.x;
        this.dw.y = this.y;
    }
    
    
    ///  Accessors  ///
    
    public get code(): TBlockProtoCode { return this._proto.code; }
    
    public get i(): number { return this._i; }
    public get j(): number { return this._j; }
    
    public get x(): number { return this.xReal + this._xOffset; }
    public get xReal(): number { return this._i * BLOCK_SIZE; }
    public get xOffset(): number { return this._xOffset; }
    
    public get y(): number { return this.yReal + this._yOffset; }
    public get yReal(): number { return this._j * BLOCK_SIZE; }
    public get yOffset(): number { return this._yOffset; }
    
    public get top(): number { return this.y + this._proto.top; }
    public get right(): number { return this.x + BLOCK_SIZE + this._proto.right; }
    public get bottom(): number { return this.y + BLOCK_SIZE + this._proto.bottom; }
    public get left(): number { return this.x + this._proto.left; }
    
    
    ///  Modifiers  ///
    
    public setOffset(xOffset: number, yOffset: number) {
        if (xOffset === this._xOffset && yOffset === this._yOffset)
            return;
        
        this._xOffset = xOffset;
        this._yOffset = yOffset;
        
        this.dw.x = this.x;
        this.dw.y = this.y;
    }
    
    public get visible(): boolean { return this._dw.visible; }
    public set visible(visible: boolean) { this.setVisible(visible); }
    /** Sets the {@link visible} property. */
    public setVisible(visible: boolean): this {
        this._dw.visible = visible === true;
        return this;
    }
    
    public get renderable(): boolean { return this._dw.renderable; }
    public set renderable(renderable: boolean) { this.setRenderable(renderable); }
    /** Sets the {@link renderable} property. */
    public setRenderable(renderable: boolean): this {
        this._dw.renderable = renderable === true;
        return this;
    }
    
    
    // Never used
    // public get toTheTop(): EBlocks { return this._ylos != null ? this._ylos : this._proto.toTheTop; }
    // public get toTheRight(): EBlocks { return this._oikealle != null ? this._oikealle : this._proto.toTheRight; }
    // public get toTheBottom(): EBlocks { return this._alas != null ? this._alas : this._proto.toTheBottom; }
    // public get toTheLeft(): EBlocks { return this._vasemmalle != null ? this._vasemmalle : this._proto.toTheLeft; }
    
    public get tausta(): boolean { return this._proto.tausta; }
    
    public isWater(): boolean { return this._proto.isWater() === true; }
    
    
    ///  Drawing  ///
    
    //private tmpSpr = DwFactory.new.sprite();
    public relayout(): void {
        //this._drawable.clear();
        
        const texture = this._proto.texture;
        this._dw.setNewTexture(texture);
        //this._drawable.add(this.tmpSpr);
        
        // // Debug
        // const graphics = new PIXI.Graphics();
        // if (this.tausta) {
        //     graphics.lineStyle(1, 0xa8a8a8, 0.6);
        //     graphics.drawRect(3, 3, BLOCK_SIZE - 6, BLOCK_SIZE - 6);
        // } else {
        //     graphics.lineStyle(1, 0x1010ff, 0.6);
        //     graphics.drawRect(1, 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        // }
        // this._drawable.pixi.addChild(graphics);
        
        // let text = new PIXI.Text(this.code, { fontFamily: 'Arial', fontSize: 10, fill: 0xff1010, align: 'left' });
        // text.x = 5;
        // text.y = 5;
        // this._drawable.addChild(text);
        
        // setTimeout(() => {
        //     //     this._drawable.cacheAsBitmap = true;
        //     if (this.x > 200 && this.x < 250 && this.y > 6970 && this.y < 7000) {
        //         debugger
        //     }
        // }, 6000);
    }
    
    public setTextureOffset(offset: uint): void {
        this._textureOffset = offset;
        this.relayout();
    }
    
    ///
    
    public getPlainData(): BlockCollider {
        // TODO: GEneralize
        return {
            code: this.code,
            
            i: this._i,
            j: this._j,
            x: this.x,
            y: this.y,
            
            leftIsBarrier: this._proto.toTheLeft,
            rightIsBarrier: this._proto.toTheRight,
            topIsBarrier: this._proto.toTheTop,
            bottomIsBarrier: this._proto.toTheBottom,
            
            top: this.top,
            right: this.right,
            bottom: this.bottom,
            left: this.left,
            
            topMask: this._proto.topMask,
            bottomMask: this._proto.bottomMask,
            
            tausta: this.tausta,
            edge: null,
            water: this.isWater()
        };
    }
    
    public getDrawable(): Dw<PIXI.DisplayObject> {
        //const graphics = new DwCanvas();
        // this._drawable.beginFill(0xbf0FF0);
        // this._drawable.drawRect(this.i * 32, this.j * 32, 30, 30);
        return this._dw;
    }
    
    public destroy() {
        this._dw.destroy();
        
    }
}

/**
 * @deprecated Replace with booleans
 */
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
