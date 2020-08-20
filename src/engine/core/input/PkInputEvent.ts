import { PkInputEventType } from '@ng/core/input/enum/PkInputEventType';
import { PkDeviceEvent } from '@ng/core/input/PkDeviceEvent';

export class PkInputEvent {
    public readonly deviceEvent: PkDeviceEvent;
    public readonly gameActns: (number | string)[];
    private _propagate: boolean;
    
    constructor(deviceEvnt: PkDeviceEvent, gameActns: (number | string)[]) {
        this.deviceEvent = deviceEvnt;
        this.gameActns = [...gameActns];
        
        this._propagate = true;
    }
    
    public get type(): PkInputEventType {
        return this.deviceEvent.type;
    }
    
    public get propagate(): boolean {
        return this._propagate;
    }
    
    public preventPropagation(): void {
        this._propagate = false;
    }
}

