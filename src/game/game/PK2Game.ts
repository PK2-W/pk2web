/* eslint-disable @typescript-eslint/camelcase */
import { GameComposition } from '@game/game/GameComposition';
import { GameEnv } from '@game/game/GameEnv';
import { GiftManager } from '@game/gift/GiftManager';
import {
    PK2KARTTA_KARTTA_LEVEYS,
    PK2KARTTA_KARTTA_KORKEUS,
    PK2Map,
    BLOCK_TULI,
    KYTKIN_ALOITUSARVO, EBgMovement
} from '@game/map/PK2Map';
import { PK2Context } from '@game/PK2Context';
import { PK2Sprite, EDamageType, EDestructionType } from '@game/sprite/PK2Sprite';
import { SpriteAttributes } from '@game/sprite/SpriteAttributes';
import { SpriteManager } from '@game/sprite/SpriteManager';
import { EProtoType } from '@game/sprite/SpritePrototype';
import { Block, EBlocks } from '@game/tile/Block';
import { EBlockProtoCode } from '@game/tile/BlockConstants';
import { BlockManager } from '@game/tile/BlockManager';
import { ResourceNotFoundError } from '@ng/error/ResourceNotFoundError';
import { pathJoin } from '@ng/support/utils';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';
import { PkTextureTk } from '@ng/toolkit/PkTextureTk';
import { MAX_SPRITES, PK2GAMELOOP, RESOURCES_PATH } from '../../support/constants';
import { int, rand, bool, uint, DWORD } from '../../support/types';

export class PK2Game {
    private readonly _enviroment: GameEnv;
    
    private _episodeName: string;
    
    /** Level completed */
    private _jakso_lapaisty: boolean = false;
    
    private _bgImage: PIXI.Container;
    // PK2BLOCKMASKI palikkamaskit[BLOCK_MAX_MASKEJA];
    // PK2::Particle_System* Particles;
    private _sprites: SpriteManager;
    private _gifts: GiftManager;
    private _blocks: BlockManager;
    
    // PK2Kartta* current_map;
    // char map_path[PE_PATH_SIZE];
    //
    private _vibration: int;
    
    private _cameraX: int;
    private _cameraY: int;
    private _dcameraX: number;
    private _dcameraY: number;
    private _dcameraA: number;
    private _dcameraB: number;
    
    /// >  Timing
    
    /** Indicates if level has countdown. */
    private _aikaraja: boolean = false;                 // REPL
    /** Remaining time if level has countdown. */
    private _timeout: uint = 0;                         // REPL
    
    /// >  Game current status
    
    /** @deprecated Use gameOver instead. */
    private _peli_ohi;
    private _gameOver: bool = false;
    private _paused: boolean;
    
    
    private _kytkin_tarina: int = 0; // "shaking switch", here for now
    
    public constructor(ctx: PK2Context, map: PK2Map) {
        this._enviroment = new GameEnv(ctx, map);
        
        this._gifts = new GiftManager(this._enviroment);
        this._blocks = new BlockManager(this._enviroment);
        this._sprites = new SpriteManager(this._enviroment);
        
        this._paused = false;
        
        this._sprites.onSpriteCreated((sprite) => {
            if (sprite.proto.type === EProtoType.TYYPPI_TAUSTA) {
                this._composition.addBgSprite(sprite);
            } else {
                this._composition.addSprite(sprite);
            }
        }, this);
    }
    
    /**
     * Source: PK_MainScreen_Change -> if (game_next_screen == SCREEN_GAME)
     */
    public async xChangeToGame() {  // "start game"
        
        // PND PK_UI_Change(UI_GAME_BUTTONS);
        // PND PisteDraw2_SetXOffset(0);
        
        // PND if (jaksot[jakso_indeksi_nyt].lapaisty)
        // PND     uusinta = true;
        // PND else
        // PND     uusinta = false;
        
        if (!false/*episode_started*/) {
            this._jakso_lapaisty = false;
            
            /////  Source: PK_Map_Open --------
            
            this.loadBgImage(this.map.fpath, this.map.bgImageFilename);
            
            // PND	PK_New_Save();
            
            if (this.map.version === '1.2' || this.map.version === '1.3') {
                // TODO try catch
                await this._sprites.loadPrototypes(this.map, 'rooster island 1');
            }
            
            // 	PK_Palikka_Tee_Maskit();  // "make masks" (draws!)
            
            this._sprites.addMapSprites(this.map);
            this._sprites.startDirections();
            
            this.selectStart();
            // 	kartta->Calculate_Edges();
            
            // 	PkEngine::Particles->clear_particles();
            // 	PkEngine::Particles->load_bg_particles(kartta);
            
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
            this.addBackground();
            
            // Prepare blocks
            this._blocks.generatePrototypes();
            await this._blocks.loadTextures(this.map.fpath, this.map.getBlockTexturesLocation());
            this._blocks.placeBgBlocks();
            
            // x->   PK_Fadetext_Init(); //Reset fade text
            
            //      Game::Gifts->clean();
            //    episode_started = true;
            //      music_volume = settings.music_max_volume;
            this.ctx.entropy.degree = 0;
            //      item_paneeli_x = -215;
            //      piste_lisays = 0;
        } else {
            // PND  degree = degree_temp;
        }
        
        // Now game_screen = SCREEN_GAME
    }
    
    /**
     * Sourfce: PK_MainScreen_InGame
     */
    public gameLoop(delta: number): void {
        // 	PK2Kartta_Animoi(_degree, palikka_animaatio/7, kytkin1, kytkin2, kytkin3, false);
        this.updateCamera();
        
        // 	PkEngine::Particles->update();
        
        if (!this._paused) {
            // ---IF level is not passed AND (level is with timeout AND timeout is not dued)
            // if (!this._jakso_lapaisty && (!aikaraja || timeout > 0))
            this.updateSprites();
            // PK_Fadetext_Update();
        }
        
        // 	PK_Draw_InGame(); ¬
        this.updateBackground();
        
        this._blocks.calculateMovableBlocksPosition();
        
        if (!this._paused) {
            // Increment degreee
            this.ctx.entropy.degree = (delta * PK2GAMELOOP / 1000) + this.ctx.entropy.degree % 359;
            
            // Decrement timers
            this.ctx.entropy.tickTimers(delta);
            
            
            // 		if (info_timer > 0)
            // 			info_timer--;
            //
            // 		if (piste_lisays > 0){
            // 			jakso_pisteet++;
            // 			piste_lisays--;
            // 		}
            
            // REPL: THIS IS THE LOGIC IN CHARGE OF COUNT SECONDS
            //       THIS HAS TO BE REPLACED
            //  if (this._aikaraja && !this._jakso_lapaisty) {
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
        
        if (this._sprites.player.energia < 1 && !this._gameOver) {
            this._gameOver = true;
            // 		key_delay = 50;
        }
        
        // 	if (key_delay > 0)
        // 		key_delay--;
        
        if (this._jakso_lapaisty || this._gameOver) {
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
        // 			if (this._jakso_lapaisty) game_next_screen = SCREEN_SCORING;
        // 			else game_next_screen = SCREEN_MAP;
        // 		}
        // 	}
        
        // REPL
        // 	if (key_delay == 0){
        // 		if (PisteInput_Keydown(settings.control_open_gift) && PkEngine::Sprites->player->energia > 0){
        // 			PkEngine::Gifts->use();
        // 			key_delay = 10;
        // 		}
        // 		if (PisteInput_Keydown(PI_P) && !this._jakso_lapaisty){
        // 			paused = !paused;
        // 			key_delay = 20;
        // 		}
        // 		if (PisteInput_Keydown(PI_DELETE))
        // 			PkEngine::Sprites->player->energia = 0;
        // 		if (PisteInput_Keydown(PI_TAB)){
        // 			PkEngine::Gifts->change_order();
        // 			key_delay = 10;
        // 		}
        // 		if (!dev_mode)
        // 			if (PisteInput_Keydown(PI_I)) {
        // 				show_fps = !show_fps;
        // 				key_delay = 20;
        // 			}
        // 		if (PisteInput_Keydown(PI_F)) {
        // 			show_fps = !show_fps;
        // 			key_delay = 20;
        // 		}
        // 	}
        
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
        // 				PkEngine::Sprites->player->energia = 10;
        // 				key_delay = 20;
        // 			}
        // 			if (PisteInput_Keydown(PI_END)) {
        // 				key_delay = 20;
        // 				if (PisteSound_StartMusic("music/hiscore.xm") != 0){
        // 					PK2_error = true;
        // 					PK2_error_msg = "Can't find hiscore.xm";
        // 				}
        // 				this._jakso_lapaisty = true;
        // 				jaksot[jakso_indeksi_nyt].lapaisty = true;
        // 				if (jaksot[jakso_indeksi_nyt].jarjestys == jakso)
        // 					jakso++;
        // 				music_volume = settings.music_max_volume;
        // 				music_volume_now = settings.music_max_volume - 1;
        // 			}
        // 			if (PisteInput_Keydown(PI_LSHIFT)/* && key_delay == 0*/) {
        // 				//key_delay = 20;
        // 				for (int r = 1; r<6; r++)
        // 					//PkEngine::Particles->new_particle(PARTICLE_SPARK, player->x + rand() % 10 - rand() % 10, player->y + rand() % 10 - rand() % 10, 0, 0, rand() % 100, 0.1, 32);
        // 					PkEngine::Particles->new_particle(PARTICLE_SPARK, PkEngine::Sprites->player->x + rand() % 10 - rand() % 10, PkEngine::Sprites->player->y + rand() % 10 - rand() % 10, 0, 0, rand() % 100, 0.1, 32);
        // 				*PkEngine::Sprites->player = PK2Sprite(&PkEngine::Sprites->protot[PROTOTYYPPI_KANA], 1, false, PkEngine::Sprites->player->x, PkEngine::Sprites->player->y);
        // 			}
        // 		}
        // 		if (PisteInput_Keydown(PI_U))
        // 			PkEngine::Sprites->player->b = -10;
        // 		if (PisteInput_Keydown(PI_E))
        // 			PkEngine::Sprites->player->energia = PkEngine::Sprites->player->tyyppi->energia;
        // 		if (PisteInput_Keydown(PI_V))
        // 			nakymattomyys = 3000;
        // 	}
    }
    
    private selectStart(): void {
        const startPos = this.map.getStartPosition();
        
        const playerPosX = startPos.x + this._sprites.player.proto.width / 2;
        const playerPosY = startPos.y + this._sprites.player.proto.height / 2;
        
        this._sprites.player.x = playerPosX;
        this._cameraX = Math.floor(playerPosX);
        this._dcameraX = playerPosX;
        
        this._sprites.player.y = playerPosY;
        this._cameraY = Math.floor(playerPosY);
        this._dcameraY = playerPosY;
    }
    
    private async loadBgImage(fpath: string, fname: string): void {
        let uri: string;
        let found: boolean;
        let image: HTMLImageElement;
        let baseTexture: PIXI.BaseTexture;
        
        // First, try to fetch the resource from provided location
        uri = pathJoin(pathJoin(RESOURCES_PATH, fpath), fname);
        try {
            image = await PkAssetTk.getImage(uri);
            found = true;
        } catch (err) {
            if (!(err instanceof ResourceNotFoundError)) {
                // TODO: Improve
                throw err;
            }
        }
        
        // If not found, try to fetch the resource from default location
        if (!found) {
            uri = pathJoin(pathJoin(RESOURCES_PATH, 'gfx/scenery/'), fname);
            
            try {
                image = await PkAssetTk.getImage(uri);
            } catch (err) {
                throw err;
            }
        }
        
        // for (x=0;x<640;x++)
        //     for (y=0;y<480;y++)
        //     {
        //         color = buffer[x+y*leveys];
        //
        //         if (color == 255)
        //             color--;
        //
        //         buffer[x+y*leveys] = color;
        //     }
        
        // Create the base texture
        baseTexture = PkTextureTk.imageToBaseTexture(image);
        
        this.ctx.textureCache.add(TEXTURE_ID_BGIMAGE, baseTexture);
    }
    
    /**
     * Source: PK_Update_Camera.
     */
    private updateCamera(): void {
        this._cameraX = Math.floor(this._sprites.player.x - this.ctx.screenWidth / 2);
        this._cameraY = Math.floor(this._sprites.player.y - this.ctx.screenHeight / 2);
        
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
        
        if (this._dcameraX !== this._cameraX)
            this._dcameraA = (this._cameraX - this._dcameraX) / 15;
        
        if (this._dcameraY !== this._cameraY)
            this._dcameraB = (this._cameraY - this._dcameraY) / 15;
        
        if (this._dcameraA > 6)
            this._dcameraA = 6;
        
        if (this._dcameraA < -6)
            this._dcameraA = -6;
        
        if (this._dcameraB > 6)
            this._dcameraB = 6;
        
        if (this._dcameraB < -6)
            this._dcameraB = -6;
        
        this._dcameraX += this._dcameraA;
        this._dcameraY += this._dcameraB;
        
        this._cameraX = Math.floor(this._dcameraX);
        this._cameraY = Math.floor(this._dcameraY);
        
        if (this._cameraX < 0)
            this._cameraX = 0;
        
        if (this._cameraY < 0)
            this._cameraY = 0;
        
        if (this._cameraX > Math.floor(PK2KARTTA_KARTTA_LEVEYS - this.ctx.screenWidth / 32) * 32)
            this._cameraX = Math.floor(PK2KARTTA_KARTTA_LEVEYS - this.ctx.screenWidth / 32) * 32;
        
        if (this._cameraY > Math.floor(PK2KARTTA_KARTTA_KORKEUS - this.ctx.screenHeight / 32) * 32)
            this._cameraY = Math.floor(PK2KARTTA_KARTTA_KORKEUS - this.ctx.screenHeight / 32) * 32;
    }
    
    /**
     * Source: PK_Update_Sprites.
     */
    public updateSprites(): void {
        // 	debug_active_sprites = 0;
        let sprite: PK2Sprite;
        
        for (let i = 0; i < MAX_SPRITES; i++) { //Activate sprite if it is on screen
            sprite = this._sprites.get(i);
            
            if (sprite.x < this._cameraX + 640 + 320 && //screen_width+screen_width/2 &&
                sprite.x > this._cameraX - 320 && //screen_width/2 &&
                sprite.y < this._cameraY + 480 + 240 && //screen_height+screen_height/2 &&
                sprite.y > this._cameraY - 240) {//screen_height/2)
                sprite.aktiivinen = true;
            } else {
                sprite.aktiivinen = false;
            }
            
            if (sprite.piilota) {
                sprite.aktiivinen = false;
            }
        }
        
        for (let i = 0; i < MAX_SPRITES; i++) {
            sprite = this._sprites.get(i);
            
            if (sprite.aktiivinen && sprite.proto.type !== EProtoType.TYYPPI_TAUSTA) {
                if (sprite.proto.type === EProtoType.TYYPPI_BONUS) {
                    this.updateBonusSpriteMovement(sprite);
                } else {
                    this.updateSpriteMovement(sprite);
                }
                
                // debug_active_sprites++;
            }
        }
    }
    
    /**
     * Source: PK_Sprite_Movement.
     *
     * @param i
     */
    private updateSpriteMovement(sprite: PK2Sprite): void {
        // TODO - Caution with this: Dead sprites are going to be updated
        if (sprite.proto == null)
            return;
        
        const future = sprite.getPackedAttributes();
        
        let x = 0;
        let y = 0;
        
        let kartta_vasen = 0;
        let kartta_yla = 0;
        
        sprite.kyykky = false;
        
        sprite.reuna_vasemmalla = false;
        sprite.reuna_oikealla = false;
        
        
        // Limit max speed if energy is to low
        if (sprite.energia < 1)
            future.maxSpeed = 3;
        
        // Calculate the remainder of the sprite towards
        
        if (sprite.remainingAttack1 > 0)
            sprite.remainingAttack1--;
        
        if (sprite.remainingAttack2 > 0)
            sprite.remainingAttack2--;
        
        if (sprite.lataus > 0)	// aika kahden ampumisen (munimisen) v�lill�
            sprite.lataus--;
        
        if (sprite.muutos_ajastin > 0)	// aika muutokseen
            sprite.muutos_ajastin--;
        
        /*****************************************************************************************/
        /* Player-sprite and its controls                                                        */
        /*****************************************************************************************/
        
        let lisavauhti = true;  // "extra speed"
        let hidastus = false;  // "slow motion"
        
        // 	PisteInput_Lue_Eventti();
        if (/*sprite.pelaaja != 0 && sprite.energia > 0*/1 === 1) {
            // 		/* SLOW WALK */
            // 		if (PisteInput_Keydown(settings.control_walk_slow))
            // 			lisavauhti = false;
            
            // 		/* ATTACK 1 */
            // 		if (PisteInput_Keydown(settings.control_attack1) && sprite.lataus == 0 && sprite.ammus1 != -1)
            // 			sprite.hyokkays1 = sprite.tyyppi->hyokkays1_aika;
            // 		/* ATTACK 2 */
            // 		else if (PisteInput_Keydown(settings.control_attack2) && sprite.lataus == 0 && sprite.ammus2 != -1)
            // 				sprite.hyokkays2 = sprite.tyyppi->hyokkays2_aika;
            
            // 		/* CROUCH */
            // 		sprite.kyykky = false;
            // 		if (PisteInput_Keydown(settings.control_down) && !sprite.alas) {
            // 			sprite.kyykky = true;
            // 			sprite_yla += spriteHeight/1.5;
            // 		}
            
            // 		double a_lisays = 0;
            
            // 		/* NAVIGATING TO RIGHT */
            // 		if (PisteInput_Keydown(settings.control_right)) {
            // 			a_lisays = 0.04;//0.08;
            
            // 			if (lisavauhti) {
            // 				if (rand()%20 == 1 && sprite.animaatio_index == ANIMAATIO_KAVELY) // Draw dust
            // 					Game::Particles->new_particle(PARTICLE_DUST_CLOUDS,future.x-8,sprite_ala-8,0.25,-0.25,40,0,0);
            
            // 				a_lisays += 0.09;//0.05
            // 			}
            
            // 			if (sprite.alas)
            // 				a_lisays /= 1.5;//2.0
            //
            // 			sprite.flip_x = false;
            // 		}
            //
            // 		/* NAVIGATING TO LEFT */
            // 		if (PisteInput_Keydown(settings.control_left)) {
            // 			a_lisays = -0.04;
            
            // 			if (lisavauhti) {
            // 				if (rand()%20 == 1 && sprite.animaatio_index == ANIMAATIO_KAVELY) { // Draw dust
            // 					Game::Particles->new_particle(PARTICLE_DUST_CLOUDS,future.x-8,sprite_ala-8,-0.25,-0.25,40,0,0);
            // 				}
            
            // 				a_lisays -= 0.09;
            // 			}
            
            // 			if (sprite.alas)	// spriten koskettaessa maata kitka vaikuttaa
            // 				a_lisays /= 1.5;//2.0
            
            // 			sprite.flip_x = true;
            // 		}
            
            // 		if (sprite.kyykky)	// Slow when couch
            // 			a_lisays /= 10;
            //
            // 		sprite_a += a_lisays;
            //
            // 		/* JUMPING */
            // 		if (sprite.tyyppi->paino > 0) {
            // 			if (PisteInput_Keydown(settings.control_jump)) {
            // 				if (!sprite.kyykky) {
            // 					if (sprite.jumpTimer == 0)
            // 						PK_Play_Sound(hyppy_aani, 100, (int)future.x, (int)sprite_y,
            // 									  sprite.tyyppi->aani_frq, sprite.tyyppi->random_frq);
            //
            // 					if (sprite.jumpTimer <= 0)
            // 						sprite.jumpTimer = 1; //10;
            // 				}
            // 			} else {
            // 				if (sprite.jumpTimer > 0 && sprite.jumpTimer < 45)
            // 					sprite.jumpTimer = 55;
            // 			}
            //
            // 			/* tippuminen hiljaa alasp�in */
            // 			if (PisteInput_Keydown(settings.control_jump) && sprite.jumpTimer >= 150/*90+20*/ &&
            // 				sprite.tyyppi->liitokyky)
            // 				hidastus = true;
            // 		}
            // 		/* MOVING UP AND DOWN */
            // 		else { // if the player sprite-weight is 0 - like birds
            //
            // 			if (PisteInput_Keydown(settings.control_jump))
            // 				sprite_b -= 0.15;
            //
            // 			if (PisteInput_Keydown(settings.control_down))
            // 				sprite_b += 0.15;
            //
            // 			sprite.jumpTimer = 0;
            // 		}
            //
            // 		/* AI */
            // 		for (int ai=0;ai < SPRITE_MAX_AI;ai++)
            // 			switch (sprite.tyyppi->AI[ai]){
            //
            // 			case AI_MUUTOS_JOS_ENERGIAA_ALLE_2:
            // 				if (sprite.tyyppi->muutos > -1)
            // 					sprite.AI_Muutos_Jos_Energiaa_Alle_2(Game::Sprites->protot[sprite.tyyppi->muutos]);
            // 			break;
            //
            // 			case AI_MUUTOS_JOS_ENERGIAA_YLI_1:
            // 			if (sprite.tyyppi->muutos > -1)
            // 				if (sprite.AI_Muutos_Jos_Energiaa_Yli_1(Game::Sprites->protot[sprite.tyyppi->muutos])==1)
            // 					Effect::Destruction(TUHOUTUMINEN_SAVU_HARMAA, (DWORD)sprite.x, (DWORD)sprite.y);
            // 			break;
            //
            // 			case AI_MUUTOS_AJASTIN:
            // 				if (sprite.tyyppi->muutos > -1)
            // 					sprite.AI_Muutos_Ajastin(Game::Sprites->protot[sprite.tyyppi->muutos]);
            // 			break;
            //
            // 			case AI_VAHINGOITTUU_VEDESTA:
            // 				sprite.AI_Vahingoittuu_Vedesta();
            // 			break;
            //
            // 			case AI_MUUTOS_JOS_OSUTTU:
            // 				if (sprite.tyyppi->muutos > -1)
            // 					sprite.AI_Muutos_Jos_Osuttu(Game::Sprites->protot[sprite.tyyppi->muutos]);
            // 			break;
            //
            // 			default: break;
            // 			}
            //
            // 		/* It is not acceptable that a player is anything other than the game character */
            // 		if (sprite.tyyppi->tyyppi != TYYPPI_PELIHAHMO)
            // 			sprite.energia = 0;
        }
        
        /*****************************************************************************************/
        /* Jump                                                                                  */
        /*****************************************************************************************/
        
        let hyppy_maximissa: boolean = sprite.jumpTimer >= 90;
        
        // Jos ollaan hyp�tty / ilmassa:
        if (sprite.jumpTimer > 0) {
            if (sprite.jumpTimer < 50 - sprite.proto.max_hyppy)
                sprite.jumpTimer = 50 - sprite.proto.max_hyppy;
            
            if (sprite.jumpTimer < 10)
                sprite.jumpTimer = 10;
            
            if (!hyppy_maximissa) {
                //sprite_b = (sprite.tyyppi->max_hyppy/2 - sprite.jumpTimer/2)/-2.0;//-4
                future.b = -this.ctx.entropy.getSin(sprite.jumpTimer) / 8; //(sprite.tyyppi->max_hyppy/2 - sprite.jumpTimer/2)/-2.5;
                if (future.b > sprite.proto.maxJump) {
                    future.b = sprite.proto.maxJump / 10.0;
                    sprite.jumpTimer = 90 - sprite.jumpTimer;
                }
            }
            
            if (sprite.jumpTimer < 180)
                sprite.jumpTimer += 2;
        }
        
        if (sprite.jumpTimer < 0)
            sprite.jumpTimer++;
        
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
            future.b += sprite.weight / 1.25; // + future.b/1.5;
        
        if (hidastus && future.b > 0) // If gliding
            future.b /= 1.3; //1.5; //3
        
        /*****************************************************************************************/
        /* By default, the sprite is not in the water and not hidden                             */
        /*****************************************************************************************/
        
        sprite.inWater = false;
        sprite.piilossa = false;
        
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
        
        if (/* TODO sprite.proto.tiletarkistus*/ true) { //Find the tiles that the sprite occupies
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
            //this._blocks.getFgBlock(x, y);
            
            /*****************************************************************************************/
            /* Going through the blocks around the sprite.                                           */
            /*****************************************************************************************/
            
            palikat_lkm = palikat_y_lkm * palikat_x_lkm;
            for (y = 0; y < palikat_y_lkm; y++) {
                for (x = 0; x < palikat_x_lkm; x++) {
                    const block = this._blocks.getFgBlock(x, y);
                    p = x + y * palikat_x_lkm;
                    // 				if (p<300)// && p>=0)//{
                    // 					//if(sprite.pelaaja == 1) printf("%i\n",palikat_lkm);
                    this.checkBlocks(sprite, future, block);
                    // 				//}
                }
            }
        }
        /*****************************************************************************************/
        /* If the sprite is under water                                                          */
        /*****************************************************************************************/
        
        if (sprite.inWater) {
            if (!sprite.proto.canSwim() || sprite.energia < 1) {
                /*
                if (future.b > 0)
                   future.b /= 2.0;

                sprite_b -= (1.5-sprite.weight)/10;*/
                future.b /= 2.0;
                future.a /= 1.05;
                
                if (sprite.jumpTimer > 0 && sprite.jumpTimer < 90)
                    sprite.jumpTimer--;
            }
            
            // 		if (rand()%80 == 1)
            // 			Game::Particles->new_particle(PARTICLE_SPARK,future.x-4,sprite_y,0,-0.5-rand()%2,rand()%30+30,0,32);
        }
        
        // If sprite enters or exist from water
        if (future.inWater !== sprite.inWater) {
            // 		Effect::Splash((int)future.x,(int)future.y,32);
        }
        
        /*****************************************************************************************/
        /* Sprite weight                                                                         */
        /*****************************************************************************************/
        
        sprite.weight = sprite.alkupaino;
        sprite.kytkinpaino = sprite.weight;
        
        if (sprite.energia < 1 && sprite.weight === 0) // Fall when is death
            sprite.weight = 1;
        
        /*****************************************************************************************/
        /* Sprite collision with other sprites                                                   */
        /*****************************************************************************************/
        
        // 	int tuhoutuminen;
        // 	double sprite2_yla; // kyykistymiseen liittyv�
        // 	PK2BLOCK spritepalikka;
        //
        // 	PK2Sprite *sprite2;
        //
        // 	//Compare this sprite with every sprite in the game
        // 	for (int sprite_index = 0; sprite_index < MAX_SPRITEJA; sprite_index++) {
        // 		sprite2 = &Game::Sprites->spritet[sprite_index];
        //
        // 		if (sprite_index != i && /*!sprite2->piilota*/sprite2->aktiivinen) {
        // 			if (sprite2->kyykky)
        // 				sprite2_yla = sprite2->tyyppi->korkeus / 3;//1.5;
        // 			else
        // 				sprite2_yla = 0;
        //
        // 			if (sprite2->tyyppi->este && sprite.tyyppi->tiletarkistus) { //If there is a block sprite active
        //
        // 				if (future.x-spriteWidth/2 +sprite_a  <= sprite2->x + sprite2->tyyppi->leveys /2 &&
        // 					future.x+spriteWidth/2 +sprite_a  >= sprite2->x - sprite2->tyyppi->leveys /2 &&
        // 					sprite_y-spriteHeight/2+sprite_b <= sprite2->y + sprite2->tyyppi->korkeus/2 &&
        // 					sprite_y+spriteHeight/2+sprite_b >= sprite2->y - sprite2->tyyppi->korkeus/2)
        // 				{
        // 					spritepalikka.koodi = 0;
        // 					spritepalikka.ala   = (int)sprite2->y + sprite2->tyyppi->korkeus/2;
        // 					spritepalikka.oikea = (int)sprite2->x + sprite2->tyyppi->leveys/2;
        // 					spritepalikka.vasen = (int)sprite2->x - sprite2->tyyppi->leveys/2;
        // 					spritepalikka.yla   = (int)sprite2->y - sprite2->tyyppi->korkeus/2;
        //
        // 					spritepalikka.vesi  = false;
        //
        // 					//spritepalikka.koodi = BLOCK_HISSI_VERT;
        // 					/*
        // 					PK_Block_Set_Barriers(spritepalikka);
        //
        // 					if (!sprite.tyyppi->este)
        // 					{
        // 						if (!sprite2->tyyppi->este_alas)
        // 							spritepalikka.alas		 = BLOCK_TAUSTA;
        // 						if (!sprite2->tyyppi->este_ylos)
        // 							spritepalikka.ylos		 = BLOCK_TAUSTA;
        // 						if (!sprite2->tyyppi->este_oikealle)
        // 							spritepalikka.oikealle   = BLOCK_TAUSTA;
        // 						if (!sprite2->tyyppi->este_vasemmalle)
        // 							spritepalikka.vasemmalle = BLOCK_TAUSTA;
        // 					}
        // 					*/
        //
        // 					PK_Block_Set_Barriers(spritepalikka);
        //
        // 					if (!sprite.tyyppi->este){
        // 						if (!sprite2->tyyppi->este_alas)
        // 							spritepalikka.alas = BLOCK_TAUSTA;
        // 						if (!sprite2->tyyppi->este_ylos)
        // 							spritepalikka.ylos = BLOCK_TAUSTA;
        // 						if (!sprite2->tyyppi->este_oikealle)
        // 							spritepalikka.oikealle = BLOCK_TAUSTA;
        // 						if (!sprite2->tyyppi->este_vasemmalle)
        // 							spritepalikka.vasemmalle = BLOCK_TAUSTA;
        // 					}
        //
        // 					if (sprite2->a > 0)
        // 						spritepalikka.koodi = BLOCK_HISSI_HORI;
        //
        // 					if (sprite2->b > 0)
        // 						spritepalikka.koodi = BLOCK_HISSI_VERT;
        //
        // 					PK_Check_Blocks2(sprite, spritepalikka); //Colision sprite and sprite block
        // 				}
        // 			}
        //
        // 			if (future.x <= sprite2->x + sprite2->tyyppi->leveys /2 &&
        // 				future.x >= sprite2->x - sprite2->tyyppi->leveys /2 &&
        // 				sprite_y/*yla*/ <= sprite2->y + sprite2->tyyppi->korkeus/2 &&
        // 				sprite_y/*ala*/ >= sprite2->y - sprite2->tyyppi->korkeus/2 + sprite2_yla)
        // 			{
        // 				// samanmerkkiset spritet vaihtavat suuntaa t�rm�tess��n
        // 				if (sprite.tyyppi->indeksi == sprite2->tyyppi->indeksi &&
        // 					sprite2->energia > 0/* && sprite.pelaaja == 0*/)
        // 				{
        // 					if (sprite.x < sprite2->x)
        // 						oikealle = false;
        // 					if (sprite.x > sprite2->x)
        // 						vasemmalle = false;
        // 					if (sprite.y < sprite2->y)
        // 						alas = false;
        // 					if (sprite.y > sprite2->y)
        // 						ylos = false;
        // 				}
        //
        // 				if (sprite.tyyppi->Onko_AI(AI_NUOLET_VAIKUTTAVAT)) {
        //
        // 					if (sprite2->tyyppi->Onko_AI(AI_NUOLI_OIKEALLE)) {
        // 						sprite_a = sprite.tyyppi->max_nopeus / 3.5;
        // 						sprite_b = 0;
        // 					}
        // 					else if (sprite2->tyyppi->Onko_AI(AI_NUOLI_VASEMMALLE)) {
        // 						sprite_a = sprite.tyyppi->max_nopeus / -3.5;
        // 						sprite_b = 0;
        // 					}
        //
        // 					if (sprite2->tyyppi->Onko_AI(AI_NUOLI_YLOS)) {
        // 						sprite_b = sprite.tyyppi->max_nopeus / -3.5;
        // 						sprite_a = 0;
        // 					}
        // 					else if (sprite2->tyyppi->Onko_AI(AI_NUOLI_ALAS)) {
        // 						sprite_b = sprite.tyyppi->max_nopeus / 3.5;
        // 						sprite_a = 0;
        // 					}
        // 				}
        //
        // 				/* spritet voivat vaihtaa tietoa pelaajan olinpaikasta */
        // 	/*			if (sprite.pelaaja_x != -1 && sprite2->pelaaja_x == -1)
        // 				{
        // 					sprite2->pelaaja_x = sprite.pelaaja_x + rand()%30 - rand()%30;
        // 					sprite.pelaaja_x = -1;
        // 				} */
        //
        //
        // 				if (sprite.vihollinen != sprite2->vihollinen && sprite.emosprite != sprite_index) {
        // 					if (sprite2->tyyppi->tyyppi != TYYPPI_TAUSTA &&
        // 						sprite.tyyppi->tyyppi   != TYYPPI_TAUSTA &&
        // 						sprite2->tyyppi->tyyppi != TYYPPI_TELEPORTTI &&
        // 						sprite2->isku == 0 &&
        // 						sprite.isku == 0 &&
        // 						sprite2->energia > 0 &&
        // 						sprite.energia > 0 &&
        // 						sprite2->saatu_vahinko < 1)
        // 					{
        //
        // 						// Tippuuko toinen sprite p��lle?
        //
        // 						if (sprite2->b > 2 && sprite2->paino >= 0.5 &&
        // 							sprite2->y < sprite_y && !sprite.tyyppi->este &&
        // 							sprite.tyyppi->tuhoutuminen != TUHOUTUMINEN_EI_TUHOUDU)
        // 						{
        // 							//sprite.saatu_vahinko = (int)sprite2->paino;//1;
        // 							sprite.saatu_vahinko = (int)(sprite2->paino+sprite2->b/4);
        // 							sprite.saatu_vahinko_tyyppi = VAHINKO_PUDOTUS;
        // 							sprite2->hyppy_ajastin = 1;
        // 						}
        //
        // 						// If there is another sprite damaging
        // 						if (sprite.tyyppi->vahinko > 0 && sprite2->tyyppi->tyyppi != TYYPPI_BONUS) {
        //
        // 							sprite2->saatu_vahinko        = sprite.tyyppi->vahinko;
        // 							sprite2->saatu_vahinko_tyyppi = sprite.tyyppi->vahinko_tyyppi;
        //
        // 							if ( !(sprite2->pelaaja && nakymattomyys) ) //If sprite2 isn't a invisible player
        // 								sprite.hyokkays1 = sprite.tyyppi->hyokkays1_aika; //Then sprite attack
        //
        // 							// The projectiles are shattered by shock
        // 							if (sprite2->tyyppi->tyyppi == TYYPPI_AMMUS) {
        // 								sprite.saatu_vahinko = 1;//sprite2->tyyppi->vahinko;
        // 								sprite.saatu_vahinko_tyyppi = sprite2->tyyppi->vahinko_tyyppi;
        // 							}
        //
        // 							if (sprite.tyyppi->tyyppi == TYYPPI_AMMUS) {
        // 								sprite.saatu_vahinko = 1;//sprite2->tyyppi->vahinko;
        // 								sprite.saatu_vahinko_tyyppi = sprite2->tyyppi->vahinko_tyyppi;
        // 							}
        // 						}
        // 					}
        // 				}
        //
        // 				// lis�t��n spriten painoon sit� koskettavan toisen spriten paino
        // 				if (sprite.weight > 0)
        // 					sprite.kytkinpaino += sprite2->tyyppi->paino;
        //
        // 			}
        // 		}
        // 	}
        
        /*****************************************************************************************/
        /* If the sprite has suffered damage                                                     */
        /*****************************************************************************************/
        
        // 	// Just fire can damage a invisible player
        // 	if (nakymattomyys > 0 && sprite.saatu_vahinko != 0 && sprite.saatu_vahinko_tyyppi != VAHINKO_TULI &&
        // 		&sprite == Game::Sprites->player /*i == pelaaja_index*/) {
        // 		sprite.saatu_vahinko = 0;
        // 		sprite.saatu_vahinko_tyyppi = VAHINKO_EI;
        // 	}
        
        // 	if (sprite.saatu_vahinko != 0 && sprite.energia > 0 && sprite.tyyppi->tuhoutuminen != TUHOUTUMINEN_EI_TUHOUDU){
        // 		if (sprite.tyyppi->suojaus != sprite.saatu_vahinko_tyyppi || sprite.tyyppi->suojaus == VAHINKO_EI){
        // 			sprite.energia -= sprite.saatu_vahinko;
        // 			sprite.isku = VAHINKO_AIKA;
        //
        // 			if (sprite.saatu_vahinko_tyyppi == VAHINKO_SAHKO)
        // 				sprite.isku *= 6;
        //
        // 			PK_Play_Sound(sprite.tyyppi->aanet[AANI_VAHINKO], 100, (int)sprite.x, (int)sprite.y,
        // 						  sprite.tyyppi->aani_frq, sprite.tyyppi->random_frq);
        //
        // 			if (sprite.tyyppi->tuhoutuminen%100 == TUHOUTUMINEN_HOYHENET)
        // 				Effect::Destruction(TUHOUTUMINEN_HOYHENET, (DWORD)sprite.x, (DWORD)sprite.y);
        //
        // 			if (sprite.tyyppi->tyyppi != TYYPPI_AMMUS){
        // 				Game::Particles->new_particle(PARTICLE_STAR,future.x,sprite_y,-1,-1,60,0.01,128);
        // 				Game::Particles->new_particle(PARTICLE_STAR,future.x,sprite_y, 0,-1,60,0.01,128);
        // 				Game::Particles->new_particle(PARTICLE_STAR,future.x,sprite_y, 1,-1,60,0.01,128);
        // 			}
        //
        // 			if (sprite.Onko_AI(AI_VAIHDA_KALLOT_JOS_OSUTTU))
        // 				kartta->Change_SkullBlocks();
        //
        // 			if (sprite.Onko_AI(AI_HYOKKAYS_1_JOS_OSUTTU)){
        // 				sprite.hyokkays1 = sprite.tyyppi->hyokkays1_aika;
        // 				sprite.lataus = 0;
        // 			}
        //
        // 			if (sprite.Onko_AI(AI_HYOKKAYS_2_JOS_OSUTTU)){
        // 				sprite.hyokkays2 = sprite.tyyppi->hyokkays2_aika;
        // 				sprite.lataus = 0;
        // 			}
        //
        // 		}
        //
        // 		sprite.saatu_vahinko = 0;
        // 		sprite.saatu_vahinko_tyyppi = VAHINKO_EI;
        
        
        /*****************************************************************************************/
        /* If the sprite is destroyed                                                            */
        /*****************************************************************************************/
        
        if (sprite.energia < 1) {
            // 			tuhoutuminen = sprite.tyyppi->tuhoutuminen;
            //
            // 			if (tuhoutuminen != TUHOUTUMINEN_EI_TUHOUDU){
            // 				if (sprite.tyyppi->bonus > -1 && sprite.tyyppi->bonusten_lkm > 0)
            // 					if (sprite.tyyppi->bonus_aina || rand()%4 == 1)
            // 						for (int bi=0; bi<sprite.tyyppi->bonusten_lkm; bi++)
            // 							Game::Sprites->add(sprite.tyyppi->bonus,0,future.x-11+(10-rand()%20),
            // 											  sprite_ala-16-(10+rand()%20), i, true);
            //
            // 				if (sprite.Onko_AI(AI_VAIHDA_KALLOT_JOS_TYRMATTY) && !sprite.Onko_AI(AI_VAIHDA_KALLOT_JOS_OSUTTU))
            // 					kartta->Change_SkullBlocks();
            //
            // 				if (tuhoutuminen >= TUHOUTUMINEN_ANIMAATIO)
            // 					tuhoutuminen -= TUHOUTUMINEN_ANIMAATIO;
            // 				else
            // 					sprite.piilota = true;
            //
            // 				Effect::Destruction(tuhoutuminen, (DWORD)sprite.x, (DWORD)sprite.y);
            // 				PK_Play_Sound(sprite.tyyppi->aanet[AANI_TUHOUTUMINEN],100, (int)sprite.x, (int)sprite.y,
            // 							  sprite.tyyppi->aani_frq, sprite.tyyppi->random_frq);
            //
            // 				if (sprite.Onko_AI(AI_UUSI_JOS_TUHOUTUU)) {
            // 					Game::Sprites->add(sprite.tyyppi->indeksi,0,sprite.alku_x-sprite.tyyppi->leveys, sprite.alku_y-sprite.tyyppi->korkeus,i, false);
            // 				} //TODO - does sprite.tyyppi->indeksi work
            //
            // 				if (sprite.tyyppi->tyyppi == TYYPPI_PELIHAHMO && sprite.tyyppi->pisteet != 0){
            // 					char luku[10];
            // 					itoa(sprite.tyyppi->pisteet,luku,10);
            // 					PK_Fadetext_New(fontti2,luku,(int)Game::Sprites->spritet[i].x-8,(int)Game::Sprites->spritet[i].y-8,80,false);
            // 					piste_lisays += sprite.tyyppi->pisteet;
            // 				}
            // 			} else
            // 				sprite.energia = 1;
        }
        // 	}
        
        if (sprite.knockTimer === 0)
            sprite.receivedDamageType = EDamageType.VAHINKO_EI;
        
        
        /*****************************************************************************************/
        /* Revisions                                                                             */
        /*****************************************************************************************/
        
        if (!future.toTheRight)
            if (future.a > 0)
                future.a = 0;
        
        if (!future.toTheLeft)
            if (future.a < 0)
                future.a = 0;
        
        if (!future.toTheTop) {
            if (future.b < 0)
                future.b = 0;
            
            if (!hyppy_maximissa)
                sprite.jumpTimer = 95; //sprite.tyyppi->max_hyppy * 2;
        }
        
        if (!future.toTheBottom)
            if (future.b >= 0) { //If sprite is falling
                if (sprite.jumpTimer > 0) {
                    if (sprite.jumpTimer >= 90 + 10) {
                        // 					PK_Play_Sound(tomahdys_aani,30,(int)future.x, (int)sprite_y,
                        // 				                  int(25050-sprite.weight*3000),true);
                        //
                        // 					//Game::Particles->new_particle(	PARTICLE_DUST_CLOUDS,sprite_x+rand()%5-rand()%5-10,sprite_ala+rand()%3-rand()%3,
                        // 					//			  0,-0.2,rand()%50+20,0,0);
                        //
                        // 					if (rand()%7 == 1) {
                        // 						Game::Particles->new_particle(PARTICLE_SMOKE,sprite_x+rand()%5-rand()%5-10,sprite_ala+rand()%3-rand()%3,
                        // 									  	   0.3,-0.1,450,0,0);
                        // 						Game::Particles->new_particle(PARTICLE_SMOKE,sprite_x+rand()%5-rand()%5-10,sprite_ala+rand()%3-rand()%3,
                        // 									  	   -0.3,-0.1,450,0,0);
                        // 					}
                        //
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
        
        if (sprite.energia > sprite.proto.energy)
            sprite.energia = sprite.proto.energy;
        
        if (sprite.knockTimer === 0 || sprite.pelaaja === 1) {
            future.x += future.a;
            future.y += future.b;
        }
        
        // 	if (&sprite == Game::Sprites->player || sprite.energia < 1) {
        // 		double kitka = 1.04;
        //
        // 		if (kartta->ilma == ILMA_SADE || kartta->ilma == ILMA_SADEMETSA)
        // 			kitka = 1.03;
        //
        // 		if (kartta->ilma == ILMA_LUMISADE)
        // 			kitka = 1.01;
        //
        // 		if (!alas)
        // 			sprite_a /= kitka;
        // 		else
        // 			sprite_a /= 1.03;//1.02//1.05
        //
        // 		sprite_b /= 1.25;
        // 	}
        
        sprite.x = future.x;
        sprite.y = future.y;
        sprite.a = future.a;
        sprite.b = future.b;
        
        sprite.toTheRight = future.toTheRight;
        sprite.toTheLeft = future.toTheLeft;
        sprite.toTheBottom = future.toTheBottom;
        sprite.toTheTop = future.toTheTop;
        
        // Source comment:
        /*
               sprite.weight = sprite.tyyppi->paino;
           
               if (sprite.energia < 1 && sprite.weight == 0)
                  sprite.weight = 1;*/
        
        if (sprite.jumpTimer < 0)
            sprite.toTheBottom = false;
        
        // Source comment:
        //sprite.kyykky   = false;
        
        /*****************************************************************************************/
        /* AI                                                                                    */
        /*****************************************************************************************/
        
        // 	//TODO run sprite lua script
        //
        // 	if (sprite.pelaaja == 0) {
        // 		for (int ai=0;ai < SPRITE_MAX_AI; ai++)
        // 			switch (sprite.tyyppi->AI[ai]) {
        // 				case AI_EI:							ai = SPRITE_MAX_AI; // lopetetaan
        // 													break;
        // 				case AI_KANA:						sprite.AI_Kana();
        // 													break;
        // 				case AI_PIKKUKANA:					sprite.AI_Kana();
        // 													break;
        // 				case AI_SAMMAKKO1:					sprite.AI_Sammakko1();
        // 													break;
        // 				case AI_SAMMAKKO2:					sprite.AI_Sammakko2();
        // 													break;
        // 				case AI_BONUS:						sprite.AI_Bonus();
        // 													break;
        // 				case AI_MUNA:						sprite.AI_Muna();
        // 													break;
        // 				case AI_AMMUS:						sprite.AI_Ammus();
        // 													break;
        // 				case AI_HYPPIJA:					sprite.AI_Hyppija();
        // 													break;
        // 				case AI_PERUS:						sprite.AI_Perus();
        // 													break;
        // 				case AI_NONSTOP:					sprite.AI_NonStop();
        // 													break;
        // 				case AI_KAANTYY_ESTEESTA_HORI:		sprite.AI_Kaantyy_Esteesta_Hori();
        // 													break;
        // 				case AI_KAANTYY_ESTEESTA_VERT:		sprite.AI_Kaantyy_Esteesta_Vert();
        // 													break;
        // 				case AI_VAROO_KUOPPAA:				sprite.AI_Varoo_Kuoppaa();
        // 													break;
        // 				case AI_RANDOM_SUUNNANVAIHTO_HORI:	sprite.AI_Random_Suunnanvaihto_Hori();
        // 													break;
        // 				case AI_RANDOM_KAANTYMINEN:			sprite.AI_Random_Kaantyminen();
        // 													break;
        // 				case AI_RANDOM_HYPPY:				sprite.AI_Random_Hyppy();
        // 													break;
        // 				case AI_SEURAA_PELAAJAA:			if (nakymattomyys == 0)
        // 														sprite.AI_Seuraa_Pelaajaa(*Game::Sprites->player);
        // 													break;
        // 				case AI_SEURAA_PELAAJAA_JOS_NAKEE:	if (nakymattomyys == 0)
        // 														sprite.AI_Seuraa_Pelaajaa_Jos_Nakee(*Game::Sprites->player);
        // 													break;
        // 				case AI_SEURAA_PELAAJAA_VERT_HORI:	if (nakymattomyys == 0)
        // 														sprite.AI_Seuraa_Pelaajaa_Vert_Hori(*Game::Sprites->player);
        // 													break;
        // 				case AI_SEURAA_PELAAJAA_JOS_NAKEE_VERT_HORI:
        // 													if (nakymattomyys == 0)
        // 														sprite.AI_Seuraa_Pelaajaa_Jos_Nakee_Vert_Hori(*Game::Sprites->player);
        // 													break;
        // 				case AI_PAKENEE_PELAAJAA_JOS_NAKEE:	if (nakymattomyys == 0)
        // 														sprite.AI_Pakenee_Pelaajaa_Jos_Nakee(*Game::Sprites->player);
        // 													break;
        // 				case AI_POMMI:						sprite.AI_Pommi();
        // 													break;
        // 				case AI_HYOKKAYS_1_JOS_OSUTTU:		sprite.AI_Hyokkays_1_Jos_Osuttu();
        // 													break;
        // 				case AI_HYOKKAYS_2_JOS_OSUTTU:		sprite.AI_Hyokkays_2_Jos_Osuttu();
        // 													break;
        // 				case AI_HYOKKAYS_1_NONSTOP:			sprite.AI_Hyokkays_1_Nonstop();
        // 													break;
        // 				case AI_HYOKKAYS_2_NONSTOP:			sprite.AI_Hyokkays_2_Nonstop();
        // 													break;
        // 				case AI_HYOKKAYS_1_JOS_PELAAJA_EDESSA:
        // 													if (nakymattomyys == 0)
        // 														sprite.AI_Hyokkays_1_Jos_Pelaaja_Edessa(*Game::Sprites->player);
        // 													break;
        // 				case AI_HYOKKAYS_2_JOS_PELAAJA_EDESSA:
        // 													if (nakymattomyys == 0)
        // 														sprite.AI_Hyokkays_2_Jos_Pelaaja_Edessa(*Game::Sprites->player);
        // 													break;
        // 				case AI_HYOKKAYS_1_JOS_PELAAJA_ALAPUOLELLA:
        // 													if (nakymattomyys == 0)
        // 														sprite.AI_Hyokkays_1_Jos_Pelaaja_Alapuolella(*Game::Sprites->player);
        // 													break;
        // 				case AI_HYPPY_JOS_PELAAJA_YLAPUOLELLA:
        // 													if (nakymattomyys == 0)
        // 														sprite.AI_Hyppy_Jos_Pelaaja_Ylapuolella(*Game::Sprites->player);
        // 													break;
        // 				case AI_VAHINGOITTUU_VEDESTA:		sprite.AI_Vahingoittuu_Vedesta();
        // 													break;
        // 				case AI_TAPA_KAIKKI:				sprite.AI_Tapa_Kaikki();
        // 													break;
        // 				case AI_KITKA_VAIKUTTAA:			sprite.AI_Kitka_Vaikuttaa();
        // 													break;
        // 				case AI_PIILOUTUU:					sprite.AI_Piiloutuu();
        // 													break;
        // 				case AI_PALAA_ALKUUN_X:				sprite.AI_Palaa_Alkuun_X();
        // 													break;
        // 				case AI_PALAA_ALKUUN_Y:				sprite.AI_Palaa_Alkuun_Y();
        // 													break;
        // 				case AI_LIIKKUU_X_COS:				sprite.AI_Liikkuu_X(cos_table[degree%360]);
        // 													break;
        // 				case AI_LIIKKUU_Y_COS:				sprite.AI_Liikkuu_Y(cos_table[degree%360]);
        // 													break;
        // 				case AI_LIIKKUU_X_SIN:				sprite.AI_Liikkuu_X(sin_table[degree%360]);
        // 													break;
        // 				case AI_LIIKKUU_Y_SIN:				sprite.AI_Liikkuu_Y(sin_table[degree%360]);
        // 													break;
        // 				case AI_LIIKKUU_X_COS_NOPEA:		sprite.AI_Liikkuu_X(cos_table[(degree*2)%360]);
        // 													break;
        // 				case AI_LIIKKUU_Y_SIN_NOPEA:		sprite.AI_Liikkuu_Y(sin_table[(degree*2)%360]);
        // 													break;
        // 				case AI_LIIKKUU_X_COS_HIDAS:		sprite.AI_Liikkuu_X(cos_table[(degree/2)%360]);
        // 													break;
        // 				case AI_LIIKKUU_Y_SIN_HIDAS:		sprite.AI_Liikkuu_Y(sin_table[(degree/2)%360]);
        // 													break;
        // 				case AI_LIIKKUU_Y_SIN_VAPAA:		sprite.AI_Liikkuu_Y(sin_table[(sprite.ajastin/2)%360]);
        // 													break;
        // 				case AI_MUUTOS_JOS_ENERGIAA_ALLE_2:	if (sprite.tyyppi->muutos > -1)
        // 														sprite.AI_Muutos_Jos_Energiaa_Alle_2(Game::Sprites->protot[sprite.tyyppi->muutos]);
        // 													break;
        // 				case AI_MUUTOS_JOS_ENERGIAA_YLI_1:	if (sprite.tyyppi->muutos > -1)
        // 														if (sprite.AI_Muutos_Jos_Energiaa_Yli_1(Game::Sprites->protot[sprite.tyyppi->muutos])==1)
        // 															Effect::Destruction(TUHOUTUMINEN_SAVU_HARMAA, (DWORD)sprite.x, (DWORD)sprite.y);
        // 													break;
        // 				case AI_MUUTOS_AJASTIN:				if (sprite.tyyppi->muutos > -1) {
        // 														sprite.AI_Muutos_Ajastin(Game::Sprites->protot[sprite.tyyppi->muutos]);
        // 													}
        // 													break;
        // 				case AI_MUUTOS_JOS_OSUTTU:			if (sprite.tyyppi->muutos > -1) {
        // 														sprite.AI_Muutos_Jos_Osuttu(Game::Sprites->protot[sprite.tyyppi->muutos]);
        // 													}
        // 													break;
        // 				case AI_TELEPORTTI:					if (sprite.AI_Teleportti(i, Game::Sprites->spritet, MAX_SPRITEJA, *Game::Sprites->player)==1)
        // 													{
        //
        // 														Game::camera_x = (int)Game::Sprites->player->x;
        // 														Game::camera_y = (int)Game::Sprites->player->y;
        // 														this._dcameraX = Game::camera_x-screen_width/2;
        // 														this._dcameraY = Game::camera_y-screen_height/2;
        // 														PisteDraw2_FadeIn(PD_FADE_NORMAL);
        // 														if (sprite.tyyppi->aanet[AANI_HYOKKAYS2] != -1)
        // 															PK_Play_MenuSound(sprite.tyyppi->aanet[AANI_HYOKKAYS2], 100);
        // 															//PK_Play_Sound(, 100, Game::camera_x, Game::camera_y, SOUND_SAMPLERATE, false);
        //
        //
        // 													}
        // 													break;
        // 				case AI_KIIPEILIJA:					sprite.AI_Kiipeilija();
        // 													break;
        // 				case AI_KIIPEILIJA2:				sprite.AI_Kiipeilija2();
        // 													break;
        // 				case AI_TUHOUTUU_JOS_EMO_TUHOUTUU:	sprite.AI_Tuhoutuu_Jos_Emo_Tuhoutuu(Game::Sprites->spritet);
        // 													break;
        //
        // 				case AI_TIPPUU_TARINASTA:			sprite.AI_Tippuu_Tarinasta(this._vibration + kytkin_tarina);
        // 													break;
        // 				case AI_LIIKKUU_ALAS_JOS_KYTKIN1_PAINETTU: sprite.AI_Liikkuu_Jos_Kytkin_Painettu(kytkin1,0,1);
        // 													break;
        // 				case AI_LIIKKUU_YLOS_JOS_KYTKIN1_PAINETTU: sprite.AI_Liikkuu_Jos_Kytkin_Painettu(kytkin1,0,-1);
        // 													break;
        // 				case AI_LIIKKUU_VASEMMALLE_JOS_KYTKIN1_PAINETTU: sprite.AI_Liikkuu_Jos_Kytkin_Painettu(kytkin1,-1,0);
        // 													break;
        // 				case AI_LIIKKUU_OIKEALLE_JOS_KYTKIN1_PAINETTU: sprite.AI_Liikkuu_Jos_Kytkin_Painettu(kytkin1,1,0);
        // 													break;
        // 				case AI_LIIKKUU_ALAS_JOS_KYTKIN2_PAINETTU: sprite.AI_Liikkuu_Jos_Kytkin_Painettu(kytkin2,0,1);
        // 													break;
        // 				case AI_LIIKKUU_YLOS_JOS_KYTKIN2_PAINETTU: sprite.AI_Liikkuu_Jos_Kytkin_Painettu(kytkin2,0,-1);
        // 													break;
        // 				case AI_LIIKKUU_VASEMMALLE_JOS_KYTKIN2_PAINETTU: sprite.AI_Liikkuu_Jos_Kytkin_Painettu(kytkin2,-1,0);
        // 													break;
        // 				case AI_LIIKKUU_OIKEALLE_JOS_KYTKIN2_PAINETTU: sprite.AI_Liikkuu_Jos_Kytkin_Painettu(kytkin2,1,0);
        // 													break;
        // 				case AI_LIIKKUU_ALAS_JOS_KYTKIN3_PAINETTU: sprite.AI_Liikkuu_Jos_Kytkin_Painettu(kytkin3,0,1);
        // 													break;
        // 				case AI_LIIKKUU_YLOS_JOS_KYTKIN3_PAINETTU: sprite.AI_Liikkuu_Jos_Kytkin_Painettu(kytkin3,0,-1);
        // 													break;
        // 				case AI_LIIKKUU_VASEMMALLE_JOS_KYTKIN3_PAINETTU: sprite.AI_Liikkuu_Jos_Kytkin_Painettu(kytkin3,-1,0);
        // 													break;
        // 				case AI_LIIKKUU_OIKEALLE_JOS_KYTKIN3_PAINETTU: sprite.AI_Liikkuu_Jos_Kytkin_Painettu(kytkin3,1,0);
        // 													break;
        // 				case AI_TIPPUU_JOS_KYTKIN1_PAINETTU: sprite.AI_Tippuu_Jos_Kytkin_Painettu(kytkin1);
        // 													break;
        // 				case AI_TIPPUU_JOS_KYTKIN2_PAINETTU: sprite.AI_Tippuu_Jos_Kytkin_Painettu(kytkin2);
        // 													break;
        // 				case AI_TIPPUU_JOS_KYTKIN3_PAINETTU: sprite.AI_Tippuu_Jos_Kytkin_Painettu(kytkin3);
        // 													break;
        // 				case AI_RANDOM_LIIKAHDUS_VERT_HORI:	sprite.AI_Random_Liikahdus_Vert_Hori();
        // 													break;
        // 				case AI_KAANTYY_JOS_OSUTTU:			sprite.AI_Kaantyy_Jos_Osuttu();
        // 													break;
        // 				case AI_EVIL_ONE:					if (sprite.energia < 1) music_volume = 0;
        // 													break;
        //
        // 				case AI_INFO1:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info01));break;
        // 				case AI_INFO2:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info02));break;
        // 				case AI_INFO3:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info03));break;
        // 				case AI_INFO4:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info04));break;
        // 				case AI_INFO5:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info05));break;
        // 				case AI_INFO6:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info06));break;
        // 				case AI_INFO7:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info07));break;
        // 				case AI_INFO8:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info08));break;
        // 				case AI_INFO9:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info09));break;
        // 				case AI_INFO10:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info10));break;
        // 				case AI_INFO11:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info11));break;
        // 				case AI_INFO12:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info12));break;
        // 				case AI_INFO13:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info13));break;
        // 				case AI_INFO14:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info14));break;
        // 				case AI_INFO15:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info15));break;
        // 				case AI_INFO16:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info16));break;
        // 				case AI_INFO17:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info17));break;
        // 				case AI_INFO18:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info18));break;
        // 				case AI_INFO19:						if (sprite.AI_Info(*Game::Sprites->player))	PK_Start_Info(tekstit->Hae_Teksti(PK_txt.info19));break;
        //
        // 				default:							break;
        // 			}
        // 	}
        //
        // 	//if (kaiku == 1 && sprite.tyyppi->tyyppi == TYYPPI_AMMUS && sprite.tyyppi->vahinko_tyyppi == VAHINKO_MELU &&
        // 	//	sprite.tyyppi->aanet[AANI_HYOKKAYS1] > -1)
        // 	//	PK_Play_Sound(sprite.tyyppi->aanet[AANI_HYOKKAYS1],20, (int)sprite_x, (int)sprite_y,
        // 	//				  sprite.tyyppi->aani_frq, sprite.tyyppi->random_frq);
        
        
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
            sprite.energia = 0;
            sprite.piilota = true;
            
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
        
        // // If the sprite is ready and isn't crouching
        // 	if (sprite.lataus == 0 && !sprite.kyykky) {
        // 		// hy�kk�ysaika on "tapissa" mik� tarkoittaa sit�, ett� aloitetaan hy�kk�ys
        // 		if (sprite.hyokkays1 == sprite.tyyppi->hyokkays1_aika) {
        // 			// provides recovery time, after which the sprite can attack again
        // 			sprite.lataus = sprite.tyyppi->latausaika;
        // 			if(sprite.lataus == 0) sprite.lataus = 5;
        // 			// jos spritelle ei ole m��ritelty omaa latausaikaa ...
        // 			if (sprite.ammus1 > -1 && sprite.tyyppi->latausaika == 0)
        // 			// ... ja ammukseen on, otetaan latausaika ammuksesta
        // 				if (Game::Sprites->protot[sprite.ammus1].tulitauko > 0)
        // 					sprite.lataus = Game::Sprites->protot[sprite.ammus1].tulitauko;
        //
        // 			// soitetaan hy�kk�ys��ni
        // 			PK_Play_Sound(sprite.tyyppi->aanet[AANI_HYOKKAYS1],100, (int)sprite_x, (int)sprite_y,
        // 						  sprite.tyyppi->aani_frq, sprite.tyyppi->random_frq);
        //
        // 			if (sprite.ammus1 > -1) {
        // 				Game::Sprites->add_ammo(sprite.ammus1,0,sprite_x, sprite_y, i);
        //
        // 		//		if (Game::Sprites->protot[sprite.ammus1].aanet[AANI_HYOKKAYS1] > -1)
        // 		//			PK_Play_Sound(Game::Sprites->protot[sprite.ammus1].aanet[AANI_HYOKKAYS1],100, (int)sprite_x, (int)sprite_y,
        // 		//						  sprite.tyyppi->aani_frq, sprite.tyyppi->random_frq);
        // 			}
        // 		}
        //
        // 		// Sama kuin hy�kk�ys 1:ss�
        // 		if (sprite.hyokkays2 == sprite.tyyppi->hyokkays2_aika) {
        // 			sprite.lataus = sprite.tyyppi->latausaika;
        // 			if(sprite.lataus == 0) sprite.lataus = 5;
        // 			if (sprite.ammus2 > -1  && sprite.tyyppi->latausaika == 0)
        // 				if (Game::Sprites->protot[sprite.ammus2].tulitauko > 0)
        // 					sprite.lataus = Game::Sprites->protot[sprite.ammus2].tulitauko;
        //
        // 			PK_Play_Sound(sprite.tyyppi->aanet[AANI_HYOKKAYS2],100,(int)sprite_x, (int)sprite_y,
        // 						  sprite.tyyppi->aani_frq, sprite.tyyppi->random_frq);
        //
        // 			if (sprite.ammus2 > -1) {
        // 				Game::Sprites->add_ammo(sprite.ammus2,0,sprite_x, sprite_y, i);
        //
        // 		//		if (Game::Sprites->protot[sprite.ammus2].aanet[AANI_HYOKKAYS1] > -1)
        // 		//			PK_Play_Sound(Game::Sprites->protot[sprite.ammus2].aanet[AANI_HYOKKAYS1],100, (int)sprite_x, (int)sprite_y,
        // 		//						  sprite.tyyppi->aani_frq, sprite.tyyppi->random_frq);
        //
        // 			}
        // 		}
        // 	}
        //
        // 	// Random sounds
        // 	if (sprite.tyyppi->aanet[AANI_RANDOM] != -1 && rand()%200 == 1 && sprite.energia > 0)
        // 		PK_Play_Sound(sprite.tyyppi->aanet[AANI_RANDOM],80,(int)sprite_x, (int)sprite_y,
        // 					  sprite.tyyppi->aani_frq, sprite.tyyppi->random_frq);
        //
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
    
    private updateBonusSpriteMovement(sprite: PK2Sprite): void {
        // 	sprite_x = 0;
        // 	sprite_y = 0;
        // 	sprite_a = 0;
        // 	sprite_b = 0;
        //
        // 	sprite_vasen = 0;
        // 	sprite_oikea = 0;
        // 	sprite_yla = 0;
        // 	sprite_ala = 0;
        //
        // 	sprite_leveys  = 0;
        // 	sprite_korkeus = 0;
        //
        // 	kartta_vasen = 0;
        // 	kartta_yla   = 0;
        //
        // 	PK2Sprite &sprite = PkEngine::Sprites->spritet[i];
        //
        // 	sprite_x = sprite.x;
        // 	sprite_y = sprite.y;
        // 	sprite_a = sprite.a;
        // 	sprite_b = sprite.b;
        //
        // 	sprite_leveys  = sprite.tyyppi->leveys;
        // 	sprite_korkeus = sprite.tyyppi->korkeus;
        //
        // 	x = 0;
        // 	y = 0;
        // 	oikealle	= true,
        // 	vasemmalle	= true,
        // 	ylos		= true,
        // 	alas		= true;
        //
        // 	vedessa = sprite.vedessa;
        //
        // 	max_nopeus = (int)sprite.tyyppi->max_nopeus;
        //
        // 	// Siirret��n varsinaiset muuttujat apumuuttujiin.
        //
        // 	sprite_vasen = sprite_x-sprite_leveys/2;
        // 	sprite_oikea = sprite_x+sprite_leveys/2;
        // 	sprite_yla	 = sprite_y-sprite_korkeus/2;
        // 	sprite_ala	 = sprite_y+sprite_korkeus/2;
        //
        //
        // 	if (sprite.isku > 0)
        // 		sprite.isku--;
        //
        // 	if (sprite.lataus > 0)
        // 		sprite.lataus--;
        //
        // 	if (sprite.muutos_ajastin > 0)	// aika muutokseen
        // 		sprite.muutos_ajastin --;
        //
        // 	// Hyppyyn liittyv�t seikat
        //
        // 	if (kytkin_tarina + PkEngine::vibration > 0 && sprite.hyppy_ajastin == 0)
        // 		sprite.hyppy_ajastin = sprite.tyyppi->max_hyppy / 2;
        //
        // 	if (sprite.hyppy_ajastin > 0 && sprite.hyppy_ajastin < sprite.tyyppi->max_hyppy)
        // 	{
        // 		sprite.hyppy_ajastin ++;
        // 		sprite_b = (sprite.tyyppi->max_hyppy - sprite.hyppy_ajastin)/-4.0;//-2
        // 	}
        //
        // 	if (sprite_b > 0)
        // 		sprite.hyppy_ajastin = sprite.tyyppi->max_hyppy;
        //
        //
        //
        // 	if (sprite.paino != 0)	// jos bonuksella on paino, tutkitaan ymp�rist�
        // 	{
        // 		// o
        // 		//
        // 		// |  Gravity
        // 		// V
        //
        // 		sprite_b += sprite.paino + sprite_b/1.25;
        //
        // 		if (sprite.vedessa)
        // 		{
        // 			if (sprite_b > 0)
        // 				sprite_b /= 2.0;
        //
        // 			if (rand()%80 == 1)
        // 				PkEngine::Particles->new_particle(PARTICLE_SPARK,sprite_x-4,sprite_y,0,-0.5-rand()%2,rand()%30+30,0,32);
        // 		}
        //
        // 		sprite.vedessa = false;
        //
        // 		sprite.kytkinpaino = sprite.paino;
        //
        // 		/* TOISET SPRITET */
        //
        // 		PK2BLOCK spritepalikka;
        //
        // 		for (int sprite_index = 0; sprite_index < MAX_SPRITEJA; sprite_index++) {
        //
        // 			PK2Sprite* sprite2 = &PkEngine::Sprites->spritet[sprite_index];
        // 			if (sprite_index != i && !sprite2->piilota) {
        // 				if (sprite2->tyyppi->este && sprite.tyyppi->tiletarkistus) {
        // 					if (sprite_x-sprite_leveys/2 +sprite_a <= sprite2->x + sprite2->tyyppi->leveys /2 &&
        // 						sprite_x+sprite_leveys/2 +sprite_a >= sprite2->x - sprite2->tyyppi->leveys /2 &&
        // 						sprite_y-sprite_korkeus/2+sprite_b <= sprite2->y + sprite2->tyyppi->korkeus/2 &&
        // 						sprite_y+sprite_korkeus/2+sprite_b >= sprite2->y - sprite2->tyyppi->korkeus/2)
        // 					{
        // 						spritepalikka.koodi = 0;
        // 						spritepalikka.ala   = (int)sprite2->y + sprite2->tyyppi->korkeus/2;
        // 						spritepalikka.oikea = (int)sprite2->x + sprite2->tyyppi->leveys/2;
        // 						spritepalikka.vasen = (int)sprite2->x - sprite2->tyyppi->leveys/2;
        // 						spritepalikka.yla   = (int)sprite2->y - sprite2->tyyppi->korkeus/2;
        //
        // 						spritepalikka.alas       = BLOCK_SEINA;
        // 						spritepalikka.ylos       = BLOCK_SEINA;
        // 						spritepalikka.oikealle   = BLOCK_SEINA;
        // 						spritepalikka.vasemmalle = BLOCK_SEINA;
        //
        // 						if (!sprite2->tyyppi->este_alas)
        // 							spritepalikka.alas		 = BLOCK_TAUSTA;
        // 						if (!sprite2->tyyppi->este_ylos)
        // 							spritepalikka.ylos		 = BLOCK_TAUSTA;
        // 						if (!sprite2->tyyppi->este_oikealle)
        // 							spritepalikka.oikealle   = BLOCK_TAUSTA;
        // 						if (!sprite2->tyyppi->este_vasemmalle)
        // 							spritepalikka.vasemmalle = BLOCK_TAUSTA;
        //
        //
        // 						spritepalikka.vesi  = false;
        //
        // 						PK_Block_Set_Barriers(spritepalikka);
        // 						PK_Check_Blocks2(sprite, spritepalikka); //Colision bonus and sprite block
        // 					}
        // 				}
        //
        // 				if (sprite_x < sprite2->x + sprite2->tyyppi->leveys/2 &&
        // 					sprite_x > sprite2->x - sprite2->tyyppi->leveys/2 &&
        // 					sprite_y < sprite2->y + sprite2->tyyppi->korkeus/2 &&
        // 					sprite_y > sprite2->y - sprite2->tyyppi->korkeus/2 &&
        // 					sprite.isku == 0)
        // 				{
        // 					if (sprite2->tyyppi->tyyppi != TYYPPI_BONUS &&
        // 						!(sprite2 == PkEngine::Sprites->player && sprite.tyyppi->tuhoutuminen != TUHOUTUMINEN_EI_TUHOUDU))
        // 						sprite_a += sprite2->a*(rand()%4);
        //
        // 					// lis�t��n spriten painoon sit� koskettavan toisen spriten paino
        // 					sprite.kytkinpaino += sprite2->tyyppi->paino;
        //
        // 					// samanmerkkiset spritet vaihtavat suuntaa t�rm�tess��n
        // 					if (sprite.tyyppi->indeksi == sprite2->tyyppi->indeksi &&
        // 						sprite2->energia > 0)
        // 					{
        // 						if (sprite.x < sprite2->x) {
        // 							sprite2->a += sprite.a / 3.0;
        // 							oikealle = false;
        // 						}
        // 						if (sprite.x > sprite2->x) {
        // 							sprite2->a += sprite.a / 3.0;
        // 							vasemmalle = false;
        // 						}
        // 						/*
        // 						if (sprite.y < spritet[sprite_index].y)
        // 							alas = false;
        // 						if (sprite.y > spritet[sprite_index].y)
        // 							ylos = false;*/
        // 					}
        //
        // 				}
        // 			}
        // 		}
        //
        // 		// Tarkistetaan ettei menn� mihink��n suuntaan liian kovaa.
        //
        // 		if (sprite_b > 4)
        // 			sprite_b = 4;
        //
        // 		if (sprite_b < -4)
        // 			sprite_b = -4;
        //
        // 		if (sprite_a > 3)
        // 			sprite_a = 3;
        //
        // 		if (sprite_a < -3)
        // 			sprite_a = -3;
        //
        // 		// Lasketaan
        //
        // 		int palikat_x_lkm = 0,
        // 			palikat_y_lkm = 0;
        //
        // 		if (sprite.tyyppi->tiletarkistus)
        // 		{
        //
        // 			palikat_x_lkm = (int)((sprite_leveys) /32)+4;
        // 			palikat_y_lkm = (int)((sprite_korkeus)/32)+4;
        //
        // 			kartta_vasen = (int)(sprite_vasen)/32;
        // 			kartta_yla	 = (int)(sprite_yla)/32;
        //
        // 			for (y=0;y<palikat_y_lkm;y++)
        // 				for (x=0;x<palikat_x_lkm;x++)
        // 				{
        // 					palikat[x+y*palikat_x_lkm] = PK_Block_Get(kartta_vasen+x-1,kartta_yla+y-1);
        // 				}
        //
        // 			// Tutkitaan t�rm��k� palikkaan
        //
        // 			for (y=0;y<palikat_y_lkm;y++)
        // 				for (x=0;x<palikat_x_lkm;x++)
        // 					PK_Check_Blocks(sprite, palikat[x+y*palikat_x_lkm]);
        // 			/*
        // 			PK_Check_Blocks_Debug(sprite, palikat[x+y*palikat_x_lkm],
        // 					sprite_x,
        // 					sprite_y,
        // 					sprite_a,
        // 					sprite_b,
        // 					sprite_vasen,
        // 					sprite_oikea,
        // 					sprite_yla,
        // 					sprite_ala,
        // 					sprite_leveys,
        // 					sprite_korkeus,
        // 					kartta_vasen,
        // 					kartta_yla,
        // 					oikealle,
        // 					vasemmalle,
        // 					ylos,
        // 					alas);*/
        //
        //
        // 		}
        //
        // 		if (vedessa != sprite.vedessa)
        // 			Effect::Splash((int)sprite_x,(int)sprite_y,32);
        //
        //
        // 		if (!oikealle)
        // 		{
        // 			if (sprite_a > 0)
        // 				sprite_a = -sprite_a/1.5;
        // 		}
        //
        // 		if (!vasemmalle)
        // 		{
        // 			if (sprite_a < 0)
        // 				sprite_a = -sprite_a/1.5;
        // 		}
        //
        // 		if (!ylos)
        // 		{
        // 			if (sprite_b < 0)
        // 				sprite_b = 0;
        //
        // 			sprite.hyppy_ajastin = sprite.tyyppi->max_hyppy;
        // 		}
        //
        // 		if (!alas)
        // 		{
        // 			if (sprite_b >= 0)
        // 			{
        // 				if (sprite.hyppy_ajastin > 0)
        // 				{
        // 					sprite.hyppy_ajastin = 0;
        // 				//	if (/*sprite_b == 4*/!maassa)
        // 				//		PK_Play_Sound(tomahdys_aani,20,(int)sprite_x, (int)sprite_y,
        // 				//				      int(25050-sprite.tyyppi->paino*4000),true);
        // 				}
        //
        // 				if (sprite_b > 2)
        // 					sprite_b = -sprite_b/(3+rand()%2);
        // 				else
        // 					sprite_b = 0;
        // 			}
        // 			//sprite_a /= kitka;
        // 			sprite_a /= 1.07;
        // 		}
        // 		else
        // 		{
        // 			sprite_a /= 1.02;
        // 		}
        //
        // 		sprite_b /= 1.5;
        //
        // 		if (sprite_b > 4)
        // 			sprite_b = 4;
        //
        // 		if (sprite_b < -4)
        // 			sprite_b = -4;
        //
        // 		if (sprite_a > 4)
        // 			sprite_a = 4;
        //
        // 		if (sprite_a < -4)
        // 			sprite_a = -4;
        //
        // 		sprite_x += sprite_a;
        // 		sprite_y += sprite_b;
        //
        // 		sprite.x = sprite_x;
        // 		sprite.y = sprite_y;
        // 		sprite.a = sprite_a;
        // 		sprite.b = sprite_b;
        //
        // 		sprite.oikealle = oikealle;
        // 		sprite.vasemmalle = vasemmalle;
        // 		sprite.alas = alas;
        // 		sprite.ylos = ylos;
        // 	}
        // 	else	// jos spriten paino on nolla, tehd��n spritest� "kelluva"
        // 	{
        // 		sprite.y = sprite.alku_y + cos_table[int(_degree+(sprite.alku_x+sprite.alku_y))%360] / 3.0;
        // 		sprite_y = sprite.y;
        // 	}
        //
        // 	sprite.paino = sprite.alkupaino;
        //
        // 	int tuhoutuminen;
        //
        // 	// Test if player touches bonus
        // 	if (sprite_x < PkEngine::Sprites->player->x + PkEngine::Sprites->player->tyyppi->leveys/2 &&
        // 		sprite_x > PkEngine::Sprites->player->x - PkEngine::Sprites->player->tyyppi->leveys/2 &&
        // 		sprite_y < PkEngine::Sprites->player->y + PkEngine::Sprites->player->tyyppi->korkeus/2 &&
        // 		sprite_y > PkEngine::Sprites->player->y - PkEngine::Sprites->player->tyyppi->korkeus/2 &&
        // 		sprite.isku == 0)
        // 	{
        // 		if (sprite.energia > 0 && PkEngine::Sprites->player->energia > 0)
        // 		{
        // 			if (sprite.tyyppi->pisteet != 0){
        // 				piste_lisays += sprite.tyyppi->pisteet;
        // 				char luku[6];
        // 				itoa(sprite.tyyppi->pisteet,luku,10);
        // 				if (sprite.tyyppi->pisteet >= 50)
        // 					PK_Fadetext_New(fontti2,luku,(int)sprite.x-8,(int)sprite.y-8,100,false);
        // 				else
        // 					PK_Fadetext_New(fontti1,luku,(int)sprite.x-8,(int)sprite.y-8,100,false);
        //
        // 			}
        //
        // 			if (sprite.Onko_AI(AI_BONUS_AIKA))
        // 				increase_time += sprite.tyyppi->latausaika;
        //
        // 			if (sprite.Onko_AI(AI_BONUS_NAKYMATTOMYYS))
        // 				nakymattomyys = sprite.tyyppi->latausaika;
        //
        // 			//kartta->spritet[(int)(sprite.alku_x/32) + (int)(sprite.alku_y/32)*PK2KARTTA_KARTTA_LEVEYS] = 255;
        //
        // 			if (sprite.tyyppi->vahinko != 0 && sprite.tyyppi->tuhoutuminen != TUHOUTUMINEN_EI_TUHOUDU){
        // 				PkEngine::Sprites->player->energia -= sprite.tyyppi->vahinko;
        // 				//if (player->energia > player->tyyppi->energia){ //TODO - set correct energy
        // 				//	player->energia = player->tyyppi->energia;
        // 				//}
        // 			}
        //
        // 			tuhoutuminen = sprite.tyyppi->tuhoutuminen;
        //
        // 			if (tuhoutuminen != TUHOUTUMINEN_EI_TUHOUDU)
        // 			{
        // 				if (tuhoutuminen >= TUHOUTUMINEN_ANIMAATIO)
        // 					tuhoutuminen -= TUHOUTUMINEN_ANIMAATIO;
        // 				else
        // 				{
        // 					if (sprite.tyyppi->avain)
        // 					{
        // 						avaimia--;
        //
        // 						if (avaimia < 1)
        // 							kartta->Open_Locks();
        // 					}
        //
        // 					sprite.piilota = true;
        // 				}
        //
        // 				if (sprite.Onko_AI(AI_UUSI_JOS_TUHOUTUU)) {
        // 					double ax, ay;
        // 					ax = sprite.alku_x;//-sprite.tyyppi->leveys;
        // 					ay = sprite.alku_y-sprite.tyyppi->korkeus/2.0;
        // 					PkEngine::Sprites->add(sprite.tyyppi->indeksi,0,ax-17, ay,i, false);
        // 					for (int r=1;r<6;r++)
        // 						PkEngine::Particles->new_particle(PARTICLE_SPARK,ax+rand()%10-rand()%10, ay+rand()%10-rand()%10,0,0,rand()%100,0.1,32);
        //
        // 				}
        //
        // 				if (sprite.tyyppi->bonus  != -1)
        // 					PkEngine::Gifts->add(sprite.tyyppi->bonus);
        //
        // 				if (sprite.tyyppi->muutos != -1)
        // 				{
        // 					if (PkEngine::Sprites->protot[sprite.tyyppi->muutos].AI[0] != AI_BONUS)
        // 					{
        // 						PkEngine::Sprites->player->tyyppi = &PkEngine::Sprites->protot[sprite.tyyppi->muutos];
        // 						PkEngine::Sprites->player->ammus1 = PkEngine::Sprites->player->tyyppi->ammus1;
        // 						PkEngine::Sprites->player->ammus2 = PkEngine::Sprites->player->tyyppi->ammus2;
        // 						PkEngine::Sprites->player->alkupaino = PkEngine::Sprites->player->tyyppi->paino;
        // 						PkEngine::Sprites->player->y -= PkEngine::Sprites->player->tyyppi->korkeus/2;
        // 						//PK_Start_Info("pekka has been transformed!");
        // 					}
        // 				}
        //
        // 				if (sprite.tyyppi->ammus1 != -1)
        // 				{
        // 					PkEngine::Sprites->player->ammus1 = sprite.tyyppi->ammus1;
        // 					PK_Start_Info(tekstit->Hae_Teksti(PK_txt.game_newegg));
        // 				}
        //
        // 				if (sprite.tyyppi->ammus2 != -1)
        // 				{
        // 					PkEngine::Sprites->player->ammus2 = sprite.tyyppi->ammus2;
        // 					PK_Start_Info(tekstit->Hae_Teksti(PK_txt.game_newdoodle));
        // 				}
        //
        // 				PK_Play_Sound(sprite.tyyppi->aanet[AANI_TUHOUTUMINEN],100, (int)sprite.x, (int)sprite.y,
        // 							  sprite.tyyppi->aani_frq, sprite.tyyppi->random_frq);
        //
        // 				Effect::Destruction(tuhoutuminen, (uint)sprite_x, (uint)sprite_y);
        // 			}
        // 		}
        // 	}
        //
        // 	for (i=0;i<SPRITE_MAX_AI;i++)
        // 	{
        // 		if (sprite.tyyppi->AI[i] == AI_EI)
        // 			break;
        //
        // 		switch (sprite.tyyppi->AI[i])
        // 		{
        // 		case AI_BONUS:				sprite.AI_Bonus();break;
        //
        // 		case AI_PERUS:				sprite.AI_Perus();break;
        //
        // 		case AI_MUUTOS_AJASTIN:		if (sprite.tyyppi->muutos > -1)
        // 									sprite.AI_Muutos_Ajastin(PkEngine::Sprites->protot[sprite.tyyppi->muutos]);
        // 									break;
        //
        // 		case AI_TIPPUU_TARINASTA:	sprite.AI_Tippuu_Tarinasta(PkEngine::vibration + kytkin_tarina);
        // 									break;
        //
        // 		default:					break;
        // 		}
        // 	}
        //
        // 	/* The energy doesn't matter that the player is a bonus item */
        // 	if (sprite.pelaaja != 0)
        // 		sprite.energia = 0;
    }
    
    /**
     * Source: PK_Check_Blocks.
     */
    private checkBlocks(sprite: PK2Sprite, future: SpriteAttributes, block: Block) {
        let mask_index: int;
        
        //If sprite is in the block
        if (future.x <= block.right && future.x >= block.left && future.y <= block.bottom && future.y >= block.top) {
            
            /**********************************************************************/
            /* Examine if block is water background                               */
            /**********************************************************************/
            if (block.isWater())
                sprite.inWater = true;
            
            /**********************************************************************/
            /* Examine if it touches the fire                                     */
            /**********************************************************************/
            if (block.code === BLOCK_TULI && this.ctx.entropy.switcher1 === 0 && sprite.knockTimer === 0) {
                sprite.receivedDamage = 2;
                sprite.receivedDamageType = EDamageType.VAHINKO_TULI;
            }
            
            /**********************************************************************/
            /* Examine if bloc is hideway                                         */
            /**********************************************************************/
            if (block.code === EBlockProtoCode.BLOCK_PIILO)
                sprite.piilossa = true;
            
            /**********************************************************************/
            /* Examine if block is the exit                                       */
            /**********************************************************************/
            if (block.code === EBlockProtoCode.BLOCK_LOPETUS && sprite.isPlayer()) {
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
                console.log('FIN DEL JUEGO! :)');
            }
        }
        
        // If sprite is thouching the block
        if (future.left <= block.right - 4 && future.right >= block.left + 4 && future.top <= block.bottom && future.bottom >= block.top + 16) {
            /**********************************************************************/
            /* Examine if it touches the fire                                     */
            /**********************************************************************/
            if (block.code === BLOCK_TULI && this.ctx.entropy.switcher1 === 0 && sprite.knockTimer === 0) {
                sprite.receivedDamage = 2;
                sprite.receivedDamageType = EDamageType.VAHINKO_TULI;
            }
        }
        
        // Examine if there is a block on bottom
        if ((block.code < 80 || block.code > 139) && block.code !== EBlockProtoCode.BLOCK_ESTO_ALAS && block.code < 150) {
            mask_index = Math.floor((future.x + future.a) - block.left);
            
            if (mask_index < 0)
                mask_index = 0;
            
            if (mask_index > 31)
                mask_index = 31;
            
            // block.top += palikkamaskit[block.code].alas[mask_index];
            //
            // if (block.top >= block.bottom - 2)
            //     block.toTheBottom = EBlocks.BLOCK_TAUSTA;
            //
            // block.bottom -= palikkamaskit[block.code].ylos[mask_index];
        }
        
        // If sprite is thouching the block (again?)
        if (future.left <= block.right + 2 && future.right >= block.left - 2 && future.top <= block.bottom && future.bottom >= block.top) {
            /**********************************************************************/
            /* Examine if it is a key and touches lock wall                       */
            /**********************************************************************/
            if (block.code === EBlockProtoCode.BLOCK_LUKKO && sprite.proto.isKey()) {
                //	kartta->seinat[block.vasen/32+(block.yla/32)*PK2KARTTA_KARTTA_LEVEYS] = 255;
                //	kartta->Calculate_Edges();
                
                sprite.piilota = true;
                
                if (sprite.proto.tuhoutuminen !== EDestructionType.TUHOUTUMINEN_EI_TUHOUDU) {
                    avaimia--;
                    // if (avaimia < 1)
                    // 	kartta->Open_Locks();
                }
                
                //Effect::Explosion(block.vasen+16, block.yla+10, 0);
                //PK_Play_Sound(avaa_lukko_aani,100, (int)future.x, (int)sprite_y, SOUND_SAMPLERATE, false);
            }
            
            /**********************************************************************/
            /* Make wind effects                                                  */
            /**********************************************************************/
            if (block.code === EBlockProtoCode.BLOCK_VIRTA_VASEMMALLE && future.toTheLeft)
                future.a -= 0.02;
            
            if (block.code === EBlockProtoCode.BLOCK_VIRTA_OIKEALLE && future.toTheRight)
                future.a += 0.02;	//0.05
            
            /*********************************************************************/
            /* Examine if sprite is on the border to fall                        */
            /*********************************************************************/
            if (block.reuna && sprite.jumpTimer <= 0 && future.y < block.bottom && future.y > block.top) {
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
                    if (block.toTheRight === EBlocks.BLOCK_SEINA) {
                        future.toTheRight = false;
                        
                        if (block.code === EBlockProtoCode.BLOCK_HISSI_HORI)
                            future.x = block.left - future.width / 2;
                    }
                }
                // Examine whether the sprite going in the left side of the block.
                if (future.left + future.a > block.left) {
                    if (block.toTheLeft === EBlocks.BLOCK_SEINA) {
                        future.toTheLeft = false;
                        
                        if (block.code === EBlockProtoCode.BLOCK_HISSI_HORI)
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
                    if (block.toTheBottom === EBlocks.BLOCK_SEINA) { //If it is a wall
                        future.toTheBottom = false;
                        if (block.code === EBlockProtoCode.BLOCK_HISSI_VERT)
                            future.y = block.top - future.height / 2;
                        
                        if (future.bottom - 1 >= block.top && future.b >= 0) {
                            //sprite_y -= sprite_ala - block.yla;
                            if (block.code !== EBlockProtoCode.BLOCK_HISSI_HORI) {
                                future.y = block.top - future.height / 2;
                            }
                        }
                        
                        if (sprite.kytkinpaino >= 1) { // Sprite can press the buttons
                            if (block.code === EBlockProtoCode.BLOCK_KYTKIN1 && this.ctx.entropy.switcher1 === 0) {
                                this.ctx.entropy.switcher1 = KYTKIN_ALOITUSARVO;
                                kytkin_tarina = 64;
                                //PK_Play_Sound(kytkin_aani, 100, (int)future.x, (int)sprite_y, SOUND_SAMPLERATE, false);
                            }
                            
                            if (block.code === EBlockProtoCode.BLOCK_KYTKIN2 && this.ctx.entropy.switcher2 === 0) {
                                this.ctx.entropy.switcher2 = KYTKIN_ALOITUSARVO;
                                kytkin_tarina = 64;
                                //PK_Play_Sound(kytkin_aani, 100, (int)future.x, (int)sprite_y, SOUND_SAMPLERATE, false);
                            }
                            
                            if (block.code === EBlockProtoCode.BLOCK_KYTKIN3 && this.ctx.entropy.switcher3 === 0) {
                                this.ctx.entropy.switcher3 = KYTKIN_ALOITUSARVO;
                                kytkin_tarina = 64;
                                //PK_Play_Sound(kytkin_aani, 100, (int)future.x, (int)sprite_y, SOUND_SAMPLERATE, false);
                            }
                        }
                    }
                }
                
                if (future.top + future.b > block.top) {
                    if (block.toTheTop === EBlocks.BLOCK_SEINA) {
                        future.toTheTop = false;
                        
                        if (future.top < block.bottom) {
                            if (block.code === EBlockProtoCode.BLOCK_HISSI_VERT && sprite.kyykky) {
                                sprite.receivedDamage = 2;
                                sprite.receivedDamageType = EDamageType.VAHINKO_ISKU;
                            }
                            
                            if (block.code !== EBlockProtoCode.BLOCK_HISSI_HORI) {
                                // Source commented:
                                // if (sprite.kyykky)
                                //	sprite_y = block.ala + sprite_korkeus /2;
                                
                                sprite.kyykky = true;
                            }
                        }
                    }
                }
            }
        }
    }
    
    
    /**
     * Source: PK_Draw_InGame.
     */
    private drawGame(): void {
        let luku: str[15];
        // char luku[15];
        // int vali = 20;
        //
        // if (!skip_frame){
        //
        //     PK_Draw_InGame_BG();
        //
        //     if (settings.tausta_spritet)
        //         PK_Draw_InGame_BGSprites();
        //
        //     Game::Particles->draw_bg_particles();
        //
        //     kartta->Piirra_Taustat(Game::camera_x,Game::camera_y,false);
        //
        //     PK_Draw_InGame_Sprites();
        //
        //     //PK_Particles_Draw();
        //     Game::Particles->draw_front_particles();
        //
        //     kartta->Piirra_Seinat(Game::camera_x,Game::camera_y, false);
        //
        //     if (settings.nayta_tavarat)
        //         PK_Draw_InGame_Lower_Menu();
        //
        //     PK_Fadetext_Draw();
        //
        //     PK_Draw_InGame_UI();
        //
        //     if (draw_dubug_info)
        //         PK_Draw_InGame_DebugInfo();
        //     else {
        //         if (dev_mode)
        //             PK_Draw_InGame_DevKeys();
        //         if (test_level)
        //             PisteDraw2_Font_Write(fontti1, "testing level", 0, 480 - 20);
        //         if (show_fps) {
        //             if (fps >= 100)
        //                 vali = PisteDraw2_Font_Write(fontti1, "fps:", 570, 48);
        //             else
        //                 vali = PisteDraw2_Font_Write(fontti1, "fps: ", 570, 48);
        //             fps = Engine->get_fps();
        //             itoa((int)fps, luku, 10);
        //             PisteDraw2_Font_Write(fontti1, luku, 570 + vali, 48);
        //         }
        //     }
        //
        //     if (paused)
        //         PisteDraw2_Font_Write(fontti2,tekstit->Hae_Teksti(PK_txt.game_paused),screen_width/2-82,screen_height/2-9);
        //
        //     if (jakso_lapaisty)
        //         PK_Wavetext_Draw(tekstit->Hae_Teksti(PK_txt.game_clear),fontti2,screen_width/2-120,screen_height/2-9);
        //     else
        //     if (peli_ohi){
        //         if (Game::Sprites->player->energia < 1)
        //         PK_Wavetext_Draw(tekstit->Hae_Teksti(PK_txt.game_ko),fontti2,screen_width/2-90,screen_height/2-9-10);
        //     else
        //         if (timeout < 1 && aikaraja)
        //             PK_Wavetext_Draw(tekstit->Hae_Teksti(PK_txt.game_timeout),fontti2,screen_width/2-67,screen_height/2-9-10);
        //
        //         PK_Wavetext_Draw(tekstit->Hae_Teksti(PK_txt.game_tryagain),fontti2,screen_width/2-75,screen_height/2-9+10);
        //     }
        // }
        //
        // if (skip_frame) Engine->ignore_frame();
        //
        // if (doublespeed) skip_frame = !skip_frame;
        // else skip_frame = false;
        //
        // palikka_animaatio = 1 + palikka_animaatio % 34;
    }
    
    /**
     * Source: PK_Draw_InGame_BG (1/2).
     */
    private addBackground(): void {
        const texture = this._enviroment.textureCache.getTexture(TEXTURE_ID_BGIMAGE);
        this._bgImage = new PIXI.extras.TilingSprite(texture, this.ctx.screenWidth, this.ctx.screenHeight);
        this._enviroment.composition.addBgImage(this._bgImage);
        
        this.updateBackground();
    }
    
    /**
     * Source: PK_Draw_InGame_BG (2/2).
     */
    private updateBackground(): void {
        let pallarx: int = (this._cameraX % (640 * 3)) / 3;
        let pallary: int = (this._cameraY % (480 * 3)) / 3;
        
        switch (this.map.bgMovement) {
        case EBgMovement.TAUSTA_STAATTINEN:
            this._bgImage.x = 0;
            this._bgImage.y = 0;
            break;
        case EBgMovement.TAUSTA_PALLARX_HORI:
            this._bgImage.x = -pallarx;
            this._bgImage.y = 0;
            break;
        case EBgMovement.TAUSTA_PALLARX_VERT:
            this._bgImage.x = 0;
            this._bgImage.y = -pallary;
            break;
        case EBgMovement.TAUSTA_PALLARX_VERT_JA_HORI:
            this._bgImage.x = -pallarx;
            this._bgImage.y = -pallary;
            break;
        }
    }
    
    ///  Accessors  ///
    
    public get ctx(): GameEnv {
        return this._enviroment;
    }
    
    public get map(): PK2Map {
        return this.ctx.map;
    }
}

export const TEXTURE_ID_BGIMAGE = 'PK·BGIMAGE';
export const TEXTURE_ID_BLOCKS = 'PK·BLOCKS';
