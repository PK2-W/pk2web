import { PekkaContext } from '@game/PekkaContext';
import { TX } from '@game/texts';
import { UIPlainText } from '@game/ui/component/UIPlainText';
import { UIText } from '@game/ui/component/UIText';
import { UITextInput } from '@game/ui/component/UITextInput';
import { UIWaveText } from '@game/ui/component/UIWaveText';
import { MenuScreen } from '@game/ui/screen/menu/MenuScreen';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { PkUIComponentContainer } from '@ng/ui/component/PkUIComponentContainer';

/**
 * SRC: PK_Draw_Menu_Name.
 */
export class NameMenuGroup extends PkUIComponentContainer<PekkaContext> {
    private readonly _menu: MenuScreen;
    
    public readonly lbSubmenu: UIText;
    public readonly tiInput: UITextInput;
    public readonly lbContinue: UIText;
    public readonly lbClear: UIText;
    public readonly lbBack: UIText;
    

    public constructor(context: PekkaContext, menu: MenuScreen) {
        super(context);
        this._menu = menu;
        
        // Contents ¬
        
        const font = this.context.font2;
        
        this.lbSubmenu = new UIPlainText(context, TX.PLAYERMENU_TYPE_NAME, font, true)
            .addTo(this, 180, 224);
        
        this.tiInput = new UITextInput(context, 'pekka')
            .addTo(this, 180, 255)
            .setFocusable()
            .setMaxLength(18);
        
        // Confirm name
        this.lbContinue = new UIWaveText(context, TX.PLAYERMENU_CONTINUE, font, true)
            .addTo(this, 180, 300)
            .setFocusable()
            .on(PkUIComponent.EV_ACTUATED, () => this._menu.acNewGameNameSelected(this.tiInput.text));
        
        // Clear inserted text
        this.lbClear = new UIWaveText(context, TX.PLAYERMENU_CLEAR, font, true)
            .addTo(this, 340, 300)
            .setFocusable()
            .on(PkUIComponent.EV_ACTUATED, () => { this.tiInput.clear().focus(); });
        
        // Back to main menu
        this.lbBack = new UIWaveText(context, TX.MAINMENU_RETURN, font, true)
            .addTo(this, 180, 400)
            .setFocusable()
            .on(PkUIComponent.EV_ACTUATED, () => this._menu.acBackToMain());
    }
    
    public reset(): this {
        this.tiInput.text = 'pekka';
        return this;
    }
}