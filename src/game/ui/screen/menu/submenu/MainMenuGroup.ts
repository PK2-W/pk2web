import { PK2Context } from '@game/PK2Context';
import { TX } from '@game/texts';
import { UIStackLayout } from '@game/ui/component/UIStackLayout';
import { UIText } from '@game/ui/component/UIText';
import { UIWaveText } from '@game/ui/component/UIWaveText';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { PkUIComponentContainer } from '@ng/ui/component/PkUIComponentContainer';

export class MainMenuGroup extends PkUIComponentContainer<PK2Context> {
    public readonly lbResumeGame: UIText;
    public readonly lbNewGame: UIText;
    public readonly lbLoadGame: UIText;
    public readonly lbSaveGame: UIText;
    public readonly lbLanguage: UIText;
    public readonly lbControls: UIText;
    public readonly lbGraphics: UIText;
    public readonly lbSounds: UIText;
    public readonly lbExit: UIText;
    
    public constructor(context: PK2Context) {
        super(context);
        
        // Layout
        
        const fontFg = this._context.font2;
        const fontBg = this._context.font4;
        const container = new UIStackLayout(context, 20)
            .setPosition(180, 240)
            .addTo(this);
        
        // Continue game
        this.lbResumeGame = new UIWaveText(context, TX.MAINMENU_CONTINUE, fontFg)
            .addTo(container)
            .setFocusable(true);
        
        // New game
        this.lbNewGame = new UIWaveText(context, TX.MAINMENU_NEW_GAME, fontFg)
            .addTo(container)
            .setFocusable(true)
            .on(PkUIComponent.EV_POINTERTAP, () => this.emit(MainMenuGroup.EV_ACTION_NEWGAME));
        // .on(PkUIComponentImpl.EV_ACTION, () => {                this.showNameMenu();            });
        
        // Save game
        this.lbSaveGame = new UIWaveText(context, TX.MAINMENU_SAVE_GAME, fontFg)
            .addTo(container)
            .setFocusable(true);
        
        // Load game
        this.lbLoadGame = new UIWaveText(context, TX.MAINMENU_LOAD_GAME, fontFg)
            .addTo(container)
            .setFocusable(true);
        
        // Language
        this.lbLanguage = new UIWaveText(context, TX.MAINMENU_LOAD_LANGUAGE, fontFg)
            .addTo(container)
            .setFocusable(true);
        
        // Controls
        this.lbControls = new UIWaveText(context, TX.MAINMENU_CONTROLS, fontFg)
            .addTo(container)
            .setFocusable(true);
        //.on(PkUIComponentImpl.EV_ACTION, () => {                this.showControlsMenu();            });
        
        // Graphics
        this.lbGraphics = new UIWaveText(context, TX.MAINMENU_GRAPHICS, fontFg)
            .addTo(container)
            .setFocusable(true);
        
        // Sounds
        this.lbSounds = new UIWaveText(context, TX.MAINMENU_SOUNDS, fontFg)
            .addTo(container)
            .setFocusable(true)
            .on(PkUIComponent.EV_POINTERTAP, () => this.emit(MainMenuGroup.EV_ACTION_AUDIO));
        
        // Exit
        this.lbExit = new UIWaveText(context, TX.MAINMENU_EXIT, fontFg)
            .addTo(container)
            .setFocusable(true);
        
        container.layout();
    }
    
    public static readonly EV_ACTION_NEWGAME = Symbol('new.game.action.menu.ev');
    public static readonly EV_ACTION_AUDIO = Symbol('audio.action.menu.ev');
}