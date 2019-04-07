//#########################
//Pekka Kana 2
//by Janne Kivilahti from Piste Gamez (2003)
//#########################

import { BYTE, uint, str, int, bool, rand, cvect, CVect, sizeof } from '../support/types';

// #include <sys/stat.h>
// #include <iostream>
// #include <fcntl.h>
// #include <inttypes.h>
// #include <fstream>
//
// #include "game.hpp"
// #include "map.hpp"
// #include "PisteDraw.hpp"
// #include "PisteUtils.hpp"
// #include "PisteInput.hpp"
//
// using namespace std;
//
// double *kartta_cos_table;
// double *kartta_sin_table;
//

// struct PK2KARTTA{ // Vanha versio 0.1
// 	char		versio[8];
// 	char		nimi[40];
// 	BYTE		taustakuva;
// 	BYTE		musiikki;
// 	BYTE		kartta [640*224];
// 	BYTE		palikat[320*256];
// 	BYTE		extrat [640*480];
// };
//
//
// //char PK2Kartta::pk2_hakemisto[256] = "";

export type RECT = {
    left: int; top: int; right: int; bottom: int;
} ;

export const PK2KARTTA_VIIMEISIN_VERSIO: str<4> = '1.3';

export const PK2KARTTA_KARTTA_LEVEYS: uint = 256;
export const PK2KARTTA_KARTTA_KORKEUS: uint = 224;
export const PK2KARTTA_KARTTA_KOKO: uint = PK2KARTTA_KARTTA_LEVEYS * PK2KARTTA_KARTTA_KORKEUS;
export const PK2KARTTA_BLOCK_PALETTI_LEVEYS: uint = 320;
export const PK2KARTTA_BLOCK_PALETTI_KORKEUS: uint = 480;
export const PK2KARTTA_TAUSTAKUVA_EI: BYTE = 0;
export const PK2KARTTA_EXTRA_EI: BYTE = 0;

export const PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA: uint = 100;

export const BLOCK_ESTO_ALAS: BYTE = 40;
export const BLOCK_HISSI_HORI: BYTE = 41;
export const BLOCK_HISSI_VERT: BYTE = 42;
export const BLOCK_KYTKIN2_YLOS: BYTE = 43;
export const BLOCK_KYTKIN2_ALAS: BYTE = 45;
export const BLOCK_KYTKIN3_OIKEALLE: BYTE = 44;
export const BLOCK_KYTKIN3_VASEMMALLE: BYTE = 46;
export const BLOCK_LUKKO: BYTE = 47;
export const BLOCK_KALLOSEINA: BYTE = 48;
export const BLOCK_KALLOTAUSTA: BYTE = 49;
export const BLOCK_ANIM1: BYTE = 60;
export const BLOCK_ANIM2: BYTE = 65;
export const BLOCK_ANIM3: BYTE = 70;
export const BLOCK_ANIM4: BYTE = 75;
export const BLOCK_VIRTA_VASEMMALLE: BYTE = 140;
export const BLOCK_VIRTA_OIKEALLE: BYTE = 141;
export const BLOCK_VIRTA_YLOS: BYTE = 142;
export const BLOCK_PIILO: BYTE = 143;
export const BLOCK_TULI: BYTE = 144;
export const BLOCK_KYTKIN1: BYTE = 145;
export const BLOCK_KYTKIN2: BYTE = 146;
export const BLOCK_KYTKIN3: BYTE = 147;
export const BLOCK_ALOITUS: BYTE = 148;
export const BLOCK_LOPETUS: BYTE = 149;

export const KYTKIN_ALOITUSARVO: int = 2000;

export const ILMA_NORMAALI: BYTE = 0;
export const ILMA_SADE: BYTE = 1;
export const ILMA_METSA: BYTE = 2;
export const ILMA_SADEMETSA: BYTE = 3;
export const ILMA_LUMISADE: BYTE = 4;

export const TAUSTA_STAATTINEN: BYTE = 0;
export const TAUSTA_PALLARX_VERT: BYTE = 1;
export const TAUSTA_PALLARX_HORI: BYTE = 2;
export const TAUSTA_PALLARX_VERT_JA_HORI: BYTE = 3;

///

export const PK2Kartta_Cos_Sin = function(/*double *cost, double *sint*/) {
    // 	kartta_cos_table = cost;
    // 	kartta_sin_table = sint;
};

export const PK2Kartta_Animoi = function(degree: int, anim: int, aika1: int, aika2: int, aika3: int, keys: bool) {
    // 	aste = degree;
    // 	animaatio = anim;
    // 	ajastin1 = aika1;
    // 	ajastin2 = aika2;
    // 	ajastin3 = aika3;
    // 	avaimet  = keys;
};

export const PK2Kartta_Aseta_Ruudun_Mitat = function(leveys: int, korkeus: int) {
    // 	ruudun_leveys_palikoina  = leveys/32+1;
    // 	ruudun_korkeus_palikoina = korkeus/32+1;
};

///

export class PK2Kartta {
    private aste: int;
    private vesiaste: int = 0;
    private animaatio: int;
    private ajastin1: int;
    private ajastin2: int;
    private ajastin3: int;
    private avaimet: int;
    
    private ruudun_leveys_palikoina: int = 21;
    private ruudun_korkeus_palikoina: int = 16;
    
    public static pk2_hakemisto: str<256>; // PK2.exe:n sis�lt�v� hakemisto
    
    public versio: str<5>;			// map version. eg "1.3"
    public palikka_bmp: str<13>;	// _uri of block palette .bmp
    public taustakuva: str<13>;		// _uri of map bg .bmp
    public musiikki: str<13>;		// _uri of map music
    
    public nimi: str<40>;			// map name
    public tekija: str<40>;			// map author
    
    public jakso: int;				// level of the episode
    public ilma: int;				// map climate
    public aika: int;				// map time
    public extra: BYTE;				// extra config - not used
    public tausta: BYTE;				// bg movemant type
    public kytkin1_aika: uint;		// button 1 time - not used
    public kytkin2_aika: uint;		// button 2 time - not used
    public kytkin3_aika: uint;		// button 3 time - not used
    public pelaaja_sprite: int;		// player prototype
    
    public taustat: CVect<BYTE> = cvect(PK2KARTTA_KARTTA_KOKO);	// map bg tiles 256*224
    public seinat: CVect<BYTE> = cvect(PK2KARTTA_KARTTA_KOKO);	// map fg tiles 256*224
    public spritet: CVect<BYTE> = cvect(PK2KARTTA_KARTTA_KOKO);	// map sprites 256*224
    // 	char		protot [PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA][13]; // map prototype list .spr
    public reunat: bool[] = new Array(PK2KARTTA_KARTTA_KOKO); // map edges - calculated during game
    
    public palikat_buffer: int;		// index of block palette
    public taustakuva_buffer: int;	// index of bg image
    public palikat_vesi_buffer: int; // index of water palette
    
    public x: int;					// map icon pos
    public y: int;
    public ikoni: int;					// map icon id
    
    
    // Oletusmuodostin
    constructor(/*const PK2Kartta &kartta*/) {
        this.palikat_buffer = -1;
        this.taustakuva_buffer = -1;
        this.palikat_vesi_buffer = -1;
    }
    
    // Hajoitin
    public destroy() {
    }
    
    
    // public     PK2Kartta &operator = (const PK2Kartta &kartta);	//Sijoitusoperaattori
    // public     int Lataa(char *polku, char *nimi);		// Lataa kartta
    // public     int Lataa_Pelkat_Tiedot(char *polku, char *nimi);	// Lataa kartta ilman grafiikoita
    
    // Save map
    public Tallenna(/*char *filename*/): int {
        // 	char luku[8];
        // 	DWORD i;
        //
        // 	ofstream *tiedosto = new ofstream(filename, ios::binary);
        //
        // 	strcpy(this->versio, PK2KARTTA_VIIMEISIN_VERSIO);
        //
        // 	//tiedosto->write ((char *)this, sizeof (*this));
        //
        // 	tiedosto->write(this->versio,		sizeof(versio));
        // 	tiedosto->write(this->palikka_bmp,	sizeof(palikka_bmp));
        // 	tiedosto->write(this->taustakuva,	sizeof(taustakuva));
        // 	tiedosto->write(this->musiikki,		sizeof(musiikki));
        // 	tiedosto->write(this->nimi,			sizeof(nimi));
        // 	tiedosto->write(this->tekija,		sizeof(tekija));
        //
        // 	//itoa(this->jakso,luku,10);
        // 	sprintf(luku, "%i", this->jakso);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	//itoa(this->ilma,luku,10);
        // 	sprintf(luku, "%i", this->ilma);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	//itoa(this->kytkin1_aika,luku,10);
        // 	sprintf(luku, "%" PRIu32, this->kytkin1_aika);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	//itoa(this->kytkin2_aika,luku,10);
        // 	sprintf(luku, "%" PRIu32, this->kytkin2_aika);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	//itoa(this->kytkin3_aika,luku,10);
        // 	sprintf(luku, "%" PRIu32, this->kytkin3_aika);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	//itoa(this->aika,luku,10);
        // 	sprintf(luku, "%i", this->aika);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	//itoa(this->extra,luku,10);
        // 	sprintf(luku, "%i", this->extra);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	//itoa(this->tausta,luku,10);
        // 	sprintf(luku, "%i", this->tausta);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	//itoa(this->pelaaja_sprite,luku,10);
        // 	sprintf(luku, "%i", this->pelaaja_sprite);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	//itoa(this->x,luku,10);
        // 	sprintf(luku, "%i", this->x);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	//itoa(this->y,luku,10);
        // 	sprintf(luku, "%i", this->y);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	//itoa(this->ikoni,luku,10);
        // 	sprintf(luku, "%i", this->ikoni);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	int protoja = 0;
        //
        // 	for (i=0;i<PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA;i++)
        // 		if (strlen(this->protot[i]) > 0)
        // 			protoja++;
        //
        // 	//itoa(protoja,luku,10);
        // 	sprintf(luku, "%i", protoja);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	for (i=0;i<PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA;i++)
        // 		if (strlen(this->protot[i]) > 0)
        // 			tiedosto->write(protot[i],sizeof(protot[i]));
        //
        // 	// laske alue
        //
        // 	//BYTE *alue_taustat = NULL, *alue_seinat = NULL, *alue_spritet = NULL;
        // 	RECT alue = {0,0,0,0};
        // 	DWORD /*koko, aloituskohta,*/ leveys, korkeus, x, y;
        // 	DWORD aloitus_x,aloitus_y;
        // 	char tile[1];
        //
        // 	// taustat
        // 	alue = LaskeTallennusAlue(this->taustat);
        // 	leveys = alue.right - alue.left;
        // 	korkeus = alue.bottom - alue.top;
        // 	aloitus_x = alue.left;
        // 	aloitus_y = alue.top;
        //
        // 	sprintf(luku, "%" PRIu32, aloitus_x);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	sprintf(luku, "%" PRIu32, aloitus_y);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	sprintf(luku, "%" PRIu32, leveys);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	sprintf(luku, "%" PRIu32, korkeus);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	for (y=aloitus_y;y<=aloitus_y+korkeus;y++) {	// Kirjoitetaan alue tiedostoon tile by tile
        // 		for (x=aloitus_x;x<=aloitus_x+leveys;x++) {
        // 			tile[0] = this->taustat[x+y*PK2KARTTA_KARTTA_LEVEYS];
        // 			tiedosto->write(tile, sizeof(tile));
        // 		}
        // 	}
        //
        // 	// seinat
        // 	alue = LaskeTallennusAlue(this->seinat);
        // 	leveys = alue.right - alue.left;
        // 	korkeus = alue.bottom - alue.top;
        // 	aloitus_x = alue.left;
        // 	aloitus_y = alue.top;
        // 	//ltoa(aloitus_x,luku,10);
        // 	sprintf(luku, "%" PRIu32, aloitus_x);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	sprintf(luku, "%" PRIu32, aloitus_y);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	sprintf(luku, "%" PRIu32, leveys);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        //
        // 	sprintf(luku, "%" PRIu32, korkeus);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku)); //TODO - MAKE A FUNCTION TO DO THIS
        // 	for (y=aloitus_y;y<=aloitus_y+korkeus;y++) {	// Kirjoitetaan alue tiedostoon tile by tile
        // 		for (x=aloitus_x;x<=aloitus_x+leveys;x++) {
        // 			tile[0] = this->seinat[x+y*PK2KARTTA_KARTTA_LEVEYS];
        // 			tiedosto->write(tile, sizeof(tile));
        // 		}
        // 	}
        //
        // 	// spritet
        // 	alue = LaskeTallennusAlue(this->spritet);
        // 	leveys = alue.right - alue.left;
        // 	korkeus = alue.bottom - alue.top;
        // 	aloitus_x = alue.left;
        // 	aloitus_y = alue.top;
        // 	//ltoa(aloitus_x,luku,10);
        // 	sprintf(luku, "%" PRIu32, aloitus_x);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        // 	//ltoa(aloitus_y,luku,10);
        // 	sprintf(luku, "%" PRIu32, aloitus_y);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        // 	//ltoa(leveys,luku,10);
        // 	sprintf(luku, "%" PRIu32, leveys);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        // 	//ltoa(korkeus,luku,10);
        // 	sprintf(luku, "%" PRIu32, korkeus);
        // 	tiedosto->write(luku, sizeof(luku));
        // 	memset(luku, 0, sizeof(luku));
        // 	for (y=aloitus_y;y<=aloitus_y+korkeus;y++) {	// Kirjoitetaan alue tiedostoon tile by tile
        // 		for (x=aloitus_x;x<=aloitus_x+leveys;x++) {
        // 			tile[0] = this->spritet[x+y*PK2KARTTA_KARTTA_LEVEYS];
        // 			tiedosto->write(tile, sizeof(tile));
        // 		}
        // 	}
        //
        // 	if (tiedosto->fail()){
        // 		delete (tiedosto);
        // 		return 1;
        // 	}
        //
        // 	delete (tiedosto);
        
        return 0;
    }
    
    // public     void Tyhjenna();				// clean map
    // public     RECT LaskeTallennusAlue(BYTE *lahde, BYTE *&kohde);
    // public     RECT LaskeTallennusAlue(BYTE *alue);
    // public     void LueTallennusAlue(BYTE *lahde, RECT alue, int kohde);
    public Piirra_Taustat(kamera_x: int, kamera_y: int, editor: bool): int {
        let palikka: int;
        let px: int = 0,
            py: int = 0,
            kartta_x: int = kamera_x / 32,
            kartta_y: int = kamera_y / 32;
        
        for (let x = -1; x < this.ruudun_leveys_palikoina; x++) {
            for (let y = 0; y < this.ruudun_korkeus_palikoina; y++) {
                if (x + kartta_x < 0 || x + kartta_x > PK2KARTTA_KARTTA_LEVEYS) continue;
                if (y + kartta_y < 0 || y + kartta_y > PK2KARTTA_KARTTA_KORKEUS) continue;
                
                let i: int = x + kartta_x + (y + kartta_y) * PK2KARTTA_KARTTA_LEVEYS;
                if (i < 0 || i >= sizeof(this.taustat)) continue; //Dont access a not allowed address
                
                palikka = this.taustat[i];
                
                if (palikka !== 255) {
                    px = ((palikka % 10) * 32);
                    py = ((palikka / 10) * 32);
                    
                    if (palikka === BLOCK_ANIM1 || palikka === BLOCK_ANIM2 || palikka === BLOCK_ANIM3 || palikka === BLOCK_ANIM4)
                        px += this.animaatio * 32;
                    
                    // PisteDraw2_Image_CutClip(this.palikat_buffer, x * 32 - (kamera_x % 32), y * 32 - (kamera_y % 32), px, py, px + 32, py + 32);
                }
            }
        }
        
        return 0;
    }
    
    public Piirra_Seinat(kamera_x: int, kamera_y: int, editor: bool): int {
        let palikka: int;
        let px: int = 0,
            py: int = 0,
            ay: int = 0,
            ax: int = 0,
            by: int = 0, bx: int = 0,
            kartta_x: int = kamera_x / 32,
            kartta_y: int = kamera_y / 32;
        
        let ajastin1_y: int = 0,
            ajastin2_y: int = 0,
            ajastin3_x: int = 0;
        
        if (this.ajastin1 > 0) {
            ajastin1_y = 64;
            
            if (this.ajastin1 < 64)
                ajastin1_y = this.ajastin1;
            
            if (this.ajastin1 > KYTKIN_ALOITUSARVO - 64)
                ajastin1_y = KYTKIN_ALOITUSARVO - this.ajastin1;
        }
        
        if (this.ajastin2 > 0) {
            ajastin2_y = 64;
            
            if (this.ajastin2 < 64)
                ajastin2_y = this.ajastin2;
            
            if (this.ajastin2 > KYTKIN_ALOITUSARVO - 64)
                ajastin2_y = KYTKIN_ALOITUSARVO - this.ajastin2;
        }
        
        if (this.ajastin3 > 0) {
            ajastin3_x = 64;
            
            if (this.ajastin3 < 64)
                ajastin3_x = this.ajastin3;
            
            if (this.ajastin3 > KYTKIN_ALOITUSARVO - 64)
                ajastin3_x = KYTKIN_ALOITUSARVO - this.ajastin3;
        }
        
        
        for (let x = -1; x < this.ruudun_leveys_palikoina + 1; x++) {
            for (let y = -1; y < this.ruudun_korkeus_palikoina + 1; y++) {
                if (x + kartta_x < 0 || x + kartta_x > PK2KARTTA_KARTTA_LEVEYS) continue;
                if (y + kartta_y < 0 || y + kartta_y > PK2KARTTA_KARTTA_KORKEUS) continue;
                
                let i: int = x + kartta_x + (y + kartta_y) * PK2KARTTA_KARTTA_LEVEYS;
                if (i < 0 || i >= sizeof(this.seinat)) continue; //Dont access a not allowed address
                
                palikka = this.seinat[i];
                
                if (palikka !== 255 && !(!editor && palikka === BLOCK_ESTO_ALAS)) {
                    px = ((palikka % 10) * 32);
                    py = ((palikka / 10) * 32);
                    ay = 0;
                    ax = 0;
                    
                    if (!editor) {
                        // if (palikka == BLOCK_HISSI_VERT)
                        // 	ay = (int)kartta_sin_table[aste%360];
                        //
                        // if (palikka == BLOCK_HISSI_HORI)
                        // 	ax = (int)kartta_cos_table[aste%360];
                        
                        if (palikka === BLOCK_KYTKIN1)
                            ay = ajastin1_y / 2;
                        
                        if (palikka === BLOCK_KYTKIN2_YLOS)
                            ay = -ajastin2_y / 2;
                        
                        if (palikka === BLOCK_KYTKIN2_ALAS)
                            ay = ajastin2_y / 2;
                        
                        if (palikka === BLOCK_KYTKIN2)
                            ay = ajastin2_y / 2;
                        
                        if (palikka === BLOCK_KYTKIN3_OIKEALLE)
                            ax = ajastin3_x / 2;
                        
                        if (palikka === BLOCK_KYTKIN3_VASEMMALLE)
                            ax = -ajastin3_x / 2;
                        
                        if (palikka === BLOCK_KYTKIN3)
                            ay = ajastin3_x / 2;
                    }
                    
                    if (palikka === BLOCK_ANIM1 || palikka === BLOCK_ANIM2 || palikka === BLOCK_ANIM3 || palikka === BLOCK_ANIM4)
                        px += this.animaatio * 32;
                    
                    // PisteDraw2_Image_CutClip(this.palikat_buffer, x * 32 - (kamera_x % 32) + ax, y * 32 - (kamera_y % 32) + ay, px, py, px + 32, py + 32);
                }
            }
        }
        
        if (this.vesiaste % 2 === 0) {
            this.Animoi_Tuli();
            this.Animoi_Vesiputous();
            this.Animoi_Virta_Ylos();
            this.Animoi_Vedenpinta();
        }
        
        if (this.vesiaste % 4 === 0) {
            this.Animoi_Vesi();
            // PisteDraw2_RotatePalette(224, 239);
        }
        
        this.vesiaste = 1 + this.vesiaste % 320;
        
        return 0;
    };
    
    public Kopioi(/*PK2Kartta &kartta*/): void {
        // 	if (this != &kartta){
        // 		strcpy(this->versio,		kartta.versio);
        // 		strcpy(this->palikka_bmp,	kartta.palikka_bmp);
        // 		strcpy(this->taustakuva,	kartta.taustakuva);
        // 		strcpy(this->musiikki,		kartta.musiikki);
        //
        // 		strcpy(this->nimi,			kartta.nimi);
        // 		strcpy(this->tekija,		kartta.tekija);
        //
        // 		this->jakso			= kartta.jakso;
        // 		this->ilma			= kartta.ilma;
        // 		this->kytkin1_aika	= kartta.kytkin1_aika;
        // 		this->kytkin2_aika	= kartta.kytkin2_aika;
        // 		this->kytkin3_aika	= kartta.kytkin3_aika;
        // 		this->pelaaja_sprite = kartta.pelaaja_sprite;
        // 		this->aika		= kartta.aika;
        // 		this->extra		= kartta.extra;
        // 		this->tausta	= kartta.tausta;
        //
        // 		int i;
        //
        // 		for (i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
        // 			this->seinat[i] = kartta.seinat[i];
        //
        // 		for (i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
        // 			this->taustat[i] = kartta.taustat[i];
        //
        // 		for (i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
        // 			this->spritet[i] = kartta.spritet[i];
        //
        // 		for (i=0;i<PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA;i++)
        // 			strcpy(this->protot[i],kartta.protot[i]);
        //
        // 		PisteDraw2_ImageFill(palikat_buffer,255);
        // 		PisteDraw2_ImageFill(taustakuva_buffer,0);
        //
        // 		PisteDraw2_Image_Copy(kartta.taustakuva_buffer,this->taustakuva_buffer);
        // 		PisteDraw2_Image_Copy(kartta.palikat_buffer,this->palikat_buffer);
        // 		PisteDraw2_Image_Copy(kartta.palikat_vesi_buffer,this->palikat_vesi_buffer);
        // 	}
    };
    
    /// PK2 functions
    
    public Count_Keys(): int {
        let sprite: BYTE;
        
        let keys: int = 0;
        
        for (let x = 0; x < PK2KARTTA_KARTTA_KOKO; x++) {
            sprite = this.spritet[x];
            if (sprite !== 255)
            // if (Game::Sprites->protot[sprite].avain &&
            // 	Game::Sprites->protot[sprite].tuhoutuminen !== TUHOUTUMINEN_EI_TUHOUDU)
                
                keys++;
        }
        
        return keys;
    }
    
    public Change_SkullBlocks(): void {
        let front: BYTE, back: BYTE;
        
        for (let x = 0; x < PK2KARTTA_KARTTA_LEVEYS; x++)
            for (let y = 0; y < PK2KARTTA_KARTTA_KORKEUS; y++) {
                front = this.seinat[x + y * PK2KARTTA_KARTTA_LEVEYS];
                back = this.taustat[x + y * PK2KARTTA_KARTTA_LEVEYS];
                
                if (front === BLOCK_KALLOSEINA) {
                    this.seinat[x + y * PK2KARTTA_KARTTA_LEVEYS] = 255;
                    // if (back !== BLOCK_KALLOSEINA)
                    // 	Effect::SmokeClouds(x*32+24,y*32+6);
                }
                
                if (back === BLOCK_KALLOTAUSTA && front === 255)
                    this.seinat[x + y * PK2KARTTA_KARTTA_LEVEYS] = BLOCK_KALLOSEINA;
            }
        
        // 	Game::vibration = 90;//60
        // 	PisteInput_Vibrate();
        
        //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.game_locksopen));
        
        this.Calculate_Edges();
    }
    
    public Open_Locks(): void {
        let palikka: BYTE;
        
        for (let x = 0; x < PK2KARTTA_KARTTA_LEVEYS; x++)
            for (let y = 0; y < PK2KARTTA_KARTTA_KORKEUS; y++) {
                palikka = this.seinat[x + y * PK2KARTTA_KARTTA_LEVEYS];
                if (palikka === BLOCK_LUKKO) {
                    this.seinat[x + y * PK2KARTTA_KARTTA_LEVEYS] = 255;
                    // 				Effect::SmokeClouds(x*32+6,y*32+6);
                }
            }
        
        // 	Game::vibration = 90;//60
        // 	PisteInput_Vibrate();
        
        // 	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.game_locksopen));
        
        this.Calculate_Edges();
    }
    
    public Calculate_Edges(): void {
        let tile1: BYTE, tile2: BYTE, tile3: BYTE;
        let edge: bool = false;
        
        // 	memset(this->reunat, false, sizeof(this->reunat));
        
        for (let x = 1; x < PK2KARTTA_KARTTA_LEVEYS - 1; x++)
            for (let y = 0; y < PK2KARTTA_KARTTA_KORKEUS - 1; y++) {
                // 			edge = false;
                
                tile1 = this.seinat[x + y * PK2KARTTA_KARTTA_LEVEYS];
                
                if (tile1 > BLOCK_LOPETUS)
                    this.seinat[x + y * PK2KARTTA_KARTTA_LEVEYS] = 255;
                
                tile2 = this.seinat[x + (y + 1) * PK2KARTTA_KARTTA_LEVEYS];
                
                if (tile1 > 79 || tile1 === BLOCK_ESTO_ALAS) tile1 = 1; else tile1 = 0;
                if (tile2 > 79) tile2 = 1; else tile2 = 0;
                
                if (tile1 === 1 && tile2 === 1) {
                    tile1 = this.seinat[x + 1 + (y + 1) * PK2KARTTA_KARTTA_LEVEYS];
                    tile2 = this.seinat[x - 1 + (y + 1) * PK2KARTTA_KARTTA_LEVEYS];
                    
                    if (tile1 < 80 && !(tile1 < 60 && tile1 > 49)) tile1 = 1; else tile1 = 0;
                    if (tile2 < 80 && !(tile2 < 60 && tile2 > 49)) tile2 = 1; else tile2 = 0;
                    
                    if (tile1 === 1) {
                        tile3 = this.seinat[x + 1 + y * PK2KARTTA_KARTTA_LEVEYS];
                        if (tile3 > 79 || (tile3 < 60 && tile3 > 49) || tile3 === BLOCK_ESTO_ALAS)
                            edge = true;
                    }
                    
                    if (tile2 === 1) {
                        tile3 = this.seinat[x - 1 + y * PK2KARTTA_KARTTA_LEVEYS];
                        if (tile3 > 79 || (tile3 < 60 && tile3 > 49) || tile3 === BLOCK_ESTO_ALAS)
                            edge = true;
                    }
                    
                    if (edge) {
                        this.reunat[x + y * PK2KARTTA_KARTTA_LEVEYS] = true;
                        //this.taustat[x+y*PK2KARTTA_KARTTA_LEVEYS] = 49; //Debug
                    }
                }
            }
    }
    
    public Select_Start(): void {
        let pos_x: number = 320,
            pos_y: number = 196;
        let alkujen_maara: int = 0, alku: int = 0,
            x: int, y: int;
        
        for (x = 0; x < PK2KARTTA_KARTTA_KOKO; x++)
            if (this.seinat[x] === BLOCK_ALOITUS)
                alkujen_maara++;
        
        if (alkujen_maara > 0) {
            alku = rand() % alkujen_maara + 1;
            alkujen_maara = 1;
            
            for (x = 0; x < PK2KARTTA_KARTTA_LEVEYS; x++)
                for (y = 0; y < PK2KARTTA_KARTTA_KORKEUS; y++)
                    if (this.seinat[x + y * PK2KARTTA_KARTTA_LEVEYS] === BLOCK_ALOITUS) {
                        if (alkujen_maara === alku) {
                            pos_x = x * 32;
                            pos_y = y * 32;
                        }
                        
                        alkujen_maara++;
                    }
        }
        
        // 	Game::Sprites->player->x = pos_x + Game::Sprites->player->tyyppi->leveys/2;
        // 	Game::Sprites->player->y = pos_y - Game::Sprites->player->tyyppi->korkeus/2;
        //
        // 	Game::camera_x = (int)Game::Sprites->player->x;
        // 	Game::camera_y = (int)Game::Sprites->player->y;
        // 	Game::dcamera_x = Game::camera_x;
        // 	Game::dcamera_y = Game::camera_y;
    }
    
    public Place_Sprites(): void {
    }
    
    ///
    
    // Lataa kartta versio 0.1
    private LataaVersio01(/*char *filename*/): int {
    }
    
    // Lataa kartta versio 1.0
    private LataaVersio10(/*char *filename*/): int {
    }
    
    // Lataa kartta versio 1.1
    private LataaVersio11(/*char *filename*/): int {
    }
    
    // Lataa kartta versio 1.2
    private LataaVersio12(/*char *filename*/): int {
    }
    
    // Lataa kartta versio 1.3
    private LataaVersio13(/*char *filename*/): int {
    }
    
    ///
    
    private Lataa_Taustakuva(/*char *polku, char *filename*/): int {
    }
    
    private Lataa_PalikkaPaletti(/*char *polku, char *filename*/): int {
    }
    
    private Lataa_TaustaMusiikki(/*char *filename*/): int {
    }
    
    /// Kartanpiirtorutiineja ----------------------------------------------------------------*/
    
    //Anim Fire
    private Animoi_Tuli(): void {
        // 	BYTE *buffer = NULL;
        let leveys: uint;
        let x: int, y: int;
        let color: int;
        
        // 	PisteDraw2_DrawImage_Start(palikat_buffer,*&buffer,(DWORD &)leveys);
        
        for (x = 128; x < 160; x++)
            for (y = 448; y < 479; y++) {
                color = buffer[x + (y + 1) * leveys];
                
                if (color !== 255) {
                    color %= 32;
                    color = color - rand() % 4;
                    
                    if (color < 0)
                        color = 255;
                    else {
                        if (color > 21)
                            color += 128;
                        else
                            color += 64;
                    }
                }
                
                buffer[x + y * leveys] = color;
            }
        
        if (this.ajastin1 < 20) {
            for (x = 128; x < 160; x++)
                buffer[x + 479 * leveys] = rand() % 15 + 144;
        } else
            for (x = 128; x < 160; x++)
                buffer[x + 479 * leveys] = 255;
        
        // PisteDraw2_DrawImage_End(this.palikat_buffer);
    }
    
    // //Anim
    private Animoi_Vesiputous(): void {
        // 	BYTE *buffer = NULL;
        // 	DWORD leveys;
        // 	int x,y,plus;
        // 	int color,color2;
        //
        // 	BYTE temp[32*32];
        //
        // 	PisteDraw2_DrawImage_Start(palikat_buffer,*&buffer,(DWORD &)leveys);
        //
        // 	for (x=32;x<64;x++)
        // 		for (y=416;y<448;y++)
        // 			temp[x-32+(y-416)*32] = buffer[x+y*leveys];
        //
        // 	color2 = (temp[0]/32)*32;	// mahdollistaa erivriset vesiputoukset
        //
        // 	for (x=32;x<64;x++)
        // 	{
        // 		plus = rand()%2+2;//...+1
        // 		for (y=416;y<448;y++)
        // 		{
        // 			color = temp[x-32+(y-416)*32];
        //
        // 			if (color != 255)	// mahdollistaa eri leveyksiset vesiputoukset
        // 			{
        // 				color %= 32;
        // 				if (color > 10)//20
        // 					color--;
        // 				if (rand()%40 == 1)
        // 					color = 11+rand()%11;//15+rand()%8;//9+rand()%5;
        // 				if (rand()%160 == 1)
        // 					color = 30;
        // 				buffer[x + (416+(y+plus)%32)*leveys] = color+color2;
        // 			}
        // 			else
        // 				buffer[x + (416+(y+plus)%32)*leveys] = color;
        // 		}
        // 	}
        //
        // 	PisteDraw2_DrawImage_End(palikat_buffer);
    }
    
    private Animoi_Virta_Ylos(): void {
        // 	BYTE *buffer = NULL;
        // 	DWORD leveys;
        // 	int x,y;
        //
        // 	BYTE temp[32];
        //
        // 	PisteDraw2_DrawImage_Start(palikat_buffer,*&buffer,(DWORD &)leveys);
        //
        // 	for (x=64;x<96;x++)
        // 		temp[x-64] = buffer[x+448*leveys];
        //
        // 	for (x=64;x<96;x++)
        // 	{
        // 		for (y=448;y<479;y++)
        // 		{
        // 			buffer[x+y*leveys] = buffer[x+(y+1)*leveys];
        // 		}
        // 	}
        //
        // 	for (x=64;x<96;x++)
        // 		buffer[x+479*leveys] = temp[x-64];
        //
        // 	PisteDraw2_DrawImage_End(palikat_buffer);
    }
    
    private Animoi_Vedenpinta(): void {
        // 	BYTE *buffer = NULL;
        // 	DWORD leveys;
        // 	int x,y;
        //
        // 	BYTE temp[32];
        //
        // 	PisteDraw2_DrawImage_Start(palikat_buffer,*&buffer,(DWORD &)leveys);
        //
        // 	for (y=416;y<448;y++)
        // 		temp[y-416] = buffer[y*leveys];
        //
        // 	for (y=416;y<448;y++)
        // 	{
        // 		for (x=0;x<31;x++)
        // 		{
        // 			buffer[x+y*leveys] = buffer[x+1+y*leveys];
        // 		}
        // 	}
        //
        // 	for (y=416;y<448;y++)
        // 		buffer[31+y*leveys] = temp[y-416];
        //
        // 	PisteDraw2_DrawImage_End(palikat_buffer);
    }
    
    //Anim water
    private Animoi_Vesi(): void {
        // void PK2Kartta::Animoi_Vesi(void){
        // 	BYTE *buffer_lahde = NULL, *buffer_kohde = NULL;
        // 	DWORD leveys_lahde, leveys_kohde;
        // 	int x, y, color1, color2,
        // 		d1 = vesiaste / 2, d2;
        // 	int sini, cosi;
        // 	int vx,vy;
        // 	int i;
        //
        //
        // 	PisteDraw2_DrawImage_Start(palikat_buffer,		*&buffer_kohde,(DWORD &)leveys_kohde);
        // 	PisteDraw2_DrawImage_Start(palikat_vesi_buffer,*&buffer_lahde,(DWORD &)leveys_lahde);
        //
        // 	for (y=0;y<32;y++){
        // 		d2 = d1;
        //
        // 		for (x=0;x<32;x++){
        // 			sini = int((y+d2/2)*11.25)%360;
        // 			cosi = int((x+d1/2)*11.25)%360;
        // 			sini = (int)kartta_sin_table[sini];
        // 			cosi = (int)kartta_cos_table[cosi];
        //
        // 			vy = (y+sini/11)%32;
        // 			vx = (x+cosi/11)%32;
        //
        // 			if (vy < 0){
        // 				vy = -vy;
        // 				vy = 31-(vy%32);
        // 			}
        //
        // 			if (vx < 0){
        // 				vx= -vx;
        // 				vx = 31-(vx%32);
        // 			}
        //
        // 			color1 = buffer_lahde[64+vx+vy*leveys_lahde];
        // 			buffer_lahde[32+x+y*leveys_lahde] = color1;
        // 			d2 = 1 + d2 % 360;
        // 		}
        //
        // 		d1 = 1 + d1 % 360;
        // 	}
        //
        // 	int vy2;
        //
        // 	for (int p=2;p<5;p++){
        // 		i = p*32;
        //
        // 		for (y=0;y<32;y++){
        // 			//d2 = d1;
        // 			vy = y*leveys_lahde;
        // 			vy2 = (y+416)*leveys_kohde;
        //
        // 			for (x=0;x<32;x++){
        // 				vx = x+vy;
        // 				color1 = buffer_lahde[32+vx];
        // 				color2 = buffer_lahde[ i+vx];
        // 				buffer_kohde[i+x+vy2] = (color1 + color2*2) / 3;
        // 			}
        // 		}
        // 	}
        // 	PisteDraw2_DrawImage_End(palikat_buffer);
        // 	PisteDraw2_DrawImage_End(palikat_vesi_buffer);
    }
}

// PK2Kartta::PK2Kartta(){
//

//
// 	strcpy(this->versio, PK2KARTTA_VIIMEISIN_VERSIO);
// 	strcpy(this->palikka_bmp,"blox.bmp");
// 	strcpy(this->taustakuva, "default.bmp");
// 	strcpy(this->musiikki,   "default.xm");
//
// 	strcpy(this->nimi,  "untitled");
// 	strcpy(this->tekija,"unknown");
//
// 	this->jakso		= 0;
// 	this->ilma		= ILMA_NORMAALI;
// 	this->kytkin1_aika = KYTKIN_ALOITUSARVO;
// 	this->kytkin2_aika = KYTKIN_ALOITUSARVO;
// 	this->kytkin3_aika = KYTKIN_ALOITUSARVO;
// 	this->pelaaja_sprite = 0;
// 	this->aika		= 0;
// 	this->extra		= PK2KARTTA_EXTRA_EI;
// 	this->tausta	= TAUSTA_STAATTINEN;
//
// 	this->x = 0;
// 	this->y = 0;
// 	this->ikoni = 0;
//
// 	memset(this->taustat, 255, sizeof(taustat));
// 	memset(this->seinat , 255, sizeof(seinat));
// 	memset(this->spritet, 255, sizeof(spritet));
// 	memset(this->reunat,  0,   sizeof(reunat));
//
// 	for (int i=0;i<PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA;i++)
// 		strcpy(this->protot[i],"");
//
// 	this->taustakuva_buffer = PisteDraw2_Image_New(640,480);
// 	this->palikat_buffer = PisteDraw2_Image_New(PK2KARTTA_BLOCK_PALETTI_LEVEYS,PK2KARTTA_BLOCK_PALETTI_KORKEUS);
// 	this->palikat_vesi_buffer = PisteDraw2_Image_New(PK2KARTTA_BLOCK_PALETTI_LEVEYS,32); //water
//
// 	PisteDraw2_ImageFill(this->taustakuva_buffer,255);
// 	PisteDraw2_ImageFill(this->palikat_buffer,255);
// 	PisteDraw2_ImageFill(this->palikat_buffer,255);
// }
//
// PK2Kartta::PK2Kartta(const PK2Kartta &kartta){
//

//
// 	strcpy(this->versio,		kartta.versio);
// 	strcpy(this->palikka_bmp,	kartta.palikka_bmp);
// 	strcpy(this->taustakuva,	kartta.taustakuva);
// 	strcpy(this->musiikki,		kartta.musiikki);
//
// 	strcpy(this->nimi,			kartta.nimi);
// 	strcpy(this->tekija,		kartta.tekija);
//
// 	this->jakso			= kartta.jakso;
// 	this->ilma			= kartta.ilma;
// 	this->kytkin1_aika	= kartta.kytkin1_aika;
// 	this->kytkin2_aika	= kartta.kytkin2_aika;
// 	this->kytkin3_aika	= kartta.kytkin3_aika;
// 	this->pelaaja_sprite = kartta.pelaaja_sprite;
// 	this->aika			= kartta.aika;
// 	this->extra			= kartta.extra;
// 	this->tausta		= kartta.tausta;
//
// 	this->x				= kartta.x;
// 	this->y				= kartta.y;
// 	this->ikoni			= kartta.ikoni;
//
// 	int i;
//
// 	for (i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		this->taustat[i] = kartta.taustat[i];
//
// 	for (i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		this->seinat[i] = kartta.seinat[i];
//
// 	for (i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		this->spritet[i] = kartta.spritet[i];
//
// 	for (i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		this->reunat[i] = kartta.reunat[i];
//
// 	for (i=0;i<PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA;i++)
// 		strcpy(this->protot[i],kartta.protot[i]);
//
//
// 	PisteDraw2_Image_Copy(kartta.taustakuva_buffer,this->taustakuva_buffer);
// 	PisteDraw2_Image_Copy(kartta.palikat_buffer,this->palikat_buffer);
// 	PisteDraw2_Image_Copy(kartta.palikat_vesi_buffer,this->palikat_vesi_buffer);
// }
//
// PK2Kartta::~PK2Kartta(){
// 	PisteDraw2_Image_Delete(this->palikat_buffer);
// 	PisteDraw2_Image_Delete(this->taustakuva_buffer);
// 	PisteDraw2_Image_Delete(this->palikat_vesi_buffer);
// }
//
// RECT PK2Kartta::LaskeTallennusAlue(BYTE *lahde, BYTE *&kohde){
// 	int x,y;
// 	int kartan_vasen = PK2KARTTA_KARTTA_LEVEYS,//PK2KARTTA_KARTTA_LEVEYS/2,
// 		kartan_oikea = 0,
// 		kartan_yla	 = PK2KARTTA_KARTTA_KORKEUS,//PK2KARTTA_KARTTA_KORKEUS/2,
// 		kartan_ala	 = 0,
// 		kartan_korkeus = 0,
// 		kartan_leveys = 0;
//
// 	RECT rajat = {0,0,0,0};
//
// 	// tutkitaan kartan reunimmaiset tilet ja asetetaan reunat niiden mukaan
// 	for (y=0;y<PK2KARTTA_KARTTA_KORKEUS;y++) {
// 		for (x=0;x<PK2KARTTA_KARTTA_LEVEYS;x++)	{
// 			if (lahde[x+y*PK2KARTTA_KARTTA_LEVEYS] != 255) {
// 				if (x < kartan_vasen)
// 					kartan_vasen = x;
// 				if (y < kartan_yla)
// 					kartan_yla = y;
// 				if (x > kartan_oikea)
// 					kartan_oikea = x;
// 				if (y > kartan_ala)
// 					kartan_ala = y;
// 			}
// 		}
// 	}
//
// 	kartan_leveys = kartan_oikea - kartan_vasen;
// 	kartan_korkeus = kartan_ala - kartan_yla;
//
// 	// onko kartta tyhja?
// 	if (kartan_leveys < 0 || kartan_korkeus < 0) {
// 		kartan_vasen = kartan_yla = 0;
// 		kartan_ala = kartan_oikea = 1;
// 		kartan_leveys = kartan_oikea - kartan_vasen;
// 		kartan_korkeus = kartan_ala - kartan_yla;
// 	}
//
// 	kohde = new BYTE[kartan_leveys*kartan_korkeus];
// 	BYTE tile;
//
// 	for (y=0;y<kartan_korkeus;y++){
// 		for (x=0;x<kartan_leveys;x++){
// 			tile = lahde[(x+kartan_vasen)+(y+kartan_yla)*PK2KARTTA_KARTTA_LEVEYS];
// 			kohde[x+y*kartan_leveys] = tile;
// 			if (x==0 || y==0 || x==kartan_leveys-1 || y==kartan_korkeus-1)
// 				lahde[(x+kartan_vasen)+(y+kartan_yla)*PK2KARTTA_KARTTA_LEVEYS] = 104;
// 		}
// 	}
//
// 	rajat.left = kartan_vasen;
// 	rajat.top  = kartan_yla;
// 	rajat.right = kartan_oikea;
// 	rajat.bottom= kartan_ala;
//
// 	return rajat;
// }
//
// RECT PK2Kartta::LaskeTallennusAlue(BYTE *alue){
// 	DWORD x,y;
// 	DWORD kartan_vasen		= PK2KARTTA_KARTTA_LEVEYS,
// 		  kartan_oikea		= 0,
// 		  kartan_yla		= PK2KARTTA_KARTTA_KORKEUS,
// 		  kartan_ala		= 0;
//
// 	RECT rajat = {0,0,0,0};
//
// 	// tutkitaan kartan reunimmaiset tilet ja asetetaan reunat niiden mukaan
// 	for (y=0;y<PK2KARTTA_KARTTA_KORKEUS;y++) {
// 		for (x=0;x<PK2KARTTA_KARTTA_LEVEYS;x++)	{
// 			if (alue[x+y*PK2KARTTA_KARTTA_LEVEYS] != 255) {
//
// 				if (x < kartan_vasen) {
// 					kartan_vasen = x;
// 					//alue[x+y*PK2KARTTA_KARTTA_LEVEYS] = 101;
// 				}
// 				if (y < kartan_yla) {
// 					kartan_yla = y;
// 					//alue[x+y*PK2KARTTA_KARTTA_LEVEYS] = 102;
// 				}
// 				if (x > kartan_oikea) {
// 					kartan_oikea = x;
// 					//alue[x+y*PK2KARTTA_KARTTA_LEVEYS] = 103;
// 				}
// 				if (y > kartan_ala) {
// 					kartan_ala = y;
// 					//alue[x+y*PK2KARTTA_KARTTA_LEVEYS] = 104;
// 				}
// 			}
// 		}
// 	}
//
// 	// onko kartta tyhja?
// 	if (kartan_oikea < kartan_vasen || kartan_ala < kartan_yla) {
// 		kartan_vasen = 0;
// 		kartan_yla	 = 0;
// 		kartan_ala   = 1;
// 		kartan_oikea = 1;
// 	}
//
// 	rajat.left = kartan_vasen;
// 	rajat.top  = kartan_yla;
// 	rajat.right = kartan_oikea;
// 	rajat.bottom= kartan_ala;
// 	return rajat;
// }
//
// void PK2Kartta::LueTallennusAlue(BYTE *lahde, RECT alue, int kohde){
// 	int x,y;
// 	int kartan_vasen   = alue.left,
// 		kartan_oikea   = alue.right,
// 		kartan_yla     = alue.top,
// 		kartan_ala     = alue.bottom,
// 		kartan_korkeus = kartan_oikea - kartan_vasen,
// 		kartan_leveys  = kartan_ala - kartan_yla;
//
// 	BYTE tile;
// 	if (lahde != NULL && kohde != 0)	{
// 		for (y=0;y<kartan_korkeus;y++) {
// 			for (x=0;x<kartan_leveys;x++) {
// 				tile = lahde[x+y*kartan_leveys];
// 				if (kohde == 1)
// 					taustat[(x+kartan_vasen)+(y+kartan_yla)*PK2KARTTA_KARTTA_LEVEYS] = tile;
// 				if (kohde == 2)
// 					seinat[(x+kartan_vasen)+(y+kartan_yla)*PK2KARTTA_KARTTA_LEVEYS] = tile;
// 				if (kohde == 3)
// 					spritet[(x+kartan_vasen)+(y+kartan_yla)*PK2KARTTA_KARTTA_LEVEYS] = tile;
// 			}
// 		}
// 	}
// }
//
// int PK2Kartta::Tallenna(char *filename){
// 	char luku[8];
// 	DWORD i;
//
// 	ofstream *tiedosto = new ofstream(filename, ios::binary);
//
// 	strcpy(this->versio, PK2KARTTA_VIIMEISIN_VERSIO);
//
// 	//tiedosto->write ((char *)this, sizeof (*this));
//
// 	tiedosto->write(this->versio,		sizeof(versio));
// 	tiedosto->write(this->palikka_bmp,	sizeof(palikka_bmp));
// 	tiedosto->write(this->taustakuva,	sizeof(taustakuva));
// 	tiedosto->write(this->musiikki,		sizeof(musiikki));
// 	tiedosto->write(this->nimi,			sizeof(nimi));
// 	tiedosto->write(this->tekija,		sizeof(tekija));
//
// 	//itoa(this->jakso,luku,10);
// 	sprintf(luku, "%i", this->jakso);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	//itoa(this->ilma,luku,10);
// 	sprintf(luku, "%i", this->ilma);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	//itoa(this->kytkin1_aika,luku,10);
// 	sprintf(luku, "%" PRIu32, this->kytkin1_aika);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	//itoa(this->kytkin2_aika,luku,10);
// 	sprintf(luku, "%" PRIu32, this->kytkin2_aika);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	//itoa(this->kytkin3_aika,luku,10);
// 	sprintf(luku, "%" PRIu32, this->kytkin3_aika);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	//itoa(this->aika,luku,10);
// 	sprintf(luku, "%i", this->aika);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	//itoa(this->extra,luku,10);
// 	sprintf(luku, "%i", this->extra);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	//itoa(this->tausta,luku,10);
// 	sprintf(luku, "%i", this->tausta);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	//itoa(this->pelaaja_sprite,luku,10);
// 	sprintf(luku, "%i", this->pelaaja_sprite);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	//itoa(this->x,luku,10);
// 	sprintf(luku, "%i", this->x);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	//itoa(this->y,luku,10);
// 	sprintf(luku, "%i", this->y);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	//itoa(this->ikoni,luku,10);
// 	sprintf(luku, "%i", this->ikoni);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	int protoja = 0;
//
// 	for (i=0;i<PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA;i++)
// 		if (strlen(this->protot[i]) > 0)
// 			protoja++;
//
// 	//itoa(protoja,luku,10);
// 	sprintf(luku, "%i", protoja);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	for (i=0;i<PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA;i++)
// 		if (strlen(this->protot[i]) > 0)
// 			tiedosto->write(protot[i],sizeof(protot[i]));
//
// 	// laske alue
//
// 	//BYTE *alue_taustat = NULL, *alue_seinat = NULL, *alue_spritet = NULL;
// 	RECT alue = {0,0,0,0};
// 	DWORD /*koko, aloituskohta,*/ leveys, korkeus, x, y;
// 	DWORD aloitus_x,aloitus_y;
// 	char tile[1];
//
// 	// taustat
// 	alue = LaskeTallennusAlue(this->taustat);
// 	leveys = alue.right - alue.left;
// 	korkeus = alue.bottom - alue.top;
// 	aloitus_x = alue.left;
// 	aloitus_y = alue.top;
//
// 	sprintf(luku, "%" PRIu32, aloitus_x);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	sprintf(luku, "%" PRIu32, aloitus_y);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	sprintf(luku, "%" PRIu32, leveys);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	sprintf(luku, "%" PRIu32, korkeus);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	for (y=aloitus_y;y<=aloitus_y+korkeus;y++) {	// Kirjoitetaan alue tiedostoon tile by tile
// 		for (x=aloitus_x;x<=aloitus_x+leveys;x++) {
// 			tile[0] = this->taustat[x+y*PK2KARTTA_KARTTA_LEVEYS];
// 			tiedosto->write(tile, sizeof(tile));
// 		}
// 	}
//
// 	// seinat
// 	alue = LaskeTallennusAlue(this->seinat);
// 	leveys = alue.right - alue.left;
// 	korkeus = alue.bottom - alue.top;
// 	aloitus_x = alue.left;
// 	aloitus_y = alue.top;
// 	//ltoa(aloitus_x,luku,10);
// 	sprintf(luku, "%" PRIu32, aloitus_x);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	sprintf(luku, "%" PRIu32, aloitus_y);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	sprintf(luku, "%" PRIu32, leveys);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
//
// 	sprintf(luku, "%" PRIu32, korkeus);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku)); //TODO - MAKE A FUNCTION TO DO THIS
// 	for (y=aloitus_y;y<=aloitus_y+korkeus;y++) {	// Kirjoitetaan alue tiedostoon tile by tile
// 		for (x=aloitus_x;x<=aloitus_x+leveys;x++) {
// 			tile[0] = this->seinat[x+y*PK2KARTTA_KARTTA_LEVEYS];
// 			tiedosto->write(tile, sizeof(tile));
// 		}
// 	}
//
// 	// spritet
// 	alue = LaskeTallennusAlue(this->spritet);
// 	leveys = alue.right - alue.left;
// 	korkeus = alue.bottom - alue.top;
// 	aloitus_x = alue.left;
// 	aloitus_y = alue.top;
// 	//ltoa(aloitus_x,luku,10);
// 	sprintf(luku, "%" PRIu32, aloitus_x);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
// 	//ltoa(aloitus_y,luku,10);
// 	sprintf(luku, "%" PRIu32, aloitus_y);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
// 	//ltoa(leveys,luku,10);
// 	sprintf(luku, "%" PRIu32, leveys);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
// 	//ltoa(korkeus,luku,10);
// 	sprintf(luku, "%" PRIu32, korkeus);
// 	tiedosto->write(luku, sizeof(luku));
// 	memset(luku, 0, sizeof(luku));
// 	for (y=aloitus_y;y<=aloitus_y+korkeus;y++) {	// Kirjoitetaan alue tiedostoon tile by tile
// 		for (x=aloitus_x;x<=aloitus_x+leveys;x++) {
// 			tile[0] = this->spritet[x+y*PK2KARTTA_KARTTA_LEVEYS];
// 			tiedosto->write(tile, sizeof(tile));
// 		}
// 	}
//
// 	if (tiedosto->fail()){
// 		delete (tiedosto);
// 		return 1;
// 	}
//
// 	delete (tiedosto);
//
// 	return 0;
// }
//
// int PK2Kartta::Lataa(char *polku, char *nimi){
// 	char file[PE_PATH_SIZE];
// 	strcpy(file,polku);
// 	strcat(file,nimi);
//
// 	ifstream *tiedosto = new ifstream(file, ios::binary);
// 	char versio[8] = "\0";
//
// 	if (tiedosto->fail()){
// 		delete (tiedosto);
// 		return 1;
// 	}
//
// 	tiedosto->read ((char *)versio, sizeof (versio));
//
// 	if (tiedosto->fail()){
// 		delete (tiedosto);
// 		return 1;
// 	}
//
// 	delete (tiedosto);
//
// 	int ok = 2;
//
// 	if (strcmp(versio,"1.3")==0){
// 		this->LataaVersio13(file);
// 		ok = 0;
// 	}
// 	if (strcmp(versio,"1.2")==0){
// 		this->LataaVersio12(file);
// 		ok = 0;
// 	}
// 	if (strcmp(versio,"1.1")==0){
// 		this->LataaVersio11(file);
// 		ok = 0;
// 	}
// 	if (strcmp(versio,"1.0")==0){
// 		this->LataaVersio10(file);
// 		ok = 0;
// 	}
// 	if (strcmp(versio,"0.1")==0){
// 		this->LataaVersio01(file);
// 		ok = 0;
// 	}
//
// 	Lataa_PalikkaPaletti(polku, this->palikka_bmp);
// 	Lataa_Taustakuva(polku,this->taustakuva);
//
// 	return(ok);
// }
//
// int PK2Kartta::Lataa_Pelkat_Tiedot(char *polku, char *nimi){
// 	char file[PE_PATH_SIZE];
// 	strcpy(file,polku);
// 	strcat(file,nimi);
//
// 	ifstream *tiedosto = new ifstream(file, ios::binary);
// 	char versio[8] = "\0";
//
// 	if (tiedosto->fail())
// 	{
// 		delete (tiedosto);
// 		return 1;
// 	}
//
// 	tiedosto->read ((char *)versio, sizeof (versio));
//
// 	if (tiedosto->fail())
// 	{
// 		delete (tiedosto);
// 		return 1;
// 	}
//
// 	delete (tiedosto);
//
// 	if (strcmp(versio,"1.3")==0)
// 		this->LataaVersio13(file);
//
// 	if (strcmp(versio,"1.2")==0)
// 		this->LataaVersio12(file);
//
// 	if (strcmp(versio,"1.1")==0)
// 		this->LataaVersio11(file);
//
// 	if (strcmp(versio,"1.0")==0)
// 		this->LataaVersio10(file);
//
// 	if (strcmp(versio,"0.1")==0)
// 		this->LataaVersio01(file);
//
// 	return(0);
// }
//
// int PK2Kartta::LataaVersio01(char *filename){
//
// 	FILE *tiedosto;
//
// 	PK2KARTTA kartta;
//
// 	if ((tiedosto = fopen(filename, "r")) == NULL){
// 		return(1);
// 	}
//
// 	fread(&kartta, sizeof(PK2KARTTA), 1, tiedosto);
//
// 	fclose(tiedosto);
//
// 	strcpy(this->versio, PK2KARTTA_VIIMEISIN_VERSIO);
// 	strcpy(this->palikka_bmp,"blox.bmp");
// 	strcpy(this->taustakuva, "default.bmp");
// 	strcpy(this->musiikki,   "default.xm");
//
// 	strcpy(this->nimi,  "v01");
// 	strcpy(this->tekija,"unknown");
//
// 	this->aika		= 0;
// 	this->extra		= 0;
// 	this->tausta	= kartta.taustakuva;
//
// 	for (int i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		this->seinat[i] = kartta.kartta[i%PK2KARTTA_KARTTA_LEVEYS + (i/PK2KARTTA_KARTTA_LEVEYS) * 640];
//
// 	memset(this->taustat,255, sizeof(taustat));
//
// 	memset(this->spritet,255, sizeof(spritet));
//
// 	return(0);
// }
// int PK2Kartta::LataaVersio10(char *filename){
// 	FILE *tiedosto;
//
// 	PK2Kartta *kartta = new PK2Kartta();
//
// 	if ((tiedosto = fopen(filename, "r")) == NULL)
// 	{
// 		return(1);
// 	}
//
// 	fread(kartta, sizeof(PK2Kartta), 1, tiedosto);
//
// 	fclose(tiedosto);
//
// 	strcpy(this->versio,		kartta->versio);
// 	strcpy(this->palikka_bmp,	kartta->palikka_bmp);
// 	strcpy(this->taustakuva,	kartta->taustakuva);
// 	strcpy(this->musiikki,		kartta->musiikki);
//
// 	strcpy(this->nimi,			kartta->nimi);
// 	strcpy(this->tekija,		kartta->tekija);
//
// 	this->aika			= kartta->aika;
// 	this->extra			= kartta->extra;
// 	this->tausta		= kartta->tausta;
//
// 	for (int i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		this->taustat[i] = kartta->taustat[i];
//
// 	for (int i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		this->seinat[i] = kartta->seinat[i];
//
// 	for (int i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		this->spritet[i] = kartta->spritet[i];
//
//
// 	//Lataa_PalikkaPaletti(kartta->palikka_bmp);
// 	//Lataa_Taustakuva(kartta->taustakuva);
//
// 	//delete kartta;
//
// 	return(0);
// }
// int PK2Kartta::LataaVersio11(char *filename){
// 	FILE *tiedosto;
// 	int virhe = 0;
//
//
// 	if ((tiedosto = fopen(filename, "r")) == NULL)
// 	{
// 		return(1);
// 	}
//
// 	memset(this->taustat, 255, sizeof(this->taustat));
// 	memset(this->seinat , 255, sizeof(this->seinat));
// 	memset(this->spritet, 255, sizeof(this->spritet));
//
// 	fread(this->versio,		sizeof(char),	5, tiedosto);
// 	fread(this->palikka_bmp,sizeof(char),	13, tiedosto);
// 	fread(this->taustakuva,	sizeof(char),	13, tiedosto);
// 	fread(this->musiikki,	sizeof(char),	13, tiedosto);
// 	fread(this->nimi,		sizeof(char),	40, tiedosto);
// 	fread(this->tekija,		sizeof(char),	40, tiedosto);
// 	fread(&this->aika,		sizeof(int),	1, tiedosto);
// 	fread(&this->extra,		sizeof(BYTE),	1, tiedosto);
// 	fread(&this->tausta,	sizeof(BYTE),	1, tiedosto);
// 	fread(this->taustat,	sizeof(taustat),1, tiedosto);
// 	if (fread(this->seinat,	sizeof(seinat),	1, tiedosto) != PK2KARTTA_KARTTA_KOKO)
// 		virhe = 2;
// 	fread(this->spritet,	sizeof(spritet),1, tiedosto);
//
// 	fclose(tiedosto);
//
// 	int i;
//
// 	for (i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		if (seinat[i] != 255)
// 			seinat[i] -= 50;
//
// 	for (i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		if (taustat[i] != 255)
// 			taustat[i] -= 50;
//
// 	for (i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		if (spritet[i] != 255)
// 			spritet[i] -= 50;
//
// 	//Lataa_PalikkaPaletti(this->palikka_bmp);
// 	//Lataa_Taustakuva(this->taustakuva);
//
// 	return (virhe);
// }
// int PK2Kartta::LataaVersio12(char *filename){
//
// 	ifstream *tiedosto = new ifstream(filename, ios::binary);
// 	char luku[8];
//
// 	if (tiedosto->fail())
// 	{
// 		delete (tiedosto);
// 		return 1;
// 	}
//
// 	memset(this->taustat, 255, sizeof(this->taustat));
// 	memset(this->seinat , 255, sizeof(this->seinat));
// 	memset(this->spritet, 255, sizeof(this->spritet));
//
// 	for (int i=0;i<PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA;i++)
// 		strcpy(this->protot[i],"");
//
// 	//tiedosto->read ((char *)this, sizeof (*this));
// 	tiedosto->read(this->versio,		sizeof(versio));
// 	tiedosto->read(this->palikka_bmp,	sizeof(palikka_bmp));
// 	tiedosto->read(this->taustakuva,	sizeof(taustakuva));
// 	tiedosto->read(this->musiikki,		sizeof(musiikki));
// 	tiedosto->read(this->nimi,			sizeof(nimi));
// 	tiedosto->read(this->tekija,		sizeof(tekija));
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->jakso = atoi(luku);
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->ilma = atoi(luku);
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->kytkin1_aika = atoi(luku);
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->kytkin2_aika = atoi(luku);
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->kytkin3_aika = atoi(luku);
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->aika = atoi(luku);
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->extra = atoi(luku);
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->tausta = atoi(luku);
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->pelaaja_sprite = atoi(luku);
//
// 	tiedosto->read((char*)this->taustat,		sizeof(taustat));
// 	tiedosto->read((char*)this->seinat,		sizeof(seinat));
// 	tiedosto->read((char*)this->spritet,		sizeof(spritet));
//
// 	for (int i=0;i<PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA;i++)
// 		tiedosto->read(this->protot[i],sizeof(protot[i]));
//
// 	if (tiedosto->fail())
// 	{
// 		delete (tiedosto);
// 		return 1;
// 	}
//
// 	delete (tiedosto);
//
// 	//Lataa_PalikkaPaletti(this->palikka_bmp);
// 	//Lataa_Taustakuva(this->taustakuva);
//
// 	return 0;
// }
// int PK2Kartta::LataaVersio13(char *filename){
//
// 	ifstream *tiedosto = new ifstream(filename, ios::binary);
// 	char luku[8];
// 	DWORD i;
//
// 	if (tiedosto->fail())
// 	{
// 		delete (tiedosto);
// 		return 1;
// 	}
//
// 	memset(this->taustat, 255, sizeof(this->taustat));
// 	memset(this->seinat , 255, sizeof(this->seinat));
// 	memset(this->spritet, 255, sizeof(this->spritet));
//
// 	for (i=0;i<PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA;i++)
// 		strcpy(this->protot[i],"");
//
// 	//tiedosto->read ((char *)this, sizeof (*this));
// 	tiedosto->read(this->versio,		sizeof(versio));
// 	tiedosto->read(this->palikka_bmp,	sizeof(palikka_bmp));
// 	tiedosto->read(this->taustakuva,	sizeof(taustakuva));
// 	tiedosto->read(this->musiikki,		sizeof(musiikki));
// 	tiedosto->read(this->nimi,			sizeof(nimi));
// 	tiedosto->read(this->tekija,		sizeof(tekija));
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->jakso = atoi(luku);
// 	memset(luku, 0, sizeof(luku));
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->ilma = atoi(luku);
// 	memset(luku, 0, sizeof(luku));
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->kytkin1_aika = atoi(luku);
// 	memset(luku, 0, sizeof(luku));
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->kytkin2_aika = atoi(luku);
// 	memset(luku, 0, sizeof(luku));
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->kytkin3_aika = atoi(luku);
// 	memset(luku, 0, sizeof(luku));
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->aika = atoi(luku);
// 	memset(luku, 0, sizeof(luku));
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->extra = atoi(luku);
// 	memset(luku, 0, sizeof(luku));
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->tausta = atoi(luku);
// 	memset(luku, 0, sizeof(luku));
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->pelaaja_sprite = atoi(luku);
// 	memset(luku, 0, sizeof(luku));
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->x = atoi(luku);
// 	memset(luku, 0, sizeof(luku));
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->y = atoi(luku);
// 	memset(luku, 0, sizeof(luku));
//
// 	tiedosto->read(luku, sizeof(luku));
// 	this->ikoni = atoi(luku);
// 	memset(luku, 0, sizeof(luku));
//
// 	DWORD lkm;
// 	tiedosto->read(luku, sizeof(luku));
// 	lkm = (int)atoi(luku);
//
// 	//for (i=0;i<PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA;i++)
// 	//	itoa(lkm,protot[i],10);//strcpy(protot[i],"");
//
// 	for (i=0;i<lkm/*PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA*/;i++)
// 		tiedosto->read(protot[i],sizeof(protot[i]));
//
// 	DWORD leveys, korkeus,
// 		  aloitus_x,aloitus_y,
// 		  x,y;
// 	char tile[1];
//
// 	// taustat
// 	tiedosto->read(luku, sizeof(luku)); aloitus_x = atol(luku); memset(luku, 0, sizeof(luku));
// 	tiedosto->read(luku, sizeof(luku)); aloitus_y = atol(luku); memset(luku, 0, sizeof(luku));
// 	tiedosto->read(luku, sizeof(luku)); leveys    = atol(luku); memset(luku, 0, sizeof(luku));
// 	tiedosto->read(luku, sizeof(luku)); korkeus   = atol(luku); memset(luku, 0, sizeof(luku));
// 	for (y=aloitus_y;y<=aloitus_y+korkeus;y++) {	// Luetaan alue tile by tile
// 		for (x=aloitus_x;x<=aloitus_x+leveys;x++) {
// 			tiedosto->read(tile, sizeof(tile));
// 			this->taustat[x+y*PK2KARTTA_KARTTA_LEVEYS] = tile[0];
// 		}
// 	}
//
// 	// seinat
// 	tiedosto->read(luku, sizeof(luku)); aloitus_x = atol(luku); memset(luku, 0, sizeof(luku));
// 	tiedosto->read(luku, sizeof(luku)); aloitus_y = atol(luku); memset(luku, 0, sizeof(luku));
// 	tiedosto->read(luku, sizeof(luku)); leveys    = atol(luku); memset(luku, 0, sizeof(luku));
// 	tiedosto->read(luku, sizeof(luku)); korkeus   = atol(luku); memset(luku, 0, sizeof(luku));
// 	for (y=aloitus_y;y<=aloitus_y+korkeus;y++) {	// Luetaan alue tile by tile
// 		for (x=aloitus_x;x<=aloitus_x+leveys;x++) {
// 			tiedosto->read(tile, sizeof(tile));
// 			this->seinat[x+y*PK2KARTTA_KARTTA_LEVEYS] = tile[0];
// 		}
// 	}
//
// 	//spritet
// 	tiedosto->read(luku, sizeof(luku)); aloitus_x = atol(luku); memset(luku, 0, sizeof(luku));
// 	tiedosto->read(luku, sizeof(luku)); aloitus_y = atol(luku); memset(luku, 0, sizeof(luku));
// 	tiedosto->read(luku, sizeof(luku)); leveys    = atol(luku); memset(luku, 0, sizeof(luku));
// 	tiedosto->read(luku, sizeof(luku)); korkeus   = atol(luku); memset(luku, 0, sizeof(luku));
// 	for (y=aloitus_y;y<=aloitus_y+korkeus;y++) {	// Luetaan alue tile by tile
// 		for (x=aloitus_x;x<=aloitus_x+leveys;x++) {
// 			tiedosto->read(tile, sizeof(tile));
// 			this->spritet[x+y*PK2KARTTA_KARTTA_LEVEYS] = tile[0];
// 		}
// 	}
//
// 	if (tiedosto->fail())
// 	{
// 		delete (tiedosto);
// 		return 1;
// 	}
//
// 	delete (tiedosto);
//
// 	//Lataa_PalikkaPaletti(this->palikka_bmp);
// 	//Lataa_Taustakuva(this->taustakuva);
//
// 	return 0;
// }
//
// void PK2Kartta::Tyhjenna(){
// 	strcpy(this->versio, PK2KARTTA_VIIMEISIN_VERSIO);
// 	strcpy(this->palikka_bmp,"blox.bmp");
// 	strcpy(this->taustakuva, "default.bmp");
// 	strcpy(this->musiikki,   "default.xm");
//
// 	strcpy(this->nimi,  "untitled");
// 	strcpy(this->tekija,"unknown");
//
// 	this->jakso			= 0;
// 	this->ilma			= ILMA_NORMAALI;
// 	this->kytkin1_aika	= KYTKIN_ALOITUSARVO;
// 	this->kytkin2_aika	= KYTKIN_ALOITUSARVO;
// 	this->kytkin3_aika	= KYTKIN_ALOITUSARVO;
// 	this->pelaaja_sprite = 0;
// 	this->aika		= 0;
// 	this->extra		= PK2KARTTA_EXTRA_EI;
// 	this->tausta	= PK2KARTTA_TAUSTAKUVA_EI;
//
// 	this->x = 0;
// 	this->y = 0;
// 	this->ikoni = 0;
//
// 	memset(this->taustat, 255, sizeof(taustat));
// 	memset(this->seinat,  255, sizeof(seinat));
// 	memset(this->spritet, 255, sizeof(spritet));
//
// 	for (int i=0;i<PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA;i++)
// 		strcpy(this->protot[i],"");
//
// 	//PisteDraw2_ImageFill(this->palikat_buffer,255);
// 	//PisteDraw2_ImageFill(this->taustakuva_buffer,255);
// }
//
// PK2Kartta &PK2Kartta::operator = (const PK2Kartta &kartta){
// 	if (this == &kartta) return *this;
//
// 	strcpy(this->versio,		kartta.versio);
// 	strcpy(this->palikka_bmp,	kartta.palikka_bmp);
// 	strcpy(this->taustakuva,	kartta.taustakuva);
// 	strcpy(this->musiikki,		kartta.musiikki);
//
// 	strcpy(this->nimi,			kartta.nimi);
// 	strcpy(this->tekija,		kartta.tekija);
//
// 	this->aika		= kartta.aika;
// 	this->extra		= kartta.extra;
// 	this->tausta	= kartta.tausta;
//
// 	int i;
//
// 	for (i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		this->seinat[i] = kartta.seinat[i];
//
// 	for (i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		this->taustat[i] = kartta.taustat[i];
//
// 	for (i=0;i<PK2KARTTA_KARTTA_KOKO;i++)
// 		this->spritet[i] = kartta.spritet[i];
//
// 	PisteDraw2_Image_Copy(kartta.taustakuva_buffer,this->taustakuva_buffer);
// 	PisteDraw2_Image_Copy(kartta.palikat_buffer,this->palikat_buffer);
//
// 	return *this;
// }
//
// int PK2Kartta::Lataa_Taustakuva(char *polku, char *filename){
// 	int i;
// 	char file[PE_PATH_SIZE];
// 	strcpy(file,"");
// 	strcpy(file,polku);
//
// 	for (i=0 ; filename[i]!='\0' ; i++)
// 		filename[i]=tolower(filename[i]);
//
// 	strcat(file,filename);
//
// 	if (!PisteUtils_Find(file)){
// 		//strcpy(file,PK2Kartta::pk2_hakemisto);
// 		strcpy(file,"gfx/scenery/");
// 		strcat(file,filename);
// 		if (!PisteUtils_Find(file)) return 1;
// 	}
//
// 	i = PisteDraw2_Image_Load(file,true);
// 	if(i == -1) return 2;
// 	PisteDraw2_Image_Copy(i,this->taustakuva_buffer);
// 	PisteDraw2_Image_Delete(i);
//
// 	strcpy(this->taustakuva,filename);
//
// 	BYTE *buffer = NULL;
// 	DWORD leveys;
// 	int x,y;
// 	int color;
//
// 	PisteDraw2_DrawImage_Start(taustakuva_buffer,*&buffer,(DWORD &)leveys);
//
// 	for (x=0;x<640;x++)
// 		for (y=0;y<480;y++)
// 		{
// 			color = buffer[x+y*leveys];
//
// 			if (color == 255)
// 				color--;
//
// 			buffer[x+y*leveys] = color;
// 		}
//
// 	PisteDraw2_DrawImage_End(taustakuva_buffer);
//
// 	return 0;
// }
//
// int PK2Kartta::Lataa_PalikkaPaletti(char *polku, char *filename){
// 	int i;
// 	int img;
// 	char file[PE_PATH_SIZE];
// 	strcpy(file,"");
// 	strcpy(file,polku);
// 	strcat(file,filename);
//
// 	if (!PisteUtils_Find(file)){
// 		//strcpy(file,PK2Kartta::pk2_hakemisto);
// 		strcpy(file,"gfx/tiles/");
// 		strcat(file,filename);
// 		if (!PisteUtils_Find(file))
// 			return 1;
// 	}
//
// 	img = PisteDraw2_Image_Load(file,false);
// 	if(img == -1) return 2;
// 	PisteDraw2_Image_Copy(img,this->palikat_buffer);
// 	PisteDraw2_Image_Delete(img);
//
// 	PisteDraw2_Image_Delete(this->palikat_vesi_buffer); //Delete last water buffer
// 	this->palikat_vesi_buffer = PisteDraw2_Image_Cut(this->palikat_buffer,0,416,320,32);
//
// 	strcpy(this->palikka_bmp,filename);
// 	return 0;
// }
//
// int PK2Kartta::Lataa_TaustaMusiikki(char *filename){
//
// 	return 0;
// }
//

//
// /* Pekka Kana 2 funcitons ---------------------------------------------------------------*/
//
//
//
// void PK2Kartta::Place_Sprites() {
//
// 	Game::Sprites->clear();
// 	Game::Sprites->add(this->pelaaja_sprite, 1, 0, 0, MAX_SPRITEJA, false);
//
// 	int sprite;
//
// 	for (int x = 0; x < PK2KARTTA_KARTTA_LEVEYS; x++){
// 		for (int y = 0; y < PK2KARTTA_KARTTA_KORKEUS; y++){
// 			sprite = this->spritet[x+y*PK2KARTTA_KARTTA_LEVEYS];
//
// 			if (sprite != 255 && Game::Sprites->protot[sprite].korkeus > 0){
// 				Game::Sprites->add(sprite, 0, x*32, y*32 - Game::Sprites->protot[sprite].korkeus+32, MAX_SPRITEJA, false);
// 			}
// 		}
// 	}
//
// 	Game::Sprites->sort_bg();
//
// }
//


//

//
