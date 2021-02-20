import { PkBinary } from '@fwk/types/PkBinary';

export enum PkAudioType {
    WAV,
    OGG,
    MP3,
    MOD,
    XM,
    S3M
}

export class PkAudio {
    private _binary: PkBinary;
    private _type: PkAudioType;
    private _name: string;
    
    public static fromBinary(binary: PkBinary, type: PkAudioType, name?: string): PkAudio {
        return new PkAudio(binary, type, name);
    }
    
    private constructor(binary: PkBinary, type: PkAudioType, name?: string) {
        this._binary = binary;
        this._type = type;
        this._name = name;
    }
    
    public get binary() {
        return this._binary;
    }
}