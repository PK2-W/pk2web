import { Log } from '@ng/support/log/LoggerImpl';
import * as PIXI from 'pixi.js';
import { RESOURCES_PATH } from '../../support/constants';
import { PK2wLoader } from './PK2wLoader';

export class PK2wImageLoader extends PK2wLoader {
    private _image: HTMLImageElement;
    private _texture: PIXI.BaseTexture;
    
    private __canvas: HTMLCanvasElement;
    private __ctx: CanvasRenderingContext2D;
    
    public static async load(uri: string): Promise<PK2wImageLoader> {
        return new PK2wImageLoader(uri).load();
    }
    
    private constructor(uri: string) {
        super(uri);
        
        this.__canvas = document.createElement('canvas');
        this.__ctx = this.__canvas.getContext('2d');
    }
    
    private load(): Promise<PK2wImageLoader> {
        Log.d(`[ImageLoader] Loading picture: "${ this._uri }"`);
        
        return new Promise((resolve, reject) => {
            
            this._image = new Image();
            this._image.addEventListener('load', (ev) => {
                
                // Quitar pixel transparente
                this.__canvas.width = this._image.width;
                this.__canvas.height = this._image.height;
                this.__ctx.drawImage(this._image, 0, 0);
                const dt = this.__ctx.getImageData(0, 0, this._image.width, this._image.height);
                for (let i = 0; i < dt.data.length; i += 4) {
                    //const v = dt.data[i + 3] = 255;
                    if (dt.data[i] === 155 && dt.data[i + 1] === 232 && dt.data[i + 2] === 224) {
                        dt.data[i + 3] = 0;
                    }
                }
                this.__ctx.putImageData(dt, 0, 0);
                
                
                this._texture = new PIXI.BaseTexture(this.__canvas);
                
                // In case of instant load
                if (this._texture.valid) {
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
