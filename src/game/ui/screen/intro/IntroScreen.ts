import { PkInputEvent } from '@fwk/core/input/PkInputEvent';
import { PkInput } from '@fwk/core/PkInput';
import { DwSprite } from '@fwk/drawable/dw/DwSprite';
import { Bitmap } from '@fwk/shared/bx-bitmap';
import { PkEasing } from '@fwk/support/PkEasing';
import { PkPaletteBitmapResource } from '@fwk/texture/PkPaletteBitmapResource';
import { PkAudio, PkAudioType } from '@fwk/types/audio/PkAudio';
import { PkRectangle } from '@fwk/types/PkRectangle';
import { PkUIEffectDelay } from '@fwk/ui/effect/PkUIEffectDelay';
import { PkUIEffectFadeIn } from '@fwk/ui/effect/PkUIEffectFadeIn';
import { PkUIEffectFadeOut } from '@fwk/ui/effect/PkUIEffectFadeOut';
import { PkUIEffectMove } from '@fwk/ui/effect/PkUIEffectMove';
import { PkIntent } from '@fwk/ui/PkScreen';
import { PekkaContext } from '@game/PekkaContext';
import { int } from '@game/support/types';
import { TX } from '@game/texts';
import { UIDwBoard } from '@game/ui/component/UIDwBoard';
import { UIPanel } from '@game/ui/component/UIPanel';
import { UIPlainText } from '@game/ui/component/UIPlainText';
import { Screen } from '@game/ui/screen/Screen';
import { GAMELOOP_TIME } from '@sp/computed';

// Time table
const FADE = 1000;
const LOGO_F = 250 * GAMELOOP_TIME;
const LOGO_T = 500 * GAMELOOP_TIME;
const DEVS_F = LOGO_T + 80 * GAMELOOP_TIME;
const DEVS_T = DEVS_F + 720 * GAMELOOP_TIME;
const TESTERS_F = DEVS_T + 80 * GAMELOOP_TIME;
const TESTERS_T = TESTERS_F + 700 * GAMELOOP_TIME;
const TRANSLATORS_F = TESTERS_T + 100 * GAMELOOP_TIME;
const TRANSLATORS_T = TRANSLATORS_F + 300 * GAMELOOP_TIME;

export class IntroScreen extends Screen {
    private readonly _island: UIDwBoard;
    private readonly _logo: UIDwBoard;
    private readonly _credits: UIPanel;
    private _blinkTimer;
    
    public static async create(context: PekkaContext) {
        return await (new IntroScreen(context))._inialize();
    }
    
    private constructor(context: PekkaContext) {
        super(context);
        
        this._island = new UIDwBoard(context);
        this._logo = new UIDwBoard(context);
        this._credits = new UIPanel(context);
        
        this._blinkTimer = 0;
        
        this.on(PkInput.EV_KEYDOWN, (ev: PkInputEvent) => {
            this.suspend(1000);
        });
    }
    
    private async _inialize(): Promise<this> {
        // Prepare graphics
        const bitmap = await PkPaletteBitmapResource.fetch(['/assets/gfx/intro.bmp'], this.context);
        
        const bgTex = bitmap.getTexture(PkRectangle.$(280, 80, 360, 400));
        const blinkEyesTex = bitmap.getTexture(PkRectangle.$(242, 313, 33, 119));
        this._island
            .add(new DwSprite().setTexture(bgTex))
            .add(new DwSprite().setTexture(blinkEyesTex).setPosition(73, 233))
            .setVisible(false)
            .addTo(this);
        
        const logoTex = bitmap.getTexture(PkRectangle.$(37, 230, 157, 212));
        this._logo.add(new DwSprite().setTexture(logoTex))
            .setVisible(false)
            .addTo(this);
        
        // Add a container for the credits for cleaning purposes
        this._credits.addTo(this);
        
        return this;
    }
    
    public async resume(): Promise<this> {
        // Call super without fade
        await super.resume(0);
        
        // Reset and star animation
        this._play();
        // Play the music
        this.context.audio.playXM('music/intro.xm');
        
        return this;
    }
    
    public async suspend(ms: number = 0, intent?: PkIntent): Promise<this> {
        await super.suspend(ms, intent);
        // Stop the music
        this.context.audio.stopMusic();
        return this;
    }
    
    
    ///  Graphics  ///
    
    /**
     * @inheritDoc
     */
    public tick(delta: number, time: number) {
        super.tick(delta, time);
        
        // Pekka blinks eyes for 10 ticks every 8 secons aprox
        this._blinkTimer++;
        if (Math.floor(this._blinkTimer / 10) % 50 === 0) {
            this._island.get(1).setVisible(true);
        } else {
            this._island.get(1).setVisible(false);
        }
    }
    
    private _play() {
        // Reset
        this._blinkTimer = 0;
        this._island.cancelEffects().hide().setPosition(280, 80);
        this._logo.cancelEffects().hide().setPosition(60, 230);
        this._credits.clean();
        
        // Show island
        this._island.applyEffect(PkUIEffectFadeIn.for(1000));
        
        // Animate logo
        this._logo.applyEffect(
            PkUIEffectDelay.for(LOGO_F)
                .then(
                    PkUIEffectFadeIn.for(800),
                    PkUIEffectMove.for(1500, 60, 0, PkEasing.outCubic),
                    PkUIEffectDelay.for(LOGO_T - LOGO_F - 1000)
                        .then(PkUIEffectFadeOut.for(1000, PkEasing.inCubic))));
        
        // Presents...
        this.introText(230, 400, TX.INTRO_PRESENTS, true, LOGO_F, LOGO_T - 20 * 16.6);
        
        // Authors
        this.introText(120, 200, TX.INTRO_A_GAME_BY, true, DEVS_F, DEVS_T);
        this.introText(120, 216, 'janne kivilahti 2003', false, DEVS_F + 200, DEVS_T + 200);
        this.introText(120, 245, TX.INTRO_ORIGINAL, true, DEVS_F + 400, DEVS_T + 400);
        this.introText(120, 261, 'antti suuronen 1998', false, DEVS_F + 500, DEVS_T + 500);
        this.introText(120, 290, 'sdl porting by', false, DEVS_F + 700, DEVS_T + 700);
        this.introText(120, 306, 'samuli tuomola 2010', false, DEVS_F + 800, DEVS_T + 800);
        this.introText(120, 335, 'sdl2 port and bug fixes', false, DEVS_F + 900, DEVS_T + 900);
        this.introText(120, 351, 'danilo lemos 2017', false, DEVS_F + 1000, DEVS_T + 1000);
        this.introText(120, 380, 'web version by', false, DEVS_F + 1100, DEVS_T + 1100);
        this.introText(120, 396, 'juande martos 2020', false, DEVS_F + 1200, DEVS_T + 1200);
        
        // Testers
        this.introText(120, 230, TX.INTRO_TESTED_BY, true, TESTERS_F, TESTERS_T);
        this.introText(120, 246, 'antti suuronen', false, TESTERS_F + 100, TESTERS_T + 100);
        this.introText(120, 259, 'toni hurskainen', false, TESTERS_F + 200, TESTERS_T + 200);
        this.introText(120, 272, 'juho rytkönen', false, TESTERS_F + 300, TESTERS_T + 300);
        this.introText(120, 285, 'annukka korja', false, TESTERS_F + 400, TESTERS_T + 400);
        this.introText(120, 315, TX.INTRO_THANKS_TO, true, TESTERS_F + 700, TESTERS_T + 700);
        this.introText(120, 331, 'oskari raunio', false, TESTERS_F + 700, TESTERS_T + 700);
        this.introText(120, 344, 'assembly organization', false, TESTERS_F + 700, TESTERS_T + 700);
        
        // Translator
        this.introText(120, 230, TX.INTRO_TRANSLATION, true, TRANSLATORS_F, TRANSLATORS_T);
        this.introText(120, 246, TX.INTRO_TRANSLATOR, true, TRANSLATORS_F + 200, TRANSLATORS_T + 200);
    }
    
    public introText(x: int, y: int, text: string, translate: boolean, from: int, to: int) {
        new UIPlainText(this.context, text, this.context.font1, translate, x, y)
            .setVisible(false)
            .applyEffect(PkUIEffectDelay.for(from)
                .then(PkUIEffectFadeIn.for(FADE)
                    .then(PkUIEffectDelay.for((to - from) - (FADE * 2))
                        .then(PkUIEffectFadeOut.for(FADE, PkEasing.inCubic)))))
            .addTo(this._credits);
    }
}
