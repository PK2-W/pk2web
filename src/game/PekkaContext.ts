import { PkAudioChannel } from '@fwk/audio/PkAudioChannel';
import { Entropy } from '@game/Entropy';
import { EpisodeManager } from '@game/episodes/EpisodeManager';
import { ISettingsView } from '@game/settings/ISettingsView';
import { GameTimer } from '@fwk/core/GameTimer';
import { PK2wSound } from '@fwk/core/PK2wSound';
import { PkDevice } from '@fwk/core/PkDevice';
import { PkInput } from '@fwk/core/PkInput';
import { PkFilesystem } from '@fwk/filesystem/PkFilesystem';
import { PkAssetCache } from '@fwk/PkAssetCache';
import { PkFont } from '@fwk/types/font/PkFont';
import { PkParameters } from '@game/resources/PkParameters';
import { PkAudioChannel } from '@fwk/audio/PkAudioChannel';
import { PkUIContext } from '@fwk/ui/PkUIContext';

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
    readonly music: PkAudioChannel;
    
    readonly stuff: PkAssetCache;
    readonly gameStuff: PkAssetCache;
    
    readonly episodes: EpisodeManager;
}