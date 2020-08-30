import { AssetFetchError } from '@ng/error/AssetFetchError';
import { AssetNotFoundError } from '@ng/error/AssetNotFoundError';
import { Log } from '@ng/support/log/LoggerImpl';
import { PkFontAsset } from '@ng/types/font/PkFontAsset';
import { PkBitmapBT } from '@ng/types/image/PkBitmapBT';
import { PkImageBitmapBT } from '@ng/types/image/PkImageBitmapBT';
import { PkBinary } from '@ng/types/PkBinary';
import { PkParameters } from '@ng/types/PkParameters';
import { PkSound } from '@ng/types/PkSound';

export class PkAssetTk {
    private constructor() {
    }
    
    /**
     * Obtains the specified plain text file from the Internet.
     *
     * @param url - Full URL of the resource.
     */
    public static async getPlainText(url: string): Promise<string> {
        return await PkAssetTk._xhrGet(url, XHR_FMT.TEXT);
    }
    
    /**
     * Obtains the specified JSON file from the Internet.
     *
     * @param url - Full URL of the resource.
     */
    private static async getJSON(url: string): Promise<string> {
        return JSON.parse(await this.getPlainText(url));
    }
    
    // public fileExists(url: string): Promise<boolean> {
    //     return (await this._xhrHead(url)) === 200;
    // }
    
    /**
     * Obtains the specified parametrers file from the Internet.
     *
     * @param url - Full URL of the resource.
     */
    public static async getParamFile(url: string): Promise<any> {
        return new PkParameters(await this.getPlainText(url));
    }
    
    /**
     * Obtains the specified binary file, as a native ArrayBuffer, from the Internet.
     *
     * @param url - Full URL of the resource.
     */
    public static async getArrayBuffer(url: string): Promise<ArrayBuffer> {
        return await PkAssetTk._xhrGet(url, XHR_FMT.BINARY);
    }
    
    /**
     * Obtains the specified binary file, as a native Blob, from the Internet.
     *
     * @param url - Full URL of the resource.
     */
    private static async getBlob(url: string): Promise<Blob> {
        return await PkAssetTk._xhrGet(url, XHR_FMT.BLOB);
    }
    
    /**
     * Obtains the specified binary resource from the Internet.
     *
     * @param url - Full URL of the resource.
     */
    public static async getBinary(url: string): Promise<PkBinary> {
        return new PkBinary(await this.getArrayBuffer(url));
    }
    
    /**
     * Obtains the specified image resource from the Internet.
     *
     * @param urls - Full URL of the resource.
     */
    public static async getImage(...urls: string[]): Promise<PkImageBitmapBT> {
        if (urls.length === 0) {
            return null;
        } else if (urls.length > 1) {
            return PkAssetTk._fetchOne(this.getImage, urls);
        } else {
            return new Promise(async (resolve, reject) => {
                try {
                    const blob = await this.getBlob(urls[0]);
                    const ib = await createImageBitmap(blob);
                    
                    Log.v('[~AssetTk] Got image at {', urls[0], '}');
                    resolve(PkImageBitmapBT.fromImageBitmap(ib));
                    
                    // const bUrl = URL.createObjectURL(blob);
                    // const image = new Image();
                    // image.onload = () => {
                    //     Log.v('[~AssetTk] Loaded image: ' + url);
                    //     resolve(PkImageBitmapBT.fromImage(image)); //TODO Generalizar
                    // };
                    // image.src = bUrl;
                } catch (err) {
                    if (err instanceof AssetFetchError) err.type = 'image';
                    reject(err);
                }
            });
        }
    }
    
    /**
     * Obtains the specified bitmap resource from the Internet.
     *
     * @param url - Full URL of the resource.
     */
    public static async getBitmap(...urls: string[]): Promise<PkBitmapBT> {
        if (urls.length === 0) {
            return null;
        } else if (urls.length > 1) {
            return PkAssetTk._fetchOne(this.getBitmap, urls);
        } else {
            try {
                const asset = PkBitmapBT.fromBinary(await this.getBinary(urls[0]));
                Log.d('[~AssetTk] Got bitmap at {', urls[0], '}');
                return asset;
            } catch (err) {
                if (err instanceof AssetFetchError) err.type = 'bitmap';
                throw err;
            }
        }
    }
    
    /**
     * Obtains the specified sound resource from the Internet.
     *
     * @param url - Full URL of the resource.
     */
    public static async getSound(...urls: string[]): Promise<PkSound> {
        if (urls.length === 0) {
            return null;
        } else if (urls.length > 1) {
            return PkAssetTk._fetchOne(this.getBitmap, urls);
        } else {
            try {
                const asset = await PkSound.fromArrayBuffer(await this.getArrayBuffer(urls[0]));
                Log.d('[~AssetTk] Got sound at {', urls[0], '}');
                return asset;
            } catch (err) {
                if (err instanceof AssetFetchError) err.type = 'sound';
                throw err;
            }
        }
    }
    
    /**
     * Obtains the specified font resource from the Internet.
     *
     * @param url - Full URL of the resource.
     */
    public static async getFont(url: string): Promise<PkFontAsset> {
        Log.d('[PkAssetTk] Loading font from "', url, '"');
        
        try {
            return await PkFontAsset.from(url);
        } catch (err) {
            console.warn(`PD     - Font couldn't be loaded from "${ url }"`);
            throw err;
        }
    }
    
    // public static async getSprite(uri: string): Promise<any> {
    //
    // }
    
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
    
    private static async _fetchOne<T>(fn: () => Promise<T>, urls: string[]) {
        const errors = [];
        
        for (let url of urls) {
            try {
                return await fn.call(this, url);
            } catch (err) {
                errors.push(err);
            }
        }
        
        throw new Error('Couldn\'t load the resource from any of the provided locations:\n' + errors.map(e => ' · ' + e.message).join('\n'));
    }
    
    private static _xhrGet(uri: string, format?: XHR_FMT.TEXT): Promise<string>;
    private static _xhrGet(uri: string, format: XHR_FMT.BINARY): Promise<ArrayBuffer>;
    private static _xhrGet(uri: string, format: XHR_FMT.BLOB): Promise<Blob>;
    private static _xhrGet(uri: string, format: XHR_FMT = XHR_FMT.TEXT): Promise<string | ArrayBuffer | Blob> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', uri, true);
            req.responseType = format;
            req.onreadystatechange = (): any => {
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        return resolve(format === XHR_FMT.TEXT ? req.responseText : req.response);
                    } else if (req.status === 404) {
                        return reject(new AssetNotFoundError(uri));
                    } else {
                        return reject(new AssetFetchError(uri, 'status: ' + req.status));
                    }
                }
            };
            req.onerror = (): any => reject(new AssetFetchError(uri, 'unknown error'));
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
