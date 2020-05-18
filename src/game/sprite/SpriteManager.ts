import { GameContext } from '@game/game/GameContext';
import { PK2KARTTA_KARTTA_LEVEYS, PK2KARTTA_KARTTA_KORKEUS, PK2Map } from '@game/map/PK2Map';
import { ESpriteType } from '@game/enum/ESpriteType';
import { PK2Sprite } from '@game/sprite/PK2Sprite';
import { SpritePrototype, TSpriteProtoCode } from '@game/sprite/SpritePrototype';
import { Log } from '@ng/support/log/LoggerImpl';
import { pathJoin, ifnul } from '@ng/support/utils';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';
import { EventEmitter } from '@vendor/eventemitter3';
import { MAX_SPRITES, MAX_SPRITE_TYPES, MAX_AANIA, RESOURCES_PATH } from '../../support/constants';
import { OutOfBoundsError } from '../../support/error/OutOfBoundsError';
import { int, CVect, cvect, rand } from '../../support/types';

export class SpriteManager extends EventEmitter {
    private readonly _ctx: GameContext;
    
    /**
     * List of prototypes.<br>
     * List indexes are the same indexes used in sprite matrices to point to the requiered prototype.
     */
    private _protot: SpritePrototype[];
    /** Sprites pool. */
    private _sprites: CVect<PK2Sprite> = cvect(MAX_SPRITES);
    
    private _taustaspritet: CVect<int> = cvect(MAX_SPRITES);
    
    private _player: PK2Sprite;
    private _nextFreeProtoIndex: int = 0;
    
    
    public constructor(ctx: GameContext) {
        super();
        
        this._ctx = ctx;
        
        this._protot = [];
        
        this.clear();
    }
    
    
    public get(i: int) {
        return ifnul(this._sprites[i]);
    }
    
    public getPrototype(name: string) {
        for (let proto of this._protot) {
            if (proto.name === name) {
                return proto;
            }
        }
        
        return null;
    }
    
    public getPrototypeAt(i: int) {
        return ifnul(this._protot[i]);
    }
    
    // private	int  protot_get(char *polku, char *tiedosto);
    
    // private	int  protot_get_sound(char *polku, char *tiedosto);
    // private	void protot_get_transformation(int i);
    // private	void protot_get_bonus(int i);
    // private	void protot_get_ammo1(int i);
    // private	void protot_get_ammo2(int i);
    
    private _addBg(index: int): void {
        for (let i = 0; i < MAX_SPRITES; i++) {
            if (this._taustaspritet[i] == null) {
                this._taustaspritet[i] = index;
                return;
            }
        }
    }
    
    /**
     * SDL: PK2::SpriteSystem::protot_get_all()
     *
     * @param map
     */
    public async loadPrototypes(map: PK2Map, tmpEpidoseName: string) {
        //     char polku[PE_PATH_SIZE];
        let lastProtoIndex: int;
        
        for (let i = 0; i < MAX_SPRITE_TYPES; i++) {
            const protoName = map.getProto(i);
            let proto;
            
            if (protoName !== '') {
                lastProtoIndex = i;
                // 🏠/episodes/episodename/protoname
                let path = pathJoin('episodes', tmpEpidoseName);
                
                try {
                    proto = await this.loadProto(path, protoName);
                    proto.assignIndex(this._nextFreeProtoIndex);
                    this._protot[this._nextFreeProtoIndex] = proto;
                } catch (err) {
                    // TODO specify error
                    try {
                        // 🏠/sprites/protoname
                        proto = await this.loadProto('sprites', protoName);
                        proto.assignIndex(this._nextFreeProtoIndex);
                        this._protot[this._nextFreeProtoIndex] = proto;
                        
                    } catch (err) {
                        Log.w(`[SpriteManager] Can't load sprite ${ protoName }. It will not appear.`);
                        Log.w(err);
                    }
                }
            }
            
            this._nextFreeProtoIndex++;
        }
        
        this._nextFreeProtoIndex = lastProtoIndex + 1;
        
        Log.d('[SpriteManager] Loading child prototypes...');
        
        for (let proto of this._protot) {
            await this.loadMorphProtoFor(proto);
            await this.loadBonusProtoFor(proto);
            await this.loadAmmo1ProtoFor(proto);
            await this.loadAmmo2ProtoFor(proto);
        }
    }
    
    /**
     * SDL: PK2::SpriteSystem::protot_get
     */
    private async loadProto(fpath: string, fname: string): Promise<SpritePrototype> {
        let proto: SpritePrototype;
        //     char aanipolku[255];
        //     char testipolku[255];
        //     strcpy(aanipolku,polku);
        
        // Check if have space // TODO really necessary?
        if (this._nextFreeProtoIndex >= MAX_SPRITE_TYPES)
            throw new OutOfBoundsError('');
        
        // Check if it can be loaded, else error is elevated
        proto = await SpritePrototype.loadFromFile(this._ctx, fpath, fname);
        
        //Load sounds
        for (let i = 0; i < MAX_AANIA; i++) {
            //     if (strcmp(protot[_nextFreeProtoIndex].aanitiedostot[i],"")!=0){
            
            // Log.l(fpath + '/' + proto.getSoundName(i));
            // Log.l(pathJoin(RESOURCES_PATH, 'sprites', proto.getSoundName(i));
            
            // debugger;
            
            //     if (PK_Check_File(testipolku))
            //     protot[_nextFreeProtoIndex].aanet[i] = protot_get_sound(aanipolku,protot[_nextFreeProtoIndex].aanitiedostot[i]);
            const fname = proto.getSoundName(i);
            if (fname != null) {
                proto._aanet[i] = await PkAssetTk.getSound(pathJoin(RESOURCES_PATH, fpath, fname));
                
                //     else{
                //     getcwd(aanipolku, PE_PATH_SIZE);
                //     strcat(aanipolku,"/sprites/");
                //
                //     strcpy(testipolku,aanipolku);
                //     strcat(testipolku,"/");
                //     strcat(testipolku,protot[_nextFreeProtoIndex].aanitiedostot[i]);
                //
                //     if (PK_Check_File(testipolku))
                //     protot[_nextFreeProtoIndex].aanet[i] = protot_get_sound(aanipolku,protot[_nextFreeProtoIndex].aanitiedostot[i]);
                // }
                // }
            }
        }
        
        return proto;
    }
    
    /**
     * CPP: PK_Prototyyppi_Aseta_Muutos_Sprite
     * SDL: PK2::SpriteSystem::protot_get_transformation
     *
     * @param proto
     */
    public async loadMorphProtoFor(proto: SpritePrototype): Promise<void> {
        if (proto.morphProtoName != null) {
            // If morph sprite has been already loaded, get it from the list and assign
            proto.morphProto = this.getPrototype(proto.morphProtoName);
            
            // If the sprite hasn't been loaded yet,
            if (proto.morphProto == null) {
                // Load from file and assign
                proto.morphProto = await SpritePrototype.loadFromFile(this._ctx, proto.path, proto.morphProtoName);
                // Save it
                this._protot.push(proto.morphProto);
            }
        }
    }
    
    /**
     * CPP: PK_Prototyyppi_Aseta_Bonus_Sprite
     * SDL: PK2::SpriteSystem::protot_get_bonus
     *
     * @param proto
     */
    public async loadBonusProtoFor(proto: SpritePrototype): Promise<void> {
        if (proto.bonusProtoName != null) {
            // If bonus sprite has been already loaded, get it from the list and assign
            proto.bonusProto = this.getPrototype(proto.bonusProtoName);
            
            // If the sprite hasn't been loaded yet,
            if (proto.bonusProto == null) {
                // Load from file and assign
                try {
                    proto.bonusProto = await SpritePrototype.loadFromFile(this._ctx, proto.path, proto.bonusProtoName);
                } catch (err) {
                    debugger
                    console.log('');
                } // Save it
                this._protot.push(proto.bonusProto);
            }
        }
    }
    
    /**
     * CPP: PK_Prototyyppi_Aseta_Ammus1_Sprite
     * SDL: PK2::SpriteSystem::protot_get_ammo1
     *
     * @param proto
     */
    public async loadAmmo1ProtoFor(proto: SpritePrototype): Promise<void> {
        if (proto.ammo1ProtoName != null) {
            // If ammo1 sprite has been already loaded, get it from the list and assign
            proto.ammo1Proto = this.getPrototype(proto.ammo1ProtoName);
            
            // If the sprite hasn't been loaded yet,
            if (proto.ammo1Proto == null) {
                // Load from file and assign
                proto.ammo1Proto = await SpritePrototype.loadFromFile(this._ctx, proto.path, proto.ammo1ProtoName);
                // Save it
                this._protot.push(proto.ammo1Proto);
            }
        }
    }
    
    /**
     * CPP: PK_Prototyyppi_Aseta_Ammus2_Sprite
     * SDL: PK2::SpriteSystem::protot_get_ammo2
     *
     * @param proto
     */
    public async loadAmmo2ProtoFor(proto: SpritePrototype): Promise<void> {
        if (proto.ammo2ProtoName != null) {
            // If ammo2 sprite has been already loaded, get it from the list and assign
            proto.ammo2Proto = this.getPrototype(proto.ammo2ProtoName);
            
            // If the sprite hasn't been loaded yet,
            if (proto.ammo2Proto == null) {
                // Load from file and assign
                proto.ammo2Proto = await SpritePrototype.loadFromFile(this._ctx, proto.path, proto.ammo2ProtoName);
                // Save it
                this._protot.push(proto.ammo2Proto);
            }
        }
    }
    
    
    // 	void protot_clear_all();
    
    public clear(): void {
        for (let i = 0; i < MAX_SPRITES; i++) {
            this._sprites[i] = new PK2Sprite();
            this._taustaspritet[i] = null;
        }
        
        this._player = null;
    }
    
    /**
     * Adds the sprites from the specified map to the sprite system.
     * SDL: PK2Kartta::Place_Sprites.
     */
    public addMapSprites(map: PK2Map) {
        this.clear();
        const playerId = map.getPlayerSprite();
        const playerProto = this.getPrototypeAt(playerId);
        this.addSprite(playerProto, true, 0, 0, null, false);
        
        for (let x = 0; x < PK2KARTTA_KARTTA_LEVEYS; x++) {
            for (let y = 0; y < PK2KARTTA_KARTTA_KORKEUS; y++) {
                const protoId: int = map.getSpriteCode(x, y);
                const proto = this.getPrototypeAt(protoId);
                
                if (proto != null && proto.height > 0) {
                    this.addSprite(proto, false, x * 32, y * 32 - proto.height + 32, null, false);
                }
            }
        }
        
        this.sortBg();
    }
    
    public addSprite(proto: SpritePrototype, isPlayer: boolean, x: number, y: number, parent: PK2Sprite, isBonus: boolean) {
        let lisatty: boolean = false;
        let i: int = 0;
        
        while (!lisatty && i < MAX_SPRITES) {
            let sprite = this._sprites[i];
            
            if (sprite.isDiscarded()) {
                sprite.reuseWith(proto, isPlayer, false, x, y);
                
                if (isPlayer) {
                    this._player = sprite;
                }
                
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
                
                sprite.parent = parent;
                
                // Add to the background index
                if (proto.type === ESpriteType.TYYPPI_TAUSTA) {
                    this._addBg(i);
                }
                
                // Add to the scene
                if (proto.type === ESpriteType.TYYPPI_TAUSTA) {
                    this.ctx.composition.addBgSprite(sprite);
                } else {
                    this.ctx.composition.addFgSprite(sprite);
                }
                
                // Listen for disposal
                sprite.once(PK2Sprite.EV_SPRITE_DISCARDED, this.onSpriteDiscarded.bind(this));
                
                lisatty = true;
            } else {
                i++;
            }
        }
    }
    
    private onSpriteDiscarded(sprite: PK2Sprite): void {
        // Remove from scene
        if (sprite.proto.type === ESpriteType.TYYPPI_TAUSTA) {
            this.ctx.composition.removeBgSprite(sprite);
        } else {
            this.ctx.composition.removeFgSprite(sprite);
        }
    }
    
    private addAmmo(proto: SpritePrototype, isPlayer: int, x: number, y: number, emo: int) {
        let lisatty: boolean = false;
        let i = 0;
        
        while (!lisatty && i < MAX_SPRITES) {
            let sprite = this._sprites[i];
            
            if (sprite.isDiscarded()) {
                sprite = PK2Sprite(proto, isPlayer, false, x/*-proto.leveys/2*/, y);   // TODO: Ojo! los reusa sin destruirlo porque es un pool
                
                //sprite.x += sprite.proto.leveys;
                //sprite.y += sprite.proto.korkeus/2;
                
                //         if (hasBehavior(AI_HEITTOASE)){
                //             if ((int)spritet[emo].a == 0){
                //                 // Jos "ampuja" on pelaaja tai ammuksen nopeus on nolla
                //                 if (spritet[emo].pelaaja == 1 || sprite.tyyppi->maxSpeed == 0){
                //                     if (!spritet[emo].flip_x)
                //                         sprite.a = sprite.tyyppi->maxSpeed;
                //                 else
                //                     sprite.a = -sprite.tyyppi->maxSpeed;
                //                 }
                //             else{ // tai jos kyseess� on vihollinen
                //                     if (!spritet[emo].flip_x)
                //                         sprite.a = 1 + rand()%(int)sprite.tyyppi->maxSpeed;
                //                 else
                //                     sprite.a = -1 - rand()%-(int)sprite.tyyppi->maxSpeed;
                //                 }
                //             }
                //         else{
                //                 if (!spritet[emo].flip_x)
                //                     sprite.a = sprite.tyyppi->maxSpeed + spritet[emo].a;
                //             else
                //                 sprite.a = -sprite.tyyppi->maxSpeed + spritet[emo].a;
                //
                //                 //sprite.a = spritet[emo].a * 1.5;
                //
                //             }
                //
                //             sprite.hyppy_ajastin = 1;
                //         }
                //         else
                //         if (hasBehavior(AI_MUNA)){
                //             sprite.y = spritet[emo].y+10;
                //             sprite.a = spritet[emo].a / 1.5;
                //         }
                //         else{
                //             if (!spritet[emo].flip_x)
                //                 sprite.a = sprite.tyyppi->maxSpeed;
                //         else
                //             sprite.a = -sprite.tyyppi->maxSpeed;
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
    
    private sortBg(): void {
        let lopeta: boolean = false;
        let l: int = 1;
        let vali: int;
        
        while (l < MAX_SPRITES && !lopeta) {
            lopeta = true;
            
            for (let i = 0; i < MAX_SPRITES - 1; i++) {
                if (this._taustaspritet[i] === null || this._taustaspritet[i + 1] == null) {
                    i = MAX_SPRITES;
                } else {
                    if (this._sprites[this._taustaspritet[i]].proto.pallarx_kerroin > this._sprites[this._taustaspritet [i + 1]].proto.pallarx_kerroin) {
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
    
    public startDirections(): void {
        for (let i = 0; i < MAX_SPRITES; i++) {
            let sprite = this._sprites[i];
            
            if (/*pelaaja_index >= 0 && pelaaja_index < MAX_SPRITEJA && */!sprite.isDiscarded()) {
                sprite.a = 0;
                
                if (sprite.hasBehavior(EAi.AI_RANDOM_ALOITUSSUUNTA_HORI)) {
                    while (sprite.a === 0) {
                        sprite.a = ((rand() % 2 - rand() % 2) * sprite.proto.maxSpeed) / 3.5; //2;
                    }
                }
                
                if (sprite.hasBehavior(EAi.AI_RANDOM_ALOITUSSUUNTA_VERT)) {
                    while (sprite.b === 0) {
                        sprite.b = ((rand() % 2 - rand() % 2) * sprite.proto.maxSpeed) / 3.5; //2;
                    }
                }
                
                if (sprite.hasBehavior(EAi.AI_ALOITUSSUUNTA_PELAAJAA_KOHTI)) {
                    
                    if (sprite.x < this.player.x)
                        sprite.a = sprite.proto.maxSpeed / 3.5;
                    
                    if (sprite.x > this.player.x)
                        sprite.a = (sprite.proto.maxSpeed * -1) / 3.5;
                }
                
                if (sprite.hasBehavior(EAi.AI_ALOITUSSUUNTA_PELAAJAA_KOHTI_VERT)) {
                    
                    if (sprite.y < this.player.y)
                        sprite.b = sprite.proto.maxSpeed / -3.5;
                    
                    if (sprite.y > this.player.y)
                        sprite.b = sprite.proto.maxSpeed / 3.5;
                }
            }
        }
    }
    
    public getKeysCount(): number {
        let code: TSpriteProtoCode;
        let proto: SpritePrototype;
        let keys = 0;
        
        // Iterate each sprite looking for keys
        for (let x = 0; x < PK2KARTTA_KARTTA_LEVEYS; x++) {
            for (let y = 0; y < PK2KARTTA_KARTTA_KORKEUS; y++) {
                code = this.ctx.map.getSpriteCode(x, y);
                
                if (code != null) {
                    proto = this._protot[code]; // TODO -> Estoy podría fallar
                    if (proto.isKey() && proto.isDestructible()) {
                        keys++;
                    }
                }
            }
        }
        
        return keys;
    }
    
    
    ///  Accessors  ///
    
    private get ctx(): GameContext {
        return this._ctx;
    }
    
    /**
     * Returns the player sprite.
     */
    public get player(): PK2Sprite {
        return this._player;
    }
    
    
    ///  Events  ///
    
    public onSpriteCreated(fn: (sprite: PK2Sprite) => void, context: any) {
        return this.on(Ev.SPRITE_CREATED, fn, context);
    }
    
    public getByPrototype(proto: SpritePrototype): PK2Sprite[] {
        return this._sprites.filter(s => s.proto === proto);
    }
    
    public getByType(type: ESpriteType): PK2Sprite[] {
        return this._sprites.filter(s => s.proto.type === type);
    }
}

enum Ev {
    SPRITE_CREATED = 'EV_SPRITE_CREATED'
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
    /** New if destroyed. */
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
