import { PekkaContext } from '@game/PekkaContext';
import { PkFsNodeType } from '@ng/filesystem/PkFsNode';

export class EpisodeManager {
    private _context: PekkaContext;
    private _communityEpisodes: string[];
    
    public constructor(context: PekkaContext) {
        this._context = context;
        
        this._communityEpisodes = [];
    }
    
    public async getLegacyEpisodes(forceRefresh: boolean = false): Promise<string[]> {
    
    }
    
    public async getCommunityEpisodes(forceRefresh: boolean = false): Promise<string[]> {
        if (forceRefresh) {
            await this._refreshCommunityEpisodes();
        }
        return this._communityEpisodes;
    }
    
    private async _refreshCommunityEpisodes(): Promise<void> {
        this._communityEpisodes = [];
        const ls = await this._context.fs.ls('/community');
        this._communityEpisodes = ls
            .filter(li => li.type === PkFsNodeType.FOLDER)
            .map(li => li.name);
    }
}