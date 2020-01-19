import { GameEnv } from '@game/game/GameEnv';
import { TextureCache } from '@game/game/TextureCache';

export class BlockContext {
    private _context: GameEnv;
    
    public constructor(context: GameEnv) {
        this._context = context;
    }
    
    public get textureCache(): TextureCache {
        return this._context.textureCache;
    }
}
