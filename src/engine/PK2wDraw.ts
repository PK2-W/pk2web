//#########################
//PisteEngine - PisteDraw
//by Janne Kivilahti from Piste Gamez
//#########################

import { PkScreen } from './screen/PkScreen';
import { WEB_CANVAS_QS } from '../support/constants';
// #pragma once
//
import { uint, int, bool, FONTID } from '../support/types';
import * as PIXI from '../vendor/pixi';
import { PkFont } from './PkFont';

// #include <SDL2/SDL.h>
// #include <vector>
//
// #include "PisteFont.hpp"
// #include "platform.hpp"
//

export enum FADE {
    FADE_FAST = 5,
    FADE_NORMAL = 2,
    FADE_SLOW = 1
}

// #define		PD_FILTER_NEAREST  "0"
// #define		PD_FILTER_BILINEAR "1"
//
// namespace Piste {
//

//
// #define		PD_FILTER_NEAREST  "0"
// #define		PD_FILTER_BILINEAR "1"
//
const MAX_IMAGES: int = 2000;
// const int MAX_FONTS = 20;
//


export class PK2wRenderer {
    private static instance: PK2wRenderer;
    
    private readonly _canvas: HTMLCanvasElement;
    private readonly _renderer: PIXI.SystemRenderer;
    private readonly _stage: PIXI.Container;
    
    private _activeScreen: PkScreen;
    private _nextScreen: PkScreen;
    
    // SDL_Surface*  frameBuffer8 = NULL;
    
    // SDL_Surface*  imageList[MAX_IMAGES];
    private imageList: HTMLImageElement[] = [];
    private readonly fontList: Map<FONTID, PkFont> = new Map<FONTID, PkFont>();
    // SDL_Palette*  game_palette = NULL;
    
    private screenWidth: int;
    private screenHeight: int;
    // SDL_Rect Screen_dest = {0, 0, 0, 0};
    // bool ScreenFit = false;
    
    private _alive = false;
    
    private fadeSpeed: int = 0;
    private alpha: int = 100;
    
    private XOffset = 0;
    
    public constructor(width: int, height: int) {
        //     if (game_palette == NULL) {
        //         game_palette = SDL_AllocPalette(256);
        //         for(int i = 0; i < 256; i++) game_palette->colors[i] = {(Uint8)i,(Uint8)i,(Uint8)i,(Uint8)i};
        //     }
        //
        
        this._alive = true;
        
        this._canvas = document.querySelector(WEB_CANVAS_QS);
        if (!this._canvas) {
            throw new Error(`Cannot find the CANVAS element ("${ WEB_CANVAS_QS }").`);
        }
        
        this._renderer = PIXI.autoDetectRenderer({
            view: this._canvas,
            antialias: true,
            width: 640,
            height: 480
        });
        
        //  x  frameBuffer8 = SDL_CreateRGBSurface(0, width, height, 8, 0, 0, 0, 0);
        //  x  frameBuffer8->userdata = (void *)frameBuffer8->format->palette;
        //  x  frameBuffer8->format->palette = game_palette;
        //  x  SDL_SetColorKey(frameBuffer8, SDL_TRUE, 255);
        //  x  SDL_FillRect(frameBuffer8, NULL, 255);
        //  x  SDL_Rect r = {0, 0, width, height};
        //  x  SDL_SetClipRect(frameBuffer8, &r);
        
        this._stage = new PIXI.Container();
        
        this.screenWidth = width;
        this.screenHeight = height;
        this.adjustScreen();
    }
    
    /** @deprecated now screens are autonomous */
    public PisteDraw2_IsFading() { PK2wRenderer.deprecated(); }
    
    /** @deprecated now screens are autonomous */
    public PisteDraw2_FadeOut() { PK2wRenderer.deprecated(); }
    
    /** @deprecated now screens are autonomous */
    public fadeOut() { PK2wRenderer.deprecated(); }
    
    /** @deprecated now screens are autonomous */
    public fadeIn() { PK2wRenderer.deprecated(); }
    
    private static deprecated(): void { throw new Error('DEPRECATED'); }
    
    private findfreeimage(): int {
        for (let i = 0; i < MAX_IMAGES; i++)
            if (this.imageList[i] == null)
                return i;
        return -1;
    }
    
    // void PisteDraw2_RotatePalette(BYTE start, BYTE end);
    
    
    /** @deprecated */
    public PisteDraw2_Image_New(/*int w, int h*/) { PK2wRenderer.deprecated(); }
    /** @deprecated */
    public PisteDraw2_Image_Load(/*filename: string/*, bool getPalette*/) { PK2wRenderer.deprecated(); }
    /** @deprecated */
    public PisteDraw2_Image_Copy(/*int src_i, int dst_i*/) { PK2wRenderer.deprecated(); }
    /** @deprecated */
    public PisteDraw2_Image_Cut(/*int ImgIndex, int x, int y, int w, int h*/) { PK2wRenderer.deprecated(); }
    //public PisteDraw2_Image_Cut(/*int ImgIndex, PD_RECT area*/) { PK2wRenderer.deprecated(); }
    /** @deprecated */
    public PisteDraw2_Image_Clip(/*int index, int x, int y*/) { PK2wRenderer.deprecated(); }
    /** @deprecated */
    public PisteDraw2_Image_ClipTransparent(/*int index, int x, int y, int alpha*/) { PK2wRenderer.deprecated(); }
    /** @deprecated */
    public PisteDraw2_Image_CutClip(/*int index, int dstx, int dsty, int srcx, int srcy, int oikea, int ala*/) { PK2wRenderer.deprecated(); }
    //public PisteDraw2_Image_CutClip(/*int index, PD_RECT srcrect, PD_RECT dstrect*/) { PK2wRenderer.deprecated(); }
    /** @deprecated */
    public PisteDraw2_Image_CutClipTransparent(/*int index, PD_RECT srcrect, PD_RECT dstrect, int alpha*/) { PK2wRenderer.deprecated(); }
    //public PisteDraw2_Image_CutClipTransparent(/*int index, PD_RECT srcrect, PD_RECT dstrect, int alpha, int colorsum*/) { PK2wRenderer.deprecated(); }
    /** @deprecated */
    public PisteDraw2_Image_GetSize(/*int index, int& w, int& h*/) { PK2wRenderer.deprecated(); }
    /** @deprecated */
    public PisteDraw2_Image_FlipHori(/*int index*/) { PK2wRenderer.deprecated(); }
    /** @deprecated */
    public PisteDraw2_Image_Snapshot(/*int index*/) { PK2wRenderer.deprecated(); }
    /** @deprecated */
    public PisteDraw2_Image_Delete(/*int& index*/) { PK2wRenderer.deprecated(); }
    
    // int PisteDraw2_ImageFill(int index, BYTE color) { PK2wRenderer.deprecated(); }
    // int PisteDraw2_ImageFill(int index, int posx, int posy, int oikea, int ala, BYTE color) { PK2wRenderer.deprecated(); }
    // int PisteDraw2_ScreenFill(BYTE color) { PK2wRenderer.deprecated(); }
    // int PisteDraw2_ScreenFill(int posx, int posy, int oikea, int ala, BYTE color) { PK2wRenderer.deprecated(); }
    // void PisteDraw2_SetMask(int x, int y, int w, int h) { PK2wRenderer.deprecated(); }
    //
    // int PisteDraw2_DrawScreen_Start(BYTE *&pixels, DWORD &pitch);
    // int PisteDraw2_DrawScreen_End();
    // int PisteDraw2_DrawImage_Start(int index, BYTE *&pixels, DWORD &pitch);
    // int PisteDraw2_DrawImage_End(int index);
    // BYTE PisteDraw2_BlendColors(BYTE color, BYTE colBack,int alpha);
    //
    
    // Never used
    // int PisteDraw2_Font_Create(int image, int x, int y, int width, int height, int count);
    
    /** @deprecated use {@link createFont} */
    public async PisteDraw2_Font_Create(uri: string): Promise<FONTID> {
        return this.createFont(uri);
    }
    
    public async createFont(uri: string): Promise<FONTID> {
        console.log(`PD     - Creating font from "${ uri }"`);
        
        try {
            const font = await PkFont.load(uri);
            this.fontList.set(font.iid, font);
            return font.iid;
            
        } catch (err) {
            console.warn(`PD     - Font couldn't be loaded from "${ uri }"`);
            throw err;
        }
    }
    
    // int PisteDraw2_Font_Write(int font_index, const char* text, int x, int y);
    // int PisteDraw2_Font_WriteAlpha(int font_index, const char* text, int x, int y, BYTE alpha);
    
    // int PisteDraw2_SetFilter(const char* filter);
    // void PisteDraw2_FullScreen(bool set);
    
    public setNextScreen(screen: PkScreen) {
        if (this._activeScreen == null) {
            this.setActiveScreen(screen);
            
            this._nextScreen = null;
        }
    }
    
    public setActiveScreen(screen: PkScreen) {
        this._stage.removeChildren();
        this._stage.addChild(screen.getDrawable());
        
        //screen.show();
        
        //this.tmp();
        // this._renderer.render(this._stage);
    }
    
    public tmp() {
        requestAnimationFrame(() => this.tmp());
        
        this._renderer.render(this._stage);
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
    
    // void PisteDraw2_FitScreen(bool fit);
    // void PisteDraw2_ChangeResolution(int w, int h);
    //
    // void PisteDraw2_GetWindowPosition(int* x, int* y);
    //
    // int PisteDraw2_GetXOffset();
    // void PisteDraw2_SetXOffset(int x);
    // int PisteDraw2_Start(int width, int height, const char* name, const char* icon);
    
    public clearFonts(): void {
        this.fontList.clear();
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
    
    public PisteDraw2_Update(draw: bool) {
        if (!this._alive) return;
        
        if (draw) {
            // SDL_Texture* texture;
            // BYTE alpha = (BYTE)(PD_alpha*255/100);
            //
            // texture = SDL_CreateTextureFromSurface(PD_Renderer,frameBuffer8);
            // SDL_SetTextureColorMod(texture,alpha,alpha,alpha);
            //
            // SDL_RenderClear(PD_Renderer);
            //
            // if(ScreenFit)
            //     SDL_RenderCopy(PD_Renderer, texture, NULL, NULL);
            // else
            //     SDL_RenderCopy(PD_Renderer, texture, NULL, &Screen_dest);
            //
            // PisteInput_DrawGui(alpha);
            //
            // SDL_RenderPresent(PD_Renderer);
            //
            // SDL_DestroyTexture(texture);
            //if (this.PisteDraw2_IsFading()) {
            // this.alpha += this.fadeSpeed;
            // if (this.alpha < 0) this.alpha = 0;
            // if (this.alpha > 255) this.alpha = 255;
            //}
            
            // SDL_Rect r = {0, 0, XOffset, PD_screen_height}; // Fill the unused borders
            // SDL_FillRect(frameBuffer8, &r, 0);
            // r.x = PD_screen_width - XOffset;
            // SDL_FillRect(frameBuffer8, &r, 0);
        }
    }
    
    // void* PisteDraw2_GetRenderer();
    
    public getFont(fontId: FONTID): PkFont {
        return this.fontList.get(fontId);
    }
}

type RECT = {
    x: uint;
    y: uint;
    w: uint;
    h: uint;
};
