import type { PekkaContext } from '@game/PekkaContext';
import { rand } from '@game/support/types';
import { UIWaveText } from '@game/ui/component/UIWaveText';
import type { DwCanvas } from '@ng/drawable/skeleton/DwCanvas';
import { DwFactory } from '@ng/drawable/skeleton/DwFactory';
import { Log } from '@ng/support/log/LoggerImpl';
import { PkColor } from '@ng/types/PkColor';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { EventEmitter } from 'eventemitter3';

export class UITextInput extends PkUIComponent<PekkaContext> {
    private _native: NativeTextInput;
    
    private _uiText: UIWaveText;
    private _dwShape: DwCanvas;
    
    
    public constructor(context: PekkaContext, initialText: string = '') {
        super(context);
        
        this._native = new NativeTextInput();
        
        this._dwShape = DwFactory.new.canvas();
        this._dwShape.addTo(this.dw);
        
        this._uiText = new UIWaveText(this.context, initialText, context.font2)
            .setShadow(false);
        this._uiText.getDrawable().addTo(this.dw);
        
        this._native
            .on(NativeTextInput.EV_CHANGE, () => {
                // If only change cursor position, keep text
                if (this._uiText.text !== this.text) {
                    this._uiText.setText(this.text);
                    this.arrange();
                }
            })
            .setText('pekka');
        
        this.on(PkUIComponent.EV_POINTEROVER, () => {
            this.focus();
        });
    }
    
    
    ///  Properties  ///
    
    public get maxLength(): number { return this._native.maxLength; }
    public set maxLength(maxLength: number) { this.setMaxLength(maxLength); }
    /** Sets the {@link maxLength} property. */
    public setMaxLength(maxLength: number): this {
        this._native.maxLength = maxLength;
        return this;
    }
    
    
    ///  Contents  ///
    
    public get text(): string { return this._native.text.toLowerCase(); }
    public set text(text: string) { this.setText(text); }
    /** Sets the {@link text} property. */
    public setText(text: string): this {
        this._native.text = text;
        return this;
    }
    
    public clear(): this {
        this.setText('');
        return this;
    }
    
    ///  Focus  ///
    
    public focus(): this {
        super.focus();
        
        if (this.isFocused()) {
            this._native.focus();
            this.arrange();
        }
        
        return this;
    }
    
    public blur(): this {
        super.blur();
        
        if (!this.isFocused()) {
            this._native.blur();
            this.arrange();
        }
        
        return this;
    }
    
    
    ///  Drawing  ///
    
    private arrange(): void {
        this._dwShape.clear();
        
        this._dwShape.beginFill(PkColor.rgba1(0, 0, 0, 0.7));     //-> paleta 0
        this._dwShape.drawRect(-2, -2, 19 * 15 + 2 + 4, 18 + 2 + 4);
        
        this._dwShape.beginFill(PkColor.rgba(194, 156, 255));          //-> paleta 50
        this._dwShape.drawRect(0, 0, 19 * 15, 18);
        
        if (this.isFocused() && this._native.cursor != null) {
            // 	if (nimiedit) { //Draw text cursor
            const mx = this._native.cursor * 15 + rand() % 2; //Text cursor x
            
            // PisteDraw2_ScreenFill(mx-2, 254, mx+6+3, 254+20+3, 0);
            this._dwShape.beginFill(PkColor.rgba(0, 0, 0));     //-> paleta 0
            this._dwShape.drawRect(mx - 2, -1, 2 + 6 + 3, 20 + 3);
            
            //  PisteDraw2_ScreenFill(mx - 1, 254, mx + 6, 254 + 20, 96 + 16);//-> paleta 96+16
            this._dwShape.beginFill(PkColor.rgba(128, 176, 95));
            this._dwShape.drawRect(mx - 1, -1, 1 + 6, 20);
            
            //  PisteDraw2_ScreenFill(mx + 4, 254, mx + 6, 254 + 20, 96 + 8);//-> paleta 96+8
            this._dwShape.beginFill(PkColor.rgba(48, 49, 54));
            this._dwShape.drawRect(mx + 4, -1, -4 + 6, 20);
        }
    }
    
    public tick(delta: number, time: number): void {
        super.tick(delta, time);
        
        this.arrange();
        this._uiText.tick(delta, time);
    }
}

class NativeTextInput extends EventEmitter {
    private readonly _$input: HTMLInputElement;
    
    
    public constructor() {
        super();
        
        // Setup native input
        this._$input = document.createElement('input');
        this._$input.pattern = '[A-Za-z0-9.?!]';
        this._$input.style.outline = 'none';
        this._$input.style.border = 'none';
        this._$input.style.background = '#f88';
        this._$input.style.borderRadius = '1px';
        this._$input.style.fontFamily = 'monospaced';
        this._$input.style.pointerEvents = 'none';
        if (!Log.isDebug()) {
            this._$input.style.height = '0';
            this._$input.style.padding = '0';
            this._$input.style.opacity = '0';
        }
        
        // Events
        this._$input.addEventListener('input', () => this.emit(NativeTextInput.EV_CHANGE, this));
        this._$input.addEventListener('paste', () => this.emit(NativeTextInput.EV_CHANGE, this));
        this._$input.addEventListener('select', () => {
            // Prevent selecting a range of text
            if (this._$input.selectionStart !== this._$input.selectionEnd) {
                switch (this._$input.selectionDirection) {
                    case 'forward':
                        this._$input.selectionStart = this._$input.selectionEnd;
                        break;
                    case 'backward':
                        this._$input.selectionEnd = this._$input.selectionStart;
                        break;
                }
            }
            
            this.emit(NativeTextInput.EV_CHANGE, this);
        });
    }
    
    
    ///  Properties  ///
    
    public get maxLength(): number { return this._$input.maxLength; }
    public set maxLength(maxLength: number) { this.setMaxLength(maxLength); }
    /** Sets the {@link maxLength} property. */
    public setMaxLength(maxLength: number): this {
        this._$input.maxLength = maxLength;
        return this;
    }
    
    
    ///  Contents  ///
    
    public get text(): string { return this._$input.value; }
    public set text(text: string) { this.setText(text); }
    /** Sets the {@link value} property. */
    public setText(text: string): this {
        this._$input.value = text;
        this.emit(NativeTextInput.EV_CHANGE, this);
        return this;
    }
    
    public get cursor(): number | null { return this._$input.selectionStart; }
    public set cursor(position: number | null) { this.setCursor(position); }
    /** Sets the {@link value} property. */
    public setCursor(position: number | null): this {
        this._$input.selectionStart = this._$input.selectionEnd = position;
        this.emit(NativeTextInput.EV_CHANGE, this);
        return this;
    }
    
    
    ///  Focus  ///
    
    public focus(): this {
        document.body.appendChild(this._$input);
        this._$input.focus();
        this._$input.addEventListener('blur', NativeTextInput._keepFocus);
        
        // Fixes strange behaviour moving cursor the the begining only when focus previous
        setTimeout(() => this.cursor = this.text.length, 10);
        
        return this;
    }
    
    public blur(): this {
        this._$input.removeEventListener('blur', NativeTextInput._keepFocus);
        this._$input.blur();
        document.body.removeChild(this._$input);
        return this;
    }
    
    private static _keepFocus(ev): void { ev.target.focus(); }
    
    
    ///  Events  ///
    
    public static readonly EV_CHANGE = Symbol('change.native.uitextinput.evt');
}