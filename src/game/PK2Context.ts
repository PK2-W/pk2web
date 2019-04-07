import { Game } from '../engine/PK2wEngine';
import { PK2wFont } from '../engine/PK2wFont';
import { PK2wSound } from '../engine/PK2wSound';
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
    protected _engine: Game;
    
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
    
    public get tx(): typeof i18nSchema {
        return this._tx;
    }
    
    protected get ng(): Game {
        return this._engine;
    }
    
    public get gt(): GameTimer {
        return this._engine.gt;
    }
    
    public get audio(): PK2wSound {
        return this._engine.audio;
    }
    
    public getFont(fontId: FONTID): PK2wFont {
        return this._engine.rendr.getFont(fontId);
    }
}
