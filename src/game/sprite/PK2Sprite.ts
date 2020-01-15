import { PK2SpritePrototype } from '@game/sprite/PK2SpritePrototype';
import { EAi } from '@game/sprite/SpriteManager';
import { Drawable } from '@ng/drawable/Drawable';
import { SPRITE_MAX_AI } from '../../support/constants';
import { int, BYTE, bool } from '../../support/types';

export class PK2Sprite extends Drawable {
    private _aktiivinen: boolean;			// true / false
    private _pelaaja: int;			// 0 = ei pelaaja, 1 = pelaaja
    private _tyyppi: PK2SpritePrototype;	// osoitin spriten prototyyppiin
    private _piilota: boolean;			// true = ei toiminnassa, false = toiminnassa
    private _alku_x: number;				// spriten alkuper�inen x sijainti
    private _alku_y: number;				// spriten alkuper�inen y sijainti
    private _x: number;					// x-kordinaatti pelikent�ll�
    private _y: number;					// y-kordinaatti pelikent�ll�
    private _a: number;					// horizontal speed
    private _b: number;					// vertical speed
    private _flip_x: boolean;				// true = peilikuva sivusuunnassa
    private _flip_y: boolean;				// true = peilikuva pystysuunnassa
    private _hyppy_ajastin: int;		// hypyn kesto: 0 = ei hypyss�, > 0 = hypyss�, < 0 = tullut alas
    private _ylos: boolean;				// voiko sprite juuri nyt liikkua yl�s
    private _alas: boolean;				// voiko sprite juuri nyt liikkua ....
    private _oikealle: boolean;			// voiko sprite juuri nyt liikkua ....
    private _vasemmalle: boolean;			// voiko sprite juuri nyt liikkua ....
    private _reuna_vasemmalla: boolean;	// onko spriten vasemmalla puolella kuoppa?
    private _reuna_oikealla: boolean;		// onko spriten vasemmalla puolella kuoppa?
    private _energia: int;			// monta osumaa sprite viel� kest��
    private _emosprite: int;			// jos spriten on luonut jokin toinen sprite
    private _paino: number;				// spriten oma yksil�llinen paino
    private _kytkinpaino: number;		// spriten paino + muiden spritejen panot, joihin kosketaan
    /** Crouched. */
    private _kyykky: boolean;				// onko sprite kyykyss�
    private _isku: int;				// onko sprite saanut vahinkoa
    private _lataus: int;				// jos on ammuttu, odotetaan
    private _hyokkays1: int;			// ajastin joka laskee hy�kk�ys 1:n j�lkeen
    private _hyokkays2: int;			// ajastin joka laskee hy�kk�ys 2:n j�lkeen
    private _vedessa: boolean;			// onko sprite vedess�
    private _piilossa: boolean;			// onko sprite piilossa
    private _alkupaino: number;			// spriten alkuper�inen paino - sama kuin prototyypin
    private _saatu_vahinko: int;		// v�hennet��n energiasta jos erisuuri kuin 0
    private _saatu_vahinko_tyyppi: BYTE; // saadun vahingon tyyppi (esim. lumi).
    private _vihollinen: boolean;			// prototyypist� saatu tieto, onko vihollinen
    private _ammus1: int;				// spriten k�ytt�m�n ammus-prototyypin indeksi
    private _ammus2: int;				//
    
    private _pelaaja_x: int;			// tieto siit�, miss� pelaaja on n�hty viimeksi
    private _pelaaja_y: int;
    
    private _ajastin: int;			// ajastin jonka arvo py�rii v�lill� 1 - 32000
    
    private _animaatio_index: BYTE;	// t�m�nhetkinen py�riv� animaatio
    private _sekvenssi_index: BYTE;	// t�m�nhetkisen animaation frame
    private _frame_aika: BYTE;			// kuinka kauan frame on n�kynyt
    private _muutos_ajastin: int;		// sprite muuttuu muutosspriteksi kun t�m� nollautuu
    
    public constructor() ;
    /**
     *
     * @param proto
     * @param isPlayer
     * @param discarded - Originally "piilota".
     * @param x
     * @param y
     */
    public constructor(proto: PK2SpritePrototype, isPlayer: boolean, discarded: boolean, x: number, y: number);
    public constructor(proto?: PK2SpritePrototype, isPlayer?: boolean, discarded?: boolean, x?: number, y?: number) {
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
        this._hyppy_ajastin = 0;
        this._kyykky = false;
        this._energia = 0;
        this._alkupaino = 0;
        this._paino = 0;
        this._kytkinpaino = 0;
        this._flip_x = false;
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
        this._isku = 0;
        this._lataus = 0;
        this._hyokkays1 = 0;
        this._hyokkays2 = 0;
        this._vedessa = false;
        this._piilossa = false;
        this._saatu_vahinko = 0;
        this._vihollinen = false;
        this._ammus1 = -1;
        this._ammus2 = -1;
        this._pelaaja_x = -1;
        this._pelaaja_y = -1;
        this._ajastin = 0;
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
    public reuseWith(proto: PK2SpritePrototype, isPlayer: boolean, discarded: boolean, x: number, y: number) {
        this.reuse();
        
        if (proto != null) {
            this._tyyppi = proto;
            this._pelaaja = isPlayer ? 1 : 0;  // TODO Convert to boolean
            this._piilota = discarded;
            this._x = x;
            this._y = y;
            this._alku_x = x;
            this._alku_y = y;
            this._energia = proto.energy;
            this._alkupaino = proto.weight;
            this._paino = this._alkupaino;
            this._vihollinen = proto.isEnemy();
            this._ammus1 = proto.ammus1;
            this._ammus2 = proto.ammus2;
        }
    }
    
    //     int Piirra(int kamera_x, int kamera_y);		// Animoi ja piirt�� spriten
    //     int Animaatio(int anim_i, bool nollaus);	// Vaihtaa spriten animaation
    //     int Animoi();								// Animoi muttei piirr� sprite�
    
    /** @deprecated use {@link PK2SpritePrototype.Onko_AI} */
    public Onko_AI(AI: EAi) {
        throw new Error('DEPRECATED');
    }
    
    //     //AI_Functions
    //     int AI_Kana();
    //     int AI_Bonus();
    //     int AI_Muna();
    //     int AI_Ammus();
    //     int AI_Hyppija();
    //     int AI_Sammakko1();
    //     int AI_Sammakko2();
    
    public AI_Perus(): int {
        if (this._x < 10) {
            this._x = 10;
            this._vasemmalle = false;
        }
        
        if (this._x > 8192) {
            this._x = 8192;
            this._oikealle = false;
        }
        
        if (this._y > 9920)
            this._y = 9920;
        
        if (this._y < -32)
            this._y = -32;
        
        if (this._a < 0)
            this._flip_x = true;
        
        if (this._a > 0)
            this._flip_x = false;
        
        this._ajastin++;
        
        if (this._ajastin > 31320) // jaollinen 360:lla
            this._ajastin = 0;
        
        return 0;
    }
    
    //     int AI_Kaantyy_Esteesta_Hori();
    //     int AI_Kaantyy_Esteesta_Vert();
    //     int AI_Varoo_Kuoppaa();
    //     int AI_Random_Kaantyminen();
    //     int AI_Random_Suunnanvaihto_Hori();
    //     int AI_Random_Hyppy();
    //     int AI_Random_Liikahdus_Vert_Hori();
    //     int AI_Seuraa_Pelaajaa(PK2Sprite &pelaaja);
    //     int AI_Seuraa_Pelaajaa_Jos_Nakee(PK2Sprite &pelaaja);
    //     int AI_Seuraa_Pelaajaa_Jos_Nakee_Vert_Hori(PK2Sprite &pelaaja);
    //     int AI_Seuraa_Pelaajaa_Vert_Hori(PK2Sprite &pelaaja);
    //     int AI_Jahtaa_Pelaajaa(PK2Sprite &pelaaja);
    //     int AI_Pakenee_Pelaajaa_Jos_Nakee(PK2Sprite &pelaaja);
    //     int AI_Muutos_Jos_Energiaa_Alle_2(PK2Sprite_Prototyyppi &muutos);
    //     int AI_Muutos_Jos_Energiaa_Yli_1(PK2Sprite_Prototyyppi &muutos);
    //     int AI_Muutos_Ajastin(PK2Sprite_Prototyyppi &muutos);
    //     int AI_Muutos_Jos_Osuttu(PK2Sprite_Prototyyppi &muutos);
    //     int AI_Hyokkays_1_Jos_Osuttu();
    //     int AI_Hyokkays_2_Jos_Osuttu();
    //     int AI_Hyokkays_1_Nonstop();
    //     int AI_Hyokkays_2_Nonstop();
    //     int AI_Hyokkays_1_Jos_Pelaaja_Edessa(PK2Sprite &pelaaja);
    //     int AI_Hyokkays_2_Jos_Pelaaja_Edessa(PK2Sprite &pelaaja);
    //     int AI_Hyokkays_1_Jos_Pelaaja_Alapuolella(PK2Sprite &pelaaja);
    //     int AI_NonStop();
    //     int AI_Hyppy_Jos_Pelaaja_Ylapuolella(PK2Sprite &pelaaja);
    //     int AI_Pommi();
    //     int AI_Vahingoittuu_Vedesta();
    //     int AI_Tapa_Kaikki();
    //     int AI_Kitka_Vaikuttaa();
    //     int AI_Piiloutuu();
    //     int AI_Palaa_Alkuun_X();
    //     int AI_Palaa_Alkuun_Y();
    //     int AI_Kaantyy_Jos_Osuttu();
    //     int AI_Tippuu_Tarinasta(int tarina);
    
    public AI_Liikkuu_X(liike: number): int {
        if (this._energia > 0)
            this._x = this._alku_x + liike;
        
        return 0;
    }
    
    public AI_Liikkuu_Y(liike: number): int {
        if (this._energia > 0)
            this._y = this._alku_y + liike;
        
        return 0;
    }
    
    //     int AI_Tippuu_Jos_Kytkin_Painettu(int kytkin);
    //     int AI_Liikkuu_Jos_Kytkin_Painettu(int kytkin, int ak, int bk);
    //     int AI_Teleportti(int i, PK2Sprite *spritet, int max, PK2Sprite &pelaaja);
    //     int AI_Kiipeilija();
    //     int AI_Kiipeilija2();
    //     bool AI_Info(PK2Sprite &pelaaja);
    //     int AI_Tuhoutuu_Jos_Emo_Tuhoutuu(PK2Sprite *spritet);
    //
    //     int Animaatio_Perus();
    //     int Animaatio_Kana();
    //     int Animaatio_Bonus();
    //     int Animaatio_Muna();
    //     int Animaatio_Ammus();
    
    
    ///  Accessors  ///
    
    public get proto() { return this._tyyppi; }
    
    public get x(): number {
        return this._x;
    }
    public set x(v: number) {
        this._x = v;
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
    
    public get up(): boolean {
        return this._ylos;
    }
    public set up(v: boolean) {
        this._ylos = v;
    }
    
    public get down(): boolean {
        return this._alas;
    }
    public set down(v: boolean) {
        this._alas = v;
    }
    
    public get left(): boolean {
        return this._vasemmalle;
    }
    public set left(v: boolean) {
        this._vasemmalle = v;
    }
    
    public get right(): boolean {
        return this._oikealle;
    }
    public set right(v: boolean) {
        this._oikealle = v;
    }
    
    public get energia(): int {
        return this._energia;
    }
    public set energia(v: int) {
        this._energia = v;
    }
    
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
    
    public get pelaaja(): int {
        return this._pelaaja;
    }
    
    /** @deprecated use remainingAttack1 */
    public get hyokkays1(): int {
        return this.remainingAttack1;
    }
    public get remainingAttack1(): int {
        return this._hyokkays1;
    }
    public set remainingAttack1(v: int) {
        this._hyokkays1 = v;
    }
    
    /** @deprecated use remainingAttack2 */
    public get hyokkays2(): int {
        return this.remainingAttack2;
    }
    public get remainingAttack2(): int {
        return this._hyokkays2;
    }
    public set remainingAttack2(v: int) {
        this._hyokkays2 = v;
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
    public get jumpTimer(): int {
        return this._hyppy_ajastin;
    }
    public set jumpTimer(v: int) {
        this._hyppy_ajastin = v;
    }
    
    /** @deprecated use knockTimer */
    public get isku(): int {
        return this.knockTimer;
    }
    public get knockTimer(): int {
        return this._isku;
    }
    public set knockTimer(v: int) {
        this._isku = v;
    }
    
    public get muutos_ajastin(): int {
        return this._muutos_ajastin;
    }
    public set muutos_ajastin(v: int) {
        this._muutos_ajastin = v;
    }
    
    /** @deprecated use weight */
    public get paino(): number {
        return this.weight;
    }
    public get weight(): number {
        return this._paino;
    }
    public set weight(v: number) {
        this._paino = v;
    }
    
    /** Crouched. */
    public get kyykky(): boolean {
        return this._kyykky;
    }
    public set kyykky(v: boolean) {
        this._kyykky = v;
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
        return this._vedessa;
    }
    public set inWater(v: boolean) {
        this._vedessa = v;
    }
    
    public get emosprite(): int {
        return this._emosprite;
    }
    public set emosprite(v: int) {
        this._emosprite = v;
    }
    
    public get piilossa(): boolean {
        return this._piilossa;
    }
    public set piilossa(v: boolean) {
        this._piilossa = v;
    }
    
    public get alkupaino(): number {
        return this._alkupaino;
    }
    
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
    
    /** @deprecated use recivedDamageType */
    public get saatu_vahinko_tyyppi(): TODO {
        return this.recivedDamageType;
    }
    public get recivedDamageType(): TODO {
        return this._saatu_vahinko_tyyppi;
    }
    public set recivedDamageType(v: TODO) {
        this._saatu_vahinko_tyyppi = v;
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
    VAHINKO_EI,
    VAHINKO_ISKU,
    VAHINKO_PUDOTUS,
    VAHINKO_MELU,
    VAHINKO_TULI,
    VAHINKO_VESI,
    VAHINKO_LUMI,
    VAHINKO_BONUS,
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
