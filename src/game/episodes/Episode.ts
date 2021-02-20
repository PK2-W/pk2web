import { pathJoin } from '@fwk/support/utils';
import { COMMUNITY_PATH, RESOURCES_PATH } from '@sp/constants';

export class Episode {
    /**
     * Name of the episode.<br>
     * The name must match with the folder in the "episodes" folder.
     * @private
     */
    private readonly _name: string;
    /**
     * An unique identificator for community levels.<br>
     * It will be the name of the folder inside the "community" folder containing all the resources of that level.
     * @private
     */
    private readonly _communityId: string;
    
    
    public constructor(name: string, options: {}) {
        this._name = name;
        this._communityId = options?.community;
    }
    
    public get name(): string { return this._name; }
    public get communityId() { return this._communityId; }
    
    public get homePath(): string {
        return this.isCommunity()
            ? pathJoin(COMMUNITY_PATH, this._communityId)
            : RESOURCES_PATH;
    }
    
    public isCommunity(): boolean {
        return this._communityId != null;
    }
}