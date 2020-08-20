import { DisplayObject } from '@ng/display/DisplayObject';
import { RenderContext } from '@ng/render/RenderContext';
import * as PIXI from 'pixi.js';

export class DisplayGroupImpl extends DisplayObject<PIXI.Container> {
    private _renderContext: RenderContext;
    private _children: DisplayObject<any>[];
    
    
    public constructor(context?: RenderContext) {
        super(new PIXI.Container);
        
        if (context != null) {
            this._renderContext = context;
        }
    }
    
    public addChild(...children: DisplayObject<any>[]): this {
        if (children.length == 1) {
            this._children.push(children[0]);
            this._native.addChild(children[0]._native);
        } else {
            for (let child of children) {
                this.addChild(child);
            }
        }
        
        return this;
    };
    
    public get(index:number) {
    
    }
    
}