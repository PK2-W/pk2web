import { PkInputEventType } from '@ng/core/input/enum/PkInputEventType';
import { PkDeviceAction } from '@ng/core/input/PkDeviceAction';

export abstract class PkDeviceEvent {
    protected _deviceAction: PkDeviceAction;
    
    public readonly type: PkInputEventType;
    public readonly action: PkDeviceAction;
}