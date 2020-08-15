import { PK2Context } from '@game/PK2Context';
import { PkParameters } from '@ng/types/PkParameters';
import { PkScreen } from '@ng/ui/PkScreen';

export class Screen extends PkScreen<PK2Context> {
    
    protected constructor(context: PK2Context) {
        super(context);
    }
    
    
    ///  Shortcuts  ///
    
    protected get tx(): PkParameters {
        return this._context.tx;
    }
}