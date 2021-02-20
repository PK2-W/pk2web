import { FONT } from '@game/Pekka';
import { PekkaContext } from '@game/PekkaContext';
import { TX } from '@game/texts';
import { UIPlainText } from '@game/ui/component/UIPlainText';
import { UIText } from '@game/ui/component/UIText';
import { UITextInput } from '@game/ui/component/UITextInput';
import { UIWaveText } from '@game/ui/component/UIWaveText';
import { MenuScreen } from '@game/ui/screen/menu/MenuScreen';
import { PkUIComponent } from '@fwk/ui/component/PkUIComponent';
import { PkUIComponentContainer } from '@fwk/ui/component/PkUIComponentContainer';

/**
 * SRC: PK_Draw_Menu_Name.
 */
export class ControlsMenuGroup extends PkUIComponentContainer<PekkaContext> {
    private readonly _menu: MenuScreen;
    
    public readonly lbSubmenu: UIText;
    public readonly tiInput: UITextInput;
    public readonly lbContinue: UIText;
    public readonly lbClear: UIText;
    public readonly lbBack: UIText;
    

    public constructor(context: PekkaContext, menu: MenuScreen) {
        super(context);
        this._menu = menu;
        
   
    }
    
    ///  Controls Menu  ///
    
    private layoutControlsMenu(): void {
        const ctx = this.context;
        const fontFg = FONT.F2;
        const fontBg = FONT.F4;
        let y = 40;
        
        this._menu.controls.titleLabel = new UIPlainText(ctx, TX.CONTROLS_TITLE, fontFg, TITLE_X, TITLE_Y)
            .addTo(this)
            .setVisible(false);
        
        //if (menu_lue_kontrollit == 0) {
        this._menu.controls.editActn = new UIWaveText(ctx, TX.CONTROLS_EDIT, fontFg, 100, 90 + y)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        //}
        y += 30;
        
        this._menu.controls.kbDefActn = new UIWaveText(ctx, TX.CONTROLS_KBDEF, fontFg, 100, 90 + y)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        y += 20;
        
        this._menu.controls.gp4DefActn = new UIWaveText(ctx, TX.CONTROLS_GP4DEF, fontFg, 100, 90 + y)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        y += 20;
        
        this._menu.controls.gp6DefActn = new UIWaveText(ctx, TX.CONTROLS_GP6DEF, fontFg, 100, 90 + y)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        
        this._menu.controls.backActn = new UIWaveText(ctx, TX.MAINMENU_RETURN, fontFg, 180, 400)
            .addTo(this)
            .setVisible(false)
            .setFocusable()
            .on(PkUIComponentImpl.EV_ACTION, () => {
                this.showMainMenu();
            });
    }
    
    public showControlsMenu(ms?: number): void {
        this.preShowMenu();
        
        this._square.setTarget(40, 70, 640 - 40, 410);
        
        this._menu.controls.titleLabel.show();
        this._menu.controls.editActn.show();
        this._menu.controls.kbDefActn.show();
        this._menu.controls.gp4DefActn.show();
        this._menu.controls.gp6DefActn.show();
        this._menu.controls.backActn.show();
    }
    
    public reset(): this {
        this.tiInput.value = 'pekka';
        return this;
    }
}