import { AssetNotFoundError } from '@fwk/error/AssetNotFoundError';
import { PkFsNodeType } from '@fwk/filesystem/PkFsNode';
import { PkAssetTk } from '@fwk/toolkit/PkAssetTk';

export interface PkFs {
    resolves(url: string): boolean;
    
    ls(uri: string): Promise<{ name: string; type: PkFsNodeType }[]>;
    
    exists(uri: string): Promise<boolean>;
    
    getBuffer(uri: string): Promise<ArrayBuffer>;
}