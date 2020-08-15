import { EColor } from '@game/enum/EColor';
import { EDamageType } from '@game/enum/EDamageType';
import { EDestructionType } from '@game/enum/EDestructionType';
import { ESpriteType } from '@game/enum/ESpriteType';
import { GameContext } from '@game/game/GameContext';
import { SpriteAnimation } from '@game/sprite/SpriteAnimation';
import { EAi } from '@game/sprite/SpriteManager';
import { Log } from '@ng/support/log/LoggerImpl';
import { pathJoin, ifempty } from '@ng/support/utils';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';
import { PkRectangleImpl } from '@ng/types/pixi/PkRectangleImpl';
import { PkBinary } from '@ng/types/PkBinary';
import { PkImageTexture } from '@ng/types/PkImageTexture';
import { PkSound } from '@ng/types/PkSound';
import {
    SPRITE_MAX_AI,
    SPRITE_MAX_FRAMEJA,
    SPRITE_MAX_ANIMAATIOITA,
    ANIMAATIO_MAX_SEKVENSSEJA,
    PK2SPRITE_VIIMEISIN_VERSIO,
    MAX_AANIA,
    RESOURCES_PATH
} from '../../support/constants';
import { DWORD, int, str, CBYTE, cvect, CVect } from '../support/types';

export class SpritePrototype {
    private mContext: GameContext;
    
    /** Source path. */
    private _fpath: string;
    /** Source file. */
    private _fname: string;
    
    /** Versión. */
    private _version: str<4>;
    //.spr filename
    private _tiedosto: str<255>;
    //Prototype index
    private _index: int;
    /** Sprite family (bonus, background, teleporter, ...). */
    private _type: ESpriteType;
    
    //.bmp filename
    private _kuvatiedosto: str<100>;								// .BMP jossa ovat spriten grafiikat
    
    // Spriteen liittyv�t ��nitehosteet
    
    private _aanitiedostot: CVect<str<100>> = cvect(MAX_AANIA);					// ��nitehostetiedostot
    private _aanet: CVect<PkSound> = cvect(MAX_AANIA);							// ��nitehosteet (indeksit buffereihin)
    
    // Spriten kuva- ja animaatio-ominaisuudet
    /**
     * Sprite frames.<br>
     * @deprecated Must be migrated to _frames.
     */
    private _framet: CVect<int> = cvect(SPRITE_MAX_FRAMEJA);
    /**
     * Sprite frames.<br>
     * Replacement of _framet.
     */
    private _frames: PkImageTexture[] = cvect(SPRITE_MAX_FRAMEJA);
    /**
     * Sprite frames flipped horizontaly.<br>
     * @deprecated Use _frames.
     */
    private _framet_peilikuva: CVect<int> = cvect(SPRITE_MAX_FRAMEJA);
    private _frameCount: CBYTE;										// framejen m��r�
    // TODO: A prototype can have MAX animations, but a sprite only BYTE(8)
    private _animaatiot: CVect<SpriteAnimation> = cvect(SPRITE_MAX_ANIMAATIOITA);	// animaatio sekvenssit
    private _animaatioita: CBYTE;									// animaatioiden m��r�
    private _frameRate: CBYTE;										// yhden framen kesto
    private _kuva_x: int;											// miss� kohtaa kuvaa sprite on
    private _kuva_y: int;											// miss� kohtaa kuvaa sprite on
    /** Width of a frame in the sheet. */
    private _frameWidth: int;
    /** Height of a frame in the sheet. */
    private _frameHeight: int;
    private _kuva_frame_vali: int;								// kahden framen vali
    
    // Spriten ominaisuudet
    private _nimi: str<30>;										// spriten nimi (n�kyy editorissa)
    private _leveys: int;											// spriten leveys
    private _korkeus: int;										// spriten korkeus
    private _weight: number;											// sprite paino (vaikuttaa hyppyyn ja kytkimiin)
    
    private _isEnemy: boolean;										// onko sprite vihollinen
    private _energia: int;										// monta iskua kest��
    private _causedDamage: int;										// paljon vahinkoa tekee jos osuu
    private _causedDamageType: CBYTE;									// mink� tyyppist� vahinkoa tekee (1.1)
    private _suojaus: CBYTE;										// mink� tyyppiselt� vahingolta on suojattu (1.1)
    private _pisteet: int;										// paljonko siit� saa pisteit�
    
    private _AI: CVect<EAi> = cvect(SPRITE_MAX_AI);								// mit� teko�lyj� k�ytet��n
    
    private _maxJump: CBYTE;										// hypyn maksimikesto
    private _maxSpeed: number;										// maksiminopeus
    private _latausaika: int;										// ampumisen j�lkeinen odotus
    private _vari: CBYTE;											// tehd��nk� spritest� jonkin tietyn v�rinen
    /**
     * If true, the sprite will act like an obstable block.
     * SRC: este. */
    private _obstacle: boolean;
    private _tuhoutuminen: int;									// miten sprite tuhoutuu
    /** This sprite is a key or similar; it's one of the sprites needed to open the level locks. */
    private _isKey: boolean;
    /** If the sprite must shake occasionally. */
    private _shakes: boolean;
    /** Number of bonus it drops when destroyed. */
    private _droppedBonusCount: int;
    /** Attack 1 animation duration (number of frames). */
    private _hyokkays1_aika: int;
    /** Attack 2 animation duration (number of frames). */
    private _hyokkays2_aika: int;
    
    private _pallarx_kerroin: int;								// Vain TYYPPI_TAUSTA. Suhde taustakuvaan.
    
    // Yhteys toisiin spriteihin
    
    private _morphProtoName: str<100>;								// Toinen sprite joksi t�m� sprite voi muuttua
    private _bonusProtoName: str<100>;								// Spriten bonuksena j�tt�m� k�ytt�m� sprite
    private _ammo1ProtoName: str<100>;								// Spriten ammuksena 1 k�ytt�m� sprite
    private _ammo2ProtoName: str<100>;								// Spriten ammuksena 2 k�ytt�m� sprite
    /** "Transformation" prototype. */
    public morphProto: SpritePrototype;			// Muutosspriten prototyypin indeksi. -1 jos ei ole
    public bonusProto: SpritePrototype;				// Bonusspriten prototyypin indeksi. -1 jos ei ole
    public ammo1Proto: SpritePrototype;				// Ammussprite1 prototyypin indeksi. -1 jos ei ole
    public ammo2Proto: SpritePrototype;				// Ammussprite1 prototyypin indeksi. -1 jos ei ole
    
    // Lis�ykset 1.2 versiossa
    /** If TRUE, sprite collisions are treated like a block. */
    private _collidesWithBlocks: boolean;
    private _aani_frq: DWORD;										// ��nien perussoittotaajuus (esim. 22050)
    private _random_frq: boolean;										// satunnaisuutta taajuuteen?
    
    // If sprite is an obstacle
    private _este_ylos: boolean;
    private _este_alas: boolean;
    private _este_oikealle: boolean;
    private _este_vasemmalle: boolean;
    
    // Lis�ykset 1.3 versiossa
    private _lapinakyvyys: CBYTE;									// 0 = ei n�y - 100 = ei l�pin�kyv�
    private _hehkuu: boolean;											// 0 = ei hehku (t�ytyy olla l�pin�kyv�)
    private _tulitauko: int;										// ammuspriten ampujalle aiheuttama latausaika
    private _liitokyky: boolean;										// voiko tippua hiljaa alas?
    private _boss: boolean;											// onko johtaja
    /** If TRUE, always (100% probability) leaves bonus when it's destroyed. */
    private _alwaysDropsBonusWhenDestroyed: boolean;
    private _osaa_uida: boolean;										// vaikuttaako painovoima vedess�?
    
    public static async loadFromFile(ctx: GameContext, path: string, file: string) {
        return new SpritePrototype(ctx).loadFromFile(path, file);
    }
    
    // Muodostimet
    public constructor(ctx: GameContext) {
        this.mContext = ctx;
        
        this._version = PK2SPRITE_VIIMEISIN_VERSIO;
        this._tiedosto = '';
        this._kuvatiedosto = '';
        this._nimi = '';
        this._morphProtoName = null;
        this._bonusProtoName = null;
        this._ammo1ProtoName = null;
        this._ammo2ProtoName = null;
        
        for (let aani = 0; aani < MAX_AANIA; aani++) {
            this._aanitiedostot[aani] = '';
            this._aanet[aani] = -1;
        }
        
        this._aani_frq = 22050;
        this.ammo1Proto = null;
        this.ammo2Proto = null;
        this._animaatioita = 0;
        this._isKey = false;
        this.bonusProto = null;
        this._droppedBonusCount = 1;
        this._energia = 0;
        this._obstacle = false;
        this._este_ylos = true;
        this._este_alas = true;
        this._este_oikealle = true;
        this._este_vasemmalle = true;
        this._frameCount = 0;
        this._frameRate = 0;
        this._hyokkays1_aika = 60;
        this._hyokkays2_aika = 60;
        this._index = 0;
        this._kuva_x = 0;
        this._kuva_y = 0;
        this._frameWidth = 0;
        this._frameHeight = 0;
        this._korkeus = 0;
        this._latausaika = 0;
        this._leveys = 0;
        this._maxJump = 0;
        this._maxSpeed = 3;
        this.morphProto = null;
        this._weight = 0;
        this._pallarx_kerroin = 0;
        this._pisteet = 0;
        this._random_frq = true;
        this._suojaus = EDamageType.VAHINKO_EI;
        this._shakes = false;
        this._collidesWithBlocks = true;
        this._tuhoutuminen = EDestructionType.TUHOUTUMINEN_ANIMAATIO;
        this._type = ESpriteType.TYYPPI_EI_MIKAAN;
        this._causedDamage = 0;
        this._causedDamageType = EDamageType.VAHINKO_ISKU;
        this._vari = EColor.VARI_NORMAALI;
        this._isEnemy = false;
        
        this._lapinakyvyys = 0; //false;
        this._hehkuu = false;
        this._tulitauko = 0;
        this._liitokyky = false;
        this._boss = false;
        this._alwaysDropsBonusWhenDestroyed = false;
        this._osaa_uida = false;
        
        for (let i = 0; i < SPRITE_MAX_AI; i++) {
            this._AI[i] = EAi.AI_EI;
        }
        
        for (let i = 0; i < SPRITE_MAX_FRAMEJA; i++)
            this._framet[i] = 0;
        
        // for (let i = 0; i < SPRITE_MAX_ANIMAATIOITA; i++) {
        //     for (let j = 0; j < ANIMAATIO_MAX_SEKVENSSEJA; j++)
        //         this._animaatiot[i].sekvenssi[j] = 0;
        //
        //     this._animaatiot[i].looppi = false;
        //     this._animaatiot[i].frameja = 0;
        // }
    }
    
    // ~PK2Sprite_Prototyyppi();
    
    ///  Methods  ///
    private uusi(): void {
        this._version = PK2SPRITE_VIIMEISIN_VERSIO;
        this._tiedosto = '';
        this._kuvatiedosto = '';
        this._nimi = '';
        this._morphProtoName = '';
        this._bonusProtoName = '';
        this._ammo1ProtoName = '';
        this._ammo2ProtoName = '';
        
        for (let aani = 0; aani < MAX_AANIA; aani++) {
            this._aanitiedostot[aani] = '';
            this._aanet[aani] = -1;
        }
        
        this._aani_frq = 22050;
        this.ammo1Proto = null;
        this.ammo2Proto = null;
        this._animaatioita = 0;
        this._isKey = false;
        this.bonusProto = null;
        this._droppedBonusCount = 1;
        this._energia = 0;
        this._obstacle = false;
        this._este_ylos = true;
        this._este_alas = true;
        this._este_oikealle = true;
        this._este_vasemmalle = true;
        this._frameCount = 0;
        this._frameRate = 0;
        this._hyokkays1_aika = 60;
        this._hyokkays2_aika = 60;
        this._index = 0;
        this._kuva_x = 0;
        this._kuva_y = 0;
        this._frameWidth = 0;
        this._frameHeight = 0;
        this._korkeus = 0;
        this._latausaika = 0;
        this._leveys = 0;
        this._maxJump = 0;
        this._maxSpeed = 3;
        this.morphProto = null;
        this._weight = 0;
        this._pallarx_kerroin = 0;
        this._pisteet = 0;
        this._random_frq = true;
        this._suojaus = EDamageType.VAHINKO_EI;
        this._shakes = false;
        this._collidesWithBlocks = true;
        this._tuhoutuminen = EDestructionType.TUHOUTUMINEN_ANIMAATIO;
        this._type = ESpriteType.TYYPPI_EI_MIKAAN;
        this._causedDamage = 0;
        this._causedDamageType = EDamageType.VAHINKO_ISKU;
        this._vari = EColor.VARI_NORMAALI;
        this._isEnemy = false;
        
        this._lapinakyvyys = false;
        this._hehkuu = 0;   //false;
        this._tulitauko = 0;
        this._liitokyky = false;
        this._boss = false;
        this._alwaysDropsBonusWhenDestroyed = false;
        this._osaa_uida = false;
        
        for (let i = 0; i < SPRITE_MAX_AI; i++) {
            this._AI[i] = EAi.AI_EI;
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
     * SDL: PK2Sprite_Prototyyppi::Lataa
     *
     * @param fpath
     * @param fname
     */
    private async loadFromFile(fpath: string, fname: string): Promise<this> {
        // this->Uusi();
        
        // Ladataan itse sprite-tiedosto
        
        this._fpath = fpath;
        this._fname = fname;
        
        const uri = pathJoin(RESOURCES_PATH, fpath, fname);
        const file = await PkAssetTk.getBinary(uri);
        
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
                this.loadSerialized13(file);
                break;
        }
        
        // TODO throw...
        // if (tiedosto->fail()){
        //     delete (tiedosto);
        //     return 1;
        // }
        // Get sprite bmp
        // int bufferi = PisteDraw2_Image_Load(kuva,false);
        //const img = await PkAssetTk.getImage(pathJoin(fpath, this._kuvatiedosto));
        const bmp = await PkAssetTk.getBitmap(pathJoin(RESOURCES_PATH, fpath, this._kuvatiedosto));
        bmp.removeTransparentPixel();
        // TODO
        //  if (bufferi == -1)
        //     return 1;
        
        // //Set diferent colors
        // BYTE *buffer = NULL;
        // DWORD leveys;
        // BYTE vari;
        // int x,y,w,h;
        
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
        
        // --- EXTRACT FRAMES ---
        let frame_x = this._kuva_x;
        let frame_y = this._kuva_y;
        
        //Get each frame
        for (let frame_i = 0; frame_i < this._frameCount; frame_i++) {
            if (frame_x + this._frameWidth > 640) {
                frame_y += this._frameHeight + 3;
                frame_x = this._kuva_x;
            }
            
            this._frames[frame_i] = bmp.getTexture(PkRectangleImpl.$(frame_x, frame_y, this._frameWidth, this._frameHeight));
            //     framet_peilikuva[frame_i] = PisteDraw2_Image_Cut(bufferi,frame_x,frame_y,kuva_frame_leveys,kuva_frame_korkeus); //flipped frames
            //     PisteDraw2_Image_FlipHori(framet_peilikuva[frame_i]);
            
            frame_x += this._frameWidth + 3;
        }
        
        // PisteDraw2_Image_Delete(bufferi);
        
        Log.dg(
            [`[SpritePrototype] Loaded "${ this._fname }"`],
            [`Version: ${ this._version }`],
            [`Max jump: ${ this._maxJump }`],
            [`Max speed: ${ this._maxSpeed }`],
            [`Energy: ${ this._energia }`],
            [`Weight: ${ this._weight }`],
            [`Frames: ${ this._frameCount }`],
            [`Animations: [${ this._animaatiot.join(',') }]`],
            [`Behaviours: [${ this._AI.join(',') }]`]
        );
        
        return this;
    }
    
    //     void Tallenna(char *tiedoston_nimi);
    //     int  Piirra(int x, int y, int frame);
    
    // Palauttaa true, jos spritell� on ko. AI
    /** @deprecated Use hasBehavior */
    public Onko_AI(ai: EAi): boolean { throw new Error('DEPRECATED'); }
    /**
     * Returns true if this prototype has the specified behavior, false otherwise.
     *
     * @param ai - Behavior to check.
     */
    public hasBehavior(ai: EAi): boolean {
        return this._AI.includes(ai);
    }
    
    
    //     void SetProto10(PK2Sprite_Prototyyppi10 &proto);
    //     void SetProto11(PK2Sprite_Prototyyppi11 &proto);
    //     void SetProto12(PK2Sprite_Prototyyppi12 &proto);
    
    /**
     * SDL: PK2Sprite_Prototyyppi::SetProto13.
     *
     * @param stream
     */
    private loadSerialized13(stream: PkBinary): void {
        this._type = stream.streamReadUint(4) as ESpriteType;
        this._kuvatiedosto = stream.streamReadCStr(100);
        for (let i = 0; i < 7; i++) {
            this._aanitiedostot[i] = ifempty(stream.streamReadCStr(100));
        }
        for (let i = 0; i < 7; i++) {
            const sfx = stream.streamReadInt(4);
            // All has to be -1, any other thing will be overwriten when load sounds
            this._aanet[i] = sfx != -1 ? sfx : null;
        }
        
        this._frameCount = stream.streamReadByte();
        for (let i = 0; i < 20; i++) {
            this._animaatiot[i] = SpriteAnimation.fromSerialized(stream);
        }
        this._animaatioita = stream.streamReadUint(1);
        this._frameRate = stream.streamReadUint(1);
        stream.streamOffset += 1;                                 // <- 1 byte padding for struct alignment
        this._kuva_x = stream.streamReadInt(4);
        this._kuva_y = stream.streamReadInt(4);
        this._frameWidth = stream.streamReadInt(4);
        this._frameHeight = stream.streamReadInt(4);
        this._kuva_frame_vali = stream.streamReadInt(4);
        
        this._nimi = stream.streamReadCStr(30);
        stream.streamOffset += 2;                                 // <- 2 bytes padding for struct alignment
        this._leveys = stream.streamReadInt(4);
        this._korkeus = stream.streamReadInt(4);
        this._weight = stream.streamReadDouble(8);
        this._isEnemy = stream.streamReadBool();
        
        stream.streamOffset += 3;                                 // <- 3 bytes padding for struct alignment
        this._energia = stream.streamReadInt(4);
        this._causedDamage = stream.streamReadInt(4);
        this._causedDamageType = stream.streamReadUint(1);
        this._suojaus = stream.streamReadUint(1);
        stream.streamOffset += 2;                                 // <- 2 bytes padding for struct alignment
        this._pisteet = stream.streamReadInt(4);
        for (let i = 0; i < 10; i++) {
            this._AI[i] = stream.streamReadUint(4) as EAi;
        }
        this._maxJump = stream.streamReadUint(1);
        stream.streamOffset += 3;                                 // <- 3 bytes padding for struct alignment
        this._maxSpeed = stream.streamReadDouble(8);
        this._latausaika = stream.streamReadInt(4);
        this._vari = stream.streamReadUint(1);
        this._obstacle = stream.streamReadBool();
        stream.streamOffset += 2;                                 // <- 2 bytes padding for struct alignment
        this._tuhoutuminen = stream.streamReadInt(4);
        this._isKey = stream.streamReadBool();
        this._shakes = stream.streamReadBool();
        this._droppedBonusCount = stream.streamReadUint(1);
        stream.streamOffset++;                                    // <- 1 byte padding for struct alignment
        this._hyokkays1_aika = stream.streamReadInt(4);
        this._hyokkays2_aika = stream.streamReadInt(4);
        this._pallarx_kerroin = stream.streamReadInt(4);
        
        this._morphProtoName = ifempty(stream.streamReadCStr(100));
        this._bonusProtoName = ifempty(stream.streamReadCStr(100));
        this._ammo1ProtoName = ifempty(stream.streamReadCStr(100));
        this._ammo2ProtoName = ifempty(stream.streamReadCStr(100));
        
        this._collidesWithBlocks = stream.streamReadBool();
        
        stream.streamOffset += 3;                                 // <- 3 bytes padding for struct alignment
        this._aani_frq = stream.streamReadUint(4);
        this._random_frq = stream.streamReadBool();
        
        this._este_ylos = stream.streamReadBool();
        this._este_alas = stream.streamReadBool();
        this._este_oikealle = stream.streamReadBool();
        this._este_vasemmalle = stream.streamReadBool();
        
        this._lapinakyvyys = stream.streamReadUint(1);
        this._hehkuu = stream.streamReadBool();
        stream.streamOffset++;                                    // <- 1 byte padding for struct alignment
        this._tulitauko = stream.streamReadInt(4);
        this._liitokyky = stream.streamReadBool();
        this._boss = stream.streamReadBool();
        this._alwaysDropsBonusWhenDestroyed = stream.streamReadBool();
        this._osaa_uida = stream.streamReadBool();
    }
    
    
    ///  Accessors  ///
    
    public get type(): ESpriteType {
        return this._type;
    }
    
    public get index(): int {
        return this._index;
    }
    public assignIndex(index: int) {
        this._index = index;
    }
    
    public get name(): string {
        return this._fname;
    }
    public get path(): string {
        return this._fpath;
    }
    
    // Morph prototype
    /** @see _morphProtoName. */
    public get morphProtoName(): string { return this._morphProtoName; }
    /** @deprecated Use {@link _morphProtoName}. */
    public get muutos_sprite(): string { throw new Error('DEPRECATED'); }
    /** @deprecated Use {@link morphProto}, that uses {@link SpritePrototype} instead an index. */
    public get muutos(): int { throw new Error('DEPRECATED'); }
    
    public getBehavior(i: int): EAi {
        return this._AI[i];
    }
    
    public getSoundName(i: number): string {
        return this._aanitiedostot[i];
    }
    public getSound(i: number): PkSound {
        return this._aanet[i];
    }
    public get soundFreq(): number {
        return this._aani_frq;
    }
    public get soundRandomFreq(): boolean {
        return this._random_frq;
    }
    
    // Bonus prototype
    /** @see _bonusProtoName. */
    public get bonusProtoName(): string { return this._bonusProtoName; }
    /** @deprecated Use {@link _bonusProtoName}. */
    public get bonus_sprite(): string { throw new Error('DEPRECATED'); }
    /** @deprecated Use {@link bonusProto}, that uses {@link SpritePrototype} instead an index. */
    public get bonus(): SpritePrototype { throw new Error('DEPRECATED'); }
    
    // Ammunition 1 prototype
    /** @see _ammo1ProtoName. */
    public get ammo1ProtoName(): string { return this._ammo1ProtoName; }
    /** @deprecated Use {@link _ammo1ProtoName}. */
    public get ammus1_sprite(): string { throw new Error('DEPRECATED'); }
    /** @deprecated Use {@link ammo1Proto}, that uses {@link SpritePrototype} instead an index. */
    public get ammus1(): SpritePrototype { throw new Error('DEPRECATED'); }
    
    // Ammunition 2 prototype
    /** @see _ammo2ProtoName. */
    public get ammo2ProtoName(): string { return this._ammo2ProtoName; }
    /** @deprecated Use {@link _ammo2ProtoName}. */
    public get ammus2_sprite(): string { throw new Error('DEPRECATED'); }
    /** @deprecated Use {@link ammo2Proto}, that uses {@link SpritePrototype} instead an index. */
    public get ammus2(): SpritePrototype { throw new Error('DEPRECATED'); }
    
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
    
    public get alwaysDropsBonusWhenDestroyed(): boolean { return this._alwaysDropsBonusWhenDestroyed === true; }
    /** @deprecated */ public get bonus_aina(): boolean { throw new Error('DEPRECATED'); }
    
    public get droppedBonusCount(): int { return this._droppedBonusCount; }
    /** @deprecated */ public get bonusten_lkm(): int { throw new Error('DEPRECATED'); }
    
    /** In a bonus sprite is the gift-time, i.e. bonus extra time, or extra time invisible... */
    public get latausaika() {
        return this._latausaika;
    }
    
    /** @deprecated Use shakes */
    public get tarisee(): boolean {
        return this.shakes;
    }
    public get shakes(): boolean {
        return this._shakes;
    }
    
    /** @deprecated Use frameCount */
    public get frameja(): int {
        return this.frameCount;
    }
    public get frameCount(): int {
        return this._frameCount;
    }
    
    public get frameRate(): int {
        return this._frameRate;
    }
    
    public getAnimation(i: int): SpriteAnimation {
        return this._animaatiot[i];
    }
    
    /**
     * Returns the specified frame.
     *
     * @param i - Index of the required frame.
     */
    public getFrame(i: int): PkImageTexture {
        return this._frames[i];
    }
    
    /** @deprecated Use frameWidth. */
    public get kuva_frame_leveys(): int {
        return this._frameWidth;
    }
    public get frameWidth(): int {
        return this._frameWidth;
    }
    
    /** @deprecated Use frameHeight. */
    public get kuva_frame_korkeus(): int {
        return this._frameHeight;
    }
    public get frameHeight(): int {
        return this._frameHeight;
    }
    
    /** @deprecated Use height */
    public get korkeus(): int {
        return this.height;
    }
    public get height(): int {
        return this._korkeus;
    }
    public set height(v: int) {
        this._korkeus = v;
    }
    
    /** @deprecated Use maxSpeed */
    public get max_nopeus(): number {
        return this.maxSpeed;
    }
    public get maxSpeed(): number {
        return this._maxSpeed;
    }
    public set maxSpeed(v: number) {
        this._maxSpeed = v;
    }
    
    public get energy(): int {
        return this._energia;
    }
    
    /** @deprecated Use weight */    public get paino(): number { return this.weight; }
    public get weight(): number {
        return this._weight;
    }
    
    /** @deprecated use causedDamage */
    public get vahinko(): int { return this.causedDamage; }
    public get causedDamage(): int {
        return this._causedDamage;
    }
    
    /** @deprecated use causedDamageType */
    public get vahinko_tyyppi(): EDamageType { return this.causedDamageType; }
    public get causedDamageType(): EDamageType {
        return this._causedDamageType;
    }
    
    public get suojaus(): EDamageType { return this._suojaus; }
    
    public isObstacle(): boolean {
        return this._obstacle == true;
    }
    /** @deprecated use isObstacle */ get este(): boolean { return this._obstacle; }
    public get este_alas(): boolean { return this._este_alas; }
    public get este_ylos(): boolean { return this._este_ylos; }
    public get este_oikealle(): boolean { return this._este_oikealle; }
    public get este_vasemmalle(): boolean { return this._este_vasemmalle; }
    
    /** @deprecated use score */
    public get pisteet(): number { return this.score; }
    public get score(): number {
        return this._pisteet;
    }
    
    /** @deprecated Use attack1Duration. */
    public get hyokkays1_aika(): int {
        return this.attack1Duration;
    }
    public get attack1Duration(): int {
        return this._hyokkays1_aika;
    }
    
    /** @deprecated Use attack2Duration. */
    public get hyokkays2_aika(): int {
        return this.attack2Duration;
    }
    public get attack2Duration(): int {
        return this._hyokkays2_aika;
    }
    
    public isEnemy() { return this._isEnemy == true; }
    /** @deprecated */ public get vihollinen() { throw new Error('DEPRECATED'); }
    
    public isKey() { return this._isKey == true; }
    /** @deprecated */ public get avain() { throw new Error('DEPRECATED'); }
    
    /** @deprecated use maxJump */
    public get max_hyppy(): CBYTE {
        return this.maxJump;
    }
    public get maxJump(): CBYTE {
        return this._maxJump;
    }
    public set maxJump(v: CBYTE) {
        this._maxJump = v;
    }
    
    public get pallarx_kerroin(): number {
        return this._pallarx_kerroin;
    }
    
    public get collidesWithBlocks(): boolean { return this._collidesWithBlocks; }
    /** @deprecated */ get tiletarkistus() { throw new Error('DEPRECATED'); }
    
    public isBackground(): boolean {
        return this.type === ESpriteType.TYYPPI_TAUSTA;
    }
    
    public get tuhoutuminen() { return this._tuhoutuminen; }
    public isDestructible(): boolean {
        return this._tuhoutuminen !== EDestructionType.TUHOUTUMINEN_EI_TUHOUDU;
    }
    
    public canSwim(): boolean {
        return this._osaa_uida === true;
    }
    
    /** @deprecated Use canFly() */ public get liitokyky() { return this._liitokyky; }
    public canFly(): boolean {
        return this._liitokyky === true;
    }
}

export type TSpriteProtoCode = CBYTE;

