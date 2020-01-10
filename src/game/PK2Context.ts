import { PkInput } from '@ng/PkInput';
import { PkResources } from '@ng/PkResources';
import { PkEngine } from '../engine/PkEngine';
import { PkFont } from '../engine/PkFont';
import { PK2wSound } from '../engine/PK2wSound';
import { PkLanguage } from '../engine/PkLanguage';
import { GameTimer } from '../support/GameTimer';
import { i18nSchema } from '../support/i18nSchema';
import { int, FONTID } from '../support/types';

export abstract class PK2Context {
    // Fonts
    protected _fontti1: FONTID;
    protected _fontti2: FONTID;
    protected _fontti3: FONTID;
    protected _fontti4: FONTID;
    protected _fontti5: FONTID;
    
    // Translated texts
    protected _tx = i18nSchema;
    
    // (Piste) _engine
    protected _engine: PkEngine;
    
    public _degree: int = 0;
    
    public get fontti1(): FONTID {
        return this._fontti1;
    }
    
    public get fontti2(): FONTID {
        return this._fontti2;
    }
    
    public get fontti3(): FONTID {
        return this._fontti3;
    }
    
    public get fontti4(): FONTID {
        return this._fontti4;
    }
    
    public get fontti5(): FONTID {
        return this._fontti5;
    }
    
    public get degree(): number {
        return this._degree;
    }
    
    protected get ng(): PkEngine { return this._engine; }
    
    public get resources(): PkResources { return this._engine.resources; }
    
    public get tx(): PkLanguage { return this._engine.tx; }
    public get time(): GameTimer { return this._engine.gt; }
    public get input(): PkInput { return this._engine.input; }
    public get audio(): PK2wSound { return this._engine.audio; }
    
    public getFont(fontId: FONTID): PkFont {
        return this._engine.rendr.getFont(fontId);
    }
}
