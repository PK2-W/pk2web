import * as PIXI from 'pixi.js';

export class DisplayObjectWrapper extends PIXI.DisplayObject {
    public constructor() {
        super();
    }
    
    public updateTransform(): void {
        super.updateTransform();
        this.emit('onUpdateTransform');
    }
}