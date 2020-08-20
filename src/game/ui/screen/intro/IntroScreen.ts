import { PekkaContext } from '@game/PekkaContext';
import { int } from '@game/support/types';
import { TX } from '@game/texts';
import { IntroText } from '@game/ui/screen/intro/IntroText';
import { Screen } from '@game/ui/screen/Screen';
import { DwSpriteImpl } from '@ng/drawable/impl-pixi/DwSpriteImpl';
import { DwSprite } from '@ng/drawable/skeleton/DwSprite';
import { Log } from '@ng/support/log/LoggerImpl';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';
import { PkFont } from '@ng/types/font/PkFont';
import { PkRectangleImpl } from '@ng/types/pixi/PkRectangleImpl';
import { PkImageTexture } from '@ng/types/PkImageTexture';
import { PkUIEffectDelay } from '@ng/ui/effect/PkUIEffectDelay';
import { PkUIEffectFadeIn } from '@ng/ui/effect/PkUIEffectFadeIn';
import { PkUIEffectFadeOut } from '@ng/ui/effect/PkUIEffectFadeOut';
import { INTRO_DURATION, RESOURCES_PATH } from '@sp/constants';

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
    
    private _bgBaseTexture: PkImageTexture;
    
    
    private _tmpObjs = [];
    
    
    public static create(context: PekkaContext) {
        return new IntroScreen(context);
    }
    
    public show() {
        //super.show();
        this.start();
        
        return this;
    }
    
    public async start() {
        this.startTime = this.context.time.now();
        
        Log.d(`[${ IntroScreen.name }] Initializing intro screen`);
        
        // 		kuva_tausta = PisteDraw2_Image_Load("gfx/intro.bmp", true);
        // const ld = await PK2wImageLoader.load('gfx/intro.bmp');
        const image = await PkAssetTk.getImage(RESOURCES_PATH + 'gfx/intro.bmp');
        this._bgBaseTexture = image.getTexture(PkRectangleImpl.$(280, 80, 640 - 280, 480 - 80));
        
        //Log.d(`[${ IntroScreen.name }] Loading music: music/INTRO.XM`);
        
        // this._context.audio.playXM('music/intro.xm');
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
    
    protected doSuspend() {
        this.context.audio.stopMusic();
    }
    
    
    ///  Graphics  ///
    
    public tick(delta: number, time: number) {
        super.tick(delta, time);
        
        const elapsed = time - this.lastResumeTime;
        
        // Update childs
        for (const obj of this._tmpObjs) {
            obj.tick(elapsed);
        }
        
        if (elapsed > INTRO_DURATION && !this.isSuspending()) {
            this.suspend(1000);
        }
    }
    
    public arrange() {
        const font = this.context.font1;
        
        // let black = new PIXI.Graphics();
        // black.beginFill(0x000000);
        // black.drawRect(0, 0, 640, 480);
        // this.addChil(black);
        
        // 	PisteDraw2_Image_CutClip(kuva_tausta, 280, 80, 280, 80, 640, 480);
        // const island = clipTSprite(this._bgBaseTexture, 280, 80, 640, 480);
        const spr: DwSprite = (new DwSpriteImpl() as DwSprite)
            .setPosition(280, 80)
            .setTexture(this._bgBaseTexture);
        this._drawable.add(spr);
        
        // Authors
        this.createText(this.tx.get(TX.INTRO_A_GAME_BY), font, 120, 200, AUTHORS_INI, AUTHORS_END);
        this.createText('janne kivilahti 2003', font, 120, 220, AUTHORS_INI + 200, AUTHORS_END + 200);
        this.createText(this.tx.get(TX.INTRO_ORIGINAL), font, 120, 245, AUTHORS_INI + 400, AUTHORS_END + 400);
        this.createText('antti suuronen 1998', font, 120, 265, AUTHORS_INI + 500, AUTHORS_END + 500);
        this.createText('sdl porting by', font, 120, 290, AUTHORS_INI + 700, AUTHORS_END + 700);
        this.createText('samuli tuomola 2010', font, 120, 310, AUTHORS_INI + 800, AUTHORS_END + 800);
        this.createText('sdl2 port and bug fixes', font, 120, 335, AUTHORS_INI + 900, AUTHORS_END + 900);
        this.createText('danilo lemos 2017', font, 120, 355, AUTHORS_INI + 1000, AUTHORS_END + 1000);
        this.createText('web porting by', font, 120, 380, AUTHORS_INI + 1100, AUTHORS_END + 1100);
        this.createText('juande martos 2019', font, 120, 400, AUTHORS_INI + 1200, AUTHORS_END + 1200);
        
        // Testers
        this.createText(this.tx.get(TX.INTRO_TESTED_BY), font, 120, 230, TESTERS_INI, TESTERS_END);
        this.createText('antti suuronen', font, 120, 250, TESTERS_INI + 100, TESTERS_END + 100);
        this.createText('toni hurskainen', font, 120, 260, TESTERS_INI + 200, TESTERS_END + 200);
        this.createText('juho rytkönen', font, 120, 270, TESTERS_INI + 300, TESTERS_END + 300);
        this.createText('annukka korja', font, 120, 280, TESTERS_INI + 400, TESTERS_END + 400);
        this.createText(this.tx.get(TX.INTRO_THANKS_TO), font, 120, 300, TESTERS_INI + 700, TESTERS_END + 700);
        this.createText('oskari raunio', font, 120, 310, TESTERS_INI + 700, TESTERS_END + 700);
        this.createText('assembly organization', font, 120, 320, TESTERS_INI + 700, TESTERS_END + 700);
        
        // Translator
        this.createText(this.tx.get(TX.INTRO_TRANSLATION), font, 120, 230, TRANSLATOR_INI, TRANSLATOR_END);
        this.createText(this.tx.get(TX.INTRO_TRANSLATOR), font, 120, 250, TRANSLATOR_INI + 200, TRANSLATOR_END + 200);
    }
    
    public createText(str: string, font: PkFont, x: int, y: int, iT: int, eT: int) {
        let component = IntroText
            .create(this.context, str, font, x, y, iT, eT)
            .applyEffect(PkUIEffectDelay.for(iT)
                .then(PkUIEffectFadeIn.for(6000)
                    .then(PkUIEffectDelay.for(eT - iT - 6000)
                        .then(PkUIEffectFadeOut.for(6000)))));
        
        this.add(component);
    }
}
