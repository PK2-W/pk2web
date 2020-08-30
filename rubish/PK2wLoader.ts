import { RESOURCES_PATH } from '../../support/constants';

export abstract class PK2wLoader {
    protected readonly _uri: string;
    
    protected constructor(uri: string) {
        this._uri = uri;
    }
    
    protected xhr(binary: boolean = false): Promise<string> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', RESOURCES_PATH + this._uri, true);
            req.onreadystatechange = (aEvt) => {
                if (req.readyState === 4) {
                    if (req.status !== 200) {
                        return reject();
                    }
                    
                    resolve(req.responseText);
                }
            };
            req.send();
        });
    }
}
