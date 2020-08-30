import { DwContainer } from '@ng/drawable/dw/DwContainer';

export interface PkFont {
    
    charWidth: number;
    
    writeText(text: string, target?: DwContainer, x?: number, y?: number): DwContainer;
}
