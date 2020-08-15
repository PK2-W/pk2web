import { DwObject } from '@ng/drawable/object/DwObject';
import { DwObjectBase } from '@ng/drawable/object/DwObjectBase';
import { Dw } from '@ng/drawable/skeleton/Dw';
import { DwContainer } from '@ng/drawable/skeleton/DwContainer';
import { DwFactory } from '@ng/drawable/skeleton/DwFactory';
import { Log } from '@ng/support/log/LoggerImpl';

export class GameComposition extends DwObjectBase<DwContainer> {
    // Game ordered layers
    private readonly _lyBgImage: DwContainer;
    private readonly _lyBgSprites: DwContainer;
    private readonly _lyBgParticles: DwContainer;
    private readonly _lyBgBlocks: DwContainer;
    private readonly _lySprites: DwContainer;
    private readonly _lyFgParticles: DwContainer;
    private readonly _lyBlocks: DwContainer;
    
    public constructor() {
        super(DwFactory.new.container());
        
        this._lyBgImage = DwFactory.new.container().addTo(this._drawable);
        this._lyBgSprites = DwFactory.new.container().addTo(this._drawable);
        this._lyBgParticles = DwFactory.new.container().addTo(this._drawable);
        this._lyBgBlocks = DwFactory.new.container().addTo(this._drawable);
        
        this._lySprites = DwFactory.new.container().addTo(this._drawable);
        this._lyFgParticles = DwFactory.new.container().addTo(this._drawable);
        this._lyBlocks = DwFactory.new.container().addTo(this._drawable);
        
    }
    
    /**
     * Sets the background for the current game composition.
     *
     * @param dwo - A drawable object representing the background of a game level.
     */
    public setBgImage(dwo: DwObject) {
        this._lyBgImage
            .clear()
            .add(dwo.getDrawable());
        Log.d('[GameComposition] ', 'Background added');
    }
    
    /**
     * Adds an element to the "background blocks" layer of the current game composition.
     *
     * @param dwo - The background-block-like drawable object to append.
     */
    public addBgBlock(dwo: DwObject) {
        this._lyBgBlocks.add(dwo.getDrawable());
        //  Log.d('Block added to the composition (bg).');
    }
    
    /**
     * Adds an element to the "foreground blocks" layer of the current game composition.
     *
     * @param dwo - The foreground-block-like drawable object to append.
     */
    public addFgBlock(dwo: DwObject) {
        this._lyBlocks.add(dwo.getDrawable());
        //  Log.d('Block added to the composition (fg).');
    }
    
    public removeFgBlock(dwo: DwObject): void {
        this._lyBlocks.remove(dwo.getDrawable());
    }
    
    public addBgSprite(dwo: DwObject) {
        this._lyBgSprites.add(dwo.getDrawable());
        // Log.d('Sprite added to the composition (bg).');
    }
    public removeBgSprite(dwo: DwObject): void {
        this._lyBgSprites.remove(dwo.getDrawable());
    }
    
    public addFgSprite(dwo: DwObject) {
        this._lySprites.add(dwo.getDrawable());
        // Log.d('Sprite added to the composition (fg).');
    }
    public removeFgSprite(dwo: DwObject): void {
        this._lySprites.remove(dwo.getDrawable());
    }
    
    public addBgParticle(dwo: DwObject): void {
        this._lyBgParticles.add(dwo.getDrawable());
        // Log.d('Sprite added to the composition (bg).');
    }
    
    public addFgParticle(dwo: DwObject): void {
        this._lyFgParticles.add(dwo.getDrawable());
        // Log.d('Sprite added to the composition (bg).');
    }
}
