//==================================================
//(#10) Blocks
//==================================================

import {
    BLOCK_ESTO_ALAS,
    BLOCK_KYTKIN1,
    BLOCK_KYTKIN3,
    BLOCK_HISSI_HORI,
    BLOCK_HISSI_VERT,
    KYTKIN_ALOITUSARVO,
    BLOCK_KYTKIN2_YLOS,
    BLOCK_KYTKIN2_ALAS,
    BLOCK_KYTKIN2,
    BLOCK_KYTKIN3_OIKEALLE,
    BLOCK_KYTKIN3_VASEMMALLE
} from '@game/map/PK2Map';
import { PK2GameContext } from '@game/PK2GameContext';
import { TPK2Block, EBlocks } from '@game/tile/PK2Block';
import { int, CVect, cvect } from '../../support/types';

export class BlockManager {
    private readonly _context: PK2GameContext;
    
    //PALIKAT JA MASKIT
    private _palikat: CVect<TPK2Block> = cvect(300);
    /** Source: lasketut_palikat */
    private mCalculatedBlocks: CVect<TPK2Block> = cvect(150);
    
    public constructor(context: PK2GameContext) {
        this._context = context;
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
    //
    
    //
    // void     PK_Calculate_MovableBlocks_Position() {
    //     lasketut_palikat[BLOCK_HISSI_HORI].vasen = (int)cos_table[degree%360];
    //     lasketut_palikat[BLOCK_HISSI_HORI].oikea = (int)cos_table[degree%360];
    //
    //     lasketut_palikat[BLOCK_HISSI_VERT].ala = (int)sin_table[degree%360];
    //     lasketut_palikat[BLOCK_HISSI_VERT].yla = (int)sin_table[degree%360];
    //
    //     int kytkin1_y = 0,
    //         kytkin2_y = 0,
    //         kytkin3_x = 0;
    //
    //     if (kytkin1 > 0)
    //     {
    //         kytkin1_y = 64;
    //
    //         if (kytkin1 < 64)
    //             kytkin1_y = kytkin1;
    //
    //         if (kytkin1 > KYTKIN_ALOITUSARVO-64)
    //             kytkin1_y = KYTKIN_ALOITUSARVO - kytkin1;
    //     }
    //
    //     if (kytkin2 > 0)
    //     {
    //         kytkin2_y = 64;
    //
    //         if (kytkin2 < 64)
    //             kytkin2_y = kytkin2;
    //
    //         if (kytkin2 > KYTKIN_ALOITUSARVO-64)
    //             kytkin2_y = KYTKIN_ALOITUSARVO - kytkin2;
    //     }
    //
    //     if (kytkin3 > 0)
    //     {
    //         kytkin3_x = 64;
    //
    //         if (kytkin3 < 64)
    //             kytkin3_x = kytkin3;
    //
    //         if (kytkin3 > KYTKIN_ALOITUSARVO-64)
    //             kytkin3_x = KYTKIN_ALOITUSARVO - kytkin3;
    //     }
    //
    //     kytkin1_y /= 2;
    //     kytkin2_y /= 2;
    //     kytkin3_x /= 2;
    //
    //     lasketut_palikat[BLOCK_KYTKIN1].ala = kytkin1_y;
    //     lasketut_palikat[BLOCK_KYTKIN1].yla = kytkin1_y;
    //
    //     lasketut_palikat[BLOCK_KYTKIN2_YLOS].ala = -kytkin2_y;
    //     lasketut_palikat[BLOCK_KYTKIN2_YLOS].yla = -kytkin2_y;
    //
    //     lasketut_palikat[BLOCK_KYTKIN2_ALAS].ala = kytkin2_y;
    //     lasketut_palikat[BLOCK_KYTKIN2_ALAS].yla = kytkin2_y;
    //
    //     lasketut_palikat[BLOCK_KYTKIN2].ala = kytkin2_y;
    //     lasketut_palikat[BLOCK_KYTKIN2].yla = kytkin2_y;
    //
    //     lasketut_palikat[BLOCK_KYTKIN3_OIKEALLE].oikea = kytkin3_x;
    //     lasketut_palikat[BLOCK_KYTKIN3_OIKEALLE].vasen = kytkin3_x;
    //     lasketut_palikat[BLOCK_KYTKIN3_OIKEALLE].koodi = BLOCK_HISSI_HORI;
    //
    //     lasketut_palikat[BLOCK_KYTKIN3_VASEMMALLE].oikea = -kytkin3_x;
    //     lasketut_palikat[BLOCK_KYTKIN3_VASEMMALLE].vasen = -kytkin3_x;
    //     lasketut_palikat[BLOCK_KYTKIN3_VASEMMALLE].koodi = BLOCK_HISSI_HORI;
    //
    //     lasketut_palikat[BLOCK_KYTKIN3].ala = kytkin3_x;
    //     lasketut_palikat[BLOCK_KYTKIN3].yla = kytkin3_x;
    // }
    //
    // int      PK_Calculate_Tiles() {
    //     PK2BLOCK palikka;
    //
    //     for (int i=0;i<150;i++){
    //         palikka = lasketut_palikat[i];
    //
    //         palikka.vasen  = 0;
    //         palikka.oikea  = 0;//32
    //         palikka.yla	   = 0;
    //         palikka.ala    = 0;//32
    //
    //         palikka.koodi  = i;
    //
    //         if ((i < 80 || i > 139) && i != 255){
    //             palikka.tausta = false;
    //
    //             palikka.oikealle	= BLOCK_SEINA;
    //             palikka.vasemmalle	= BLOCK_SEINA;
    //             palikka.ylos		= BLOCK_SEINA;
    //             palikka.alas		= BLOCK_SEINA;
    //
    //             // Erikoislattiat
    //
    //             if (i > 139){
    //                 palikka.oikealle	= BLOCK_TAUSTA;
    //                 palikka.vasemmalle	= BLOCK_TAUSTA;
    //                 palikka.ylos		= BLOCK_TAUSTA;
    //                 palikka.alas		= BLOCK_TAUSTA;
    //             }
    //
    //             // L�pik�velt�v� lattia
    //
    //             if (i == BLOCK_ESTO_ALAS){
    //                 palikka.oikealle	= BLOCK_TAUSTA;
    //                 palikka.ylos		= BLOCK_TAUSTA;
    //                 palikka.alas		= BLOCK_SEINA;
    //                 palikka.vasemmalle	= BLOCK_TAUSTA;
    //                 palikka.ala -= 27;
    //             }
    //
    //             // M�et
    //
    //             if (i > 49 && i < 60){
    //                 palikka.oikealle	= BLOCK_TAUSTA;
    //                 palikka.ylos		= BLOCK_SEINA;
    //                 palikka.alas		= BLOCK_SEINA;
    //                 palikka.vasemmalle	= BLOCK_TAUSTA;
    //                 palikka.ala += 1;
    //             }
    //
    //             // Kytkimet
    //
    //             if (i >= BLOCK_KYTKIN1 && i <= BLOCK_KYTKIN3){
    //                 palikka.oikealle	= BLOCK_SEINA;
    //                 palikka.ylos		= BLOCK_SEINA;
    //                 palikka.alas		= BLOCK_SEINA;
    //                 palikka.vasemmalle	= BLOCK_SEINA;
    //             }
    //         }
    //         else{
    //             palikka.tausta = true;
    //
    //             palikka.oikealle	= BLOCK_TAUSTA;
    //             palikka.vasemmalle	= BLOCK_TAUSTA;
    //             palikka.ylos		= BLOCK_TAUSTA;
    //             palikka.alas		= BLOCK_TAUSTA;
    //         }
    //
    //         if (i > 131 && i < 140)
    //             palikka.vesi = true;
    //         else
    //             palikka.vesi = false;
    //
    //         lasketut_palikat[i] = palikka;
    //     }
    //
    //     PK_Calculate_MovableBlocks_Position();
    //
    //     return 0;
    // }
    
    /**
     * Source: PK_Calculate_Tiles.
     */
    public calculateTiles(): void {
        let palikka: TPK2Block;
        
        for (let i = 0; i < 150; i++) {
            palikka = {};
            
            palikka.vasen = 0;
            palikka.oikea = 0; //32
            palikka.yla = 0;
            palikka.ala = 0; //32
            
            palikka.koodi = i;
            
            if ((i < 80 || i > 139) && i !== 255) {
                palikka.tausta = false;
                
                palikka.oikealle = EBlocks.BLOCK_SEINA;
                palikka.vasemmalle = EBlocks.BLOCK_SEINA;
                palikka.ylos = EBlocks.BLOCK_SEINA;
                palikka.alas = EBlocks.BLOCK_SEINA;
                
                // Erikoislattiat
                
                if (i > 139) {
                    palikka.oikealle = EBlocks.BLOCK_TAUSTA;
                    palikka.vasemmalle = EBlocks.BLOCK_TAUSTA;
                    palikka.ylos = EBlocks.BLOCK_TAUSTA;
                    palikka.alas = EBlocks.BLOCK_TAUSTA;
                }
                
                // L�pik�velt�v� lattia
                
                if (i === BLOCK_ESTO_ALAS) {
                    palikka.oikealle = EBlocks.BLOCK_TAUSTA;
                    palikka.ylos = EBlocks.BLOCK_TAUSTA;
                    palikka.alas = EBlocks.BLOCK_SEINA;
                    palikka.vasemmalle = EBlocks.BLOCK_TAUSTA;
                    palikka.ala -= 27;
                }
                
                // M�et
                
                if (i > 49 && i < 60) {
                    palikka.oikealle = EBlocks.BLOCK_TAUSTA;
                    palikka.ylos = EBlocks.BLOCK_SEINA;
                    palikka.alas = EBlocks.BLOCK_SEINA;
                    palikka.vasemmalle = EBlocks.BLOCK_TAUSTA;
                    palikka.ala += 1;
                }
                
                // Kytkimet
                
                if (i >= BLOCK_KYTKIN1 && i <= BLOCK_KYTKIN3) {
                    palikka.oikealle = EBlocks.BLOCK_SEINA;
                    palikka.ylos = EBlocks.BLOCK_SEINA;
                    palikka.alas = EBlocks.BLOCK_SEINA;
                    palikka.vasemmalle = EBlocks.BLOCK_SEINA;
                }
            } else {
                palikka.tausta = true;
                
                palikka.oikealle = EBlocks.BLOCK_TAUSTA;
                palikka.vasemmalle = EBlocks.BLOCK_TAUSTA;
                palikka.ylos = EBlocks.BLOCK_TAUSTA;
                palikka.alas = EBlocks.BLOCK_TAUSTA;
            }
            
            palikka.vesi = (i > 131 && i < 140);
            
            this.mCalculatedBlocks[i] = palikka;
        }
        
        this.calculateMovableBlocksPosition();
    }
    
    private calculateMovableBlocksPosition(): void {
        this.mCalculatedBlocks[BLOCK_HISSI_HORI].vasen = Math.floor(this._context.getCos(this._context.degree % 360));
        this.mCalculatedBlocks[BLOCK_HISSI_HORI].oikea = Math.floor(this._context.getCos(this._context.degree % 360));
        
        this.mCalculatedBlocks[BLOCK_HISSI_VERT].ala = Math.floor(this._context.getSin(this._context.degree % 360));
        this.mCalculatedBlocks[BLOCK_HISSI_VERT].yla = Math.floor(this._context.getSin(this._context.degree % 360));
        
        let kytkin1_y: int = 0;
        let kytkin2_y: int = 0;
        let kytkin3_x: int = 0;
        
        //
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
        
        this.mCalculatedBlocks[BLOCK_KYTKIN1].ala = kytkin1_y;
        this.mCalculatedBlocks[BLOCK_KYTKIN1].yla = kytkin1_y;
        
        this.mCalculatedBlocks[BLOCK_KYTKIN2_YLOS].ala = -kytkin2_y;
        this.mCalculatedBlocks[BLOCK_KYTKIN2_YLOS].yla = -kytkin2_y;
        
        this.mCalculatedBlocks[BLOCK_KYTKIN2_ALAS].ala = kytkin2_y;
        this.mCalculatedBlocks[BLOCK_KYTKIN2_ALAS].yla = kytkin2_y;
        
        this.mCalculatedBlocks[BLOCK_KYTKIN2].ala = kytkin2_y;
        this.mCalculatedBlocks[BLOCK_KYTKIN2].yla = kytkin2_y;
        
        this.mCalculatedBlocks[BLOCK_KYTKIN3_OIKEALLE].oikea = kytkin3_x;
        this.mCalculatedBlocks[BLOCK_KYTKIN3_OIKEALLE].vasen = kytkin3_x;
        this.mCalculatedBlocks[BLOCK_KYTKIN3_OIKEALLE].koodi = BLOCK_HISSI_HORI;
        
        this.mCalculatedBlocks[BLOCK_KYTKIN3_VASEMMALLE].oikea = -kytkin3_x;
        this.mCalculatedBlocks[BLOCK_KYTKIN3_VASEMMALLE].vasen = -kytkin3_x;
        this.mCalculatedBlocks[BLOCK_KYTKIN3_VASEMMALLE].koodi = BLOCK_HISSI_HORI;
        
        this.mCalculatedBlocks[BLOCK_KYTKIN3].ala = kytkin3_x;
        this.mCalculatedBlocks[BLOCK_KYTKIN3].yla = kytkin3_x;
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
