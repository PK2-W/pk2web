import { PekkaContext } from '@game/PekkaContext';
import { PkParameters } from '@fwk/types/PkParameters';
import { PkScreen } from '@fwk/ui/PkScreen';

export class Screen extends PkScreen<PekkaContext> {
    
    protected constructor(context: PekkaContext) {
        super(context);
    }
    
    
    ///  Shortcuts  ///
    
    protected get tx(): PkParameters {
        return this.context.tx;
    }
}