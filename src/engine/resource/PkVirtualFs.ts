import { trim } from '@ng/support/utils';
import { RESOURCES_PATH } from '../../support/constants';

export class PkVirtualFs {
    private readonly _root: VFolder;
    
    public constructor(root: string) {
        this._root = new VFolder(root);
    }
    
    public async scanDir(uri: string) {
        const vfsFile = uri.replace(/\/$/, '') + '/vfsmap';
        
        
    }
    
    private fetchVFsFile(uri: string) {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', PkVirtualFs.join(this._root, this._uri), true);
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
    
    public static join(...segments: string[]): string {
        let out = '';
        
        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i];
            
            out += trim(segment).replace(DUPL_SLASH_RX, '/');
            
            // Add final slash
            if (i < segments.length - 1 && segment.lastIndexOf('/') !== segment.length - 1) {
                out += '/';
            }
        }
        
        return out;
    }
}

abstract class VNode {
    private _parent: VNode;
    
    protected constructor(parent: VFolder) {
        this._parent = parent;
    }
}

class VFolder extends VNode {
    
    private _scanned: boolean;
    
    public constructor(parent: string|VFolder) {
        super(parent);
    }
    
}

class VFile extends VNode {
    public constructor(parent: VFolder) {
        super(parent);
    }
    
}
