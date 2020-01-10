export class PkPreloader {
    private _tasks: any;
    
    private _autostart: boolean;
    private _started: boolean;
    private _completed: boolean;
    
    
    public constructor(autostart: boolean = true) {
        
        this._autostart = autostart;
        this._started = false;
        this._completed = false;
    }
    
    
    public async add(uri: string): Promise<void> {
    
    }
    
    public get progress(): number {
        return 0;
    }
}
