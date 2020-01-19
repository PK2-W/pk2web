import { PK2Context } from '@game/PK2Context';
import { PkResources } from '@ng/PkResources';
import { uint } from '../support/types';

export abstract class PK2GameContext {
    protected _context: PK2Context;
    
    protected constructor(ctx: PK2Context) {
        this._context = ctx;
    }
    
    
    ///  Entropy & trigonometry  ///
    
    public get degree(): number {
        return this._context.degree;
    }
    
    public getCos(i: uint): number {
        return this._context.getCos(i);
    }
    
    public getSin(i: uint): number {
        return this._context.getSin(i);
    }
    
    
    //--
    
    public get resources(): PkResources {
        return this._context.resources;
    }
}
