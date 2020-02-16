import { UIBackground } from '@game/ui/UIBackground';
import { UIPlainText } from '@game/ui/UIPlainText';
import { UIProgressBar } from '@game/ui/UIProgressBar';
import { UIWaveText } from '@game/ui/UIWaveText';
import { clipTSprite } from '@ng/drawable/DwHelper';
import { PkScreen } from '@ng/screen/PkScreen';
import { PkUIComponent } from '@ng/screen/PkUIComponent';
import { PK2wImageLoader } from '@ng/support/PK2wImageLoader';
import * as PIXI from 'pixi.js';
import { int } from '../../../support/types';
import { PK2Context } from '../../PK2Context';
import { TX } from '../../texts';
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

export class MenuScreen extends PkScreen {
    private _bgImage: HTMLImageElement;
    private _bgDrawable: PIXI.DisplayObject;
    
    private _square: MenuSquare;
    
    private _19obj = [];
    
    private _currentMenu: MENU;
    private _menuItems: PkUIComponent[] = [];
    private _focusedItem: int;
    
    private _menu: TMenuCache = { main: {}, name: {}, episodes: {}, controls: {}, graphics: {}, sounds: {} };
    
    
    public static async create(ctx: PK2Context): Promise<MenuScreen> {
        const tmp = new MenuScreen(ctx);
        return await tmp.inialize();
    }
    
    private constructor(ctx: PK2Context) {
        super(ctx);
    }
    
    private async inialize(): Promise<MenuScreen> {
        console.debug('PK M   - Initializing menu screen');
        
        // Load and prepare background
        const loader = await PK2wImageLoader.load('gfx/menu.bmp');
        this._bgImage = loader.getImage();
        this._bgDrawable = PIXI.Sprite.from(this._bgImage);
        
        // Prepare square
        this._square = new MenuSquare(160, 200, 640 - 180, 410,
            [0x00004f, 0x000053, 0x070757, 0x0b0b5b, 0x13135f, 0x171763, 0x1f1f67, 0x27276b, 0x2f2f6f, 0x3b3377, 0x4b377f]
        );
        this.add(this._square);
        
        this.layoutMainMenu();
        this.layoutNameMenu();
        this.layoutEpisodesMenu();
        this.layoutControlsMenu();
        this.layoutSoundsMenu();
        
        this.context.input.listenKeys('right,down', () => {
            console.debug(`PK M   - Changing focus to next...`);
            this.focusNext();
        });
        
        this.context.input.listenKeys('left,up', () => {
            console.debug(`PK M   - Changing focus to previous...`);
            this.focusPrevious();
        });
        
        return this;
    }
    
    
    private playMusic() {
        this._context.audio.playXM('music/song09.xm');
    }
    
    ///  Menu switch  ///
    
    private preShowMenu(): void {
        this.hideAllComponents();
    }
    
    
    ///  Main Menu  ///
    
    private layoutMainMenu(): void {
        const ctx = this.context;
        const fontFg = this.context.fontti2;
        const fontBg = this.context.fontti4;
        
        this._menu.main.continueGame = new UIWaveText(ctx, TX.MAINMENU_CONTINUE, fontFg, 180, 0)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        this._menu.main.newGame = new UIWaveText(ctx, TX.MAINMENU_NEW_GAME, fontFg, 180, 0)
            .addTo(this)
            .setVisible(false)
            .setFocusable()
            .on(PkUIComponent.EVT_ACTION, () => {
                this.showNameMenu();
            });
        this._menu.main.saveGame = new UIWaveText(ctx, TX.MAINMENU_SAVE_GAME, fontFg, 180, 0)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        this._menu.main.loadGame = new UIWaveText(ctx, TX.MAINMENU_LOAD_GAME, fontFg, 180, 0)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        this._menu.main.loadLanguage = new UIWaveText(ctx, TX.MAINMENU_LOAD_LANGUAGE, fontFg, 180, 0)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        this._menu.main.controls = new UIWaveText(ctx, TX.MAINMENU_CONTROLS, fontFg, 180, 0)
            .addTo(this)
            .setVisible(false)
            .setFocusable()
            .on(PkUIComponent.EVT_ACTION, () => {
                this.showControlsMenu();
            });
        this._menu.main.graphics = new UIWaveText(ctx, TX.MAINMENU_GRAPHICS, fontFg, 180, 0)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        this._menu.main.sounds = new UIWaveText(ctx, TX.MAINMENU_SOUNDS, fontFg, 180, 0)
            .addTo(this)
            .setVisible(false)
            .setFocusable()
            .on(PkUIComponent.EVT_ACTION, () => {
                this.showSoundsMenu();
            });
        this._menu.main.exit = new UIWaveText(ctx, TX.MAINMENU_EXIT, fontFg, 180, 0)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
    }
    
    public showMainMenu(ms?: number): void {
        let y = 240;
        
        this.preShowMenu();
        
        this._square.setTarget(160, 200, 640 - 180, 410);
        this._square.setPalette([0x00004f, 0x000053, 0x070757, 0x0b0b5b, 0x13135f, 0x171763, 0x1f1f67, 0x27276b, 0x2f2f6f, 0x3b3377, 0x4b377f]);
        
        // this._menu.main.continueGame.setY(y).show();
        // y += 20;
        
        this._menu.main.newGame.setY(y).show();
        y += 20;
        
        // this._menu.main.saveGame.setY(y).show();
        // y += 20;
        
        this._menu.main.loadGame.setY(y).show();
        y += 20;
        
        this._menu.main.loadLanguage.setY(y).show();
        y += 20;
        
        this._menu.main.controls.setY(y).show();
        y += 20;
        
        this._menu.main.graphics.setY(y).show();
        y += 20;
        
        this._menu.main.sounds.setY(y).show();
        y += 20;
        
        this._menu.main.exit.setY(y).show();
        
        this.focusNext();
        
        this.resume(ms);
    }
    
    
    ///  Name Menu  ///
    
    private layoutNameMenu(): void {
        const ctx = this.context;
        const fontFg = this.context.fontti2;
        
        this._menu.name.titleLabel = new UIPlainText(ctx, TX.PLAYERMENU_TYPE_NAME, fontFg, 180, 224)
            .addTo(this)
            .setVisible(false);
        
        // TODO: Name component
        
        this._menu.name.continueActn = new UIWaveText(ctx, TX.PLAYERMENU_CONTINUE, fontFg, 180, 300)
            .addTo(this)
            .setVisible(false)
            .setFocusable()
            .on(PkUIComponent.EVT_ACTION, () => {
                this.showEpisodesMenu();
            });
        this._menu.name.clearActn = new UIWaveText(ctx, TX.PLAYERMENU_CLEAR, fontFg, 340, 300)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        this._menu.name.exitActn = new UIWaveText(ctx, TX.MAINMENU_EXIT, fontFg, 180, 400)
            .addTo(this)
            .setVisible(false)
            .setFocusable()
            .on(PkUIComponent.EVT_ACTION, () => {
                this.showMainMenu();
            });
    }
    
    public showNameMenu(ms?: number): void {
        this.preShowMenu();
        
        this._square.setTarget(90, 150, 640 - 90, 480 - 100);
        this._square.setPalette([0x00004f, 0x000053, 0x070757, 0x0b0b5b, 0x13135f, 0x171763, 0x1f1f67, 0x27276b, 0x2f2f6f, 0x3b3377, 0x4b377f]);
        
        this._menu.name.titleLabel.show();
        
        this._menu.name.continueActn.show();
        this._menu.name.clearActn.show();
        this._menu.name.exitActn.show();
    }
    
    
    ///  Episodes Menu  ///
    
    private layoutEpisodesMenu(): void {
        const ctx = this.context;
        const fontFg = this.context.fontti2;
        const fontBg = this.context.fontti4;
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
            .on(PkUIComponent.EVT_ACTION, () => {
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
        const fontFg = this.context.fontti2;
        const fontBg = this.context.fontti4;
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
            .on(PkUIComponent.EVT_ACTION, () => {
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
        const ctx = this.context;
        const fontFg = this.context.fontti2;
        const fontBg = this.context.fontti4;
        
        this._menu.sounds.titleLabel = new UIPlainText(ctx, TX.SOUND_TITLE, fontFg, TITLE_X, TITLE_Y)
            .addTo(this)
            .setVisible(false);
        
        let y = 180;
        
        this._menu.sounds.sfxLabel = new UIPlainText(ctx, TX.SOUND_SFX_VOLUME, fontFg, 180, y)
            .addTo(this)
            .setVisible(false);
        y += 24;
        this._menu.sounds.sfxLessActn = new UIWaveText(ctx, TX.SOUND_LESS, fontFg, 180, y)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        this._menu.sounds.sfxMoreActn = new UIWaveText(ctx, TX.SOUND_MORE, fontFg, 180 + 8 * 15, y)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        this._menu.sounds.sfxLevel = new UIProgressBar(ctx, 400, y + 5, 100, 20, 0xFF7A81)
            .addTo(this)
            .setVisible(false)
            .setProgress(1);
        
        y += 50;
        
        this._menu.sounds.musicLabel = new UIPlainText(ctx, TX.SOUND_MUSIC_VOLUME, fontFg, 180, y)
            .addTo(this)
            .setVisible(false);
        y += 24;
        this._menu.sounds.musicLessActn = new UIWaveText(ctx, TX.SOUND_LESS, fontFg, 180, y)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        this._menu.sounds.musicMoreActn = new UIWaveText(ctx, TX.SOUND_MORE, fontFg, 180 + 8 * 15, y)
            .addTo(this)
            .setVisible(false)
            .setFocusable();
        this._menu.sounds.musicLevel = new UIProgressBar(ctx, 400, y + 5, 100, 20, 0x80B05F)
            .addTo(this)
            .setVisible(false)
            .setProgress(1);
        // PisteDraw2_ScreenFill(400,220+my,400+int(settings.music_max_volume*1.56),240+my,112);
        
        this._menu.sounds.backActn = new UIWaveText(ctx, TX.MAINMENU_RETURN, fontFg, 180, 400)
            .addTo(this)
            .setVisible(false)
            .setFocusable()
            .on(PkUIComponent.EVT_ACTION, () => {
                this.showMainMenu();
            });
    }
    
    public showSoundsMenu(ms?: number): void {
        this.preShowMenu();
        
        this._square.setTarget(40, 70, 640 - 40, 410);
        
        this._menu.sounds.titleLabel.show();
        
        this._menu.sounds.sfxLabel.show();
        this._menu.sounds.sfxLessActn.show();
        this._menu.sounds.sfxMoreActn.show();
        this._menu.sounds.sfxLevel.show();
        
        this._menu.sounds.musicLabel.show();
        this._menu.sounds.musicLessActn.show();
        this._menu.sounds.musicMoreActn.show();
        this._menu.sounds.musicLevel.show();
        
        this._menu.sounds.backActn.show();
    }
    
    
    public showGraphicsMenu(ms?: number) {
        this.layoutGraphicsMenu();
    }
    
    protected tick(delta: number, time: number) {
        // const _degree = 200;
        
        // if (time > 10000)
        //     this.suspend(1);
        
        this._square.tick(delta, time);
        
        for (const obj of this._components) {
            obj.tick(delta, time);
        }
        
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
    
    /** @deprecated */
    public layout() {
        
        this.add(new UIBackground(this.context, 640, 480, 0x000000)
            .setSprite(clipTSprite(this._bgBaseTexture, 0, 0, 640, 480)));
        // // 	PisteDraw2_ScreenFill(0);
        // // 	PisteDraw2_Image_Clip(kuva_tausta, (episode_started && settings.isWide)? -80 : 0, 0);
        
        //this.layoutMainMenu();
        
        //this.layoutNameMenu();
        
        // setTimeout(() => {
        //     this.layoutNameMenu();
        // }, 5000);
        this._drawable.addChild(this._bgDrawable);
        this._drawable.addChild(this._square.getDrawable());
    }
    
    
    private layoutGraphicsMenu(): void {
    
    }
    
    
    private setFocus(nth: int) {
        this._focusedItem = nth;
        this._menuItems[nth].focus();
    }
    
    private redMenu() {
        this._square.setPalette([0x5E011C, 0x750223, 0x860331, 0x98083C, 0xAF123F, 0xC41D47, 0xD72552, 0xEB3056, 0xFC3D5E, 0xFF5967, 0xFF6071]);
    }
}

type TMenuCache = {
    main: { [key: string]: PkUIComponent },
    name: { [key: string]: PkUIComponent },
    episodes: { [key: string]: PkUIComponent },
    controls: { [key: string]: PkUIComponent },
    graphics: { [key: string]: PkUIComponent },
    sounds: { [key: string]: PkUIComponent }
};
