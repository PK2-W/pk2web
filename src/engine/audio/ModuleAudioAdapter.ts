/*
 front end wrapper class for format-specific player classes
 (c) 2015-2017 firehawk/tda
 */

import { PkError } from '@fwk/error/PkError';
import { PkAudio } from '@fwk/types/audio/PkAudio';
import { uint } from '@sp/types';

export class ModuleAudioAdapter {
    private _actx: AudioContext;
    
    private _audio: PkAudio;
    private _player;
    
    private _playing: boolean;
    private _samplerate: number;
    private _bufferlen: number;
    private _bufferstodelay: number;
    private _indRepeat: boolean;
    private _indAmiga500: boolean;
    private _indFilter: boolean;
    private _separation: uint;
    private _mixval: number;
    
    private _filterNode: BiquadFilterNode;
    private _lowpassNode: BiquadFilterNode;
    private _mixerNode: ScriptProcessorNode;
    private _outputNode: AudioNode;
    
    private _endofsong: boolean;
    private _paused: boolean;
    private _delayfirst: number;
    private _delayload: number;
    
    public constructor(audioContext: AudioContext, audio: PkAudio, outputNode: AudioNode) {
        this._actx = audioContext;
        this._outputNode = outputNode;
        this._audio = audio;
        
        // this._modPlayer=new Protracker();
        // this._s3mPlayer=new Screamtracker();
        this._player = new Fasttracker();
        
        // TODO
        
        //this.format = 's3m';
        
        this._separation = 1;
        this._mixval = 8.0;
        
        this._delayfirst = 0;
        this._indAmiga500 = false;
        this._indFilter = false;
        this._indRepeat = false;
        
        this._playing = false;
        this._paused = false;
        
        
        // this.autostart = false;
        // this._bufferstodelay = 4; // adjust this if you get stutter after loading new song
        this._delayload = 0;
        //
        // this.buffer = 0;
        // this._endofsong = false;
        
        //this.chvu = new Float32Array(32);
        
        // format-specific player
        //this.player = null;
        
        // read-only data from player class
        // this.title = '';
        // this.signature = '....';
        // this.songlen = 0;
        // this.channels = 0;
        // this.patterns = 0;
        // this.samplenames = new Array();
        this._setup();
        
        this._parse();
    }
    
    private _setup() {
        this._samplerate = this._actx.sampleRate ?? 44100;
        this._bufferlen = (this._samplerate > 44100) ? 4096 : 1024;
        
        // Amiga 500 fixed filter at 6kHz. WebAudio lowpass is 12dB/oct, whereas
        // older Amigas had a 6dB/oct filter at 4900Hz.
        this._filterNode = this._actx.createBiquadFilter();
        if (this._indAmiga500) {
            this._filterNode.frequency.value = 6000;
        } else {
            this._filterNode.frequency.value = 22050;
        }
        
        // "LED filter" at 3275kHz - off by default
        this._lowpassNode = this._actx.createBiquadFilter();
        this._setfilter(this._indFilter);
        
        // mixer
        if (typeof this._actx.createJavaScriptNode === 'function') {
            this._mixerNode = this._actx.createJavaScriptNode(this._bufferlen, 1, 2);
        } else {
            this._mixerNode = this._actx.createScriptProcessor(this._bufferlen, 1, 2);
        }
        this._mixerNode.onaudioprocess = (ev: AudioProcessingEvent) => this._mix(ev);
        
        // patch up some cables :)
        this._mixerNode.connect(this._filterNode);
        this._filterNode.connect(this._lowpassNode);
        this._lowpassNode.connect(this._actx.destination);
    }
    
    private _parse() {
        if (this._player.parse(this._audio.binary.getUint8Array())) {
            // copy static data from player
            //asset.title=asset.player.title
            //asset.signature=asset.player.signature;
            //asset.songlen=asset.player.songlen;
            //asset.channels=asset.player.channels;
            //asset.patterns=asset.player.patterns;
            //asset.filter=asset.player.filter;
            //if (asset.context) asset.setfilter(asset.filter);
            //asset.mixval=asset.player.mixval; // usually 8.0, though
            //asset.samplenames=new Array(32)
            //for(i=0;i<32;i++) asset.samplenames[i]="";
            //if (asset.format=='xm' || asset.format=='it') {
            //    for(i=0;i<asset.player.instrument.length;i++) asset.samplenames[i]=asset.player.instrument[i].name;
            //} else {
            //    for(i=0;i<asset.player.sample.length;i++) asset.samplenames[i]=asset.player.sample[i].name;
            //}
            //asset.state="ready.";
            //asset.loading=false;
            //asset.onReady();
            //if (asset.autostart) asset.play();
        } else {
            throw new PkError('Error parsing music file.');
        }
    }
    
    // play loaded and parsed module with webaudio context
    public play() {
        this._player.samplerate = this._samplerate;
        if (this._actx) this._setfilter(this._player.filter);
        
        if (this._player.paused) {
            this._player.paused = false;
            return true;
        }
        
        this._endofsong = false;
        this._player.endofsong = false;
        this._player.paused = false;
        this._player.initialize();
        this._player.flags = 1 + 2;
        this._player.playing = true;
        this._playing = true;
        
        // this.chvu = new Float32Array(this._player.channels);
        // for (let i = 0; i < this._player.channels; i++) this.chvu[i] = 0.0;
        
        this._player.delayfirst = this._bufferstodelay;
        return true;
    }
    
    
    // pause playback
    // Modplayer.prototype.pause = function()
    // {
    //     if (this.player) {
    //         if (!this.player.paused) {
    //             this.player.paused=true;
    //         } else {
    //             this.player.paused=false;
    //         }
    //     }
    // }
    
    
    // stop playback
    public stop() {
        this._paused = false;
        this._playing = false;
        if (this._player) {
            this._player.paused = false;
            this._player.playing = false;
            this._player.delayload = 1;
        }
    }
    
    
    // stop playing but don't call callbacks
    // Modplayer.prototype.stopaudio = function(st)
    // {
    //     if (this.player) {
    //         this.player.playing=st;
    //     }
    // }
    
    
    // jump positions forward/back
    // Modplayer.prototype.jump = function(step)
    // {
    //     if (this.player) {
    //         this.player.tick=0;
    //         this.player.row=0;
    //         this.player.position+=step;
    //         this.player.flags=1+2;
    //         if (this.player.position<0) this.player.position=0;
    //         if (this.player.position >= this.player.songlen) this.stop();
    //     }
    //     this.position=this.player.position;
    //     this.row=this.player.row;
    // }
    
    
    // set whether module repeats after songlen
    // Modplayer.prototype.setrepeat = function(rep)
    // {
    //     this.repeat=rep;
    //     if (this.player) this.player.repeat=rep;
    // }
    
    
    // set stereo separation mode (0=standard, 1=65/35 mix, 2=mono)
    // Modplayer.prototype.setseparation = function(sep)
    // {
    //     this.separation=sep;
    //     if (this.player) this.player.separation=sep;
    // }
    
    
    // set autostart to play immediately after loading
    // Modplayer.prototype.setautostart = function(st)
    // {
    //     this.autostart=st;
    // }
    
    
    // set amiga model - changes lowpass filter state
    // Modplayer.prototype.setamigamodel = function(amiga)
    // {
    //     if (amiga=="600" || amiga=="1200" || amiga=="4000") {
    //         this.amiga500=false;
    //         if (this.filterNode) this.filterNode.frequency.value=22050;
    //     } else {
    //         this.amiga500=true;
    //         if (this.filterNode) this.filterNode.frequency.value=6000;
    //     }
    // }
    
    
    // amiga "LED" filter
    private _setfilter(f) {
        if (f) {
            this._lowpassNode.frequency.value = 3275;
        } else {
            this._lowpassNode.frequency.value = 28867;
        }
        this._indFilter = f;
        this._player.filter = f;
    }
    
    
    // // are there E8x sync events queued?
    // Modplayer.prototype.hassyncevents = function()
    // {
    //     if (this.player) return (this.player.syncqueue.length != 0);
    //     return false;
    // }
    //
    //
    //
    // // pop oldest sync event nybble from the FIFO queue
    // Modplayer.prototype.popsyncevent = function()
    // {
    //     if (this.player) return this.player.syncqueue.pop();
    // }
    //
    //
    //
    // // ger current pattern number
    // Modplayer.prototype.currentpattern = function()
    // {
    //     if (this.player) return this.player.patterntable[this.player.position];
    // }
    
    // get current pattern in standard unpacked format (note, sample, volume, command, data)
    // note: 254=noteoff, 255=no note
    // sample: 0=no instrument, 1..255=sample number
    // volume: 255=no volume set, 0..64=set volume, 65..239=ft2 volume commands
    // command: 0x2e=no command, 0..0x24=effect command
    // data: 0..255
    // Modplayer.prototype.patterndata = function(pn)
    // {
    //     var i, c, patt;
    //     if (this.format=='mod') {
    //         patt=new Uint8Array(this.player.pattern_unpack[pn]);
    //         for(i=0;i<64;i++) for(c=0;c<this.player.channels;c++) {
    //             if (patt[i*5*this.channels+c*5+3]==0 && patt[i*5*this.channels+c*5+4]==0) {
    //                 patt[i*5*this.channels+c*5+3]=0x2e;
    //             } else {
    //                 patt[i*5*this.channels+c*5+3]+=0x37;
    //                 if (patt[i*5*this.channels+c*5+3]<0x41) patt[i*5*this.channels+c*5+3]-=0x07;
    //             }
    //         }
    //     } else if (this.format=='s3m') {
    //         patt=new Uint8Array(this.player.pattern[pn]);
    //         for(i=0;i<64;i++) for(c=0;c<this.player.channels;c++) {
    //             if (patt[i*5*this.channels+c*5+3]==255) patt[i*5*this.channels+c*5+3]=0x2e;
    //             else patt[i*5*this.channels+c*5+3]+=0x40;
    //         }
    //     } else if (this.format=='xm') {
    //         patt=new Uint8Array(this.player.pattern[pn]);
    //         for(i=0;i<this.player.patternlen[pn];i++) for(c=0;c<this.player.channels;c++) {
    //             if (patt[i*5*this.channels+c*5+0]<97)
    //                 patt[i*5*this.channels+c*5+0]=(patt[i*5*this.channels+c*5+0]%12)|(Math.floor(patt[i*5*this.channels+c*5+0]/12)<<4);
    //             if (patt[i*5*this.channels+c*5+3]==255) patt[i*5*this.channels+c*5+3]=0x2e;
    //             else {
    //                 if (patt[i*5*this.channels+c*5+3]<0x0a) {
    //                     patt[i*5*this.channels+c*5+3]+=0x30;
    //                 } else {
    //                     patt[i*5*this.channels+c*5+3]+=0x41-0x0a;
    //                 }
    //             }
    //         }
    //     }
    //     return patt;
    // }
    
    //
    // // check if a channel has a note on
    // Modplayer.prototype.noteon = function(ch)
    // {
    //     if (ch>=this.channels) return 0;
    //     return this.player.channel[ch].noteon;
    // }
    //
    //
    //
    // // get currently active sample on channel
    // Modplayer.prototype.currentsample = function(ch)
    // {
    //     if (ch>=this.channels) return 0;
    //     if (this.format=="xm" || this.format=="it") return this.player.channel[ch].instrument;
    //     return this.player.channel[ch].sample;
    // }
    //
    //
    //
    // // get length of currently playing pattern
    // Modplayer.prototype.currentpattlen = function()
    // {
    //     if (this.format=="mod" || this.format=="s3m") return 64;
    //     return this.player.patternlen[this.player.patterntable[this.player.position]];
    // }
    
    // scriptnode callback - pass through to player class
    private _mix(ape) {
        let t;
        
        // if (ape.srcElement) {
        //     mod=ape.srcElement.module;
        // } else {
        //     mod=this.module;
        // }
        
        if (this._player /*&& this._delayfirst==0*/) {
            this._player.repeat = this._indRepeat;
            
            var bufs = new Array(ape.outputBuffer.getChannelData(0), ape.outputBuffer.getChannelData(1));
            var buflen = ape.outputBuffer.length;
            this._player.mix(this._player, bufs, buflen);
            
            // apply stereo separation and soft clipping
            var outp = new Float32Array(2);
            for (var s = 0; s < buflen; s++) {
                outp[0] = bufs[0][s];
                outp[1] = bufs[1][s];
                
                // a more headphone-friendly stereo separation
                if (this._separation) {
                    t = outp[0];
                    if (this._separation == 2) { // mono
                        outp[0] = outp[0] * 0.5 + outp[1] * 0.5;
                        outp[1] = outp[1] * 0.5 + t * 0.5;
                    } else { // narrow stereo
                        outp[0] = outp[0] * 0.65 + outp[1] * 0.35;
                        outp[1] = outp[1] * 0.65 + t * 0.35;
                    }
                }
                
                // scale down and soft clip
                outp[0] /= this._mixval;
                outp[0] = 0.5 * (Math.abs(outp[0] + 0.975) - Math.abs(outp[0] - 0.975));
                outp[1] /= this._mixval;
                outp[1] = 0.5 * (Math.abs(outp[1] + 0.975) - Math.abs(outp[1] - 0.975));
                
                bufs[0][s] = outp[0];
                bufs[1][s] = outp[1];
            }
            
            // this._row=this._player.row;
            // this._position=this._player.position;
            // this._speed=this._player.speed;
            // this._bpm=this._player.bpm;
            this._endofsong = this._player.endofsong;
            
            if (this._player.filter != this._indFilter) {
                this._setfilter(this._player.filter);
            }
            
            if (this._endofsong && this._playing) this.stop();
            
            if (this._delayfirst > 0) this._delayfirst--;
            this._delayload = 0;
            
            // update this.chvu from player channel vu
            // for(let i=0;i<mod.player.channels;i++) {
            //     mod.chvu[i]=mod.chvu[i]*0.25 + mod.player.chvu[i]*0.75;
            //     mod.player.chvu[i]=0.0;
            // }
        }
        
        
    }
    
}