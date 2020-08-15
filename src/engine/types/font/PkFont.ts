import { DwContainer } from '@ng/drawable/skeleton/DwContainer';

export interface PkFont {
    
    charWidth: number;
    
    writeText(text: string, target?: DwContainer): DwContainer;
}
