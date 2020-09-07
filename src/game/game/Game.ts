/* eslint-disable @typescript-eslint/camelcase */
import { Effects } from '@game/effects/Effects';
import { ESound } from '@game/enum';
import { EAnimation } from '@game/enum/EAnimation';
import { EAi } from '@game/enum/EBehavior';
import { EBgImageMovement } from '@game/enum/EBgImageMovement';
import { EBlockPrototype } from '@game/enum/EBlockPrototype';
import { EDamageType } from '@game/enum/EDamageType';
import { EDestructionType } from '@game/enum/EDestructionType';
import { ESpriteType } from '@game/enum/ESpriteType';
import { Episode } from '@game/episodes/Episode';
import { GameContext } from '@game/game/GameContext';
import { Fly } from '@game/game/overlay/Fly';
import { GiftManager } from '@game/gift/GiftManager';
import { InputAction } from '@game/InputActions';
import {
    PK2KARTTA_KARTTA_LEVEYS,
    PK2KARTTA_KARTTA_KORKEUS,
    LevelMap,
    KYTKIN_ALOITUSARVO,
    ILMA_SADE,
    ILMA_SADEMETSA,
    ILMA_LUMISADE
} from '@game/map/LevelMap';
import { EParticle } from '@game/particle/Particle';
import { PekkaContext } from '@game/PekkaContext';
import { Sprite } from '@game/sprite/Sprite';
import { SpriteFuture } from '@game/sprite/SpriteFuture';
import { SpriteManager } from '@game/sprite/SpriteManager';
import { TX } from '@game/texts';
import { BlockCollider } from '@game/tile/BlockCollider';
import { BLOCK_SIZE } from '@game/tile/BlockConstants';
import { BlockManager } from '@game/tile/BlockManager';
import { DwTilingSprite } from '@ng/drawable/dwo/DwTilingSprite';
import { Log } from '@ng/support/log/LoggerImpl';
import { PkTickable } from '@ng/support/PkTickable';
import { pathJoin, minmax } from '@ng/support/utils';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';
import { PkFont } from '@ng/types/font/PkFont';
import { PkTexture } from '@ng/types/PkTexture';
import {
    MAX_SPRITES,
    RESOURCES_PATH,
    SPRITE_MAX_AI,
    VAHINKO_AIKA,
    SWITCH_SOUND_CKEY,
    JUMP_SOUND_CKEY,
    LOCK_OPEN_SOUND_CKEY,
    LAND_SOUND_CKEY
} from '@sp/constants';
import { uint } from '@sp/types';
import { int, rand, DWORD } from '../support/types';

export class Game extends GameContext implements PkTickable {
    private _episodeName: string;
    
    private _bgTexture: PkTexture;
    private _bgImage: DwTilingSprite;
    // PK2BLOCKMASKI palikkamaskit[BLOCK_MAX_MASKEJA];
    private _sprites: SpriteManager;
    private _gifts: GiftManager;
    private _blocks: BlockManager;
    private readonly _flies: Set<Fly>;
    
    /**
     * Number of keys left.<br>
     * SRC: avaimia. */
    private _keys: int;
    
    // Debug info
    private draw_dubug_info: boolean = false;
    private debug_sprites: int = 0;
    private debug_drawn_sprites: int = 0;
    private debug_active_sprites: int = 0;
    
    // PK2Kartta* current_map;
    // char map_path[PE_PATH_SIZE];
    //
    private _vibration: int;
    
    private _dcameraX: number;
    private _dcameraY: number;
    private _dcameraA: number;
    private _dcameraB: number;
    
    
    /// >  Timing
    
    /**
     * Indicates if the level is against the clock..<br>
     * SRC: aikaraja */
    private _againstTime: boolean = false;
    /** Remaining time if level has countdown. */
    private _remainingTime: number = 0;
    
    /// >  Game current status
    
    /**
     * Level score.
     * SRC: jakso_pisteet
     */
    private _score: number = 0;
    /**
     * Level score pending to be counted in the game loop.
     * SRC: piste_lisays
     */
    private _scoreBuffer: number = 0;
    
    /** @deprecated Use gameOver instead. */
    private _jakso_lapaisty;
    private _levelCompleted: boolean = false;
    
    /** @deprecated Use gameOver instead. */
    private _peli_ohi;
    private _gameOver: boolean = false;
    private _paused: boolean;
    
    private _kytkin_tarina: int = 0; // "shaking switch", here for now
    private _nakymattomyys: int = 0;
    
    /** ++ timeout */
    private increase_time: number;
    /** player invisible timeout */
    private nakymattomyys: number;
    
    public constructor(context: PekkaContext, episode: Episode, map: LevelMap) {
        super(context, episode, map);
        
        this._sprites = new SpriteManager(this);
        this._gifts = new GiftManager(this);
        this._blocks = new BlockManager(this);
        this._flies = new Set();
        
        this._paused = false;
        
        this._sprites.onSpriteCreated((sprite) => {
            if (sprite.proto.type === ESpriteType.TYYPPI_TAUSTA) {
                this.composition.addBgSprite(sprite);
            } else {
                this.composition.addFgSprite(sprite);
            }
        }, this);
    }
    
    /**
     * SDL: PK_MainScreen_Change -> if (game_next_screen == SCREEN_GAME)
     */
    public async start() {  // "start game"
        Log.d('[Game] Starting game');
        
        // PND if (jaksot[jakso_indeksi_nyt].lapaisty)
        // PND     uusinta = true;   ""is replaying""
        // PND else
        // PND     uusinta = false;
        
        this._levelCompleted = false;
        
        /////  Source: PK_Map_Open --------
        
        try {
            await this._loadBgImage(this.map.fpath, this.map.bgImageFilename);
        } catch (err) {
            Log.w(`[Game] The background image for the game could not be loaded`);
            Log.d(err.message);
        }
        
        // PND	PK_New_Save();
        
        if (this.map.version === '1.2' || this.map.version === '1.3') {
            await this._sprites.loadPrototypes(this.map, 'rooster island 1');
        }
        
        this._sprites.addMapSprites(this.map);
        this._sprites.startDirections();
        
        this._placePlayer();
        
        // 	PkEngine::Particles->load_bg_particles(kartta);
        
        // let abb = await PkAssetTk.getArrayBuffer('/pk2w/resources/cky1.mod');
        // XMPlayer.init();
        // XMPlayer.load(abb);
        // XMPlayer.play();
        
        // 	if ( strcmp(kartta->musiikki, "") != 0) {
        // 		char music_path[PE_PATH_SIZE] = "";
        // 		PK_Load_EpisodeDir(music_path);
        // 		strcat(music_path, kartta->musiikki);
        // 		if (PisteSound_StartMusic(music_path) != 0) {
        //
        // 			printf("Can't load '%s'. ", music_path);
        // 			strcpy(music_path, "music/");
        // 			strcat(music_path, kartta->musiikki);
        // 			printf("Trying '%s'.\n", music_path);
        //
        // 			if (PisteSound_StartMusic(music_path) != 0) {
        //
        // 				printf("Can't load '%s'. Trying 'music/song01.xm'.\n", music_path);
        //
        // 				if (PisteSound_StartMusic("music/song01.xm") != 0){
        // 					PK2_error = true;
        // 					PK2_error_msg = "Can't find song01.xm";
        // 				}
        // 			}
        // 		}
        // 	}
        
        /////  --------
        
        // Background image
        this._addBackground();
        
        // Prepare blocks (load textures, generate prototypes and masks)
        await this._blocks.loadTextures(this.map.fpath, this.map.getBlockTexturesLocation());
        this._blocks.generatePrototypes();
        
        // BG Blocks
        this._blocks.placeBgBlocks();
        // FG Blocks
        this._blocks.placeFgBlocks();
        
        this._blocks.calculateEdges();
        
        //      Game::Gifts->clean();
        //    episode_started = true;
        //      music_volume = settings.music_max_volume;
        this.entropy.degree = 0;
        //      item_paneeli_x = -215;
        
        // Start rendering the game composition
        this.composition.show();
    }
    
    /**
     * This is the game loop.<br>
     * Repeats with each game tick to update each game element status/position according to its characteristics.<br>
     * SDL: PK_MainScreen_InGame
     *
     * @see PkTickable#tick
     */
    public tick(delta: number, time: number): void {
        
        this._updateCamera();
        
        this._particles.update();
        
        if (!this._paused) {
            if (!this._levelCompleted && (!this._againstTime || this._remainingTime > 0)) {
                this._sprites.updateCulling();
                this._updateSprites();
            }
            this._updateOverlays();
        }
        
        // INI	PK_Draw_InGame();
        
        //let luku: str[15];
        // char luku[15];
        // int vali = 20;
        
        this._updateBackground();
        
        // TODO    if (settings.tausta_spritet)
        this._updateBgSprites();
        
        //     Game::Particles->draw_bg_particles();
        
        // ~ kartta->Piirra_Taustat(Game::camera_x,Game::camera_y,false);
        // TODO: Hay algo más
        this._blocks.updateAnimations(1);
        this._blocks.updateCulling();
        
        this._updateFgSprites();
        
        //     //PK_Particles_Draw();
        //     Game::Particles->draw_front_particles();
        //
        //     kartta->Piirra_Seinat(Game::camera_x,Game::camera_y, false);
        this._blocks.updateOffsets();
        //
        //     if (settings.nayta_tavarat)
        //         PK_Draw_InGame_Lower_Menu();
        
        // -> PK_Draw_InGame_UI();
        //    - Energy    OK
        //    - Invisible ??
        //    - Score     OK
        //    - Ammo      TODO
        //    - Info      OK
        
        //     if (draw_dubug_info){
        
        // // vali = PisteDraw2_Font_Write(fontti1,"spriteja: ",10,fy);
        // // itoa(debug_sprites,lukua,10);
        // // PisteDraw2_Font_Write(fontti1,lukua,10+vali,fy);
        // // fy += 10;
        // //
        // // vali = PisteDraw2_Font_Write(fontti1,"aktiivisia: ",10,fy);
        // // itoa(debug_active_sprites,lukua,10);
        // // PisteDraw2_Font_Write(fontti1,lukua,10+vali,fy);
        // // fy += 10;
        // //
        // // vali = PisteDraw2_Font_Write(fontti1,"piirretty: ",10,fy);
        // // itoa(debug_drawn_sprites,lukua,10);
        // // PisteDraw2_Font_Write(fontti1,lukua,10+vali,fy);
        // // fy += 10;
        // //
        // // for (int i=0;i<40;i++){
        // //     itoa(Game::Sprites->protot[i].indeksi,lukua,10);
        // //     PisteDraw2_Font_Write(fontti1,lukua,410,10+i*10);
        // //     PisteDraw2_Font_Write(fontti1,Game::Sprites->protot[i].tiedosto,430,10+i*10);
        // //     PisteDraw2_Font_Write(fontti1,Game::Sprites->protot[i].bonus_sprite,545,10+i*10);
        // // }
        // //
        // // for (int i=0;i<EPISODI_MAX_LEVELS;i++)
        // // if (strcmp(jaksot[i].nimi,"")!=0)
        // //     PisteDraw2_Font_Write(fontti1,jaksot[i].nimi,0,240+i*10);
        // //
        // // char dluku[50];
        // //
        // // sprintf(dluku, "%.7f", Game::Sprites->player->x); //Player x
        // // PisteDraw2_Font_Write(fontti1, dluku, 10, 410);
        // //
        // // sprintf(dluku, "%.7f", Game::Sprites->player->y); //Player y
        // // PisteDraw2_Font_Write(fontti1, dluku, 10, 420);
        //
        // Log.fast('Player position', `{${ ndecs(this._sprites.player.x, 3) }, ${ ndecs(this._sprites.player.y, 3) } }`);
        // Log.fast('Player speed', `{${ ndecs(this._sprites.player.a, 3) }, ${ ndecs(this._sprites.player.b, 3) }}`);
        //
        // // PisteDraw2_Font_Write(fontti1, seuraava_kartta, 10, 460);
        //
        // Log.fast('Hyppy_ajastin', ndecs(this._sprites.player.jumpTimer, 3));
        //
        // // char tpolku[PE_PATH_SIZE] = "";
        // // PK_Load_EpisodeDir(tpolku);
        // //
        // // PisteDraw2_Font_Write(fontti1,tpolku,10,470);
        // //
        // // itoa(nakymattomyys,lukua,10);
        // // PisteDraw2_Font_Write(fontti1,lukua,610,470);
        //
        // Log.fast('Switch timer 1', this._swichTimer1);
        // Log.fast('Switch timer 2', this._swichTimer2);
        // Log.fast('Switch timer 3', this._swichTimer3);
        
        //   }  else {
        //         if (dev_mode)
        //             PK_Draw_InGame_DevKeys();
        //         if (test_level)
        //             PisteDraw2_Font_Write(fontti1, "testing level", 0, 480 - 20);
        //     }
        
        //     if (paused)
        //         PisteDraw2_Font_Write(fontti2,tekstit->Hae_Teksti(PK_txt.game_paused),screen_width/2-82,screen_height/2-9);
        
        //     if (jakso_lapaisty)
        //         PK_Wavetext_Draw(tekstit->Hae_Teksti(PK_txt.game_clear),fontti2,screen_width/2-120,screen_height/2-9);
        //     else
        //     if (peli_ohi){
        //         if (Game::Sprites->player->energy < 1)
        //         PK_Wavetext_Draw(tekstit->Hae_Teksti(PK_txt.game_ko),fontti2,screen_width/2-90,screen_height/2-9-10);
        //     else
        //         if (timeout < 1 && aikaraja)
        //             PK_Wavetext_Draw(tekstit->Hae_Teksti(PK_txt.game_timeout),fontti2,screen_width/2-67,screen_height/2-9-10);
        //
        //         PK_Wavetext_Draw(tekstit->Hae_Teksti(PK_txt.game_tryagain),fontti2,screen_width/2-75,screen_height/2-9+10);
        //     }
        // }
        
        // END	PK_Draw_InGame();
        
        this._blocks.updateMovement();
        
        if (!this._paused) {
            // Increment degreee
            this.entropy.degree = /*(delta * PK2GAMELOOP / 1000) +*/ 1 + this.entropy.degree % 359;
            
            // Decrement timers
            // this.entropy.tickTimers(10 * delta); ¬
            if (this._swichTimer1 > 0)
                this._swichTimer1 = Math.max(0, this._swichTimer1 - 1);
            if (this._swichTimer2 > 0)
                this._swichTimer2 = Math.max(0, this._swichTimer2 - 1);
            if (this._swichTimer3 > 0)
                this._swichTimer3 = Math.max(0, this._swichTimer3 - 1);
            
            // 		if (info_timer > 0)
            // 			info_timer--;
            
            // Score
            if (this._scoreBuffer > 0) {
                this._score++;
                this._scoreBuffer--;
            }
            
            // REPL: THIS IS THE LOGIC IN CHARGE OF COUNT SECONDS
            //       THIS HAS TO BE REPLACED
            //  if (this._aikaraja && !this._levelCompleted) {
            //   			if (sekunti > 0)
            //   				sekunti --;
            //   			else{
            //   				sekunti = TIME_FPS;
            //   				if (this._timeout > 0)
            //   					this._timeout--;
            //   				else
            //   					this._peli_ohi = true;
            //   			}
            //  }
            
            // 		if (nakymattomyys > 0)
            // 			nakymattomyys--;
        }
        
        // Terminate the game if player is dead
        if (!this._sprites.player.isAlive() && !this._gameOver) {
            this._gameOver = true;
            this.context.input.keyCooldown = 50;
        }
        
        // Decrease input cooldown
        if (this.context.input.keyCooldown > 0) {
            this.context.input.keyCooldown--;
        }
        
        if (this._levelCompleted || this._gameOver) {
            // 		if (lopetusajastin > 1)
            // 			lopetusajastin--;
            //
            // 		if (lopetusajastin == 0)
            // 			lopetusajastin = 800;//2000;
            //
            // 		if (PisteInput_Keydown(settings.control_attack1) || PisteInput_Keydown(settings.control_attack2) ||
            // 			PisteInput_Keydown(settings.control_jump) || PisteInput_Keydown(PI_RETURN))
            // 			if (lopetusajastin > 2 && lopetusajastin < 600/*1900*/ && key_delay == 0)
            // 				lopetusajastin = 2;
            //
            // 		if (lopetusajastin == 2){
            // 			PisteDraw2_FadeOut(PD_FADE_NORMAL);
            // 			//music_volume = 0;
            // 		}
        }
        // 	if (lopetusajastin == 1 && !PisteDraw2_IsFading()){
        // 		if(test_level) PK_Fade_Quit();
        // 		else {
        // 			if (this._levelCompleted) game_next_screen = SCREEN_SCORING;
        // 			else game_next_screen = SCREEN_MAP;
        // 		}
        // 	}
        
        if (this.context.input.keyCooldown == 0) {
            if (this.context.input.isActing(InputAction.GAME_GIFT_USE) && this._sprites.player.isAlive()) {
                this.useGift();
                // TODO: Review! Key repeats too quickly
                this.context.input.keyCooldown = 10;
            }
            if (this.context.input.isActing(InputAction.GAME_PAUSE) && !this._levelCompleted) {
                this._paused = !this._paused;
                this.context.input.keyCooldown = 20;
            }
            if (this.context.input.isActing(InputAction.GAME_SUICIDE)) {
                this._sprites.player.kill();
            }
            if (this.context.input.isActing(InputAction.GAME_GIFT_NEXT)) {
                this._gifts.changeOrder();
                // TODO: Review! Key repeats too quickly
                this.context.input.keyCooldown = 10;
            }
            // 		if (!dev_mode)
            // 			if (PisteInput_Keydown(PI_I)) {
            // 				show_fps = !show_fps;
            // 				key_delay = 20;
            // 			}
            // 		if (PisteInput_Keydown(PI_F)) {
            // 			show_fps = !show_fps;
            // 			key_delay = 20;
            // 		}
        }
        
        // REPL
        // 	if (dev_mode){ //Debug
        // 		if (key_delay == 0) {
        // 			if (PisteInput_Keydown(PI_Z)) {
        // 				if (kytkin1 < KYTKIN_ALOITUSARVO - 64) kytkin1 = KYTKIN_ALOITUSARVO;
        // 				if (kytkin2 < KYTKIN_ALOITUSARVO - 64) kytkin2 = KYTKIN_ALOITUSARVO;
        // 				if (kytkin3 < KYTKIN_ALOITUSARVO - 64) kytkin3 = KYTKIN_ALOITUSARVO;
        // 				key_delay = 20;
        // 			}
        // 			if (PisteInput_Keydown(PI_X)) {
        // 				if (kytkin1 > 64) kytkin1 = 64;
        // 				if (kytkin2 > 64) kytkin2 = 64;
        // 				if (kytkin3 > 64) kytkin3 = 64;
        // 				key_delay = 20;
        // 			}
        // 			if (PisteInput_Keydown(PI_T)) {
        // 				doublespeed = !doublespeed;
        // 				key_delay = 20;
        // 			}
        // 			if (PisteInput_Keydown(PI_G)) {
        // 				settings.lapinakyvat_objektit = !settings.lapinakyvat_objektit;
        // 				key_delay = 20;
        // 			}
        // 			if (PisteInput_Keydown(PI_L)) {
        // 				avaimia = 0;
        // 				kartta->Open_Locks();
        // 				key_delay = 20;
        // 			}
        // 			if (PisteInput_Keydown(PI_K)) {
        // 				kartta->Change_SkullBlocks();
        // 				key_delay = 20;
        // 			}
        // 			if (PisteInput_Keydown(PI_W)) {
        // 				settings.isFullScreen = !settings.isFullScreen;
        // 				PisteDraw2_FullScreen(settings.isFullScreen);
        // 				key_delay = 20;
        // 			}
        // 			if (PisteInput_Keydown(PI_I)) {
        // 				draw_dubug_info = !draw_dubug_info;
        // 				key_delay = 20;
        // 			}
        // 			if (PisteInput_Keydown(PI_R)) {
        // 				kartta->Select_Start();
        // 				PkEngine::Sprites->player->energy = 10;
        // 				key_delay = 20;
        // 			}
        // 			if (PisteInput_Keydown(PI_END)) {
        // 				key_delay = 20;
        // 				if (PisteSound_StartMusic("music/hiscore.xm") != 0){
        // 					PK2_error = true;
        // 					PK2_error_msg = "Can't find hiscore.xm";
        // 				}
        // 				this._levelCompleted = true;
        // 				jaksot[jakso_indeksi_nyt].lapaisty = true;
        // 				if (jaksot[jakso_indeksi_nyt].jarjestys == jakso)
        // 					jakso++;
        // 				music_volume = settings.music_max_volume;
        // 				music_volume_now = settings.music_max_volume - 1;
        // 			}
        // 			if (PisteInput_Keydown(PI_LSHIFT)/* && key_delay == 0*/) {
        // 				//key_delay = 20;
        // 				for (int r = 1; r<6; r++)
        // 					//this._particles.new_particle(PARTICLE_SPARK, player->x + rand() % 10 - rand() % 10, player->y + rand() % 10 - rand() % 10, 0, 0, rand() % 100, 0.1, 32);
        // 					this._particles.new_particle(PARTICLE_SPARK, PkEngine::Sprites->player->x + rand() % 10 - rand() % 10, PkEngine::Sprites->player->y + rand() % 10 - rand() % 10, 0, 0, rand() % 100, 0.1, 32);
        // 				*PkEngine::Sprites->player = Sprite(&PkEngine::Sprites->protot[PROTOTYYPPI_KANA], 1, false, PkEngine::Sprites->player->x, PkEngine::Sprites->player->y);
        // 			}
        // 		}
        // 		if (PisteInput_Keydown(PI_U))
        // 			PkEngine::Sprites->player->b = -10;
        // 		if (PisteInput_Keydown(PI_E))
        // 			PkEngine::Sprites->player->energy = PkEngine::Sprites->player->tyyppi->energy;
        // 		if (PisteInput_Keydown(PI_V))
        // 			nakymattomyys = 3000;
        // 	}
    }
    
    private med = 0;
    
    /**
     * SDL: PK_Draw_InGame_BGSprites.
     */
    private _updateBgSprites() {
        let xl, yl, alku_x, alku_y, yk;
        let i: int;
        
        for (let o = 0; o < MAX_SPRITES; o++) {
            const sprite: Sprite = this._sprites.get(o);
            
            if (sprite.proto != null && i !== -1) {
                if (!sprite.isDiscarded() && sprite.proto.type === ESpriteType.TYYPPI_TAUSTA) {
                    //Tarkistetaanko onko sprite tai osa siit� kuvassa
                    
                    alku_x = sprite.initialX;
                    alku_y = sprite.initialY;
                    
                    if (sprite.proto.pallarx_kerroin != 0) {
                        xl = alku_x - this.cameraX - this.device.screenWidth / 2 - sprite.proto.width / 2;
                        xl /= sprite.proto.pallarx_kerroin;
                        yl = alku_y - this.cameraY - this.device.screenHeight / 2 - sprite.proto.height / 2;
                        yk = sprite.proto.pallarx_kerroin;///1.5;
                        if (yk != 0) {
                            yl /= yk;
                        }
                    } else
                        xl = yl = 0;
                    
                    switch (sprite.proto.getBehavior(0)) {
                        case EAi.AI_TAUSTA_KUU               :
                            yl += this.device.screenHeight / 3 + 50;
                            break;
                        // Janne:
                        // case AI_TAUSTA_LIIKKUU_VASEMMALLE	:	if (sprite.a == 0)
                        //    sprite.a = rand()%3;
                        //    sprite.alku_x -= sprite.a;
                        //    if (sprite.hidden && sprite.alku_x < Game::camera_x)
                        //    {
                        //           sprite.alku_x = Game::camera_x+screen_width+sprite.proto.leveys*2;
                        //         sprite.a = rand()%3;
                        //    }
                        //    break;
                        case EAi.AI_LIIKKUU_X_COS:
                            sprite.AI_MovesX(this.entropy.cos(this.entropy.degree % 360));
                            alku_x = sprite.x;
                            alku_y = sprite.y;
                            break;
                        case EAi.AI_LIIKKUU_Y_COS:
                            sprite.AI_MovesY(this.entropy.cos(this.entropy.degree % 360));
                            alku_x = sprite.x;
                            alku_y = sprite.y;
                            break;
                        case EAi.AI_LIIKKUU_X_SIN:
                            sprite.AI_MovesX(this.entropy.sin(this.entropy.degree % 360));
                            alku_x = sprite.x;
                            alku_y = sprite.y;
                            break;
                        case EAi.AI_LIIKKUU_Y_SIN:
                            sprite.AI_MovesY(this.entropy.sin(this.entropy.degree % 360));
                            alku_x = sprite.x;
                            alku_y = sprite.y;
                            break;
                        default:
                            break;
                    }
                    
                    sprite.x = alku_x - xl;
                    sprite.y = alku_y - yl;
                    
                    //Tarkistetaanko onko sprite tai osa siit� kuvassa
                    // if (sprite.x - sprite.proto.leveys/2  < this.cameraX+screen_width &&
                    // sprite.x + sprite.proto.leveys/2  > this.cameraX &&
                    // sprite.y - sprite.proto.korkeus/2 < this.cameraY+screen_height &&
                    // sprite.y + sprite.proto.korkeus/2 > this.cameraY)
                    // {
                    sprite.Piirra(this.cameraX, this.cameraY);
                    sprite.hidden = false;
                    
                    //   debug_drawn_sprites++;
                    // } else {
                    //     if (!this._paused) {
                    //         sprite.Animoi();
                    //     }
                    //     sprite.piilossa = true;
                    // }
                    
                    // debug_sprites++;
                }
            }
        }
    }
    
    /**
     * SDL: PK_Draw_InGame_Sprites.
     */
    private _updateFgSprites(): void {
        // debug_drawn_sprites = 0;
        let stars: int, sx: int;
        let star_x: number;
        let star_y: number;
        
        for (let i = 0; i < MAX_SPRITES; i++) {
            // Onko sprite n�kyv�
            const sprite: Sprite = this._sprites.get(i);
            
            if (!sprite.isDiscarded() && sprite.proto.type != ESpriteType.TYYPPI_TAUSTA) {
                //Check whether or not sprite is on the screen
                if (sprite.x - sprite.proto.width / 2 < this.cameraX + this.device.screenWidth &&
                    sprite.x + sprite.proto.width / 2 > this.cameraX &&
                    sprite.y - sprite.proto.height / 2 < this.cameraY + this.device.screenHeight &&
                    sprite.y + sprite.proto.height / 2 > this.cameraY) {
                    
                    if (sprite.isku > 0 && sprite.proto.type != ESpriteType.TYYPPI_BONUS && sprite.energy < 1) {
                        // TODO
                        // int framex = ((degree%12)/3) * 58;
                        // DWORD hit_x = sprite->x-8, hit_y = sprite->y-8;
                        // PisteDraw2_Image_CutClip(kuva_peli,hit_x-Game::camera_x-28+8, hit_y-Game::camera_y-27+8,1+framex,83,1+57+framex,83+55);
                    }
                    
                    const doublespeed = false; // TODO temp
                    if (this._nakymattomyys === 0 || (!doublespeed && this._nakymattomyys % 2 == 0) || (doublespeed && this._nakymattomyys % 4 <= 1) || sprite != this._sprites.player/*i != pelaaja_index*/)
                        sprite.Piirra(null, null);
                    
                    if (sprite.energy < 1 && sprite.proto.type != ESpriteType.TYYPPI_AMMUS) {
                        // TODO
                        // sx = (int)sprite->x;
                        // for (stars=0; stars<3; stars++){
                        //     star_x = sprite->x-8 + (sin_table[((stars*120+degree)*2)%359])/3;
                        //     star_y = sprite->y-18 + (cos_table[((stars*120+degree)*2+sx)%359])/8;
                        //     PisteDraw2_Image_CutClip(kuva_peli,star_x-Game::camera_x, star_y-Game::camera_y,1,1,11,11);
                        // }
                    }
                    
                    //  debug_drawn_sprites++;
                } else {
                    //     if (!this._paused) {
                    // // Animate without draw
                    sprite.Animoi();
                    //     }
                    //
                    if (sprite.energy < 1) {
                        sprite.discard();
                    }
                }
                
                // this.debug_sprites++;
            }
        }
    }
    
    /**
     * Places the player at the start position and centers the camera on him.<br>
     * SDL: Select_Start
     * @private
     */
    private _placePlayer(): void {
        const startPos = this.map.getStartPosition();
        
        const playerPosX = startPos.x + this._sprites.player.proto.width / 2;
        const playerPosY = startPos.y + this._sprites.player.proto.height / 2;
        
        this._sprites.player.x = playerPosX;
        this._camera.x = Math.floor(playerPosX);
        this._dcameraX = playerPosX;
        
        this._sprites.player.y = playerPosY;
        this._camera.y = Math.floor(playerPosY);
        this._dcameraY = playerPosY;
    }
    
    private async _loadBgImage(fpath: string, fname: string): Promise<void> {
        const bt = await PkAssetTk.getImage(
            ...(this.episode.isCommunity() ? [pathJoin(this.episode.homePath, 'gfx/scenery/', fname)] : []),
            pathJoin(fpath, fname),
            pathJoin(RESOURCES_PATH, 'gfx/scenery/', fname));
        this._bgTexture = bt.getTexture();
    }
    
    /**
     * SDL: PK_Update_Camera.
     */
    private _updateCamera(): void {
        this._camera.x = Math.floor(this._sprites.player.x - this.device.screenWidth / 2);
        this._camera.y = Math.floor(this._sprites.player.y - this.device.screenHeight / 2);
        
        // Source comment:
        // if (!PisteInput_Hiiri_Vasen()) {
        //    Game::camera_x = (int)player->x-screen_width/2;
        //    Game::camera_y = (int)player->y-screen_height/2;
        // }else{
        //    Game::camera_x += PisteInput_Hiiri_X(0)*5;
        //    Game::camera_y += PisteInput_Hiiri_Y(0)*5;
        // }
        
        if (this._vibration > 0) {
            this._dcameraX += (rand() % this._vibration - rand() % this._vibration) / 5;
            this._dcameraY += (rand() % this._vibration - rand() % this._vibration) / 5;
            
            this._vibration--;
        }
        
        if (this._kytkin_tarina > 0) {
            this._dcameraX += (rand() % 9 - rand() % 9); //3
            this._dcameraY += (rand() % 9 - rand() % 9);
            
            this._kytkin_tarina--;
        }
        
        if (this._dcameraX !== this.cameraX)
            this._dcameraA = (this.cameraX - this._dcameraX) / 15;
        
        if (this._dcameraY !== this.cameraY)
            this._dcameraB = (this.cameraY - this._dcameraY) / 15;
        
        this._dcameraA = minmax(this._dcameraA, -6, 6);
        this._dcameraB = minmax(this._dcameraB, -6, 6);
        
        this._dcameraX += this._dcameraA;
        this._dcameraY += this._dcameraB;
        
        this._camera.x = Math.floor(this._dcameraX);
        this._camera.y = Math.floor(this._dcameraY);
        
        if (this.cameraX < 0)
            this._camera.x = 0;
        
        if (this.cameraY < 0)
            this._camera.y = 0;
        
        if (this.cameraX > Math.floor(PK2KARTTA_KARTTA_LEVEYS - this.device.screenWidth / 32) * 32)
            this._camera.x = Math.floor(PK2KARTTA_KARTTA_LEVEYS - this.device.screenWidth / 32) * 32;
        
        if (this.cameraY > Math.floor(PK2KARTTA_KARTTA_KORKEUS - this.device.screenHeight / 32) * 32)
            this._camera.y = Math.floor(PK2KARTTA_KARTTA_KORKEUS - this.device.screenHeight / 32) * 32;
        
        // Apply
        //this.composition.getDrawable().setPosition(-this.cameraX, -this.cameraY);
        this.camera.setPosition(this.cameraX, this.cameraY);
    }
    
    /**
     * SDL: PK_Update_Sprites.
     */
    private _updateSprites(): void {
        // 	debug_active_sprites = 0;
        let sprite: Sprite;
        
        for (let i = 0; i < MAX_SPRITES; i++) {
            sprite = this._sprites.get(i);
            
            if (sprite.active && sprite.proto.type !== ESpriteType.TYYPPI_TAUSTA) {
                if (sprite.proto.type === ESpriteType.TYYPPI_BONUS) {
                    this._updateBonusSpriteMovement(sprite);
                } else {
                    this._updateSpriteMovement(sprite);
                }
                
                // debug_active_sprites++;
            }
        }
    }
    
    /**
     * CPP: PK_Sprite_Liikuta.
     * SDL: PK_Sprite_Movement.
     *
     * @param sprite - Sprite to update.
     */
    private _updateSpriteMovement(sprite: Sprite): void {
        // TODO - Caution with this: Dead sprites are going to be updated
        if (sprite.proto == null)
            return;
        
        const future: SpriteFuture = sprite.getPackedAttributes();
        
        let x = 0;
        let y = 0;
        
        let kartta_vasen = 0;
        let kartta_yla = 0;
        
        sprite.crouched = false;
        
        sprite.reuna_vasemmalla = false;
        sprite.reuna_oikealla = false;
        
        
        // Limit max speed if energy is to low
        if (sprite.energy < 1)
            future.maxSpeed = 3;
        
        // Calculate the remainder of the sprite towards
        
        if (sprite.attack1Remaining > 0)
            sprite.attack1Remaining -= 1;
        
        if (sprite.attack2Remaining > 0)
            sprite.attack2Remaining -= 1;
        
        if (sprite.lataus > 0)	// aika kahden ampumisen (munimisen) välillä
            sprite.lataus -= 1;
        
        if (sprite.muutos_ajastin > 0)	// aika muutokseen
            sprite.muutos_ajastin -= 1;
        
        /*****************************************************************************************/
        /* Player-sprite and its controls                                                        */
        /*****************************************************************************************/
        
        let lisavauhti = true;  // "extra speed"
        let hidastus = false;  // "slow motion"
        
        // 	PisteInput_Lue_Eventti();
        if (sprite.isPlayer() && sprite.energy > 0) {
            // SLOW WALK
            if (this.context.input.isActing(InputAction.GAME_WALK_SLOW)) {
                lisavauhti = false;
            }
            
            /* ATTACK 1 */
            if (this.context.input.isActing(InputAction.GAME_ATTACK1) && sprite.lataus == 0 && sprite.ammo1Proto != null) {
                sprite.attack1Remaining = sprite.proto.attack1Duration;
                Log.d('[Game] Attack 1 for ', sprite.attack1Remaining, ' ticks.');
            } else
                /* ATTACK 2 */
            if (this.context.input.isActing(InputAction.GAME_ATTACK2) && sprite.lataus == 0 && sprite.ammo2Proto != null) {
                sprite.attack2Remaining = sprite.proto.attack2Duration;
                Log.d('[Game] Attack 2 for ', sprite.attack2Remaining, ' ticks.');
            }
            
            /* CROUCH */
            sprite.crouched = false;
            if (this.context.input.isActing(InputAction.GAME_CROUCH) && !sprite.bottomIsBarrier) {
                sprite.crouched = true;
                future.top += future.height / 1.5;
            }
            
            let a_lisays: number = 0;
            
            /* NAVIGATING TO RIGHT */
            if (this.context.input.isActing(InputAction.GAME_RIGHT)) {
                a_lisays = 0.04;//0.08;
                
                if (lisavauhti) {
                    // Draw dust
                    if (rand() % 20 == 1 && sprite.animationIndex == EAnimation.ANIMAATIO_KAVELY)
                        this._particles.newParticle(EParticle.PARTICLE_DUST_CLOUDS, future.x - 8, future.bottom - 8, 0.25, -0.25, 40, 0, 0);
                    
                    a_lisays += 0.09;//0.05
                }
                
                if (sprite.bottomIsBarrier)
                    a_lisays /= 1.5;//2.0
                
                sprite.flipX = false;
            }
            
            /* NAVIGATING TO LEFT */
            if (this.context.input.isActing(InputAction.GAME_LEFT)) {
                a_lisays = -0.04;
                
                if (lisavauhti) {
                    // Draw dust
                    if (rand() % 20 == 1 && sprite.animationIndex == EAnimation.ANIMAATIO_KAVELY)
                        this._particles.newParticle(EParticle.PARTICLE_DUST_CLOUDS, future.x - 8, future.bottom - 8, 0.25, -0.25, 40, 0, 0);
                    
                    a_lisays -= 0.09;
                }
                
                if (sprite.bottomIsBarrier)	// spriten koskettaessa maata kitka vaikuttaa
                    a_lisays /= 1.5;//2.0
                
                sprite.flipX = true;
            }
            
            if (sprite.crouched)	// Slow when couch
                a_lisays /= 10;
            
            future.a += a_lisays;
            
            /* JUMPING */
            if (sprite.proto.weight > 0) {
                if (this.context.input.isActing(InputAction.GAME_JUMP)) {
                    if (!sprite.isCrouched()) {
                        if (sprite.jumpTimer == 0) {
                            this.playSound(this.stuff.getSound(JUMP_SOUND_CKEY),
                                1, future.x, future.y, sprite.proto.soundFreq, sprite.proto.soundRandomFreq);
                        }
                        
                        if (sprite.jumpTimer <= 0)
                            sprite.jumpTimer = 1; //10;
                    }
                } else {
                    if (sprite.jumpTimer > 0 && sprite.jumpTimer < 45)
                        sprite.jumpTimer = 55;
                }
                
                /* tippuminen hiljaa alasp�in */
                if (this.context.input.isActing(InputAction.GAME_JUMP) && sprite.jumpTimer >= 150/*90+20*/ && sprite.proto.canFly()) {
                    hidastus = true;
                }
            }
            /* MOVING UP AND DOWN */
            else { // if the player sprite-weight is 0 - like birds
                
                if (this.context.input.isActing(InputAction.GAME_JUMP))
                    future.b -= 0.15;
                
                if (this.context.input.isActing(InputAction.GAME_CROUCH))
                    future.b += 0.15;
                
                sprite.jumpTimer = 0;
            }
            
            /* AI */
            for (let ai = 0; ai < SPRITE_MAX_AI; ai++) {
                switch (sprite.proto.getBehavior(ai)) {
                    
                    // "Change to morph prototype if energy < 2"
                    case EAi.AI_MUUTOS_JOS_ENERGIAA_ALLE_2:
                        if (sprite.proto.morphProto != null)
                            sprite.AI_Muutos_Jos_Energiaa_Alle_2(sprite.proto.morphProto);
                        break;
                    
                    // "Change to morph prototype if energy > 1 and show smoke"
                    case EAi.AI_MUUTOS_JOS_ENERGIAA_YLI_1:
                        if (sprite.proto.morphProto != null) {
                            if (sprite.AI_Muutos_Jos_Energiaa_Yli_1(sprite.proto.morphProto) == true)
                                Effects.destruction(this, EDestructionType.TUHOUTUMINEN_SAVU_HARMAA, Math.floor(sprite.x), Math.floor(sprite.y));
                        }
                        break;
                    
                    // "Change to morph prototype if morph timer is over"
                    case EAi.AI_MUUTOS_AJASTIN:
                        if (sprite.proto.morphProto != null)
                            sprite.AI_Muutos_Ajastin(sprite.proto.morphProto);
                        break;
                    
                    // "Damage sprite if it's in water"
                    case EAi.AI_VAHINGOITTUU_VEDESTA:
                        sprite.AI_Vahingoittuu_Vedesta();
                        break;
                    
                    // "Morph if it has received damage"
                    case EAi.AI_MUUTOS_JOS_OSUTTU:
                        if (sprite.proto.morphProto != null)
                            sprite.AI_Muutos_Jos_Osuttu(sprite.proto.morphProto);
                        break;
                    
                    default:
                        break;
                }
            }
            
            /* It is not acceptable that a player is anything other than the game character */ //TODO Este no es el lugar para esto...
            if (sprite.proto.type !== ESpriteType.TYYPPI_PELIHAHMO) {
                sprite.kill();
            }
        }
        
        /*****************************************************************************************/
        /* Jump                                                                                  */
        /*****************************************************************************************/
        
        let hyppy_maximissa: boolean = sprite.jumpTimer >= 90;
        
        // Jos ollaan hyp�tty / ilmassa:
        if (sprite.jumpTimer > 0) {
            if (sprite.jumpTimer < 50 - sprite.proto.maxJump)
                sprite.jumpTimer = 50 - sprite.proto.maxJump;
            
            if (sprite.jumpTimer < 10)
                sprite.jumpTimer = 10;
            
            // Original timer < 90 (impulse)
            if (!hyppy_maximissa) {
                // Source
                // sprite_b = (sprite.tyyppi->max_hyppy/2 - sprite.jumpTimer/2)/-2.0;//-4
                future.b = -this.entropy.sin(sprite.jumpTimer) / 8; //(sprite.tyyppi->max_hyppy/2 - sprite.jumpTimer/2)/-2.5;
                if (future.b > sprite.proto.maxJump) {
                    future.b = sprite.proto.maxJump / 10.0;
                    sprite.jumpTimer = 90 - sprite.jumpTimer;
                }
            }
            
            if (sprite.jumpTimer < 180)
                sprite.jumpTimer += (2);
        }
        
        if (sprite.jumpTimer < 0)
            sprite.jumpTimer += (1);
        
        if (future.b > 0 && !hyppy_maximissa)
            sprite.jumpTimer = 90; //sprite.tyyppi->max_hyppy*2;
        
        /*****************************************************************************************/
        /* Hit recovering                                                                        */
        /*****************************************************************************************/
        
        if (sprite.knockTimer > 0)
            sprite.knockTimer--;
        
        /*****************************************************************************************/
        /* Gravity effect                                                                        */
        /*****************************************************************************************/
        
        if (sprite.weight !== 0 && (sprite.jumpTimer <= 0 || sprite.jumpTimer >= 45))
            future.b += (sprite.weight / 1.25); // + future.b/1.5;
        
        if (hidastus && future.b > 0) // If gliding   // TODO: Como meto el coeficiente aqui
            future.b /= 1.3; //1.5; //3
        
        /*****************************************************************************************/
        /* By default, the sprite is not in the water and not hidden                             */
        /*****************************************************************************************/
        
        sprite.inWater = false;
        sprite.hidden = false;
        
        /*****************************************************************************************/
        /* Speed limits                                                                          */
        /*****************************************************************************************/
        
        if (future.b > 4.0) //4
            future.b = 4.0; //4
        
        if (future.b < -4.0)
            future.b = -4.0;
        
        if (future.a > future.maxSpeed)
            future.a = future.maxSpeed;
        
        if (future.a < -future.maxSpeed)
            future.a = -future.maxSpeed;
        
        /*****************************************************************************************/
        /* Blocks colision -                                                                     */
        /*****************************************************************************************/
        
        let palikat_x_lkm: int;
        let palikat_y_lkm: int;
        let palikat_lkm: int;
        let p: DWORD;  // coordiante of the current block
        
        if (sprite.proto.collidesWithBlocks) { //Find the tiles that the sprite occupies
            // Number of blocks to check
            palikat_x_lkm = Math.floor((future.width) / 32) + 4; //Number of blocks
            palikat_y_lkm = Math.floor((future.height) / 32) + 4;
            
            // Position in tile map (upper-left corner)
            kartta_vasen = Math.floor((future.left) / 32);
            kartta_yla = Math.floor((future.top) / 32);
            
            // Not necessary
            // 		for (y=0;y<palikat_y_lkm;y++)
            // 			for (x=0;x<palikat_x_lkm;x++) //For each block, create a array of blocks around the sprite
            // 				// palikat[x+(y*palikat_x_lkm)] = PK_Block_Get(kartta_vasen+x-1,kartta_yla+y-1); //x = 0, y = 0
            // this._blocks.getFgBlock(x, y);
            
            /*****************************************************************************************/
            /* Going through the blocks around the sprite.                                           */
            /*****************************************************************************************/
            
            let collider: BlockCollider;
            for (y = 0; y < palikat_y_lkm; y++) {
                for (x = 0; x < palikat_x_lkm; x++) {
                    p = x + y * palikat_x_lkm;
                    if (p < 300) { //src: && p>=0)//{
                        //src: if(sprite.pelaaja == 1) printf("%i\n",palikat_lkm);
                        collider = this._blocks.getBlockCollider(kartta_vasen + x - 1, kartta_yla + y - 1);
                        this._checkBlocks(sprite, future, collider);
                        //src: }
                    }
                }
            }
        }
        /*****************************************************************************************/
        /* If the sprite is under water                                                          */
        /*****************************************************************************************/
        
        // Sinking in water
        if (sprite.inWater) {
            if (!sprite.proto.canSwim() || sprite.energy < 1) {
                /*
                 if (future.b > 0)
                 future.b /= 2.0;
                 
                 sprite_b -= (1.5-sprite.weight)/10;*/
                future.b /= 2.0;
                future.a /= 1.05;
                
                if (sprite.jumpTimer > 0 && sprite.jumpTimer < 90)
                    sprite.jumpTimer -= 1;
            }
            
            if (rand() % 80 == 1)
                this._particles.newParticle(EParticle.PARTICLE_SPARK, future.x - 4, future.y, 0, -0.5 - rand() % 2, rand() % 30 + 30, 0, 32);
        }
        
        // Enters or exist from water, splash
        if (future.inWater !== sprite.inWater) {
            Effects.splash(this, Math.floor(future.x), Math.floor(future.y), 32);
        }
        
        /*****************************************************************************************/
        /* Sprite weight                                                                    ^.^  */
        /*****************************************************************************************/
        
        // Reset values
        sprite.weight = sprite.initialWeight;
        sprite.kytkinpaino = sprite.weight;
        
        // If sprite has no gravity (flying) and is dead, it falls
        if (sprite.energy < 1 && sprite.weight === 0) {
            sprite.weight = 1;
        }
        
        /*****************************************************************************************/
        /* Sprite collision with other sprites                                                   */
        /*****************************************************************************************/
        
        let tuhoutuminen: int = 0;
        let sprite2_yla: number = 0; // kyykistymiseen liittyv�
        
        // ~ PK2BLOCK spritepalikka;
        let sprite2: Sprite;
        let collider: BlockCollider;
        
        // Compare this sprite with every sprite in the game
        for (let sprite_index = 0; sprite_index < MAX_SPRITES; sprite_index++) {
            sprite2 = this._sprites.get(sprite_index);
            
            if (sprite2 != sprite && /*!sprite2->piilota*/sprite2.active) {
                if (sprite2.isCrouched()) {
                    sprite2_yla = sprite2.proto.height / 3;//1.5;
                } else {
                    sprite2_yla = 0;
                }
                
                // If sprite is solid (sprite can collide con sprite2)
                if (sprite2.proto.isObstacle() && sprite.proto.collidesWithBlocks) { //If there is a block sprite active
                    if (future.x - future.width / 2 + future.a <= sprite2.x + sprite2.proto.width / 2 &&
                        future.x + future.width / 2 + future.a >= sprite2.x - sprite2.proto.width / 2 &&
                        future.y - future.height / 2 + future.b <= sprite2.y + sprite2.proto.height / 2 &&
                        future.y + future.height / 2 + future.b >= sprite2.y - sprite2.proto.height / 2) {
                        
                        // ~ sprite collider
                        collider = sprite2.getCollider(collider);
                        
                        // Janne // spritepalikka.koodi = BLOCK_HISSI_VERT;
                        
                        // ~ PK_Palikka_Este(spritepalikka);
                        // collider.tausta = false;
                        // collider.rightIsBarrier = true;
                        // collider.leftIsBarrier = true;
                        // collider.topIsBarrier = true;
                        // collider.bottomIsBarrier = true;
                        
                        if (!sprite.proto.isObstacle()) {
                            if (!sprite2.proto.este_alas)
                                collider.bottomIsBarrier = false;
                            if (!sprite2.proto.este_ylos)
                                collider.topIsBarrier = false;
                            if (!sprite2.proto.este_oikealle)
                                collider.rightIsBarrier = false;
                            if (!sprite2.proto.este_vasemmalle)
                                collider.leftIsBarrier = false;
                        }
                        
                        // TODO: This is weird
                        if (sprite2.a > 0)
                            collider.code = EBlockPrototype.BLOCK_ELEVATOR_H;
                        
                        // TODO: This is weird
                        if (sprite2.b > 0)
                            collider.code = EBlockPrototype.BLOCK_ELEVATOR_H;
                        
                        this._checkBlocks2(sprite, collider, future);
                    }
                }
                
                // If they are overlapping
                if (future.x <= sprite2.x + sprite2.proto.width / 2 &&
                    future.x >= sprite2.x - sprite2.proto.width / 2 &&
                    future.y/*yla*/ <= sprite2.y + sprite2.proto.height / 2 &&
                    future.y/*ala*/ >= sprite2.y - sprite2.proto.height / 2 + sprite2_yla) {
                    
                    // Sprites of same kind turn back on collision
                    if (sprite.proto === sprite2.proto && sprite2.energy > 0/* && sprite.pelaaja == 0*/) {
                        if (sprite.x < sprite2.x)
                            future.canGoRight = false;
                        if (sprite.x > sprite2.x)
                            future.canGoLeft = false;
                        if (sprite.y < sprite2.y)
                            future.canGoDown = false;
                        if (sprite.y > sprite2.y)
                            future.canGoUp = false;
                    }
                    
                    // Acceleration blocks (invisible arrows)
                    if (sprite.hasBehavior(EAi.AI_NUOLET_VAIKUTTAVAT)) {
                        
                        if (sprite2.hasBehavior(EAi.AI_NUOLI_OIKEALLE)) {
                            future.a = sprite.proto.maxSpeed / 3.5;
                            future.b = 0;
                        } else if (sprite2.hasBehavior(EAi.AI_NUOLI_VASEMMALLE)) {
                            future.a = sprite.proto.maxSpeed / -3.5;
                            future.b = 0;
                        }
                        
                        if (sprite2.hasBehavior(EAi.AI_NUOLI_YLOS)) {
                            future.b = sprite.proto.maxSpeed / -3.5;
                            future.a = 0;
                        } else if (sprite2.hasBehavior(EAi.AI_NUOLI_ALAS)) {
                            future.b = sprite.proto.maxSpeed / 3.5;
                            future.a = 0;
                        }
                    }
                    
                    /* spritet voivat vaihtaa tietoa pelaajan olinpaikasta */
                    /*			if (sprite.pelaaja_x != -1 && sprite2->pelaaja_x == -1)
                     {
                     sprite2->pelaaja_x = sprite.pelaaja_x + rand()%30 - rand()%30;
                     sprite.pelaaja_x = -1;
                     } */
                    
                    if (sprite.isEnemy() != sprite2.isEnemy() && sprite.parent != sprite2) {
                        if (sprite2.proto.type != ESpriteType.TYYPPI_TAUSTA &&
                            sprite.proto.type != ESpriteType.TYYPPI_TAUSTA &&
                            sprite2.proto.type != ESpriteType.TYYPPI_TELEPORTTI &&
                            sprite2.isku == 0 &&
                            sprite.isku == 0 &&
                            sprite2.energy > 0 &&
                            sprite.energy > 0 &&
                            sprite2.receivedDamage < 1) {
                            
                            // Tippuuko toinen sprite p��lle?
                            
                            if (sprite2.b > 2 && sprite2.weight >= 0.5 &&
                                sprite2.y < future.y && !sprite.proto.isObstacle() &&
                                sprite.proto.isDestructible()) {
                                //sprite.saatu_vahinko = (int)sprite2.paino;//1;
                                sprite.receivedDamage = Math.floor(sprite2.weight + sprite2.b / 4);
                                sprite.receivedDamageType = EDamageType.VAHINKO_PUDOTUS;
                                sprite2.jumpTimer = 1;
                            }
                            
                            // If there is another sprite damaging
                            if (sprite.proto.causedDamage > 0 && sprite2.proto.type != ESpriteType.TYYPPI_BONUS) {
                                
                                sprite2.causeDamage(sprite.proto.causedDamage, sprite.proto.causedDamageType);
                                
                                if (!(sprite2.pelaaja && false/*nakymattomyys*/)) //If sprite2 isn't a invisible player
                                    sprite.attack1Remaining = sprite.proto.attack1Duration; //Then sprite attack
                                
                                // The projectiles are shattered by shock
                                if (sprite2.proto.type == ESpriteType.TYYPPI_AMMUS) {
                                    sprite.causeDamage(1 /* JANNE / sprite2->tyyppi->vahinko */, sprite2.proto.causedDamageType);
                                }
                                
                                if (sprite.proto.type == ESpriteType.TYYPPI_AMMUS) {
                                    sprite.causeDamage(1 /* JANNE / sprite2->tyyppi->vahinko */, sprite2.proto.causedDamageType);
                                }
                            }
                        }
                    }
                    
                    // lis�t��n spriten painoon sit� koskettavan toisen spriten paino
                    if (sprite.weight > 0)
                        sprite.kytkinpaino += sprite2.proto.weight;
                }
            }
        }
        
        /*****************************************************************************************/
        /* If the sprite has suffered damage                                                     */
        /*****************************************************************************************/
        
        // 	// Just fire can damage a invisible player
        // 	if (nakymattomyys > 0 && sprite.saatu_vahinko != 0 && sprite.saatu_vahinko_tyyppi != VAHINKO_TULI &&
        // 		&sprite == Game::Sprites->player /*i == pelaaja_index*/) {
        // 		sprite.saatu_vahinko = 0;
        // 		sprite.saatu_vahinko_tyyppi = VAHINKO_EI;
        // 	}
        
        if (sprite.receivedDamage != 0 && sprite.energy > 0 && sprite.proto.isDestructible()) {
            if (sprite.proto.suojaus != sprite.receivedDamageType || sprite.proto.suojaus == EDamageType.VAHINKO_EI) {
                sprite.energy -= sprite.receivedDamage;
                
                Log.d(`[Game] Received damage; energy now is: ${ sprite.energy }`);
                
                sprite.knockTimer = VAHINKO_AIKA;
                
                if (sprite.receivedDamageType == EDamageType.VAHINKO_SAHKO)
                    sprite.knockTimer *= 6;
                
                this.playSpriteSound(sprite, ESound.AANI_VAHINKO, 100);
                
                if (sprite.proto.tuhoutuminen % 100 == EDestructionType.TUHOUTUMINEN_HOYHENET)
                    Effects.destruction(this, EDestructionType.TUHOUTUMINEN_HOYHENET, Math.floor(sprite.x), Math.floor(sprite.y));
                
                if (sprite.proto.type != ESpriteType.TYYPPI_AMMUS) {
                    this._particles.newParticle(EParticle.PARTICLE_STAR, future.x, future.y, -1, -1, 60, 0.01, 128);
                    this._particles.newParticle(EParticle.PARTICLE_STAR, future.x, future.y, 0, -1, 60, 0.01, 128);
                    this._particles.newParticle(EParticle.PARTICLE_STAR, future.x, future.y, 1, -1, 60, 0.01, 128);
                }
                
                // 			if (sprite.Onko_AI(AI_VAIHDA_KALLOT_JOS_OSUTTU))
                // 				kartta->Change_SkullBlocks();
                
                if (sprite.hasBehavior(EAi.AI_HYOKKAYS_1_JOS_OSUTTU)) {
                    sprite.attack1Remaining = sprite.proto.attack1Duration;
                    sprite.lataus = 0;
                }
                
                if (sprite.hasBehavior(EAi.AI_HYOKKAYS_2_JOS_OSUTTU)) {
                    sprite.attack2Remaining = sprite.proto.attack2Duration;
                    sprite.lataus = 0;
                }
            }
            
            sprite.causeDamage(0, EDamageType.VAHINKO_EI);
            
            /*****************************************************************************************/
            /* If the sprite is destroyed                                                            */
            /*****************************************************************************************/
            
            if (sprite.energy < 1) {
                let tuhoutuminen = sprite.proto.tuhoutuminen;
                
                if (tuhoutuminen != EDestructionType.TUHOUTUMINEN_EI_TUHOUDU) {
                    if (sprite.proto.bonusProto != null && sprite.proto.droppedBonusCount > 0)
                        if (sprite.proto.alwaysDropsBonusWhenDestroyed || rand() % 4 == 1)
                            for (let bi = 0; bi < sprite.proto.droppedBonusCount; bi++)
                                
                                this._sprites.addSprite(sprite.proto.bonusProto, false,
                                    future.x - 11 + (10 - rand() % 20), future.bottom - 16 - (10 + rand() % 20), sprite, true);
                    
                    // 				if (sprite.Onko_AI(AI_VAIHDA_KALLOT_JOS_TYRMATTY) && !sprite.Onko_AI(AI_VAIHDA_KALLOT_JOS_OSUTTU))
                    // 					kartta->Change_SkullBlocks();
                    
                    if (tuhoutuminen >= EDestructionType.TUHOUTUMINEN_ANIMAATIO)
                        tuhoutuminen -= EDestructionType.TUHOUTUMINEN_ANIMAATIO;
                    else
                        sprite.discard();
                    
                    // Effect on sprite disapears
                    Effects.destruction(this, tuhoutuminen, Math.floor(sprite.x), Math.floor(sprite.y));
                    this.playSound(sprite.proto.getSound(ESound.AANI_TUHOUTUMINEN), 100, sprite.x, sprite.y, sprite.proto.soundFreq, sprite.proto.soundRandomFreq);
                    
                    if (sprite.hasBehavior(EAi.AI_UUSI_JOS_TUHOUTUU)) {
                        this._sprites.addSprite(sprite.proto, false, sprite.initialX - sprite.proto.width, sprite.initialY - sprite.proto.height, sprite, false);
                    }
                    
                    if (sprite.proto.type === ESpriteType.TYYPPI_PELIHAHMO && sprite.proto.score !== 0) {
                        this.score(sprite.proto.score);
                        this.showFly(String(sprite.proto.score), this.context.font2, sprite.x - 8, sprite.y - 8, 80);
                    }
                } else {
                    sprite.energy = 1;
                }
            }
        }
        
        if (sprite.knockTimer === 0)
            sprite.receivedDamageType = EDamageType.VAHINKO_EI;
        
        
        /*****************************************************************************************/
        /* Revisions                                                                             */
        /*****************************************************************************************/
        
        if (!future.canGoRight)
            if (future.a > 0)
                future.a = 0;
        
        if (!future.canGoLeft)
            if (future.a < 0)
                future.a = 0;
        
        if (!future.canGoUp) {
            if (future.b < 0)
                future.b = 0;
            
            if (!hyppy_maximissa)
                sprite.jumpTimer = 95; //sprite.tyyppi->max_hyppy * 2;
        }
        
        if (!future.canGoDown)
            if (future.b >= 0) { //If sprite is falling
                if (sprite.jumpTimer > 0) {
                    if (sprite.jumpTimer >= 90 + 10) {
                        this.playSound(this.stuff.getSound(LAND_SOUND_CKEY),
                            0.3, future.x, future.y, (25050 - sprite.weight * 3000), true);
                        
                        // Janne
                        // Game::Particles->new_particle(	PARTICLE_DUST_CLOUDS,sprite_x+rand()%5-rand()%5-10,sprite_ala+rand()%3-rand()%3,
                        //			  0,-0.2,rand()%50+20,0,0);
                        
                        if (rand() % 7 == 1) {
                            this._particles.newParticle(EParticle.PARTICLE_SMOKE, future.x + rand() % 5 - rand() % 5 - 10, future.bottom + rand() % 3 - rand() % 3, 0.3, -0.1, 450, 0, 0);
                            this._particles.newParticle(EParticle.PARTICLE_SMOKE, future.x + rand() % 5 - rand() % 5 - 10, future.bottom + rand() % 3 - rand() % 3, -0.3, -0.1, 450, 0, 0);
                        }
                        
                        if (sprite.weight > 1)
                            this._vibration = 34 + Math.floor(sprite.weight * 20);
                    }
                    
                    sprite.jumpTimer = 0;
                }
                
                future.b = 0;
            }
        
        /*****************************************************************************************/
        /* Set correct values                                                                    */
        /*****************************************************************************************/
        
        if (future.b > 4.0)
            future.b = 4.0;
        
        if (future.b < -4.0)
            future.b = -4.0;
        
        if (future.a > future.maxSpeed)
            future.a = future.maxSpeed;
        
        if (future.a < -future.maxSpeed)
            future.a = -future.maxSpeed;
        
        if (sprite.energy > sprite.proto.energy)
            sprite.energy = sprite.proto.energy;
        
        if (sprite.knockTimer === 0 || sprite.pelaaja === 1) {
            future.x += future.a;
            future.y += future.b;
        }
        
        // if (sprite === this._sprites.player && future.b != 0) {
        //     console.log('b: ' + future.b + '\nsy: ' + sprite.y + '\nfy: ' + future.y + '\njT: ' + sprite.jumpTimer);
        // }
        
        if (sprite === this._sprites.player || sprite.energy < 1) {
            let kitka: number = 1.04;
            
            if (this.map.weather === ILMA_SADE || this.map.weather === ILMA_SADEMETSA)
                kitka = 1.03;
            
            if (this.map.weather === ILMA_LUMISADE)
                kitka = 1.01;
            
            if (!future.canGoDown)
                future.a /= kitka;
            else
                future.a /= 1.03;//1.02//1.05
            
            future.b /= 1.25;
        }
        
        sprite.x = future.x;
        sprite.y = future.y;
        sprite.a = future.a;
        sprite.b = future.b;
        
        
        sprite.rightIsBarrier = future.canGoRight;
        sprite.leftIsBarrier = future.canGoLeft;
        sprite.bottomIsBarrier = future.canGoDown;
        sprite.topIsBarrier = future.canGoUp;
        
        // Source comment:
        /*
         sprite.weight = sprite.tyyppi->paino;
         
         if (sprite.energy < 1 && sprite.weight == 0)
         sprite.weight = 1;*/
        
        if (sprite.jumpTimer < 0)
            sprite.bottomIsBarrier = false;
        
        // Source comment:
        //sprite.kyykky   = false;
        
        /*****************************************************************************************/
        /* AI                                                                                    */
        /*****************************************************************************************/
        
        // 	//TODO run sprite lua script
        //
        if (!sprite.isPlayer()) {
            for (let ai = 0; ai < SPRITE_MAX_AI; ai++) {
                switch (sprite.proto.getBehavior(ai)) {
                    case EAi.AI_EI:
                        ai = SPRITE_MAX_AI; // lopetetaan
                        break;
                    case EAi.AI_KANA:
                    case EAi.AI_PIKKUKANA:
                        sprite.AI_Chicken();
                        break;
                    case EAi.AI_SAMMAKKO1:
                        sprite.AI_Frog1();
                        break;
                    case EAi.AI_SAMMAKKO2:
                        sprite.AI_Frog2();
                        break;
                    case EAi.AI_BONUS:
                        sprite.AI_Bonus();
                        break;
                    case EAi.AI_MUNA:
                        sprite.AI_Egg();
                        break;
                    case EAi.AI_AMMUS:
                        sprite.AI_Projectile(/**/);
                        break;
                    case EAi.AI_HYPPIJA:
                        sprite.AI_Hyppija();
                        break;
                    case EAi.AI_PERUS:
                        sprite.AI_Perus();
                        break;
                    case EAi.AI_NONSTOP:
                        sprite.AI_NonStop();
                        break;
                    case EAi.AI_KAANTYY_ESTEESTA_HORI:
                        sprite.AI_TurnsBackBeacuseObstacleH(/**/);
                        break;
                    case EAi.AI_KAANTYY_ESTEESTA_VERT:
                        sprite.AI_TurnsBackBeacuseObstacleV(/**/);
                        break;
                    case EAi.AI_VAROO_KUOPPAA:
                        sprite.AI_Varoo_Kuoppaa();
                        break;
                    case EAi.AI_RANDOM_SUUNNANVAIHTO_HORI:
                        sprite.AI_Random_Suunnanvaihto_Hori();
                        break;
                    case EAi.AI_RANDOM_KAANTYMINEN:
                        sprite.AI_Random_Kaantyminen();
                        break;
                    case EAi.AI_RANDOM_HYPPY:
                        sprite.AI_Random_Hyppy();
                        break;
                    case EAi.AI_SEURAA_PELAAJAA:
                        if (this._nakymattomyys === 0) {
                            sprite.AI_FollowPlayer(this._sprites.player);
                        }
                        break;
                    case EAi.AI_SEURAA_PELAAJAA_JOS_NAKEE:
                        if (this._nakymattomyys === 0) {
                            sprite.AI_Seuraa_Pelaajaa_Jos_Nakee(this._sprites.player);
                        }
                        break;
                    case EAi.AI_SEURAA_PELAAJAA_VERT_HORI:
                        if (this._nakymattomyys === 0) {
                            sprite.AI_Seuraa_Pelaajaa_Vert_Hori(this._sprites.player);
                        }
                        break;
                    case EAi.AI_SEURAA_PELAAJAA_JOS_NAKEE_VERT_HORI:
                        if (this._nakymattomyys == 0) {
                            sprite.AI_Seuraa_Pelaajaa_Jos_Nakee_Vert_Hori(this._sprites.player);
                        }
                        break;
                    case EAi.AI_PAKENEE_PELAAJAA_JOS_NAKEE:
                        if (this.nakymattomyys == 0) {
                            sprite.AI_Pakenee_Pelaajaa_Jos_Nakee(this._sprites.player);
                        }
                        break;
                    case EAi.AI_POMMI:
                        sprite.AI_Pommi();
                        break;
                    case EAi.AI_HYOKKAYS_1_JOS_OSUTTU:
                        sprite.AI_Hyokkays_1_Jos_Osuttu();
                        break;
                    case EAi.AI_HYOKKAYS_2_JOS_OSUTTU:
                        sprite.AI_Hyokkays_2_Jos_Osuttu();
                        break;
                    case EAi.AI_HYOKKAYS_1_NONSTOP:
                        sprite.AI_Hyokkays_1_Nonstop();
                        break;
                    case EAi.AI_HYOKKAYS_2_NONSTOP:
                        sprite.AI_Hyokkays_2_Nonstop();
                        break;
                    // "Attack 1 if player is in front"
                    case EAi.AI_HYOKKAYS_1_JOS_PELAAJA_EDESSA:
                        if (this._nakymattomyys == 0)
                            sprite.AI_Hyokkays_1_Jos_Pelaaja_Edessa(this._sprites.player);
                        break;
                    // "Attack 2 if player is in front"
                    case EAi.AI_HYOKKAYS_2_JOS_PELAAJA_EDESSA:
                        if (this._nakymattomyys == 0)
                            sprite.AI_Hyokkays_2_Jos_Pelaaja_Edessa(this._sprites.player);
                        break;
                    // "Attack 1 if player is bellow"
                    case EAi.AI_HYOKKAYS_1_JOS_PELAAJA_ALAPUOLELLA:
                        if (this._nakymattomyys == 0)
                            sprite.AI_Hyokkays_1_Jos_Pelaaja_Alapuolella(this._sprites.player);
                        break;
                    // "Jump if player is above"
                    case EAi.AI_HYPPY_JOS_PELAAJA_YLAPUOLELLA:
                        if (this._nakymattomyys == 0)
                            sprite.AI_Hyppy_Jos_Pelaaja_Ylapuolella(this._sprites.player);
                        break;
                    case EAi.AI_VAHINGOITTUU_VEDESTA:
                        sprite.AI_Vahingoittuu_Vedesta();
                        break;
                    case EAi.AI_TAPA_KAIKKI:
                        sprite.AI_Tapa_Kaikki();
                        break;
                    case EAi.AI_KITKA_VAIKUTTAA:
                        sprite.AI_Kitka_Vaikuttaa();
                        break;
                    case EAi.AI_PIILOUTUU:
                        sprite.AI_Piiloutuu();
                        break;
                    case EAi.AI_PALAA_ALKUUN_X:
                        sprite.AI_Palaa_Alkuun_X();
                        break;
                    case EAi.AI_PALAA_ALKUUN_Y:
                        sprite.AI_Palaa_Alkuun_Y();
                        break;
                    case EAi.AI_LIIKKUU_X_COS:
                        sprite.AI_MovesX(this.entropy.cos(this.entropy.degree % 360));
                        break;
                    case EAi.AI_LIIKKUU_Y_COS:
                        sprite.AI_MovesY(this.entropy.cos(this.entropy.degree % 360));
                        break;
                    case EAi.AI_LIIKKUU_X_SIN:
                        sprite.AI_MovesX(this.entropy.sin(this.entropy.degree % 360));
                        break;
                    case EAi.AI_LIIKKUU_Y_SIN:
                        sprite.AI_MovesY(this.entropy.sin(this.entropy.degree % 360));
                        break;
                    case EAi.AI_LIIKKUU_X_COS_NOPEA:
                        sprite.AI_MovesX(this.entropy.cos((this.entropy.degree * 2) % 360));
                        break;
                    case EAi.AI_LIIKKUU_Y_SIN_NOPEA:
                        sprite.AI_MovesY(this.entropy.sin((this.entropy.degree * 2) % 360));
                        break;
                    case EAi.AI_LIIKKUU_X_COS_HIDAS:
                        sprite.AI_MovesX(this.entropy.cos((this.entropy.degree / 2) % 360));
                        break;
                    case EAi.AI_LIIKKUU_Y_SIN_HIDAS:
                        sprite.AI_MovesY(this.entropy.sin((this.entropy.degree / 2) % 360));
                        break;
                    case EAi.AI_LIIKKUU_Y_SIN_VAPAA:
                        sprite.AI_MovesY(this.entropy.sin((sprite.ajastin / 2) % 360));
                        break;
                    // "Change to morph prototype if energy < 2"
                    case EAi.AI_MUUTOS_JOS_ENERGIAA_ALLE_2:
                        if (sprite.proto.morphProto != null)
                            sprite.AI_Muutos_Jos_Energiaa_Alle_2(sprite.proto.morphProto);
                        break;
                    // "Change to morph prototype if energy > 1 and show smoke"
                    case EAi.AI_MUUTOS_JOS_ENERGIAA_YLI_1:
                        if (sprite.proto.morphProto != null) {
                            if (sprite.AI_Muutos_Jos_Energiaa_Yli_1(sprite.proto.morphProto) == true)
                                Effects.destruction(this, EDestructionType.TUHOUTUMINEN_SAVU_HARMAA, Math.floor(sprite.x), Math.floor(sprite.y));
                        }
                        break;
                    case EAi.AI_MUUTOS_AJASTIN:
                        if (sprite.proto.morphProto != null)
                            sprite.AI_Muutos_Ajastin(sprite.proto.morphProto);
                        break;
                    case EAi.AI_MUUTOS_JOS_OSUTTU:
                        if (sprite.proto.morphProto != null)
                            sprite.AI_Muutos_Jos_Osuttu(sprite.proto.morphProto);
                        break;
                    case EAi.AI_TELEPORTTI:
                        if (sprite.AI_Teleportti(this._sprites.player)) {
                            if (this.teleport(sprite, this._sprites.player)) {
                                this._camera.x = Math.floor(this._sprites.player.x);
                                this._camera.y = Math.floor(this._sprites.player.y);
                                this._dcameraX = this._camera.x - this.device.screenWidth / 2;
                                this._dcameraY = this._camera.y - this.device.screenHeight / 2;
                                // TODO: PisteDraw2_FadeIn(PD_FADE_NORMAL);
                                
                                if (sprite.proto.getSound(ESound.AANI_HYOKKAYS2) != null) {
                                    this.playMenuSound(sprite.proto.getSound(ESound.AANI_HYOKKAYS2), 100);
                                    // 															PK_Play_MenuSound(sprite.tyyppi->aanet[AANI_HYOKKAYS2], 100);
                                    // 															//PK_Play_Sound(, 100, Game::camera_x, Game::camera_y, SOUND_SAMPLERATE, false);
                                }
                            }
                        }
                        break;
                    case  EAi.AI_KIIPEILIJA:
                        sprite.AI_Climber(/**/);
                        break;
                    case EAi.AI_KIIPEILIJA2:
                        sprite.AI_Climber2(/**/);
                        break;
                    // "Kill sprite if parent sprite dies"
                    // 				case EAi.AI_TUHOUTUU_JOS_EMO_TUHOUTUU:	sprite.AI_Tuhoutuu_Jos_Emo_Tuhoutuu(Game::Sprites->spritet);
                    // 													break;
                    //
                    case EAi.AI_TIPPUU_TARINASTA:
                        sprite.AI_Tippuu_Tarinasta(this._vibration + this._kytkin_tarina);
                        break;
                    case EAi.AI_LIIKKUU_ALAS_JOS_KYTKIN1_PAINETTU:
                        sprite.AI_MovesWhenSwitchPressed(this.switchTimer1, 0, 1);
                        break;
                    case EAi.AI_LIIKKUU_YLOS_JOS_KYTKIN1_PAINETTU:
                        sprite.AI_MovesWhenSwitchPressed(this.switchTimer1, 0, -1);
                        break;
                    case EAi.AI_LIIKKUU_VASEMMALLE_JOS_KYTKIN1_PAINETTU:
                        sprite.AI_MovesWhenSwitchPressed(this.switchTimer1, -1, 0);
                        break;
                    case EAi.AI_LIIKKUU_OIKEALLE_JOS_KYTKIN1_PAINETTU:
                        sprite.AI_MovesWhenSwitchPressed(this.switchTimer1, 1, 0);
                        break;
                    case EAi.AI_LIIKKUU_ALAS_JOS_KYTKIN2_PAINETTU:
                        sprite.AI_MovesWhenSwitchPressed(this.switchTimer2, 0, 1);
                        break;
                    case EAi.AI_LIIKKUU_YLOS_JOS_KYTKIN2_PAINETTU:
                        sprite.AI_MovesWhenSwitchPressed(this.switchTimer2, 0, -1);
                        break;
                    case EAi.AI_LIIKKUU_VASEMMALLE_JOS_KYTKIN2_PAINETTU:
                        sprite.AI_MovesWhenSwitchPressed(this.switchTimer2, -1, 0);
                        break;
                    case EAi.AI_LIIKKUU_OIKEALLE_JOS_KYTKIN2_PAINETTU:
                        sprite.AI_MovesWhenSwitchPressed(this.switchTimer2, 1, 0);
                        break;
                    case EAi.AI_LIIKKUU_ALAS_JOS_KYTKIN3_PAINETTU:
                        sprite.AI_MovesWhenSwitchPressed(this.switchTimer3, 0, 1);
                        break;
                    case EAi.AI_LIIKKUU_YLOS_JOS_KYTKIN3_PAINETTU:
                        sprite.AI_MovesWhenSwitchPressed(this.switchTimer3, 0, -1);
                        break;
                    case EAi.AI_LIIKKUU_VASEMMALLE_JOS_KYTKIN3_PAINETTU:
                        sprite.AI_MovesWhenSwitchPressed(this.switchTimer3, -1, 0);
                        break;
                    case EAi.AI_LIIKKUU_OIKEALLE_JOS_KYTKIN3_PAINETTU:
                        sprite.AI_MovesWhenSwitchPressed(this.switchTimer3, 1, 0);
                        break;
                    case  EAi.AI_TIPPUU_JOS_KYTKIN1_PAINETTU:
                        sprite.AI_DripsWhenSwitchPressed(this.switchTimer1);
                        break;
                    case EAi.AI_TIPPUU_JOS_KYTKIN2_PAINETTU:
                        sprite.AI_DripsWhenSwitchPressed(this.switchTimer2);
                        break;
                    case EAi.AI_TIPPUU_JOS_KYTKIN3_PAINETTU:
                        sprite.AI_DripsWhenSwitchPressed(this.switchTimer3);
                        break;
                    case EAi.AI_RANDOM_LIIKAHDUS_VERT_HORI:
                        sprite.AI_Random_Liikahdus_Vert_Hori();
                        break;
                    case EAi.AI_KAANTYY_JOS_OSUTTU:
                        sprite.AI_TurnsIfHitted();
                        break;
                    // 				case AI_EVIL_ONE:					if (sprite.energy < 1) music_volume = 0;
                    // 													break;
                    //
                    case EAi.AI_INFO1:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info01));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO01));
                        }
                        break;
                    case EAi.AI_INFO2:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info02));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO02));
                        }
                        break;
                    case EAi.AI_INFO3:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info03));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO03));
                        }
                        break;
                    case EAi.AI_INFO4:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info04));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO04));
                        }
                        break;
                    case EAi.AI_INFO5:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info05));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO05));
                        }
                        break;
                    case EAi.AI_INFO6:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info06));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO06));
                        }
                        break;
                    case EAi.AI_INFO7:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info07));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO07));
                        }
                        break;
                    case EAi.AI_INFO8:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info08));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO08));
                        }
                        break;
                    case EAi.AI_INFO9:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info09));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO09));
                        }
                        break;
                    case EAi.AI_INFO10:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info10));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO10));
                        }
                        break;
                    case EAi.AI_INFO11:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info11));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO11));
                        }
                        break;
                    case EAi.AI_INFO12:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info12));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO12));
                        }
                        break;
                    case EAi.AI_INFO13:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info13));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO13));
                        }
                        break;
                    case EAi.AI_INFO14:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info14));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO14));
                        }
                        break;
                    case EAi.AI_INFO15:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info15));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO15));
                        }
                        break;
                    case EAi.AI_INFO16:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info16));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO16));
                        }
                        break;
                    case EAi.AI_INFO17:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info17));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO17));
                        }
                        break;
                    case EAi.AI_INFO18:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info18));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO18));
                        }
                        break;
                    case EAi.AI_INFO19:
                        if (sprite.AI_Info(this._sprites.player)) {
                            //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info19));
                            Log.l('[INFO] ', this.context.tx.get(TX.INFO19));
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        
        // Source
        //if (kaiku == 1 && sprite.tyyppi->tyyppi == TYYPPI_AMMUS && sprite.tyyppi->vahinko_tyyppi == VAHINKO_MELU &&
        //	sprite.tyyppi->aanet[AANI_HYOKKAYS1] > -1)
        //	PK_Play_Sound(sprite.tyyppi->aanet[AANI_HYOKKAYS1],20, (int)sprite_x, (int)sprite_y,
        //				  sprite.tyyppi->aani_frq, sprite.tyyppi->random_frq);
        
        
        /*****************************************************************************************/
        /* Set game area to sprite                                                               */
        /*****************************************************************************************/
        
        if (sprite.x < 0)
            sprite.x = 0;
        
        if (sprite.y < -future.height)
            sprite.y = -future.height;
        
        if (sprite.x > PK2KARTTA_KARTTA_LEVEYS * 32)
            sprite.x = PK2KARTTA_KARTTA_LEVEYS * 32;
        
        //if(sprite.x != sprite_x) printf("%f, %f\n", sprite.x, sprite_x);
        
        // If the sprite falls under the lower edge of the map
        if (sprite.y > PK2KARTTA_KARTTA_KORKEUS * 32 + future.height) {
            
            sprite.y = PK2KARTTA_KARTTA_KORKEUS * 32 + future.height;
            sprite.kill();
            sprite.discard();
            
            // if (sprite.kytkinpaino >= 1)
            // 	this._vibration = 50;
        }
        
        if (sprite.a > future.maxSpeed)
            sprite.a = future.maxSpeed;
        
        if (sprite.a < -future.maxSpeed)
            sprite.a = -future.maxSpeed;
        
        
        /*****************************************************************************************/
        /* Attacks 1 and 2                                                                       */
        /*****************************************************************************************/
        
        // If the sprite is ready and isn't crouching
        if (sprite.lataus == 0 && !sprite.isCrouched()) {
            // hy�kk�ysaika on "tapissa" mik� tarkoittaa sit�, ett� aloitetaan hy�kk�ys
            if (sprite.attack1Remaining == sprite.proto.attack1Duration) {
                // provides recovery time, after which the sprite can attack again
                sprite.lataus = sprite.proto.latausaika;
                if (sprite.lataus == 0) sprite.lataus = 5;
                // jos spritelle ei ole m��ritelty omaa latausaikaa ...
                if (sprite.ammo1Proto != null && sprite.proto.latausaika == 0)
                    // ... ja ammukseen on, otetaan latausaika ammuksesta
                    if (sprite.ammo1Proto._tulitauko > 0)
                        sprite.lataus = sprite.ammo1Proto._tulitauko;
                
                // soitetaan hy�kk�ys��ni
                this.playSpriteSound(sprite, ESound.AANI_HYOKKAYS1, 100);
                
                if (sprite.ammo1Proto != null) {
                    this._sprites.addAmmo(sprite.ammo1Proto, false, future.x, future.y, sprite);// Game::Sprites->add_ammo(sprite.ammus1,0,sprite_x, sprite_y, i);
                    
                    // Source:
                    //		if (Game::Sprites->protot[sprite.ammus1].aanet[AANI_HYOKKAYS1] > -1)
                    //			PK_Play_Sound(Game::Sprites->protot[sprite.ammus1].aanet[AANI_HYOKKAYS1],100, (int)sprite_x, (int)sprite_y,
                    //						  sprite.tyyppi->aani_frq, sprite.tyyppi->random_frq);
                }
            }
            
            // Sama kuin hy�kk�ys 1:ss�
            if (sprite.attack2Remaining == sprite.proto.attack2Duration) {
                sprite.lataus = sprite.proto.latausaika;
                if (sprite.lataus == 0) sprite.lataus = 5;
                if (sprite.ammo2Proto != null && sprite.proto.latausaika == 0)
                    if (sprite.ammo2Proto._tulitauko > 0)
                        sprite.lataus = sprite.ammo2Proto._tulitauko;
                
                this.playSpriteSound(sprite, ESound.AANI_HYOKKAYS2, 100);
                
                if (sprite.ammo2Proto != null) {
                    this._sprites.addAmmo(sprite.ammo2Proto, false, future.x, future.y, sprite);
                    
                    // Source:
                    //		if (Game::Sprites->protot[sprite.ammus2].aanet[AANI_HYOKKAYS1] > -1)
                    //			PK_Play_Sound(Game::Sprites->protot[sprite.ammus2].aanet[AANI_HYOKKAYS1],100, (int)sprite_x, (int)sprite_y,
                    //						  sprite.tyyppi->aani_frq, sprite.tyyppi->random_frq);
                }
            }
        }
        
        // Random sounds
        if (sprite.proto.getSound(ESound.AANI_RANDOM) != null && rand() % 200 == 1 && sprite.energy > 0) {
            this.playSound(sprite.proto.getSound(ESound.AANI_RANDOM), 80, sprite.x, sprite.y, sprite.proto.soundFreq, sprite.proto.soundRandomFreq);
        }
        
        //
        // 	// KEHITYSVAIHEEN APUTOIMINTOJA
        //
        // 	BYTE color;
        // 	DWORD plk;
        //
        // 	if (PisteInput_Keydown(PI_B) && dev_mode) { // Draw bounding box
        //
        // 		if (i == 0/*pelaaja_index*/) {
        //
        // 			char lukua[50];
        // 			itoa(palikat[1].yla,lukua,10);
        // 			//gcvt(sprite_a,7,lukua);
        // 			PisteDraw2_Font_Write(fontti1,lukua,310,50);
        //
        // 		}
        //
        // 		if (sprite.tyyppi->tiletarkistus)
        // 			for (x=0;x<palikat_x_lkm;x++) {
        // 				for (y=0;y<palikat_y_lkm;y++) {
        // 					color = 50-x*2-y*2;
        // 					plk = x+y*palikat_x_lkm;
        //
        // 					if (plk > 299)
        // 						plk = 299;
        //
        // 					//if (plk < 0)
        // 					//	plk = 0;
        //
        // 					if (!palikat[plk].tausta)
        // 						color += 32;
        //
        // 					PisteDraw2_ScreenFill(
        // 											palikat[plk].vasen-Game::camera_x,
        // 											palikat[plk].yla-Game::camera_y,
        // 											palikat[plk].oikea-Game::camera_x,
        // 											palikat[plk].ala-Game::camera_y,
        // 											color);
        // 				}
        // 			}
        //
        // 		PisteDraw2_ScreenFill(
        // 								(int)(sprite_vasen-Game::camera_x),
        // 								(int)(sprite_yla-Game::camera_y),
        // 								(int)(sprite_oikea-Game::camera_x),
        // 								(int)(sprite_ala-Game::camera_y),
        // 								30);
        //
        // 	}
        //
        //
        //
        // 	return 0;
    }
    
    private _updateBonusSpriteMovement(sprite: Sprite): void {
        const future: SpriteFuture = sprite.getPackedAttributes();
        
        let x = 0;
        let y = 0;
        
        let kartta_vasen = 0;
        let kartta_yla = 0;
        
        // Decrease timers
        if (sprite.knockTimer > 0)
            sprite.knockTimer--;
        if (sprite.lataus > 0)
            sprite.lataus--;
        if (sprite.muutos_ajastin > 0) // aika muutokseen
            sprite.muutos_ajastin--;
        
        // Hyppyyn liittyv�t seikat
        
        if (this._kytkin_tarina + this._vibration > 0 && sprite.jumpTimer == 0)
            sprite.jumpTimer = sprite.proto.maxJump / 2;
        
        if (sprite.jumpTimer > 0 && sprite.jumpTimer < sprite.proto.maxJump) {
            sprite.jumpTimer += (1);
            future.b = (sprite.proto.maxJump - sprite.jumpTimer) / -4.0;//-2
        }
        
        if (future.b > 0) {
            sprite.jumpTimer = sprite.proto.maxJump;
        }
        
        if (sprite.weight != 0) {
            // Gravity
            future.b += (sprite.weight + future.b / 1.25);
            
            if (sprite.inWater) {
                if (future.b > 0) {
                    future.b /= 2.0;
                }
                
                if (rand() % 80 == 1)
                    this._particles.newParticle(EParticle.PARTICLE_SPARK, future.x - 4, future.y, 0, -0.5 - rand() % 2, rand() % 30 + 30, 0, 32);
            }
            
            sprite.inWater = false;
            
            sprite.kytkinpaino = sprite.weight;
            
            // 		/* TOISET SPRITET */
            
            // Check collision with other sprites
            let sprite2: Sprite;
            let collider: BlockCollider;
            // ·
            for (let sprite_index = 0; sprite_index < MAX_SPRITES; sprite_index++) {
                sprite2 = this._sprites.get(sprite_index);
                
                if (sprite2 != sprite && !sprite2.isDiscarded()) {
                    if (sprite2.proto.isObstacle() && sprite.proto.collidesWithBlocks) {
                        if (future.x - future.width / 2 + future.a <= sprite2.x + sprite2.proto.width / 2 &&
                            future.x + future.width / 2 + future.a >= sprite2.x - sprite2.proto.width / 2 &&
                            future.y - future.height / 2 + future.b <= sprite2.y + sprite2.proto.height / 2 &&
                            future.y + future.height / 2 + future.b >= sprite2.y - sprite2.proto.height / 2) {
                            
                            // ~ sprite collider
                            collider = sprite2.getCollider(collider);
                            
                            // Juande
                            // PK_Block_Set_Barriers only undo the next lines
                            // So all these are unnecessary
                            //
                            // // Equivalent to getCollider(true)
                            // if (!spritet[sprite_index].tyyppi->este_alas)
                            // 	spritepalikka.alas		 = PALIKKA_TAUSTA;
                            // if (!spritet[sprite_index].tyyppi->este_ylos)
                            // 	spritepalikka.ylos		 = PALIKKA_TAUSTA;
                            // if (!spritet[sprite_index].tyyppi->este_oikealle)
                            // 	spritepalikka.oikealle   = PALIKKA_TAUSTA;
                            // if (!spritet[sprite_index].tyyppi->este_vasemmalle)
                            // 	spritepalikka.vasemmalle = PALIKKA_TAUSTA;
                            //
                            // PK_Block_Set_Barriers(spritepalikka);
                            
                            this._checkBlocks2(sprite, collider, future);
                        }
                    }
                    
                    if (future.x < sprite2.x + sprite2.proto.width / 2 &&
                        future.x > sprite2.x - sprite2.proto.width / 2 &&
                        future.y < sprite2.y + sprite2.proto.height / 2 &&
                        future.y > sprite2.y - sprite2.proto.height / 2 &&
                        sprite.isku == 0) {
                        
                        if (sprite2.proto.type != ESpriteType.TYYPPI_BONUS &&
                            !(sprite2 === this._sprites.player && sprite.proto.isDestructible())) {
                            
                            future.a += sprite2.a * (rand() % 4);
                        }
                        
                        // lis�t��n spriten painoon sit� koskettavan toisen spriten paino
                        sprite.kytkinpaino += sprite2.proto.weight;
                        
                        // samanmerkkiset spritet vaihtavat suuntaa t�rm�tess��n
                        if (sprite.proto.index == sprite2.proto.index &&
                            sprite2.energy > 0) {
                            if (sprite.x < sprite2.x) {
                                sprite2.a += sprite.a / 3.0;
                                future.canGoRight = false;
                            }
                            if (sprite.x > sprite2.x) {
                                sprite2.a += sprite.a / 3.0;
                                future.canGoLeft = false;
                            }
                            
                            // Janne
                            // if (sprite.y < spritet[sprite_index].y)
                            // future.	alas = false;
                            // if (sprite.y > spritet[sprite_index].y)
                            //    future.ylos = false;*/
                        }
                    }
                }
            }
            
            // Limit the speed
            if (future.b > 4) /***/ future.b = 4;
            if (future.b < -4) /**/ future.b = -4;
            if (future.a > 3) /***/ future.a = 3;
            if (future.a < -3) /**/ future.a = -3;
            
            // Lasketaan (calculated)
            // Blocks colision -
            
            // TODO: Duplicated
            let palikat_x_lkm: int;
            let palikat_y_lkm: int;
            
            if (sprite.proto.collidesWithBlocks) { //Find the tiles that the sprite occupies
                // Number of blocks to check
                palikat_x_lkm = Math.floor((future.width) / 32) + 4; //Number of blocks
                palikat_y_lkm = Math.floor((future.height) / 32) + 4;
                
                // Position in tile map (upper-left corner)
                kartta_vasen = Math.floor((future.left) / 32);
                kartta_yla = Math.floor((future.top) / 32);
                
                // Not necessary
                // 		for (y=0;y<palikat_y_lkm;y++)
                // 			for (x=0;x<palikat_x_lkm;x++) //For each block, create a array of blocks around the sprite
                // 				// palikat[x+(y*palikat_x_lkm)] = PK_Block_Get(kartta_vasen+x-1,kartta_yla+y-1); //x = 0, y = 0
                // this._blocks.getFgBlock(x, y);
                
                // Tutkitaan törmääkö palikkaan
                
                let collider: BlockCollider;
                for (y = 0; y < palikat_y_lkm; y++) {
                    for (x = 0; x < palikat_x_lkm; x++) {
                        collider = this._blocks.getBlockCollider(kartta_vasen + x - 1, kartta_yla + y - 1);
                        this._checkBlocks(sprite, future, collider);
                    }
                }
                
                // Janne
                // PK_Check_Blocks_Debug(sprite, palikat[x+y*palikat_x_lkm],
                // 		sprite_x,
                // 		sprite_y,
                // 		sprite_a,
                // 		sprite_b,
                // 		sprite_vasen,
                // 		sprite_oikea,
                // 		sprite_yla,
                // 		sprite_ala,
                // 		sprite_leveys,
                // 		sprite_korkeus,
                // 		kartta_vasen,
                // 		kartta_yla,
                // 		oikealle,
                // 		vasemmalle,
                // 		ylos,
                // 		alas);
            }
            
            // Enters or exist from water, splash
            if (future.inWater !== sprite.inWater) {
                Effects.splash(this, Math.floor(future.x), Math.floor(future.y), 32);
            }
            
            // Bounce
            if (!future.canGoRight) {
                if (future.a > 0)
                    future.a = -future.a / 1.5;
            }
            
            if (!future.canGoLeft) {
                if (future.a < 0)
                    future.a = -future.a / 1.5;
            }
            
            if (!future.canGoUp) {
                if (future.b < 0)
                    future.b = 0;
                
                sprite.jumpTimer = sprite.proto.maxSpeed;
            }
            
            if (!future.canGoDown) {
                if (future.b >= 0) {
                    if (sprite.jumpTimer > 0) {
                        sprite.jumpTimer = 0;
                        // Janne
                        //	if (/*future.b == 4*/!maassa)
                        //		PK_Play_Sound(tomahdys_aani,20,(int)future.x, (int)future.y,
                        //				      int(25050-sprite.tyyppi->paino*4000),true);
                    }
                    
                    if (future.b > 2)
                        future.b = -future.b / (3 + rand() % 2);
                    else
                        future.b = 0;
                }
                // Janne / future.a /= kitka;
                future.a /= 1.07;
            } else {
                future.a /= 1.02;
            }
            
            future.b /= 1.5;
            
            // Limit the speed
            if (future.b > 4) /***/ future.b = 4;
            if (future.b < -4) /**/ future.b = -4;
            if (future.a > 4) /***/ future.a = 4;
            if (future.a < -4) /**/ future.a = -4;
            
            // Apply speed
            future.x += future.a;
            future.y += future.b;
            
            // Set changes
            sprite.x = future.x;
            sprite.y = future.y;
            sprite.a = future.a;
            sprite.b = future.b;
            
            sprite.rightIsBarrier = future.canGoRight;
            sprite.leftIsBarrier = future.canGoLeft;
            sprite.bottomIsBarrier = future.canGoDown;
            sprite.topIsBarrier = future.canGoUp;
            
        } else {	// jos spriten paino on nolla, tehd��n spritest� "kelluva"
            sprite.y = sprite.initialY + this.context.entropy.cos(Math.floor(this.context.entropy.degree + (sprite.initialX + sprite.initialY)) % 360) / 3.0;
            future.y = sprite.y;
        }
        
        sprite.weight = sprite.initialWeight;
        
        let tuhoutuminen: EDestructionType;
        
        // Check if player touches bonus
        if (future.x < this._sprites.player.x + this._sprites.player.proto.width / 2 &&
            future.x > this._sprites.player.x - this._sprites.player.proto.width / 2 &&
            future.y < this._sprites.player.y + this._sprites.player.proto.height / 2 &&
            future.y > this._sprites.player.y - this._sprites.player.proto.height / 2 &&
            sprite.isku == 0) {
            
            // Both player and bonus have to be alive
            if (sprite.energy > 0 && this._sprites.player.energy > 0) {
                if (sprite.proto.score != 0) {
                    this.score(sprite.proto.score);
                    this.showFly(
                        String(sprite.proto.score),
                        (sprite.proto.score >= 50) ? this.context.font2 : this.context.font1,
                        sprite.x - 8, sprite.y - 8);
                }
                
                if (sprite.hasBehavior(EAi.AI_BONUS_AIKA)) {
                    this.increase_time += sprite.proto.latausaika;
                    Log.d('[Game] Level timeout increased (+', sprite.proto.latausaika, ' ticks)');
                }
                
                if (sprite.hasBehavior(EAi.AI_BONUS_NAKYMATTOMYYS)) {
                    this.nakymattomyys = sprite.proto.latausaika;
                    Log.d('[Game] Invisible for ', sprite.proto.latausaika, ' ticks');
                }
                
                // Janne / kartta->spritet[(int)(sprite.alku_x/32) + (int)(sprite.alku_y/32)*PK2KARTTA_KARTTA_LEVEYS] = 255;
                
                if (sprite.proto.causedDamage != 0 && sprite.proto.isDestructible()) {
                    this._sprites.player.energy -= sprite.proto.causedDamage;
                    // Janne
                    //if (player->energy > player->proto.energy){ //TODO - set correct energy
                    //	player->energy = player->proto.energy;
                    //}
                }
                
                tuhoutuminen = sprite.proto.tuhoutuminen;
                
                if (tuhoutuminen != EDestructionType.TUHOUTUMINEN_EI_TUHOUDU) {
                    if (tuhoutuminen >= EDestructionType.TUHOUTUMINEN_ANIMAATIO) {
                        tuhoutuminen -= EDestructionType.TUHOUTUMINEN_ANIMAATIO;
                    } else {
                        if (sprite.proto.isKey()) {
                            this._keys--;
                            
                            if (this._keys < 1)
                                this._blocks.openLocks();
                        }
                        
                        sprite.discard();
                    }
                    
                    if (sprite.hasBehavior(EAi.AI_UUSI_JOS_TUHOUTUU)) {
                        const ax = sprite.initialX;//-sprite.tyyppi->leveys;
                        const ay = sprite.initialY - sprite.proto.height / 2.0;
                        // 					PkEngine::Sprites->add(sprite.tyyppi->indeksi,0,ax-17, ay,i, false);
                        for (let r = 1; r < 6; r++)
                            this._particles.newParticle(EParticle.PARTICLE_SPARK,
                                ax + rand() % 10 - rand() % 10, ay + rand() % 10 - rand() % 10,
                                0, 0, rand() % 100,
                                0.1, 32);
                    }
                    
                    if (sprite.proto.bonusProto != null) {
                        this._gifts.add(sprite.proto.bonusProto);
                    }
                    
                    if (sprite.proto.morphProto != null) {
                        if (sprite.proto.morphProto.getBehavior(0) != EAi.AI_BONUS) {
                            this._sprites.player.morph(sprite.proto.morphProto);
                            this._sprites.player.y -= this._sprites.player.proto.height / 2;
                            
                            Log.d('[Game] Pekka has been transformed');
                        }
                    }
                    
                    if (sprite.proto.ammo1Proto != null) {
                        this._sprites.player.ammo1Proto = sprite.proto.ammo1Proto;
                        //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.game_newegg));
                    }
                    
                    if (sprite.proto.ammo2Proto != null) {
                        this._sprites.player.ammo2Proto = sprite.proto.ammo2Proto;
                        //PK_Start_Info(tekstit->Hae_Teksti(PK_txt.game_newdoodle));
                    }
                    
                    this.playSound(sprite.proto.getSound(ESound.AANI_TUHOUTUMINEN), 100, sprite.x, sprite.y, sprite.proto.soundFreq, sprite.proto.soundRandomFreq);
                    
                    Effects.destruction(this, tuhoutuminen, Math.floor(future.x), Math.floor(future.y));
                }
            }
        }
        
        for (let i = 0; i < SPRITE_MAX_AI; i++) {
            if (sprite.proto.getBehavior(i) === EAi.AI_EI) {
                break;
            }
            
            switch (sprite.proto.getBehavior(i)) {
                case EAi.AI_BONUS:
                    sprite.AI_Bonus();
                    break;
                
                case EAi.AI_PERUS:
                    sprite.AI_Perus();
                    break;
                
                case EAi.AI_MUUTOS_AJASTIN:
                    if (sprite.proto.morphProto != null)
                        sprite.AI_Muutos_Ajastin(sprite.proto.morphProto);
                    break;
                
                case EAi.AI_TIPPUU_TARINASTA:
                    sprite.AI_Tippuu_Tarinasta(this._vibration + this._kytkin_tarina);
                    break;
                
                default:
                    break;
            }
        }
        
        // The energy doesn't matter that the player is a bonus item
        if (sprite.pelaaja != 0) {
            sprite.kill();
        }
    }
    
    /**
     * Check if the specified *sprite* is going to collide with the provided *block*,
     * updating the given *future* as necessary.
     * CPP: PK_Tutki_Seina (2 args).
     * SDL: PK_Check_Blocks.
     */
    private _checkBlocks(sprite: Sprite, future: SpriteFuture, block: BlockCollider): void {
        let mask_index: int;
        
        //If sprite is in the block (NO 255)
        if (future.x <= block.right && future.x >= block.left && future.y <= block.bottom && future.y >= block.top) {
            
            /**********************************************************************/
            /* Examine if block is water background                               */
            /**********************************************************************/
            if (block.water)
                sprite.inWater = true;
            
            /**********************************************************************/
            /* Examine if it touches the fire                                     */
            /**********************************************************************/
            if (block.code === EBlockPrototype.BLOCK_TULI && this.switchTimer1 === 0 && sprite.knockTimer === 0) {
                sprite.receivedDamage = 2;
                sprite.receivedDamageType = EDamageType.VAHINKO_TULI;
            }
            
            /**********************************************************************/
            /* Examine if bloc is hideout                                         */
            /**********************************************************************/
            if (block.code === EBlockPrototype.BLOCK_PIILO)
                sprite.hidden = true;
            
            /**********************************************************************/
            /* Examine if block is the exit                                       */
            /**********************************************************************/
            if (block.code === EBlockPrototype.BLOCK_LOPETUS && sprite.isPlayer()) {
                // if (!jakso_lapaisty){
                // 	if (PisteSound_StartMusic("music/hiscore.xm") != 0){
                // 		PK2_error = true;
                // 		PK2_error_msg = "Can't find hiscore.xm";
                // 	}
                // 	jakso_lapaisty = true;
                // 	jaksot[jakso_indeksi_nyt].lapaisty = true;
                // 	if (jaksot[jakso_indeksi_nyt].jarjestys == jakso)
                // 		jakso++; //Increase level
                // 	music_volume = settings.music_max_volume;
                // 	music_volume_now = settings.music_max_volume - 1;
                // }
                Log.l('[Game] Level completed');
            }
        }
        
        // If sprite is thouching the block
        if (future.left <= block.right - 4 && future.right >= block.left + 4 && future.top <= block.bottom && future.bottom >= block.top + 16) {
            /**********************************************************************/
            /* Examine if it touches the fire                                     */
            /**********************************************************************/
            if (block.code === EBlockPrototype.BLOCK_TULI && this.switchTimer1 === 0 && sprite.knockTimer === 0) {
                sprite.receivedDamage = 2;
                sprite.receivedDamageType = EDamageType.VAHINKO_TULI;
            }
        }
        
        // Examine if there is a block on bottom
        if ((block.code < 80 || block.code > 139) && block.code !== EBlockPrototype.BLOCK_ESTO_ALAS && block.code < 150) {
            mask_index = Math.floor((future.x + future.a) - block.left);
            
            if (mask_index < 0)
                mask_index = 0;
            
            if (mask_index > 31)
                mask_index = 31;
            
            // PND: block.top += palikkamaskit[block.code].alas[mask_index];
            block.top += block.bottomMask[mask_index];
            
            if (block.top >= block.bottom - 2)
                block.bottomIsBarrier = false;
            
            block.bottom -= block.topMask[mask_index];
        }
        
        // If sprite is thouching the block (again?)
        if (future.left <= block.right + 2 && future.right >= block.left - 2 && future.top <= block.bottom && future.bottom >= block.top) {
            /**********************************************************************/
            /* Examine if it is a key and touches lock wall                       */
            /**********************************************************************/
            if (block.code === EBlockPrototype.BLOCK_LUKKO && sprite.proto.isKey()) {
                this._blocks.removeFg(block.i, block.j);
                this._blocks.calculateEdges();
                
                sprite.discard();
                
                if (sprite.proto.isDestructible()) {
                    this._keys--;
                    
                    if (this._keys < 1)
                        this._blocks.openLocks();
                }
                
                Effects.explosion(this,
                    block.left + (BLOCK_SIZE / 2), // (32 -> 16)
                    block.top + Math.floor(BLOCK_SIZE / 3.2),// (32 -> 10)
                    0);
                
                this.playSound(this.stuff.getSound(LOCK_OPEN_SOUND_CKEY), 1, future.x, future.y);
            }
            
            /**********************************************************************/
            /* Make wind effects                                                  */
            /**********************************************************************/
            if (block.code === EBlockPrototype.BLOCK_VIRTA_VASEMMALLE && future.canGoLeft)
                future.a -= 0.02;
            
            if (block.code === EBlockPrototype.BLOCK_VIRTA_OIKEALLE && future.canGoRight)
                future.a += 0.02;	//0.05
            
            /*********************************************************************/
            /* Examine if sprite is on the border to fall                        */
            /*********************************************************************/
            if (block.edge && sprite.jumpTimer <= 0 && future.y < block.bottom && future.y > block.top) {
                /* && sprite_ala <= block.ala+2)*/ // onko sprite tullut reunalle
                if (future.left > block.left)
                    sprite.reuna_vasemmalla = true;
                
                if (future.right < block.right)
                    sprite.reuna_oikealla = true;
            }
        }
        
        // Examine walls on left and right
        
        if (future.top < block.bottom && future.bottom - 1 > block.top) {
            if (future.right + future.a - 1 > block.left && future.left + future.a < block.right) {
                // Examine whether the sprite going in the right side of the block.
                if (future.right + future.a < block.right) {
                    // Onko palikka sein�?
                    if (block.rightIsBarrier) {
                        future.canGoRight = false;
                        
                        if (block.code === EBlockPrototype.BLOCK_ELEVATOR_H)
                            future.x = block.left - future.width / 2;
                    }
                }
                // Examine whether the sprite going in the left side of the block.
                if (future.left + future.a > block.left) {
                    if (block.leftIsBarrier) {
                        future.canGoLeft = false;
                        
                        if (block.code === EBlockPrototype.BLOCK_ELEVATOR_H)
                            future.x = block.right + future.width / 2;
                    }
                }
            }
        }
        
        future.left = future.x - future.width / 2;
        future.right = future.x + future.width / 2;
        
        // Examine walls on up and down
        if (future.left < block.right && future.right - 1 > block.left) { //Remove the left and right blocks
            if (future.bottom + future.b - 1 >= block.top && future.top + future.b <= block.bottom) { //Get the up and down blocks
                if (future.bottom + future.b - 1 <= block.bottom) { //Just in the sprite's foot
                    if (block.bottomIsBarrier) { //If it is a wall
                        future.canGoDown = false;
                        if (block.code === EBlockPrototype.BLOCK_ELEVATOR_V)
                            future.y = block.top - future.height / 2;
                        
                        if (future.bottom - 1 >= block.top && future.b >= 0) {
                            //sprite_y -= sprite_ala - block.yla;
                            if (block.code !== EBlockPrototype.BLOCK_ELEVATOR_H) {
                                future.y = block.top - future.height / 2;
                            }
                        }
                        
                        if (sprite.kytkinpaino >= 1) { // Sprite can press the buttons
                            if (block.code === EBlockPrototype.BLOCK_SWITCH1 && this.switchTimer1 === 0) {
                                this._swichTimer1 = KYTKIN_ALOITUSARVO;
                                this._kytkin_tarina = 64;
                                
                                this.playSound(this.stuff.getSound(SWITCH_SOUND_CKEY), 1, future.x, future.y);
                                
                                Log.d(`[Game] Switch 1 activated`);
                            }
                            
                            if (block.code === EBlockPrototype.BLOCK_SWITCH2 && this.switchTimer2 === 0) {
                                this._swichTimer2 = KYTKIN_ALOITUSARVO;
                                this._kytkin_tarina = 64;
                                
                                this.playSound(this.stuff.getSound(SWITCH_SOUND_CKEY), 1, future.x, future.y);
                                
                                Log.d(`[Game] Switch 2 activated`);
                            }
                            
                            if (block.code === EBlockPrototype.BLOCK_SWITCH3 && this.switchTimer3 === 0) {
                                this._swichTimer3 = KYTKIN_ALOITUSARVO;
                                this._kytkin_tarina = 64;
                                
                                this.playSound(this.stuff.getSound(SWITCH_SOUND_CKEY), 1, future.x, future.y);
                                
                                Log.d(`[Game] Switch 3 activated`);
                            }
                        }
                    }
                }
                
                if (future.top + future.b > block.top) {
                    if (block.topIsBarrier) {
                        future.canGoUp = false;
                        
                        if (future.top < block.bottom) {
                            if (block.code === EBlockPrototype.BLOCK_ELEVATOR_V && sprite.crouched) {
                                sprite.receivedDamage = 2;
                                sprite.receivedDamageType = EDamageType.VAHINKO_ISKU;
                            }
                            
                            if (block.code !== EBlockPrototype.BLOCK_ELEVATOR_H) {
                                // Source commented:
                                // if (sprite.kyykky)
                                //	sprite_y = block.ala + sprite_korkeus /2;
                                
                                sprite.crouched = true;
                            }
                        }
                    }
                }
            }
        }
    }
    
    /**
     * CPP: PK_Tutki_Seina (17 args).
     * SDL: PK_Check_Blocks2.
     */
    private _checkBlocks2(sprite: Sprite, block: BlockCollider, future: SpriteFuture) {
        //left and right
        if (future.top < block.bottom && future.bottom - 1 > block.top) {
            if (future.right + future.a - 1 > block.left && future.left + future.a < block.right) {
                // Tutkitaan onko sprite menossa oikeanpuoleisen palikan sis��n.
                if (future.right + future.a < block.right) {
                    // Onko block sein�?
                    if (block.rightIsBarrier) {
                        future.canGoRight = false;
                        if (block.code == EBlockPrototype.BLOCK_ELEVATOR_H)
                            future.x = block.left - future.width / 2;
                    }
                }
                
                if (future.left + future.a > block.left) {
                    if (block.leftIsBarrier) {
                        future.canGoLeft = false;
                        
                        if (block.code == EBlockPrototype.BLOCK_ELEVATOR_H)
                            future.x = block.right + future.width / 2;
                        
                    }
                }
            }
        }
        
        future.left = future.x - future.width / 2;
        future.right = future.x + future.width / 2;
        
        //ceil and floor
        
        if (future.left < block.right && future.right - 1 > block.left) {
            if (future.bottom + future.b - 1 >= block.top && future.top + future.b <= block.bottom) {
                if (future.bottom + future.b - 1 <= block.bottom) {
                    if (block.bottomIsBarrier) {
                        future.canGoDown = false;
                        
                        if (block.code == EBlockPrototype.BLOCK_ELEVATOR_V)
                            future.y = block.top - future.height / 2;
                        
                        if (future.bottom - 1 >= block.top && future.b >= 0)
                            if (block.code != EBlockPrototype.BLOCK_ELEVATOR_H)
                                future.y = block.top - future.height / 2;
                    }
                }
                
                if (future.top + future.b > block.top) {
                    if (block.topIsBarrier) {
                        future.canGoUp = false;
                        
                        if (future.top < block.bottom)
                            if (block.code != EBlockPrototype.BLOCK_ELEVATOR_H)
                                sprite.crouched = true;
                    }
                }
            }
        }
    }
    
    /**
     * SDL: PK_Draw_InGame_BG (1/2).
     */
    private _addBackground(): void {
        this._bgImage = new DwTilingSprite(this._bgTexture, this.device.screenWidth * 4, this.device.screenHeight * 4);
        this.composition.setBgImage(this._bgImage);
        
        this._updateBackground();
    }
    
    /**
     * SDL: PK_Draw_InGame_BG (2/2).
     */
    private _updateBackground(): void {
        let pallarx: int = (this.cameraX % (640 * 3)) / 3;
        let pallary: int = (this.cameraY % (480 * 3)) / 3;
        
        switch (this.map.bgMovement) {
            case EBgImageMovement.TAUSTA_STAATTINEN:
                this._bgImage.x = 0;
                this._bgImage.y = 0;
                break;
            case EBgImageMovement.TAUSTA_PALLARX_HORI:
                this._bgImage.x = -pallarx;
                this._bgImage.y = 0;
                break;
            case EBgImageMovement.TAUSTA_PALLARX_VERT:
                this._bgImage.x = 0;
                this._bgImage.y = -pallary;
                break;
            case EBgImageMovement.TAUSTA_PALLARX_VERT_JA_HORI:
                this._bgImage.x = -pallarx;
                this._bgImage.y = -pallary;
                break;
        }
        
        this._bgImage.x += this.cameraX;
        this._bgImage.y += this.cameraY;
    }
    
    public teleport(src: Sprite, sprite: Sprite): boolean {
        const destinations: Sprite[] = [];
        let queried: Sprite[];
        
        // Destinations of the same prototype (self-excluding)
        queried = this._sprites.getByPrototype(src.proto).filter(s => s !== src);
        destinations.push(...queried);
        
        // If no destination found, include destinations of different prototype
        if (destinations.length === 0) {
            queried = this._sprites.getByType(ESpriteType.TYYPPI_TELEPORTTI);
            destinations.push(...queried);
        }
        
        // If no destination found, teleport can't be done
        if (destinations.length === 0)
            return false;
        
        // 			if (porttien_maara > 1119/*599*/)
        // 				porttien_maara = 1119/*599*/;
        
        const dst = destinations[Math.floor(Math.random() * destinations.length)];
        
        // Teleport
        sprite.x = dst.x;
        sprite.y = dst.y;
        // Janne / lataus    = tyyppi->latausaika;
        // Janne / hyokkays1 = tyyppi->hyokkays1_aika;
        // Janne / spritet[i].lataus    = spritet[i].tyyppi->latausaika;
        dst.attack1Remaining = dst.proto.attack1Duration;
        src.lataus = 0;
        dst.lataus = 0;
        
        return true;
    }
    
    public useGift(): void {
        if (this._gifts.count == 0) {
            Log.d('[Game] There is no gifts to use.');
            return;
        }
        
        const giftProto = this._gifts.take();
        this._sprites.addSprite(giftProto, false,
            this._sprites.player.x - giftProto.width, this._sprites.player.y,
            null, false);
        
        Log.d('[Game] Gift used: ', giftProto.name, '.');
    }
    
    public score(score: number): void {
        this._scoreBuffer += score;
        Log.d('[Game] Score ', (score > 0 ? '+' : '-'), score, ' -> ', (this._score + this._scoreBuffer));
    }
    
    /**
     * SDL: ~PK_Fadetext_New (in game)
     *
     * @param text
     * @param font
     * @param x
     * @param y
     * @param ticks
     * @param translate
     */
    public showFly(text: string, font: PkFont, x: number, y: number, ticks: uint = 100, translate: boolean = false): void {
        const fly = new Fly(this.context, text, font, x, y, ticks, translate);
        this._flies.add(fly);
        this.composition.addOverlay(fly);
    }
    
    /**
     *  SDL: ~PK_Fadetext_Update (in game)
     */
    private _updateOverlays(): void {
        this._flies.forEach(fly => {
            fly.tick();
            if (fly.isDone()) {
                this._flies.delete(fly);
            }
        });
    }
}

export const TEXTURE_ID_BGIMAGE = 'PK·BGIMAGE';
export const TEXTURE_ID_BLOCKS = 'PK·BLOCKS';
