import { PkBinary } from '@fwk/types/PkBinary';
import { ANIMAATIO_MAX_SEKVENSSEJA } from '../../support/constants';
import { CVect, CBYTE, cvect, uint } from '../support/types';

/**
 * Bytesize: 12
 * SRC: PK2SPRITE_ANIMAATIO.
 */
export class SpriteAnimation {
    private _frames: CVect<CBYTE> = cvect(ANIMAATIO_MAX_SEKVENSSEJA);	// sequence
    private _frameCount: CBYTE;								// frames
    private _loop: boolean;									// loop
    
    public static fromSerialized(stream: PkBinary) {
        const obj = new SpriteAnimation();
        
        for (let i = 0; i < ANIMAATIO_MAX_SEKVENSSEJA; i++) {
            obj._frames[i] = stream.streamReadByte();
        }
        obj._frameCount = stream.streamReadUint8();
        obj._loop = stream.streamReadBool();
        
        return obj;
    }
    
    /**
     * ~ Animaatio_Uusi (partial)
     * @param frames
     * @param loop
     */
    public static from(frames: uint[], loop: boolean) {
        const obj = new SpriteAnimation();
        let frame_i = 0;
        
        obj._frameCount = 0;
        
        while (frame_i < ANIMAATIO_MAX_SEKVENSSEJA && frames[frame_i] != 0) {
            obj._frames[frame_i] = frames[frame_i];
            obj._frameCount++;
            frame_i++;
        }
        
        obj._loop = loop;
    }
    
    /** @deprecated */
    public get sekvenssi() {return this._frames; }
    /** @deprecated */
    public get frameja() {return this._frameCount; }
    /** @deprecated */
    public get looppi() {return this._loop; }
}