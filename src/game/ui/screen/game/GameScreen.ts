import { Game } from '@game/game/Game';
import { PekkaContext } from '@game/PekkaContext';
import { UIGame } from '@game/ui/component/UIGame';
import { Screen } from '@game/ui/screen/Screen';

export class GameScreen extends Screen {
    private _uiGame: UIGame;
    
    public static async create(context: PekkaContext): Promise<GameScreen> {
        return new GameScreen(context);
    }
    
    public constructor(context) {
        super(context);
        this._uiGame = new UIGame(context).addTo(this);
        this._uiGame.setFocusable();
        
        this.propagatePointerEvents = false;
    }
    
    public display(game: Game): void {
        this._uiGame.setGame(game);
    }
}
