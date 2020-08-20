import { Game } from '@game/game/Game';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';

export class UIGame extends PkUIComponent {
    
    public setGame(game: Game): void {
        this._drawable.clear();
        this._drawable.add(game.camera);
        //this._drawable.add(game.composition.getDrawable());
    }
}