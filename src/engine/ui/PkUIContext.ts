import { GameTimer } from '@ng/core/GameTimer';
import { PkDevice } from '@ng/core/PkDevice';

export interface PkUIContext {
    readonly device: PkDevice;
    /** @deprecated */
    readonly clock: GameTimer;
}