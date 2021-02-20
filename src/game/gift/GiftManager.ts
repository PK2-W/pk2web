import { GameContext } from '@game/game/GameContext';
import { SpritePrototype } from '@game/sprite/SpritePrototype';
import { Log } from '@fwk/support/log/LoggerImpl';
import { MAX_GIFTS } from '../../support/constants';
import { int } from '../support/types';

export class GiftManager {
    private _context: GameContext;
    private _giftList: SpritePrototype[];
    
    public constructor(context: GameContext) {
        this._context = context;
        this._giftList = [];
    }
    
    public add(giftProto: SpritePrototype): boolean {
        // If inventory is full, return false
        if (this._giftList.length == MAX_GIFTS) {
            Log.d('[Gift] Can\'t add gift, inventory is full.');
            return false;
        }
        
        this._giftList.push(giftProto);
        
        Log.d('[Gift] Gift added to inventory: ', giftProto.name, '.');
        
        // TODO: PK_Start_Info(ilmo);
    }
    
    public get count(): int {
        return this._giftList.length;
    }
    
    get(i: int = 0): SpritePrototype {
        return this._giftList[i];
    }
    
    take(): SpritePrototype {
        if (this._giftList.length == 0)
            return null;
        
        return this._giftList.shift();
    }
    
    /** @deprecated */
    draw(i: int, x: int, y: int) {
        // PK2Sprite_Prototyyppi* prot = &Game::Sprites->protot[ list[i] ];
        // prot->Piirra(x - prot->leveys / 2, y - prot->korkeus / 2, 0);
    }
    
    clean(): void {
        this._giftList = [];
    }
    
    /** @deprecated Use {@link #take}. */
    use(): void {
        // if (gift_count > 0) {
        //     Game::Sprites->add(
        //         list[0], 0,
        //         Game::Sprites->player->x - Game::Sprites->protot[list[0]].leveys,
        //         Game::Sprites->player->y,
        //         MAX_SPRITEJA, false);
        //
        //     for (int i = 0; i < MAX_GIFTS - 1; i++)
        //     list[i] = list[i+1];
        //
        //     list[MAX_GIFTS-1] = -1;
        //
        //     gift_count--;
        // }
        //
        // return 0;
    }
    
    changeOrder(): void {
        if (this._giftList.length > 1) {
            const temp = this._giftList.shift();
            this._giftList.push(temp);
        }
        Log.d('[Gifts] Order changed.');
    }
}
