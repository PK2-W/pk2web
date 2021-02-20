import { InputAction } from '@game/InputActions';
import { PekkaContext } from '@game/PekkaContext';
import { TX } from '@game/texts';
import { UIStackLayout } from '@game/ui/component/UIStackLayout';
import { UIText } from '@game/ui/component/UIText';
import { UIWaveText } from '@game/ui/component/UIWaveText';
import { MenuScreen } from '@game/ui/screen/menu/MenuScreen';
import { PkInputEvent } from '@fwk/core/input/PkInputEvent';
import { PkInput } from '@fwk/core/PkInput';
import { PkUIComponent } from '@fwk/ui/component/PkUIComponent';
import { PkUIComponentContainer } from '@fwk/ui/component/PkUIComponentContainer';

export class MainMenuGroup extends PkUIComponentContainer<PekkaContext> {
    private readonly _menu: MenuScreen;
    
    public readonly lbResumeGame: UIText;
    public readonly lbNewGame: UIText;
    public readonly lbLoadGame: UIText;
    public readonly lbSaveGame: UIText;
    public readonly lbLanguage: UIText;
    public readonly lbControls: UIText;
    public readonly lbGraphics: UIText;
    public readonly lbSounds: UIText;
    
    public constructor(context: PekkaContext, menu: MenuScreen) {
        super(context);
        this._menu = menu;
        
        // Contents ¬
        
        const fontFg = this.context.font2;
        const stack = new UIStackLayout(context, 23)
            .setPosition(180, 240)
            .addTo(this);
        
        // Continue game
        // this.lbResumeGame = new UIWaveText(context, TX.MAINMENU_CONTINUE, fontFg, true)
        //     .addTo(stack)
        //     .setFocusable();
        
        // New game
        this.lbNewGame = new UIWaveText(context, TX.MAINMENU_NEW_GAME, fontFg, true)
            .addTo(stack)
            .setFocusable()
            .on(PkUIComponent.EV_ACTUATED, () => this._menu.acNewGame());
        
        // Save game
        // this.lbSaveGame = new UIWaveText(context, TX.MAINMENU_SAVE_GAME, fontFg, true)
        //     .addTo(stack)
        //     .setFocusable();
        
        // Load game
        this.lbLoadGame = new UIWaveText(context, TX.MAINMENU_LOAD_GAME, fontFg, true)
            .addTo(stack)
            .setFocusable();
        
        // Language
        this.lbLanguage = new UIWaveText(context, TX.MAINMENU_LOAD_LANGUAGE, fontFg, true)
            .addTo(stack)
            .setFocusable();
        
        // Controls
        this.lbControls = new UIWaveText(context, TX.MAINMENU_CONTROLS, fontFg, true)
            .addTo(stack)
            .setFocusable();
        //.on(PkUIComponentImpl.EV_ACTION, () => {                this.showControlsMenu();            });
        
        // Graphics
        this.lbGraphics = new UIWaveText(context, TX.MAINMENU_GRAPHICS, fontFg, true)
            .addTo(stack)
            .setFocusable()
            .on(PkUIComponent.EV_ACTUATED, () => this._menu.acGoToGraphicsMenu());
        
        // Sounds
        this.lbSounds = new UIWaveText(context, TX.MAINMENU_SOUNDS, fontFg, true)
            .addTo(stack)
            .setFocusable()
            .on(PkUIComponent.EV_ACTUATED, () => this._menu.acGoToSoundsMenu());
        
        stack.layout();
    }
    
    public static readonly EV_ACTION_NEWGAME = Symbol('new.game.action.menu.ev');
    public static readonly EV_ACTION_AUDIO = Symbol('audio.action.menu.ev');
}