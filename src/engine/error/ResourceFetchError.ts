export class ResourceFetchError extends Error {
    public constructor(root: string, uri: string, info?: string) {
        super();
        this.name = 'ResourceFetchError';
        this.message = `Resource at (${ root })${ uri } couldn't be loaded.`;
    }
}
