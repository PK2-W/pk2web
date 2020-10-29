//#########################
//PisteEngine
//by Janne Kivilahti from Piste Gamez
//#########################

import { int, SCREENID } from '@game/support/types';
import { PkDevice } from '@ng/core/PkDevice';
import { PkInput } from '@ng/core/PkInput';
import { PkFilesystem } from '@ng/filesystem/PkFilesystem';
import { PK2GAMELOOP } from '@sp/constants';
import { PkLanguage } from '../PkLanguage';
import { PkRenderer } from '../render/PkRenderer';
import { PkScreen } from '../ui/PkScreen';
import { GameTimer } from './GameTimer';
import { PK2wSound } from './PK2wSound';

export class PkEngine {
    private readonly _device: PkDevice;
    private readonly _filesystem: PkFilesystem;
    
    private _screens: Map<int, PkScreen>;
    private _tmpScreen: PkScreen;
    
    private gameLogicFnPtr: () => void;
    
    // private ready :bool= false;
    private running: boolean = false;
    
    private avrg_fps: number = 0;
    
    private debug: boolean = false;
    private draw: boolean = true;
    
    private last_time: int = 0;
    // Count how much frames elapsed without draw
    private count: number = 0;
    private real_fps: number = 0;
    
    public readonly clock: GameTimer;
    private readonly _language: PkLanguage;
    private readonly _rendr: PkRenderer;
    private readonly _input: PkInput;
    private readonly _audio: PK2wSound;
    
    
    // TODO bx: throw custom error -> printf("PK2    - Failed to init PisteEngine.\n");
    public constructor() {
        this._device = new PkDevice();
        this._filesystem = new PkFilesystem();
        
        // 	if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO) < 0) {
        // 		printf("Unable to init SDL: %s\n", SDL_GetError());
        // 		return;
        // 	}
        
        this.clock = new GameTimer(PK2GAMELOOP); // Windows "system timer" has a resolution of 10~16 ms = 62.5 tps
        this._language = new PkLanguage();
        this._input = new PkInput(this);
        this._audio = new PK2wSound(this);
        this._rendr = new PkRenderer(this);
        
        this._screens = new Map<SCREENID, PkScreen>();
    }
    
    
    ///  Screen Management  ///
    
    public registerScreen(id: int, screen: PkScreen): PkScreen {
        this._screens.set(id, screen);
        return screen;
    }
    
    
    ///
    
    public destroy() {
        this.clock.stop();
        
        this.rendr.destroy();
        // 	PisteInput_Exit();
        // 	PisteSound_End();
        // 	SDL_Quit();
        // 	ready = false;
        //
    }
    
    /** @deprecated */
    public loop(gameLogic: () => void) {
        
        let last_time: int = 0;
        let count: int = 0; // Count how much frames elapsed
        let real_fps: number = 0;
        
        this.running = true;
        
        while (this.running) {
            
            count++;
            
            // 		GameLogic();
            // 		logic();
            //
            // 		if (draw) {
            // 			real_fps = 1000.f / (SDL_GetTicks() - last_time);
            // 			real_fps *= count;
            // 			avrg_fps = avrg_fps*0.8 + real_fps*0.2;
            // 			last_time = SDL_GetTicks();
            // 			count = 0;
            // 		}
            
            this.draw = true; // TODO - Set false if the game gets slow
        }
        
    }
    
    /**
     * FIXME
     *  Check and change
     *  "gamelogic" is never used, but gt is required
     *
     * @param gameLogic
     * @param context
     */
    public start(gameLogic: () => void, context: any) {
        if (this.running)
            return;
        
        this.gameLogicFnPtr = gameLogic.bind(context);
        this.running = true;
        
        this.clock.start();
        
        this.clock.add(this._screenTick.bind(this));
        this._rendr.renderTick();
        //this.loop2();
    }
    
    private _screenTick(delta: number, time: number) {
        this.clock.add(this._screenTick.bind(this));
        this._rendr.tick(delta, time);
    }
    
    // TODO: separe gf. loop from gameloop
    private loop2() {
        if (!this.running)
            return;
        
        const ts = Date.now();
        requestAnimationFrame(() => this.loop2());
        
        this.count++;
        
        //this.gameLogicFnPtr();
        this.logic();
        
        if (this.draw) {
            this.real_fps = 1000 / (ts - this.last_time);
            this.real_fps *= this.count;
            this.avrg_fps = this.avrg_fps * 0.8 + this.real_fps * 0.2;
            this.last_time = ts;
            this.count = 0;
        }
        
        // this.draw = true; // TODO - Set false if the game gets slow
    }
    
    public stop(): void {
        this.running = false;
    }
    
    public getFPS(): number {
        return this.avrg_fps;
    }
    
    public get device(): PkDevice { return this._device; };
    
    public get fs(): PkFilesystem {
        return this._filesystem;
    }
    
    public get rendr(): PkRenderer {
        return this._rendr;
    }
    
    public get input(): PkInput {
        return this._input;
    }
    
    public get audio(): PK2wSound {
        return this._audio;
    }
    
    public getRenderer(): PkRenderer {
        return this._rendr;
    }
    
    /** @deprecated */
    public get tx(): PkLanguage {
        return this._language;
    }
    
    public setDebug(value: boolean) {
        this.debug = value;
    }
    
    // void PkEngine::ignore_frame() {
    //
    // 	draw = false;
    //
    // }
    //
    // bool PkEngine::is_ready() {
    //
    // 	return ready;
    //
    // }
    
    private logic() {
        
        // 	SDL_Event event;
        
        // 	while( SDL_PollEvent(&event) ) {
        // 		if(event.type == SDL_QUIT)
        // 			running = false;
        // 		if(event.type == SDL_WINDOWEVENT && event.window.event == SDL_WINDOWEVENT_RESIZED)
        // 			PisteDraw2_AdjustScreen();
        // 	}
        
        // 	PisteSound_Update();
        this._rendr.PisteDraw2_Update(this.draw);
        
        // 	if (debug) {
        // 		//if ( PisteInput_Keydown(PI_Q) ) GDB_Break();
        // 		fflush(stdout);
    }
    
}
