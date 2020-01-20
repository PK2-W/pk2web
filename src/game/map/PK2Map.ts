import { PK2Context } from '@game/PK2Context';
import { TSpriteProtoCode } from '@game/sprite/SpritePrototype';
import { TBlockProtoCode } from '@game/tile/BlockPrototype';
import { Binary } from '@ng/support/Binary';
import { str2num, pathJoin } from '@ng/support/utils';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';
import { str, int, BYTE, uint, CVect, cvect, bool, DWORD, rand } from '../../support/types';

export abstract class PK2MapInfo {

}

export class PK2Map extends PK2MapInfo {
    private _context: PK2Context;
    private _fpath: string;
    private _fname: string;
    private _raw: Binary;
    
    /** Map version. */
    private _version: str<5>;
    /** Path of block palette .bmp. */
    private _palikka_bmp: str<13>;
    /** Path of map backgroud .bmp. */
    private _taustakuva: str<13>;
    /** Path of map music. */
    private _musiikki: str<13>;
    
    /** Map name. */
    private _nimi: str<40>;
    private _tekija: str<40>;			// map author
    
    public _jakso: int;				// level of the episode
    public _ilma: int;				// map climate
    public _aika: int;				// map time
    public _extra: BYTE;				// extra config - not used
    public _tausta: BYTE;				// bg movemant type
    public _kytkin1_aika: uint;		// button 1 time - not used
    public _kytkin2_aika: uint;		// button 2 time - not used
    public _kytkin3_aika: uint;		// button 3 time - not used
    public _pelaaja_sprite: int;		// player prototype   // TODO: must be uint??
    
    /** Mapping of background tiles (256*224) */
    public _taustat: CVect<BYTE> = cvect(PK2KARTTA_KARTTA_KOKO);
    /** Mapping of foreground tiles (256*224) */
    public _seinat: CVect<BYTE> = cvect(PK2KARTTA_KARTTA_KOKO);
    /** Mapping of sprites (256*224) */
    public _spritet: CVect<BYTE> = cvect(PK2KARTTA_KARTTA_KOKO);
    /** List of available sprite prototypes by their file names (*.spr). */
    public _protot: CVect<str<13>> = cvect(PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA);
    public _reunat: bool[] = new Array(PK2KARTTA_KARTTA_KOKO); // map edges - calculated during game
    
    public _palikat_buffer: int;		// index of block palette
    public _taustakuva_buffer: int;	// index of bg image
    public _palikat_vesi_buffer: int; // index of water palette
    
    public _x: int;					// map icon pos
    public _y: int;
    public _icon: int;					// map icon id
    
    ///
    
    /**
     * Creates a new instance and loads basic data from the map file located in the specified URI.<br>
     * Source: <code>constructor</code> + <code>PK2Kartta::Latta</code>.
     *
     * @param ctx
     * @param fname - Resource URI (from source "polku + nimi").
     */
    public static loadFromFile(ctx: PK2Context, fpath: string, fname: string): Promise<PK2Map> {
        return new PK2Map(ctx).loadFromFile(fpath, fname);
    }
    
    ///
    
    private constructor(ctx: PK2Context) {
        super();
        
        this._context = ctx;
    }
    
    /**
     * Loads basic data from the map file located in the specified URI.<br>
     * Source: <code>PK2Kartta::Latta</code>
     *
     * @param uri - Resource URI (from source "polku + nimi").
     */
    private async loadFromFile(fpath: string, fname: string): Promise<this> {
        this._fpath = fpath;
        this._fname = fname;
        
        const uri = pathJoin(fpath, fname);
        this._raw = await PkAssetTk.getBinary(uri);
        
        this._loadInfo();
        
        return this;
    }
    
    ///
    
    private _loadInfo(): void {
        this._raw.streamRewind();
        
        this._version = this._raw.streamReadCStr(5);
        console.log(this._version);
        
        switch (this._version) {
        case '1.3':
            this._loadInfo13();
            break;
        case '1.2':
            this._loadInfo12();
            break;
        case '1.1':
            this._loadInfo11();
            break;
        case '1.0':
            this._loadInfo10();
            break;
        case '0.1':
            this._loadInfo01();
            break;
        }
    }
    
    private _loadInfo13() {
        console.log('load map 13');
        
        // Fill structures with "empty"
        this._taustat.fill(255);
        this._seinat.fill(255);
        this._spritet.fill(255);
        for (let i = 0; i < PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA; i++)
            this._protot[i] = '';
        
        this._palikka_bmp = this._raw.streamReadCStr(13);
        this._taustakuva = this._raw.streamReadCStr(13);
        this._musiikki = this._raw.streamReadCStr(13);
        this._nimi = this._raw.streamReadCStr(40);
        this._tekija = this._raw.streamReadCStr(40);
        
        this._jakso = str2num(this._raw.streamRead8CStr(8));
        this._ilma = str2num(this._raw.streamRead8CStr(8));
        this._kytkin1_aika = str2num(this._raw.streamRead8CStr(8));
        this._kytkin2_aika = str2num(this._raw.streamRead8CStr(8));
        this._kytkin3_aika = str2num(this._raw.streamRead8CStr(8));
        this._aika = str2num(this._raw.streamRead8CStr(8));
        this._extra = str2num(this._raw.streamRead8CStr(8));
        this._tausta = str2num(this._raw.streamRead8CStr(8));
        this._pelaaja_sprite = str2num(this._raw.streamRead8CStr(8));
        this._x = str2num(this._raw.streamRead8CStr(8));
        this._y = str2num(this._raw.streamRead8CStr(8));
        this._icon = str2num(this._raw.streamRead8CStr(8));
        
        let lkm: DWORD = str2num(this._raw.streamRead8CStr(8));
        
        // Source commented:
        // for (i=0;i<PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA;i++)
        //	   itoa(lkm,protot[i],10);//strcpy(protot[i],"");
        
        for (let i = 0; i < lkm; i++) {
            // TODO  limit size
            this._protot[i] = this._raw.streamRead8CStr(13);
        }
        
        let leveys: DWORD, korkeus: DWORD, aloitus_x: DWORD, aloitus_y: DWORD, x: DWORD, y: DWORD;
        let tile: BYTE;
        
        // taustat (backgrounds)
        aloitus_x = str2num(this._raw.streamRead8CStr(8));
        aloitus_y = str2num(this._raw.streamRead8CStr(8));
        leveys = str2num(this._raw.streamRead8CStr(8));
        korkeus = str2num(this._raw.streamRead8CStr(8));
        for (let y = aloitus_y; y <= aloitus_y + korkeus; y++) {	// Luetaan alue tile by tile
            for (let x = aloitus_x; x <= aloitus_x + leveys; x++) {
                tile = this._raw.streamRead8Byte();
                this._taustat[x + y * PK2KARTTA_KARTTA_LEVEYS] = tile;
            }
        }
        
        // seinat (walls)
        aloitus_x = str2num(this._raw.streamRead8CStr(8));
        aloitus_y = str2num(this._raw.streamRead8CStr(8));
        leveys = str2num(this._raw.streamRead8CStr(8));
        korkeus = str2num(this._raw.streamRead8CStr(8));
        for (let y = aloitus_y; y <= aloitus_y + korkeus; y++) {	// Luetaan alue tile by tile
            for (let x = aloitus_x; x <= aloitus_x + leveys; x++) {
                tile = this._raw.streamRead8CStr(1);
                this._seinat[x + y * PK2KARTTA_KARTTA_LEVEYS] = tile;
            }
        }
        
        // spritet (sprites)
        aloitus_x = str2num(this._raw.streamRead8CStr(8));
        aloitus_y = str2num(this._raw.streamRead8CStr(8));
        leveys = str2num(this._raw.streamRead8CStr(8));
        korkeus = str2num(this._raw.streamRead8CStr(8));
        for (let y = aloitus_y; y <= aloitus_y + korkeus; y++) {	// Luetaan alue tile by tile
            for (let x = aloitus_x; x <= aloitus_x + leveys; x++) {
                tile = this._raw.streamRead8CStr(1);
                this._spritet[x + y * PK2KARTTA_KARTTA_LEVEYS] = tile.charCodeAt(0);
            }
        }
        
        // TODO: Moved to game/block manager
        //Lataa_PalikkaPaletti(this->palikka_bmp);
        // TODO: Moved to game
        //Lataa_Taustakuva(this->taustakuva);
        
        console.log(this);
    }
    
    //     int PK2Kartta::Lataa_PalikkaPaletti(char *polku, char *filename){
    //     int i;
    //     int img;
    //     char file[PE_PATH_SIZE];
    //     strcpy(file,"");
    //     strcpy(file,polku);
    //     strcat(file,filename);
    //
    //     if (!PisteUtils_Find(file)){
    //     //strcpy(file,PK2Kartta::pk2_hakemisto);
    //     strcpy(file,"gfx/tiles/");
    //     strcat(file,filename);
    //     if (!PisteUtils_Find(file))
    //     return 1;
    // }
    //
    // img = PisteDraw2_Image_Load(file,false);
    // if(img == -1) return 2;
    // PisteDraw2_Image_Copy(img,this->palikat_buffer);
    // PisteDraw2_Image_Delete(img);
    //
    // PisteDraw2_Image_Delete(this->palikat_vesi_buffer); //Delete last water buffer
    // this->palikat_vesi_buffer = PisteDraw2_Image_Cut(this->palikat_buffer,0,416,320,32);
    //
    // strcpy(this->palikka_bmp,filename);
    // return 0;
    // }
    
    private _loadInfo12() {
        console.log('load map 12');
    }
    
    private _loadInfo11() {
        console.log('load map 11');
    }
    
    private _loadInfo10() {
        console.log('load map 10');
    }
    
    private _loadInfo01() {
        console.log('load map 01');
    }
    
    
    private load(): Promise<void> {
    
    }
    
    public getStartPosition() {
        let posX: number = 320;
        let posY: number = 196;
        let alkujen_maara: int = 0;
        let alku: int = 0;
        
        for (let x = 0; x < PK2KARTTA_KARTTA_KOKO; x++)
            if (this._seinat[x] === BLOCK_ALOITUS)
                alkujen_maara++;
        
        if (alkujen_maara > 0) {
            alku = rand() % alkujen_maara + 1;
            alkujen_maara = 1;
            
            for (let x = 0; x < PK2KARTTA_KARTTA_LEVEYS; x++) {
                for (let y = 0; y < PK2KARTTA_KARTTA_KORKEUS; y++) {
                    if (this._seinat[x + y * PK2KARTTA_KARTTA_LEVEYS] === BLOCK_ALOITUS) {
                        if (alkujen_maara === alku) {
                            posX = x * 32;
                            posY = y * 32;
                        }
                        
                        alkujen_maara++;
                    }
                }
            }
        }
        
        return { x: posX, y: posY };
    }
    
    
    ///  Accessors  ///
    
    public get fpath(): string {
        return this._fpath;
    }
    
    public get fname(): string {
        return this._fname;
    }
    
    public get version(): string {
        return this._version;
    }
    
    
    ///  Advanced accessors  ///
    
    public getBgBlockCode(i: number, j: number): TBlockProtoCode {
        const idx = i /*+ kartta_x*/ + (j /*+ kartta_y*/) * PK2KARTTA_KARTTA_LEVEYS;
        return this._taustat[idx];
    }
    
    public getProto(i: int): str<13> {
        return this._protot[i];
    }
    
    public getPlayerSprite(): uint {
        return this._pelaaja_sprite;
    }
    
    /**
     * Returns the prototype code of the sprite placed in the specified position.<br>
     * If there is no sprite, null is returned.
     *
     * @param x
     * @param y
     */
    public getSpriteCode(x: int, y: int): TSpriteProtoCode {
        const code = this._spritet[x + y * PK2KARTTA_KARTTA_LEVEYS];
        return (code !== 255) ? code : null;
    }
    
    public getBlockTexturesLocation(): string {
        return this._palikka_bmp;
    }
}

export const PK2KARTTA_VIIMEISIN_VERSIO: str<4> = '1.3';

export const PK2KARTTA_KARTTA_LEVEYS: uint = 256;
export const PK2KARTTA_KARTTA_KORKEUS: uint = 224;
export const PK2KARTTA_KARTTA_KOKO: uint = PK2KARTTA_KARTTA_LEVEYS * PK2KARTTA_KARTTA_KORKEUS;
export const PK2KARTTA_BLOCK_PALETTI_LEVEYS: uint = 320;
export const PK2KARTTA_BLOCK_PALETTI_KORKEUS: uint = 480;
export const PK2KARTTA_TAUSTAKUVA_EI: BYTE = 0;
export const PK2KARTTA_EXTRA_EI: BYTE = 0;

export const PK2KARTTA_KARTTA_MAX_PROTOTYYPPEJA: uint = 100;

export const BLOCK_ESTO_ALAS: BYTE = 40;
export const BLOCK_HISSI_HORI: BYTE = 41;
export const BLOCK_HISSI_VERT: BYTE = 42;
export const BLOCK_KYTKIN2_YLOS: BYTE = 43;
export const BLOCK_KYTKIN2_ALAS: BYTE = 45;
export const BLOCK_KYTKIN3_OIKEALLE: BYTE = 44;
export const BLOCK_KYTKIN3_VASEMMALLE: BYTE = 46;
export const BLOCK_LUKKO: BYTE = 47;
export const BLOCK_KALLOSEINA: BYTE = 48;
export const BLOCK_KALLOTAUSTA: BYTE = 49;
export const BLOCK_ANIM1: BYTE = 60;
export const BLOCK_ANIM2: BYTE = 65;
export const BLOCK_ANIM3: BYTE = 70;
export const BLOCK_ANIM4: BYTE = 75;
export const BLOCK_VIRTA_VASEMMALLE: BYTE = 140;
export const BLOCK_VIRTA_OIKEALLE: BYTE = 141;
export const BLOCK_VIRTA_YLOS: BYTE = 142;
export const BLOCK_PIILO: BYTE = 143;
export const BLOCK_TULI: BYTE = 144;
export const BLOCK_KYTKIN1: BYTE = 145;
export const BLOCK_KYTKIN2: BYTE = 146;
export const BLOCK_KYTKIN3: BYTE = 147;
export const BLOCK_ALOITUS: BYTE = 148;
export const BLOCK_LOPETUS: BYTE = 149;

export const KYTKIN_ALOITUSARVO: int = 2000;

export const ILMA_NORMAALI: BYTE = 0;
export const ILMA_SADE: BYTE = 1;
export const ILMA_METSA: BYTE = 2;
export const ILMA_SADEMETSA: BYTE = 3;
export const ILMA_LUMISADE: BYTE = 4;

export const TAUSTA_STAATTINEN: BYTE = 0;
export const TAUSTA_PALLARX_VERT: BYTE = 1;
export const TAUSTA_PALLARX_HORI: BYTE = 2;
export const TAUSTA_PALLARX_VERT_JA_HORI: BYTE = 3;
