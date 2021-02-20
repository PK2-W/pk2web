import { DwContainer } from '@fwk/drawable/dw/DwContainer';

/**
 * A font-like resource able to write text according to their characteristics.
 */
export interface PkFont {
    /**
     * Width of each of the characters in this font.
     */
    charWidth: number;
    
    /**
     * Write the specified text to a drawable container using this font.
     *
     * @param text   - Text to write.
     * @param target - Target container to place the letters of the text. If not provided, a new one is created.
     * @param x      - X coordinate to start placing the text; default is 0.
     * @param y      - Y coordinate to start placing the text; default is 0.
     */
    writeText(text: string, target?: DwContainer, x?: number, y?: number): DwContainer;
}
