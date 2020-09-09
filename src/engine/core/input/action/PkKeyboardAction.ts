import { PkDeviceAction } from '@ng/core/input/action/PkDeviceAction';
import { KbCode } from '@ng/core/input/enum/KbCode';
import { PkInputDevices } from '@ng/core/input/enum/PkInputDevices';
import { Key } from '@ng/core/PkInput';

/**
 * PkKeyboardAction represents a physical keyboard key which has been actuated by the user.<br>
 * The interaction itself (<i>KEYDOWN</i>, <i>KEYUP</i>, etc.) is described in {@link PkKeyboardEvent}.
 */
export class PkKeyboardAction extends PkDeviceAction {
    /**
     * Code ({@link KbCode}) that identifies physically the button or key actuated.
     */
    public readonly code: string;
    /**
     * {@link Key} code or literal character orginated by the actuated key.<br>
     * It's not an unique identifier, for instance, "Enter" and numpad-"Intro" have the same Key="Enter".
     */
    public readonly key: Key | string | null;
    
    /**
     * Specifies this action triggers while SHIFT key is pushed.
     */
    protected readonly _shift: boolean;
    /**
     * Specifies this action triggers while CONTROL key is pushed.
     */
    protected readonly _control: boolean;
    /**
     * Specifies this action triggers while ALT key is pushed.
     */
    protected readonly _alt: boolean;
    
    /**
     * Printable character, if the action produces it.
     */
    private readonly _printableChar: string;
    
    public constructor(code: KbCode | string, key: Key | string, shift: boolean = false, control: boolean = false, alt: boolean = false) {
        super(PkInputDevices.KEYBOARD, code);
        this.key = key;
        
        this._shift = shift;
        this._control = control;
        this._alt = alt;
        
        // Check if it's writable
        if (this.key != null) {
            if (this.key === Key.Enter) /**/ this._printableChar = '\n';
            if (this.key === Key.Tab) /****/ this._printableChar = '\t';
            if (this.key.length === 1) /***/ this._printableChar = this.key;
        }
        
        this._fullId += `:${ shift ? 1 : 0 }:${ control ? 1 : 0 }:${ alt ? 1 : 0 }`;
    }
    
    /** @inheritDoc */
    public isPrintable(): boolean {
        return this._printableChar != null;
    }
    
    /** @inheritDoc */
    public getPrintable(): string | null {
        return this._printableChar;
    }
    
    /** @inheritDoc */
    public hasModifiers(): boolean {
        return this._shift || this._control || this._alt;
    }
}

export function kbAction(code: KbCode | string, key: Key | string = null, shift: boolean = false, control: boolean = false, alt: boolean = false) {
    return new PkKeyboardAction(code, key, shift, control);
}