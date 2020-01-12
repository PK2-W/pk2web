import { ResourceFetchError } from '@ng/error/ResourceFetchError';

export class ResourceNotFoundError extends ResourceFetchError {
    public constructor(root: string, uri: string) {
        super(root, uri);
        this.name = 'ResourceNotFoundError';
        this.message = `Resource at (${ root })${ uri } couldn't be found.`;
    }
}
