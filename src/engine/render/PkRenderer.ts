import { PkInputEvent } from '@ng/core/input/PkInputEvent';
import { PkEngine } from '@ng/core/PkEngine';
import { PkInput } from '@ng/core/PkInput';
import { Log } from '@ng/support/log/LoggerImpl';
import { PkTickable } from '@ng/support/PkTickable';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { WEB_CONTAINER } from '@sp/constants';
import * as PIXI from 'pixi.js';
import { PkScreen } from '../ui/PkScreen';

export enum FADE {
    FADE_FAST = 5,
    FADE_NORMAL = 2,
    FADE_SLOW = 1
}

/**
 * TODO: Move to WindowManager or something else
 */
export class PkRenderer implements PkTickable {
    private readonly _engine: PkEngine;
    
    private readonly _canvas: HTMLCanvasElement;
    private readonly _renderer: PIXI.Renderer;
    private readonly _stage: PIXI.Container;
    
    private _screenIndex: Map<string, PkScreen>;
    private _activeScreen: PkScreen;
    
    /** @deprecated */
    private _nextScreen: PkScreen;
    
    private imageList: HTMLImageElement[] = [];
    // SDL_Palette*  game_palette = NULL;
    
    private _alive = false;
    
    public constructor(engine: PkEngine) {
        this._engine = engine;
        //     if (game_palette == NULL) {
        //         game_palette = SDL_AllocPalette(256);
        //         for(int i = 0; i < 256; i++) game_palette->colors[i] = {(Uint8)i,(Uint8)i,(Uint8)i,(Uint8)i};
        //     }
        //
        
        this._screenIndex = new Map();
        
        this._alive = true;
        
        this._canvas = document.querySelector(WEB_CANVAS_QS);
        if (!this._canvas) {
            throw new Error(`Cannot find the CANVAS element ("${ WEB_CANVAS_QS }").`);
        }
        
        this._renderer = PIXI.autoDetectRenderer({
            view: this._canvas,
            antialias: true,
            width: engine.device.screenWidth,
            height: engine.device.screenHeight
        });
        
        this._stage = new PIXI.Container();
        
        this.adjustScreen();
        
        this._engine.input.on(PkInput.EV_KEYDOWN, (ev: PkInputEvent) => {
            let component: PkUIComponent = this._activeScreen?.focusedComponent;
            if (component == null) {
                component = this._activeScreen;
            }
            while (component != null && ev.propagate) {
                component.emit(PkInput.EV_KEYDOWN, ev);
                component = component.parent;
            }
        });
    }
    
    public tick(delta: number, time: number): void {
        /*if (this._activeScreen != null) {
         this._activeScreen.tick(delta, time);
         }*/
        
        for (let scr of this._screenIndex.values()) {
            if (!scr.isSuspended()) {
                scr.tick(delta, time);
            }
        }
    }
    
    private _fpsPrev = performance.now();
    private _fpsAvg = [];
    private _fpsAvgDisplay = 0;
    
    public renderTick() {
        //try{ window.pk2w._game.context.time.trigger(); } catch(r){}
        
        if (window.nor != true)
            this._renderer.render(this._stage);
        
        requestAnimationFrame(this.renderTick.bind(this));
        
        const now = performance.now();
        const delta = now - this._fpsPrev;
        this._fpsPrev = now;
        this._fpsAvg.push(1000 / delta);
        if (this._fpsAvg.length > 10) this._fpsAvg.shift();
        
        this._fpsAvgDisplay += delta;
        if (this._fpsAvgDisplay > 1000) {
            this._fpsAvgDisplay = 0;
            const avg = this._fpsAvg.reduce((p, c) => p + c, 0) / (this._fpsAvg.length);
            Log.fast('Frame rate', Math.round(avg) + ' fps (~' + (Math.round(avg / 60 * 10) / 10) + ')');
        }
    }
    
    ///
    
    public add(screenId: string, screen: PkScreen) {
        this._screenIndex.set(screenId, screen);
        this._stage.addChild(screen.getDrawable().pixi);
    }
    
    public setActive(screenId: string) {
        const screen = this._screenIndex.get(screenId);
        
        if (screen != null && (screen.isOperating() || screen.isResuming())) {
            if (this._activeScreen != null) {
                this._activeScreen.setActive(false);
            }
            this._activeScreen = screen.setActive(true);
        }
    }
    
    
    ///  Rubish  ///
    
    public destroy(): void {
        if (!this._alive) return;
        
        // int;
        // i, j;
        //
        // for (i = 0; i < MAX_IMAGES; i++)
        //     if (imageList[i] != NULL) {
        //         j = i;
        //         PisteDraw2_Image_Delete(j);
        //     }
        
        
        // frameBuffer8->format->palette = (SDL_Palette *);
        // frameBuffer8->userdata;
        // SDL_FreeSurface(frameBuffer8);
        // SDL_DestroyRenderer(PD_Renderer);
        // SDL_DestroyWindow(PD_Window);
        //
        // if (window_icon != NULL) SDL_FreeSurface(window_icon);
        
        this._alive = false;
    }
    
    private adjustScreen(): void {
        // int w, h;
        // SDL_GetWindowSize(PD_Window, &w, &h);
        //
        // float screen_prop = (float)w / h;
        // float buff_prop   = (float)PD_screen_width / PD_screen_height;
        // if (buff_prop > screen_prop) {
        //     Screen_dest.w = w;
        //     Screen_dest.h = (int)(h / buff_prop);
        //     Screen_dest.x = 0;
        //     Screen_dest.y = (int)((h - Screen_dest.h) / 2);
        // }
        // else {
        //     Screen_dest.w = (int)(buff_prop * h);
        //     Screen_dest.h = h;
        //     Screen_dest.x = (int)((w - Screen_dest.w) / 2);
        //     Screen_dest.y = 0;
        // }
    }
    
    /** @deprecated */
    public setActiveScreen(screen: PkScreen) {
        this._stage.removeChildren();
        
        this._activeScreen = screen;
        // this._stage.addChild((screen.getDrawable() as DwImpl<PIXI.DisplayObject>).pixi);
        
        //screen.show();
        
        //this.tmp();
        // this._renderer.render(this._stage);
    }
}