import { FONT } from '@game/PK2';
import { PK2Context } from '@game/PK2Context';
import { TX } from '@game/texts';
import { UIPlainText } from '@game/ui/component/UIPlainText';
import { UIWaveText } from '@game/ui/component/UIWaveText';
import { AudioMenuGroup } from '@game/ui/screen/menu/submenu/AudioMenuGroup';
import { MainMenuGroup } from '@game/ui/screen/menu/submenu/MainMenuGroup';
import { NameMenuGroup } from '@game/ui/screen/menu/submenu/NameMenuGroup';
import { Screen } from '@game/ui/screen/Screen';
import { DwSpriteImpl } from '@ng/drawable/impl-pixi/DwSpriteImpl';
import { DwSprite } from '@ng/drawable/skeleton/DwSprite';
import { Log } from '@ng/support/log/LoggerImpl';
import { pathJoin } from '@ng/support/utils';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';
import { PkBitmap } from '@ng/types/PkBitmap';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { PkUIEffectDelay } from '@ng/ui/effect/PkUIEffectDelay';
import { PkUIEffectFadeIn } from '@ng/ui/effect/PkUIEffectFadeIn';
import { PkUIEffectFadeOut } from '@ng/ui/effect/PkUIEffectFadeOut';
import { PkUIComponentImpl } from '@ng/ui/PkUIComponentImpl';
import { RESOURCES_PATH } from '@sp/constants';
import { MenuSquare } from './MenuSquare';

//Menu ID
enum MENU {
    MENU_MAIN,
    MENU_EPISODES,
    MENU_CONTROLS,
    MENU_GRAPHICS,
    MENU_SOUNDS,
    MENU_NAME,
    MENU_LOAD,
    MENU_TALLENNA,
    MENU_LANGUAGE
}

const TITLE_X = 79;
const TITLE_Y = 90;

export class MenuScreen extends Screen {
    private _bgImage: PkBitmap;
    private _bgDrawable: DwSprite;
    
    private _square: MenuSquare;
    
    private _19obj = [];
    
    private _currentMenu: MENU;
    
    //private _menu: TMenuCache = { main: {}, name: {}, episodes: {}, controls: {}, graphics: {}, sounds: {} };
    private _mainMenu: MainMenuGroup;
    private _nameMenu: NameMenuGroup;
    private _audioMenu: AudioMenuGroup;
    
    
    public static async create(context: PK2Context): Promise<MenuScreen> {
        const tmp = new MenuScreen(context);
        return await tmp.inialize();
    }
    
    private async inialize(): Promise<MenuScreen> {
        Log.d('[MenuScreen] Initializing menu screen');
        
        // Load and prepare background
        this._bgImage = await PkAssetTk.getBitmap(pathJoin(RESOURCES_PATH, 'gfx/menu.bmp'));
        this._bgDrawable = (new DwSpriteImpl() as DwSprite)
            .setTexture(this._bgImage.getTexture());
        this._drawable.add(this._bgDrawable);
        
        // Prepare square
        this._square = new MenuSquare(this._context, 160, 200, 640 - 180, 410,
            [0x00004f, 0x000053, 0x070757, 0x0b0b5b, 0x13135f, 0x171763, 0x1f1f67, 0x27276b, 0x2f2f6f, 0x3b3377, 0x4b377f]
        );
        this.add(this._square);
        
        this._mainMenu = new MainMenuGroup(this._context)
            .addTo(this)
            .hide();
        this._nameMenu = new NameMenuGroup(this._context)
            .addTo(this)
            .hide();
        this._audioMenu = new AudioMenuGroup(this._context)
            .addTo(this)
            .hide();
        // this.layoutNameMenu();
        // this.layoutEpisodesMenu();
        // this.layoutControlsMenu();
        // this.layoutSoundsMenu();
        
        this._mainMenu.on(MainMenuGroup.EV_ACTION_NEWGAME, this._acNewGameStep1, this);
        this._mainMenu.on(MainMenuGroup.EV_ACTION_AUDIO, this._acGoToAudioMenu, this);
        this._nameMenu.on(NameMenuGroup.EV_ACTION_BACK, this._acBackToMain, this);
        this._audioMenu.on(AudioMenuGroup.EV_ACTION_BACK, this._acBackToMain, this);
        
        // this.context.input.listenKeys('right,down', () => {
        //     console.debug(`PK M   - Changing focus to next...`);
        //     this.focusNext();
        // });
        //
        // this.context.input.listenKeys('left,up', () => {
        //     console.debug(`PK M   - Changing focus to previous...`);
        //     this.focusPrevious();
        // });
        
        this._mainMenu.show();
    
        // let abb = await PkAssetTk.getArrayBuffer('/pk2w/res/music/song09.xm');
        // XMPlayer.init();
        // XMPlayer.load(abb);
        // XMPlayer.play();
        
        return this;
    }
    
    public showMainMenu(ms?: number): void {
        this._acBackToMain();
        this.resume(ms);
    }
    
    private playMusic() {
        this._context.audio.playXM('music/song09.xm');
    }
    
    ///  Episodes Menu  ///
    
    private layoutEpisodesMenu(): void {
        const ctx = this._context;
        const fontFg = FONT.F2;
        const fontBg = FONT.F4;
        let y = TITLE_Y + 40;
        
        this._menu.episodes.titleLabel = new UIPlainText(ctx, TX.EPISODES_CHOOSE_EPISODE, fontFg, TITLE_X, TITLE_Y)
            .addTo(this)
            .setVisible(false);
        
        this._menu.episodes.cmEpisodesLabel = new UIPlainText(ctx, 'game episodes', fontFg, TITLE_X + 42, y)
            .addTo(this)
            .setVisible(false);
        y += 27;
        
        this._menu.episodes.gagaga = new UIWaveText(ctx, 'hola que ase', fontFg, TITLE_X + 84, y)
            .addTo(this)
            .setVisible(true)
            .setFocusable();
        y += 22;
        this._menu.episodes.gagaga = new UIWaveText(ctx, 'hola que ase 2', fontFg, TITLE_X + 84, y)
            .addTo(this)
            .setVisible(true)
            .setFocusable();
        y += 42;
        
        this._menu.episodes.gmEpisodesLabel = new UIPlainText(ctx, 'community episodes', fontFg, TITLE_X + 42, y)
            .addTo(this)
            .setVisible(false);
        y += 27;
        
        this._menu.episodes.gagaga = new UIWaveText(ctx, 'hola que ase', fontFg, TITLE_X + 84, y)
            .addTo(this)
            .setVisible(true)
            .setFocusable();
        y += 22;
        this._menu.episodes.gagaga = new UIWaveText(ctx, 'hola que ase 2', fontFg, TITLE_X + 84, y)
            .addTo(this)
            .setVisible(true)
            .setFocusable();
        y += 22;
        this._menu.episodes.gagaga = new UIWaveText(ctx, 'segundo episodio', fontFg, TITLE_X + 84, y)
            .addTo(this)
            .setVisible(true)
            .setFocusable();
        y += 42;
        
        // PAGINATION
        // if (episodi_lkm-2 > 10) {
        //     char luku[20];
        //     int vali = 90;
        //     int x = 50,//////500,
        //         y = 50;//////300;
        //     //////////vali += PisteDraw2_Font_Write(fontti1,"page:",x,y+40);
        //     itoa(episodisivu+1,luku,10);
        //     vali += PisteDraw2_Font_Write(fontti1,luku,x+vali,y+20);
        //     vali += PisteDraw2_Font_Write(fontti1,"/",x+vali,y+20);
        //     itoa((episodi_lkm/10)+1,luku,10);
        //     vali += PisteDraw2_Font_Write(fontti1,luku,x+vali,y+20);
        //
        //     int nappi = PK_Draw_Menu_BackNext(x,y);
        //
        //     if (nappi == 1 && episodisivu > 0)
        //         episodisivu--;
        //
        //     if (nappi == 2 && (episodisivu*10)+10 < episodi_lkm)
        //         episodisivu++;
        // }
        
        // for (int i=(episodisivu*10)+2;i<(episodisivu*10)+12;i++){
        //     if (strcmp(episodit[i],"") != 0){
        //         if (PK_Draw_Menu_Text(true,episodit[i],220,90+my)){
        //             strcpy(episodi,episodit[i]);
        //             PK_Load_InfoText();
        //             game_next_screen = SCREEN_MAP;
        //             episode_started = false;
        //             PK_New_Game();
        //             //PisteDraw2_FadeIn(PD_FADE_NORMAL);
        //         }
        //         my += 20;
        //     }
        // }
        
        /* TODO: Moar, pagination or something */
        
        this._menu.episodes.exitActn = new UIWaveText(ctx, TX.MAINMENU_RETURN, fontFg, 180, 400)
            .addTo(this)
            .setVisible(false)
            .setFocusable()
            .on(PkUIComponentImpl.EV_ACTION, () => {
                this.showMainMenu();
            });
        
        //PisteDraw2_Font_Write(fontti1,tekstit->hae_Teksti(PK_txt.episodes_get_more),140,440);
    }
    
    public showEpisodesMenu(ms?: number): void {
        //  this.preShowMenu();
        
        this._square.setTarget(58, 68, 640 - 58, 416);
        this._square.setPalette([0x00004f, 0x000053, 0x070757, 0x0b0b5b, 0x13135f, 0x171763, 0x1f1f67, 0x27276b, 0x2f2f6f, 0x3b3377, 0x4b377f]);
        
        this._menu.episodes.titleLabel.show();
        this._menu.episodes.exitActn.show();
        
        this._menu.episodes.gmEpisodesLabel.show();
        this._menu.episodes.cmEpisodesLabel.show();
        
        
        //this.focusNext();
        
        this.resume(ms);
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
    
    
    ///  Sounds Menu  ///
    
    private layoutSoundsMenu(): void {
    }
    
    public tick(delta: number, time: number) {
        super.tick(delta, time);
        // const _degree = 200;
        
        // if (time > 10000)
        //     this.suspend(1);
        
        // let x1 = 160, y1 = 200, x2 = 640 - 180, y2 = 410;
        //
        // let pvari = 224;
        //
        // if (this.menunelioleft < x1)
        //     this.menunelioleft++;
        //
        // if (this.menunelioleft > x1)
        //     this.menunelioleft--;
        
        // x1 = Math.floor(this.menunelioleft);
        //
        // x1 += Math.floor(Math.sin((_degree * 2) % 359) / 2.0);
        //
        // this.PK_Draw_Menu_Square(x1, 200, 640 - 180, 410, 38);
    }
    
    ///  Actions  ///
    
    private _acNewGameStep1(): void {
        this._mainMenu
            .applyEffect(PkUIEffectFadeOut.for(120)
                .thenDo(cmp => cmp.hide()));
        
        this._square.setTarget(90, 150, 640 - 90, 480 - 100);
        this._square.setPalette([0x00004f, 0x000053, 0x070757, 0x0b0b5b, 0x13135f, 0x171763, 0x1f1f67, 0x27276b, 0x2f2f6f, 0x3b3377, 0x4b377f]);
        this._nameMenu
            .reset()
            .setAlpha(0)
            .show()
            .applyEffect(PkUIEffectDelay.for(60)
                .then(PkUIEffectFadeIn.for(120)));
    }
    
    private _acGoToAudioMenu(): void {
        this._mainMenu.hide();
        
        this._square.setTarget(40, 70, 640 - 40, 410);
        this._audioMenu.show();
    }
    
    private _acBackToMain(): void {
        this._nameMenu.hide();
        this._audioMenu.hide();
        
        this._square.setTarget(160, 200, 640 - 180, 410);
        this._square.setPalette([0x00004f, 0x000053, 0x070757, 0x0b0b5b, 0x13135f, 0x171763, 0x1f1f67, 0x27276b, 0x2f2f6f, 0x3b3377, 0x4b377f]);
        this._mainMenu.show();
    }
    
    
    /** @deprecated */
    public layout() {
        
        // this.add(new UIBackground(this.context, 640, 480, 0x000000)
        //     .setSprite(clipTSprite(this._bgBaseTexture, 0, 0, 640, 480)));
        // // 	PisteDraw2_ScreenFill(0);
        // // 	PisteDraw2_Image_Clip(kuva_tausta, (episode_started && settings.isWide)? -80 : 0, 0);
        
        //this.layoutMainMenu();
        
        //this.layoutNameMenu();
        
        // setTimeout(() => {
        //     this.layoutNameMenu();
        // }, 5000);
    }
    
    
    private layoutGraphicsMenu(): void {
    
    }
    
    private redMenu() {
        this._square.setPalette([0x5E011C, 0x750223, 0x860331, 0x98083C, 0xAF123F, 0xC41D47, 0xD72552, 0xEB3056, 0xFC3D5E, 0xFF5967, 0xFF6071]);
    }
}

