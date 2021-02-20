import { Particle } from '@game/particle/Particle';
import { Sprite } from '@game/sprite/Sprite';
import { Block } from '@game/tile/Block';
import { DwContainer } from '@fwk/drawable/dw/DwContainer';
import { DwObject } from '@fwk/drawable/dwo/DwObject';
import { DwObjectBase } from '@fwk/drawable/dwo/DwObjectBase';
import { Log } from '@fwk/support/log/LoggerImpl';

export class GameComposition extends DwObjectBase<DwContainer> {
    // Game ordered layers
    private readonly _lyBgImage: DwContainer;
    private readonly _lyBgSprites: DwContainer;
    private readonly _lyBgParticles: DwContainer;
    private readonly _lyBgBlocks: DwContainer;
    private readonly _lyFgSprites: DwContainer;
    private readonly _lyFgParticles: DwContainer;
    private readonly _lyFgBlocks: DwContainer;
    private readonly _lyOverlay: DwContainer;
    
    public constructor() {
        super(new DwContainer);
        this.dbgName = GameComposition.name;
        
        // It's born not visible
        this.dw.visible = false;
        
        this._lyBgImage = new DwContainer('Layer:BgImage').addTo(this._dw);
        this._lyBgSprites = new DwContainer('Layer:BgSprites').addTo(this._dw);
        this._lyBgParticles = new DwContainer('Layer:BgParticles').addTo(this._dw);
        this._lyBgBlocks = new DwContainer('Layer:BgBlocks').addTo(this._dw);
        
        this._lyFgSprites = new DwContainer('Layer:FgSprites').addTo(this._dw);
        this._lyFgParticles = new DwContainer('Layer:FgParticles').addTo(this._dw);
        this._lyFgBlocks = new DwContainer('Layer:FgBlocks').addTo(this._dw);
        
        this._lyOverlay = new DwContainer('Layer:Overlay').addTo(this._dw);
    }
    
    public show(): void {
        this.dw.visible = true;
    }
    public hide(): void {
        this.dw.visible = false;
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
    
    
    ///  Overlay  ///
    
    public addOverlay(dwo: DwObject): void {
        this._lyOverlay.add(dwo.getDrawable());
    }
}
