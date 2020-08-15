import { PK2Context } from '@game/PK2Context';
import { TX } from '@game/texts';
import { UIPanel } from '@game/ui/component/UIPanel';
import { UIPlainText } from '@game/ui/component/UIPlainText';
import { UIProgressBar } from '@game/ui/component/UIProgressBar';
import { UIStackLayout } from '@game/ui/component/UIStackLayout';
import { UIText } from '@game/ui/component/UIText';
import { UIWaveText } from '@game/ui/component/UIWaveText';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { PkUIComponentContainer } from '@ng/ui/component/PkUIComponentContainer';

export class AudioMenuGroup extends PkUIComponentContainer<PK2Context> {
    public readonly lbSubmenu: UIText;
  
    public readonly lbBack: UIText;
    
    public constructor(context: PK2Context) {
        super(context);
        
        // Layout
        
        const fontFg = this._context.font2;
        const fontBg = this._context.font4;
        // const container = new UIPanel(context)
        //     .setPosition(180, 240)
        //     .addTo(this);
    
        this.lbSubmenu=  new UIPlainText(context, TX.SOUND_TITLE, fontFg, 79, 90)
            .addTo(this)
            .setVisible(false);
    
        let y = 180;
    
        // this._menu.sounds.sfxLabel = new UIPlainText(ctx, TX.SOUND_SFX_VOLUME, fontFg, 180, y)
        //     .addTo(this)
        //     .setVisible(false);
        // y += 24;
        // this._menu.sounds.sfxLessActn = new UIWaveText(ctx, TX.SOUND_LESS, fontFg, 180, y)
        //     .addTo(this)
        //     .setVisible(false)
        //     .setFocusable();
        // this._menu.sounds.sfxMoreActn = new UIWaveText(ctx, TX.SOUND_MORE, fontFg, 180 + 8 * 15, y)
        //     .addTo(this)
        //     .setVisible(false)
        //     .setFocusable();
        // this._menu.sounds.sfxLevel = new UIProgressBar(ctx, 400, y + 5, 100, 20, 0xFF7A81)
        //     .addTo(this)
        //     .setVisible(false)
        //     .setProgress(1);
        //
        // y += 50;
        //
        // this._menu.sounds.musicLabel = new UIPlainText(ctx, TX.SOUND_MUSIC_VOLUME, fontFg, 180, y)
        //     .addTo(this)
        //     .setVisible(false);
        // y += 24;
        // this._menu.sounds.musicLessActn = new UIWaveText(ctx, TX.SOUND_LESS, fontFg, 180, y)
        //     .addTo(this)
        //     .setVisible(false)
        //     .setFocusable();
        // this._menu.sounds.musicMoreActn = new UIWaveText(ctx, TX.SOUND_MORE, fontFg, 180 + 8 * 15, y)
        //     .addTo(this)
        //     .setVisible(false)
        //     .setFocusable();
        // this._menu.sounds.musicLevel = new UIProgressBar(ctx, 400, y + 5, 100, 20, 0x80B05F)
        //     .addTo(this)
        //     .setVisible(false)
        //     .setProgress(1);
        
        // Back to main menu
        this.lbBack = new UIWaveText(context, TX.MAINMENU_RETURN, fontFg, 180, 400)
            .addTo(this)
            .setFocusable(true)
            .on(PkUIComponent.EV_POINTERTAP, () => this.emit(AudioMenuGroup.EV_ACTION_BACK));
    }
    
    public static readonly EV_ACTION_BACK = Symbol('back.action.menu.ev');
}