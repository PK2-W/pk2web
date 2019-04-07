import * as PIXI from '@vendor/pixi';
import { PK2wImageLoader } from '../../../engine/support/PK2wImageLoader';
import { RESOURCES_PATH } from '../../../support/constants';
import { clipTSprite } from '../../../support/drawable/DwHelper';
import { PK2Context } from '../../PK2Context';
import { Screen } from '../Screen';
import { IntroText } from './IntroText';

// Setup
const PISTE_LOGO_INI = 3000;
const PISTE_LOGO_END = 5000;
const AUTHORS_INI = PISTE_LOGO_END + 800;
const AUTHORS_END = AUTHORS_INI + 7200;
const TESTERS_INI = AUTHORS_END + 800;
const TESTERS_END = TESTERS_INI + 7000;
const TRANSLATOR_INI = TESTERS_END + 1000;
const TRANSLATOR_END = TRANSLATOR_INI + 3000;


export class IntroScreen extends Screen {
    private startTime: number;
    
    private _bgBaseTexture: PIXI.BaseTexture;
    
    
    private _tmpObjs = [];
    
    
    public constructor(ctx: PK2Context) {
        super(ctx);
    }
    
    
    public show() {
        //super.show();
        
        this.start();
    }
    
    private async start() {
        this.startTime = this.context.gt.now();
        
        console.debug('PK I   - Initializing intro screen');
        
        // 		kuva_tausta = PisteDraw2_Image_Load("gfx/intro.bmp", true);
        const ld = await PK2wImageLoader.load('gfx/intro.bmp');
        this._bgBaseTexture = ld.getTexture();
        
        console.debug('PK I   - Loading music: music/INTRO.XM\n');
        
        this._context.audio.playMusic('music/intro.ogg');
        // {
        // 	PK2_error = true;
        // 	PK2_error_msg = "Can't load intro.xm";
        // }
        
        // 		this.introCounter = 0;
        // 		siirry_pistelaskusta_karttaan = false;
        //
        // 		PisteDraw2_FadeIn(PD_FADE_FAST);
        
        this.arrange();
        
        this.resume(1000);
    }
    
    protected tick(delta: number, time: number) {
        // this.context.gt.add(this._loopFnPtr);
        
        const elapsed = time - this.startTime;
        
        // Update childs
        for (const obj of this._tmpObjs) {
            obj.tick(elapsed);
        }
        
        if (elapsed > 35000 && !this.isSuspending()) {
            this.suspend(1000);
        }
    }
    
    public arrange() {
        const font = this._context.fontti1;
        
        
        let black = new PIXI.Graphics();
        black.beginFill(0x000000);
        black.drawRect(0, 0, 640, 480);
        this._drawable.addChild(black);
        
        // 	PisteDraw2_Image_CutClip(kuva_tausta, 280, 80, 280, 80, 640, 480);
        const island = clipTSprite(this._bgBaseTexture, 280, 80, 640, 480);
        island.x = 280;
        island.y = 80;
        this._drawable.addChild(island);
        
        // Authors
        this.createText(this.tx.intro_a_game_by, font, 120, 200, AUTHORS_INI, AUTHORS_END);
        this.createText('janne kivilahti 2003', font, 120, 220, AUTHORS_INI + 200, AUTHORS_END + 200);
        this.createText(this.tx.intro_original, font, 120, 245, AUTHORS_INI + 400, AUTHORS_END + 400);
        this.createText('antti suuronen 1998', font, 120, 265, AUTHORS_INI + 500, AUTHORS_END + 500);
        this.createText('sdl porting by', font, 120, 290, AUTHORS_INI + 700, AUTHORS_END + 700);
        this.createText('samuli tuomola 2010', font, 120, 310, AUTHORS_INI + 800, AUTHORS_END + 800);
        this.createText('sdl2 port and bug fixes', font, 120, 335, AUTHORS_INI + 900, AUTHORS_END + 900);
        this.createText('danilo lemos 2017', font, 120, 355, AUTHORS_INI + 1000, AUTHORS_END + 1000);
        this.createText('web porting by', font, 120, 380, AUTHORS_INI + 1100, AUTHORS_END + 1100);
        this.createText('juande martos 2019', font, 120, 400, AUTHORS_INI + 1200, AUTHORS_END + 1200);
        
        // Testers
        this.createText(this.tx.intro_tested_by, font, 120, 230, TESTERS_INI, TESTERS_END);
        this.createText('antti suuronen', font, 120, 250, TESTERS_INI + 100, TESTERS_END + 100);
        this.createText('toni hurskainen', font, 120, 260, TESTERS_INI + 200, TESTERS_END + 200);
        this.createText('juho rytkönen', font, 120, 270, TESTERS_INI + 300, TESTERS_END + 300);
        this.createText('annukka korja', font, 120, 280, TESTERS_INI + 400, TESTERS_END + 400);
        this.createText(this.tx.intro_thanks_to, font, 120, 300, TESTERS_INI + 700, TESTERS_END + 700);
        this.createText('oskari raunio', font, 120, 310, TESTERS_INI + 700, TESTERS_END + 700);
        this.createText('assembly organization', font, 120, 320, TESTERS_INI + 700, TESTERS_END + 700);
        
        // Translator
        this.createText(this.tx.intro_translation, font, 120, 230, TRANSLATOR_INI, TRANSLATOR_END);
        this.createText(this.tx.intro_translator, font, 120, 250, TRANSLATOR_INI + 200, TRANSLATOR_END + 200);
    }
    
    public createText(str: string, font, x, y, iT, eT) {
        const dw = IntroText.create(this._context, str, font, x, y, iT, eT);
        this._tmpObjs.push(dw);
        this._drawable.addChild(dw.getDrawable());
        return dw;
    }
}
