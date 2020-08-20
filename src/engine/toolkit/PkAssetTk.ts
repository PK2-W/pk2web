import { ResourceFetchError } from '@ng/error/ResourceFetchError';
import { ResourceNotFoundError } from '@ng/error/ResourceNotFoundError';
import { Log } from '@ng/support/log/LoggerImpl';
import { PkFontAsset } from '@ng/types/font/PkFontAsset';
import { PkBitmapImpl } from '@ng/types/pixi/PkBitmapImpl';
import { PkImageImpl } from '@ng/types/pixi/PkImageImpl';
import { PkBinary } from '@ng/types/PkBinary';
import { PkBitmap } from '@ng/types/PkBitmap';
import { PkImage } from '@ng/types/PkImage';
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
     * @param url - Full URL of the resource.
     */
    public static async getImage(url: string): Promise<PkImage> {
        return new Promise(async (resolve, reject) => {
            try {
                const blob = await this.getBlob(url);
                
                const bUrl = URL.createObjectURL(blob);
                const image = new Image();
                image.onload = () => {
                    Log.v('[~AssetTk] Loaded image: ' + url);
                    resolve(PkImageImpl.from(image)); //TODO Generalizar
                };
                image.src = bUrl;
            } catch (err) {
                reject(err);
            }
        });
    }
    
    /**
     * Obtains the specified bitmap resource from the Internet.
     *
     * @param url - Full URL of the resource.
     */
    public static async getBitmap(url: string): Promise<PkBitmap> {
        return PkBitmapImpl.fromBinary(
            await this.getBinary(url));
    }
    
    /**
     * Obtains the specified sound resource from the Internet.
     *
     * @param url - Full URL of the resource.
     */
    public static async getSound(url: string): Promise<PkSound> {
        Log.d('[PkAssetTk] Getting sound at "', url, '"...');
        const raw = await this.getArrayBuffer(url);
        return await PkSound.fromArrayBuffer(raw);
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
