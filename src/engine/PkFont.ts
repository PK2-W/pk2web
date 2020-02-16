//#########################
//PisteEngine - PisteFont
//by Janne Kivilahti from Piste Gamez
//#########################

import * as PIXI from 'pixi.js';
import { int, FONTID } from '../support/types';
import { PK2wImageLoader } from './support/PK2wImageLoader';
import { PkParamLoader } from './support/PkParamLoader';

export class PkFont {
    // Instance id
    private static iIdSeq: FONTID = 0;
    public readonly iid: FONTID;
    
    private readonly _uri: string;
    private readonly _loader: PkParamLoader;
    
    private _baseTexture: PIXI.BaseTexture;
    private readonly _textureCache: { [char: string]: PIXI.Texture };
    private readonly _charIndex: { [char: string]: int };
    
    private _sourceX: int;
    private _sourceY: int;
    private sourceW: int;
    
    private _sourceH: int;
    private _chars: string;
    private _charW: int;
    private _charH: int;
    private _charCount: int;
    
    public static async load(uri: string): Promise<PkFont> {
        return await (new PkFont(uri)).load();
    }
    
    public constructor(uri: string) {
        // Instance id
        this.iid = PkFont.iIdSeq++;
        
        this._loader = new PkParamLoader();
        
        this._uri = uri;
        
        this._charIndex = {};
        this._textureCache = {};
        
        this._charW = 0;
        this._charH = 0;
        this._charCount = 0;
    }
    
    // Never used
    // PisteFont2::PisteFont2(int img_source, int x, int y, int width, int height, int count);
    
    public destroy(): void {
        //	if(ImageIndex != -1)
        //		PisteDraw2_Image_Delete(ImageIndex);
    }
    
    // public GetImage(x: int, y: int, texture: PIXI.BaseTexture): PIXI.Texture {
    //     return new PIXI.Texture(texture, new PIXI.Rectangle(x, y, this._charW * this._charCount, this._charH * this._charCount));
    //     //	ImageIndex = PisteDraw2_Image_Cut(img_source, x, y, _charW*_charCount, _charH*_charCount);
    // }
    
    private async load(): Promise<PkFont> {
        // let buf_width: int;
        //let font_index[256] int;
        let path: string,
            imagePath: string;
        
        await this._loader.load(this._uri);
        
        // buf_width = Number(paramFile.get('image width'));
        
        this._sourceX = Number(this._loader.get('image x'));
        this._sourceY = Number(this._loader.get('image y'));
        
        this._charCount = this._loader.get('letters').length;
        this._charW = Number(this._loader.get('letter width'));
        this._charH = Number(this._loader.get('letter height'));
        this._chars = this._loader.get('letters');
        
        this.sourceW = this._charW * this._charCount;
        this._sourceH = this._charH;
        
        path = this._uri.substring(0, this._uri.lastIndexOf('/')) + '/';
        imagePath = this._loader.get('image');
        
        const ld = await PK2wImageLoader.load(path + imagePath);
        this._baseTexture = ld.getTexture();
        // TODO: Control error
        //	temp_image = PisteDraw2_Image_Load(_uri,false);
        //	if (temp_image == -1) return -1;
        
        // Generate characters index
        for (let i = 0; i < this._charCount; i++) {
            const key = this._chars[i];
            this._charIndex[key] = i;
        }
        
        return this;
    }
    
    private getCharTexture(char: string) {
        let character = this._textureCache[char];
        
        if (typeof character === 'undefined') {
            const index = this._charIndex[char];
            
            if (index != null) {
                // In-atlas x => char position * char width
                const x = this._charIndex[char] * this._charW;
                character = new PIXI.Texture(this._baseTexture, new PIXI.Rectangle(this._sourceX + x, this._sourceY, this._charW, this._charH));
            } else {
                character = null;
            }
            
            this._textureCache[char] = character;
        }
        
        return character;
    }
    public writeText(text: string, target?: PIXI.Container): PIXI.Container {
        if (!target) {
            target = new PIXI.Container();
        }
        
        let char: string;
        let texture: PIXI.Texture;
        let sprite: PIXI.Sprite;
        
        let i;
        for (i = 0; i < text.length; i++) {
            char = text[i];
            texture = this.getCharTexture(char);
            
            if (texture != null) {
                sprite = new PIXI.Sprite(texture);
                sprite.x = i * this._charW;
                
                target.addChild(sprite);
            }
        }
        
        return target;
    }
    
    public get charWidth(): number { return this._charW; }
}
