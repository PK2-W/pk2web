import { PekkaContext } from '@game/PekkaContext';
import { TX } from '@game/texts';
import { UIPlainText } from '@game/ui/component/UIPlainText';
import { UIText } from '@game/ui/component/UIText';
import { UIWaveText } from '@game/ui/component/UIWaveText';
import { MenuScreen } from '@game/ui/screen/menu/MenuScreen';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { PkUIComponentContainer } from '@ng/ui/component/PkUIComponentContainer';

/**
 * SRC: PK_Draw_Menu_Sounds
 */
export class SoundsMenuGroup extends PkUIComponentContainer<PekkaContext> {
    private readonly _menu: MenuScreen;
    
    public readonly lbSubmenu: UIText;
    public readonly lbSfx: UIText;
    public readonly lbSfxLess: UIText;
    public readonly lbSfxMore: UIText;
    public readonly lbMusic: UIText;
    public readonly lbMusicLess: UIText;
    public readonly lbMusicMore: UIText;
    public readonly lbBack: UIText;
    
    
    public constructor(context: PekkaContext, menu: MenuScreen) {
        super(context);
        this._menu = menu;
        
        // Contents ¬
        
        const fontFg = this.context.font2;
        
        this.lbSubmenu = new UIPlainText(context, TX.SOUND_TITLE, fontFg, true)
            .addTo(this, 50, 90);
        
        let y = 180;
        
        this.lbSfx = new UIPlainText(context, TX.SOUND_SFX_VOLUME, fontFg, true)
            .addTo(this, 180, y);
        y += 24;
        this.lbSfxLess = new UIWaveText(context, TX.SOUND_LESS, fontFg, true)
            .addTo(this, 180, y)
            .setFocusable();
        this.lbSfxMore = new UIWaveText(context, TX.SOUND_MORE, fontFg, true)
            .addTo(this, 180 + 8 * 15, y)
            .setFocusable();
        // this.lbSfxLevel = new UIProgressBar(ctx, 400, y + 5, 100, 20, 0xFF7A81)
        //     .addTo(this)
        //     .setVisible(false)
        //     .setProgress(1);
        
        y += 50;
        
        this.lbMusic = new UIPlainText(context, TX.SOUND_MUSIC_VOLUME, fontFg, true)
            .addTo(this, 180, y);
        y += 24;
        this.lbMusicLess = new UIWaveText(context, TX.SOUND_LESS, fontFg, true)
            .addTo(this, 180, y)
            .setFocusable();
        this.lbMusicMore = new UIWaveText(context, TX.SOUND_MORE, fontFg, true)
            .addTo(this, 180 + 8 * 15, y)
            .setFocusable();
        // this.lbMusicLevel = new UIProgressBar(ctx, 400, y + 5, 100, 20, 0x80B05F)
        //     .addTo(this)
        //     .setVisible(false)
        //     .setProgress(1);
        
        // Back to main menu
        this.lbBack = new UIWaveText(context, TX.MAINMENU_RETURN, fontFg, true)
            .addTo(this, 180, 400)
            .setFocusable()
            .on(PkUIComponent.EV_ACTUATED, () => this._menu.acBackToMain());
    }
}