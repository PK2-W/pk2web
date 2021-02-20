import { AssetFetchError } from '@fwk/error/AssetFetchError';
import { PkFs } from '@fwk/filesystem/PkFs';
import { PkFsNodeType } from '@fwk/filesystem/PkFsNode';
import { Log } from '@fwk/support/log/LoggerImpl';
import { ifnul, uriFilename } from '@fwk/support/utils';
import { PkPaletteBitmapResource } from '@fwk/texture/PkPaletteBitmapResource';
import { Bitmap3 } from '@fwk/types/bitmap/Bitmap3';
import { PkBitmapBT } from '@fwk/types/image/PkBitmapBT';
import { PkBinary } from '@fwk/types/PkBinary';
import { PkAudio, PkAudioType } from '@fwk/types/audio/PkAudio';

export class PkFilesystem {
    private _mountpoints: Map<string, PkFs>;
    
    public constructor() {
        this._mountpoints = new Map<string, PkFs>();
    }
    
    public add(mountpoint: string, fs: PkFs) {
        this._mountpoints.set(mountpoint, fs);
    }
    
    public get(mountpoint: string): PkFs {
        return ifnul(this._mountpoints.get(mountpoint));
    }
    
    public find(uri: string): { mp: string, fs: PkFs } {
        // Check for a mountpoint being the beginning of the URI
        const mountpoint = [...this._mountpoints.keys()].filter(mp => uri.indexOf(mp) === 0)[0];
        return mountpoint != null
            ? { mp: mountpoint, fs: this.get(mountpoint) }
            : null;
    }
    
    public _findOrFail(uri: string): { mp: string, fs: PkFs } {
        const fs = this.find(uri);
        if (fs == null) {
            throw new AssetFetchError(`There is no filesystem setup to handle '${ uri }'.`);
        }
        return fs;
    }
    
    private async _fetchOne<T>(fn: () => Promise<T>, uris: string[]): Promise<T> {
        const errors = [];
        
        for (let uri of uris) {
            try {
                return await fn.call(this, uri);
            } catch (err) {
                errors.push(err);
            }
        }
        
        throw new Error('Couldn\'t load the resource from any of the provided locations:\n' + errors.map(e => ' · ' + e.message).join('\n'));
    }
    
    /**
     * Given the URI of a directory, returns a list with its children's name and type.
     *
     * @param uri - URI of an existing directory.
     */
    public async ls(uri: string): Promise<{ name: string, type: PkFsNodeType }[]> {
        Log.d('[~Fs] Obtaining the list of elements under \'', uri, '\'');
        
        // Find the mountpoint that resolves the given URI
        const entry = this._findOrFail(uri);
        
        // Remove the mountpoint section from the URI and delegate the task
        uri = uri.substr(entry.mp.length);
        return entry.fs.ls(uri);
    }
    
    public async exists(uri: string): Promise<boolean> {
        Log.d('[~Fs] Checking existence of \'', uri, '\'');
        
        // Find the mountpoint that resolves the given URI
        const entry = this._findOrFail(uri);
        
        // Remove the mountpoint section from the URI and delegate the task
        uri = uri.substr(entry.mp.length);
        return entry.fs.exists(uri);
    }
    
    public async getArrayBuffer(uri: string, slave?: boolean): Promise<ArrayBuffer> {
        Log.d('[~Fs] Getting \'', uri, '\' as binary buffer');
        //Log.d('[~Fs] Checking existence of \'', uri, '\'');
        
        // Find the mountpoint that resolves the given URI
        const entry = this._findOrFail(uri);
        
        // Remove the mountpoint section from the URI and delegate the task
        uri = uri.substr(entry.mp.length);
        return entry.fs.getBuffer(uri);
    }
    
    public async getBinary(uri: string, slave?: boolean): Promise<PkBinary> {
        Log.d('[~Fs] Getting \'', uri, '\' as binary');
        return new PkBinary(await this.getArrayBuffer(uri, true));
    }
    
    public async getBinaryX(...uris: string[]/*, slave?: boolean*/): Promise<PkBinary> {
        if (uris.length === 0) {
            return null;
        } else if (uris.length > 1) {
            return this._fetchOne(this.getBinaryX, uris);
        } else {
            try {
                Log.d('[~Fs] Getting binary from {', uris[0], '}');
                const asset = new PkBinary(await this.getArrayBuffer(uris[0], true));
                asset['__delta'] = uris[0];
                return asset;
            } catch (err) {
                if (err instanceof AssetFetchError) err.type = 'binary';
                throw err;
            }
        }
    }
    
    /** @deprecated */
    public async getBitmap(uri: string): Promise<PkBitmapBT> {
        Log.d('[~Fs] Getting bitmap from {', uri, '}');
        return PkBitmapBT.fromBinary(await this.getBinary(uri, true));
    }
    
    /** @deprecated */
    public async getBitmap3(uri: string): Promise<Bitmap3> {
        Log.d('[~Fs] Getting bitmap3 from {', uri, '}');
        return Bitmap3.fromBinary(await this.getBinary(uri, true));
    }
    
    /** @deprecated */
    public async getBitmap3x(...uris: string[]): Promise<Bitmap3> {
        try {
            Log.d('[~Fs] Getting \'', uris[0], '\' as bitmap3');
            const asset = Bitmap3.fromBinary(await this.getBinaryX(...uris/*, true*/));
            if (asset != null) asset['__delta'] = uris[0];
            return asset;
        } catch (err) {
            if (err instanceof AssetFetchError) err.type = 'bitmap';
            throw err;
        }
    }
    
    public async getPaletteBitmap(...uris: string[]): Promise<PkPaletteBitmapResource> {
        try {
            Log.d('[~Fs] Getting \'', uris[0], '\' as palette bitmap');
            const asset = PkPaletteBitmapResource.fromBinary(await this.getBinaryX(...uris/*, true*/));
            if (asset != null) asset['__delta'] = uris[0];
            return asset;
        } catch (err) {
            if (err instanceof AssetFetchError) err.type = 'bitmap';
            throw err;
        }
    }
    
    public async getAudio(uri: string, type: PkAudioType): Promise<PkAudio> {
        Log.d('[~Fs] Getting \'', uri, '\' as audio file');
        return PkAudio.fromBinary(await this.getBinary(uri, true), type, uriFilename(uri));
    }
}