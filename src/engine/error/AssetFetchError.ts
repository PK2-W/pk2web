import { PkError } from '@fwk/error/PkError';

export class AssetFetchError extends PkError {
    public uri: string;
    public type: string;
    public info: string;
    
    public constructor(uri: string, info?: string) {
        super();
        this.name = 'AssetFetchError';
        
        this.uri = uri;
        this.info = info;
        // this.message = `Resource at [${ uri }] couldn't be loaded (${ info }).`;
    }
    
    public get message() {
        return `Asset` + (this.type ? ` of type {${ this.type }}` : '') + ` at {${ this.uri }} couldn't be loaded (${ this.info }).`;
    }
}
