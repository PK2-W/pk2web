import { PkFilesystem } from '@fwk/filesystem/PkFilesystem';
import { Bitmap3Palette } from '@fwk/types/bitmap/Bitmap3Palette';
import { GameComposition } from '@game/display/GameComposition';
import { Entropy } from '@game/Entropy';
import { Episode } from '@game/episodes/Episode';
import { TextureCache } from '@game/game/TextureCache';
import { UIGame } from '@game/game/ui/UIGame';
import { LevelMap } from '@game/map/LevelMap';
import { ParticleSystem } from '@game/particle/ParticleSystem';
import { PekkaContext } from '@game/PekkaContext';
import { Sprite } from '@game/sprite/Sprite';
import { PkDevice } from '@fwk/core/PkDevice';
import { PKSound } from '@fwk/core/PKSound';
import { PkError } from '@fwk/error/PkError';
import { PkAssetCache } from '@fwk/PkAssetCache';
import { PkCamera } from '@fwk/render/PkCamera';
import { int, uint } from '@fwk/shared/bx-ctypes';
import { Log } from '@fwk/support/log/LoggerImpl';
import { minmax, rand } from '@fwk/support/utils';
import { PkSound } from '@fwk/types/PkSound';
import { SOUND_SAMPLERATE } from '@sp/constants';

/**
 * The game environment is shared with all game related elements.
 */
export interface GameContext {
    
    readonly entropy: Entropy;
    
    readonly camera: PkCamera;
    
    readonly device: PkDevice;
    
    readonly palette: Bitmap3Palette;
    
    readonly stuff: PkAssetCache;
    readonly gameStuff: PkAssetCache;
    readonly sound: PKSound;
    
    readonly fs: PkFilesystem;
    
    readonly map: LevelMap;
    
    ///  Switches  ////
    
    /** Returns {@link _swichTimer1}. */
    readonly switchTimer1: uint;
    /** @deprecated */  readonly kytkin1: uint;
    /** @deprecated */  readonly ajastin1: uint;
    
    /** Returns {@link _swichTimer2}. */
    readonly switchTimer2: uint;
    /** @deprecated */  readonly kytkin2: uint;
    /** @deprecated */  readonly ajastin2: uint;
    
    /** Returns {@link _swichTimer3}. */
    readonly switchTimer3: uint;
    /** @deprecated */  readonly kytkin3: uint;
    /** @deprecated */  readonly ajastin3: uint;
    
    shakeCamera(ticks: uint): this;
    
    
    ///  Sound  ///
    
    playSpriteSound(sprite: Sprite, soundIndex: int, intensity): void;
    playMenuSound(sound: PkSound, intensity): void;
    playSound(sound: PkSound, intensity: uint, x: number, y: number, freq: number, randomFreq: boolean): void;
}