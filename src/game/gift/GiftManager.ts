import { GameContext } from '@game/game/GameContext';

export class GiftManager {
    private _ctx: GameContext;
    
    public constructor(ctx: GameContext) {
        this._ctx = ctx;
    }
}
