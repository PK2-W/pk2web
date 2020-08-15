import { PK2Context } from '@game/PK2Context';
import { TX } from '@game/texts';
import { UIPanel } from '@game/ui/component/UIPanel';
import { UIPlainText } from '@game/ui/component/UIPlainText';
import { UIText } from '@game/ui/component/UIText';
import { UITextInput } from '@game/ui/component/UITextInput';
import { UIWaveText } from '@game/ui/component/UIWaveText';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { PkUIComponentContainer } from '@ng/ui/component/PkUIComponentContainer';

export class NameMenuGroup extends PkUIComponentContainer<PK2Context> {
    public readonly lbSubmenu: UIText;
    public readonly tiInput: UITextInput;
    public readonly lbContinue: UIText;
    public readonly lbClear: UIText;
    public readonly lbBack: UIText;
    
    public constructor(context: PK2Context) {
        super(context);
        
        // Layout
        
        const fontFg = this._context.font2;
        const fontBg = this._context.font4;
        
        this.lbSubmenu = new UIPlainText(context, TX.PLAYERMENU_TYPE_NAME, fontFg, 180, 224)
            .addTo(this);
        
        // TODO: Name component
        this.tiInput = new UITextInput(context)
            .setPosition(180,255)
            .addTo(this)
            .setFocusable();
        
        // Confirm name
        this.lbContinue = new UIWaveText(context, TX.PLAYERMENU_CONTINUE, fontFg, 180, 300)
            .addTo(this)
            .setFocusable();
        /* .on(PkUIComponentImpl.EV_ACTION, () => {
             this.showEpisodesMenu();
         });*/
        
        // Clear inserted text
        this.lbClear = new UIWaveText(context, TX.PLAYERMENU_CLEAR, fontFg, 340, 300)
            .addTo(this)
            .setFocusable();
        
        // Back to main menu
        this.lbBack = new UIWaveText(context, TX.MAINMENU_RETURN, fontFg, 180, 400)
            .addTo(this)
            .setFocusable()
            .on(PkUIComponent.EV_POINTERTAP, () => this.emit(NameMenuGroup.EV_ACTION_BACK));
    }
    
    public reset(): this {
        return this;
    }
    
    public static readonly EV_ACTION_BACK = Symbol('back.action.menu.ev');
}