import { uint, int, bool, FONTID } from '@game/support/types';
import { PkEngine } from '@ng/core/PkEngine';
import { DwImpl } from '@ng/drawable/impl-pixi/DwImpl';
import { PkTickable } from '@ng/support/PkTickable';
import { WEB_CANVAS_QS } from '@sp/constants';
import * as PIXI from 'pixi.js';
import { PkFontAsset } from '../types/font/PkFontAsset';
import { PkScreen } from '../ui/PkScreen';

export enum FADE {
    FADE_FAST = 5,
    FADE_NORMAL = 2,
    FADE_SLOW = 1
}

export class PkRenderer implements PkTickable {
    private static instance: PkRenderer;
    
    private readonly _canvas: HTMLCanvasElement;
    private readonly _renderer: PIXI.Renderer;
    private readonly _stage: PIXI.Container;
    
    private _screenIndex: Map<string, PkScreen>;
    private _activeScreen: PkScreen;
    
    
    private _nextScreen: PkScreen;
    
    private imageList: HTMLImageElement[] = [];
    private readonly fontList: Map<FONTID, PkFontAsset> = new Map<FONTID, PkFontAsset>();
    // SDL_Palette*  game_palette = NULL;
    
    
    private _alive = false;
    
    private fadeSpeed: int = 0;
    private alpha: int = 100;
    
    private XOffset = 0;
    
    public constructor(ng: PkEngine) {
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
            width: ng.device.screenWidth,
            height: ng.device.screenHeight
        });
        
        //  x  frameBuffer8 = SDL_CreateRGBSurface(0, width, height, 8, 0, 0, 0, 0);
        //  x  frameBuffer8->userdata = (void *)frameBuffer8->format->palette;
        //  x  frameBuffer8->format->palette = game_palette;
        //  x  SDL_SetColorKey(frameBuffer8, SDL_TRUE, 255);
        //  x  SDL_FillRect(frameBuffer8, NULL, 255);
        //  x  SDL_Rect r = {0, 0, width, height};
        //  x  SDL_SetClipRect(frameBuffer8, &r);
        
        this._stage = new PIXI.Container();
        
        this.adjustScreen();
    }
    
    public tick(delta: number, time: number): void {
        if (this._activeScreen != null) {
            this._activeScreen.tick(delta, time);
        }
    }
    
    private static deprecated(): void { throw new Error('DEPRECATED'); }
    
    private findfreeimage(): int {
        for (let i = 0; i < MAX_IMAGES; i++)
            if (this.imageList[i] == null)
                return i;
        return -1;
    }
    
    public setNextScreen(screen: PkScreen) {
        if (this._activeScreen == null) {
            this.setActiveScreen(screen);
            
            this._nextScreen = null;
        }
    }
    
    public setActiveScreen(screen: PkScreen) {
        this._stage.removeChildren();
        
        this._activeScreen = screen;
        this._stage.addChild((screen.getDrawable() as DwImpl<PIXI.DisplayObject>).pixi);
        
        //screen.show();
        
        //this.tmp();
        // this._renderer.render(this._stage);
    }
    
    public tmp() {
        //try{ window.pk2w._game.context.time.trigger(); } catch(r){}
        
        if (window.nor != true)
            this._renderer.render(this._stage);
        
        requestAnimationFrame(this.tmp.bind(this));
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
        
        this.clearFonts();
        
        // frameBuffer8->format->palette = (SDL_Palette *);
        // frameBuffer8->userdata;
        // SDL_FreeSurface(frameBuffer8);
        // SDL_DestroyRenderer(PD_Renderer);
        // SDL_DestroyWindow(PD_Window);
        //
        // if (window_icon != NULL) SDL_FreeSurface(window_icon);
        
        this._alive = false;
    }
    
    ///
    
    public add(screenId: string, screen: PkScreen) {
        this._screenIndex.set(screenId, screen);
    }
    
    public setActive(screenId: string) {
        const screen = this._screenIndex.get(screenId);
        
        if (screen != null && (screen.isOperating() || screen.isResuming())) {
            if (this._activeScreen != null) {
                this._activeScreen.setActive(false);
            }
            this._activeScreen = screen;
        }
    }
}