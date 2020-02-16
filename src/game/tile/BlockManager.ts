import { GameEnv } from '@game/game/GameEnv';
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
    PK2KARTTA_KARTTA_KORKEUS
} from '@game/map/PK2Map';
import { Block } from '@game/tile/Block';
import { BLOCK_RAW_SIZE, BLOCK_SIZE, EBlockProtoCode, BLOCK_TYPES } from '@game/tile/BlockConstants';
import { BlockContext } from '@game/tile/BlockContext';
import { BlockPrototype, TBlockProtoCode } from '@game/tile/BlockPrototype';
import { DwBlock } from '@game/tile/DwBlock';
import { ResourceNotFoundError } from '@ng/error/ResourceNotFoundError';
import { Log } from '@ng/support/log/LoggerImpl';
import { pathJoin, generate2DMatrix, ifnul } from '@ng/support/utils';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';
import { PkTextureTk } from '@ng/toolkit/PkTextureTk';
import { PkImage } from '@ng/types/PkImage';
import { MAX_BLOCK_MASKS, RESOURCES_PATH } from '../../support/constants';
import { int, CVect, cvect } from '../../support/types';

export class BlockManager {
    // Game Environment
    private readonly _ctx: GameEnv;
    
    //PALIKAT JA MASKIT
    private _palikat: CVect<DwBlock> = cvect(300);
    /** Source: lasketut_palikat */
    private _prototypes: CVect<BlockPrototype> = cvect(150);
    
    // Context to share with blocks
    private readonly _blockCtx: BlockContext;
    // Map-matrix for the background blocks
    private readonly _bgBlocks: DwBlock[];
    // Map-matrix for the foreground blocks
    private readonly _fgBlocks: DwBlock[];
    // Map-matrix for the edge blocks (?)
    private readonly _edges: boolean[];
    
    public constructor(ctx: GameEnv) {
        this._ctx = ctx;
        
        this._blockCtx = new BlockContext(this._ctx);
        this._bgBlocks = new Array(PK2KARTTA_KARTTA_LEVEYS * PK2KARTTA_KARTTA_KORKEUS).fill(null);
        this._fgBlocks = new Array(PK2KARTTA_KARTTA_LEVEYS * PK2KARTTA_KARTTA_KORKEUS).fill(null);
        this._edges = new Array(PK2KARTTA_KARTTA_LEVEYS * PK2KARTTA_KARTTA_KORKEUS).fill(null);
    }
    
    public placeBgBlocks(): void {
        for (let i = 0; i < PK2KARTTA_KARTTA_LEVEYS; i++) {
            for (let j = 0; j < PK2KARTTA_KARTTA_KORKEUS; j++) {
                // Get prototype from map
                const code = this._ctx.map.getBgBlockCode(i, j);
                
                if (code !== 255) {
                    const proto = this.getProto(code);
                    
                    // Create the block at the correct position
                    const block = new DwBlock(this._blockCtx, proto, i, j, TEXTURE_ID_BLOCKS);
                    
                    // Add to the game
                    this.setBgBlock(block);
                }
            }
        }
        
        console.log('BG Blocks placed.');
        
        // for (int x=-1;x<ruudun_leveys_palikoina;x++){
        //     for (int y=0;y<ruudun_korkeus_palikoina;y++){
        //         if (x + kartta_x < 0 || x + kartta_x > PK2KARTTA_KARTTA_LEVEYS) continue;
        //         if (y + kartta_y < 0 || y + kartta_y > PK2KARTTA_KARTTA_KORKEUS) continue;
        //
        //         int i = x + kartta_x + (y + kartta_y)*PK2KARTTA_KARTTA_LEVEYS;
        //         if(i<0 || i >= sizeof(taustat)) continue; //Dont access a not allowed address
        //
        //         palikka = taustat[i];
        //
        //         if (palikka != 255){
        //             px = ((palikka%10)*32);
        //             py = ((palikka/10)*32);
        //
        //             if (palikka == BLOCK_ANIM1 || palikka == BLOCK_ANIM2 || palikka == BLOCK_ANIM3 || palikka == BLOCK_ANIM4)
        //                 px += animaatio * 32;
        //
        //             PisteDraw2_Image_CutClip(palikat_buffer, x*32-(kamera_x%32), y*32-(kamera_y%32), px, py, px+32, py+32);
        //         }
        //     }
        // }
    }
    
    /**
     * Source: PK2Kartta::Piirra_Seinat.
     */
    public placeFgBlocks(): void {
        for (let i = 0; i < PK2KARTTA_KARTTA_LEVEYS; i++) {
            for (let j = 0; j < PK2KARTTA_KARTTA_KORKEUS; j++) {
                // Get prototype from map
                const code = this._ctx.map.getFgBlockCode(i, j);
                
                if (code !== 255) {
                    const proto = this.getProto(code);
                    
                    // Create the block at the correct position
                    const block = new DwBlock(this._blockCtx, proto, i, j, TEXTURE_ID_BLOCKS);
                    
                    // Add to the game
                    this.setFgBlock(block);
                }
            }
        }
        
        console.log('FG Blocks placed.');
        
        // //int PK2Kartta::Piirra_Seinat(int kamera_x, int kamera_y, bool editor){
        //     int palikka;
        //     int px = 0,
        //         py = 0,
        //         ay = 0,
        //         ax = 0,
        //         by = 0, bx = 0,
        //         kartta_x = kamera_x/32,
        //         kartta_y = kamera_y/32;
        //
        //     int ajastin1_y = 0,
        //         ajastin2_y = 0,
        //         ajastin3_x = 0;
        //
        //     if (ajastin1 > 0){
        //         ajastin1_y = 64;
        //
        //         if (ajastin1 < 64)
        //             ajastin1_y = ajastin1;
        //
        //         if (ajastin1 > KYTKIN_ALOITUSARVO-64)
        //             ajastin1_y = KYTKIN_ALOITUSARVO - ajastin1;
        //     }
        //
        //     if (ajastin2 > 0){
        //         ajastin2_y = 64;
        //
        //         if (ajastin2 < 64)
        //             ajastin2_y = ajastin2;
        //
        //         if (ajastin2 > KYTKIN_ALOITUSARVO-64)
        //             ajastin2_y = KYTKIN_ALOITUSARVO - ajastin2;
        //     }
        //
        //     if (ajastin3 > 0){
        //         ajastin3_x = 64;
        //
        //         if (ajastin3 < 64)
        //             ajastin3_x = ajastin3;
        //
        //         if (ajastin3 > KYTKIN_ALOITUSARVO-64)
        //             ajastin3_x = KYTKIN_ALOITUSARVO - ajastin3;
        //     }
        //
        //
        //     for (int x=-1; x < ruudun_leveys_palikoina + 1; x++){
        //         for (int y=-1; y < ruudun_korkeus_palikoina + 1; y++){
        //             if (x + kartta_x < 0 || x + kartta_x > PK2KARTTA_KARTTA_LEVEYS) continue;
        //             if (y + kartta_y < 0 || y + kartta_y > PK2KARTTA_KARTTA_KORKEUS) continue;
        //
        //             int i = x + kartta_x + (y + kartta_y)*PK2KARTTA_KARTTA_LEVEYS;
        //             if(i<0 || i >= sizeof(seinat)) continue; //Dont access a not allowed address
        //
        //             palikka = seinat[i];
        //
        //             if (palikka != 255 && !(!editor && palikka == BLOCK_ESTO_ALAS)){
        //                 px = ((palikka%10)*32);
        //                 py = ((palikka/10)*32);
        //                 ay = 0;
        //                 ax = 0;
        //
        //                 if (!editor){
        //                     if (palikka == BLOCK_HISSI_VERT)
        //                         ay = (int)kartta_sin_table[aste%360];
        //
        //                     if (palikka == BLOCK_HISSI_HORI)
        //                         ax = (int)kartta_cos_table[aste%360];
        //
        //                     if (palikka == BLOCK_KYTKIN1)
        //                         ay = ajastin1_y/2;
        //
        //                     if (palikka == BLOCK_KYTKIN2_YLOS)
        //                         ay = -ajastin2_y/2;
        //
        //                     if (palikka == BLOCK_KYTKIN2_ALAS)
        //                         ay = ajastin2_y/2;
        //
        //                     if (palikka == BLOCK_KYTKIN2)
        //                         ay = ajastin2_y/2;
        //
        //                     if (palikka == BLOCK_KYTKIN3_OIKEALLE)
        //                         ax = ajastin3_x/2;
        //
        //                     if (palikka == BLOCK_KYTKIN3_VASEMMALLE)
        //                         ax = -ajastin3_x/2;
        //
        //                     if (palikka == BLOCK_KYTKIN3)
        //                         ay = ajastin3_x/2;
        //                 }
        //
        //                 if (palikka == BLOCK_ANIM1 || palikka == BLOCK_ANIM2 || palikka == BLOCK_ANIM3 || palikka == BLOCK_ANIM4)
        //                     px += animaatio * 32;
        //
        //                 PisteDraw2_Image_CutClip(palikat_buffer, x*32-(kamera_x%32)+ax, y*32-(kamera_y%32)+ay, px, py, px+32, py+32);
        //             }
        //         }
    }
    
    /**
     * Source: PK2Kartta::Calculate_Edges.
     */
    public calculateEdges() {
        let block: DwBlock;
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
    
    // void     PK_Block_Set_Barriers(PK2BLOCK &palikka) {
    //     palikka.tausta = false;
    //
    //     palikka.oikealle	= BLOCK_SEINA;
    //     palikka.vasemmalle	= BLOCK_SEINA;
    //     palikka.ylos		= BLOCK_SEINA;
    //     palikka.alas		= BLOCK_SEINA;
    //
    //     // Special Floor
    //
    //     if (palikka.koodi > 139){
    //         palikka.oikealle	= BLOCK_TAUSTA;
    //         palikka.vasemmalle	= BLOCK_TAUSTA;
    //         palikka.ylos		= BLOCK_TAUSTA;
    //         palikka.alas		= BLOCK_TAUSTA;
    //     }
    //
    //     // Lifts
    //
    //     if (palikka.koodi == BLOCK_HISSI_HORI){
    //         palikka.vasen += (int)cos_table[degree%360];
    //         palikka.oikea += (int)cos_table[degree%360];
    //     }
    //     if (palikka.koodi == BLOCK_HISSI_VERT){
    //         palikka.ala += (int)sin_table[degree%360];
    //         palikka.yla += (int)sin_table[degree%360];
    //     }
    //
    //     // Walk-through Floor
    //
    //     if (palikka.koodi == BLOCK_ESTO_ALAS){
    //         palikka.oikealle	= BLOCK_TAUSTA;
    //         palikka.ylos		= BLOCK_TAUSTA;
    //         palikka.alas		= BLOCK_SEINA;
    //         palikka.vasemmalle	= BLOCK_TAUSTA;
    //         palikka.ala -= 27;
    //     }
    //
    //     // Hill
    //
    //     if (palikka.koodi > 49 && palikka.koodi < 60){
    //         palikka.oikealle	= BLOCK_TAUSTA;
    //         palikka.ylos		= BLOCK_SEINA;
    //         palikka.alas		= BLOCK_SEINA;
    //         palikka.vasemmalle	= BLOCK_TAUSTA;
    //         palikka.ala += 1;
    //     }
    //
    //     // Switches
    //
    //     if (palikka.koodi >= BLOCK_KYTKIN1 && palikka.koodi <= BLOCK_KYTKIN3){
    //         palikka.oikealle	= BLOCK_SEINA;
    //         palikka.ylos		= BLOCK_SEINA;
    //         palikka.alas		= BLOCK_SEINA;
    //         palikka.vasemmalle	= BLOCK_SEINA;
    //     }
    //
    //     // Switches Affected Floors
    //
    //     int kytkin1_y = 0,
    //         kytkin2_y = 0,
    //         kytkin3_x = 0;
    //
    //     if (kytkin1 > 0){
    //         kytkin1_y = 64;
    //
    //         if (kytkin1 < 64)
    //             kytkin1_y = kytkin1;
    //
    //         if (kytkin1 > KYTKIN_ALOITUSARVO-64)
    //             kytkin1_y = KYTKIN_ALOITUSARVO - kytkin1;
    //     }
    //
    //     if (kytkin2 > 0){
    //         kytkin2_y = 64;
    //
    //         if (kytkin2 < 64)
    //             kytkin2_y = kytkin2;
    //
    //         if (kytkin2 > KYTKIN_ALOITUSARVO-64)
    //             kytkin2_y = KYTKIN_ALOITUSARVO - kytkin2;
    //     }
    //
    //     if (kytkin3 > 0){
    //         kytkin3_x = 64;
    //
    //         if (kytkin3 < 64)
    //             kytkin3_x = kytkin3;
    //
    //         if (kytkin3 > KYTKIN_ALOITUSARVO-64)
    //             kytkin3_x = KYTKIN_ALOITUSARVO - kytkin3;
    //     }
    //
    //
    //     if (palikka.koodi == BLOCK_KYTKIN2_YLOS){
    //         palikka.ala -= kytkin2_y/2;
    //         palikka.yla -= kytkin2_y/2;
    //     }
    //
    //     if (palikka.koodi == BLOCK_KYTKIN2_ALAS){
    //         palikka.ala += kytkin2_y/2;
    //         palikka.yla += kytkin2_y/2;
    //     }
    //
    //     if (palikka.koodi == BLOCK_KYTKIN2){
    //         palikka.ala += kytkin2_y/2;
    //         palikka.yla += kytkin2_y/2;
    //     }
    //
    //     if (palikka.koodi == BLOCK_KYTKIN3_OIKEALLE){
    //         palikka.oikea += kytkin3_x/2;
    //         palikka.vasen += kytkin3_x/2;
    //         palikka.koodi = BLOCK_HISSI_HORI; // samat idea sivusuuntaan ty�nn�ss�
    //     }
    //
    //     if (palikka.koodi == BLOCK_KYTKIN3_VASEMMALLE){
    //         palikka.oikea -= kytkin3_x/2;
    //         palikka.vasen -= kytkin3_x/2;
    //         palikka.koodi = BLOCK_HISSI_HORI; // samat idea sivusuuntaan ty�nn�ss�
    //     }
    //
    //     if (palikka.koodi == BLOCK_KYTKIN3){
    //         palikka.ala += kytkin3_x/2;
    //         palikka.yla += kytkin3_x/2;
    //     }
    //
    //     if (palikka.koodi == BLOCK_KYTKIN1){
    //         palikka.ala += kytkin1_y/2;
    //         palikka.yla += kytkin1_y/2;
    //     }
    //
    // }
    
    /**
     * Performs the procedural generation of the block prototypes.<br>
     * Source: PK_Calculate_Tiles.
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
     * Source: PK_Calculate_MovableBlocks_Position.
     */
    public calculateMovableBlocksPosition(): void {
        this._prototypes[BLOCK_HISSI_HORI].vasen = Math.floor(this._ctx.entropy.getCos(this._ctx.entropy.degree % 360));
        this._prototypes[BLOCK_HISSI_HORI].oikea = Math.floor(this._ctx.entropy.getCos(this._ctx.entropy.degree % 360));
        
        this._prototypes[BLOCK_HISSI_VERT].ala = Math.floor(this._ctx.entropy.getSin(this._ctx.entropy.degree % 360));
        this._prototypes[BLOCK_HISSI_VERT].yla = Math.floor(this._ctx.entropy.getSin(this._ctx.entropy.degree % 360));
        
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
     * Source: PK2Kartta::Lataa_PalikkaPaletti.
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
        
        Log.d('Blocks textures loaded.');
        
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
    private get ctx(): GameEnv {
        return this._ctx;
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
    
    public getBgBlockCode(i: number, j: number): TBlockProtoCode {
        const block = this._bgBlocks[BlockManager.get1DIdx(i, j)];
        return (block != null) ? block.code : 255;
    }
    /**
     * Returns the background block at the specified position in the map.
     *
     * @param i - Block x coordinate in the matrix.
     * @param j - Block y coordinate in the matrix.
     */
    public getBgBlock(i: number, j: number): DwBlock {
        return this._bgBlocks[BlockManager.get1DIdx(i, j)];
    }
    public setBgBlock(block: DwBlock): void {
        // Save in place
        this._bgBlocks[BlockManager.get1DIdx(block.i, block.j)] = block;
        // Add to the scene
        this.ctx.composition.addBgBlock(block);
    }
    
    /**
     * Returns the prototype code for the foreground block at the specified position.<br>
     * If the block doesn't exist, it returns 255.
     *
     * @param i - Coordinate i.
     * @param j - Coordinate j.
     */
    public getFgBlockCode(i: number, j: number): TBlockProtoCode {
        const block = this._fgBlocks[BlockManager.get1DIdx(i, j)];
        return (block != null) ? block.code : 255;
    }
    public getFgBlock(i: number, j: number): DwBlock {
        return this._fgBlocks[BlockManager.get1DIdx(i, j)];
    }
    public setFgBlock(block: DwBlock): void {
        // Save in place
        this._fgBlocks[BlockManager.get1DIdx(block.i, block.j)] = block;
        // Add to the scene
        this.ctx.composition.addFgBlock(block);
    }
    
    private setEdge(i: number, j: number, edge: boolean = true): void {
        this._edges[BlockManager.get1DIdx(i, j)] = (edge === true);
    }
    private isEdge(i: number, j: number): boolean {
        return this._edges[BlockManager.get1DIdx(i, j)] === true;
    }
    
    public getVoidBlock(i: int, j: int): Block {
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
            
            toTheTop: 0,    // In C, int's initial value is random
            toTheRight: 0,  // In C, int's initial value is random
            toTheBottom: 0, // In C, int's initial value is random
            toTheLeft: 0,   // In C, int's initial value is random
            
            tausta: false,
            edge: true,
            water: false
        };
    }
    
    /**
     * Source: PK_Block_Get.
     *
     * @param i
     * @param j
     */
    public getBlockCollider(i: int, j: int): Block {
        // Block out of limits
        if (i < 0 || i > PK2KARTTA_KARTTA_LEVEYS || j < 0 || j > PK2KARTTA_KARTTA_LEVEYS) {
            return this.getVoidBlock(i, j);
        }
        
        let plain: Block;
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
}
