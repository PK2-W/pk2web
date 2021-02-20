import { AssetFetchError } from '@fwk/error/AssetFetchError';

export class AssetNotFoundError extends AssetFetchError {
    public constructor(uri: string) {
        super(uri);
        this.name = 'AssetNotFoundError';
    }
    
    public get message() {
        return `Asset` + (this.type ? ` of type {${ this.type }}` : '') + ` at {${ this.uri }} couldn't be found.`;
    }
}
