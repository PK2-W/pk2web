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
                    reject(new Error(`Sound source could't be decoded: ${ msg }.`));
                });
        });
    }
    
    public play(): void {
        const source = this._audioCtx.createBufferSource();
        source.buffer = this._native;
        source.connect(this._audioCtx.destination);
        // source.detune.value = // value of pitch
        source.start(0);
    }
}