import { Drawable } from '@ng/drawable/Drawable';

export class PK2GameStage extends Drawable {
    private readonly _lyBackground: PIXI.Container;
    private readonly _lyBgSprites: PIXI.Container;
    private readonly _lyBgParticles: PIXI.Container;
    private readonly _lyBgBlocks: PIXI.Container;
    private readonly _lySprites: PIXI.Container;
    private readonly _lyParticles: PIXI.Container;
    private readonly _lyBlocks: PIXI.Container;
    
    public constructor() {
        super(new PIXI.Container());
        
        this._lyBackground = this.container.addChild(new PIXI.Container());
        this._lyBgSprites = this.container.addChild(new PIXI.Container());
        this._lyBgParticles = this.container.addChild(new PIXI.Container());
        this._lyBgBlocks = this.container.addChild(new PIXI.Container());
        this._lySprites = this.container.addChild(new PIXI.Container());
        this._lyParticles = this.container.addChild(new PIXI.Container());
        this._lyBlocks = this.container.addChild(new PIXI.Container());
        
    }
    
    public addBgSprite(dw: Drawable) {
        this._lyBgSprites.addChild(dw.getDrawable());
        console.log('Sprite added to stage (bg).');
    }
    
    public addSprite(dw: Drawable) {
        this._lySprites.addChild(dw.getDrawable());
        console.log('Sprite added to stage (fg).');
    }
    
    protected get container(): PIXI.Container {
        return this._drawable as PIXI.Container;
    }
    
    public getDrawable(): PIXI.DisplayObject {
        return super.getDrawable();
    }
}
