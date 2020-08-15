export interface PkTickable {
    /**
     * Routine to be called with every tick of the game loop.
     *
     * @param delta - Number of milliseconds since the last tick.
     * @param time - Time, as an unix timestamp in milliseconds, in which this tick has been triggered.
     */
    tick(delta: number, time: number): void;
}
