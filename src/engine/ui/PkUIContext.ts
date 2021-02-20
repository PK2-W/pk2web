import { GameTimer } from '@fwk/core/GameTimer';
import { PkDevice } from '@fwk/core/PkDevice';

export interface PkUIContext {
    readonly device: PkDevice;
    /** @deprecated */
    readonly clock: GameTimer;
}