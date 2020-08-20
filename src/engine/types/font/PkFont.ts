import type { DwContainer } from '@ng/drawable/skeleton/DwContainer';

export interface PkFont {
    
    charWidth: number;
    
    writeText(text: string, target?: DwContainer, x?: number, y?: number): DwContainer;
}
