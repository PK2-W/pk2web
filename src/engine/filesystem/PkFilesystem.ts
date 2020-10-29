import { AssetFetchError } from '@ng/error/AssetFetchError';
import { PkFs } from '@ng/filesystem/PkFs';
import { PkFsNodeType } from '@ng/filesystem/PkFsNode';
import { Log } from '@ng/support/log/LoggerImpl';
import { ifnul } from '@ng/support/utils';
import { PkBitmapBT } from '@ng/types/image/PkBitmapBT';
import { PkBinary } from '@ng/types/PkBinary';

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
        Log.d('[~Fs] Getting binary buffer from {', uri, '}');
        //Log.d('[~Fs] Checking existence of \'', uri, '\'');
        
        // Find the mountpoint that resolves the given URI
        const entry = this._findOrFail(uri);
        
        // Remove the mountpoint section from the URI and delegate the task
        uri = uri.substr(entry.mp.length);
        return entry.fs.getBuffer(uri);
    }
    
    public async getBinary(uri: string, slave?: boolean): Promise<PkBinary> {
        Log.d('[~Fs] Getting binary from {', uri, '}');
        return new PkBinary(await this.getArrayBuffer(uri, true));
    }
    
    public async getBitmap(uri: string): Promise<PkBitmapBT> {
        Log.d('[~Fs] Getting bitmap from {', uri, '}');
        return PkBitmapBT.fromBinary(await this.getBinary(uri, true));
    }
}