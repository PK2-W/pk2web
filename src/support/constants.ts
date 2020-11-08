import { uint } from '@sp/types';

export const WEB_CONTAINER = '#pekka';

export const GAME_NAME = 'Pekka Kana 2';
export const PK2_VERSION = 'r3';

export const RESOURCES_PATH = './pk2w/resources/';
export const COMMUNITY_PATH = './pk2w/community/';

export const STUFF_CKEY = 'STUFF_CKEY';
export const SWITCH_SOUND_CKEY = 'SWITCH_SOUND_CKEY';
export const JUMP_SOUND_CKEY = 'JUMP_SOUND_CKEY';
export const SPLASH_SOUND_CKEY = 'SPLASH_SOUND_CKEY';
export const LOCK_OPEN_SOUND_CKEY = 'LOCK_OPEN_SOUND_CKEY';
export const MENU_SOUND_CKEY = 'MENU_SOUND_CKEY';
export const ammuu_SOUND_CKEY = 'ammuu_SOUND_CKEY';
export const kieku_SOUND_CKEY = 'kieku_SOUND_CKEY';
export const LAND_SOUND_CKEY = 'LAND_SOUND_CKEY';
export const pistelaskuri_SOUND_CKEY = 'pistelaskuri_SOUND_CKEY';
/**
 * PK2 assumes that all SFX has this frequency.
 */
export const SOUND_SAMPLERATE: uint = 22050;

export const INTRO_DURATION = 10000;

export const PE_PATH_SIZE = 128;

///  Sprites  ///
export const PK2SPRITE_VIIMEISIN_VERSIO = '1.3';

/** @deprecated use MAX_SPRITES */
export const MAX_SPRITEJA = 800;
export const MAX_SPRITES = 800;
/** @deprecated use MAX_SPRITE_TYPES */
export const MAX_PROTOTYYPPEJA = 100;
export const MAX_SPRITE_TYPES = 100;
export const MAX_BLOCK_MASKS = 150;

export const SPRITE_MAX_FRAMEJA = 50;
export const SPRITE_MAX_ANIMAATIOITA = 20;
export const SPRITE_MAX_AI = 10;
export const ANIMAATIO_MAX_SEKVENSSEJA = 10;
export const MAX_AANIA = 7;
export const VAHINKO_AIKA = 50; //Damage time?

// Game loop of the original game in ticks per second
export const PK2GAMELOOP = 60;

/**
 * Number of off-screen blocks included in the block-culling operation ({@link BlockManager#updateCulling}).<br>
 * A value of 0 is going to trigger the operation with each tick.<br>
 * A big value can cause poor performance and freezes every N ticks.
 */
export const BLOCK_CULLING = 3;

/** Max. number of items in the gifts inventory. */
export const MAX_GIFTS = 4;