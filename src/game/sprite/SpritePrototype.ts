import { NewTexture } from '@fwk/texture/NewTexture';
import { PkPaletteBitmapResource } from '@fwk/texture/PkPaletteBitmapResource';
import { EAi } from '@game/enum/EBehavior';
import { EColor } from '@game/enum/EColor';
import { EDamageType } from '@game/enum/EDamageType';
import { EDestructionType } from '@game/enum/EDestructionType';
import { ESpriteType } from '@game/enum/ESpriteType';
import { GameContext } from '@game/game/GameContext';
import { SpriteAnimation } from '@game/sprite/SpriteAnimation';
import { AssetFetchError } from '@fwk/error/AssetFetchError';
import { PkError } from '@fwk/error/PkError';
import { Log } from '@fwk/support/log/LoggerImpl';
import { pathJoin, ifempty } from '@fwk/support/utils';
import { PkAssetTk } from '@fwk/toolkit/PkAssetTk';
import { PkBitmapBT } from '@fwk/types/image/PkBitmapBT';
import { PkBinary } from '@fwk/types/PkBinary';
import { PkRectangle } from '@fwk/types/PkRectangle';
import { PkSound } from '@fwk/types/PkSound';
import { PkTexture } from '@fwk/types/PkTexture';
import {
    SPRITE_MAX_AI,
    SPRITE_MAX_FRAMEJA,
    SPRITE_MAX_ANIMAATIOITA,
    ANIMAATIO_MAX_SEKVENSSEJA,
    PK2SPRITE_VIIMEISIN_VERSIO,
    MAX_AANIA,
    RESOURCES_PATH
} from '@sp/constants';
import { DWORD, int, str, CBYTE, cvect, CVect } from '../support/types';

export class SpritePrototype {
    private _context: GameContext;
    
    /** Source path. */
    public fpath: string;
    /** Source file. */
    public fname: string;
    /**
     * List of errors experienced during this prototype loading process, but, which don't imply a critical
     * problem for its operation.
     * @private
     */
    private _errorList: Error[];
    
    /** Versión. */
    private _version: str<4>;
    //.spr filename
    private _tiedosto: str<255>;
    //Prototype index
    private _index: int;
    /** Sprite family (bonus, background, teleporter, ...). */
    private _type: ESpriteType;
    
    //.bmp filename
    private _spritesheetName: str<100>;								// .BMP jossa ovat spriten grafiikat
    
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
    private _frames: NewTexture<PkPaletteBitmapResource>[] = cvect(SPRITE_MAX_FRAMEJA);
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
    /**
     * See {@link energy}.
     */
    private _energy: int;
    private _causedDamage: int;										// paljon vahinkoa tekee jos osuu
    private _causedDamageType: CBYTE;									// mink� tyyppist� vahinkoa tekee (1.1)
    private _suojaus: CBYTE;										// mink� tyyppiselt� vahingolta on suojattu (1.1)
    /**
     * See {@link score}.
     */
    private _score: int;
    
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
    
    public static async loadFromFile(context: GameContext, path: string, file: string) {
        return new SpritePrototype(context).loadFromFile(path, file);
    }
    
    // Muodostimet
    public constructor(ctx: GameContext) {
        this._context = ctx;
        this._errorList = [];
        
        this._version = PK2SPRITE_VIIMEISIN_VERSIO;
        this._tiedosto = '';
        this._spritesheetName = '';
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
        this._energy = 0;
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
        this._score = 0;
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
        this._spritesheetName = '';
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
        this._energy = 0;
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
        this._score = 0;
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
     *
     * @throws SpritePrototypeLoadError
     * @throws SpritePrototypeParseError
     */
    private async loadFromFile(fpath: string, fname: string): Promise<this> {
        let bin: PkBinary;
        // this->Uusi();
        // Ladataan itse sprite-tiedosto
        
        // Save location
        this.fpath = fpath;
        this.fname = fname;
        
        // Load the sprite descriptor from the provided location
        // If this fails, raise the error
        try {
            bin = await this._context.fs.getBinaryX(pathJoin(fpath, fname));
        } catch (err) {
            if (err instanceof AssetFetchError)
                throw new SpritePrototypeLoadError(`Unable to get the sprite descriptor {${ fname }}.`, err);
            throw err;
        }
        
        // Get the version from the descriptor
        const version = bin.streamRead8CStr(4);
        
        // According to the version, parse properly
        // The file follows standard c-struct serialization
        let deserializeFn: (bin: PkBinary) => void;
        switch (version) {
            case '1.0':
                //     PK2Sprite_Prototyyppi10 proto;
                //     tiedosto->read ((char *)&proto, sizeof (proto));
                //     this->SetProto10(proto);
                //     strcpy(this->versio,versio);
                //     strcpy(this->tiedosto,tiedoston_nimi);
                throw new Error('Sprite prototypes 1.0 are not yet implemented.');
            case '1.1':
                //     PK2Sprite_Prototyyppi11 proto;
                //     tiedosto->read ((char *)&proto, sizeof (proto));
                //     this->SetProto11(proto);
                //     strcpy(this->versio,versio);
                //     strcpy(this->tiedosto,tiedoston_nimi);
                throw new Error('Sprite prototypes 1.1 are not yet implemented.');
            case '1.2':
                deserializeFn = this.loadSerialized12;
                break;
            case '1.3':
                deserializeFn = this.loadSerialized13;
                break;
        }
        
        try {
            deserializeFn.call(this, bin);
        } catch (err) {
            throw new SpritePrototypeParseError(`Unable to parse contents of the sprite descriptor {${ fname }}.`, err);
        }
        
        // For debug possible errors
        Log.dg(
            [`[SpritePrototype] Loaded descriptor for sprite "${ this.fname }"`],
            [`Version: ${ this._version }`],
            [`Max jump: ${ this._maxJump }`],
            [`Max speed: ${ this._maxSpeed }`],
            [`Energy: ${ this._energy }`],
            [`Weight: ${ this._weight }`],
            [`Frames: ${ this._frameCount }`],
            [`Animations: [${ this._animaatiot.join(',') }]`],
            [`Behaviours: [${ this._AI.filter(ai => ai != 0).map(ai => EAi[ai]).join(', ') }]`],
            [`Sounds: [${ this._aanitiedostot.filter(sfx => sfx != null).join(', ') }]`]
        );
        
        // Get the spritesheet bitmap
        // The same spritesheet can be used by multiple sprites, so let's use cache
        let bitmap: PkPaletteBitmapResource;
        try {
            bitmap = await this._context.fs.getPaletteBitmap(pathJoin(fpath, this._spritesheetName));
            //bitmap.makeColorTransparent();
        } catch (err) {
            // Register and notify the error, but don't raise it
            err = new SpritePrototypeMinorError(`Unable to get spritesheet bitmap for sprite {${ this.name }}.`, err);
            this._errorList.push(err);
            Log.w('[SpritePrototype]', err);
        }
        
        // The remaining tasks are only done if the bitmap was succesfully loaded
        if (bitmap != null) {
            // //Set diferent colors
            // BYTE *buffer = NULL;
            // DWORD leveys;
            // BYTE vari;
            // int x,y,w,h;
            
            // TODO
            // if (this._vari !== EColor.VARI_NORMAALI) { //Change sprite colors
            //     bitmap = bitmap.clone();
            //
            //     for (let j = 0; j < bitmap.height; j++) {
            //         for (let i = 0; i < bitmap.width; i++) {
            //             const index = bitmap.getPixelIndex(i, j);
            //             if (index != 255) {
            //                 bitmap.setPixelIndex(i, j, (index % 32) + this._vari);
            //             }
            //         }
            //     }
            // }
            
            // Get each animation frame of the sprite from the spritesheet ¬
            
            // Start point is the specified in the descriptor
            let frame_x = this._kuva_x;
            let frame_y = this._kuva_y;
            
            for (let f = 0; f < this._frameCount; f++) {
                if (frame_x + this._frameWidth > 640) {
                    frame_y += this._frameHeight + 3;
                    frame_x = this._kuva_x;
                }
                
                // Get each frame slicing the spritesheet
                // Flipped frames are generated dynamically
                try {
                    this._frames[f] = bitmap
                        .crop(PkRectangle.$(frame_x, frame_y, this._frameWidth, this._frameHeight))
                        .getTexture();
                } catch (err) {
                    // Register and notify the error, but don't raise it
                    err = new SpritePrototypeMinorError(`Unable to get frame {${ f }} for sprite {${ this.name }}.`, err);
                    this._errorList.push(err);
                    Log.w('[SpritePrototype]', err);
                }
                
                frame_x += this._frameWidth + 3;
            }
        }
        
        // Load sprite sounds
        await this._loadSounds();
        
        return this;
    }
    
    /**
     * SDL: Part of PK2::SpriteSystem::protot_get
     * @private
     */
    private async _loadSounds(): Promise<void> {
        for (let i = 0; i < MAX_AANIA; i++) {
            const fname = this.getSoundName(i);
            
            if (fname != null) {
                // Possible locations
                const fpaths = [
                    //> Next to descriptor (.spr)
                    this.path,
                    //> 🧍/episodeid/sprites/
                    ...(this._context.episode.isCommunity() ? [pathJoin(this._context.episode.homePath, 'sprites')] : []),
                    //> 🏠/sprites/
                    pathJoin(RESOURCES_PATH, 'sprites')];
                
                try {
                    this._aanet[i] = await this._context.gameStuff.fetchSound(fpaths.map(fpath => pathJoin(fpath, fname)));
                } catch (err) {
                    // Register and notify the error, but don't raise it
                    err = new SpritePrototypeMinorError(`Unable to get sound {${ i }}:{${ fname }} for sprite {${ this.name }}.`, err);
                    this._errorList.push(err);
                    Log.w('[SpritePrototype]', err);
                }
            }
        }
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
    
    /**
     * SDL: PK2Sprite_Prototyyppi::SetProto12.
     *
     * @param stream
     */
    private loadSerialized12(stream: PkBinary): void {
        this._type = stream.streamReadUint32() as ESpriteType;
        this._spritesheetName = stream.streamReadCStr(13);
        for (let i = 0; i < 7; i++) {   // <- 13*7 = 91 B
            this._aanitiedostot[i] = ifempty(stream.streamReadCStr(13));
        }
        for (let i = 0; i < 7; i++) {   // <- 4*7 = 28 B
            const sfx = stream.streamReadInt(4);
            // All has to be -1, any other thing will be overwriten when load sounds
            this._aanet[i] = sfx != -1 ? sfx : null;
        }
        
        this._frameCount = stream.streamReadByte();
        for (let i = 0; i < 20; i++) {   // <- 12*20 = 240 B
            this._animaatiot[i] = SpriteAnimation.fromSerialized(stream);
        }
        this._animaatioita = stream.streamReadUint8();
        this._frameRate = stream.streamReadUint8();
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
        this._energy = stream.streamReadInt(4);
        this._causedDamage = stream.streamReadInt(4);
        this._causedDamageType = stream.streamReadUint8();
        this._suojaus = stream.streamReadUint8();
        stream.streamOffset += 2;                                 // <- 2 bytes padding for struct alignment
        this._score = stream.streamReadInt(4);
        for (let i = 0; i < 5; i++) {
            this._AI[i] = stream.streamReadUint32() as EAi;
        }
        this._maxJump = stream.streamReadUint8();
        this._maxSpeed = stream.streamReadUint8();
        stream.streamOffset += 2;                                 // <- 3 bytes padding for struct alignment
        this._latausaika = stream.streamReadInt(4);
        this._vari = stream.streamReadUint8();
        this._obstacle = stream.streamReadBool();
        stream.streamOffset += 2;                                 // <- 2 bytes padding for struct alignment
        this._tuhoutuminen = stream.streamReadInt(4);
        this._isKey = stream.streamReadBool();
        this._shakes = stream.streamReadBool();
        this._droppedBonusCount = stream.streamReadUint8();
        stream.streamOffset++;                                    // <- 1 byte padding for struct alignment
        this._hyokkays1_aika = stream.streamReadInt(4);
        this._hyokkays2_aika = stream.streamReadInt(4);
        this._pallarx_kerroin = stream.streamReadInt(4);
        
        this._morphProtoName = ifempty(stream.streamReadCStr(13));
        this._bonusProtoName = ifempty(stream.streamReadCStr(13));
        this._ammo1ProtoName = ifempty(stream.streamReadCStr(13));
        this._ammo2ProtoName = ifempty(stream.streamReadCStr(13));
        
        this._collidesWithBlocks = stream.streamReadBool();
        stream.streamOffset += 3;                                 // <- 2 bytes padding for struct alignment
        
        this._aani_frq = stream.streamReadUint32();
        this._random_frq = stream.streamReadBool();
        
        this._este_ylos = stream.streamReadBool();
        this._este_alas = stream.streamReadBool();
        this._este_oikealle = stream.streamReadBool();
        this._este_vasemmalle = stream.streamReadBool();
    }
    
    /**
     * SDL: PK2Sprite_Prototyyppi::SetProto13.
     *
     * @param stream
     */
    private loadSerialized13(stream: PkBinary): void {
        this._type = stream.streamReadUint32() as ESpriteType;
        this._spritesheetName = stream.streamReadCStr(100);
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
        this._animaatioita = stream.streamReadUint8();
        this._frameRate = stream.streamReadUint8();
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
        this._energy = stream.streamReadInt(4);
        this._causedDamage = stream.streamReadInt(4);
        this._causedDamageType = stream.streamReadUint8();
        this._suojaus = stream.streamReadUint8();
        stream.streamOffset += 2;                                 // <- 2 bytes padding for struct alignment
        this._score = stream.streamReadInt(4);
        for (let i = 0; i < 10; i++) {
            this._AI[i] = stream.streamReadUint32() as EAi;
        }
        this._maxJump = stream.streamReadUint8();
        stream.streamOffset += 3;                                 // <- 3 bytes padding for struct alignment
        this._maxSpeed = stream.streamReadDouble(8);
        this._latausaika = stream.streamReadInt(4);
        this._vari = stream.streamReadUint8();
        this._obstacle = stream.streamReadBool();
        stream.streamOffset += 2;                                 // <- 2 bytes padding for struct alignment
        this._tuhoutuminen = stream.streamReadInt(4);
        this._isKey = stream.streamReadBool();
        this._shakes = stream.streamReadBool();
        this._droppedBonusCount = stream.streamReadUint8();
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
        this._aani_frq = stream.streamReadUint32();
        this._random_frq = stream.streamReadBool();
        
        this._este_ylos = stream.streamReadBool();
        this._este_alas = stream.streamReadBool();
        this._este_oikealle = stream.streamReadBool();
        this._este_vasemmalle = stream.streamReadBool();
        
        this._lapinakyvyys = stream.streamReadUint8();
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
        return this.fname;
    }
    public get path(): string {
        return this.fpath;
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
    public getFrame(i: int): NewTexture<PkPaletteBitmapResource> {
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
    
    /**
     * Sprite "lifes"; how many hits it can take.<br>
     * SRC: energia
     */
    public get energy(): int {
        return this._energy;
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
    
    /**
     * Score value of this sprite.<br>
     * For example, it's the score given by a bonus sprite when player takes it.<br>
     * SRC: pisteet
     */
    public get score(): number {
        return this._score;
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

export class SpritePrototypeLoadError extends PkError {
}

export class SpritePrototypeParseError extends PkError {
}

class SpritePrototypeMinorError extends PkError {
}

export type TSpriteProtoCode = CBYTE;

