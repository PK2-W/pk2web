import { PK2GameContext } from '@game/PK2GameContext';
import { EDamageType } from '@game/sprite/Sprite';
import { EAi } from '@game/sprite/SpriteManager';
import {
    SPRITE_MAX_AI,
    SPRITE_MAX_FRAMEJA,
    SPRITE_MAX_ANIMAATIOITA,
    ANIMAATIO_MAX_SEKVENSSEJA, PK2SPRITE_VIIMEISIN_VERSIO, MAX_AANIA
} from '../../support/constants';
import { DWORD, int, str, BYTE, cvect, CVect } from '../../support/types';

export class SpritePrototype {
    private mContext: PK2GameContext;
    
    // Version
    private _versio: str<4>;
    //.spr filename
    private _tiedosto: str<255>;
    //Prototype index
    private _indeksi: int;
    //Sprite type
    private _tyyppi: EProtoType;
    
    //.bmp filename
    private _kuvatiedosto: str<100>;								// .BMP jossa ovat spriten grafiikat
    
    // Spriteen liittyv�t ��nitehosteet
    
    // char		aanitiedostot[MAX_AANIA][100];					// ��nitehostetiedostot
    private _aanet: CVect<int> = cvect(MAX_AANIA);							// ��nitehosteet (indeksit buffereihin)
    
    // Spriten kuva- ja animaatio-ominaisuudet
    private _framet: CVect<int> = cvect(SPRITE_MAX_FRAMEJA);						// spriten framet (bitm�pit)
    private _framet_peilikuva: CVect<int> = cvect(SPRITE_MAX_FRAMEJA);			// spriten framet peilikuvina
    private _frameja: BYTE;										// framejen m��r�
    private _animaatiot: CVect<PK2SPRITE_ANIMAATIO> = cvect(SPRITE_MAX_ANIMAATIOITA);	// animaatio sekvenssit
    private _animaatioita: BYTE;									// animaatioiden m��r�
    private _frame_rate: BYTE;										// yhden framen kesto
    private _kuva_x: int;											// miss� kohtaa kuvaa sprite on
    private _kuva_y: int;											// miss� kohtaa kuvaa sprite on
    private _kuva_frame_leveys: int;								// yhden framen leveys
    private _kuva_frame_korkeus: int;								// yhden framen korkeus
    private _kuva_frame_vali: int;								// kahden framen vali
    
    // Spriten ominaisuudet
    private _nimi: str<30>;										// spriten nimi (n�kyy editorissa)
    private _leveys: int;											// spriten leveys
    private _korkeus: int;										// spriten korkeus
    private _paino: number;											// sprite paino (vaikuttaa hyppyyn ja kytkimiin)
    
    private _vihollinen: boolean;										// onko sprite vihollinen
    private _energia: int;										// monta iskua kest��
    private _vahinko: int;										// paljon vahinkoa tekee jos osuu
    private _vahinko_tyyppi: BYTE;									// mink� tyyppist� vahinkoa tekee (1.1)
    private _suojaus: BYTE;										// mink� tyyppiselt� vahingolta on suojattu (1.1)
    private _pisteet: int;										// paljonko siit� saa pisteit�
    
    private _AI: CVect<int> = cvect(SPRITE_MAX_AI);								// mit� teko�lyj� k�ytet��n
    
    private _max_hyppy: BYTE;										// hypyn maksimikesto
    private _max_nopeus: number;										// maksiminopeus
    private _latausaika: int;										// ampumisen j�lkeinen odotus
    private _vari: BYTE;											// tehd��nk� spritest� jonkin tietyn v�rinen
    private _este: boolean;											// k�ytt�ytyyk� sprite kuin sein�
    private _tuhoutuminen: int;									// miten sprite tuhoutuu
    private _avain: boolean;											// Voiko sprite avata lukkoja
    private _tarisee: boolean;										// T�riseek� sprite satunnaisesti
    private _bonusten_lkm: BYTE;									// Bonusten lukum��r�
    private _hyokkays1_aika: int;									// Hy�kk�ysanimaation 1 kesto (frameja)
    private _hyokkays2_aika: int;									// Hy�kk�ysanimaation 2 kesto (frameja)
    
    private _pallarx_kerroin: int;								// Vain TYYPPI_TAUSTA. Suhde taustakuvaan.
    
    // Yhteys toisiin spriteihin
    
    private _muutos_sprite: str<100>;								// Toinen sprite joksi t�m� sprite voi muuttua
    private _bonus_sprite: str<100>;								// Spriten bonuksena j�tt�m� k�ytt�m� sprite
    private _ammus1_sprite: str<100>;								// Spriten ammuksena 1 k�ytt�m� sprite
    private _ammus2_sprite: str<100>;								// Spriten ammuksena 2 k�ytt�m� sprite
    private _muutos: int;											// Muutosspriten prototyypin indeksi. -1 jos ei ole
    private _bonus: int;											// Bonusspriten prototyypin indeksi. -1 jos ei ole
    private _ammus1: int;											// Ammussprite1 prototyypin indeksi. -1 jos ei ole
    private _ammus2: int;											// Ammussprite1 prototyypin indeksi. -1 jos ei ole
    
    // Lis�ykset 1.2 versiossa
    private _tiletarkistus: boolean;									// t�rm�ileek� tileihin
    private _aani_frq: DWORD;										// ��nien perussoittotaajuus (esim. 22050)
    private _random_frq: boolean;										// satunnaisuutta taajuuteen?
    
    // Jos sprite on este
    private _este_ylos: boolean;
    private _este_alas: boolean;
    private _este_oikealle: boolean;
    private _este_vasemmalle: boolean;
    
    // Lis�ykset 1.3 versiossa
    private _lapinakyvyys: BYTE;									// 0 = ei n�y - 100 = ei l�pin�kyv�
    private _hehkuu: boolean;											// 0 = ei hehku (t�ytyy olla l�pin�kyv�)
    private _tulitauko: int;										// ammuspriten ampujalle aiheuttama latausaika
    private _liitokyky: boolean;										// voiko tippua hiljaa alas?
    private _boss: boolean;											// onko johtaja
    private _bonus_aina: boolean;										// j�tt�� aina bonuksen tuhoutuessa
    private _osaa_uida: boolean;										// vaikuttaako painovoima vedess�?
    
    public static async loadFromFile(ctx: PK2GameContext, path: string, file: string) {
        return new SpritePrototype(ctx).loadFromFile(path, file);
    }
    
    // Muodostimet
    public constructor(ctx: PK2GameContext) {
        this.mContext = ctx;
        
        this._versio = PK2SPRITE_VIIMEISIN_VERSIO;
        this._tiedosto = '';
        this._kuvatiedosto = '';
        this._nimi = '';
        this._muutos_sprite = '';
        this._bonus_sprite = '';
        this._ammus1_sprite = '';
        this._ammus2_sprite = '';
        
        for (let aani = 0; aani < MAX_AANIA; aani++) {
            this._aanitiedostot[aani] = '';
            this._aanet[aani] = -1;
        }
        
        this._aani_frq = 22050;
        this._ammus1 = -1;
        this._ammus2 = -1;
        this._animaatioita = 0;
        this._avain = false;
        this._bonus = -1;
        this._bonusten_lkm = 1;
        this._energia = 0;
        this._este = false;
        this._este_ylos = true;
        this._este_alas = true;
        this._este_oikealle = true;
        this._este_vasemmalle = true;
        this._frameja = 0;
        this._frame_rate = 0;
        this._hyokkays1_aika = 60;
        this._hyokkays2_aika = 60;
        this._indeksi = 0;
        this._kuva_x = 0;
        this._kuva_y = 0;
        this._kuva_frame_leveys = 0;
        this._kuva_frame_korkeus = 0;
        this._korkeus = 0;
        this._latausaika = 0;
        this._leveys = 0;
        this._max_hyppy = 0;
        this._max_nopeus = 3;
        this._muutos = -1;
        this._paino = 0;
        this._pallarx_kerroin = 0;
        this._pisteet = 0;
        this._random_frq = true;
        this._suojaus = EDamageType.VAHINKO_EI;
        this._tarisee = false;
        this._tiletarkistus = true;
        this._tuhoutuminen = TUHOUTUMINEN_ANIMAATIO;
        this._tyyppi = EProtoType.TYYPPI_EI_MIKAAN;
        this._vahinko = 0;
        this._vahinko_tyyppi = EDamageType.VAHINKO_ISKU;
        this._vari = EColor.VARI_NORMAALI;
        this._vihollinen = false;
        
        this._lapinakyvyys = 0; //false;
        this._hehkuu = false;
        this._tulitauko = 0;
        this._liitokyky = false;
        this._boss = false;
        this._bonus_aina = false;
        this._osaa_uida = false;
        
        for (let i = 0; i < SPRITE_MAX_AI; i++) {
            this._AI[i] = AI_EI;
        }
        
        for (let i = 0; i < SPRITE_MAX_FRAMEJA; i++)
            this._framet[i] = 0;
        
        for (let i = 0; i < SPRITE_MAX_ANIMAATIOITA; i++) {
            for (let j = 0; j < ANIMAATIO_MAX_SEKVENSSEJA; j++)
                this._animaatiot[i].sekvenssi[j] = 0;
            
            this._animaatiot[i].looppi = false;
            this._animaatiot[i].frameja = 0;
        }
    }
    
    // ~PK2Sprite_Prototyyppi();
    
    ///  Methods  ///
    private uusi(): void {
        this._versio = PK2SPRITE_VIIMEISIN_VERSIO;
        this._tiedosto = '';
        this._kuvatiedosto = '';
        this._nimi = '';
        this._muutos_sprite = '';
        this._bonus_sprite = '';
        this._ammus1_sprite = '';
        this._ammus2_sprite = '';
        
        for (let aani = 0; aani < MAX_AANIA; aani++) {
            this._aanitiedostot[aani] = '';
            this._aanet[aani] = -1;
        }
        
        this._aani_frq = 22050;
        this._ammus1 = -1;
        this._ammus2 = -1;
        this._animaatioita = 0;
        this._avain = false;
        this._bonus = -1;
        this._bonusten_lkm = 1;
        this._energia = 0;
        this._este = false;
        this._este_ylos = true;
        this._este_alas = true;
        this._este_oikealle = true;
        this._este_vasemmalle = true;
        this._frameja = 0;
        this._frame_rate = 0;
        this._hyokkays1_aika = 60;
        this._hyokkays2_aika = 60;
        this._indeksi = 0;
        this._kuva_x = 0;
        this._kuva_y = 0;
        this._kuva_frame_leveys = 0;
        this._kuva_frame_korkeus = 0;
        this._korkeus = 0;
        this._latausaika = 0;
        this._leveys = 0;
        this._max_hyppy = 0;
        this._max_nopeus = 3;
        this._muutos = -1;
        this._paino = 0;
        this._pallarx_kerroin = 0;
        this._pisteet = 0;
        this._random_frq = true;
        this._suojaus = EDamageType.VAHINKO_EI;
        this._tarisee = false;
        this._tiletarkistus = true;
        this._tuhoutuminen = TUHOUTUMINEN_ANIMAATIO;
        this._tyyppi = EProtoType.TYYPPI_EI_MIKAAN;
        this._vahinko = 0;
        this._vahinko_tyyppi = EDamageType.VAHINKO_ISKU;
        this._vari = VARI_NORMAALI;
        this._vihollinen = false;
        
        this._lapinakyvyys = false;
        this._hehkuu = 0;   //false;
        this._tulitauko = 0;
        this._liitokyky = false;
        this._boss = false;
        this._bonus_aina = false;
        this._osaa_uida = false;
        
        for (let i = 0; i < SPRITE_MAX_AI; i++) {
            this._AI[i] = AI_EI;
        }
        
        for (let i = 0; i < SPRITE_MAX_FRAMEJA; i++) {
            if (this._framet[i] !== 0)
                PisteDraw2_Image_Delete(this._framet[i]);
            
            if (this._framet_peilikuva[i] !== 0)
                PisteDraw2_Image_Delete(this._framet_peilikuva[i]);
        }
        
        for (let i = 0; i < SPRITE_MAX_FRAMEJA; i++) {
            this._framet[i] = 0;
            this._framet_peilikuva[i] = 0;
        }
        
        for (let i = 0; i < SPRITE_MAX_ANIMAATIOITA; i++) {
            for (let j = 0; j < ANIMAATIO_MAX_SEKVENSSEJA; j++)
                this._animaatiot[i].sekvenssi[j] = 0;
            
            this._animaatiot[i].looppi = false;
            this._animaatiot[i].frameja = 0;
        }
    }
    
    //     void Kopioi(const PK2Sprite_Prototyyppi &proto);
    //     int  Animaatio_Uusi(int anim_i, BYTE *sekvenssi, bool looppi);
    
    /**
     * Source: PK2Sprite_Prototyyppi::Lataa
     *
     * @param fpath
     * @param fname
     */
    private async loadFromFile(fpath: string, fname: string) {
        // this->Uusi();
        
        // Ladataan itse sprite-tiedosto
        
        const uri = fpath + fname;
        const file = await this.mContext.resources.getBinary(uri);
        
        // TODO throw...
        // if (tiedosto->fail()){
        //     printf("PK2SPR - failed to open %s.\n", polku);
        //     delete (tiedosto);
        //     return 1;
        // }
        
        const version = file.streamRead8CStr(4);
        
        switch (version) {
        case '1.0':
            //     PK2Sprite_Prototyyppi10 proto;
            //     tiedosto->read ((char *)&proto, sizeof (proto));
            //     this->SetProto10(proto);
            //     strcpy(this->versio,versio);
            //     strcpy(this->tiedosto,tiedoston_nimi);
            break;
        case '1.1':
            //     PK2Sprite_Prototyyppi11 proto;
            //     tiedosto->read ((char *)&proto, sizeof (proto));
            //     this->SetProto11(proto);
            //     strcpy(this->versio,versio);
            //     strcpy(this->tiedosto,tiedoston_nimi);
            break;
        case '1.2':
            //     PK2Sprite_Prototyyppi12 proto;
            //     tiedosto->read ((char *)&proto, sizeof (proto));
            //     this->SetProto12(proto);
            //     strcpy(this->versio,versio);
            //     strcpy(this->tiedosto,tiedoston_nimi);
            break;
        case '1.3':
            //     PK2Sprite_Prototyyppi13 proto;
            //     tiedosto->read ((char *)&proto, sizeof (proto));
            //     this->SetProto13(proto);
            //     strcpy(this->versio,versio);
            //     strcpy(this->tiedosto,tiedoston_nimi);
            break;
        }
        
        // TODO throw...
        // if (tiedosto->fail()){
        //     delete (tiedosto);
        //     return 1;
        // }
        
        // Get sprite bmp
        // strcat(kuva,kuvatiedosto);
        // int bufferi = PisteDraw2_Image_Load(kuva,false);
        //
        // if (bufferi == -1)
        //     return 1;
        //
        // //Set diferent colors
        // BYTE *buffer = NULL;
        // DWORD leveys;
        // BYTE vari;
        // int x,y,w,h;
        //
        if (this._vari !== EColor.VARI_NORMAALI) { //Change sprite colors
            //     PisteDraw2_Image_GetSize(bufferi,w,h);
            //
            //     PisteDraw2_DrawImage_Start(bufferi,*&buffer,leveys);
            //
            //     for (x=0;x<w;x++)
            //         for (y=0;y<h;y++)
            //             if ((vari = buffer[x+y*leveys]) != 255){
            //                 vari %= 32;
            //                 vari += this->vari;
            //                 buffer[x+y*leveys] = vari;
            //             }
            //
            //     PisteDraw2_DrawImage_End(bufferi);
        }
        
        // int frame_i = 0,
        //     frame_x = kuva_x,
        //     frame_y = kuva_y;
        //
        // //Get each frame
        // for (frame_i=0; frame_i<frameja; frame_i++){
        //     if (frame_x + kuva_frame_leveys > 640){
        //         frame_y += this->kuva_frame_korkeus + 3;
        //         frame_x = kuva_x;
        //     }
        //
        //     framet[frame_i] = PisteDraw2_Image_Cut(bufferi,frame_x,frame_y,kuva_frame_leveys,kuva_frame_korkeus); //frames
        //     framet_peilikuva[frame_i] = PisteDraw2_Image_Cut(bufferi,frame_x,frame_y,kuva_frame_leveys,kuva_frame_korkeus); //flipped frames
        //     PisteDraw2_Image_FlipHori(framet_peilikuva[frame_i]);
        //
        //     frame_x += this->kuva_frame_leveys + 3;
        // }
        //
        // PisteDraw2_Image_Delete(bufferi);
    }
    
    //     void Tallenna(char *tiedoston_nimi);
    //     int  Piirra(int x, int y, int frame);
    
    /** TODO Esta no es la manera... */
    public Onko_AI(ai: EAi): boolean {						// Palauttaa true, jos spritell� on ko. AI
        for (let i = 0; i < SPRITE_MAX_AI; i++)
            if (this._AI[i] === ai)
                return true;
        return false;
    }
    
    
    //     void SetProto10(PK2Sprite_Prototyyppi10 &proto);
    //     void SetProto11(PK2Sprite_Prototyyppi11 &proto);
    //     void SetProto12(PK2Sprite_Prototyyppi12 &proto);
    //     void SetProto13(PK2Sprite_Prototyyppi13 &proto);
    //     PK2Sprite_Prototyyppi13 GetProto13();
    
    
    ///  Accessors  ///
    
    public get type(): EProtoType {
        return this._tyyppi;
    }
    
    /** @deprecated use width */
    public get leveys(): int {
        return this.width;
    }
    public get width(): int {
        return this._leveys;
    }
    public set width(v: int) {
        this._leveys = v;
    }
    
    /** @deprecated use height */
    public get korkeus(): int {
        return this.height;
    }
    public get height(): int {
        return this._korkeus;
    }
    public set height(v: int) {
        this._korkeus = v;
    }
    
    /** @deprecated use maxSpeed */
    public get max_nopeus(): number {
        return this.maxSpeed;
    }
    public get maxSpeed(): number {
        return this._max_nopeus;
    }
    public set maxSpeed(v: number) {
        this._max_nopeus = v;
    }
    
    public get energy(): int {
        return this._energia;
    }
    
    /** @deprecated use maxJump */
    public get max_hyppy(): BYTE {
        return this.maxJump;
    }
    public get maxJump(): BYTE {
        return this._max_hyppy;
    }
    public set maxJump(v: BYTE) {
        this._max_hyppy = v;
    }
    
    public get pallarx_kerroin(): number {
        return this._pallarx_kerroin;
    }
    private load(path: string, file: string) {
        return undefined;
    }
}

export enum EProtoType { //Type
    TYYPPI_EI_MIKAAN,
    TYYPPI_PELIHAHMO,
    TYYPPI_BONUS,
    TYYPPI_AMMUS,
    TYYPPI_TELEPORTTI,
    TYYPPI_TAUSTA
}

export enum EColor { //Color
    VARI_HARMAA = 0,
    VARI_SININEN = 32,
    VARI_PUNAINEN = 64,
    VARI_VIHREA = 96,
    VARI_ORANSSI = 128,
    VARI_VIOLETTI = 160,
    VARI_TURKOOSI = 192,
    VARI_NORMAALI = 255
}
