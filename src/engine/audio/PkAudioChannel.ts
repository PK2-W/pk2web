import { ModuleAudioAdapter } from '@fwk/audio/ModuleAudioAdapter';
import { PkAudio } from '@fwk/types/audio/PkAudio';
import { uint } from '@sp/types';

export class PkAudioChannel {
    private readonly _actx: AudioContext;
    
    private _volume: uint;
    private _maxTracks: uint;
    private _tracks: ModuleAudioAdapter[];
    
    private _volumeNode: GainNode;
    
    public constructor() {
        if (window.AudioContext == null) {
            throw new Error(`AudioContext is not supported by this browser.`); // TODO: Change to unsuported excp.
        }
        this._actx = new AudioContext();
        this._volumeNode = this._actx.createGain();
        this._tracks = [];
        
        this._volumeNode.connect(this._actx.destination);
        
        this._volume = 1;
        this._maxTracks = 1;
    }
    
    public async play(audio: PkAudio) {
        if (this._tracks.length === this._maxTracks) {
            this._tracks[0].stop();
            this._tracks = this._tracks.slice(1);
        }
        
        const track = new ModuleAudioAdapter(this._actx, audio, this._volumeNode);
        this._tracks.push(track);
        await track.play();
    }
}