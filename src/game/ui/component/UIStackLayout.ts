import { PkUIComponentContainer } from '@fwk/ui/component/PkUIComponentContainer';
import { PkUIContext } from '@fwk/ui/PkUIContext';

export class UIStackLayout extends PkUIComponentContainer {
    private _rowHeight: number;
    private _rowSpacing: number;
    
    
    public constructor(context: PkUIContext, rowHeight: number, rowSpacing: number = 0) {
        super(context);
        
        this._rowHeight = rowHeight;
        this._rowSpacing = rowSpacing;
    }
    
    public layout(): void {
        let y = 0;
        
        for (let child of this._children) {
            child.y = y;
            y += this._rowHeight + this._rowSpacing;
        }
    }
}