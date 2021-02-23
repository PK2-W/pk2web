import { AssetFetchError } from '@fwk/error/AssetFetchError';
import { PkFs } from '@fwk/filesystem/PkFs';
import { PkFsNodeType } from '@fwk/filesystem/PkFsNode';
import { PkNativeResource } from '@fwk/filesystem/PkNativeResource';
import { Log } from '@fwk/support/log/LoggerImpl';
import { ifnul, uriFilename } from '@fwk/support/utils';
import { PkPaletteBitmapResource } from '@fwk/texture/PkPaletteBitmapResource';
import { Bitmap } from '@fwk/shared/bx-bitmap';
import { PkFont } from '@fwk/types/font/PkFont';
import { PkFontAsset } from '@fwk/types/font/PkFontAsset';
import { PkBitmapBT } from '@fwk/types/image/PkBitmapBT';
import { PkBinary } from '@fwk/types/PkBinary';
import { PkAudio, PkAudioType } from '@fwk/types/audio/PkAudio';
import { PkParameters } from '@game/resources/PkParameters';
import { PkSound } from '@fwk/types/PkSound';

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
    
    /** @deprecated */
    private async _fetchOneOld<T>(fn: () => Promise<T>, uris: string[]): Promise<T> {
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
    
    private async _fetchOne<T>(fn: (...any: any[]) => Promise<T>, uris: string[], ...args: any[]): Promise<T> {
        const errors = [];
        
        for (let uri of uris) {
            try {
                return await fn.call(this, uri, ...args);
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
            return this._fetchOneOld(this.getBinaryX, uris);
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
    public async getBitmap3(uri: string): Promise<Bitmap> {
        Log.d('[~Fs] Getting bitmap3 from {', uri, '}');
        return Bitmap.fromBinary(await this.getBinary(uri, true));
    }
    
    /** @deprecated */
    public async getBitmap3x(...uris: string[]): Promise<Bitmap> {
        try {
            Log.d('[~Fs] Getting \'', uris[0], '\' as bitmap3');
            const asset = Bitmap.fromBinary(await this.getBinaryX(...uris/*, true*/));
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
    
    public async getSound(...uris: string[]): Promise<PkSound> {
        try {
            Log.d('[~Fs] Getting \'', uris[0], '\' as sound');
            const asset = PkSound.fromBinary(await this.getBinaryX(...uris/*, true*/));
            if (asset != null) asset['__delta'] = uris[0];
            return asset;
        } catch (err) {
            if (err instanceof AssetFetchError) err.type = 'sound';
            throw err;
        }
    }
    
    /**
     * Obtains the specified parametrers file from the Internet.
     *
     * @param url - Full URL of the resource.
     */
    public async getParamFile(url: string): Promise<any> {
        return new PkParameters(await this.getPlainText(url));
    }
    
    public async getPlainText(uri: string): Promise<string> {
        Log.d('[~Fs] Getting \'', uri, '\' as plain text');
        //Log.d('[~Fs] Checking existence of \'', uri, '\'');
        
        // Find the mountpoint that resolves the given URI
        const entry = this._findOrFail(uri);
        
        // Remove the mountpoint section from the URI and delegate the task
        uri = uri.substr(entry.mp.length);
        return entry.fs.getPlainText(uri);
    }
    
    /**
     *
     * @param uris
     * @param isChild
     */
    public async fetchPlainText(uris: string[], isChild: boolean = false): Promise<PkNativeResource<string>> {
        if (uris.length === 0) {
            return null;
        } else if (uris.length > 1) {
            return this._fetchOne(this.fetchPlainText, uris, isChild);
        } else {
            try {
                let uri = uris[0];
                
                Log.d('[~Fs] Getting plain text from {', uris[0], '}');
                
                // Find the mountpoint that resolves the given URI
                const entry = this._findOrFail(uris[0]);
                
                // Remove the mountpoint section from the URI and delegate the task
                uri = uri.substr(entry.mp.length);
                return {
                    resource: await entry.fs.getPlainText(uri),
                    uri: uris[0]
                };
            } catch (err) {
                if (err instanceof AssetFetchError) err.type = 'plain text';
                throw err;
            }
        }
    }
    
    /**
     *
     * @param uris
     * @param isChild
     */
    public async fetchBinary(uris: string[], isChild: boolean = false): Promise<PkNativeResource<PkBinary>> {
        if (uris.length === 0) {
            return null;
        } else if (uris.length > 1) {
            return this._fetchOne(this.fetchBinary, uris, isChild);
        } else {
            try {
                let uri = uris[0];
                
                Log.d('[~Fs] Getting binary from {', uris[0], '}');
                
                return {
                    resource: new PkBinary(await this.getArrayBuffer(uris[0], true)),
                    uri: uris[0]
                };
            } catch (err) {
                if (err instanceof AssetFetchError) err.type = 'binary';
                throw err;
            }
        }
    }
}