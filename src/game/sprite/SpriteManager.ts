import { EAi } from '@game/enum/EBehavior';
import { ESpriteType } from '@game/enum/ESpriteType';
import { GameContext } from '@game/game/GameContext';
import { PK2KARTTA_KARTTA_LEVEYS, PK2KARTTA_KARTTA_KORKEUS, LevelMap } from '@game/map/LevelMap';
import { Sprite } from '@game/sprite/Sprite';
import { SpritePrototype, TSpriteProtoCode, SpritePrototypeLoadError } from '@game/sprite/SpritePrototype';
import { int, CVect, cvect, rand } from '@game/support/types';
import { PkError } from '@ng/error/PkError';
import { Log } from '@ng/support/log/LoggerImpl';
import { pathJoin, ifnul, floor } from '@ng/support/utils';
import { MAX_SPRITES, MAX_SPRITE_TYPES, RESOURCES_PATH } from '@sp/constants';
import { OutOfBoundsError } from '@sp/error/OutOfBoundsError';
import { EventEmitter } from '@vendor/eventemitter3';

export class SpriteManager extends EventEmitter {
    private readonly _context: GameContext;
    
    /**
     * List of prototypes.<br>
     * List indexes are the same indexes used in sprite matrices to point to the requiered prototype.
     * SRC: protot
     */
    private readonly _prototypes: SpritePrototype[];
    /**
     * Sprites pool.
     */
    private _sprites: CVect<Sprite> = cvect(MAX_SPRITES);
    private _taustaspritet: CVect<int> = cvect(MAX_SPRITES);
    
    private _player: Sprite;
    private _nextFreeProtoIndex: int = 0;
    
    
    public constructor(ctx: GameContext) {
        super();
        
        this._context = ctx;
        
        this._prototypes = [];
        
        this.clear();
    }
    
    /**
     * Returns the sprite at the specified index.
     *
     * @param i - Index of the sprite to recover.
     */
    public get(i: number) {
        return this._sprites[i];
    }
    
    /**
     * Returns the sprite prototype with the specified name.<br>
     + If not found, NULL is returned.
     *
     * @param name - Name of the sprite prototype to recover.
     */
    public getPrototype(name: string) {
        for (let proto of this._prototypes) {
            if (proto.name === name) {
                return proto;
            }
        }
        return null;
    }
    
    /**
     * Returns the sprite prototype at the specified index.
     *
     * @param i - Index of the sprite prototype to recover.
     */
    public getPrototypeAt(i: int) {
        return ifnul(this._prototypes[i]);
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
     * @param tmpEpidoseName
     */
    public async loadPrototypes(map: LevelMap, tmpEpidoseName: string) {
        let lastProtoIndex: int;
        
        for (let i = 0; i < MAX_SPRITE_TYPES; i++) {
            const protoName = map.getProto(i);
            let proto;
            
            if (protoName !== '') {
                lastProtoIndex = i;
                
                // Possible locations
                const fpaths = [
                    // If community episode...
                    ...(this._context.episode.isCommunity() ? [
                        //> 🧍/episodeid/episodes/episodename/
                        pathJoin(this._context.episode.homePath, 'episodes', this._context.episode.name),
                        //> 🧍/episodeid/sprites/
                        pathJoin(this._context.episode.homePath, 'sprites')] : []),
                    //> 🏠/sprites/
                    pathJoin(RESOURCES_PATH, 'sprites')];
                
                // Try to load the sprite prototipe from each possible location
                const calls = fpaths.map(fpath => this.loadPrototype.bind(this, fpath, protoName));
                const errors = [];
                for (let call of calls) {
                    try {
                        proto = await call();
                    } catch (err) {
                        // Problems loading
                        if (err instanceof SpritePrototypeLoadError) {
                            errors.push(err);
                        } else {
                            throw new PkError(`Couldn't load sprite prototype for {${ protoName }}.`, err);
                        }
                    }
                }
                
                if (proto != null) {
                    // TODO: Review this procedure
                    proto.assignIndex(this._nextFreeProtoIndex);
                    this._prototypes[this._nextFreeProtoIndex] = proto;
                } else {
                    throw new Error(`Couldn't load the sprite prototype for {${ protoName }} from any of the provided locations:\n`
                        + errors.map((e: SpritePrototypeLoadError) => ' · ' + e.cause.message).join('\n'));
                }
            }
            
            this._nextFreeProtoIndex++;
        }
        
        this._nextFreeProtoIndex = lastProtoIndex + 1;
        
        Log.d('[SpriteManager] Loading child prototypes...');
        
        for (let proto of this._prototypes) {
            await this.loadMorphProtoFor(proto);
            await this.loadBonusProtoFor(proto);
            await this.loadAmmo1ProtoFor(proto);
            await this.loadAmmo2ProtoFor(proto);
        }
    }
    
    /**
     * SDL: PK2::SpriteSystem::protot_get
     */
    private async loadPrototype(fpath: string, fname: string): Promise<SpritePrototype> {
        let proto: SpritePrototype;
        //     char aanipolku[255];
        //     char testipolku[255];
        //     strcpy(aanipolku,polku);
        
        // Check if have space // TODO really necessary?
        if (this._nextFreeProtoIndex >= MAX_SPRITE_TYPES)
            throw new OutOfBoundsError('');
        
        // Check if it can be loaded, else error is elevated
        proto = await SpritePrototype.loadFromFile(this._context, fpath, fname);
        
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
                proto.morphProto = await SpritePrototype.loadFromFile(this._context, proto.path, proto.morphProtoName);
                // Save it
                this._prototypes.push(proto.morphProto);
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
                    proto.bonusProto = await SpritePrototype.loadFromFile(this._context, proto.path, proto.bonusProtoName);
                } catch (err) {
                    debugger
                    console.log('');
                } // Save it
                this._prototypes.push(proto.bonusProto);
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
                proto.ammo1Proto = await SpritePrototype.loadFromFile(this._context, proto.path, proto.ammo1ProtoName);
                // Save it
                this._prototypes.push(proto.ammo1Proto);
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
                proto.ammo2Proto = await SpritePrototype.loadFromFile(this._context, proto.path, proto.ammo2ProtoName);
                // Save it
                this._prototypes.push(proto.ammo2Proto);
            }
        }
    }
    
    /**
     * Check each non-discarded sprite to mark it as active or not active, so that it's not updated or drawn
     * if it is not near the player's view.<br>
     * See {@link Sprite#discarded} and {@link Sprite#active} for more details.<br>
     * SDL: ~PK_Update_Sprites
     */
    public updateCulling(): void {
        let sprite: Sprite;
        
        for (let i = 0; i < MAX_SPRITES; i++) {
            sprite = this.get(i);
            
            if (sprite != null && !sprite.isDiscarded()) {
                sprite.active =
                    sprite.x < this.ctx.cameraX + floor(this.ctx.device.screenWidth * 1.5) &&
                    sprite.x > this.ctx.cameraX - floor(this.ctx.device.screenWidth * 0.5) &&
                    sprite.y < this.ctx.cameraY + floor(this.ctx.device.screenHeight * 1.5) &&
                    sprite.y > this.ctx.cameraY - floor(this.ctx.device.screenHeight * 0.5);
            }
        }
    }
    
    // 	void protot_clear_all();
    
    public clear(): void {
        for (let i = 0; i < MAX_SPRITES; i++) {
            this._sprites[i] = new Sprite();
            this._taustaspritet[i] = null;
        }
        
        this._player = null;
    }
    
    /**
     * Adds the sprites from the specified map to the sprite system.
     * SDL: PK2Kartta::Place_Sprites.
     */
    public addMapSprites(map: LevelMap) {
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
    
    public addSprite(proto: SpritePrototype, isPlayer: boolean, x: number, y: number, parent: Sprite, isBonus: boolean) {
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
                sprite.once(Sprite.EV_SPRITE_DISCARDED, this.onSpriteDiscarded.bind(this));
                
                lisatty = true;
            } else {
                i++;
            }
        }
    }
    
    private onSpriteDiscarded(sprite: Sprite): void {
        // Remove from scene
        if (sprite.proto.type === ESpriteType.TYYPPI_TAUSTA) {
            this.ctx.composition.removeBgSprite(sprite);
        } else {
            this.ctx.composition.removeFgSprite(sprite);
        }
    }
    
    /**
     * SDL: SpriteSystem::add_ammo.
     *
     * @param proto
     * @param isPlayer
     * @param x
     * @param y
     * @param parent
     */
    public addAmmo(proto: SpritePrototype, isPlayer: boolean, x: number, y: number, parent: Sprite) {
        let result: boolean = false;
        let i = 0;
        
        while (!result && i < MAX_SPRITES) {
            let sprite = this._sprites[i];
            
            if (sprite.isDiscarded()) {
                sprite.reuseWith(proto, isPlayer, false, x/*-proto.leveys/2*/, y);
                
                // Source:
                // sprite.x += sprite.proto.leveys;
                // sprite.y += sprite.proto.korkeus/2;
                
                if (proto.hasBehavior(EAi.AI_HEITTOASE)) {
                    if (Math.floor(parent.a) == 0) {
                        // Jos "ampuja" on pelaaja tai ammuksen nopeus on nolla
                        if (parent.isPlayer() || proto.maxSpeed == 0) {
                            sprite.a = !parent.flipX
                                ? +proto.maxSpeed
                                : -proto.maxSpeed;
                        } else { // tai jos kyseess� on vihollinen
                            sprite.a = !parent.flipX
                                ? +1 + rand() % Math.floor(proto.maxSpeed)
                                : -1 - rand() % -Math.floor(proto.maxSpeed);
                        }
                    } else {
                        sprite.a = !parent.flipX
                            ? +proto.maxSpeed + parent.a
                            : -proto.maxSpeed + parent.a;
                        
                        // Source / sprite.a = spritet[emo].a * 1.5;
                    }
                    
                    sprite.jumpTimer = 1;
                } else if (proto.hasBehavior(EAi.AI_MUNA)) {
                    sprite.y = parent.y + 10;
                    sprite.a = parent.a / 1.5;
                } else {
                    sprite.a = !parent.flipX
                        ? +proto.maxSpeed
                        : -proto.maxSpeed;
                }
                
                if (parent != null) {
                    sprite.parent = parent;
                    sprite.setEnemy(parent.isEnemy());
                } else {
                    sprite.parent = sprite;
                }
                
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
                sprite.once(Sprite.EV_SPRITE_DISCARDED, this.onSpriteDiscarded.bind(this));
                
                result = true;
            } else {
                i++;
            }
        }
        
        return result;
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
                    proto = this._prototypes[code]; // TODO -> Estoy podría fallar
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
        return this._context;
    }
    
    /**
     * Returns the player sprite.
     */
    public get player(): Sprite {
        return this._player;
    }
    
    
    ///  Events  ///
    
    public onSpriteCreated(fn: (sprite: Sprite) => void, context: any) {
        return this.on(Ev.SPRITE_CREATED, fn, context);
    }
    
    public getByPrototype(proto: SpritePrototype): Sprite[] {
        return this._sprites.filter(s => s.proto === proto);
    }
    
    public getByType(type: ESpriteType): Sprite[] {
        return this._sprites.filter(s => s.proto.type === type);
    }
}

enum Ev {
    SPRITE_CREATED = 'EV_SPRITE_CREATED'
}