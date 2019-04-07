//#########################aaa
//PisteEngine - PisteLanguage
//by Janne Kivilahti from Piste Gamez
//#########################

import { int } from '../support/types';
import { PK2wParamLoader } from './support/PK2wParamLoader';


const LUE_SKIP: int = 0;
const LUE_OTSIKKO: int = 1;
const LUE_TEKSTI: int = 2;

const MARKER_1 = '*';
const MARKER_2 = ':';

const MAX_TEXTS: int = 200;
const MAX_TEXT_LENGTH: int = 80;
const MAX_HEAD_LENGTH: int = 50;


type TranslationTable = {
    [key: string]: string
};


export class PK2wLanguage {
    // private char tekstit[MAX_TEXTS][MAX_TEXT_LENGTH+1];
    // private char otsikot[MAX_TEXTS][MAX_HEAD_LENGTH+1];
    
    private read: int;
    
    private translations: { [lang: string]: TranslationTable };
    private translationKey: string;
    private translation: TranslationTable;
    
    private _loader: PK2wParamLoader;
    
    
    public constructor() {
        this.translations = {};
        
        this.read = LUE_SKIP;
        for (let i = 0; i < MAX_TEXTS; i++) {
            // strcpy(tekstit[i], '');
            // strcpy(otsikot[i], '');
        }
        
    }
    
    public async load(uri: string): Promise<void> {
        this._loader = await PK2wParamLoader.load(uri);
    }
    
    // Not used
    // constructor(char *tiedosto);
    
    public destroy() {
    }
    
    // bool PisteLanguage::Read_File(char *filename){
    //
    // 	ifstream *tiedosto = new ifstream(filename, ios::in);
    //
    // 	if (tiedosto->fail()){
    // 		delete (tiedosto);
    // 		return false;
    // 	}
    //
    // 	for (int i=0;i<MAX_TEXTS;i++){
    // 		strcpy(tekstit[i],"");
    // 		strcpy(otsikot[i],"");
    // 	}
    //
    // 	char merkki;
    // 	int taulukko_index = 0;
    // 	int mjono_index = 0;
    // 	read = LUE_SKIP;
    //
    // 	bool jatka = true;
    //
    // 	while(jatka && tiedosto->peek() != EOF){
    // 		merkki = tiedosto->get();
    //
    // 		switch (merkki){
    // 			case MARKER_1:
    // 				if (read == LUE_SKIP){
    // 					read = LUE_OTSIKKO;
    // 					mjono_index = 0;
    // 				} else{
    // 					read = LUE_SKIP;
    // 					taulukko_index++;
    // 				}
    // 				break;
    //
    // 			case MARKER_2:
    // 				if (read == LUE_OTSIKKO){
    // 					read = LUE_TEKSTI;
    // 					mjono_index = 0;
    // 					break;
    // 				}
    // 				if (read == LUE_TEKSTI){
    // 					if (mjono_index < MAX_TEXT_LENGTH){
    // 						tekstit[taulukko_index][mjono_index] = merkki;
    // 						tekstit[taulukko_index][mjono_index+1] = '\0';
    // 						mjono_index++;
    // 					}
    // 				}
    // 				break;
    //
    // 			case '\r':
    // 			case '\n':
    // 				if (read != LUE_SKIP){
    // 					read = LUE_SKIP;
    // 					taulukko_index++;
    // 				}
    // 				break;
    //
    // 			case '\t': break;
    // 			case '\v': break;
    //
    // 			default:
    // 				if (read != LUE_SKIP && !(mjono_index == 0 && merkki == ' ')){
    // 					if (read == LUE_OTSIKKO){
    // 						if (mjono_index < MAX_HEAD_LENGTH){
    // 							otsikot[taulukko_index][mjono_index] = merkki;
    // 							otsikot[taulukko_index][mjono_index+1] = '\0';
    // 							mjono_index++;
    // 						}
    // 					}
    // 					if (read == LUE_TEKSTI){
    // 						if (mjono_index < MAX_TEXT_LENGTH){
    // 							tekstit[taulukko_index][mjono_index] = merkki;
    // 							tekstit[taulukko_index][mjono_index+1] = '\0';
    // 							mjono_index++;
    // 						}
    // 					}
    // 				}
    // 				break;
    // 		}
    //
    // 		if (taulukko_index >= MAX_TEXTS)
    // 			jatka = false;
    // 	}
    //
    // 	delete tiedosto;
    //
    // 	return true;
    // }
    
    public apply(schema: any) {
        const keys = Object.keys(schema);
        
        for (let key of keys) {
            schema[key] = '.....';
        }
    }
    
    /** @deprecated */
    public Hae_Indeksi(/*char *otsikko*/) {
        // 	int i=0;
        //
        // 	while (i < MAX_TEXTS && strcmp(otsikot[i],otsikko) != 0)
        // 		i++;
        //
        // 	if (i == MAX_TEXTS)
        // 		return -1;
        //
        // 	return i;
        //
    }
    
    /** @deprecated */
    // Hae_Teksti(int index):string{
    // 	if (index >= 0 && index < MAX_TEXTS)
    // 		return tekstit[index];
    // 	else
    // 		return ".....";
    // }
    
    // void PisteLanguage::Korvaa_Teksti(int index, char *teksti){
    // 	if (index >= 0 && index < MAX_TEXTS)
    // 		strcpy(tekstit[index],teksti);
    // }
}
