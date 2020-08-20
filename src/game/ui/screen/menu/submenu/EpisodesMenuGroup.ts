import { PekkaContext } from '@game/PekkaContext';
import { TX } from '@game/texts';
import { UIDummy } from '@game/ui/component/UIDummy';
import { UIPlainText } from '@game/ui/component/UIPlainText';
import { UIStackLayout } from '@game/ui/component/UIStackLayout';
import { UIText } from '@game/ui/component/UIText';
import { UIWaveText } from '@game/ui/component/UIWaveText';
import { MenuScreen } from '@game/ui/screen/menu/MenuScreen';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { PkUIComponentContainer } from '@ng/ui/component/PkUIComponentContainer';

export class EpisodesMenuGroup extends PkUIComponentContainer<PekkaContext> {
    private readonly _menu: MenuScreen;
    
    public readonly lbSubmenu: UIText;
    public readonly lbBack: UIText;
    
    
    public constructor(context: PekkaContext, menu: MenuScreen) {
        super(context);
        this._menu = menu;
        
        // Contents ¬
        
        const fontFg = this.context.font2;
        const stack = new UIStackLayout(context, 23)
            .addTo(this, 180, 150);
        
        this.lbSubmenu = new UIPlainText(context, TX.EPISODES_CHOOSE_EPISODE, fontFg, true)
            .addTo(this, 70, 90);
        
        new UIWaveText(context, 'rooster island 1', fontFg, true)
            .setFocusable()
            .addTo(stack);
        
        new UIWaveText(context, 'rooster island 2', fontFg, true)
            .setFocusable()
            .addTo(stack);
        
        new UIDummy(context).addTo(stack);
        
        new UIWaveText(context, 'community episodes...', fontFg, true)
            .setFocusable()
            .addTo(stack);
        
        stack.layout();
        
        // Back to main menu
        this.lbBack = new UIWaveText(context, TX.MAINMENU_RETURN, fontFg, true)
            .addTo(this, 180, 400)
            .setFocusable()
            .on(PkUIComponent.EV_ACTUATED, () => this._menu.acBackToMain());
    }
}