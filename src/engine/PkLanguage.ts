//#########################aaa
//PisteEngine - PisteLanguage
//by Janne Kivilahti from Piste Gamez
//#########################

import { TTextId } from '@game/support/types';
import { PkAssetTk } from '@fwk/toolkit/PkAssetTk';
import { PkParameters } from '@fwk/types/PkParameters';


const LUE_SKIP: number = 0;
const LUE_OTSIKKO: number = 1;
const LUE_TEKSTI: number = 2;

const MARKER_1 = '*';
const MARKER_2 = ':';

const MAX_TEXTS: number = 200;
const MAX_TEXT_LENGTH: number = 80;
const MAX_HEAD_LENGTH: number = 50;


export class PkLanguage {
    private _loader: PkParameters;
    
    
    public constructor() {
        //this._loader = new PkParameters();
    }
    
    
    public async load(uri: string): Promise<void> {
        this._loader = await PkAssetTk.getParamFile(uri);
    }
    
    public destroy() {
    }
    
    public get(textId: TTextId): string {
        return this._loader.get(textId);
    }
    
    
    /** @deprecated */
    public Hae_Indeksi() {}
    
    /** @deprecated */
    public Hae_Teksti() {}
    
    // void PisteLanguage::Korvaa_Teksti(number index, char *teksti){
    // 	if (index >= 0 && index < MAX_TEXTS)
    // 		strcpy(tekstit[index],teksti);
    // }
}
