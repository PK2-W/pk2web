import { Binary } from '@ng/support/Binary';
import { pathJoin, cloneStruct } from '@ng/support/utils';

export class PkResources {
    private _root: string;
    
    private _dirMapping: Map<string, VFsDirMapping>;
    
    public constructor(root: string) {
        this._root = root;
    }
    
    // public getPlainText(uri: string): Promise<string> {
    //
    // }
    
    public getParamFile(uri: string): Promise<any> {
    
    }
    
    public async getArrayBuffer(uri: string): Promise<ArrayBuffer> {
        return (await this._xhrGet(uri, true)) as ArrayBuffer;
    }
    
    public async getBinary(uri: string): Promise<Binary> {
        return new Binary(await this.getArrayBuffer(uri));
    }
    
    public getImage(uri: string): Promise<HTMLImageElement> {
    
    }
    
    public getBitmap(uri: string): Promise<HTMLImageElement> {
    
    }
    
    public getSprite(uri: string): Promise<any> {
    
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
    
    private _xhrGet(uri: string, binary: boolean = false): Promise<string | ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', pathJoin(this._root, uri), true);
            req.responseType = binary ? 'arraybuffer' : 'text';
            req.onreadystatechange = (aEvt) => {
                if (req.readyState === 4) {
                    if (req.status !== 200) {
                        return reject();
                    }
                    
                    return resolve(binary ? req.response : req.responseText);
                }
            };
            req.onerror = () => {
                return reject();
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
