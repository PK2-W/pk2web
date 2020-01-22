import { ResourceFetchError } from '@ng/error/ResourceFetchError';
import { ResourceNotFoundError } from '@ng/error/ResourceNotFoundError';
import { Binary } from '@ng/support/Binary';
import { Log } from '@ng/support/log/LoggerImpl';

export class PkAssetTk {
    private constructor() {
    }
    
    // public getPlainText(uri: string): Promise<string> {
    //
    // }
    
    // public fileExists(uri: string): Promise<boolean> {
    //     return (await this._xhrHead(uri)) === 200;
    // }
    
    // public static getParamFile(uri: string): Promise<any> {
    //
    // }
    
    public static async getArrayBuffer(uri: string): Promise<ArrayBuffer> {
        return await PkAssetTk.xhrGet(uri, XHR_FMT.BINARY);
    }
    
    public static async getBinary(uri: string): Promise<Binary> {
        return new Binary(await this.getArrayBuffer(uri));
    }
    
    public static async getImage(uri: string): Promise<HTMLImageElement> {
        return new Promise(async (resolve, reject) => {
            try {
                const blob = await this.getBlob(uri);
                
                const url = URL.createObjectURL(blob);
                const image = new Image();
                image.onload = () => {
                    Log.d('Loaded image: ' + uri);
                    resolve(image);
                };
                image.src = url;
            } catch (err) {
                reject(err);
            }
        });
    }
    
    // public static async getBitmap(uri: string): Promise<HTMLImageElement> {
    //
    // }
    
    // public static async getSprite(uri: string): Promise<any> {
    //
    // }
    
    private static async getBlob(uri: string): Promise<Blob> {
        return await PkAssetTk.xhrGet(uri, XHR_FMT.BLOB);
    }
    
    // public async scanDir(uri: string, ignoreCached: boolean = false): Promise<VFsDirMapping> {
    //     if (!ignoreCached) {
    //         const cached = this._dirMapping.get(uri);
    //         if (cached != null) {
    //             return cloneStruct(cached);
    //         }
    //     }
    //
    //     const json = await this._getJSON(pathJoin(uri, 'vfs.json'));
    //
    //     let entry: string, node: { [key: string]: any };
    //     const nodes: VFsDirMapping = {};
    //     const jsonEntries = Object.keys(json);
    //     for (entry of jsonEntries) {
    //         node = jsonEntries[entry];
    //         nodes[entry] = {
    //             name: entry,
    //             type: node['type']
    //         };
    //     }
    //
    //     this._dirMapping.set(uri, nodes);
    //
    //     return cloneStruct(nodes);
    // }
    
    private static async getJSON(uri: string): Promise<string> {
        const raw = await PkAssetTk.xhrGet(uri);
        return JSON.parse(raw);
    }
    
    private static xhrGet(uri: string, format?: XHR_FMT.TEXT): Promise<string>;
    private static xhrGet(uri: string, format: XHR_FMT.BINARY): Promise<ArrayBuffer>;
    private static xhrGet(uri: string, format: XHR_FMT.BLOB): Promise<Blob>;
    private static xhrGet(uri: string, format: XHR_FMT = XHR_FMT.TEXT): Promise<string | ArrayBuffer | Blob> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', uri, true);
            req.responseType = format;
            req.onreadystatechange = (): any => {
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        return resolve(format === XHR_FMT.TEXT ? req.responseText : req.response);
                    } else if (req.status === 404) {
                        return reject(new ResourceNotFoundError(null, uri));
                    } else {
                        return reject(new ResourceFetchError(uri, 'status: ' + req.status));
                    }
                }
            };
            req.onerror = (): any => reject(new ResourceFetchError(uri, 'unknown error'));
            req.send();
        });
    }
    
    // private _xhrHead(uri: string): Promise<number> {
    //     return new Promise((resolve, reject) => {
    //         const req = new XMLHttpRequest();
    //         req.open('HEAD', pathJoin(this._root, uri), true);
    //         req.responseType = 'arraybuffer';
    //         req.onreadystatechange = (aEvt) => {
    //             return resolve(req.status);
    //         };
    //         req.onerror = () => {
    //             return resolve(-1);
    //         };
    //         req.send();
    //     });
    // }
}

enum XHR_FMT {
    BINARY = 'arraybuffer',
    BLOB = 'blob',
    TEXT = 'text'
}
