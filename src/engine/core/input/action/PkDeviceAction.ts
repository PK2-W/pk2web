import { PkInputDevices } from '@fwk/core/input/enum/PkInputDevices';

/**
 * PkDeviceAction is a generic representation of a physical action performed by a physical or virtual device.<br>
 * For example, a keyboard or gamepad, or an on-screen keyboard.
 */
export class PkDeviceAction {
    protected _id: string;
    protected _fullId: string;
    
    /**
     * Type of device that triggers the action.
     */
    public readonly device: PkInputDevices;
    /**
     * Code that identifies uniquely the button or key actuated.
     */
    public readonly code: string;
    
    /**
     * Creates a new instance.
     *
     * @param device - Type of device that triggers the action.
     * @param code   - Code that identifies uniquely the button or key actuated.
     */
    public constructor(device: PkInputDevices, code: string) {
        this.device = device;
        this.code = code;
        
        this._id = `${ device }:${ code }`;
        this._fullId = this._id;
    }
    
    /**
     * Returns an ID for the actuated key in this device ignoring special keys or other modifiers.
     */
    public get id(): string {
        return this._id;
    }
    
    public get fullId(): string {
        return this._fullId;
    }
    
    /**
     * Determines if this action produces a printable character.
     */
    public isPrintable(): boolean {
        return false;
    }
    
    /**
     * If this action produces a printable character returns it.<br>
     * In other case returns NULL.
     */
    public getPrintable(): string | null {
        return null;
    }
    
    /**
     * Determines if this action was accompanied by some modifier, like <i>Ctrl</i> key in a keyboard, for example.
     */
    public hasModifiers(): boolean {
        return false;
    }
}