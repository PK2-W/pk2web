import { PkInputDevices } from '@ng/core/input/enum/PkInputDevices';

export class PkDeviceAction {
    protected _id: string;
    
    protected readonly _device: PkInputDevices;
    protected readonly _key: string;
    
    public constructor(device: PkInputDevices, key: string) {
        this._device = device;
        this._key = key;
        
        this._id = `${ device }:${ key }`;
    }
    
    public get id(): string {
        return this._id;
    }
    
    /**
     * Returns an ID for the actuated key in this device ignoring special keys or other modifiers.
     */
    public get keyId(): string {
        return `${ this._device }:${ this._key }`;
    }
}