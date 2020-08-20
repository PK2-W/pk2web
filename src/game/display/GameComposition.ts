import { Particle } from '@game/particle/Particle';
import { Sprite } from '@game/sprite/Sprite';
import { Block } from '@game/tile/Block';
import { DwObject } from '@ng/drawable/object/DwObject';
import { DwObjectBase } from '@ng/drawable/object/DwObjectBase';
import { DwContainer } from '@ng/drawable/skeleton/DwContainer';
import { DwFactory } from '@ng/drawable/skeleton/DwFactory';
import { Log } from '@ng/support/log/LoggerImpl';

export class GameComposition extends DwObjectBase<DwContainer> {
    // Game ordered layers
    private readonly _lyBgImage: DwContainer;
    private readonly _lyBgSprites: DwContainer;
    private readonly _lyBgParticles: DwContainer;
    private readonly _lyBgBlocks: DwContainer;
    private readonly _lyFgSprites: DwContainer;
    private readonly _lyFgParticles: DwContainer;
    private readonly _lyFgBlocks: DwContainer;
    
    public constructor() {
        super(DwFactory.new.container());
        
        // It's born not renderable
        this.dw.renderable = false;
        
        this._lyBgImage = DwFactory.new.container().addTo(this._drawable);
        this._lyBgSprites = DwFactory.new.container().addTo(this._drawable);
        this._lyBgParticles = DwFactory.new.container().addTo(this._drawable);
        this._lyBgBlocks = DwFactory.new.container().addTo(this._drawable);
        
        this._lyFgSprites = DwFactory.new.container().addTo(this._drawable);
        this._lyFgParticles = DwFactory.new.container().addTo(this._drawable);
        this._lyFgBlocks = DwFactory.new.container().addTo(this._drawable);
    }
    
    public show(): void {
        this.dw.renderable = true;
    }
    public hide(): void {
        this.dw.renderable = false;
    }
    
    
    ///  Background  ///
    
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
    
    
    ///  Blocks  ///
    
    /**
     * Adds an element to the "background blocks" layer of the current game composition.
     *
     * @param block - The block object to append.
     */
    public addBgBlock(block: Block) {
        this._lyBgBlocks.add(block.getDrawable());
        //  Log.d('Block added to the composition (bg).');
    }
    /**
     * Removes an element to the "background blocks" layer of the current game composition.
     *
     * @param block - The block object to remove.
     */
    public removeBgBlock(block: Block): void {
        this._lyBgBlocks.remove(block.getDrawable());
    }
    
    /**
     * Adds an element to the "foreground blocks" layer of the current game composition.
     *
     * @param block - The block object to append.
     */
    public addFgBlock(block: Block) {
        this._lyFgBlocks.add(block.getDrawable());
        //  Log.d('Block added to the composition (fg).');
    }
    /**
     * Removes an element to the "foreground blocks" layer of the current game composition.
     *
     * @param block - The block object to remove.
     */
    public removeFgBlock(block: Block): void {
        this._lyFgBlocks.remove(block.getDrawable());
    }
    
    
    ///  Sprites  ///
    
    /**
     * Adds an element to the "background sprites" layer of the current game composition.
     *
     * @param sprite - The sprite object to append.
     */
    public addBgSprite(sprite: Sprite) {
        this._lyBgSprites.add(sprite.getDrawable());
        // Log.d('Sprite added to the composition (bg).');
    }
    /**
     * Removes an element to the "background sprites" layer of the current game composition.
     *
     * @param sprite - The sprite object to remove.
     */
    public removeBgSprite(sprite: Sprite): void {
        this._lyBgSprites.remove(sprite.getDrawable());
    }
    
    /**
     * Adds an element to the "foreground sprites" layer of the current game composition.
     *
     * @param sprite - The sprite object to append.
     */
    public addFgSprite(sprite: Sprite) {
        this._lyFgSprites.add(sprite.getDrawable());
        // Log.d('Sprite added to the composition (fg).');
    }
    /**
     * Removes an element to the "foreground sprites" layer of the current game composition.
     *
     * @param sprite - The sprite object to remove.
     */
    public removeFgSprite(sprite: Sprite): void {
        this._lyFgSprites.remove(sprite.getDrawable());
    }
    
    
    ///  Particles  ///
    
    public addBgParticle(dwo: DwObject): void {
        this._lyBgParticles.add(dwo.getDrawable());
        // Log.d('Sprite added to the composition (bg).');
    }
    public removeBgParticle(particle: Particle): this {
        this._lyBgParticles.remove(particle.getDrawable());
        return this;
    }
    
    public addFgParticle(dwo: DwObject): void {
        this._lyFgParticles.add(dwo.getDrawable());
        // Log.d('Sprite added to the composition (bg).');
    }
    public removeFgParticle(particle: Particle): this {
        this._lyFgParticles.remove(particle.getDrawable());
        return this;
    }
}
