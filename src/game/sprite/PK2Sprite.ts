import { SpriteAnimation } from '@game/sprite/SpriteAnimation';
import { SpriteFuture } from '@game/sprite/SpriteFuture';
import { EAi } from '@game/sprite/SpriteManager';
import { SpritePrototype } from '@game/sprite/SpritePrototype';
import { Block } from '@game/tile/Block';
import { TBlockProtoCode } from '@game/tile/BlockPrototype';
import { Drawable } from '@ng/drawable/Drawable';
import { PkImageTextureImpl } from '@ng/types/pixi/PkImageTextureImpl';
import * as PIXI from 'pixi.js';
import { VAHINKO_AIKA } from '../../support/constants';
import { int, BYTE, rand, bool } from '../../support/types';

export class PK2Sprite extends Drawable {
    private _aktiivinen: boolean;			// true / false
    private _pelaaja: int;			// 0 = ei pelaaja, 1 = pelaaja
    private _tyyppi: SpritePrototype;	// osoitin spriten prototyyppiin
    private _piilota: boolean;			// true = ei toiminnassa, false = toiminnassa
    private _alku_x: number;				// spriten alkuper�inen x sijainti
    private _alku_y: number;				// spriten alkuper�inen y sijainti
    private _x: number;					// x-kordinaatti pelikent�ll�
    private _y: number;					// y-kordinaatti pelikent�ll�
    /** Horizontal speed. */
    private _a: number;
    /** Vertical speed. */
    private _b: number;
    public flipX: boolean;				// true = peilikuva sivusuunnassa
    private _flip_y: boolean;				// true = peilikuva pystysuunnassa
    /**
     * Jump progress:
     * - `=0` - Not jumping
     * - `>0` - In jump
     * - `<0` - Going down
     *
     * CPP: hyppy_ajastin
     */
    public jumpTimer: int;		// hypyn kesto: 0 = ei hypyss�, > 0 = hypyss�, < 0 = tullut alas
    private _ylos: boolean;				// voiko sprite juuri nyt liikkua yl�s
    private _alas: boolean;				// voiko sprite juuri nyt liikkua ....
    private _oikealle: boolean;			// voiko sprite juuri nyt liikkua ....
    private _vasemmalle: boolean;			// voiko sprite juuri nyt liikkua ....
    private _reuna_vasemmalla: boolean;	// onko spriten vasemmalla puolella kuoppa?
    private _reuna_oikealla: boolean;		// onko spriten vasemmalla puolella kuoppa?
    private _energy: int;			// monta osumaa sprite viel� kest��
    private _emosprite: int;			// jos spriten on luonut jokin toinen sprite
    private _kytkinpaino: number;		// spriten paino + muiden spritejen panot, joihin kosketaan
    /** Crouched. */
    private _crouched: boolean;				// onko sprite kyykyss�
    private _knockTimer: int;				// onko sprite saanut vahinkoa
    private _lataus: int;				// jos on ammuttu, odotetaan
    private _attack1Remaining: int;			// ajastin joka laskee hy�kk�ys 1:n j�lkeen
    private _attack2Remaining: int;			// ajastin joka laskee hy�kk�ys 2:n j�lkeen
    private _inWater: boolean;			// onko sprite vedess�
    private _piilossa: boolean;			// onko sprite piilossa
    /** Sprite weight. */
    private _weight: number;
    /**
     * Initial weight of the sprite.<br>
     * It can be modified, so it may not be the same that in prototype  */
    private _initialWeight: number;
    private _receivedDamage: int;		// v�hennet��n energiasta jos erisuuri kuin 0
    private _receivedDamageType: EDamageType; // saadun vahingon tyyppi (esim. lumi).
    /** Indicates if sprite is an enemy. */
    private _enemy: boolean;
    /** Index of the projectile prototype used by sprite for attack 1. */
    private _ammo1Proto: SpritePrototype;
    /** Index of the projectile prototype used by sprite for attack 2. */
    private _ammo2Proto: SpritePrototype;
    
    private _pelaaja_x: int;			// tieto siit�, miss� pelaaja on n�hty viimeksi
    private _pelaaja_y: int;
    
    /** Internal clock with a value from 1 to 32000. */
    private _ajastin: int;			// ajastin jonka arvo py�rii v�lill� 1 - 32000
    private _iclk1: InternalClock;			// ajastin jonka arvo py�rii v�lill� 1 - 32000
    
    /** Running animation. */
    private _animaatio_index: BYTE;
    /** Current frame index of the running animation. */
    private _sekvenssi_index: BYTE;
    /** How long the current frame has been running. */
    private _frame_aika: BYTE;
    private _muutos_ajastin: int;		// sprite muuttuu muutosspriteksi kun t�m� nollautuu
    
    private _sprite: PIXI.Sprite;
    
    
    public constructor() ;
    /**
     *
     * @param proto
     * @param isPlayer
     * @param discarded - Originally "piilota".
     * @param x
     * @param y
     */
    public constructor(proto: SpritePrototype, isPlayer: boolean, discarded: boolean, x: number, y: number);
    public constructor(proto?: SpritePrototype, isPlayer?: boolean, discarded?: boolean, x?: number, y?: number) {
        super(new PIXI.Container());
        
        this.reuseWith(proto, isPlayer, discarded, x, y);
    }
    
    public reuse() {
        if (this._piilota === false)
            throw new Error('This sprite is still being used, so it cannot be recycled.');
        
        this._tyyppi = null;
        this._pelaaja = 0;
        this._piilota = true;
        this._x = 0;
        this._y = 0;
        this._alku_x = 0;
        this._alku_y = 0;
        this._a = 0;
        this._b = 0;
        this.jumpTimer = 0;
        this._crouched = false;
        this._energy = 0;
        this._initialWeight = 0;
        this._weight = 0;
        this._kytkinpaino = 0;
        this.flipX = false;
        this._flip_y = false;
        this._animaatio_index = EAnimation.ANIMAATIO_PAIKALLA;
        this._alas = true;
        this._ylos = true;
        this._oikealle = true;
        this._vasemmalle = true;
        this._reuna_oikealla = false;
        this._reuna_vasemmalla = false;
        this._frame_aika = 0;
        this._sekvenssi_index = 0;
        this._knockTimer = 0;
        this._lataus = 0;
        this._attack1Remaining = 0;
        this._attack2Remaining = 0;
        this._inWater = false;
        this._piilossa = false;
        this._receivedDamage = 0;
        this._enemy = false;
        this._ammo1Proto = null;
        this._ammo2Proto = null;
        this._pelaaja_x = -1;
        this._pelaaja_y = -1;
        this._ajastin = 0;
        this._iclk1 = new InternalClock();
        this._muutos_ajastin = 0;
    }
    
    /**
     *
     * @param proto
     * @param isPlayer
     * @param discarded - Originally "piilota".
     * @param x
     * @param y
     */
    public reuseWith(proto: SpritePrototype, isPlayer: boolean, discarded: boolean, x: number, y: number) {
        this.reuse();
        
        if (proto != null) {
            this._tyyppi = proto;
            this._pelaaja = isPlayer ? 1 : 0;  // TODO Convert to boolean
            this._piilota = discarded;
            this._x = x;
            this._y = y;
            this._alku_x = x;
            this._alku_y = y;
            this._energy = proto.energy;
            this._initialWeight = proto.weight;
            this._weight = this._initialWeight;
            this._enemy = proto.isEnemy();
            this._ammo1Proto = proto.ammo1Proto;
            this._ammo2Proto = proto.ammo2Proto;
            
            /*this._drawable.removeChildren();
            const graphics = new PIXI.Graphics();
            if (isPlayer)
                graphics.lineStyle(3, 0xbb0000, 1);
            else
                graphics.lineStyle(2, 0xce1de5, 1);
            graphics.drawRect(-proto.width / 2, -proto.height / 2, proto.width, proto.height);
            this._drawable.addChild(graphics);*/
            
            // const frame = this.proto.getFrame(0);
            // if (frame == null) {
            //     console.debug(`Current frame texture for sprite ${ this.__iid__ } is empty.`);
            // } else {
            //     const tile = new PIXI.Sprite((frame as PkImageTextureImpl).getPixiTexture());
            // }
            this._sprite = new PIXI.Sprite();
            this._sprite.x = -this.proto.width / 2;
            this._sprite.y = -this.proto.height / 2;
            this._drawable.addChild(this._sprite);
        }
    }
    
    /**
     * ~ sprite redraw tick
     *
     * @param kamera_x
     * @param kamera_y
     */
    // TODO coef!
    public Piirra(kamera_x: int, kamera_y: int) {
        let l: int = Math.floor(this.proto.frameWidth / 2);//leveys
        let h: int = Math.floor(this.proto.frameHeight / 2);
        let x: int = this.x;  //TODO: Necessary? Math.floor(this.x-(kamera_x));
        let y: int = this.y;  //TODO: Necessary? Math.floor(this.y-(kamera_y));
        
        const frame = this.Animoi();
        const texture = this.proto.getFrame(frame);
        // if (texture == null) {
        //     console.debug(`Current frame texture for sprite ${ this.__iid__ } is empty.`);
        const tx = (texture as PkImageTextureImpl).getPixiTexture();
        if (this._sprite.texture !== tx)
            this._sprite.texture = tx;
        
        if (this.proto.shakes) {
            x += rand() % 2 - rand() % 2;
            y += rand() % 2 - rand() % 2;
        }
        
        if (this.flipX) {
            this._sprite.scale.x = -1;
            this._sprite.anchor.x = 1;
            if (!this._flip_y) {
                // PisteDraw2_Image_Clip(tyyppi->framet_peilikuva[frame], x - l - 1, y - h);
            } else {
                // PisteDraw2_Image_Clip(tyyppi->framet_peilikuva[frame], x - l - 1, y - h, false, true);
            }
        } else {
            this._sprite.scale.x = 1;
            this._sprite.anchor.x = 0;
            if (!this._flip_y) {
                // PisteDraw2_Image_Clip(tyyppi->framet[frame], x - l - 1, y - h);
            } else {
                // PisteDraw2_Image_Clip(tyyppi->framet[frame], x - l - 1, y - h, false, true);
            }
        }
        
        this._drawable.renderable = true;
    }
    
    public causeDamage(level: number, type: EDamageType) {
        this._receivedDamage = level;
        this._receivedDamageType = type;
    }
    
    
    ///  Animation  ///
    
    /**
     * Animates the sprite.
     * SDL: PK2Sprite::Animoi.
     */
    public Animoi(): int {
        let frame: int = 0;
        
        switch (this.proto.getBehavior(0)) {
        case EAi.AI_KANA:
            this.animationChicken();
            break;
        case EAi.AI_PIKKUKANA:
            this.animationChicken();
            break;
        case EAi.AI_BONUS:
            this.animationBonus();
            break;
        case EAi.AI_MUNA:
            this.animationEgg();
            break;
        case EAi.AI_AMMUS:
            this.animationAmmo();
            break;
        case EAi.AI_HYPPIJA:
            this.animationChicken();
            break;
        case EAi.AI_PERUS:
            this.animationBase();
            break;
        case EAi.AI_TELEPORTTI:
            this.animationBase();
            break;
        default:
            break;
        }
        
        const animaatio: SpriteAnimation = this.proto.getAnimation(this._animaatio_index);
        
        if (this._sekvenssi_index >= animaatio.frameja) {
            this._sekvenssi_index = 0;
        }
        
        frame = animaatio.sekvenssi[this._sekvenssi_index] - 1;
        
        // Lasketaan kuinka paljon talla hetkella voimassa olevaa framea viela naytetaan
        if (this._frame_aika < this.proto.frameRate) {
            this._frame_aika++;
            // Jos aika on kulunut loppuun, vaihdetaan seuraava frame tamanhetkisesta animaatiosta
        } else {
            this._frame_aika = 0;
            
            // Onko animaatiossa enaa frameja?
            if (this._sekvenssi_index < animaatio.frameja - 1) {
                this._sekvenssi_index++;
                // Jos ei ja animaatio on asetettu luuppaamaan, aloitetaan animaatio alusta.
            } else {
                if (animaatio.looppi) {
                    this._sekvenssi_index = 0;
                }
            }
        }
        
        if (frame > this.proto.frameCount) {
            frame = this.proto.frameCount;
        }
        
        this._drawable.renderable = false;
        
        return frame;
    }
    
    /**
     * SDL: PK2Sprite::Animaatio.
     *
     * @param index - Index of the animation to apply.
     * @param reset - If animation is applied, start from frame 0.
     */
    public animation(index: int, reset: boolean): void {
        if (index != this._animaatio_index) {
            if (reset) {
                this._sekvenssi_index = 0;
            }
            this._animaatio_index = index;
        }
    }
    
    /**
     * SDL: PK2Sprite::Animaatio_Perus.
     */
    private animationBase(): void {
        let uusi_animaatio: EAnimation;
        let alusta: boolean = false;
        
        if (this._energy < 1 && !this._alas) {
            uusi_animaatio = EAnimation.ANIMAATIO_KUOLEMA;
            alusta = true;
        } else {
            if (this.a > -0.2 && this.a < 0.2 && this.b === 0 && this.jumpTimer <= 0) {
                uusi_animaatio = EAnimation.ANIMAATIO_PAIKALLA;
                alusta = true;
            }
            
            if ((this.a < -0.2 || this.a > 0.2) && this.jumpTimer <= 0) {
                uusi_animaatio = EAnimation.ANIMAATIO_KAVELY;
                alusta = false;
            }
            
            if (this.b < 0)//-0.3
            {
                uusi_animaatio = EAnimation.ANIMAATIO_HYPPY_YLOS;
                alusta = false;
            }
            
            if ((this.jumpTimer > this.proto.maxJump || this.b > 1.5) && this._alas) {
                uusi_animaatio = EAnimation.ANIMAATIO_HYPPY_ALAS;
                alusta = false;
            }
            
            if (this._crouched) {
                uusi_animaatio = EAnimation.ANIMAATIO_KYYKKY;
                alusta = true;
            }
            
            if (this._attack1Remaining > 0) {
                uusi_animaatio = EAnimation.ANIMAATIO_HYOKKAYS1;
                alusta = true;
            }
            
            if (this._attack2Remaining > 0) {
                uusi_animaatio = EAnimation.ANIMAATIO_HYOKKAYS2;
                alusta = true;
            }
            
            if (this._knockTimer > 0) {
                uusi_animaatio = EAnimation.ANIMAATIO_VAHINKO;
                alusta = false;
            }
        }
        
        if (uusi_animaatio != null) {
            this.animation(uusi_animaatio, alusta);
        }
    }
    
    /**
     * SDL: PK2Sprite::Animaatio_Kana.
     */
    private animationChicken(): void {
        let newAnimation: EAnimation;
        let alusta: boolean = false;
        
        if (this._energy < 1 && !this._alas) {
            newAnimation = EAnimation.ANIMAATIO_KUOLEMA;
            alusta = true;
        } else {
            if (this.a > -0.2 && this.a < 0.2 && this.b === 0 && this.jumpTimer <= 0) {
                newAnimation = EAnimation.ANIMAATIO_PAIKALLA;
                alusta = true;
            }
            
            if ((this.a < -0.2 || this.a > 0.2) && this.jumpTimer <= 0) {
                newAnimation = EAnimation.ANIMAATIO_KAVELY;
                alusta = false;
            }
            
            if (this.b < 0)/*-0.3*/            {
                newAnimation = EAnimation.ANIMAATIO_HYPPY_YLOS;
                alusta = false;
            }
            
            if ((this.jumpTimer > 90 + 10/*tyyppi->max_hyppy || b > 1.5*/) && this._alas) {
                newAnimation = EAnimation.ANIMAATIO_HYPPY_ALAS;
                alusta = false;
            }
            
            if (this._attack1Remaining > 0) {
                newAnimation = EAnimation.ANIMAATIO_HYOKKAYS1;
                alusta = true;
            }
            
            if (this._attack2Remaining > 0) {
                newAnimation = EAnimation.ANIMAATIO_HYOKKAYS2;
                alusta = true;
            }
            
            if (this._crouched) {
                newAnimation = EAnimation.ANIMAATIO_KYYKKY;
                alusta = true;
            }
            
            if (this._knockTimer > 0) {
                newAnimation = EAnimation.ANIMAATIO_VAHINKO;
                alusta = false;
            }
        }
        
        if (newAnimation != null) {
            this.animation(newAnimation, alusta);
        }
    }
    
    /**
     * SDL: PK2Sprite::Animaatio_Bonus.
     */
    private animationBonus(): void {
        this.animation(EAnimation.ANIMAATIO_PAIKALLA, true);
    }
    
    /**
     * SDL: PK2Sprite::Animaatio_Ammus.
     */
    private animationAmmo(): void {
        this.animation(EAnimation.ANIMAATIO_PAIKALLA, true);
    }
    
    /**
     * SDL: PK2Sprite::Animaatio_Muna.
     */
    private animationEgg(): void {
        let newAnimation: int = 0;
        let alusta: boolean = false;
        
        newAnimation = EAnimation.ANIMAATIO_PAIKALLA;
        alusta = true;
        
        if (this._energy < this.proto.energy) {
            newAnimation = EAnimation.ANIMAATIO_KUOLEMA;
            alusta = true;
        }
        
        this.animation(newAnimation, alusta);
    }
    
    
    ///  Behaviors (AI)  ///
    
    /** @deprecated Use hasBehavior */
    public Onko_AI(ai: EAi): boolean { throw new Error('DEPRECATED'); }
    /**
     * Returns true if this prototype has the specified behavior, false otherwise.
     *
     * @param ai - Behavior to check.
     */
    public hasBehavior(ai: EAi): boolean {
        return this.proto.hasBehavior(ai);
    }
    
    //     //AI_Functions
    //     int AI_Kana();
    //     int AI_Bonus();
    //     int AI_Muna();
    
    public AI_Projectile(): void {
        if (this.x < 10) {
            this.x = 10;
        }
        
        if (this.y > 9920) {
            this.y = 9920;
        }
        
        if (this.a < 0) {
            this.flipX = true;
        }
        
        if (this.a > 0) {
            this.flipX = false;
        }
        
        if (this._lataus === 0) {
            this._lataus = this.proto.latausaika;
        }
        
        if (this.lataus === 1) {
            this._receivedDamage = this.proto.energy;
            this._receivedDamageType = EDamageType.VAHINKO_KAIKKI;
        }
        
        if (this._energy < 1) {
            this._piilota = true;
        }
    }
    
    public AI_Hyppija(): void {
        if (this.x < 10) {
            this.x = 10;
        }
        
        if (this.y > 9920) {
            this.y = 9920;
        }
        
        if (this.energy > 0) {
            if (!this._alas && this.b === 0 && this.jumpTimer === 0) {
                this.jumpTimer = 1;
            }
        }
        
        if (this.a < 0) {
            this.flipX = true;
        }
        
        if (this.a > 0) {
            this.flipX = false;
        }
    }
    
    public AI_Frog1(coef: number = 1): void {
        if (this.energy > 0) {
            if (/*this._ajastin % 100 === 0*/ this._iclk1.tics(100) && this.jumpTimer === 0 && this._ylos) {
                this.jumpTimer = 1;
            }
        }
    }
    
    public AI_Frog2(coef: number = 1): void {
        if (this.energy > 0) {
            if (/*this._ajastin % 100 === 0*/ this._iclk1.tics(100) && this._ylos) {
                this.jumpTimer = 1;
            }
            
            if (this.jumpTimer > 0) {
                if (!this.flipX) {
                    this._a = this.proto.maxSpeed / 3.5;
                } else {
                    this._a = this.proto.maxSpeed / -3.5;
                }
            }
        }
    }
    
    /**
     * SDL: PK2Sprite::AI_Perus.
     */
    public AI_Perus(coef: number = 1): void {
        // Horizontal boundaries
        if (this._x < 10) {
            this._x = 10;
            this._vasemmalle = false;
        } else if (this._x > 8192) {
            this._x = 8192;
            this._oikealle = false;
        }
        
        // Vertical boundaries
        if (this._y > 9920) {
            this._y = 9920;
        } else if (this._y < -32) {
            this._y = -32;
        }
        
        // Flip texture when negative speed
        if (this._a < 0) {
            this.flipX = true;
        } else if (this._a > 0) {
            this.flipX = false;
        }
        
        // Increase the internal clock
        this._ajastin++;
        if (this._ajastin > 31320) {  //-> divisible by 360
            this._ajastin = 0;
        }
        // New internal clock
        this._iclk1.incr(1 * coef);
        /* if (this._iclk1 > 31320) {  //-> divisible by 360
             this._iclk1 = 0;
         }*/
    }
    
    /**
     * "Turn from obstavle hori"
     */
    public AI_TurnsBackBeacuseObstacleH(): int {
        if (this._energy > 0) {
            if (!this._oikealle) {
                this.a = this.proto.maxSpeed / -3.5;
                return 1;
            }
            
            if (!this._vasemmalle) {
                this.a = this.proto.maxSpeed / 3.5;
                return 1;
            }
        }
        return 0;
    }
    
    public AI_TurnsBackBeacuseObstacleV(): int {
        if (this._energy > 0) {
            if (!this._alas) {
                this.b = this.proto.maxSpeed / -3.5;
                return 1;
            }
            
            if (!this._ylos) {
                this.b = this.proto.maxSpeed / 3.5;
                return 1;
            }
        }
        return 0;
    }
    
    public AI_Varoo_Kuoppaa(coef: number = 1): void {
        const max: number = this.proto.maxSpeed / 3.5;
        
        if (this._energy > 0) {
            if (this.reuna_oikealla && this.a > -max) {
                this.a -= (0.13 * coef);
            }
            
            if (this.reuna_vasemmalla && this.a < max) {
                this.a += (0.13 * coef);
            }
            
            // ***
            // if (this->reuna_oikealla && this->a > 0)
            // {
            //    this->a = this->a * -1;
            //    flip_x = true;
            // }
            //
            // if (this->reuna_vasemmalla && this->a < 0)
            // {
            //    this->a = this->a * -1;
            //    flip_x = false;
            // }
        }
    }
    
    public AI_Random_Kaantyminen(): void {
        if (this.energy > 0) {
            if (this._ajastin % 400 === 1 && this.a === 0) {
                this.flipX = !this.flipX;
            }
        }
    }
    
    public AI_Random_Suunnanvaihto_Hori(): void {
        if (this.energy > 0) {
            if (rand() % 150 === 1) {
                const max: number = Math.floor(this.proto.maxSpeed / 4);
                
                while (this.a == 0 && max > 0)
                    this.a = rand() % max + 1 - rand() % max + 1;
            }
        }
    }
    
    public AI_Random_Hyppy(): void {
        if (this._energy > 0) {
            if (rand() % 150 === 10 && this.b === 0 && this.jumpTimer === 0 && this._ylos) {
                this.jumpTimer = 1;
            }
        }
    }
    
    public AI_Random_Liikahdus_Vert_Hori(): void {
        if (this._energy > 0) {
            if (rand() % 150 === 1 || this._ajastin === 1) {
                if (Math.floor(this.a) === 0 || Math.floor(this.b) === 0) {
                    const max: int = Math.floor(this.proto.maxSpeed);
                    
                    if (max != 0) {
                        while (this.a == 0)
                            this.a = rand() % (max + 1) - rand() % (max + 1);
                        
                        while (this.b == 0)
                            this.b = rand() % (max + 1) - rand() % (max + 1);
                        
                        //a /= 3.0;
                        //b /= 3.0;
                    }
                }
            }
        }
    }
    
    public AI_FollowPlayer(player: PK2Sprite, coef: number = 1): void {
        if (this._energy > 0 && player.energy > 0) {
            const max: number = this.proto.maxSpeed / 3.5;
            
            if (this.a > -max && this.x > player.x) {
                this.a -= (0.1 * coef);
            }
            
            if (this.a < max && this.x < player.x) {
                this.a += (0.1 * coef);
            }
            
            this._pelaaja_x = Math.floor(player.x + player.a);
            this._pelaaja_y = Math.floor(player.y + player.b);
            
            if (this.proto.maxSpeed === 0) {
                if (player.x < this.x) {
                    this.flipX = true;
                } else {
                    this.flipX = false;
                }
            }
        }
    }
    
    public AI_Seuraa_Pelaajaa_Jos_Nakee(player: PK2Sprite, coef: number = 1): void {
        if (this._energy > 0 && player._energy > 0) {
            const max: number = this.proto.maxSpeed / 3.5;
            
            if (this._pelaaja_x != -1) {
                if (this.a > -max && this.x > this._pelaaja_x) {
                    this.a -= (0.1 * coef);
                }
                if (this.a < max && this.x < this._pelaaja_x) {
                    this.a += (0.1 * coef);
                }
            }
            
            if ((player.x < this.x && this.flipX) || (player.x > this.x && !this.flipX)) {
                if ((player.x - this.x < 300 && player.x - this.x > -300) &&
                    (player.y - this.y < this.proto.height && player.y - this.y > -this.proto.height)) {
                    this._pelaaja_x = Math.floor(player.x + player.a);
                    this._pelaaja_y = Math.floor(player.y + player.b);
                } else {
                    this._pelaaja_x = -1;
                    this._pelaaja_y = -1;
                }
            }
        }
    }
    
    public AI_Seuraa_Pelaajaa_Jos_Nakee_Vert_Hori(player: PK2Sprite, coef: number = 1): void {
        if (this._energy > 0 && player._energy > 0) {
            const max: number = this.proto.maxSpeed / 3.5;
            
            if (this._pelaaja_x != -1) {
                if (this.a > -max && this.x > this._pelaaja_x) {
                    this.a -= (0.1 * coef);
                }
                
                if (this.a < max && this.x < this._pelaaja_x) {
                    this.a += (0.1 * coef);
                }
                
                if (this.b > -max && this.y > this._pelaaja_y) {
                    this.b -= (0.4 /** coef*/);
                }
                
                if (this.b < max && this.y < this._pelaaja_y) {
                    this.b += (0.4 /** coef*/);
                }
            }
            
            if ((player.x < this.x && this.flipX) || (player.x > this.x && !this.flipX)) {
                if ((player.x - this.x < 300 && player.x - this.x > -300) &&
                    (player.y - this.y < 80 && player.y - this.y > -80)) {
                    this._pelaaja_x = Math.floor(player.x + player.a);
                    this._pelaaja_y = Math.floor(player.y + player.b);
                } else {
                    this._pelaaja_x = -1;
                    this._pelaaja_y = -1;
                }
            }
        }
    }
    
    public AI_Seuraa_Pelaajaa_Vert_Hori(player: PK2Sprite, coef: number = 1): void {
        if (this._energy > 0 && player._energy > 0) {
            const max: number = this.proto.maxSpeed / 3.5;
            
            if (this.a > -max && this.x > player.x) {
                this.a -= (0.1 * coef);
            }
            
            if (this.a < max && this.x < player.x) {
                this.a += (0.1 * coef);
            }
            
            if (this.b > -max && this.y > player.y) {
                this.b -= (0.4 /** coef*/);
            }
            
            if (this.b < max && this.y < player.y) {
                this.b += (0.4 /** coef*/);
            }
            
            this._pelaaja_x = Math.floor(player.x + player.a);
            this._pelaaja_y = Math.floor(player.y + player.b);
            
            if (this.proto.maxSpeed === 0) {
                if (player.x < this.x)
                    this.flipX = true;
                else
                    this.flipX = false;
            }
        }
    }
    
    //     int AI_Jahtaa_Pelaajaa(PK2Sprite &pelaaja);
    
    /**
     * It will run away if it sees the player.
     * SDL: PK2Sprite::AI_Pakenee_Pelaajaa_Jos_Nakee
     */
    public AI_Pakenee_Pelaajaa_Jos_Nakee(player: PK2Sprite): void {
        if (this._energy > 0 && player._energy > 0) {
            if ((player.x < this.x && this.flipX && !player.flipX) || (player.x > this.x && !this.flipX && player.flipX))
                if ((player.x - this.x < 300 && player.x - this.x > -300) &&
                    (player.y - this.y < this.proto.height && player.y - this.y > -this.proto.height)) {
                    const max: number = this.proto.maxSpeed / 2.5;
                    
                    if (this.x > player.x) {
                        this._a = max;
                        this.flipX = false;
                    }
                    
                    if (this.x < player.x) {
                        this._a = max * -1;
                        this.flipX = true;
                    }
                }
        }
    }
    
    /** Changes prototype if energy < 2. */
    public AI_Muutos_Jos_Energiaa_Alle_2(muutos: SpritePrototype): boolean {
        if (this._energy < 2 && muutos !== this.proto) {
            this._tyyppi = muutos;
            this._initialWeight = this.proto.weight;
            // Janne
            // ammus1 = tyyppi->ammus1;
            // ammus2 = tyyppi->ammus2;
            return true;
        }
        return false;
    }
    
    /**
     * SDL: PK2Sprite::AI_Muutos_Jos_Energiaa_Yli_1
     */
    public AI_Muutos_Jos_Energiaa_Yli_1(morph: SpritePrototype): boolean {
        if (this._energy > 1 && morph != this.proto) {
            this._tyyppi = morph;
            this._initialWeight = this.proto.weight;
            // Janne
            // ammus1 = tyyppi->ammus1;
            // ammus2 = tyyppi->ammus2;
            return true;
        }
        
        return false;
    }
    
    /**
     * SDL: PK2Sprite::AI_Muutos_Ajastin
     */
    public AI_Muutos_Ajastin(morph: SpritePrototype): boolean {
        if (this._energy > 0 && morph != this.proto) {
            if (this._muutos_ajastin/*lataus*/ == 0)
                this._muutos_ajastin/*lataus*/ = this.proto.latausaika;
            
            if (this.muutos_ajastin/*lataus*/ == 1) {
                this._tyyppi = morph;
                this._initialWeight = this.proto.weight;
                
                this._ammo1Proto = this.proto.ammo1Proto;
                this._ammo2Proto = this.proto.ammo2Proto;
                
                this._animaatio_index = -1;
                
                this.animation(EAnimation.ANIMAATIO_PAIKALLA, true);
            }
            return true;
        }
        
        return false;
    }
    
    /**
     *
     * SDL: PK2Sprite::AI_Muutos_Jos_Osuttu
     */
    public AI_Muutos_Jos_Osuttu(morph: SpritePrototype): boolean {
        if (this._energy > 0 && morph != this.proto) {
            if (this._receivedDamage > 0) {
                this._tyyppi = morph;
                this._initialWeight = this.proto.weight;
                
                this._ammo1Proto = this.proto.ammo1Proto;
                this._ammo2Proto = this.proto.ammo2Proto;
                
                this._animaatio_index = -1;
                
                this.animation(EAnimation.ANIMAATIO_PAIKALLA, true);
                
                return true;
            }
        }
        
        return false;
    }
    
    public AI_Hyokkays_1_Jos_Osuttu(): int {
        if (this._receivedDamage > 0 && this._energy > 0) {
            this._attack1Remaining = this.proto._hyokkays1_aika;
            this._lataus = 0;
            return 1;
        }
        return 0;
    }
    
    public AI_Hyokkays_2_Jos_Osuttu(): int {
        if (this._receivedDamage > 0 && this._energy > 0) {
            this._attack2Remaining = this.proto._hyokkays2_aika;
            this._lataus = 0;
            return 1;
        }
        return 0;
    }
    public AI_Hyokkays_1_Nonstop(): int {
        if (this._lataus === 0 && this._energy > 0) {
            this._attack1Remaining = this.proto._hyokkays1_aika;
            return 1;
        }
        return 0;
    }
    
    public AI_Hyokkays_2_Nonstop(): int {
        if (this._lataus === 0 && this._energy > 0) {
            this._attack2Remaining = this.proto._hyokkays2_aika;
            return 1;
        }
        return 0;
    }
    
    //     int AI_Hyokkays_1_Jos_Pelaaja_Edessa(PK2Sprite &pelaaja);
    //     int AI_Hyokkays_2_Jos_Pelaaja_Edessa(PK2Sprite &pelaaja);
    //     int AI_Hyokkays_1_Jos_Pelaaja_Alapuolella(PK2Sprite &pelaaja);
    
    public AI_NonStop(coef: number = 1): void {
        if (this.energy > 0) {
            let max: number = this.proto.maxSpeed / 3.5;
            
            if (this.flipX) {
                if (this.a > -max)
                    this.a -= (0.1 * coef);
            } else {
                if (this.a < max)
                    this.a += (0.1 * coef);
            }
        }
    }
    
    //     int AI_Hyppy_Jos_Pelaaja_Ylapuolella(PK2Sprite &pelaaja);
    
    public AI_Pommi(): void {
        if (this.lataus === 0) {
            this._lataus = this.proto.latausaika;
        }
        
        if (this.lataus === 1) {
            this.receivedDamage = this.energy;
            this.receivedDamageType = EDamageType.VAHINKO_KAIKKI;
        }
    }
    
    /**
     * It will be damaged by the water.
     * SDL: PK2Sprite::AI_Vahingoittuu_Vedesta
     */
    public AI_Vahingoittuu_Vedesta(): void {
        if (this._energy > 0)
            if (this._inWater)
                this.receivedDamage++;
    }
    
    //     int AI_Tapa_Kaikki();
    //     int AI_Kitka_Vaikuttaa();
    //     int AI_Piiloutuu();
    //     int AI_Palaa_Alkuun_X();
    //     int AI_Palaa_Alkuun_Y();
    
    /**
     * SDL: PK2Sprite::AI_Kaantyy_Jos_Osuttu
     */
    // TODO Review coef
    public AI_TurnsIfHitted(): void {
        const dam: int = (VAHINKO_AIKA > 0 && this._energy > 0) ? 1 : 0; //Damage
        
        if (this._knockTimer === dam) {
            if (this.a != 0)
                this.a = -this.a;
            
            this.flipX = !this.flipX;
        }
    }
    
    /**
     * SDL: PK2Sprite::AI_Tippuu_Tarinasta
     */
    public AI_Tippuu_Tarinasta(tarina: int): void {
        if (this._energy > 0 && tarina > 0) {
            this._initialWeight = 0.5;
        }
    }
    
    // TODO Review coef
    public AI_MovesX(movement: number): void {
        if (this._energy > 0)
            this._x = this._alku_x + movement;
    }
    
    // TODO Review coef
    public AI_MovesY(movement: number): void {
        if (this._energy > 0)
            this._y = this._alku_y + movement;
    }
    
    /**
     * SDL: PK2Sprite::AI_Tippuu_Jos_Kytkin_Painettu
     *
     * @param kytkin
     */
    // TODO Review coef
    public AI_DripsWhenSwitchPressed(kytkin: int): void {
        if (kytkin > 0) {
            this._initialWeight = 1.5;
        }
    }
    
    /**
     * SDL: PK2Sprite::AI_Liikkuu_Jos_Kytkin_Painettu
     *
     * @param kytkin
     * @param ak
     * @param bk
     */
    // TODO Review coef
    public AI_MovesWhenSwitchPressed(kytkin: int, ak: int, bk: int): void {
        if (kytkin > 0) {
            if (this.a == 0 && ak != 0) {
                this.a = this.proto.maxSpeed / 3.5 * ak; // ak = -1 / 1
            }
            
            if (this.b == 0 && bk != 0) {
                this.b = this.proto.maxSpeed / 3.5 * bk; // bk = -1 / 1
            }
        }
        this.flipX = false;
    }
    
    //     int AI_Teleportti(int i, PK2Sprite *spritet, int max, PK2Sprite &pelaaja);
    
    /**
     * SDL: PK2Sprite::AI_Kiipeilija
     */
    public AI_Climber(): void {
        if (this._energy > 0) {
            if (!this._alas && this._vasemmalle) {
                this.b = 0;
                this.a = this.proto.maxSpeed / -3.5;
                //return 1;
            }
            
            if (!this._ylos && this._oikealle) {
                this.b = 0;
                this.a = this.proto.maxSpeed / 3.5;
                //b = this.proto.maxSpeed / 3.5;
                //return 1;
            }
            
            if (!this._oikealle && this._alas) {
                this.a = 0;
                this.b = this.proto.maxSpeed / 3.5;
                //return 1;
            }
            
            if (!this._vasemmalle && this._ylos) {
                this.a = 0;
                this.b = this.proto.maxSpeed / -3.5;
                //return 1;
            }
        }
    }
    
    /**
     * SDL: PK2Sprite::AI_Kiipeilija2
     */
    public AI_Climber2(): void {
        if (this._energy > 0) {
            if (this._vasemmalle && this._oikealle && this._ylos && this._alas) {
                
                if (this.a < 0) {
                    this.b = this.proto.maxSpeed / 3.5;
                    //a = 0;
                } else if (this.a > 0) {
                    this.b = this.proto.maxSpeed / -3.5;
                    //a = 0;
                } else if (this.b < 0) {
                    this.a = this.proto.maxSpeed / -3.5;
                    //b = 0;
                } else if (this.b > 0) {
                    this.a = this.proto.maxSpeed / 3.5;
                    //b = 0;
                }
                if (this.b != 0)
                    this.a = 0;
            }
        }
    }
    
    public AI_Info(player: PK2Sprite): boolean {
        if ((player.x - this.x < 10 && player.x - this.x > -10) &&
            (player.y - this.y < this.proto.height && player.y - this.y > -this.proto.height)) {
            return true;
        }
        return false;
    }
    
    /**
     * SDL: PK2Sprite::AI_Tuhoutuu_Jos_Emo_Tuhoutuu
     */
    //    public AI_Tuhoutuu_Jos_Emo_Tuhoutuu(PK2Sprite *spritet):boolean{
    // 	if (emosprite > -1)     	{
    // 		if (spritet[emosprite].energia < 1 && energia > 0)     		{
    // 			saatu_vahinko = energia;
    // 			this->saatu_vahinko_tyyppi = VAHINKO_KAIKKI;
    //
    // 			return 1;
    // 		}
    // 	}
    //
    // 	return 0;
    // }
    
    public AI_Chicken(): void {
        // Left boundary
        if (this.x < 10)
            this.x = 10;
        
        // Bottom boundary
        if (this.y > 9920)
            this.y = 9920;
        
        if (this.energy > 0) {
            if (rand() % 50 === 10 && this.a !== 0) {
                this.a /= 1.1;
            }
            
            if (rand() % 150 === 10 && this.b == 0 && this.jumpTimer === 0 && this._ylos) {
                this.jumpTimer = 1;
                while (this.a === 0)
                    this.a = rand() % 2 - rand() % 2;
            }
            
            if (rand() % 20 === 1 && this.b === 0 && this.jumpTimer === 0 && !this._oikealle && !this.flipX) {
                this.jumpTimer = 1;
                while (this.a === 0)
                    this.a = rand() % 2;
            }
            
            if (rand() % 20 === 1 && this.b === 0 && this.jumpTimer === 0 && !this._vasemmalle && this.flipX) {
                this.jumpTimer = 1;
                while (this.a === 0)
                    this.a = rand() % 2 * -1;
            }
            
            if (rand() % 200 === 10) {
                this.a = rand() % 2 - rand() % 2;
            }
            
            if (this.jumpTimer === this.proto.maxJump && this.a === 0) {
                while (this.a == 0)
                    this.a = rand() % 2 - rand() % 2;
            }
            
            // ***
            // // reunatesti
            // if (rand()%100 == 2)
            //    a = rand()%2-rand()%2;
            //
            // if (reuna_vasemmalla && a < 0)
            //    a = 0;
            //
            // if (reuna_oikealla && a > 0)
            //    a = 0;
            
            if (this.a < 0) {
                this.flipX = true;
            }
            
            if (this.a > 0) {
                this.flipX = false;
            }
        }
    }
    
    public AI_Bonus(): void {
        if (this.x < 10)
            this.x = 10;
        
        if (this.y > 9920)
            this.y = 9920;
    }
    
    public AI_Egg(): void {
        if (this.x < 10)
            this.x = 10;
        
        if (this.y > 9920)
            this.y = 9920;
        
        if (!this._alas)
            this._energy = 0;
        
        // ***
        // //a /= 1.01;
        
        if (this.energy === 0 && this.lataus === 0) {
            this.lataus = this.proto.latausaika;
        }
        
        if (this.lataus === 1) {
            this.piilota = true;
        }
    }
    
    //     int Animaatio_Ammus();
    
    
    ///  Accessors  ///
    
    public get proto() {
        return this._tyyppi;
    }
    
    public get x(): number {
        return this._x;
    }
    public set x(v: number) {
        this._x = v;
        this._drawable.x = v;
    }
    
    /** @deprecated use initialX */
    public get alku_x(): number {
        return this.initialX;
    }
    public get initialX(): number {
        return this._alku_x;
    }
    public set initialX(v: number) {
        this._alku_x = v;
    }
    
    /** @deprecated use initialY */
    public get alku_y(): number {
        return this.initialY;
    }
    public get initialY(): number {
        return this._alku_y;
    }
    public set initialY(v: number) {
        this._alku_y = v;
    }
    
    public get y(): number {
        return this._y;
    }
    public set y(v: number) {
        this._y = v;
        this._drawable.y = v;
    }
    
    public get a(): number {
        return this._a;
    }
    public set a(v: number) {
        this._a = v;
    }
    
    public get b(): number {
        return this._b;
    }
    public set b(v: number) {
        this._b = v;
    }
    
    public get top(): number {
        return this.y - this.proto.height / 2;
    }
    public get right(): number {
        return this.x + this.proto.width / 2;
    }
    public get bottom(): number {
        return this.y + this.proto.height / 2;
    }
    public get left(): number {
        return this.x - this.proto.width / 2;
    }
    
    public get topIsBarrier(): boolean {
        return this._ylos;
    }
    public set topIsBarrier(v: boolean) {
        this._ylos = v;
    }
    
    public get bottomIsBarrier(): boolean {
        return this._alas;
    }
    public set bottomIsBarrier(v: boolean) {
        this._alas = v;
    }
    
    public get leftIsBarrier(): boolean {
        return this._vasemmalle;
    }
    public set leftIsBarrier(v: boolean) {
        this._vasemmalle = v;
    }
    
    public get rightIsBarrier(): boolean {
        return this._oikealle;
    }
    public set rightIsBarrier(v: boolean) {
        this._oikealle = v;
    }
    
    /**
     * When is < 1 the character dies.
     */
    public get energy(): int {
        return this._energy;
    }
    public set energy(v: int) {
        this._energy = v;
    }
    
    public isEnemy(): boolean {
        return this._enemy;
    }
    /** @deprecated */ public vihollinen(): boolean { return this.isEnemy(); }
    
    /**
     * Indicates that the sprite is ¿permanently? hidden and can be reused from the sprite pool.
     */
    public get piilota(): boolean {
        return this._piilota;
    }
    /** @deprecated: Must use hide methods. */
    public set piilota(v: boolean) {
        this._piilota = v;
    }
    
    /**
     * Returns isPlayer (boolean) as an int.<br>
     * The use of isPlayer is preferred.
     */
    public get pelaaja(): int {
        return this._pelaaja;
    }
    /**
     *
     */
    public isPlayer(): boolean {
        return this._pelaaja !== 0;
    }
    
    /** @deprecated use remainingAttack1 */
    public get hyokkays1(): int {
        return this.attack1Remaining;
    }
    public get attack1Remaining(): int {
        return this._attack1Remaining;
    }
    public set attack1Remaining(v: int) {
        this._attack1Remaining = v;
    }
    
    public get ajastin(): int {
        return this._ajastin;
    }
    
    /** @deprecated use remainingAttack2 */
    public get hyokkays2(): int {
        return this.attack2Remaining;
    }
    public get attack2Remaining(): int {
        return this._attack2Remaining;
    }
    public set attack2Remaining(v: int) {
        this._attack2Remaining = v;
    }
    
    public get lataus(): int {
        return this._lataus;
    }
    public set lataus(v: int) {
        this._lataus = v;
    }
    
    /** @deprecated use jumpTimer */
    public get hyppy_ajastin(): int {
        return this.jumpTimer;
    }
    
    /** @deprecated use knockTimer */
    public get isku(): int {
        return this.knockTimer;
    }
    public get knockTimer(): int {
        return this._knockTimer;
    }
    public set knockTimer(v: int) {
        this._knockTimer = v;
    }
    
    public get muutos_ajastin(): int {
        return this._muutos_ajastin;
    }
    public set muutos_ajastin(v: int) {
        this._muutos_ajastin = v;
    }
    
    /** @see _ammo1Proto */
    public get ammo1Proto(): SpritePrototype { return this._ammo1Proto; }
    /** @deprecated Use {@link ammo1Proto}, that uses {@link SpritePrototype} instead an index. */
    public get ammus1(): SpritePrototype { throw new Error('DEPRECATED'); }
    /** @see _ammo2Proto */
    public get ammo2Proto(): SpritePrototype { return this._ammo2Proto; }
    /** @deprecated Use {@link ammo1Proto}, that uses {@link SpritePrototype} instead an index. */
    public get ammus2(): SpritePrototype { throw new Error('DEPRECATED'); }
    
    /** @deprecated use weight */
    public get paino(): number {
        return this.weight;
    }
    public get weight(): number {
        return this._weight;
    }
    public set weight(v: number) {
        this._weight = v;
    }
    
    /** Crouched. */
    public get kyykky(): boolean {
        return this._crouched;
    }
    /** Crouched. */
    public set kyykky(v: boolean) {
        this._crouched = v;
    }
    public isCrouched(): boolean {
        return this._crouched;
    }
    
    public get reuna_vasemmalla(): boolean {
        return this._reuna_vasemmalla;
    }
    public set reuna_vasemmalla(v: boolean) {
        this._reuna_vasemmalla = v;
    }
    
    public get reuna_oikealla(): boolean {
        return this._reuna_oikealla;
    }
    public set reuna_oikealla(v: boolean) {
        this._reuna_oikealla = v;
    }
    
    /** @deprecated use inWater */
    public get vedessa(): boolean {
        return this.inWater;
    }
    public get inWater(): boolean {
        return this._inWater;
    }
    public set inWater(v: boolean) {
        this._inWater = v;
    }
    
    public get emosprite(): int {
        return this._emosprite;
    }
    public set emosprite(v: int) {
        this._emosprite = v;
    }
    
    /**
     * Escondido, en un espcondite
     */
    public get piilossa(): boolean {
        return this._piilossa;
    }
    public set piilossa(v: boolean) {
        this._piilossa = v;
    }
    
    /** @deprecated Use initialWeight */
    public get alkupaino(): number {
        return this._initialWeight;
    }
    public get initialWeight(): number {
        return this._initialWeight;
    }
    
    /**
     * Sum of the sprite weight and other overlapping sprites to determine if a switch pushes.
     */
    public get kytkinpaino(): number {
        return this._kytkinpaino;
    }
    public set kytkinpaino(v: number) {
        this._kytkinpaino = v;
    }
    
    public get aktiivinen(): boolean {
        return this._aktiivinen;
    }
    public set aktiivinen(v: boolean) {
        this._aktiivinen = v;
    }
    
    /** @deprecated use recivedDamage */
    public get saatu_vahinko(): int {
        return this.receivedDamage;
    }
    public get receivedDamage(): int {
        return this._receivedDamage;
    }
    public set receivedDamage(v: int) {
        this._receivedDamage = v;
    }
    
    /** @deprecated use recivedDamageType */
    public get saatu_vahinko_tyyppi(): EDamageType {
        return this.receivedDamageType;
    }
    public get receivedDamageType(): EDamageType {
        return this._receivedDamageType;
    }
    public set receivedDamageType(v: EDamageType) {
        this._receivedDamageType = v;
    }
    
    public getPackedAttributes(): SpriteFuture {
        return {
            x: this.x,
            y: this.y,
            a: this.a,
            b: this.b,
            
            width: this.proto.width,
            height: this.proto.height,
            
            left: this.left,
            right: this.right,
            top: this.top,
            bottom: this.bottom,
            
            inWater: this.inWater,
            
            maxSpeed: this.proto.maxSpeed,
            
            canGoRight: true,
            canGoLeft: true,
            canGoUp: true,
            canGoDown: true
            
            // let kartta_vasen = 0;
            // let kartta_yla = 0;
        };
    }
    
    public getCollider(ignoreBarriers?: boolean): Block {
        return {
            code: 0,
            
            i: null,
            j: null,
            x: this._x,
            y: this._y,
            
            topIsBarrier: true,
            rightIsBarrier: true,
            bottomIsBarrier: true,
            leftIsBarrier: true,
            
            top: Math.floor(this._y - this.proto.height / 2),
            right: Math.floor(this._x + this.proto.width / 2),
            bottom: Math.floor(this._y + this.proto.height / 2),
            left: Math.floor(this._x - this.proto.width / 2),
            
            // Indicates if it's background tile
            tausta: false,
            edge: this.proto.este,
            water: false
        };
    }
}

export enum EAnimation {
    ANIMAATIO_PAIKALLA,
    ANIMAATIO_KAVELY,
    ANIMAATIO_HYPPY_YLOS,
    ANIMAATIO_HYPPY_ALAS,
    ANIMAATIO_KYYKKY,
    ANIMAATIO_VAHINKO,
    ANIMAATIO_KUOLEMA,
    ANIMAATIO_HYOKKAYS1,
    ANIMAATIO_HYOKKAYS2
}

export enum EDamageType {
    /** No damage. */
    VAHINKO_EI,
    VAHINKO_ISKU,
    VAHINKO_PUDOTUS,
    VAHINKO_MELU,
    VAHINKO_TULI,
    VAHINKO_VESI,
    VAHINKO_LUMI,
    VAHINKO_BONUS,
    /** Electric damage. */
    VAHINKO_SAHKO,
    VAHINKO_ITSARI,
    VAHINKO_PURISTUS,
    VAHINKO_HAJU,
    VAHINKO_KAIKKI,
    VAHINKO_PISTO
}

export enum EDestructionType {
    TUHOUTUMINEN_EI_TUHOUDU,
    TUHOUTUMINEN_HOYHENET,
    TUHOUTUMINEN_TAHDET_HARMAA,
    TUHOUTUMINEN_TAHDET_SININEN,
    TUHOUTUMINEN_TAHDET_PUNAINEN,
    TUHOUTUMINEN_TAHDET_VIHREA,
    TUHOUTUMINEN_TAHDET_ORANSSI,
    TUHOUTUMINEN_TAHDET_VIOLETTI,
    TUHOUTUMINEN_TAHDET_TURKOOSI,
    TUHOUTUMINEN_RAJAHDYS_HARMAA,
    TUHOUTUMINEN_RAJAHDYS_SININEN,
    TUHOUTUMINEN_RAJAHDYS_PUNAINEN,
    TUHOUTUMINEN_RAJAHDYS_VIHREA,
    TUHOUTUMINEN_RAJAHDYS_ORANSSI,
    TUHOUTUMINEN_RAJAHDYS_VIOLETTI,
    TUHOUTUMINEN_RAJAHDYS_TURKOOSI,
    TUHOUTUMINEN_SAVU_HARMAA,
    TUHOUTUMINEN_SAVU_SININEN,
    TUHOUTUMINEN_SAVU_PUNAINEN,
    TUHOUTUMINEN_SAVU_VIHREA,
    TUHOUTUMINEN_SAVU_ORANSSI,
    TUHOUTUMINEN_SAVU_VIOLETTI,
    TUHOUTUMINEN_SAVU_TURKOOSI,
    TUHOUTUMINEN_SAVUPILVET,
    TUHOUTUMINEN_ANIMAATIO = 100
}

export enum EType {
    TYYPPI_EI_MIKAAN,
    TYYPPI_PELIHAHMO,
    TYYPPI_BONUS,
    TYYPPI_AMMUS,
    TYYPPI_TELEPORTTI,
    TYYPPI_TAUSTA
}

class InternalClock {
    static IID = 0;
    private _prev: number = 0;
    private _clock: number = 0;
    private iid = ++InternalClock.IID;
    private printz = 3000;
    
    incr(n: number): void {
        this._prev = this._clock;
        this._clock = this._clock + n;
    }
    
    tics(step: number): boolean {
        const prev = Math.floor(this._prev / step);
        const curr = Math.floor(this._clock / step);
        
        if (curr > prev) {
            //if (this.iid == 1647 && this.printz-- > 0)
            //    console.log('Rana salta en ' + this._clock);
            return true;
        }
    }
}