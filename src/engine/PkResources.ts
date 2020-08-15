import { ResourceFetchError } from '@ng/error/ResourceFetchError';
import { ResourceNotFoundError } from '@ng/error/ResourceNotFoundError';
import { pathJoin, cloneStruct } from '@ng/support/utils';
import { PkBinary } from '@ng/types/PkBinary';

/**
 * @deprecated Use PkAssetTk instead.
 */
export class PkResources {
    private _root: string;
    
    private _dirMapping: Map<string, VFsDirMapping>;
    
    public constructor(root: string) {
        this._root = root;
    }
    
    // public getPlainText(uri: string): Promise<string> {
    //
    // }
    
    // public fileExists(uri: string): Promise<boolean> {
    //     return (await this._xhrHead(uri)) === 200;
    // }
    
    public getParamFile(uri: string): Promise<any> {
    
    }
    
    public async getArrayBuffer(uri: string): Promise<ArrayBuffer> {
        return await this._xhrGet(uri, XHR_FMT.BINARY);
    }
    
    public async getBinary(uri: string): Promise<PkBinary> {
        return new PkBinary(await this.getArrayBuffer(uri));
    }
    
    public async getImage(uri: string): Promise<HTMLImageElement> {
        return new Promise(async (resolve, reject) => {
            try {
                const blob = await this.getBlob(uri);
                
                const url = URL.createObjectURL(blob);
                const image = new Image();
                image.onload = () => {
                    resolve(image);
                };
                image.src = url;
            } catch (err) {
                reject(err);
            }
        });
    }
    
    public getBitmap(uri: string): Promise<HTMLImageElement> {
    
    }
    
    public getSprite(uri: string): Promise<any> {
    
    }
    
    private async getBlob(uri: string): Promise<Blob> {
        return await this._xhrGet(uri, XHR_FMT.BLOB);
    }
    
    public async scanDir(uri: string, ignoreCached: boolean = false): Promise<VFsDirMapping> {
        if (!ignoreCached) {
            const cached = this._dirMapping.get(uri);
            if (cached != null) {
                return cloneStruct(cached);
            }
        }
        
        const json = await this._getJSON(pathJoin(uri, 'vfs.json'));
        
        let entry: string, node: { [key: string]: any };
        const nodes: VFsDirMapping = {};
        const jsonEntries = Object.keys(json);
        for (entry of jsonEntries) {
            node = jsonEntries[entry];
            nodes[entry] = {
                name: entry,
                type: node['type']
            };
        }
        
        this._dirMapping.set(uri, nodes);
        
        return cloneStruct(nodes);
    }
    
    private async _getJSON(uri: string): Promise<string> {
        const raw = await this._xhrGet(uri);
        return JSON.parse(raw as string);
    }
    
    private _xhrGet(uri: string, format?: XHR_FMT.TEXT): Promise<string>;
    private _xhrGet(uri: string, format: XHR_FMT.BINARY): Promise<ArrayBuffer>;
    private _xhrGet(uri: string, format: XHR_FMT.BLOB): Promise<Blob>;
    private _xhrGet(uri: string, format: XHR_FMT = XHR_FMT.TEXT): Promise<string | ArrayBuffer | Blob> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', pathJoin(this._root, uri), true);
            req.responseType = format;
            req.onreadystatechange = (aEvt) => {
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        return resolve(format === XHR_FMT.TEXT ? req.responseText : req.response);
                    } else if (req.status === 404) {
                        return reject(new ResourceNotFoundError(this._root, uri));
                    } else {
                        return reject(new ResourceFetchError(this._root, uri, 'status: ' + req.status));
                    }
                }
            };
            req.onerror = () => {
                return reject(new ResourceFetchError(this._root, uri, 'unknown error'));
            };
            req.send();
        });
    }
    
    private _xhrHead(uri: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('HEAD', pathJoin(this._root, uri), true);
            req.responseType = 'arraybuffer';
            req.onreadystatechange = (aEvt) => {
                return resolve(req.status);
            };
            req.onerror = () => {
                return resolve(-1);
            };
            req.send();
        });
    }
    
}

export class PkResource {

}

export enum VFSTYPE {
    FOLDER = 0,
    FILE
}

type VFsDirMapping = { [name: string]: VFsInfo };

export type VFsInfo = {
    name: string,
    type: VFSTYPE
};

enum XHR_FMT {
    BINARY = 'arraybuffer',
    BLOB = 'blob',
    TEXT = 'text'
}
