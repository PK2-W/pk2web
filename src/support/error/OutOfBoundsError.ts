import { PkError } from '@ng/error/PkError';

export class OutOfBoundsError extends PkError {
    public constructor(msg: string) {
        super(msg);
        this.name = 'OutOfBoundsError';
    }
}
