import { Dw } from '@fwk/drawable/dw/Dw';
import { DwContainer } from '@fwk/drawable/dw/DwContainer';

export class PkCamera extends Dw<WorldContainer> {
    protected _child: DwContainer;
    
    public constructor(child: DwContainer) {
        super(new WorldContainer(child.pixi));
        
        this._child = child;
    }
    
    ///  Properties  ///
    
    public get x(): number { return this.pixi.x; }
    public set x(x: number) {
        this._pixi._sourceFrame.x = x;
    }
    public setX(x: number): this {
        this.x = x;
        return this;
    }
    
    public get y(): number { return this.pixi.y; }
    public set y(y: number) {
        this._pixi._sourceFrame.y = y;
    }
    public setY(y: number): this {
        this.y = y;
        return this;
    }
    
    public setPosition(x: number, y: number): this {
        this._pixi._sourceFrame.x = x;
        this._pixi._sourceFrame.y = y;
        return this;
    }
}

class WorldContainer extends PIXI.Container {
    private static readonly _emptyParent = new PIXI.Container();
    
    private readonly _content: PIXI.Container;
    private readonly _projectionTransform: PIXI.Matrix;
    public _sourceFrame: PIXI.Rectangle;
    private _destinationFrame: PIXI.Rectangle;
    
    
    public constructor(content: PIXI.Container) {
        super();
        this._content = content;
        this._projectionTransform = new PIXI.Matrix();
        this._sourceFrame = new PIXI.Rectangle(0, 0, 800, 500); //app.renderer.screen.clone();
        this._destinationFrame = new PIXI.Rectangle();
    }
    
    _calculateBounds() {
        this._bounds.addFrame(this.transform, 0, 0, 1, 1);
    }
    
    calculateProjection() {
        // this._projectionTransform.identity();
        // this._projectionTransform.translate(-this._sourceFrame.width / 2, -this._sourceFrame.height / 2);
        // this._projectionTransform.rotate(this.rotation);
        // this._projectionTransform.translate(this._sourceFrame.width / 2, this._sourceFrame.height / 2);
        
        this._destinationFrame.x = 0;//this.x - this.pivot.x * this.scale.x;
        this._destinationFrame.y = 0;//500/*app.renderer.screen.height*/ - (this.y - this.pivot.y * this.scale.y + this.scale.y);
        this._destinationFrame.width = 800;//this.scale.x;
        this._destinationFrame.height = 500;//this.scale.y;
    }
    
    render(renderer) {
        super.render(renderer);
        renderer.batch.flush();
        
        this.calculateProjection();
        renderer.projection.projectionMatrix.identity();
        renderer.projection.transform = this._projectionTransform;
        renderer.renderTexture.bind(null, this._sourceFrame, this._destinationFrame);
        
        this._content.render(renderer);
        
        // You must flush pending renders before switching back to the previous world!
        renderer.batch.flush();
        renderer.projection.projectionMatrix.identity();
        renderer.projection.transform = null;
        renderer.renderTexture.bind(null);
    }
    
    updateTransform() {
        super.updateTransform();
        
        // To update the transform of a display-object without a parent, you must
        // enable the temporary parent.
        // this._content.parent = WorldContainer._emptyParent;
        // this._content.updateTransform();
        // this._content.parent = null;
    }
}