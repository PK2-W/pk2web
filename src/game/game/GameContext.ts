import { GameComposition } from '@game/display/GameComposition';
import { Entropy } from '@game/Entropy';
import { Episode } from '@game/episodes/Episode';
import { TextureCache } from '@game/game/TextureCache';
import { UIGame } from '@game/game/ui/UIGame';
import { LevelMap } from '@game/map/LevelMap';
import { ParticleSystem } from '@game/particle/ParticleSystem';
import { PekkaContext } from '@game/PekkaContext';
import { Sprite } from '@game/sprite/Sprite';
import { int, rand } from '@game/support/types';
import { PkDevice } from '@ng/core/PkDevice';
import { PKSound } from '@ng/core/PKSound';
import { PkError } from '@ng/error/PkError';
import { PkAssetCache } from '@ng/PkAssetCache';
import { PkCamera } from '@ng/render/PkCamera';
import { Log } from '@ng/support/log/LoggerImpl';
import { minmax } from '@ng/support/utils';
import { PkSound } from '@ng/types/PkSound';
import { SOUND_SAMPLERATE } from '@sp/constants';
import { uint } from '@sp/types';

/**
 * The game environment is shared with all game related elements.
 */
export abstract class GameContext {
    protected readonly context: PekkaContext;
    
    public readonly map: LevelMap;
    public readonly episode: Episode;
    
    public readonly textureCache: TextureCache;
    public readonly composition: GameComposition;
    public readonly camera: PkCamera;
    protected readonly _particles: ParticleSystem;
    protected _camera: { x: number, y: number };
    protected _sound: PKSound;
    public _vibration: int;
    
    protected _swichTimer1: number;
    protected _swichTimer2: number;
    protected _swichTimer3: number;
    
    protected constructor(context: PekkaContext, episode: Episode, map: LevelMap) {
        this.context = context;
        this.episode = episode;
        this.map = map;
        
        this.composition = new GameComposition();
        this.camera = new PkCamera(this.composition.getDrawable());
        this.particles = new ParticleSystem(this);
        this._camera = { x: 0, y: 0 };
        this._sound = new PKSound();
        
        this._swichTimer1 = 0;
        this._swichTimer2 = 0;
        this._swichTimer3 = 0;
    }
    
    public get entropy(): Entropy {
        return this.context.entropy;
    }
    
    public get cameraX(): number {
        return this._camera.x;
    }
    public get cameraY(): number {
        return this._camera.y;
    }
    
    public get device(): PkDevice { return this.context.device; };
    
    public get stuff(): PkAssetCache {
        return this.context.stuff;
    }
    public get gameStuff(): PkAssetCache {
        return this.context.gameStuff;
    }
    public get sound(): PKSound { return this._sound; }
    
    
    ///  Switches  ////
    
    /** Returns {@link _swichTimer1}. */
    public get switchTimer1() {
        return this._swichTimer1;
    }
    /** @deprecated */ public get kytkin1() { return this.switchTimer1; }
    /** @deprecated */ public get ajastin1() { return this.switchTimer1; }
    
    /** Returns {@link _swichTimer2}. */
    public get switchTimer2() {
        return this._swichTimer2;
    }
    /** @deprecated */ public get kytkin2() { return this.switchTimer2; }
    /** @deprecated */ public get ajastin2() { return this.switchTimer2; }
    
    /** Returns {@link _swichTimer3}. */
    public get switchTimer3() {
        return this._swichTimer3;
    }
    /** @deprecated */ public get kytkin3() { return this.switchTimer3; }
    /** @deprecated */ public get ajastin3() { return this.switchTimer3; }
    
    
    ///  Sound  ///
    
    
    public playSpriteSound(sprite: Sprite, soundIndex: int, intensity): void {
        const sound = sprite.proto.getSound(soundIndex);
        
        if (sound == null) {
            Log.d(new PkError(`The sound to play (${ sprite.proto.name }:${ soundIndex }) was not found.`).stack);
            return;
        }
        
        this.playSound(sound, intensity, Math.floor(sprite.x), Math.floor(sprite.y),
            sprite.proto.soundFreq, sprite.proto.soundRandomFreq);
    }
    
    public playMenuSound(sound: PkSound, intensity): void {
        if (sound == null) {
            Log.w(new Error(`The sound to play was not found.`));
            return;
        }
        
        sound.play();
    }
    
    public playSound(sound: PkSound, intensity: uint, x: number, y: number, freq: number = SOUND_SAMPLERATE, randomFreq: boolean = false): void {
        if (sound == null) {
            Log.w(new Error(`The sound to play was not found.`));
            return;
        }
        
        const w2 = this.context.device.screenWidth / 2;
        
        let volume = Math.abs(x - (this.cameraX + w2)); // x from middle of the screen
        volume = 1 - (volume / (w2 * 2)); // normalized value [0..1] with a total pan of 2*screenWidth
        volume = minmax(volume, 0.15, 1); // minmax
        
        let pan = x - (this.cameraX + w2); // x from middle of the screen
        pan = pan / (w2 * 3); // normalized value [-1..1] with a total pan of 1.5*screenWidth
        pan = minmax(pan, -0.75, 0.75); // minmax
        
        if (randomFreq) {
            freq = freq + rand() % 4000 - rand() % 2000;
        }
        
        sound.play(volume, pan, freq / 22050);
        
        Log.d(`[Game] Playing sound with { volume: ${ volume.toFixed(2) }, pan: ${ pan.toFixed(2) }, frequency: ${ (freq / 22050).toFixed(2) } }.`);
    }
}