import { Log } from '@ng/support/log/LoggerImpl';

export class PkSound {
    private readonly _audioCtx: AudioContext;
    private _native: AudioBuffer;
    
    public static async fromArrayBuffer(raw: ArrayBuffer): Promise<PkSound> {
        const sound = new PkSound();
        await sound.decode(raw);
        return sound;
    }
    
    private constructor() {
        if (window.AudioContext == null) {
            throw new Error(`AudioContext is not supported by this browser.`); // TODO: Change to unsuported excp.
        }
        this._audioCtx = new AudioContext();
    }
    
    private decode(buffer: ArrayBuffer): Promise<void> {
        return new Promise((resolve, reject) => {
            this._audioCtx.decodeAudioData(buffer,
                (buffer) => {
                    this._native = buffer;
                    resolve();
                },
                (msg) => {
                    reject(new Error(`Sound source couldn't be decoded: ${ msg }.`));
                });
        });
    }
    
    public play(volume: number = 1, pan: number = 0, freq: number = 1): void {
        const source = this._audioCtx.createBufferSource();
        source.buffer = this._native;
        
        // Volume
        const volNode = this._audioCtx.createGain();
        if (typeof volume !== 'number' || volume < 0 || volume > 1) {
            Log.w('[~Sound] Invalid volume value to play the sound: ', volume);
        } else {
            volNode.gain.value = volume;
        }
        
        // Pan
        const panNode = this._audioCtx.createStereoPanner();
        if (typeof pan !== 'number' || pan < -1 || pan > 1) {
            Log.w('[~Sound] Invalid pan value to play the sound: ', pan);
        } else {
            panNode.pan.value = pan;
        }
        
        // Frequency
        if (typeof freq !== 'number' || freq < 0) {
            Log.w('[~Sound] Invalid frequency value to play the sound: ', freq);
        } else {
            source.playbackRate.value = freq;
        }
        
        source.connect(panNode);
        panNode.connect(volNode);
        volNode.connect(this._audioCtx.destination);
        source.start(0);
    }
}