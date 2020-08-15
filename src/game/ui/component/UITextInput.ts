import type { PK2Context } from '@game/PK2Context';
import { rand } from '@game/support/types';
import type { DwCanvas } from '@ng/drawable/skeleton/DwCanvas';
import { DwFactory } from '@ng/drawable/skeleton/DwFactory';
import { PkColor } from '@ng/types/PkColor';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';

export class UITextInput extends PkUIComponent {
    private _shape: DwCanvas;
    private _text: string;
    
    public constructor(context: PK2Context) {
        super(context);
        
        this._shape = DwFactory.new.canvas();
        this._shape.addTo(this.dw);
        
        // Special
        this.on(PkUIComponent.EV_POINTEROVER, () => {
            this.focus();
        });
        this.on(PkUIComponent.EV_POINTEROUT, () => {
            this.blur();
        });
        
        //this.on(PkUIComponent.EV_KEYPRESS)
    }
    
    public getText(): string {
        return this._text;
    }
    
    public setText(text: string) {
        this._text = text;
    }
    
    public tick(delta: number, time: number): void {
        super.tick(delta, time);
        
        this._shape.clear();
        
        this._shape.beginFill(PkColor.rgba1(0, 0, 0, 0.7));     //-> paleta 0
        this._shape.drawRect(-2, -2, 19 * 15 + 2 + 4, 18 + 2 + 4);
        
        this._shape.beginFill(PkColor.rgba(194, 156, 255));          //-> paleta 50
        this._shape.drawRect(0, 0, 19 * 15, 18);
        
        if (this.isFocused()) {
            // 	if (nimiedit) { //Draw text cursor
            const mx = 0 * 15 + rand() % 2; //Text cursor x
            
            // PisteDraw2_ScreenFill(mx-2, 254, mx+6+3, 254+20+3, 0);
            this._shape.beginFill(PkColor.rgba(0, 0, 0));     //-> paleta 0
            this._shape.drawRect(mx - 2, -1, 2 + 6 + 3, 20 + 3);
            
            //  PisteDraw2_ScreenFill(mx - 1, 254, mx + 6, 254 + 20, 96 + 16);//-> paleta 96+16
            this._shape.beginFill(PkColor.rgba(128, 176, 95));
            this._shape.drawRect(mx - 1, -1, 1 + 6, 20);
            
            //  PisteDraw2_ScreenFill(mx + 4, 254, mx + 6, 254 + 20, 96 + 8);//-> paleta 96+8
            this._shape.beginFill(PkColor.rgba(48, 49, 54));
            this._shape.drawRect(mx + 4, -1, -4 + 6, 20);
        }
    
        
        // PK_WavetextSlow_Draw(pelaajan_nimi,fontti2,180,255);
    }
}