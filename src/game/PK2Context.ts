import { Entropy } from '@game/Entropy';
import { FONT } from '@game/PK2';
import { PK2wSound } from '@ng/core/PK2wSound';
import { PkDevice } from '@ng/core/PkDevice';
import { PkEngine } from '@ng/core/PkEngine';
import { PkFontAsset } from '@ng/types/font/PkFontAsset';
import { PkInput } from '@ng/core/PkInput';
import { PkLanguage } from '@ng/PkLanguage';
import { PkResources } from '@ng/PkResources';
import { ifnul } from '@ng/support/utils';
import { PkFont } from '@ng/types/font/PkFont';
import { PkFontHolder } from '@ng/types/font/PkFontHolder';
import { PkParameters } from '@ng/types/PkParameters';
import { GameTimer } from '@ng/core/GameTimer';
import { PkUIContext } from '@ng/ui/PkUIContext';
import { i18nSchema } from '../support/i18nSchema';
import { FONTID } from './support/types';

export abstract class PK2Context implements PkUIContext {
    // Game engine
    protected _engine: PkEngine;
    
    // Translated texts
    protected _tx = i18nSchema;
    protected _language: PkParameters;
    
    // Fonts
    protected readonly _font1: PkFontHolder;
    protected readonly _font2: PkFontHolder;
    protected readonly _font3: PkFontHolder;
    protected readonly _font4: PkFontHolder;
    protected readonly _font5: PkFontHolder;
    
    
    ///  Entropy & trigonometry  ///
    
    protected _entropy: Entropy;
    public get entropy(): Entropy {
        return this._entropy;
    }
    
    
    protected constructor() {
        this._entropy = new Entropy();
        
        this._font1 = new PkFontHolder('1');
        this._font2 = new PkFontHolder('2');
        this._font3 = new PkFontHolder('3');
        this._font4 = new PkFontHolder('4');
        this._font5 = new PkFontHolder('5');
    }
    
    protected get ng(): PkEngine {
        return this._engine;
    }
    public get device(): PkDevice { return this.ng.device; };
    
    public get font1(): PkFont { return this._font1; }
    public get font2(): PkFont { return this._font2; }
    public get font3(): PkFont { return this._font3; }
    public get font4(): PkFont { return this._font4; }
    public get font5(): PkFont { return this._font5; }
    
    public get tx(): PkParameters {
        return this._language;
    }
    /** @deprecated */
    public get time(): GameTimer {
        return this._engine.gt;
    }
    public get input(): PkInput {
        return this._engine.input;
    }
    public get audio(): PK2wSound {
        return this._engine.audio;
    }
    
    public getFont(_fontId: FONTID): PkFontAsset {
        return undefined;
    }
}
