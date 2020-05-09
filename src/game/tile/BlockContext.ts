import { GameContext } from '@game/game/GameContext';
import { TextureCache } from '@game/game/TextureCache';

export class BlockContext {
    private _context: GameContext;
    
    public constructor(context: GameContext) {
        this._context = context;
    }
    
    public get textureCache(): TextureCache {
        return this._context.textureCache;
    }
}
