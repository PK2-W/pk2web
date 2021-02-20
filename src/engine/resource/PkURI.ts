import { pathJoin } from '@fwk/support/utils';

export class PkURI {
    /** Path of the resource on a known filesystem. */
    private _path: string;
    /** Name of the resource file. */
    private _filename: string;
    
    /** Concatenated {@link _path} plus {@link _filename}. Dynamically updated. */
    private _uri: string;
    
    public static $(path: string, filename: string): PkURI
    public static $(a: string, b: string): PkURI {
        return new PkURI(a, b);
    }
    
    private constructor(path: string, filename: string) {
        this._path = path;
        this._filename = filename;
        
        this._uri = pathJoin(path, filename);
    }
    
    public get path(): string { return this._path; }
    
    public get filename(): string { return this._filename; }
    
    public get(): string { return this._uri; }
}