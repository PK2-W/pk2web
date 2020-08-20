import { PekkaContext } from '@game/PekkaContext';
import { Screen } from '@game/ui/screen/Screen';

export class BaseScreen extends Screen {
    public static async create(context: PekkaContext): Promise<MenuScreen> {
        const tmp = new MenuScreen(context);
        return await tmp.inialize();
    }
}