export class PkError extends Error {
    public readonly cause: Error;
    
    public constructor(message?: string, cause?: Error) {
        super(message);
        
        this.cause = cause;
    }
    
    public isCausedBy(errorType: typeof Error) {
        let cause: Error = this.cause;
        
        while (cause != null) {
            if (cause instanceof errorType) {
                return true;
            }
            if ((cause as Error) instanceof PkError) {
                cause = (cause as PkError).cause;
            }
        }
        return false;
    }
}