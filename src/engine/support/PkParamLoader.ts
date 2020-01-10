import { RESOURCES_PATH } from '../../support/constants';
import { int } from '../../support/types';
import { PK2wLoader } from './PK2wLoader';

export class PkParamLoader /*extends PK2wLoader*/ {
    private readonly _collection: Map<string, { [key: string]: string }>;
    
    private _uri: string;
    private _params: { [key: string]: string };
    
    
    public constructor() {
        this._collection = new Map();
    }
    
    
    public async load(uri: string): Promise<void> {
        if (this._collection.get(uri) != null) {
            this._uri = uri;
            this._params = this._collection[uri];
        }
        
        try {
            const raw = await this.xhr(uri) as string;
            this._collection.set(uri, await this.parse(raw));
            this._uri = uri;
            this._params = this._collection.get(uri);
            
            console.log(`Switched to language at "${ uri }"`);
        } catch (err) {
            console.warn(`Error fetching language at "${ uri }", nothing was done`, err);
        }
    }
    
    private async parse(raw: string): Promise<{}> {
        const params = {};
        
        const lines = raw.split(/\r?\n/);
        let l: int,
            key: string,
            line: string,
            data: string[];
        
        for (l = 0; l < lines.length; l++) {
            line = lines[l];
            
            if (line[0] !== '*')
                continue;
            
            data = line.split(/:\t+/);
            if (data.length !== 2) {
                throw new Error(`Unable to parse line ${ l } from ${ this._uri }.`);
            }
            
            key = data[0].substr(1);
            params[key] = data[1];
        }
        
        return params;
    }
    
    private xhr(uri: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', RESOURCES_PATH + uri, true);
            req.onreadystatechange = (aEvt) => {
                if (req.readyState === 4) {
                    if (req.status !== 200) {
                        return reject();
                    }
                    
                    resolve(req.responseText);
                }
            };
            req.send();
        });
    }
    
    public get(param: string): string {
        if (this._params == null)
            return null;
        
        const txt = this._params[param];
        return (txt != null) ? txt : null;
    }
    
    // public getAll(): { [key: string]: string } {
    //     return Object.assign({}, this._params);
    // }
}
