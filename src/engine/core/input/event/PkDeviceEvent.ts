import { PkDeviceAction } from '@fwk/core/input/action/PkDeviceAction';
import { PkInputEventType } from '@fwk/core/input/enum/PkInputEventType';

export abstract class PkDeviceEvent {
    protected _deviceAction: PkDeviceAction;
    
    public readonly type: PkInputEventType;
    public readonly action: PkDeviceAction;
    
    /**
     * Determines if the action is triggered for second ore more times because the key or button is been holded.
     */
    public abstract isRepeated(): boolean;
}