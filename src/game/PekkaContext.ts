import { Entropy } from '@game/Entropy';
import { ISettingsView } from '@game/settings/ISettingsView';
import { GameTimer } from '@ng/core/GameTimer';
import { PK2wSound } from '@ng/core/PK2wSound';
import { PkDevice } from '@ng/core/PkDevice';
import { PkInput } from '@ng/core/PkInput';
import { PkFilesystem } from '@ng/filesystem/PkFilesystem';
import { PkAssetCache } from '@ng/PkAssetCache';
import { PkFont } from '@ng/types/font/PkFont';
import { PkParameters } from '@ng/types/PkParameters';
import { PkUIContext } from '@ng/ui/PkUIContext';

export interface PekkaContext extends PkUIContext {
    readonly entropy: Entropy;
    
    readonly device: PkDevice;
    
    readonly font1: PkFont;
    readonly font2: PkFont;
    readonly font3: PkFont;
    readonly font4: PkFont;
    readonly font5: PkFont;
    
    readonly settings: ISettingsView;
    readonly tx: PkParameters;
    /** @deprecated */
    readonly clock: GameTimer;
    readonly input: PkInput;
    readonly fs: PkFilesystem;
    readonly audio: PK2wSound;
    
    readonly stuff: PkAssetCache;
    readonly gameStuff: PkAssetCache;
}