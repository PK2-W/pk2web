import { PK2KARTTA_KARTTA_LEVEYS, PK2KARTTA_KARTTA_KORKEUS, PK2Map } from '@game/map/PK2Map';
import { Sprite } from '@game/sprite/Sprite';
import { SpritePrototype, EProtoType } from '@game/sprite/SpritePrototype';
import { MAX_SPRITES, MAX_SPRITE_TYPES, MAX_PROTOTYYPPEJA } from '../../support/constants';
import { int, CVect, cvect, rand } from '../../support/types';

export class SpriteManager {
    private _protot: CVect<SpritePrototype> = cvect(MAX_SPRITE_TYPES);
    // is a pool!!
    private _spritet: CVect<Sprite> = cvect(MAX_SPRITES);
    private _taustaspritet: CVect<int> = cvect(MAX_SPRITES);
    
    private _player: Sprite;
    
    private next_free_prototype: int = 0;
    
    
    public constructor() {
        this.clear();
    }
    
    
    public get(i: int) {
        return this._spritet[i];
    }
    
    // private	int  protot_get(char *polku, char *tiedosto);
    
    // private	int  protot_get_sound(char *polku, char *tiedosto);
    // private	void protot_get_transformation(int i);
    // private	void protot_get_bonus(int i);
    // private	void protot_get_ammo1(int i);
    // private	void protot_get_ammo2(int i);
    
    private _addBg(index: int): void {
        for (let i = 0; i < MAX_SPRITES; i++) {
            if (this._taustaspritet[i] === -1) {
                this._taustaspritet[i] = index;
                return;
            }
        }
    }
    
    /**
     * Source: PK2::SpriteSystem::protot_get_all()
     *
     * @param map
     */
    public loadPrototypes(map: PK2Map) {
        //     char polku[PE_PATH_SIZE];
        //     int viimeinen_proto;
        
        for (let i = 0; i < MAX_SPRITE_TYPES; i++) {
            //         if (strcmp(kartta->protot[i],"") != 0){
            //             viimeinen_proto = i;
            //             strcpy(polku,"");
            //             PK_Load_EpisodeDir(polku);
            
            if (this.loadProto(polku, map.getProto(i)) != 0) {
                //                 strcpy(polku,"sprites/");
                //                 if (protot_get(polku,kartta->protot[i])!=0){
                //                     printf("PK2     - Can't load sprite %s. It will not appear.", kartta->protot[i]);
                //                     next_free_prototype++;
                //                 }
            }
            //         } else
            //             next_free_prototype++;
        }
        
        //     next_free_prototype = viimeinen_proto+1;
        
        //     for (int i=0;i<MAX_PROTOTYYPPEJA;i++){
        //         protot_get_transformation(i);
        //         protot_get_bonus(i);
        //         protot_get_ammo1(i);
        //         protot_get_ammo2(i);
        //     }
    }
    
    /**
     * Source: PK2::SpriteSystem::protot_get
     */
    private loadProto(path: string, file: string): void {
        //     char aanipolku[255];
        //     char testipolku[255];
        //     strcpy(aanipolku,polku);
        
        // Check if have space
        if (next_free_prototype >= MAX_SPRITE_TYPES)
            throw 2; //TODO
        
        // Check if it can be loaded
        // TODO try catch (return -1)
        this._protot[next_free_prototype] = SpritePrototype.loadFromFile(ctx, polku, tiedosto);
        
        this._protot[next_free_prototype].indeksi = next_free_prototype;
        
        //     //Load sounds
        //     for (int i=0;i<MAX_AANIA;i++){
        //
        //     if (strcmp(protot[next_free_prototype].aanitiedostot[i],"")!=0){
        //
        //     strcpy(testipolku,aanipolku);
        //     strcat(testipolku,"/");
        //     strcat(testipolku,protot[next_free_prototype].aanitiedostot[i]);
        //
        //     if (PK_Check_File(testipolku))
        //     protot[next_free_prototype].aanet[i] = protot_get_sound(aanipolku,protot[next_free_prototype].aanitiedostot[i]);
        //     else{
        //     getcwd(aanipolku, PE_PATH_SIZE);
        //     strcat(aanipolku,"/sprites/");
        //
        //     strcpy(testipolku,aanipolku);
        //     strcat(testipolku,"/");
        //     strcat(testipolku,protot[next_free_prototype].aanitiedostot[i]);
        //
        //     if (PK_Check_File(testipolku))
        //     protot[next_free_prototype].aanet[i] = protot_get_sound(aanipolku,protot[next_free_prototype].aanitiedostot[i]);
        // }
        // }
        // }
        //
        // next_free_prototype++;
        //
        // return 0;
    }
    
    // 	void protot_clear_all();
    
    public clear(): void {
        for (let i = 0; i < MAX_SPRITES; i++) {
            // this._spritet[i] = PK2Sprite(); // TODO
            this._taustaspritet[i] = -1;
        }
        
        this._player = null;
    }
    
    /**
     * Adds the sprites from the specified map to the sprite system.
     * Source: PK2Kartta::Place_Sprites.
     */
    public addMapSprites(map: PK2Map) {
        this.clear();
        this.add(map.pelaaja_sprite, 1, 0, 0, MAX_SPRITES, false);
        
        let protoId: int;
        
        for (let x = 0; x < PK2KARTTA_KARTTA_LEVEYS; x++) {
            for (let y = 0; y < PK2KARTTA_KARTTA_KORKEUS; y++) {
                protoId = map.getSprite(x, y);
                
                if (protoId !== 255 && this._protot[protoId].height > 0) {
                    this.add(protoId, 0, x * 32, y * 32 - this._protot[protoId].height + 32, MAX_SPRITES, false);
                }
            }
        }
        
        this._sortBg();
    }
    
    public add(protoId: int, isPlayer: int, x: number, y: number, emo: int, isBonus: boolean) {
        const proto = this._protot[protoId];
        let lisatty: boolean = false;
        let i: int = 0;
        
        while (!lisatty && i < MAX_SPRITES) {
            let sprite = this._spritet[i];
            
            if (sprite.piilota) {
                sprite = Sprite(proto, isPlayer, false, x, y); // TODO: Ojo! los reusa sin destruirlo porque es un pool
                
                if (isPlayer) this._player = sprite;
                
                if (isBonus) { //If it is a bonus dropped by enemy
                    sprite.x += sprite.proto.width;
                    sprite.y += sprite.proto.height / 2;
                    sprite.initialX = sprite.x;
                    sprite.initialY = sprite.y;
                    sprite.jumpTimer = 1;
                    sprite.a = rand() % 2 - rand() % 4;
                    sprite.knockTimer = 35; //25
                } else {
                    sprite.x = x + 16 + 1;
                    sprite.y += sprite.proto.height / 2;
                    sprite.initialX = sprite.x;
                    sprite.initialY = sprite.y;
                }
                
                if (proto.type === EProtoType.TYYPPI_TAUSTA)
                    this._addBg(i);
                
                if (emo !== MAX_SPRITES)
                    sprite.emosprite = emo;
                else
                    sprite.emosprite = i;
                
                lisatty = true;
            } else {
                i++;
            }
        }
    }
    
    private _addAmmo(proto: SpritePrototype, isPlayer: int, x: number, y: number, emo: int) {
        let lisatty: boolean = false;
        let i = 0;
        
        while (!lisatty && i < MAX_SPRITES) {
            let sprite = this._spritet[i];
            
            if (sprite.piilota) {
                sprite = Sprite(proto, isPlayer, false, x/*-proto.leveys/2*/, y);   // TODO: Ojo! los reusa sin destruirlo porque es un pool
                
                //sprite.x += sprite.proto.leveys;
                //sprite.y += sprite.proto.korkeus/2;
                
                //         if (proto.Onko_AI(AI_HEITTOASE)){
                //             if ((int)spritet[emo].a == 0){
                //                 // Jos "ampuja" on pelaaja tai ammuksen nopeus on nolla
                //                 if (spritet[emo].pelaaja == 1 || sprite.tyyppi->max_nopeus == 0){
                //                     if (!spritet[emo].flip_x)
                //                         sprite.a = sprite.tyyppi->max_nopeus;
                //                 else
                //                     sprite.a = -sprite.tyyppi->max_nopeus;
                //                 }
                //             else{ // tai jos kyseess� on vihollinen
                //                     if (!spritet[emo].flip_x)
                //                         sprite.a = 1 + rand()%(int)sprite.tyyppi->max_nopeus;
                //                 else
                //                     sprite.a = -1 - rand()%-(int)sprite.tyyppi->max_nopeus;
                //                 }
                //             }
                //         else{
                //                 if (!spritet[emo].flip_x)
                //                     sprite.a = sprite.tyyppi->max_nopeus + spritet[emo].a;
                //             else
                //                 sprite.a = -sprite.tyyppi->max_nopeus + spritet[emo].a;
                //
                //                 //sprite.a = spritet[emo].a * 1.5;
                //
                //             }
                //
                //             sprite.hyppy_ajastin = 1;
                //         }
                //         else
                //         if (proto.Onko_AI(AI_MUNA)){
                //             sprite.y = spritet[emo].y+10;
                //             sprite.a = spritet[emo].a / 1.5;
                //         }
                //         else{
                //             if (!spritet[emo].flip_x)
                //                 sprite.a = sprite.tyyppi->max_nopeus;
                //         else
                //             sprite.a = -sprite.tyyppi->max_nopeus;
                //         }
                //
                //         if (emo != MAX_SPRITEJA){
                //             sprite.emosprite = emo;
                //             sprite.vihollinen = spritet[emo].vihollinen;
                //         }
                //         else{
                //             sprite.emosprite = i;
                //         }
                //
                //         if (proto.tyyppi == TYYPPI_TAUSTA)
                //             add_bg(i);
                //
                //         lisatty = true;
            } else {
                i++;
            }
        }
    }
    
    private _sortBg(): void {
        let lopeta: boolean = false;
        let l: int = 1;
        let vali: int;
        
        while (l < MAX_SPRITES && !lopeta) {
            lopeta = true;
            
            for (let i = 0; i < MAX_SPRITES - 1; i++) {
                if (this._taustaspritet [i] === -1 || this._taustaspritet [i + 1] === -1) {
                    i = MAX_SPRITES;
                } else {
                    if (this._spritet[this._taustaspritet[i]].proto.pallarx_kerroin > this._spritet[this._taustaspritet [i + 1]].proto.pallarx_kerroin) {
                        vali = this._taustaspritet[i];
                        this._taustaspritet[i] = this._taustaspritet[i + 1];
                        this._taustaspritet[i + 1] = vali;
                        lopeta = false;
                    }
                }
            }
            l++;
        }
    }
    
    // 	void start_directions();
    
    
    ///  Accessors  ///
    
    /**
     * Returns the player sprite.
     */
    public get player(): Sprite {
        return this._player;
    }
}

export enum EAi { //AI
    AI_EI,
    AI_KANA,
    AI_MUNA,
    AI_PIKKUKANA,
    AI_BONUS,
    AI_HYPPIJA,
    AI_PERUS,
    AI_KAANTYY_ESTEESTA_HORI,
    AI_VAROO_KUOPPAA,
    AI_RANDOM_SUUNNANVAIHTO_HORI,
    AI_RANDOM_HYPPY,
    AI_SEURAA_PELAAJAA,
    AI_RANDOM_ALOITUSSUUNTA_HORI,
    AI_SEURAA_PELAAJAA_JOS_NAKEE,
    AI_MUUTOS_JOS_ENERGIAA_ALLE_2,
    AI_MUUTOS_JOS_ENERGIAA_YLI_1,
    AI_ALOITUSSUUNTA_PELAAJAA_KOHTI,
    AI_AMMUS,
    AI_NONSTOP,
    AI_HYOKKAYS_1_JOS_OSUTTU,
    AI_POMMI,
    AI_HYOKKAYS_1_JOS_PELAAJA_EDESSA,
    AI_HYOKKAYS_1_JOS_PELAAJA_ALAPUOLELLA,
    AI_VAHINGOITTUU_VEDESTA,
    AI_HYOKKAYS_2_JOS_PELAAJA_EDESSA,
    AI_TAPA_KAIKKI,
    AI_KITKA_VAIKUTTAA,
    AI_PIILOUTUU,
    AI_PALAA_ALKUUN_X,
    AI_PALAA_ALKUUN_Y,
    AI_TELEPORTTI,
    
    AI_HEITTOASE = 35,
    AI_TIPPUU_TARINASTA,
    AI_VAIHDA_KALLOT_JOS_TYRMATTY,
    AI_VAIHDA_KALLOT_JOS_OSUTTU,
    AI_TUHOUTUU_JOS_EMO_TUHOUTUU,
    
    AI_LIIKKUU_X_COS = 41,
    AI_LIIKKUU_Y_COS,
    AI_LIIKKUU_X_SIN,
    AI_LIIKKUU_Y_SIN,
    AI_LIIKKUU_X_COS_NOPEA,
    AI_LIIKKUU_Y_SIN_NOPEA,
    AI_LIIKKUU_X_COS_HIDAS,
    AI_LIIKKUU_Y_SIN_HIDAS,
    AI_LIIKKUU_Y_SIN_VAPAA,
    
    AI_RANDOM_KAANTYMINEN,
    AI_HYPPY_JOS_PELAAJA_YLAPUOLELLA,
    AI_MUUTOS_AJASTIN,
    
    AI_TIPPUU_JOS_KYTKIN1_PAINETTU,
    AI_TIPPUU_JOS_KYTKIN2_PAINETTU,
    AI_TIPPUU_JOS_KYTKIN3_PAINETTU,
    
    AI_LIIKKUU_ALAS_JOS_KYTKIN1_PAINETTU,
    AI_LIIKKUU_YLOS_JOS_KYTKIN1_PAINETTU,
    AI_LIIKKUU_VASEMMALLE_JOS_KYTKIN1_PAINETTU,
    AI_LIIKKUU_OIKEALLE_JOS_KYTKIN1_PAINETTU,
    AI_LIIKKUU_ALAS_JOS_KYTKIN2_PAINETTU,
    AI_LIIKKUU_YLOS_JOS_KYTKIN2_PAINETTU,
    AI_LIIKKUU_VASEMMALLE_JOS_KYTKIN2_PAINETTU,
    AI_LIIKKUU_OIKEALLE_JOS_KYTKIN2_PAINETTU,
    AI_LIIKKUU_ALAS_JOS_KYTKIN3_PAINETTU,
    AI_LIIKKUU_YLOS_JOS_KYTKIN3_PAINETTU,
    AI_LIIKKUU_VASEMMALLE_JOS_KYTKIN3_PAINETTU,
    AI_LIIKKUU_OIKEALLE_JOS_KYTKIN3_PAINETTU,
    
    AI_KAANTYY_ESTEESTA_VERT = 70,
    AI_RANDOM_ALOITUSSUUNTA_VERT,
    AI_ALOITUSSUUNTA_PELAAJAA_KOHTI_VERT,
    AI_KIIPEILIJA,
    AI_KIIPEILIJA2,
    AI_PAKENEE_PELAAJAA_JOS_NAKEE,
    AI_UUSI_JOS_TUHOUTUU,
    
    AI_NUOLI_VASEMMALLE,
    AI_NUOLI_OIKEALLE,
    AI_NUOLI_YLOS,
    AI_NUOLI_ALAS,
    AI_NUOLET_VAIKUTTAVAT,
    
    AI_TAUSTA_KUU = 101,
    AI_TAUSTA_LIIKKUU_VASEMMALLE,
    AI_TAUSTA_LIIKKUU_OIKEALLE,
    
    AI_BONUS_AIKA = 120,
    AI_BONUS_NAKYMATTOMYYS,
    AI_BONUS_SUPERHYPPY,
    AI_BONUS_SUPERTULITUS,
    AI_BONUS_SUPERVAUHTI,
    
    AI_MUUTOS_JOS_OSUTTU = 129,
    AI_SEURAA_PELAAJAA_VERT_HORI,
    AI_SEURAA_PELAAJAA_JOS_NAKEE_VERT_HORI,
    AI_RANDOM_LIIKAHDUS_VERT_HORI,
    AI_SAMMAKKO1,
    AI_SAMMAKKO2,
    AI_SAMMAKKO3,
    AI_HYOKKAYS_2_JOS_OSUTTU,
    AI_HYOKKAYS_1_NONSTOP,
    AI_HYOKKAYS_2_NONSTOP,
    AI_KAANTYY_JOS_OSUTTU,
    AI_EVIL_ONE,
    
    AI_INFO1 = 201,
    AI_INFO2,
    AI_INFO3,
    AI_INFO4,
    AI_INFO5,
    AI_INFO6,
    AI_INFO7,
    AI_INFO8,
    AI_INFO9,
    AI_INFO10,
    AI_INFO11,
    AI_INFO12,
    AI_INFO13,
    AI_INFO14,
    AI_INFO15,
    AI_INFO16,
    AI_INFO17,
    AI_INFO18,
    AI_INFO19
}
