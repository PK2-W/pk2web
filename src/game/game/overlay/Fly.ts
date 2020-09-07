import { PekkaContext } from '@game/PekkaContext';
import { TTextId } from '@game/support/types';
import { DwContainer } from '@ng/drawable/dw/DwContainer';
import { DwObjectBase } from '@ng/drawable/dwo/DwObjectBase';
import { PkFont } from '@ng/types/font/PkFont';
import { uint } from '@sp/types';

/**
 *
 */
export class Fly extends DwObjectBase<DwContainer> {
    private readonly _context: PekkaContext;
    private readonly _text: TTextId | string;
    private readonly _font: PkFont;
    private readonly _translatable: boolean;
    private _ticks: uint;
    
    public constructor(context: PekkaContext, text: TTextId | string, font: PkFont, x: number, y: number, ticks: uint = 100, translatable: boolean = false) {
        super(new DwContainer());
        
        this._context = context;
        this._text = text;
        this._font = font;
        this._translatable = translatable;
        this._ticks = ticks;
        
        this._drawable.setPosition(x, y);
        
        this._font.writeText(this._text, this._drawable);
    }
    
    
    ///  Computed properties  ///
    
    public getFinalText() {
        return this._translatable
            ? this._context.tx.get(this._text) || this._text.toLowerCase()
            : this._text.toLowerCase();
    }
    
    
    ///  Timing  ///
    
    public tick(): void {
        if (this._ticks > 0) {
            this._ticks--;
            
            if (this._ticks <= 50) {
                this._drawable.alpha = this._ticks * 2 / 100;
                this._drawable.y -= 0.4 * this._ticks * 2 / 100;
            } else {
                this._drawable.y -= 0.4;
            }
            if (this.alpha === 0) {
                // TODO: Replace with destroy
                this._drawable.parent.remove(this._drawable);
            }
        }
    }
    
    public isDone(): boolean {
        return this._ticks === 0;
    }
}