import { GameContext } from '@game/game/GameContext';
import { TEXTURE_ID_BLOCKS } from '@game/game/PK2Game';
import {
    BLOCK_KYTKIN1,
    BLOCK_KYTKIN3,
    BLOCK_HISSI_HORI,
    BLOCK_HISSI_VERT,
    BLOCK_KYTKIN2_YLOS,
    BLOCK_KYTKIN2_ALAS,
    BLOCK_KYTKIN2,
    BLOCK_KYTKIN3_OIKEALLE,
    BLOCK_KYTKIN3_VASEMMALLE,
    PK2KARTTA_KARTTA_LEVEYS,
    PK2KARTTA_KARTTA_KORKEUS,
    KYTKIN_ALOITUSARVO
} from '@game/map/PK2Map';
import { BlockCollider } from '@game/tile/BlockCollider';
import { BLOCK_SIZE, EBlockProtoCode } from '@game/tile/BlockConstants';
import { BlockContext } from '@game/tile/BlockContext';
import { BlockPrototype, TBlockProtoCode } from '@game/tile/BlockPrototype';
import { Block } from '@game/tile/Block';
import { ResourceNotFoundError } from '@ng/error/ResourceNotFoundError';
import { Log } from '@ng/support/log/LoggerImpl';
import { pathJoin } from '@ng/support/utils';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';
import { PkImage } from '@ng/types/PkImage';
import { RESOURCES_PATH } from '../../support/constants';
import { int, CVect, cvect } from '../../support/types';

export class BlockManager {
    // Game Environment
    private readonly _context: GameContext;
    
    private _prevCamera: { x: number, y: number };
    private _prevCulling: { ax: number, ay: number, bx: number, by: number };
    
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
    private _blockAnimTicker: number;
    
    public constructor(ctx: GameContext) {
        this._context = ctx;
        
        this._blockCtx = new BlockContext(this._context);
        this._bgBlocks = new Array(PK2KARTTA_KARTTA_LEVEYS * PK2KARTTA_KARTTA_KORKEUS).fill(null);
        this._fgBlocks = new Array(PK2KARTTA_KARTTA_LEVEYS * PK2KARTTA_KARTTA_KORKEUS).fill(null);
        this._edges = new Array(PK2KARTTA_KARTTA_LEVEYS * PK2KARTTA_KARTTA_KORKEUS).fill(null);
        
        this._animatedBlocks = new Set();
    }
    
    public placeBgBlocks(): void {
        for (let i = 0; i < PK2KARTTA_KARTTA_LEVEYS; i++) {
            for (let j = 0; j < PK2KARTTA_KARTTA_KORKEUS; j++) {
                // Get prototype from map
                const code = this._context.map.getBgBlockCode(i, j);
                
                if (code !== 255) {
                    const proto = this.getProto(code);
                    
                    // Create the block at the correct position
                    const block = new Block(this._blockCtx, proto, i, j, TEXTURE_ID_BLOCKS);
                    
                    // Add to the game
                    this.setBgBlock(block);
                }
            }
        }
        
        Log.d('[BlockManager] Background blocks placed');
    }
    
    /**
     * SDL: PK2Kartta::Piirra_Seinat.
     */
    public placeFgBlocks(): void {
        for (let i = 0; i < PK2KARTTA_KARTTA_LEVEYS; i++) {
            for (let j = 0; j < PK2KARTTA_KARTTA_KORKEUS; j++) {
                // Get prototype from map
                const code = this._context.map.getFgBlockCode(i, j);
                
                if (code !== 255) {
                    const proto = this.getProto(code);
                    
                    // Create the block at the correct position
                    const block = new Block(this._blockCtx, proto, i, j, TEXTURE_ID_BLOCKS);
                    
                    // Add to the game
                    this.setFgBlock(block);
                }
            }
        }
        
        Log.d('[BlockManager] Foreground blocks placed');
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
                
                tile1 = (tile1 > 79 || tile1 === EBlockProtoCode.BLOCK_ESTO_ALAS) ? tile1 = 1 : tile1 = 0;
                tile2 = (tile2 > 79) ? tile2 = 1 : tile2 = 0;
                
                if (tile1 === 1 && tile2 === 1) {
                    tile1 = this.getFgBlockCode(x + 1, y + 1);   // Right bottom
                    tile2 = this.getFgBlockCode(x - 1, y + 1);   // Left bottom
                    
                    tile1 = (tile1 < 80 && !(tile1 < 60 && tile1 > 49)) ? 1 : 0;
                    tile2 = (tile2 < 80 && !(tile2 < 60 && tile2 > 49)) ? 1 : 0;
                    
                    if (tile1 === 1) {
                        tile3 = this.getFgBlockCode(x + 1, y);      // Right
                        
                        if (tile3 > 79 || (tile3 < 60 && tile3 > 49) || tile3 === EBlockProtoCode.BLOCK_ESTO_ALAS)
                            isEdge = true;
                    }
                    
                    if (tile2 === 1) {
                        tile3 = this.getFgBlockCode(x - 1, y);      // Left
                        
                        if (tile3 > 79 || (tile3 < 60 && tile3 > 49) || tile3 === EBlockProtoCode.BLOCK_ESTO_ALAS)
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
    
    /**
     * Performs the procedural generation of the block prototypes.<br>
     * SDL: PK_Calculate_Tiles.
     */
    public generatePrototypes(): void {
        const xx = BlockPrototype.generatePrototypes(this._blockCtx); //TODO SAVE
        for (let i = 0; i < 150; i++) {
            this._prototypes[i] = xx[i];
        }
        
        this.calculateMovableBlocksPosition();
    }
    
    
    ///  Animation  ///
    
    /**
     * Animates the blocks that require it.
     */
    public animate(oscillators: unknown): void {
    
    }
    
    /**
     * SDL: PK_Calculate_MovableBlocks_Position.
     */
    public calculateMovableBlocksPosition(): void {
        this._prototypes[BLOCK_HISSI_HORI].vasen = Math.floor(this._context.entropy.cos(this._context.entropy.degree % 360));
        this._prototypes[BLOCK_HISSI_HORI].oikea = Math.floor(this._context.entropy.cos(this._context.entropy.degree % 360));
        
        this._prototypes[BLOCK_HISSI_VERT].ala = Math.floor(this._context.entropy.sin(this._context.entropy.degree % 360));
        this._prototypes[BLOCK_HISSI_VERT].yla = Math.floor(this._context.entropy.sin(this._context.entropy.degree % 360));
        
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
        
        this._prototypes[BLOCK_KYTKIN1].ala = kytkin1_y;
        this._prototypes[BLOCK_KYTKIN1].yla = kytkin1_y;
        
        this._prototypes[BLOCK_KYTKIN2_YLOS].ala = -kytkin2_y;
        this._prototypes[BLOCK_KYTKIN2_YLOS].yla = -kytkin2_y;
        
        this._prototypes[BLOCK_KYTKIN2_ALAS].ala = kytkin2_y;
        this._prototypes[BLOCK_KYTKIN2_ALAS].yla = kytkin2_y;
        
        this._prototypes[BLOCK_KYTKIN2].ala = kytkin2_y;
        this._prototypes[BLOCK_KYTKIN2].yla = kytkin2_y;
        
        this._prototypes[BLOCK_KYTKIN3_OIKEALLE].oikea = kytkin3_x;
        this._prototypes[BLOCK_KYTKIN3_OIKEALLE].vasen = kytkin3_x;
        this._prototypes[BLOCK_KYTKIN3_OIKEALLE].koodi = BLOCK_HISSI_HORI;
        
        this._prototypes[BLOCK_KYTKIN3_VASEMMALLE].oikea = -kytkin3_x;
        this._prototypes[BLOCK_KYTKIN3_VASEMMALLE].vasen = -kytkin3_x;
        this._prototypes[BLOCK_KYTKIN3_VASEMMALLE].koodi = BLOCK_HISSI_HORI;
        
        this._prototypes[BLOCK_KYTKIN3].ala = kytkin3_x;
        this._prototypes[BLOCK_KYTKIN3].yla = kytkin3_x;
    }
    
    
    ///  Graphics  ///
    
    /**
     * SDL: PK2Kartta::Lataa_PalikkaPaletti.
     *
     * @throws ResourceNotFoundError
     * @throws ResourceFetchError
     */
    public async loadTextures(fpath: string, fname: string): Promise<void> {
        let uri: string;
        let found: boolean;
        let image: PkImage;
        let baseTexture: PIXI.BaseTexture;
        
        // First, try to fetch the resource from provided location
        uri = pathJoin(fpath, fname);
        try {
            image = await PkAssetTk.getImage(uri);
            found = true;
        } catch (err) {
            if (!(err instanceof ResourceNotFoundError)) {
                // TODO: Improve
                throw err;
            }
        }
        
        // If not found, try to fetch the resource from default location
        if (!found) {
            uri = pathJoin(RESOURCES_PATH, 'gfx/tiles/', fname);
            
            try {
                image = await PkAssetTk.getImage(uri);
            } catch (err) {
                throw err;
            }
        }
        
        // Remove transparent pixel and create the base texture
        image.removeTransparentPixel();
        
        this.ctx.textureCache.add(TEXTURE_ID_BLOCKS, image);
        
        Log.d('Blocks textures loaded');
        
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
        
        // strcpy(this->palikka_bmp,filename);
    }
    
    
    ///  Accessors  ///
    
    /**
     * Returns the game enviroment.
     */
    private get ctx(): GameContext {
        return this._context;
    }
    
    /**
     * Returns the prototype for blocks of the specified type.
     *
     * @param code - Block type identification code.
     */
    private getProto(code: TBlockProtoCode): BlockPrototype {
        return this._prototypes[code];
    }
    
    private static get1DIdx(i: number, j: number): number {
        return j * PK2KARTTA_KARTTA_LEVEYS + i;
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
        // Save in position
        this._bgBlocks[BlockManager.get1DIdx(block.i, block.j)] = block;
        
        // If it's an animated block type, save for later update
        if (this.isAnimated(block)) {
            this._animatedBlocks.add(block);
        }
        
        // Add to the scene;
        // Blocks are added as not visible to help the initial culling
        block.getDrawable().renderable = false;
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
        // Save in position
        this._fgBlocks[BlockManager.get1DIdx(block.i, block.j)] = block;
        
        // If it's an animated block type, save for later update
        if (this.isAnimated(block)) {
            this._animatedBlocks.add(block);
        }
        
        // Add to the scene;
        // Blocks are added as not visible to help the initial culling
        block.getDrawable().renderable = false;
        // Add to the scene
        this.ctx.composition.addFgBlock(block);
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
    
    /**
     * SRC: Piirra_Taustat
     */
    public updateAnimations(): void {
        let count = 0;
        
        for (let block of this._animatedBlocks) {
            if (this.isInCamera(block) && this.isAnimated(block)) {
                block.setTextureOffset(Math.floor(this._blockAnimTicker));
            }
        }
        
        if (count > 0)
            Log.d(`[BlockManager] ${ count } animated blocks updated`);
    }
    
    /** @deprecated Use _blockAnimTicker */
    public get animaatio(): number { return this._blockAnimTicker;}
    
    public isInCamera(block: Block): boolean {
        return block.x < this.ctx.cameraX + this.ctx.screenWidth
            && block.y < this.ctx.cameraY + this.ctx.screenHeight
            && block.x + BLOCK_SIZE > this.ctx.cameraX
            && block.y + BLOCK_SIZE > this.ctx.cameraY;
    }
    
    /**
     * Returns if the block is of an animated type.
     */
    public isAnimated(block: Block): boolean {
        return block.code === EBlockProtoCode.BLOCK_ANIM1
            || block.code === EBlockProtoCode.BLOCK_ANIM2
            || block.code === EBlockProtoCode.BLOCK_ANIM3
            || block.code === EBlockProtoCode.BLOCK_ANIM4;
    }
    
    public updateCulling(): void {
        if (this._prevCulling == null ||
            this.ctx.cameraX < this._prevCulling.ax ||
            this.ctx.cameraY < this._prevCulling.ay ||
            this.ctx.cameraX + this.ctx.screenWidth > this._prevCulling.bx ||
            this.ctx.cameraY + this.ctx.screenHeight > this._prevCulling.by) {
            
            Log.v('[BlockManager] Updating blocks culling...');
            
            let ai: number, aj: number, bi: number, bj: number;
            let block: Block;
            
            const show = new Set<Block>();
            const hide = new Set<Block>();
            
            // Blocks hiding
            if (this._prevCulling != null) {
                ai = Math.floor(this._prevCulling.ax / BLOCK_SIZE);
                aj = Math.floor(this._prevCulling.ay / BLOCK_SIZE);
                bi = Math.floor(this._prevCulling.bx / BLOCK_SIZE);
                bj = Math.floor(this._prevCulling.by / BLOCK_SIZE);
                
                for (let i = ai; i <= bi; i++) {
                    for (let j = aj; j <= bj; j++) {
                        block = this.getBgBlock(i, j);
                        if (block != null && block.getDrawable().renderable) {
                            hide.add(block);
                        }
                        block = this.getFgBlock(i, j);
                        if (block != null && block.getDrawable().renderable) {
                            hide.add(block);
                        }
                    }
                }
            }
            
            if (this._prevCulling == null) this._prevCulling = {};
            
            this._prevCulling.ax = this.ctx.cameraX - 3 * BLOCK_SIZE;
            this._prevCulling.ay = this.ctx.cameraY - 3 * BLOCK_SIZE;
            this._prevCulling.bx = this.ctx.cameraX + this.ctx.screenWidth + 3 * BLOCK_SIZE;
            this._prevCulling.by = this.ctx.cameraY + this.ctx.screenHeight + 3 * BLOCK_SIZE;
            
            // Blocks showing
            ai = Math.floor(this._prevCulling.ax / BLOCK_SIZE);
            aj = Math.floor(this._prevCulling.ay / BLOCK_SIZE);
            bi = Math.floor(this._prevCulling.bx / BLOCK_SIZE);
            bj = Math.floor(this._prevCulling.by / BLOCK_SIZE);
            
            for (let i = ai; i <= bi; i++) {
                for (let j = aj; j <= bj; j++) {
                    block = this.getBgBlock(i, j);
                    if (block != null) {
                        show.add(block);
                    }
                    block = this.getFgBlock(i, j);
                    if (block != null) {
                        show.add(block);
                    }
                }
            }
            
            show.forEach(b => b.getDrawable().renderable = true);
            [...hide].filter(b => !show.has(b)).forEach(b => b.getDrawable().renderable = false);
        } else {
        
        }
    }
    
    public palikat(editor: boolean = false) {
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
        
        for (let i = 0; i < PK2KARTTA_KARTTA_LEVEYS; i++) {
            for (let j = 0; j < PK2KARTTA_KARTTA_KORKEUS; j++) {
                block = this.getFgBlock(i, j);
                
                if (block != null && !(!editor && block.code === EBlockProtoCode.BLOCK_ESTO_ALAS)) {
                    // px = ((palikka % 10) * 32);
                    // py = ((palikka / 10) * 32);
                    xOffset = 0;
                    yOffset = 0;
                    
                    if (!editor) {
                        if (block.code === EBlockProtoCode.BLOCK_HISSI_VERT)
                            yOffset = Math.floor(this.ctx.entropy.sin(this.ctx.entropy.degree % 360));
                        
                        if (block.code === EBlockProtoCode.BLOCK_HISSI_HORI)
                            xOffset = Math.floor(this.ctx.entropy.cos(this.ctx.entropy.degree % 360));
                        
                        if (block.code === EBlockProtoCode.BLOCK_KYTKIN1)
                            yOffset = ajastin1_y / 2;
                        
                        if (block.code === EBlockProtoCode.BLOCK_KYTKIN2_YLOS)
                            yOffset = -ajastin2_y / 2;
                        
                        if (block.code === EBlockProtoCode.BLOCK_KYTKIN2_ALAS)
                            yOffset = ajastin2_y / 2;
                        
                        if (block.code === EBlockProtoCode.BLOCK_KYTKIN2)
                            yOffset = ajastin2_y / 2;
                        
                        if (block.code === EBlockProtoCode.BLOCK_KYTKIN3_OIKEALLE)
                            xOffset = ajastin3_x / 2;
                        
                        if (block.code === EBlockProtoCode.BLOCK_KYTKIN3_VASEMMALLE)
                            xOffset = -ajastin3_x / 2;
                        
                        if (block.code === EBlockProtoCode.BLOCK_KYTKIN3)
                            yOffset = ajastin3_x / 2;
                    }
                    
                    block.setOffset(xOffset, yOffset);
                    //PisteDraw2_Image_CutClip(palikat_buffer, x * 32 - (kamera_x % 32) + ax, y * 32 - (kamera_y % 32) + ay, px, py, px + 32, py + 32);
                }
            }
        }
        
        // if (vesiaste % 2 == 0) {
        //     Animoi_Tuli();
        //     Animoi_Vesiputous();
        //     Animoi_Virta_Ylos();
        //     Animoi_Vedenpinta();
        // }
        //
        // if (vesiaste % 4 == 0) {
        //     Animoi_Vesi();
        //     PisteDraw2_RotatePalette(224, 239);
        // }
        
        // vesiaste = 1 + vesiaste % 320;
    }
}
