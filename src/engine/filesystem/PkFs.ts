import { AssetNotFoundError } from '@ng/error/AssetNotFoundError';
import { PkFsNodeType } from '@ng/filesystem/PkFsNode';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';

export interface PkFs {
    resolves(url: string): boolean;
    
    ls(uri: string): Promise<{ name: string; type: PkFsNodeType }[]>;
    
    exists(uri: string): Promise<boolean>;
    
    getBuffer(uri: string): Promise<ArrayBuffer>;
}