import { PekkaContext } from '@game/PekkaContext';
import { TTextId } from '@game/support/types';
import { UIText } from '@game/ui/component/UIText';
import { PkFont } from '@ng/types/font/PkFont';

export class IntroText extends UIText {
    private readonly _iniTs: number;
    private readonly _endTs: number;
    
    private _startTime: number;
    
    
    public static create(context: PekkaContext, textId: TTextId | string, font: PkFont, x: number, y: number, iniTs: number, endTs: number): IntroText {
        const instance = new IntroText(context, textId, font, x, y, iniTs, endTs);
        instance.start();
        return instance;
    }
    
    public constructor(context: PekkaContext, textId: TTextId | string, font: PkFont, x: number, y: number, iniTs: number, endTs: number) {
        super(context, textId, font, x, y);
        
        this._iniTs = iniTs;
        this._endTs = endTs;
        
        this.alpha = 0;
    }
    
    private async start() {
        this.arrange();
        
        this._startTime = Date.now();
    }
    
    protected tick(delta: number, time: number) {
        super.tick(delta, time);
        
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
    
    public arrange() {
        this._drawable.clear();
        this.font.writeText(this.text, this._drawable);
    }
}
