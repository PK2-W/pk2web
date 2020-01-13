import { PK2wSound } from '@ng/PK2wSound';
import { PkEngine } from '@ng/PkEngine';
import { PkFont } from '@ng/PkFont';
import { PkInput } from '@ng/PkInput';
import { PkLanguage } from '@ng/PkLanguage';
import { PkResources } from '@ng/PkResources';
import { GameTimer } from '../support/GameTimer';
import { i18nSchema } from '../support/i18nSchema';
import { int, FONTID, CVect, cvect, uint } from '../support/types';

export abstract class PK2Context {
    // Fonts
    protected _fontti1: FONTID;
    protected _fontti2: FONTID;
    protected _fontti3: FONTID;
    protected _fontti4: FONTID;
    protected _fontti5: FONTID;
    
    
    ///  Entropy & trigonometry  ///
    
    public _degree: int = 0;
    protected cosTable: CVect<number> = cvect(360);
    protected sinTable: CVect<number> = cvect(360);
    
    public get degree(): number {
        return this._degree;
    }
    public set degree(degree: number) {
        this._degree = degree;
    }
    
    public getCos(i: uint): number {
        return this.cosTable[i];
    }
    public getSin(i: uint): number {
        return this.sinTable[i];
    }
    
    
    ///  Translated texts  ///
    
    protected _tx = i18nSchema;
    
    // (Piste) _engine
    protected _engine: PkEngine;
    
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
    
    protected get ng(): PkEngine { return this._engine; }
    
    public get resources(): PkResources { return this._engine.resources; }
    
    /** @deprecated tengo que buscar algo mejor */
    public get screenWidth(): int {
        return 800;
    }
    /** @deprecated tengo que buscar algo mejor */
    public get screenHeight(): int {
        return 600;
    }
    
    public get tx(): PkLanguage { return this._engine.tx; }
    public get time(): GameTimer { return this._engine.gt; }
    public get input(): PkInput { return this._engine.input; }
    public get audio(): PK2wSound { return this._engine.audio; }
    
    public getFont(fontId: FONTID): PkFont {
        return this._engine.rendr.getFont(fontId);
    }
}
