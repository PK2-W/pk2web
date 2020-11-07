import { PkInputEvent } from '@ng/core/input/PkInputEvent';
import { PkEngine } from '@ng/core/PkEngine';
import { PkInput } from '@ng/core/PkInput';
import { PkError } from '@ng/error/PkError';
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
    
    private readonly _container: HTMLDivElement;
    private readonly _canvas: HTMLCanvasElement;
    private readonly _renderer: PIXI.Renderer;
    private readonly _stage: PIXI.Container;
    
    private _screens: PkScreen[];
    private _activeScreen: PkScreen;
    
    /** @deprecated */
    private _nextScreen: PkScreen;
    
    private imageList: HTMLImageElement[] = [];
    // SDL_Palette*  game_palette = NULL;
    
    public constructor(engine: PkEngine) {
        this._engine = engine;
        
        this._screens = [];
        
        this._container = document.querySelector(WEB_CONTAINER);
        if (!this._container) {
            throw new Error(`Cannot find the game container element $(${ WEB_CONTAINER }).`);
        }
        
        this._canvas = document.createElement('canvas');
        this._container.appendChild(this._canvas);
        
        this._renderer = PIXI.autoDetectRenderer({
            view: this._canvas,
            antialias: false,
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
        
        window.addEventListener('resize', this.adjustScreen.bind(this));
    }
    
    public tick(delta: number, time: number): void {
        /*if (this._activeScreen != null) {
         this._activeScreen.tick(delta, time);
         }*/
        
        for (let scr of this._screens) {
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
    
    public add2(...screens: PkScreen[]) {
        for (let screen of screens) {
            this._screens.push(screen);
            this._stage.addChild(screen.getDrawable().pixi);
        }
    }
    
    public setActive(screen: PkScreen) {
        // Given screen must be managed
        if (!this._screens.includes(screen)) {
            throw new PkError(`Screen to activate is not managed by ${ PkRenderer.name }.`);
        }
        
        if (screen != null && (screen.isOperating() || screen.isResuming())) {
            if (this._activeScreen != null) {
                this._activeScreen.setActive(false);
            }
            this._activeScreen = screen.setActive(true);
        }
    }
    
    
    ///  Rubish  ///
    
    private adjustScreen(): void {
        let height = 480;
        let width = height / 9 * 16;
        
        if (width + 10 > this._container.clientWidth) {
            width = this._container.clientWidth - 10;
        }
        
        window.tempW = width;
        window.tempH = height;
        
        this._canvas.width = width;
        this._canvas.height = height;
        
        this._renderer.resize(width, height);
        
        if (window.scaled) {
            height = 480;
            width = height / this._container.clientHeight * (this._container.clientWidth + 4);
            
            window.tempW = width;
            window.tempH = height;
            
            this._canvas.width = width;
            this._canvas.height = height;
            
            this._renderer.resize(width, height);
            
            const scale = this._container.clientHeight / 480;
            
            this._canvas.style.transform = `translate(-50%, -50%) scale(${ scale })`;
        }
    }
}