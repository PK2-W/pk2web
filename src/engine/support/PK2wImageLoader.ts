import { RESOURCES_PATH } from '../../support/constants';
import * as PIXI from '../../vendor/pixi';
import { PK2wLoader } from './PK2wLoader';

export class PK2wImageLoader extends PK2wLoader {
    private _image: HTMLImageElement;
    private _texture: PIXI.BaseTexture;
    
    public static async load(uri: string): Promise<PK2wImageLoader> {
        return new PK2wImageLoader(uri).load();
    }
    
    private constructor(uri: string) {
        super(uri);
    }
    
    private load(): Promise<PK2wImageLoader> {
        console.debug(`Ld     - Loading picture: "${ this._uri }"`);
        
        return new Promise((resolve, reject) => {
            
            this._image = new Image();
            this._image.addEventListener('load', (ev) => {
                
                this._texture = new PIXI.BaseTexture(this._image);
                
                // In case of instant load
                if (this._texture.hasLoaded) {
                    return resolve(this);
                }
                
                // Otherwise
                this._texture.on('loaded', (ev) => {
                    // En principio no es necesario
                    // Scene.renderer.plugins.prepare.upload(texture, () => {
                    //     resolve();
                    // });
                    
                    return resolve(this);
                });
                this._texture.on('error', (ev) => {
                    return reject();
                });
                
            });
            this._image.addEventListener('error', (ev) => {
                return reject();
            });
            
            this._image.src = RESOURCES_PATH + this._uri;
            
        });
    }
    
    public getImage(): HTMLImageElement {
        return this._image;
    }
    
    public getTexture(): PIXI.BaseTexture {
        return this._texture;
    }
}
