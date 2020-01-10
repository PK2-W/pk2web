export interface ITickable {
    /** Called with each loop repetition. */
    tick(delta: number, time: number): void;
}
