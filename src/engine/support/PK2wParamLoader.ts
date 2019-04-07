import { int } from '../../support/types';
import { PK2wLoader } from './PK2wLoader';

export class PK2wParamLoader extends PK2wLoader {
    private readonly _params: { [key: string]: string };
    
    public static async load(uri: string): Promise<PK2wParamLoader> {
        const tmp = new PK2wParamLoader(uri);
        await tmp.load();
        return tmp;
    }
    
    private constructor(uri: string) {
        super(uri);
        
        this._params = {};
    }
    
    private async load(): Promise<void> {
        const raw = await super.xhr() as string;
        
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
            this._params[key] = data[1];
        }
    }
    
    public get(param: string): string {
        return this._params[param];
    }
}
