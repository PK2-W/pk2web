import { PkInputEventType } from '@fwk/core/input/enum/PkInputEventType';
import { PkDeviceEvent } from '@fwk/core/input/event/PkDeviceEvent';

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
    
    public preventBubbling(): void {
        this._propagate = false;
    }
}

