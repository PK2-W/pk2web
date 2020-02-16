import { Entropy } from '@game/Entropy';
import { GameComposition } from '@game/game/GameComposition';
import { TextureCache } from '@game/game/TextureCache';
import { PK2Map } from '@game/map/PK2Map';
import { PK2Context } from '@game/PK2Context';
import { int } from '../../support/types';

/**
 * The game environment is shared with all game related elements.
 */
export class GameEnv {
    private readonly _context: PK2Context;
    private readonly _map: PK2Map;
    
    private readonly _textureCache: TextureCache;
    private readonly _composition: GameComposition;
    
    public constructor(context: PK2Context, map: PK2Map) {
        this._context = context;
        this._map = map;
        
        this._textureCache = new TextureCache();
        this._composition = this._composition = new GameComposition();
    }
    
    public get context(): PK2Context {
        return this._context;
    }
    
    public get entropy(): Entropy {
        return this.context.entropy;
    }
    
    public get composition(): GameComposition {
        return this._composition;
    }
    
    /** @deprecated tengo que buscar algo mejor */
    public get screenWidth(): int {
        return 640;
    }
    /** @deprecated tengo que buscar algo mejor */
    public get screenHeight(): int {
        return 480;
    }
    
    public get map(): PK2Map {
        return this._map;
    }
    
    public get textureCache(): TextureCache {
        return this._textureCache;
    }
}
