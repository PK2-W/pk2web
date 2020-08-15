import { PK2Context } from '@game/PK2Context';
import { Screen } from '@game/ui/screen/Screen';

export class BaseScreen extends Screen {
    public static async create(context: PK2Context): Promise<MenuScreen> {
        const tmp = new MenuScreen(context);
        return await tmp.inialize();
    }
}