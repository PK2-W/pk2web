import { settings } from 'pixi.js';
import { str, bool, uint, BYTE, int } from './types';

export class PK2Settings {
    private settings: TRawSettings;
    
    public static async loadFromClient(): Promise<PK2Settings> {
        const tmp = new PK2Settings();
        return tmp.loadFromClient();
    }
    
    public constructor() {
        this.initialize();
    }
    
    public initialize(): void {
        // settings={
        // };
    }
    
    private loadFromClient(): PK2Settings {
        
        return this;
    }
    
    // versio: str<4>;
    // ladattu: bool; // if it was started here
    // kieli: str<128>; // language
    //
    // // 	// grafiikka
    // // 	uint ruudun_korkeus; //Not used
    // // 	uint ruudun_leveys; //Not used
    // lapinakyvat_objektit: bool;
    // lapinakyvat_menutekstit: bool;
    // saa_efektit: bool;
    // nayta_tavarat: bool;
    // tausta_spritet: bool;
    //
    // // kontrollit
    // control_left: uint;
    // control_right: uint;
    // control_jump: uint;
    // control_down: uint;
    // control_walk_slow: uint;
    // control_attack1: uint;
    // control_attack2: uint;
    // control_open_gift: uint;
    //
    // // audio
    // musiikki: bool;
    // aanet: bool;
    //
    // //Version 1.1
    // isFullScreen: bool;
    // isFiltered: bool;
    // isFit: bool;
    //
    // isWide: bool;
    //
    // //Version 1.2
    // music_max_volume: BYTE;
    // sfx_max_volume: BYTE;
    
    // private PK_Settings_Start(): void {
    //     // 	settings.ladattu = false;
    //     //
    //     // 	strcpy(settings.kieli,"english.txt");
    //     //
    //     // 	settings.lapinakyvat_objektit = true;
    //     // 	settings.lapinakyvat_menutekstit = false;
    //     // 	settings.saa_efektit = true;
    //     // 	settings.nayta_tavarat = true;
    //     // 	settings.tausta_spritet = true;
    //     //
    //     // 	settings.aanet = true;
    //     // 	settings.musiikki = true;
    //     //
    //     // 	settings.control_left      = PI_LEFT;
    //     // 	settings.control_right     = PI_RIGHT;
    //     // 	settings.control_jump      = PI_UP;
    //     // 	settings.control_down      = PI_DOWN;
    //     // 	settings.control_walk_slow = PI_RALT;
    //     // 	settings.control_attack1   = PI_RCONTROL;
    //     // 	settings.control_attack2   = PI_RSHIFT;
    //     // 	settings.control_open_gift = PI_SPACE;
    //     //
    //     // 	settings.isFiltered = true;
    //     // 	settings.isFit = true;
    //     // 	settings.isFullScreen = true;
    //     // 	settings.isWide = true;
    //     //
    //     // 	settings.music_max_volume = 64;
    //     // 	settings.sfx_max_volume = 90;
    //     //
    //     // 	music_volume = settings.music_max_volume;
    //     // 	music_volume_now = settings.music_max_volume - 1;
    //     //
    //     // 	PisteUtils_CreateDir("data");
    //     // 	PK_Settings_Save("data/settings.ini");
    // }
    //
    // private PK_Settings_Open(): int {
    //     // Juande: filename era 'data/settings.ini'
    //     // 	ifstream *file = new ifstream(filename, ios::binary);
    //     //
    //     // 	if (file->fail()){
    //     // 		delete file;
    //     // 		PK_Settings_Start();
    //     // 		return 1;
    //     // 	}
    //     //
    //     // 	file->read(settings.versio, 4); // Read the version from settings file
    //     //
    //     // 	if (strcmp(settings.versio, "1.2") != 0) { // If settings version isn't 1.2
    //     // 		delete file;
    //     // 		PK_Settings_Start();
    //     // 		return 2;
    //     // 	}
    //     // 	file->read((char*)&settings, sizeof(settings));
    //     // 	delete file;
    //     //
    //     // 	music_volume = settings.music_max_volume;
    //     // 	music_volume_now = settings.music_max_volume - 1;
    //     //
    //     // 	settings.ladattu = true;
    //     // 	screen_width = settings.isWide ? 800 : 640;
    //     //
    //     // 	return 0;
    // }
    //
    // private PK_Settings_Save(/*char *filename*/): int {
    //     // 	ofstream *tiedosto = new ofstream(filename, ios::binary);
    //     // 	tiedosto->write ("1.2", 4);
    //     // 	tiedosto->write ((char *)&settings, sizeof (settings));
    //     //
    //     // 	delete (tiedosto);
    //     // 	return 0;
    // }
    
    public async save(): Promise<PK2Settings> {
        return this;
    }
    
    private saveToLocal() {
    
    }
    
    /// Temporal fields from Jane's code
    
    /** @deprecated */
    public music_max_volume: BYTE;
    
    /** @deprecated */
    public kieli: string = 'english'; // idioma
}

type TRawSettings = {
    version: string;
    loaded: boolean; // if it was started here
    language: string; // language
    
    // video
    transparent_objects: boolean;
    transparent_menutexts: boolean;
    show_effects: boolean;
    show_goods: boolean;
    show_sprites_bg: boolean;
    
    // controls
    control_left: number;
    control_right: number;
    control_jump: number;
    control_down: number;
    control_walk_slow: number;
    control_attack1: number;
    control_attack2: number;
    control_open_gift: number;
    
    // audio
    music: boolean;
    sounds: boolean;
    
    // + version 1.1
    is_fullscreen: boolean;
    is_filtered: boolean;
    is_fit: boolean;
    
    is_wide: boolean;
    
    // + version 1.2
    music_max_volume: number;
    sfx_max_volume: number;
};
