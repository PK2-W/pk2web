import { InputAction } from '@game/InputActions';
import type { PekkaContext } from '@game/PekkaContext';
import { UIWaveText } from '@game/ui/component/UIWaveText';
import { KbCode } from '@fwk/core/input/enum/KbCode';
import { PkInputEvent } from '@fwk/core/input/PkInputEvent';
import { PkInput } from '@fwk/core/PkInput';
import { DwCanvas } from '@fwk/drawable/dw/DwCanvas';
import { uint } from '@fwk/shared/bx-ctypes';
import { minmax, rand } from '@fwk/support/utils';
import { PkColor } from '@fwk/types/PkColor';
import { PkUIComponent } from '@fwk/ui/component/PkUIComponent';
import { JUMP_SOUND_CKEY } from '@sp/constants';

export class UITextInput extends PkUIComponent<PekkaContext> {
    /**
     * See {@link cursor}.
     */
    private _cursor: uint;
    /**
     * See {@link maxLength}.
     */
    private _maxLength: uint;
    
    private _uiText: UIWaveText;
    private _dwBox: DwCanvas;
    private _dwCursor: DwCanvas;
    
    public constructor(context: PekkaContext, initialText: string = '') {
        super(context);
        
        // Create text element from sub-component
        this._uiText = new UIWaveText(this.context, initialText, context.font2);
        this._uiText.setShadow(false);
        
        // Set initial values
        this._cursor = this._value.length;
        this._maxLength = 20;
        
        // Create and add graphic elements
        this._dwBox = new DwCanvas().addTo(this._dw);
        this._dwCursor = new DwCanvas().addTo(this._dw).setRenderable(false);
        this._uiText.getDrawable().addTo(this.dw);
        
        // Draw and locate graphics
        this._redrawBox();
        this._redrawCursor();
        this.arrange();
        
        // Pointer events
        this.on(PkUIComponent.EV_POINTEROVER, () => {
            this.focus();
        });
        
        // Input events
        this.on(PkInput.EV_KEYDOWN, (ev: PkInputEvent) => {
            // Move cursor to the left
            if (ev.gameActns.includes(InputAction.UI_LEFT)) {
                if (this._cursor === 0) {
                    this._miss();
                } else {
                    this.cursor--;
                }
                ev.preventBubbling();
                return;
            }
            // Move cursor to the right
            if (ev.gameActns.includes(InputAction.UI_RIGHT)) {
                if (this._cursor === this._value.length) {
                    this._miss();
                } else {
                    this.cursor++;
                }
                ev.preventBubbling();
                return;
            }
            // Move cursor to the beginning or Kb:Home
            if (ev.gameActns.includes(InputAction.UI_UP) || ev.deviceEvent.action.code === KbCode.Home) {
                this.cursor = 0;
                ev.preventBubbling();
                return;
            }
            // Move cursor to the end or Kb:End
            if (ev.gameActns.includes(InputAction.UI_DOWN) || ev.deviceEvent.action.code === KbCode.End) {
                this.cursor = this.length;
                ev.preventBubbling();
                return;
            }
            // Backspace
            if (ev.gameActns.includes(InputAction.UI_BACKSPACE)) {
                if (this._cursor > 0) {
                    this._value = this._value.substring(0, this._cursor - 1) + this._value.substring(this._cursor);
                    this._cursor--;
                    this._uiText.text = this._value;
                } else {
                    this._miss();
                }
                ev.preventBubbling();
                return;
            }
            // Kb:Delete
            if (ev.deviceEvent.action.code === KbCode.Delete) {
                if (this._cursor < this.length) {
                    this._value = this._value.substring(0, this._cursor) + this._value.substring(this._cursor + 1);
                    this._uiText.text = this._value;
                } else {
                    this._miss();
                }
                ev.preventBubbling();
                return;
            }
            // UI_ACTUATE blurs
            if (ev.gameActns.includes(InputAction.UI_ACTUATE)) {
                this.screen.focusNext();
                return;
            }
            // Printable character
            if (ev.deviceEvent.action.isPrintable() && !ev.gameActns.includes(InputAction.UI_NEXT)) {
                const value = ev.deviceEvent.action.getPrintable().toLowerCase();
                
                if (/^[a-z0-9.?! ]+$/.test(value) && this.length + value.length <= this._maxLength) {
                    this._value =
                        this._value.substring(0, this._cursor) +
                        value +
                        this._value.substring(this._cursor);
                    this._cursor++;
                    this._uiText.text = this._value;
                } else {
                    this._miss();
                }
                
                ev.preventBubbling();
                return;
            }
        });
    }
    
    /**
     * See {@link value}.
     */
    private get _value(): string {
        return this._uiText.text;
    }
    private set _value(value: string) {
        this._uiText.text = value;
    }
    
    /**
     * Called when an invalid key is received to play a <i>meeeeeh</i> sound or something else.
     */
    private _miss() {
        this.context.stuff.getSound(JUMP_SOUND_CKEY).play();
    }
    
    
    ///  Properties  ///
    
    /**
     * Maximum number of characters that can fit in the field.
     */
    public get maxLength(): number { return this._maxLength; }
    public set maxLength(maxLength: number) { this.setMaxLength(maxLength); }
    /** Sets the {@link maxLength} property. */
    public setMaxLength(maxLength: number): this {
        this._maxLength = maxLength;
        if (this.length > maxLength) {
            this._value = this._value.substr(0, maxLength);
        }
        return this;
    }
    
    /**
     * Text value of the field.
     */
    public get value(): string { return this._value.toLowerCase(); }
    public set value(value: string) { this.setValue(value); }
    /** Sets the {@link value} property. */
    public setValue(value: string): this {
        this._value = value;
        this._cursor = this.length;
        return this;
    }
    
    /**
     * Cursor position in the field.
     */
    public get cursor(): uint { return this._cursor; }
    public set cursor(cursor: uint) { this.setCursor(cursor); }
    /** Sets the {@link cursor} property. */
    public setCursor(cursor: uint): this {
        this._cursor = minmax(cursor, 0, this._value.length);
        return this;
    }
    
    /**
     * Length of the current field value.
     */
    public get length(): uint {
        return this._value.length;
    }
    
    /**
     * Sets the field value to ''.
     */
    public clear(): this {
        this.setValue('');
        return this;
    }
    
    
    ///  Focus  ///
    
    /** @inheritDoc */
    public focus(): this {
        super.focus();
        
        if (this.isFocused()) {
            // Show cursor when focus
            this._dwCursor.visible = true;
        }
        
        return this;
    }
    
    /** @inheritDoc */
    public blur(): this {
        super.blur();
        
        if (!this.isFocused()) {
            // Hide cursor when lose focus
            this._dwCursor.visible = false;
        }
        
        return this;
    }
    
    
    ///  Drawing  ///
    
    public _redrawBox(): void {
        this._dwBox.clear();
        
        //> PisteDraw_Buffer_Tayta(PD_TAUSTABUFFER,180-2,255-2,180+20*15+4,255+18+4,0);
        this._dwBox.beginFill(PkColor.rgba1(0, 0, 0, 0.7));     //-> palette 0
        this._dwBox.drawRect(-2, -2, (this._maxLength + 1) * 15 + 2 + 4, 18 + 2 + 4);
        
        //> PisteDraw_Buffer_Tayta(PD_TAUSTABUFFER,180,255,180+20*15,255+18,50);
        this._dwBox.beginFill(PkColor.rgba(194, 156, 255));          //-> palette 50
        this._dwBox.drawRect(0, 0, (this._maxLength + 1) * 15, 18);
    }
    
    private _redrawCursor(): void {
        this._dwCursor.clear();
        
        //> PisteDraw_Buffer_Tayta(PD_TAUSTABUFFER,mx+12,254,mx+16,254+20,96+8);
        this._dwCursor.beginFill(PkColor.rgba(48, 49, 54));   //-> palette 96+8
        this._dwCursor.drawRect(1, -2, 1 + 6, 24);
        
        //> PisteDraw_Buffer_Tayta(PD_TAUSTABUFFER,mx-2,254,mx+16+3,254+20+3,0);
        this._dwCursor.beginFill(PkColor.rgba(0, 0, 0));     //-> palette 0
        this._dwCursor.drawRect(-1, -4, 1 + 5 + 1, 24 + 2);
        
        //> PisteDraw_Buffer_Tayta(PD_TAUSTABUFFER,mx-1,254,mx+16,254+20,96+16);
        this._dwCursor.beginFill(PkColor.rgba(128, 176, 95));  //-> palette 96+16
        this._dwCursor.drawRect(0, -3, 5, 24);
    }
    
    private arrange(): void {
        if (this.isFocused()) {
            this._dwCursor.x = this._cursor * 15 + rand() % 2 - 1;
        }
    }
    
    /** @inheritDoc */
    public tick(delta: number, time: number): void {
        super.tick(delta, time);
        
        this.arrange();
        this._uiText.tick(delta, time);
    }
}