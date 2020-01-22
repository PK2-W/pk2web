import { GameEnv } from '@game/game/GameEnv';
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
import { BLOCK_RAW_SIZE, BLOCK_SIZE } from '@game/tile/BlockConstants';
import { BlockContext } from '@game/tile/BlockContext';
import { BlockPrototype, TBlockProtoCode } from '@game/tile/BlockPrototype';
import { Block } from '@game/tile/Block';
import { ResourceNotFoundError } from '@ng/error/ResourceNotFoundError';
import { Log } from '@ng/support/log/LoggerImpl';
import { pathJoin, generate2DMatrix } from '@ng/support/utils';
import { PkTextureTk } from '@ng/toolkit/PkTextureTk';
import { int, CVect, cvect } from '../../support/types';

export class BlockManager {
    // Game Environment
    private readonly _ctx: GameEnv;
    
    //PALIKAT JA MASKIT
    private _palikat: CVect<Block> = cvect(300);
    /** Source: lasketut_palikat */
    private _prototypes: CVect<BlockPrototype> = cvect(150);
    
    // Context to share with blocks
    private readonly _blockCtx: BlockContext;
    // Id in cache of the textures sheet // TODO -> Puede ser constante
    private _texturesId: string;
    // Map-matrix for the background blocks
    private readonly _bgBlocks: Block[][];
    // Map-matrix for the foreground blocks
    private readonly _fgBlocks: Block[][];
    
    public constructor(ctx: GameEnv) {
        this._ctx = ctx;
        
        this._blockCtx = new BlockContext(this._ctx);
        this._bgBlocks = generate2DMatrix(PK2KARTTA_KARTTA_LEVEYS, PK2KARTTA_KARTTA_KORKEUS);
        this._fgBlocks = generate2DMatrix(PK2KARTTA_KARTTA_LEVEYS, PK2KARTTA_KARTTA_KORKEUS);
    }
    
    public placeBgBlocks() {
        for (let i = 0; i < PK2KARTTA_KARTTA_LEVEYS; i++) {
            for (let j = 0; j < PK2KARTTA_KARTTA_KORKEUS; j++) {
                // Get prototype from map
                const code = this._ctx.map.getBgBlockCode(i, j);
                
                if (code !== 255) {
                    const proto = this.getProto(code);
                    
                    // Create the block at the correct position
                    const block = new Block(this._blockCtx, proto, this._texturesId);
                    block.x = i * BLOCK_SIZE;
                    block.y = j * BLOCK_SIZE;
                    
                    // Add to the game
                    this.setBgBlock(i, j, block);
                }
            }
        }
        
        console.log('Bg blocks placed.');
        
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
        const xx = BlockPrototype.generatePrecalculatedBlocks(); //TODO SAVE
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
        let image: HTMLImageElement;
        let baseTexture: PIXI.BaseTexture;
        
        // First, try to fetch the resource from provided location
        uri = pathJoin(fpath, fname);
        try {
            image = await this._ctx.context.resources.getImage(uri);
            found = true;
        } catch (err) {
            if (!(err instanceof ResourceNotFoundError)) {
                // TODO: Improve
                throw err;
            }
        }
        
        // If not found, try to fetch the resource from default location
        if (!found) {
            uri = pathJoin('gfx/tiles/', fname);
            
            try {
                image = await this._ctx.context.resources.getImage(uri);
            } catch (err) {
                throw err;
            }
        }
        
        // Remove transparent pixel and create the base texture
        image = PkTextureTk.imageRemoveTransparentPixel(image);
        baseTexture = PkTextureTk.imageToBaseTexture(image);
        
        this.ctx.textureCache.add(fname, baseTexture);
        
        // Save textures sheet id for later use
        this._texturesId = fname;
        
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
    
    /**
     * Returns the background block at the specified position in the map.
     *
     * @param i - Block x coordinate in the matrix.
     * @param j - Block y coordinate in the matrix.
     */
    public getBgBlock(i: number, j: number): Block {
        return this._bgBlocks[j][i];
    }
    public setBgBlock(i: number, j: number, block: Block): void {
        // Save in place
        this._bgBlocks[j][i] = block;
        // Add to the scene
        this.ctx.composition.addBgBlock(block);
    }
    
    public getFgBlock(i: number, j: number): Block {
        return this._fgBlocks[j][i];
    }
    public setFgBlock(i: number, j: number, block: Block) {
        this._fgBlocks[j][i] = block;
    }
    
    
    public getBlock(x: int, y: int) {
        //     PK2BLOCK palikka;
        //
        //     if (x < 0 || x > PK2KARTTA_KARTTA_LEVEYS || y < 0 || y > PK2KARTTA_KARTTA_LEVEYS) {
        //         palikka.koodi  = 255;
        //         palikka.tausta = true;
        //         palikka.vasen  = x*32;
        //         palikka.oikea  = x*32+32;
        //         palikka.yla	   = y*32;
        //         palikka.ala    = y*32+32;
        //         palikka.vesi   = false;
        //         palikka.reuna  = true;
        //         return palikka;
        //     }
        //
        //     BYTE i = kartta->seinat[x+y*PK2KARTTA_KARTTA_LEVEYS];
        //
        //     if (i<150){ //If it is ground
        //         palikka = lasketut_palikat[i];
        //         palikka.vasen  = x*32+lasketut_palikat[i].vasen;
        //         palikka.oikea  = x*32+32+lasketut_palikat[i].oikea;
        //         palikka.yla	   = y*32+lasketut_palikat[i].yla;
        //         palikka.ala    = y*32+32+lasketut_palikat[i].ala;
        //     }
        //     else{ //If it is sky - Need to reset
        //         palikka.koodi  = 255;
        //         palikka.tausta = true;
        //         palikka.vasen  = x*32;
        //         palikka.oikea  = x*32+32;
        //         palikka.yla	   = y*32;
        //         palikka.ala    = y*32+32;
        //         palikka.vesi   = false;
        //
        //         palikka.vasemmalle = 0;
        //         palikka.oikealle = 0;
        //         palikka.ylos = 0;
        //         palikka.alas = 0;
        //     }
        //
        //     i = kartta->taustat[x+y*PK2KARTTA_KARTTA_LEVEYS];
        //
        //     if (i>131 && i<140)
        //         palikka.vesi = true;
        //
        //     palikka.reuna = kartta->reunat[x+y*PK2KARTTA_KARTTA_LEVEYS];
        //
        //
        //     return palikka;
    }
}
