import * as PIXI from '@vendor/pixi';
import { PK2wImageLoader } from '../../../engine/support/PK2wImageLoader';
import { RESOURCES_PATH } from '../../../support/constants';
import { clipTSprite } from '../../../support/drawable/DwHelper';
import { PK2Context } from '../../PK2Context';
import { Screen } from '../Screen';

// Setup
const PISTE_LOGO_INI = 3000;
const PISTE_LOGO_END = 5000;
const AUTHORS_INI = PISTE_LOGO_END + 800;
const AUTHORS_END = AUTHORS_INI + 7200;
const TESTERS_INI = AUTHORS_END + 800;
const TESTERS_END = TESTERS_INI + 7000;
const TRANSLATOR_INI = TESTERS_END + 1000;
const TRANSLATOR_END = TRANSLATOR_INI + 3000;


export class MenuScreen extends Screen {
    private startTime: number;
    
    private _bgBaseTexture: PIXI.BaseTexture;
    
    private _loopFnPtr: () => void = this.loop.bind(this);
    
    private _tmpObjs = [];
    
    
    public constructor(ctx: PK2Context) {
        super(ctx);
        
        this._drawable = new PIXI.Container();
    }
    
    
    public show() {
        super.show();
        
        this.start();
    }
    
    private async start() {
        this.startTime = Date.now();
        
        console.debug('PK M   - Initializing menu screen');
        
        // 		kuva_tausta = PisteDraw2_Image_Load("gfx/intro.bmp", true);
        const ld = await PK2wImageLoader.load('gfx/menu.bmp');
        this._bgBaseTexture = ld.getTexture();
        
        // console.debug('PK M   - Loading music: music/song09.XM');
        
        this._context.audio.playMusic('music/song09.ogg');
        // {
        // 	PK2_error = true;
        // 	PK2_error_msg = "Can't load intro.xm";
        // }
        
        // 		this.introCounter = 0;
        // 		siirry_pistelaskusta_karttaan = false;
        //
        // 		PisteDraw2_FadeIn(PD_FADE_FAST);
        
        this.arrange();
        
        this.context.gt.add(this._loopFnPtr);
    }
    
    private loop(a, b, ts: number) {
        this.context.gt.add(this._loopFnPtr);
        
        const delta = ts - this.startTime;
        
        // super.tick(a);
    }
    
    public arrange() {
        
        let black = new PIXI.Graphics();
        black.beginFill(0x000000);
        black.drawRect(0, 0, 640, 480);
        this._drawable.addChild(black);
        
        // 	PisteDraw2_ScreenFill(0);
        // 	PisteDraw2_Image_Clip(kuva_tausta, (episode_started && settings.isWide)? -80 : 0, 0);
        const island = clipTSprite(this._bgBaseTexture, 0, 0, 640, 480);
        this._drawable.addChild(island);
        
    }
}
