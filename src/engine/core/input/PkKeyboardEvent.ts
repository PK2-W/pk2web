import { PkInputEventType } from '@ng/core/input/enum/PkInputEventType';
import { PkDeviceAction } from '@ng/core/input/PkDeviceAction';
import { PkDeviceEvent } from '@ng/core/input/PkDeviceEvent';
import { PkKeyboardAction, kbAction } from '@ng/core/input/PkKeyboardAction';

export class PkKeyboardEvent extends PkDeviceEvent {
    protected _keyboardEvent: KeyboardEvent;
    protected _deviceAction: PkKeyboardAction;
    protected _eventType: PkInputEventType;
    
    
    public constructor(keyboardEvent: KeyboardEvent) {
        super();
        
        this._keyboardEvent = keyboardEvent;
        
        // Generate action
        this._deviceAction = kbAction(keyboardEvent.key, keyboardEvent.shiftKey, keyboardEvent.ctrlKey, keyboardEvent.altKey);
        
        // Extract type
        switch (this._keyboardEvent.type) {
            case 'keydown':
                this._eventType = PkInputEventType.DOWN;
                break;
            case 'keyup':
                this._eventType = PkInputEventType.UP;
                break;
        }
    }
    
    public get type(): PkInputEventType {
        return this._eventType;
    }
    
    public get action(): PkDeviceAction {
        return this._deviceAction;
    }
}