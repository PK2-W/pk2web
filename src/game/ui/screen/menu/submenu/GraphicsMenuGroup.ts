import { PekkaContext } from '@game/PekkaContext';
import { TX } from '@game/texts';
import { UICheckbox } from '@game/ui/component/UICheckbox';
import { UIPanel } from '@game/ui/component/UIPanel';
import { UIPlainText } from '@game/ui/component/UIPlainText';
import { UIProgressBar } from '@game/ui/component/UIProgressBar';
import { UIStackLayout } from '@game/ui/component/UIStackLayout';
import { UIText } from '@game/ui/component/UIText';
import { UIWaveText } from '@game/ui/component/UIWaveText';
import { MenuScreen } from '@game/ui/screen/menu/MenuScreen';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { PkUIComponentContainer } from '@ng/ui/component/PkUIComponentContainer';

export class GraphicsMenuGroup extends PkUIComponentContainer<PekkaContext> {
    private readonly _menu: MenuScreen;
    
    public readonly lbSubmenu: UIText;
    public readonly lbBack: UIText;
    
    
    public constructor(context: PekkaContext, menu: MenuScreen) {
        super(context);
        this._menu = menu;
        
        // Contents ¬
        
        const fontFg = this.context.font2;
        const stack = new UIStackLayout(context, 30)
            .addTo(this, 100, 150);
        
        this.lbSubmenu = new UIPlainText(context, TX.GFX_TITLE, fontFg, true)
            .addTo(this, 70, 90);
        
        new UICheckbox(context, TX.GFX_TFX_ON, TX.GFX_TFX_OFF, fontFg, true)
            .setFocusable()
            .addTo(stack);
        
        new UICheckbox(context, TX.GFX_TMENUS_ON, TX.GFX_TMENUS_OFF, fontFg, true)
            .setFocusable()
            .addTo(stack);
        
        new UICheckbox(context, TX.GFX_ITEMS_ON, TX.GFX_ITEMS_OFF, fontFg, true)
            .setFocusable()
            .addTo(stack);
        
        new UICheckbox(context, TX.GFX_WEATHER_ON, TX.GFX_WEATHER_OFF, fontFg, true)
            .setFocusable()
            .addTo(stack);
        
        new UICheckbox(context, TX.GFX_BGSPRITES_ON, TX.GFX_BGSPRITES_OFF, fontFg, true)
            .setFocusable()
            .addTo(stack);
        
        new UICheckbox(context, TX.GFX_SPEED_DOUBLE, TX.GFX_SPEED_NORMAL, fontFg, true)
            .setFocusable()
            .addTo(stack);
        
        new UICheckbox(context, 'Full screen ON', 'Full screen OFF', fontFg, true)
            .setFocusable()
            .addTo(stack);
        
        new UICheckbox(context, 'Fit to window ON', 'Fit to window OFF', fontFg, true)
            .setFocusable()
            .addTo(stack);
        
        new UICheckbox(context, 'Bilinear filter ON', 'Bilinear filter OFF', fontFg, true)
            .setFocusable()
            .addTo(stack);
        
        new UICheckbox(context, 'Wide screen ON', 'Wide screen OFF', fontFg, true)
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