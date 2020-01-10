import { PK2Context } from '@game/PK2Context';
import { PkResources } from '@ng/PkResources';

export abstract class PK2GameContext {
    protected mContext: PK2Context;
    
    protected constructor(ctx: PK2Context) {
        this.mContext = ctx;
    }
    
    public get resources(): PkResources {
        return this.mContext.resources;
    }
}
