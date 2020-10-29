import { AssetFetchError } from '@ng/error/AssetFetchError';
import { AssetNotFoundError } from '@ng/error/AssetNotFoundError';
import { PkFs } from '@ng/filesystem/PkFs';
import { PkFsNodeType, PkFsNode } from '@ng/filesystem/PkFsNode';
import { Log } from '@ng/support/log/LoggerImpl';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';

export class PkFsXHR implements PkFs {
    private static readonly _EMPTY_INDEX = {};
    
    private readonly _url: string;
    /**
     * List of patterns that are expected to be solved with a determined vfs file.
     */
    private readonly _vfsPatterns: RegExp[];
    private readonly _vfsRules: { for: RegExp, check: string, index?: any }[];
    private readonly _vfsIndex: Map<string, any>;
    
    public constructor(url: string, rules: { for: RegExp, check: string }[]) {
        this._vfsPatterns = [];
        this._vfsRules = [];
        this._vfsIndex = new Map();
        
        if (url[url.length - 1] === '/') {
            Log.w(`[~Fs/XHR] Ending slash in the URL must be omitted when creating a new instance`);
            url = url.replace(/\/+$/, '');
        }
        
        this._url = url;
        
        for (let rule of rules) {
            this._vfsRules.push(rule);
        }
    }
    
    public resolves(url: string): boolean {
        return url.indexOf(this._url) === 0;
    }
    
    private async _getIndex(rule, uri, isLs: boolean = false): Promise<any> {
        // Get VFS file path for the appropriate solver
        const vfsPath = uri.replace(rule.for, '$1vfs.json');
        Log.d(`[~Fs/XHR] VFS path is '${ vfsPath }'`);
        
        // Get the tree for the VFS file
        let index = this._vfsIndex.get(vfsPath);
        
        // If an index has not been adquired yet, get and save it
        if (index === undefined) {
            Log.d(`[~Fs/XHR] VFS index not yet obtained`);
            try {
                index = await PkAssetTk.getJSON(this._url + vfsPath);
            } catch (err) {
                // If the VFS file cannot be downloaded, use NULL (instead of undefiend)
                index = null;
                Log.d(`[~Fs/XHR] VFS index at '${ this._url + vfsPath }' cannot be obtained`, err);
            }
            this._vfsIndex.set(vfsPath, index);
        } else {
            Log.d(`[~Fs/XHR] VFS index already obtained`);
        }
        
        return index;
    }
    
    /**
     * For a given index (a VFS files & folders tree) look for the specief URI relative to the VFS root.
     *
     * @param index - A VFS index, probably obtained from {@link _vfsIndex} using {@link lookUp}.
     * @param uri   - The URI of the file/folder to find, relative to the VFS root.
     */
    private _getNode(index: any, uri: string): PkFsNode {
        const parts = uri.split('/');
        
        let currNodeName = '';
        let currNode = index;
        
        // If empty URI -> return root
        if (uri === '') {
            return {
                name: currNodeName,
                type: currNode === null ? PkFsNodeType.FILE : PkFsNodeType.FOLDER,
                children: Object.entries(currNode).map(entry => ({
                    name: entry[0],
                    type: entry[1] === null ? PkFsNodeType.FILE : PkFsNodeType.FOLDER
                }))
            };
        }
        
        // Traverse the URI parts in the index
        for (let i = 0; i < parts.length; i++) {
            currNodeName = parts[i];
            currNode = currNode[parts[i]];
            
            // UNDEFINED node -> 404
            if (currNode === undefined) {
                Log.d(`[~Fs/XHR] Node not found`);
                return null;
            }
        }
        
        // NULL node -> FOUND, but is a file
        // Other case -> FOUND, it's a folder
        if (currNode === null) {
            Log.d(`[~Fs/XHR] Node found; it's a file`);
            return {
                name: currNodeName,
                type: PkFsNodeType.FILE
            };
        } else {
            Log.d(`[~Fs/XHR] Node found; it's a folder`);
            return {
                name: currNodeName,
                type: PkFsNodeType.FOLDER,
                children: Object.entries(currNode).map(entry => ({
                    name: entry[0],
                    type: entry[1] === null ? PkFsNodeType.FILE : PkFsNodeType.FOLDER
                }))
            };
        }
    }
    
    /**
     * Gets the VFS index and traverses it to find the specified entry.<br>
     * The lookUp method never returns a null value, if there is any problem an Error is thrown.
     *
     * @param uri  -
     * @param isLs -
     */
    public async lookUp(uri: string, isLs: boolean = false) {
        // Check if there is a rule to solve the given URI
        // If the target is a directory, the rule must cover an inner (imaginary) file
        const ruleUri = isLs ? uri + '/*' : uri;
        const rule = this._vfsRules.filter(rule => rule.for.test(ruleUri))[0];
        if (rule == null) {
            Log.d(`[~Fs/XHR] No rule found`);
            throw new AssetNotFoundError(`There is no rule setup to resolve '${ ruleUri }'.`);
        }
        Log.d(`[~Fs/XHR] Using rule '${ rule.for }'`);
        
        // Check if the index has been already loaded
        const index = await this._getIndex(rule, ruleUri);
        if (index === null) {
            Log.d(`[~Fs/XHR] VFS index not available`);
            throw new AssetFetchError(`The VFS index to resolve '${ ruleUri }' cannot be obtained.`);
        }
        
        // Remove sections under the VFS root
        uri = uri.substr(ruleUri.replace(rule.for, '$1').length);
        
        Log.d(`[~Fs/XHR] Traversing index for '${ uri }'`);
        const node = this._getNode(index, uri);
        if (node == null) {
            throw new AssetNotFoundError(`The resource '${ uri }' couldn't be found in the responsible filesystem.`);
        }
        return node;
    }
    
    public async ls(uri: string): Promise<{ name: string; type: PkFsNodeType }[]> {
        const node = await this.lookUp(uri, true);
        if (node.type == PkFsNodeType.FILE || node.children == null) {
            throw new AssetFetchError(`Cannot list children of '${ uri }' because it's not a directory.`);
        }
        return node.children;
    }
    
    public async exists(uri: string): Promise<boolean> {
        try {
            await this.lookUp(uri);
            return true;
        } catch (err) {
            if (err instanceof AssetFetchError) {
                return false;
            } else {
                throw err;
            }
        }
    }
    
    public async getBuffer(uri: string): Promise<ArrayBuffer> {
        const url = this._url + uri;
        if (await this.exists(uri)) {
            return await PkAssetTk.getArrayBuffer(url);
        } else {
            throw new AssetNotFoundError(url);
        }
    }
    
    public async getBlob(uri: string): Promise<Blob> {
        const url = this._url + uri;
        if (await this.exists(uri)) {
            return await PkAssetTk.getBlob(url);
        } else {
            throw new AssetNotFoundError(url);
        }
    }
    
    public async getPlainText(uri: string): Promise<string> {
        const url = this._url + uri;
        if (await this.exists(uri)) {
            return await PkAssetTk.getPlainText(url);
        } else {
            throw new AssetNotFoundError(url);
        }
    }
}

enum XHR_FMT {
    BINARY = 'arraybuffer',
    BLOB = 'blob',
    TEXT = 'text'
}