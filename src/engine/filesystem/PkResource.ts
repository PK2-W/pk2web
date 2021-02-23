export interface PkResource {
    readonly uri: string;
}

export class PkResourceBase implements PkResource {
    protected _uri: string;
    
    public get uri(): string {
        return this._uri;
    }
}