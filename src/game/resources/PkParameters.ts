import { PkResourceBase } from '@fwk/filesystem/PkResource';
import { ifnul } from '@fwk/support/utils';
import { PekkaContext } from '@game/PekkaContext';

export class PkParameters extends PkResourceBase {
    private readonly _parameters: Map<string, string>;
    
    public static async fetch(uris: string[], context: PekkaContext, child: boolean = false) {
        // Get the file as plain text
        const text = await context.fs.fetchPlainText(uris, true);
        // Instance object
        const instance = new PkParameters(text.resource);
        // Assign the resource URI
        instance._uri = text.uri;
        
        return instance;
    }
    
    public constructor(raw: string) {
        super();
        
        this._parameters = new Map();
        this._parse(raw);
    }
    
    // public async load(uri: string): Promise<void> {
    //     if (this._collection.get(uri) != null) {
    //         this._uri = uri;
    //         this._parameters = this._collection[uri];
    //     }
    //
    //     try {
    //         const raw = await this.xhr(uri) as string;
    //         this._collection.set(uri, await this.parse(raw));
    //         this._uri = uri;
    //         this._parameters = this._collection.get(uri);
    //
    //         console.log(`Switched to language at "${ uri }"`);
    //     } catch (err) {
    //         console.warn(`Error fetching language at "${ uri }", nothing was done`, err);
    //     }
    // }
    
    private _parse(raw: string): void {
        const lines = raw.split(/\r?\n/);
        let l: number,
            key: string,
            line: string,
            data: string[];
        
        for (l = 0; l < lines.length; l++) {
            line = lines[l];
            
            if (line[0] !== '*')
                continue;
            
            data = line.split(/:\t+/);
            if (data.length !== 2) {
                throw new Error(`Unable to parse line ${ l }.`); // TODO: Concrete error
            }
            
            key = data[0].substr(1);
            
            this._parameters.set(key, data[1]);
        }
    }
    
    public get(param: string): string {
        if (this._parameters == null)
            return null;
        
        return ifnul(this._parameters.get(param));
    }
    
    // public getAll(): { [key: string]: string } {
    //     return Object.assign({}, this._params);
    // }
}
