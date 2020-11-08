import { Effects } from '@game/effects/Effects';
import { EBlockPrototype } from '@game/enum/EBlockPrototype';
import { TEXTURE_ID_BLOCKS } from '@game/game/Game';
import { GameContext } from '@game/game/GameContext';
import { PK2KARTTA_KARTTA_LEVEYS, PK2KARTTA_KARTTA_KORKEUS, KYTKIN_ALOITUSARVO } from '@game/map/LevelMap';
import { int, CVect, cvect } from '@game/support/types';
import { TX } from '@game/texts';
import { Block } from '@game/tile/Block';
import { BlockCollider } from '@game/tile/BlockCollider';
import { BLOCK_SIZE, BLOCKSHEET_WIDTH } from '@game/tile/BlockConstants';
import { BlockContext } from '@game/tile/BlockContext';
import { BlockPrototype, TBlockProtoCode } from '@game/tile/BlockPrototype';
import { AssetNotFoundError } from '@ng/error/AssetNotFoundError';
import { Log } from '@ng/support/log/LoggerImpl';
import { pathJoin } from '@ng/support/utils';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';
import { PkBitmapBT } from '@ng/types/image/PkBitmapBT';
import { RESOURCES_PATH, BLOCK_CULLING } from '@sp/constants';
import { uint, uint8, rand } from '@sp/types';

export class BlockManager {
    // Game Environment
    private readonly _context: GameContext;
    
    /** Area where the currently applied culling is valid. */
    private _prevCulling: { ax: number, ay: number, bx: number, by: number };
    // (Those are fields to reduce GC impact)
    private __cullingShow: Set<Block> = new Set();
    private __cullingHide: Set<Block> = new Set();
    
    private _spritesheet: PkBitmapBT;
    
    //PALIKAT JA MASKIT
    private _palikat: CVect<Block> = cvect(300);
    /** SDL: lasketut_palikat */
    private _prototypes: CVect<BlockPrototype> = cvect(150);
    
    // Context to share with blocks
    private readonly _blockCtx: BlockContext;
    /** Map-matrix for the background blocks (~taustat). */
    private readonly _bgBlocks: Block[];
    /** Map-matrix for the foreground blocks (~seinat). */
    private readonly _fgBlocks: Block[];
    /** Map-matrix for the edge blocks (~reunat). */
    private readonly _edges: boolean[];
    
    /** SRC: animaatio */
    private _animatedBlocks: Set<Block>;
    private _animFrame: number;
    /**
     * SRC: vesiaste
     */
    private _animWater: number = 0;
    
    public constructor(ctx: GameContext) {
        this._context = ctx;
        
        this._blockCtx = new BlockContext(this._context);
        this._bgBlocks = new Array(PK2KARTTA_KARTTA_LEVEYS * PK2KARTTA_KARTTA_KORKEUS).fill(null);
        this._fgBlocks = new Array(PK2KARTTA_KARTTA_LEVEYS * PK2KARTTA_KARTTA_KORKEUS).fill(null);
        this._edges = new Array(PK2KARTTA_KARTTA_LEVEYS * PK2KARTTA_KARTTA_KORKEUS).fill(null);
        
        this._animatedBlocks = new Set();
        this._animFrame = 1 / 7;
    }
    
    
    /**
     * SDL: PK2Kartta::Calculate_Edges.
     */
    public calculateEdges() {
        let block: Block;
        let tile1: TBlockProtoCode;
        let tile2: TBlockProtoCode;
        let tile3: TBlockProtoCode;
        let isEdge: boolean;
        
        //     memset(this->reunat, false, sizeof(this->reunat));
        
        for (let x = 1; x < PK2KARTTA_KARTTA_LEVEYS - 1; x++) {
            for (let y = 0; y < PK2KARTTA_KARTTA_KORKEUS - 1; y++) {
                isEdge = false;
                
                tile1 = this.getFgBlockCode(x, y);
                
                //TODO
                // if (tile1 >= BLOCK_TYPES)
                //     this->seinat[x+y*PK2KARTTA_KARTTA_LEVEYS] = 255;
                
                tile2 = this.getFgBlockCode(x, y + 1);              // Bottom
                
                tile1 = (tile1 > 79 || tile1 === EBlockPrototype.BLOCK_ESTO_ALAS) ? tile1 = 1 : tile1 = 0;
                tile2 = (tile2 > 79) ? tile2 = 1 : tile2 = 0;
                
                if (tile1 === 1 && tile2 === 1) {
                    tile1 = this.getFgBlockCode(x + 1, y + 1);   // Right bottom
                    tile2 = this.getFgBlockCode(x - 1, y + 1);   // Left bottom
                    
                    tile1 = (tile1 < 80 && !(tile1 < 60 && tile1 > 49)) ? 1 : 0;
                    tile2 = (tile2 < 80 && !(tile2 < 60 && tile2 > 49)) ? 1 : 0;
                    
                    if (tile1 === 1) {
                        tile3 = this.getFgBlockCode(x + 1, y);      // Right
                        
                        if (tile3 > 79 || (tile3 < 60 && tile3 > 49) || tile3 === EBlockPrototype.BLOCK_ESTO_ALAS)
                            isEdge = true;
                    }
                    
                    if (tile2 === 1) {
                        tile3 = this.getFgBlockCode(x - 1, y);      // Left
                        
                        if (tile3 > 79 || (tile3 < 60 && tile3 > 49) || tile3 === EBlockPrototype.BLOCK_ESTO_ALAS)
                            isEdge = true;
                    }
                    
                    this.setEdge(x, y, isEdge);
                    //this->taustat[x+y*PK2KARTTA_KARTTA_LEVEYS] = 49; //Debug
                }
            }
        }
    }
    
    /**
     * @deprecated When called, block.code is always 0
     *
     * CPP: PK_Palikka_Este
     * SDL: PK_Block_Set_Barriers
     */
    public PK_Block_Set_Barriers(block: BlockCollider) {
        block.tausta = false;
        
        block.rightIsBarrier = true;
        block.leftIsBarrier = true;
        block.topIsBarrier = true;
        block.bottomIsBarrier = true;
        
        // TODO: Unusable code, we set the code to 0 before call!
        
        // // Special floor
        // if (block.code > 139) {
        //     block.toTheRight = EBlocks.BLOCK_TAUSTA;
        //     block.toTheLeft = EBlocks.BLOCK_TAUSTA;
        //     block.toTheTop = EBlocks.BLOCK_TAUSTA;
        //     block.toTheBottom = EBlocks.BLOCK_TAUSTA;
        // }
        
        // // Lifts
        // if (block.code == PALIKKA_HISSI_HORI) {
        //     block.vasen += MAth.floor(cos_table[degree % 360]);
        //     block.oikea += MAth.floor(cos_table[degree % 360]);
        // }
        // if (block.code == PALIKKA_HISSI_VERT) {
        //     block.ala += MAth.floor(sin_table[degree % 360]);
        //     block.yla += MAth.floor(sin_table[degree % 360]);
        // }
        
        // // Läpikäveltävä lattia
        // if (palikka.koodi == PALIKKA_ESTO_ALAS) {
        //     palikka.oikealle = PALIKKA_TAUSTA;
        //     palikka.ylos = PALIKKA_TAUSTA;
        //     palikka.alas = PALIKKA_SEINA;
        //     palikka.vasemmalle = PALIKKA_TAUSTA;
        //     palikka.ala -= 27;
        // }
        
        // // Mäet
        // if (palikka.koodi > 49 && palikka.koodi < 60) {
        //     palikka.oikealle	= PALIKKA_TAUSTA;
        //     palikka.ylos		= PALIKKA_SEINA;
        //     palikka.alas		= PALIKKA_SEINA;
        //     palikka.vasemmalle	= PALIKKA_TAUSTA;
        //     palikka.ala += 1;
        // }
        
        // // Kytkimet
        // if (palikka.koodi >= PALIKKA_KYTKIN1 && palikka.koodi <= PALIKKA_KYTKIN3) {
        //     palikka.oikealle	= PALIKKA_SEINA;
        //     palikka.ylos		= PALIKKA_SEINA;
        //     palikka.alas		= PALIKKA_SEINA;
        //     palikka.vasemmalle	= PALIKKA_SEINA;
        // }
        
        // TODO: ....eh ...no.
        // // Lattiat joihin kytkimet vaikuttavat
        // int kytkin1_y = 0,
        //     kytkin2_y = 0,
        //     kytkin3_x = 0;
        //
        // if (kytkin1 > 0) {
        //     kytkin1_y = 64;
        //
        //     if (kytkin1 < 64)
        //         kytkin1_y = kytkin1;
        //
        //     if (kytkin1 > KYTKIN_ALOITUSARVO-64)
        //         kytkin1_y = KYTKIN_ALOITUSARVO - kytkin1;
        // }
        // if (kytkin2 > 0) {
        //     kytkin2_y = 64;
        //
        //     if (kytkin2 < 64)
        //         kytkin2_y = kytkin2;
        //
        //     if (kytkin2 > KYTKIN_ALOITUSARVO-64)
        //         kytkin2_y = KYTKIN_ALOITUSARVO - kytkin2;
        // }
        // if (kytkin3 > 0) {
        //     kytkin3_x = 64;
        //
        //     if (kytkin3 < 64)
        //         kytkin3_x = kytkin3;
        //
        //     if (kytkin3 > KYTKIN_ALOITUSARVO-64)
        //         kytkin3_x = KYTKIN_ALOITUSARVO - kytkin3;
        // }
        
        // if (palikka.koodi == PALIKKA_KYTKIN2_YLOS) {
        //     palikka.ala -= kytkin2_y/2;
        //     palikka.yla -= kytkin2_y/2;
        // }
        // if (palikka.koodi == PALIKKA_KYTKIN2_ALAS) {
        //     palikka.ala += kytkin2_y/2;
        //     palikka.yla += kytkin2_y/2;
        // }
        // if (palikka.koodi == PALIKKA_KYTKIN2) {
        //     palikka.ala += kytkin2_y/2;
        //     palikka.yla += kytkin2_y/2;
        // }
        // if (palikka.koodi == PALIKKA_KYTKIN3_OIKEALLE) {
        //     palikka.oikea += kytkin3_x/2;
        //     palikka.vasen += kytkin3_x/2;
        //     palikka.koodi = PALIKKA_HISSI_HORI; // samat idea sivusuuntaan työnnössä
        // }
        // if (palikka.koodi == PALIKKA_KYTKIN3_VASEMMALLE) {
        //     palikka.oikea -= kytkin3_x/2;
        //     palikka.vasen -= kytkin3_x/2;
        //     palikka.koodi = PALIKKA_HISSI_HORI; // samat idea sivusuuntaan työnnössä
        // }
        // if (palikka.koodi == PALIKKA_KYTKIN3) {
        //     palikka.ala += kytkin3_x/2;
        //     palikka.yla += kytkin3_x/2;
        // }
        // if (palikka.koodi == PALIKKA_KYTKIN1) {
        //     palikka.ala += kytkin1_y/2;
        //     palikka.yla += kytkin1_y/2;
        // }
    }
    
    
    ///  Prototypes  ///
    
    /**
     * Performs the procedural generation of the block prototypes.<br>
     * SDL: PK_Calculate_Tiles.
     */
    public generatePrototypes(): void {
        const xx = BlockPrototype.generatePrototypes(this._spritesheet); //TODO SAVE
        for (let i = 0; i < 150; i++) {
            this._prototypes[i] = xx[i];
        }
        
        this.updateMovement();
    }
    
    /**
     * Returns the prototype for blocks of the specified type.
     *
     * @param code - Block type identification code.
     */
    private getProto(code: TBlockProtoCode): BlockPrototype {
        return this._prototypes[code];
    }
    
    
    ///  Content  ///
    
    public placeBgBlocks(): void {
        let code: number;
        let proto: BlockPrototype;
        let block: Block;
        
        for (let i = 0; i < PK2KARTTA_KARTTA_LEVEYS; i++) {
            for (let j = 0; j < PK2KARTTA_KARTTA_KORKEUS; j++) {
                // Get prototype from map
                code = this._context.map.getBgBlockCode(i, j);
                // Add to the game
                this.addBlock(code, i, j, true);
            }
        }
        
        Log.d('[BlockManager] Background blocks placed');
    }
    
    /**
     * SDL: PK2Kartta::Piirra_Seinat.
     */
    public placeFgBlocks(): void {
        let code: number;
        let proto: BlockPrototype;
        let block: Block;
        
        for (let i = 0; i < PK2KARTTA_KARTTA_LEVEYS; i++) {
            for (let j = 0; j < PK2KARTTA_KARTTA_KORKEUS; j++) {
                // Get prototype from map
                code = this._context.map.getFgBlockCode(i, j);
                // Add to the game
                this.addBlock(code, i, j);
            }
        }
        
        Log.d('[BlockManager] Foreground blocks placed');
    }
    
    public addBlock(code: uint, i: uint, j: uint, bg: boolean = false) {
        if (code >= 255)
            return;
        
        const proto = this.getProto(code);
        
        if (proto == null)
            return;
        
        // Create the block at the correct position
        const block = new Block(this._blockCtx, proto, i, j, TEXTURE_ID_BLOCKS);
        
        // Add to the game
        if (bg) {
            this.setBgBlock(block);
        } else {
            this.setFgBlock(block);
        }
    }
    
    /**
     * Returns the prototype code for the background block at the specified position.<br>
     * If the block doesn't exist, it returns 255.
     * SRC: PK2Kartta::taustat
     *
     * @param i - Coordinate i.
     * @param j - Coordinate j.
     */
    public getBgBlockCode(i: number, j: number): TBlockProtoCode {
        const block = this._bgBlocks[BlockManager.get1DIdx(i, j)];
        return (block != null) ? block.code : 255;
    }
    /**
     * Returns the background block at the specified position in the map.<br>
     * If there's no block, it returns NULL.
     *
     * @param i - Block x coordinate in the matrix.
     * @param j - Block y coordinate in the matrix.
     */
    public getBgBlock(i: number, j: number): Block {
        return this._bgBlocks[BlockManager.get1DIdx(i, j)];
    }
    public setBgBlock(block: Block): void {
        this.removeBg(block.i, block.j);
        
        // Save in position
        this._bgBlocks[BlockManager.get1DIdx(block.i, block.j)] = block;
        
        // If it's an animated block type, save for later update
        if (this.isAnimated(block)) {
            this._animatedBlocks.add(block);
        }
        
        // Add to the scene;
        // (Blocks are added not visible to help the initial culling)
        block.renderable = false;
        this.ctx.composition.addBgBlock(block);
    }
    
    /**
     * Returns the prototype code for the foreground block at the specified position.<br>
     * If the block doesn't exist, it returns 255.
     * SRC: PK2Kartta::palikat
     *
     * @param i - Coordinate i.
     * @param j - Coordinate j.
     */
    public getFgBlockCode(i: number, j: number): TBlockProtoCode {
        const block = this._fgBlocks[BlockManager.get1DIdx(i, j)];
        return (block != null) ? block.code : 255;
    }
    /**
     * Returns the foreground block at the specified position in the map.<br>
     * If there's no block, it returns NULL.
     *
     * @param i - Block x coordinate in the matrix.
     * @param j - Block y coordinate in the matrix.
     */
    public getFgBlock(i: number, j: number): Block {
        return this._fgBlocks[BlockManager.get1DIdx(i, j)];
    }
    public setFgBlock(block: Block): void {
        this.removeFg(block.i, block.j);
        
        // Save in position
        this._fgBlocks[BlockManager.get1DIdx(block.i, block.j)] = block;
        
        // If it's an animated block type, save for later update
        if (this.isAnimated(block)) {
            this._animatedBlocks.add(block);
        }
        
        // Add to the scene;
        // (Blocks are added not visible to help the initial culling)
        block.renderable = false;
        this.ctx.composition.addFgBlock(block);
    }
    
    public removeBg(i: number, j: number): void {
        const block = this.getBgBlock(i, j);
        
        if (block != null) {
            // Remove
            this._bgBlocks[BlockManager.get1DIdx(i, j)] = null;
            
            // Remove from animated
            if (this.isAnimated(block)) {
                this._animatedBlocks.delete(block);
            }
            
            // Remove from draw
            this.ctx.composition.removeBgBlock(block);
        }
    }
    
    public removeFg(i: number, j: number): void {
        const block = this.getFgBlock(i, j);
        
        if (block != null) {
            // Remove
            this._fgBlocks[BlockManager.get1DIdx(i, j)] = null;
            
            // Remove from animated
            if (this.isAnimated(block)) {
                this._animatedBlocks.add(block);
            }
            
            // Remove from draw
            this.ctx.composition.removeFgBlock(block);
        }
    }
    
    
    ///  Animation  ///
    
    /**
     * Updates texture for blocks that consist on more than one frame.
     * SRC: Piirra_Taustat
     */
    public updateAnimations(coef: number = 1): void {
        // Compact animation; adapted from:
        // SRC: ~ PK2Kartta_Animoi
        const oldFrame = Math.floor(this._animFrame);
        // The standard range from the original game is [1/7..34/7] = [0.142..4.867]
        // The increment can be scaled with "coef"
        this._animFrame = (coef / 7) + (this._animFrame % (34 / 7));
        const frame = Math.floor(this._animFrame);
        // Optimization: If frame is kept, do nothing
        if (oldFrame === frame) {
            return;
        }
        
        let count = 0;
        
        for (let block of this._animatedBlocks) {
            if (this.isInCamera(block) && this.isAnimated(block)) {
                block.setTextureOffset(frame);
                count++;
            }
        }
        
        if (count > 0) {
            Log.fast('Animated blocks', count);
        }
    }
    
    /**
     * SDL: PK_Calculate_MovableBlocks_Position.
     */
    public updateMovement(): void {
        this._prototypes[EBlockPrototype.BLOCK_ELEVATOR_H].vasen = Math.floor(this._context.entropy.cos(this._context.entropy.degree % 360));
        this._prototypes[EBlockPrototype.BLOCK_ELEVATOR_H].oikea = Math.floor(this._context.entropy.cos(this._context.entropy.degree % 360));
        
        this._prototypes[EBlockPrototype.BLOCK_ELEVATOR_V].ala = Math.floor(this._context.entropy.sin(this._context.entropy.degree % 360));
        this._prototypes[EBlockPrototype.BLOCK_ELEVATOR_V].yla = Math.floor(this._context.entropy.sin(this._context.entropy.degree % 360));
        
        let kytkin1_y: int = 0;
        let kytkin2_y: int = 0;
        let kytkin3_x: int = 0;
        
        // if (kytkin1 > 0) {
        //     kytkin1_y = 64;
        //
        //     if (kytkin1 < 64)
        //         kytkin1_y = kytkin1;
        //
        //     if (kytkin1 > KYTKIN_ALOITUSARVO - 64)
        //         kytkin1_y = KYTKIN_ALOITUSARVO - kytkin1;
        // }
        //
        // if (kytkin2 > 0) {
        //     kytkin2_y = 64;
        //
        //     if (kytkin2 < 64)
        //         kytkin2_y = kytkin2;
        //
        //     if (kytkin2 > KYTKIN_ALOITUSARVO - 64)
        //         kytkin2_y = KYTKIN_ALOITUSARVO - kytkin2;
        // }
        //
        // if (kytkin3 > 0) {
        //     kytkin3_x = 64;
        //
        //     if (kytkin3 < 64)
        //         kytkin3_x = kytkin3;
        //
        //     if (kytkin3 > KYTKIN_ALOITUSARVO - 64)
        //         kytkin3_x = KYTKIN_ALOITUSARVO - kytkin3;
        // }
        
        kytkin1_y /= 2;
        kytkin2_y /= 2;
        kytkin3_x /= 2;
        
        this._prototypes[EBlockPrototype.BLOCK_SWITCH1].ala = kytkin1_y;
        this._prototypes[EBlockPrototype.BLOCK_SWITCH1].yla = kytkin1_y;
        
        this._prototypes[EBlockPrototype.BLOCK_SWITCH2_GATE_U].ala = -kytkin2_y;
        this._prototypes[EBlockPrototype.BLOCK_SWITCH2_GATE_U].yla = -kytkin2_y;
        
        this._prototypes[EBlockPrototype.BLOCK_SWITCH2_GATE_D].ala = kytkin2_y;
        this._prototypes[EBlockPrototype.BLOCK_SWITCH2_GATE_D].yla = kytkin2_y;
        
        this._prototypes[EBlockPrototype.BLOCK_SWITCH2].ala = kytkin2_y;
        this._prototypes[EBlockPrototype.BLOCK_SWITCH2].yla = kytkin2_y;
        
        this._prototypes[EBlockPrototype.BLOCK_SWITCH3_GATE_L].oikea = kytkin3_x;
        this._prototypes[EBlockPrototype.BLOCK_SWITCH3_GATE_L].vasen = kytkin3_x;
        this._prototypes[EBlockPrototype.BLOCK_SWITCH3_GATE_L].koodi = EBlockPrototype.BLOCK_ELEVATOR_H;
        
        this._prototypes[EBlockPrototype.BLOCK_SWITCH3_GATE_R].oikea = -kytkin3_x;
        this._prototypes[EBlockPrototype.BLOCK_SWITCH3_GATE_R].vasen = -kytkin3_x;
        this._prototypes[EBlockPrototype.BLOCK_SWITCH3_GATE_R].koodi = EBlockPrototype.BLOCK_ELEVATOR_H;
        
        this._prototypes[EBlockPrototype.BLOCK_SWITCH3].ala = kytkin3_x;
        this._prototypes[EBlockPrototype.BLOCK_SWITCH3].yla = kytkin3_x;
    }
    
    /**
     * Updates position offset for blocks that can move.
     * SRC: ~Piirra_Seinat
     */
    public updateOffsets(editor: boolean = false) {
        // int palikka;
        // int px = 0,
        //     py = 0,
        //     ay = 0,
        //     ax = 0,
        //     by = 0, bx = 0,
        //     kartta_x = kamera_x/32,
        //     kartta_y = kamera_y/32;
        let xOffset: number;
        let yOffset: number;
        
        // timers
        let ajastin1_y: int = 0;
        let ajastin2_y: int = 0;
        let ajastin3_x: int = 0;
        
        if (this.ctx.switchTimer1 > 0) {
            ajastin1_y = 64;
            
            if (this.ctx.switchTimer1 < 64)
                ajastin1_y = this.ctx.switchTimer1;
            
            if (this.ctx.switchTimer1 > KYTKIN_ALOITUSARVO - 64)
                ajastin1_y = KYTKIN_ALOITUSARVO - this.ctx.switchTimer1;
        }
        
        if (this.ctx.switchTimer2 > 0) {
            ajastin2_y = 64;
            
            if (this.ctx.switchTimer2 < 64)
                ajastin2_y = this.ctx.switchTimer2;
            
            if (this.ctx.switchTimer2 > KYTKIN_ALOITUSARVO - 64)
                ajastin2_y = KYTKIN_ALOITUSARVO - this.ctx.switchTimer2;
        }
        
        if (this.ctx.switchTimer3 > 0) {
            ajastin3_x = 64;
            
            if (this.ctx.switchTimer3 < 64)
                ajastin3_x = this.ctx.switchTimer3;
            
            if (this.ctx.switchTimer3 > KYTKIN_ALOITUSARVO - 64)
                ajastin3_x = KYTKIN_ALOITUSARVO - this.ctx.switchTimer3;
        }
        
        let block: Block;
        
        // for (let j = 0; j < PK2KARTTA_KARTTA_KORKEUS; j++) {
        //     for (let i = 0; i < PK2KARTTA_KARTTA_LEVEYS; i++) {
        for (let b = 0, len = this._fgBlocks.length; b < len; b++) {
            block = this._fgBlocks[b];
            
            if (block != null && block.renderable) {
                // Show invisible block only in editor TODO: Extend to the dev-mode and a specific option in editor, not ever
                if (block.code === EBlockPrototype.BLOCK_ESTO_ALAS) {
                    block.visible = editor;
                } else {
                    // px = ((palikka % 10) * 32);
                    // py = ((palikka / 10) * 32);
                    xOffset = 0;
                    yOffset = 0;
                    
                    if (!editor) {
                        if (block.code === EBlockPrototype.BLOCK_ELEVATOR_V)
                            yOffset = Math.floor(this.ctx.entropy.sin(this.ctx.entropy.degree % 360));
                        
                        if (block.code === EBlockPrototype.BLOCK_ELEVATOR_H)
                            xOffset = Math.floor(this.ctx.entropy.cos(this.ctx.entropy.degree % 360));
                        
                        if (block.code === EBlockPrototype.BLOCK_SWITCH1)
                            yOffset = ajastin1_y / 2;
                        
                        if (block.code === EBlockPrototype.BLOCK_SWITCH2_GATE_U)
                            yOffset = -ajastin2_y / 2;
                        
                        if (block.code === EBlockPrototype.BLOCK_SWITCH2_GATE_D)
                            yOffset = ajastin2_y / 2;
                        
                        if (block.code === EBlockPrototype.BLOCK_SWITCH2)
                            yOffset = ajastin2_y / 2;
                        
                        if (block.code === EBlockPrototype.BLOCK_SWITCH3_GATE_L)
                            xOffset = ajastin3_x / 2;
                        
                        if (block.code === EBlockPrototype.BLOCK_SWITCH3_GATE_R)
                            xOffset = -ajastin3_x / 2;
                        
                        if (block.code === EBlockPrototype.BLOCK_SWITCH3)
                            yOffset = ajastin3_x / 2;
                    }
                    
                    block.setOffset(xOffset, yOffset);
                }
            }
            //  }
        }
    }
    
    /**
     * SRC: ~Piirra_Seinat
     */
    public updateComplexAnimations(): void {
        if (this._animWater % 2 == 0) {
            this.animateFire();
            this.animateWaterfall();
            this.animateFlowUp();
        }
        
        if (this._animWater % 3 == 0) {
            this.animateWaterSurface();
        }
        
        if (this._animWater % 4 == 0) {
            this.animateWater();
            //     PisteDraw2_RotatePalette(224, 239);
        }
        
        this._spritesheet.pixi.update();
        
        this._animWater = 1 + this._animWater % 320;
    }
    
    /**
     * SRC: Animoi_Tuli
     */
    private animateFire(): void {
        let x: number, y: number;
        let index: uint8;
        
        // PisteDraw2_DrawImage_Start(palikat_buffer,*&buffer,(DWORD &)leveys);
        
        for (x = 128; x < 160; x++) {
            for (y = 448; y < 479; y++) {
                index = this._spritesheet.getPixelIndex(x, y + 1);
                
                if (index != 255) {
                    index %= 32;
                    index = index - rand() % 4;
                    
                    if (index < 0) {
                        index = 255;
                    } else {
                        if (index > 21) {
                            index += 128;
                        } else {
                            index += 64;
                        }
                    }
                }
                
                this._spritesheet.setPixelIndex(x, y, index);
            }
        }
        
        if (this._context.switchTimer1 < 20) {
            for (x = 128; x < 160; x++) {
                this._spritesheet.setPixelIndex(x, y, rand() % 15 + 144);
            }
        } else {
            for (x = 128; x < 160; x++) {
                this._spritesheet.setPixelIndex(x, y, 255);
            }
        }
        
        // this._spritesheet.pixi.update();
        
        // PisteDraw2_DrawImage_End(palikat_buffer);
    }
    
    /**
     * SRC: Animoi_Vesiputous
     */
    private animateWaterfall(): void {
        let x: number, y: number;
        let plus: uint;
        let index: uint8, index2: uint8;
        
        const temp = new Array(32 * 32);
        
        // Copy current tile to temporal buffer
        for (x = 32; x < 64; x++)
            for (y = 416; y < 448; y++)
                temp[x - 32 + (y - 416) * 32] = this._spritesheet.getPixelIndex(x, y);
        
        // Allow waterfalls of different colors
        index2 = (temp[0] / 32) * 32;
        
        for (x = 32; x < 64; x++) {
            plus = rand() % 2 + 2; //...+1
            
            for (y = 416; y < 448; y++) {
                index = temp[x - 32 + (y - 416) * 32];
                
                // Allow waterfalls of different widths
                if (index != 255) {
                    index %= 32;
                    if (index > 10)//20
                        index--;
                    if (rand() % 40 == 1)
                        index = 11 + rand() % 11; //15+rand()%8;//9+rand()%5;
                    if (rand() % 160 == 1)
                        index = 30;
                    // buffer[x + (416+(y+plus)%32)*leveys] = color+color2;
                    this._spritesheet.setPixelIndex(x, 416 + (y + plus) % 32, index);
                } else {
                    // buffer[x + (416+(y+plus)%32)*leveys] = color;
                    this._spritesheet.setPixelIndex(x, 416 + (y + plus) % 32, index);
                }
            }
        }
    }
    
    /**
     * SRC: Animoi_Virta_Ylos
     */
    private animateFlowUp(): void {
        let x: number, y: number;
        const temp = new Array(32);
        
        for (x = 64; x < 96; x++)
            temp[x - 64] = this._spritesheet.getPixelIndex(x, 448);
        
        for (x = 64; x < 96; x++) {
            for (y = 448; y < 479; y++) {
                // buffer[x+y*leveys] = buffer[x+(y+1)*leveys];
                this._spritesheet.setPixelIndex(x, y, this._spritesheet.getPixelIndex(x, y + 1));
            }
        }
        
        for (x = 64; x < 96; x++)
            // buffer[x+479*leveys] = temp[x-64];
            this._spritesheet.setPixelIndex(x, y, temp[x - 64]);
    }
    
    /**
     * SRC: Animoi_Vedenpinta
     */
    private animateWaterSurface(): void {
        let x: number, y: number;
        const temp = new Array(32);
        
        for (y = 416; y < 448; y++)
            temp[y - 416] = this._spritesheet.getPixelIndex(0, y);
        
        for (y = 416; y < 448; y++) {
            for (x = 0; x < 31; x++) {
                // buffer[x+y*leveys] = buffer[x+1+y*leveys];
                this._spritesheet.setPixelIndex(x, y, this._spritesheet.getPixelIndex(x + 1, y));
            }
        }
        
        for (y = 416; y < 448; y++)
            //  buffer[31+y*leveys] = temp[y-416];
            this._spritesheet.setPixelIndex(31, y, temp[y - 416]);
    }
    
    private buuuf = null;
    
    /**
     * SRC: Animoi_Vesi
     */
    private animateWater(): void {
        let x: number, y: number;
        let d1: number = this._animWater / 2,
            d2: number;
        let color1: uint8, color2: uint8;
        let sini: int, cosi: int;
        let vx: int = 0, vy: int = 0;
        let i: int;
        
        const sheetWidth = BLOCK_SIZE * BLOCKSHEET_WIDTH;
        
        if (this.buuuf == null) {
            this.buuuf = new Array(sheetWidth * 32).fill(0);
            
            for (x = 0; x < sheetWidth; x++)
                for (y = 416; y < 416 + BLOCK_SIZE; y++)
                    this.buuuf[x + (y - 416) * sheetWidth] = this._spritesheet.getPixelIndex(x, y);
        }
        
        for (y = 0; y < BLOCK_SIZE; y++) {
            d2 = d1;
            
            for (x = 0; x < BLOCK_SIZE; x++) {
                sini = Math.floor((y + d2 / 2) * 11.25) % 360;
                cosi = Math.floor((x + d1 / 2) * 11.25) % 360;
                sini = Math.floor(this._context.entropy.sin(sini));
                cosi = Math.floor(this._context.entropy.cos(cosi));
                
                vy = Math.floor((y + sini / 11) % BLOCK_SIZE);
                vx = Math.floor((x + cosi / 11) % BLOCK_SIZE);
                
                if (vy < 0) {
                    vy = -vy;
                    vy = 31 - (vy % BLOCK_SIZE);
                }
                
                if (vx < 0) {
                    vx = -vx;
                    vx = 31 - (vx % BLOCK_SIZE);
                }
                
                color1 = this.buuuf[64 + vx + vy * sheetWidth];
                this.buuuf[BLOCK_SIZE + x + y * sheetWidth] = color1;
                d2 = 1 + d2 % 360;
            }
            
            d1 = 1 + d1 % 360;
        }
        
        let vy2: int;
        
        for (let p = 2; p < 5; p++) {
            i = p * BLOCK_SIZE;
            
            for (y = 0; y < BLOCK_SIZE; y++) {
                // d2 = d1;
                vy = y * sheetWidth;
                vy2 = (y + 416) * sheetWidth;
                
                for (x = 0; x < BLOCK_SIZE; x++) {
                    vx = x + vy;
                    color1 = this.buuuf[BLOCK_SIZE + vx];
                    color2 = this.buuuf[i + vx];
                    
                    this._spritesheet.setPixelIndex(i + x, vy2 / sheetWidth, Math.floor((color1 + color2 * 2) / 3));
                }
            }
        }
    }
    
    /**
     * Returns if the block is of an animated type.
     */
    public isAnimated(block: Block): boolean {
        return block.code === EBlockPrototype.BLOCK_ANIM1
            || block.code === EBlockPrototype.BLOCK_ANIM2
            || block.code === EBlockPrototype.BLOCK_ANIM3
            || block.code === EBlockPrototype.BLOCK_ANIM4;
    }
    
    
    ///  Graphics  ///
    
    /**
     * SDL: PK2Kartta::Lataa_PalikkaPaletti.
     *
     * @throws AssetNotFoundError
     * @throws ResourceFetchError
     */
    public async loadTextures(fpath: string, fname: string): Promise<void> {
        Log.d('[BlockManager] Loading blocks textures');
        
        this._spritesheet = await PkAssetTk.getBitmap(
            //> 🧍/episodeid/gfx/tiles/
            ...(this._context.episode.isCommunity() ? [pathJoin(this._context.episode.homePath, 'gfx/tiles/', fname)] : []),
            //> Next to the map file
            pathJoin(fpath, fname),
            //> 🏠/gfx/tiles/
            pathJoin(RESOURCES_PATH, 'gfx/tiles/', fname));
        this._spritesheet.makeColorTransparent();
        
        // Crop final textures
        /*for (let i = 0; i < 150; i++) {
         const x = (i % 10) * BLOCK_RAW_SIZE;
         const y = (Math.floor(i / 10)) * BLOCK_RAW_SIZE;
         
         this._textures.push(
         PkTextureTk.textureFromBaseTexture(baseTexture, x, y, BLOCK_RAW_SIZE));
         }*/
        
        //console.log('Blocks textures cropped.');
        
        // TODO -> post-treat
        // PisteDraw2_Image_Delete(this->palikat_vesi_buffer); //Delete last water buffer
        // this->palikat_vesi_buffer = PisteDraw2_Image_Cut(this->palikat_buffer,0,416,320,32);
    }
    
    
    ///  Accessors  ///
    
    /**
     * Returns the game enviroment.
     */
    private get ctx(): GameContext {
        return this._context;
    }
    
    
    private static get1DIdx(i: number, j: number): number {
        return j * PK2KARTTA_KARTTA_LEVEYS + i;
    }
    
    
    private setEdge(i: number, j: number, edge: boolean = true): void {
        this._edges[BlockManager.get1DIdx(i, j)] = (edge === true);
    }
    private isEdge(i: number, j: number): boolean {
        return this._edges[BlockManager.get1DIdx(i, j)] === true;
    }
    
    public getVoidBlock(i: int, j: int): BlockCollider {
        return {
            code: 255,
            
            i: i,
            j: j,
            x: i * BLOCK_SIZE,
            y: j * BLOCK_SIZE,
            
            top: j * BLOCK_SIZE,
            right: i + BLOCK_SIZE + BLOCK_SIZE,
            bottom: j * BLOCK_SIZE + BLOCK_SIZE,
            left: i * BLOCK_SIZE,
            
            topIsBarrier: 0,    // In C, int's initial value is random
            rightIsBarrier: 0,  // In C, int's initial value is random
            bottomIsBarrier: 0, // In C, int's initial value is random
            leftIsBarrier: 0,   // In C, int's initial value is random
            
            tausta: false,
            edge: true,
            water: false
        };
    }
    
    /**
     * SDL: PK_Block_Get.
     *
     * @param i
     * @param j
     */
    public getBlockCollider(i: int, j: int): BlockCollider {
        // Block out of limits
        if (i < 0 || i > PK2KARTTA_KARTTA_LEVEYS || j < 0 || j > PK2KARTTA_KARTTA_LEVEYS) {
            return this.getVoidBlock(i, j);
        }
        
        let plain: BlockCollider;
        let block = this.getFgBlock(i, j);
        
        // If it is ground
        if (block != null && block.code < 150) {
            plain = block.getPlainData();
        }
        // If it is sky, need to reset
        else {
            plain = this.getVoidBlock(i, j);
            
            plain.tausta = true;   // why?
            plain.edge = false;
            plain.water = false;
        }
        
        // Assign edge indicator from the edges map
        plain.edge = this.isEdge(i, j);
        
        // If background block for this position is water,
        // mark this plain block as water
        const bgCode = this.getBgBlockCode(i, j);
        
        if (bgCode > 131 && bgCode < 140) {
            plain.water = true;
        }
        
        return plain;
    }
    
    public isInCamera(block: Block): boolean {
        return block.x < this.ctx.cameraX + this.ctx.device.screenWidth
            && block.y < this.ctx.cameraY + this.ctx.device.screenHeight
            && block.x + BLOCK_SIZE > this.ctx.cameraX
            && block.y + BLOCK_SIZE > this.ctx.cameraY;
    }
    
    /**
     * Makes off-screen blocks not renderables.
     *
     * @stable
     */
    public updateCulling(): void {
        if (this._prevCulling == null ||
            this.ctx.cameraX < this._prevCulling.ax ||
            this.ctx.cameraY < this._prevCulling.ay ||
            this.ctx.cameraX + this.ctx.device.screenWidth > this._prevCulling.bx ||
            this.ctx.cameraY + this.ctx.device.screenHeight > this._prevCulling.by) {
            
            Log.v('[BlockManager] Updating blocks culling...');
            
            let ai: int, aj: int, bi: int, bj: int;
            let hideCount: uint = 0;
            let block: Block;
            
            this.__cullingShow.clear();
            this.__cullingHide.clear();
            
            // Blocks hiding
            if (this._prevCulling != null) {
                ai = Math.floor(this._prevCulling.ax / BLOCK_SIZE);
                aj = Math.floor(this._prevCulling.ay / BLOCK_SIZE);
                bi = Math.floor(this._prevCulling.bx / BLOCK_SIZE);
                bj = Math.floor(this._prevCulling.by / BLOCK_SIZE);
                
                for (let i = ai; i <= bi; i++) {
                    for (let j = aj; j <= bj; j++) {
                        block = this.getBgBlock(i, j);
                        if (block != null && block.renderable) {
                            this.__cullingHide.add(block);
                        }
                        block = this.getFgBlock(i, j);
                        if (block != null && block.renderable) {
                            this.__cullingHide.add(block);
                        }
                    }
                }
            }
            
            this._prevCulling = {
                ax: this.ctx.cameraX - BLOCK_CULLING * BLOCK_SIZE,
                ay: this.ctx.cameraY - BLOCK_CULLING * BLOCK_SIZE,
                bx: this.ctx.cameraX + this.ctx.device.screenWidth + BLOCK_CULLING * BLOCK_SIZE,
                by: this.ctx.cameraY + this.ctx.device.screenHeight + BLOCK_CULLING * BLOCK_SIZE
            };
            
            // Blocks showing
            ai = Math.floor(this._prevCulling.ax / BLOCK_SIZE);
            aj = Math.floor(this._prevCulling.ay / BLOCK_SIZE);
            bi = Math.floor(this._prevCulling.bx / BLOCK_SIZE);
            bj = Math.floor(this._prevCulling.by / BLOCK_SIZE);
            
            for (let i = ai; i <= bi; i++) {
                for (let j = aj; j <= bj; j++) {
                    block = this.getBgBlock(i, j);
                    if (block != null) {
                        this.__cullingShow.add(block);
                    }
                    block = this.getFgBlock(i, j);
                    if (block != null) {
                        this.__cullingShow.add(block);
                    }
                }
            }
            
            // Show...
            this.__cullingShow.forEach(b => b.renderable = true);
            // Hide...
            [...this.__cullingHide]
                .filter(b => !this.__cullingShow.has(b))
                .forEach(b => {
                    b.renderable = false;
                    hideCount++;
                });
            
            Log.fast('Block culling', `${ this.__cullingShow.size } / ${ hideCount }`);
        }
    }
    
    
    ///  Locks  ////
    
    /**
     * Unlock the lock blocks ({@link EBlockPrototype.BLOCK_LUKKO}).
     *
     * @src-cpp PK_Kartta_Avaa_Lukot
     * @src-sdl PK2Kartta::Open_Locks
     * @stable
     */
    public openLocks(): void {
        let code: number;
        
        Log.v('[BlockManager] Opening locks...');
        
        for (let j = 0; j < PK2KARTTA_KARTTA_KORKEUS; j++) {
            for (let i = 0; i < PK2KARTTA_KARTTA_LEVEYS; i++) {
                code = this.getFgBlockCode(i, j);
                
                if (code === EBlockPrototype.BLOCK_LUKKO) {
                    this.removeFg(i, j);
                    
                    Effects.smokeClouds(this._context,
                        i * BLOCK_SIZE + Math.floor(BLOCK_SIZE * 6 / 32),
                        j * BLOCK_SIZE + Math.floor(BLOCK_SIZE * 6 / 32));
                }
            }
        }
        
        this._context._vibration = 90; // Janne / 60
        // TODO: PisteInput_Vibrate();
        
        this._context.ui.showInfo(TX.GAME_LOCKSOPEN);
        
        this.calculateEdges();
    }
    
    /**
     *
     * SDL: Change_SkullBlocks
     */
    public changeSkullBlocks(): void {
        let front: TBlockProtoCode, back: TBlockProtoCode;
        
        for (let j = 0; j < PK2KARTTA_KARTTA_KORKEUS; j++) {
            for (let i = 0; i < PK2KARTTA_KARTTA_LEVEYS; i++) {
                front = this.getFgBlockCode(i, j);
                back = this.getBgBlockCode(i, j);
                
                if (front === EBlockPrototype.BLOCK_KALLOSEINA) {
                    this.removeFg(i, j);
                    
                    if (back !== EBlockPrototype.BLOCK_KALLOSEINA) {
                        Effects.smokeClouds(this._context, i * BLOCK_SIZE + 24, j * BLOCK_SIZE + 6);
                    }
                }
                
                if (back === EBlockPrototype.BLOCK_KALLOTAUSTA && front === 255) {
                    this.addBlock(EBlockPrototype.BLOCK_KALLOSEINA, i, j);
                }
            }
        }
        
        // TODO
        //  Game::vibration = 90;//60
        //  PisteInput_Vibrate();
        
        // Janne / PK_Start_Info(tekstit->Hae_Teksti(PK_txt.game_locksopen));
        
        this.calculateEdges();
    }
}
