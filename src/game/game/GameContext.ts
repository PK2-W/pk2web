import { Entropy } from '@game/Entropy';
import { Sprite } from '@game/sprite/Sprite';
import { int } from '@game/support/types';
import { PkDevice } from '@ng/core/PkDevice';
import { PKSound } from '@ng/core/PKSound';
import { PkAssetCache } from '@ng/PkAssetCache';
import { PkSound } from '@ng/types/PkSound';
import { uint } from '@sp/types';

/**
 * The game environment is shared with all game related elements.
 */
export interface GameContext {
    
    readonly entropy: Entropy;
    
    readonly cameraX: number;
    readonly cameraY: number;
    
    readonly device: PkDevice;
    
    readonly stuff: PkAssetCache;
    readonly gameStuff: PkAssetCache;
    readonly sound: PKSound;
    
    
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