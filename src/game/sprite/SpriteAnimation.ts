import { PkBinary } from '@ng/types/PkBinary';
import { ANIMAATIO_MAX_SEKVENSSEJA } from '../../support/constants';
import { CVect, BYTE, cvect } from '../../support/types';

/**
 * SDL: PK2SPRITE_ANIMAATIO.
 */
export class SpriteAnimation {
    public sekvenssi: CVect<BYTE> = cvect(ANIMAATIO_MAX_SEKVENSSEJA);	// sequence
    public frameja: BYTE;								// frames
    public looppi: boolean;									// loop
    
    public static fromSerialized(stream: PkBinary) {
        const obj = new SpriteAnimation();
        
        for (let i = 0; i < ANIMAATIO_MAX_SEKVENSSEJA; i++) {
            obj.sekvenssi[i] = stream.streamReadByte();
        }
        obj.frameja = stream.streamReadUint(1);
        obj.looppi = stream.streamReadBool();
        
        return obj;
    }
}