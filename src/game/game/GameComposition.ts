import { Drawable } from '@ng/drawable/Drawable';
import { IDrawable } from '@ng/drawable/IDrawable';
import { DisplayContainer } from '@ng/display/DisplayContainer';
import { Log } from '@ng/support/log/LoggerImpl';
import * as PIXI from 'pixi.js';

export class GameComposition extends Drawable {
    // Game ordered layers
    private readonly _lyBgImage: PIXI.Container;
    private readonly _lyBgSprites: PIXI.Container;
    private readonly _lyBgParticles: PIXI.Container;
    private readonly _lyBgBlocks: PIXI.Container;
    private readonly _lySprites: PIXI.Container;
    private readonly _lyParticles: PIXI.Container;
    private readonly _lyBlocks: PIXI.Container;
    
    public constructor() {
        super(new PIXI.Container());
        
        this._lyBgImage = this.container.addChild(new PIXI.Container());
        this._lyBgSprites = this.container.addChild(new PIXI.Container());
        this._lyBgParticles = this.container.addChild(new PIXI.Container());
        this._lyBgBlocks = this.container.addChild(new PIXI.Container());
        //
        this._lyParticles = this.container.addChild(new PIXI.Container());
        this._lyBlocks = this.container.addChild(new PIXI.Container());
        this._lySprites = this.container.addChild(new PIXI.Container());
        
    }
    
    public addBgImage(obj: PIXI.DisplayObject) {
        this._lyBgImage.addChild(obj);
    }
    
    public addBgBlock(dw: IDrawable) {
        this._lyBgBlocks.addChild(dw.getDrawable());
        //  Log.d('Block added to the composition (bg).');
    }
    
    public addFgBlock(dw: IDrawable) {
        this._lyBlocks.addChild(dw.getDrawable());
        //  Log.d('Block added to the composition (fg).');
    }
    
    public addBgSprite(dw: IDrawable) {
        this._lyBgSprites.addChild(dw.getDrawable());
        // Log.d('Sprite added to the composition (bg).');
    }
    
    public addSprite(dw: IDrawable) {
        this._lySprites.addChild(dw.getDrawable());
        // Log.d('Sprite added to the composition (fg).');
    }
    
    protected get container(): PIXI.Container {
        return this._drawable as PIXI.Container;
    }
    
    public getDrawable(): PIXI.DisplayObject {
        return super.getDrawable();
    }
}
