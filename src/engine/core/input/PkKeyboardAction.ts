import { PkInputDevices } from '@ng/core/input/enum/PkInputDevices';
import { PkDeviceAction } from '@ng/core/input/PkDeviceAction';
import type { Key } from 'ts-key-enum';

export class PkKeyboardAction extends PkDeviceAction {
    protected _key: Key | string;
    protected readonly _shift: boolean;
    protected readonly _control: boolean;
    protected readonly _alt: boolean;
    
    public constructor(key: Key | string, shift: boolean = false, control: boolean = false, alt: boolean = false) {
        super(PkInputDevices.KEYBOARD, key);
        
        this._shift = shift;
        this._control = control;
        this._alt = alt;
        
        this._id += `:${ shift ? 1 : 0 }:${ control ? 1 : 0 }:${ alt ? 1 : 0 }`;
    }
}

export function kbAction(key: Key | string, shift: boolean = false, control: boolean = false, alt: boolean = false) {
    return new PkKeyboardAction(key, shift, control);
}