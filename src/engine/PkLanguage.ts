//#########################aaa
//PisteEngine - PisteLanguage
//by Janne Kivilahti from Piste Gamez
//#########################

import { int, TEXTID } from '../support/types';
import { PkParamLoader } from './support/PkParamLoader';


const LUE_SKIP: int = 0;
const LUE_OTSIKKO: int = 1;
const LUE_TEKSTI: int = 2;

const MARKER_1 = '*';
const MARKER_2 = ':';

const MAX_TEXTS: int = 200;
const MAX_TEXT_LENGTH: int = 80;
const MAX_HEAD_LENGTH: int = 50;


export class PkLanguage {
    private _loader: PkParamLoader;
    
    
    public constructor() {
        this._loader = new PkParamLoader();
    }
    
    
    public async load(uri: string): Promise<void> {
        await this._loader.load(uri);
    }
    
    public destroy() {
    }
    
    public get(textId: TEXTID): string {
        return this._loader.get(textId);
    }
    
    
    /** @deprecated */
    public Hae_Indeksi() {}
    
    /** @deprecated */
    public Hae_Teksti() {}
    
    // void PisteLanguage::Korvaa_Teksti(int index, char *teksti){
    // 	if (index >= 0 && index < MAX_TEXTS)
    // 		strcpy(tekstit[index],teksti);
    // }
}
