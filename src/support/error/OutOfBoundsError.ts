export class OutOfBoundsError extends Error {
    public constructor(msg: string) {
        super(msg);
        this.name = 'OutOfBoundsError';
    }
}
