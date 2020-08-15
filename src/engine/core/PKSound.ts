import { PkAssetTk } from '@ng/toolkit/PkAssetTk';

export class PKSound {
    public async loadSFX(options: string[]) {
        for (let option of options) {
            await PkAssetTk.getArrayBuffer(option);
        }
    }
    
    public async loadBGM(options: string[]) {
        for (let option of options) {
            await PkAssetTk.getArrayBuffer(option);
        }
    }
    
    public play() {
    
    }
}