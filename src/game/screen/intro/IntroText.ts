import { PK2wFont } from '../../../engine/PK2wFont';
import { Drawable } from '../../../support/drawable/Drawable';
import * as PIXI from '../../../vendor/pixi';
import { PK2Context } from '../../PK2Context';

export class IntroText extends Drawable {
    private readonly _context: any;
    
    private readonly _text: string;
    private readonly _fontId: number;
    private readonly _x: number;
    private readonly _y: number;
    private readonly _iniTs: number;
    private readonly _endTs: number;
    
    private _startTime: number;
    
    
    public static create(ctx: PK2Context, text: string, fontId: number, x: number, y: number, iniTs: number, endTs: number): IntroText {
        const instance = new IntroText(ctx, text, fontId, x, y, iniTs, endTs);
        instance.start();
        return instance;
    }
    
    private constructor(ctx: PK2Context, text: string, fontId: number, x: number, y: number, iniTs: number, endTs: number) {
        super();
        
        this._drawable = new PIXI.Container();
        
        this._context = ctx;
        this._text = text;
        this._fontId = fontId;
        this._x = x;
        this._y = y;
        this._iniTs = iniTs;
        this._endTs = endTs;
        
        this.alpha = 0;
    }
    
    private async start() {
        this.arrange();
        
        this._startTime = Date.now();
        
        
    }
    
    private tick(delta): void {
        if (delta > this._iniTs && delta < this._endTs) {
            
            // Linear fade in
            if (delta - this._iniTs < 1000)
                this.alpha = (delta - this._iniTs) / 1000;
            
            // Linear fade out
            if (this._endTs - delta < 1000)
                this.alpha = (this._endTs - delta) / 1000;
        }
    }
    
    private loop(): void {
        const time = Date.now();
        const delta = time - this._startTime;
        
        if (delta > this._iniTs && delta < this._endTs) {
            
            // Linear fade in
            if (delta - this._iniTs < 1000)
                this.alpha = (delta - this._iniTs) / 1000;
            
            // Linear fade out
            if (this._endTs - delta < 1000)
                this.alpha = (this._endTs - delta) / 1000;
        }
    }
    
    private get font(): PK2wFont {
        return this._context.getFont(this._fontId);
    }
    
    public arrange() {
        // TODO PARCHE
        if (this._text == null) this._text = '?';
        
        this.font.writeText(this._text, this._drawable);
        this._drawable.x = this._x;
        this._drawable.y = this._y;
    }
    
    public getDrawable() {
        return this._drawable;
    }
}
