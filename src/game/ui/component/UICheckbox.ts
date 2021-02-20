import { InputAction } from '@game/InputActions';
import { PekkaContext } from '@game/PekkaContext';
import { TTextId } from '@game/support/types';
import { UIWaveText } from '@game/ui/component/UIWaveText';
import { PkInputEvent } from '@fwk/core/input/PkInputEvent';
import { PkInput } from '@fwk/core/PkInput';
import { DwSprite } from '@fwk/drawable/dw/DwSprite';
import { PkFont } from '@fwk/types/font/PkFont';
import { PkRectangle } from '@fwk/types/PkRectangle';
import { PkTexture } from '@fwk/types/PkTexture';
import { PkUIComponent } from '@fwk/ui/component/PkUIComponent';
import { STUFF_CKEY } from '@sp/constants';

export class UICheckbox extends PkUIComponent<PekkaContext> {
    private _value: boolean;
    private _trueText: string;
    private _falseText: string;
    
    private _uiText: UIWaveText;
    
    private _dwCheckbox: DwSprite;
    private _trueTx: PkTexture;
    private _falseTx: PkTexture;
    
    
    public constructor(context: PekkaContext, trueText: TTextId | string, falseText: TTextId | string, font: PkFont, translatable: boolean = false) {
        super(context);
        
        this._value = false;
        this._trueText = trueText;
        this._falseText = falseText;
        
        this._uiText = new UIWaveText(context, '', font, translatable);
        this._uiText.getDrawable().addTo(this.dw, 80, 5);
        
        this._trueTx = context.stuff.getBitmap(STUFF_CKEY).getTexture(PkRectangle.$(504, 124, 31, 31));
        this._falseTx = context.stuff.getBitmap(STUFF_CKEY).getTexture(PkRectangle.$(473, 124, 31, 31));
        this._dwCheckbox = new DwSprite().addTo(this.dw);
        
        this.setChecked(false);
        
        this.on(PkUIComponent.EV_POINTEROVER, () => this.focus());
        this.on(PkUIComponent.EV_POINTERMOVE, () => this.focus());
        this.on(PkUIComponent.EV_POINTEROUT, () => this.blur());
        this.on(PkUIComponent.EV_POINTERTAP, () => {
            if (this.isFocused()) {
                this.toggleValue();
            }
        });
        this.on(PkInput.EV_KEYDOWN, (ev: PkInputEvent) => {
            if (ev.gameActns.includes(InputAction.UI_ACTUATE)) {
                this.toggleValue();
            }
            //     if (!ev.gameActns.includes(InputAction.UI_DOWN)) {
            //         this._inputText('' + Math.floor(Math.random() * 10));
            //     }
        });
    }
    
    public setChecked(checked: boolean): void {
        this._value = checked === true;
        
        this._uiText.setText(this._value ? this._trueText : this._falseText);
        this._dwCheckbox.setTexture(this._value ? this._trueTx : this._falseTx);
        
        const bounds: PkRectangle = this.dw.getLocalBounds();
        this.dw.hitArea = PkRectangle.$(bounds.x - 2, bounds.y - 2, bounds.width + 4, bounds.height + 4);
        
        //  this.context.stuff.getSoundByUrl(pathJoin(RESOURCES_PATH, 'sfx/menu2.wav')).play();
        
        this.emit(UICheckbox.EV_CHANGED, this);
    }
    
    public toggleValue(): void {
        this.setChecked(!this._value);
    }
    
    public arrange(): void {
    
    }
    
    public focus(): this {
        super.focus();
        
        if (this.isFocused()) {
            this._uiText.setFast(true);
            this._uiText.setFont(this.context.font3);
        }
        
        return this;
    }
    
    public blur(): this {
        super.blur();
        
        if (!this.isFocused()) {
            this._uiText.setFast(false);
            this._uiText.setFont(this.context.font2);
        }
        
        return this;
    }
    
    public tick(delta: number, time: number): void {
        super.tick(delta, time);
        
        this._uiText.tick(delta, time);
    }
    
    
    ///  Events  ///
    
    public static readonly EV_CHANGED = Symbol('changed.component.ui.evt');
}