//#########################
//PisteEngine - PisteFont
//by Janne Kivilahti from Piste Gamez
//#########################

import { CVect, int, cvect, str, FONTID } from '../support/types';
import * as PIXI from '../vendor/pixi';
import { PK2wImageLoader } from './support/PK2wImageLoader';
import { PK2wParamLoader } from './support/PK2wParamLoader';


export class PK2wFont {
    private static iIdSeq: FONTID = 0;
    public readonly iid: FONTID;
    
    private readonly _uri: string;
    
    private _baseTexture: PIXI.BaseTexture;
    private readonly _textureCache: { [char: string]: PIXI.Texture };
    private readonly _charIndex: { [char: string]: int };
    
    private sourceX: int;
    private sourceY: int;
    private sourceW: int;
    
    private sourceH: int;
    private chars: string;
    private charW: int;
    private charH: int;
    private charCount: int;
    
    public static async load(uri: string): Promise<PK2wFont> {
        return await (new PK2wFont(uri)).load();
    }
    
    public constructor(uri: string) {
        this.iid = PK2wFont.iIdSeq++;
        
        this._uri = uri;
        
        this._charIndex = {};
        this._textureCache = {};
        
        this.charW = 0;
        this.charH = 0;
        this.charCount = 0;
    }
    
    // Never used
    // PisteFont2::PisteFont2(int img_source, int x, int y, int width, int height, int count);
    
    public destroy(): void {
        //	if(ImageIndex != -1)
        //		PisteDraw2_Image_Delete(ImageIndex);
    }
    
    // public GetImage(x: int, y: int, texture: PIXI.BaseTexture): PIXI.Texture {
    //     return new PIXI.Texture(texture, new PIXI.Rectangle(x, y, this.charW * this.charCount, this.charH * this.charCount));
    //     //	ImageIndex = PisteDraw2_Image_Cut(img_source, x, y, charW*charCount, charH*charCount);
    // }
    
    private async load(): Promise<PK2wFont> {
        // let buf_width: int;
        //let font_index[256] int;
        let path: string,
            imagePath: string;
        
        const paramFile = await PK2wParamLoader.load(this._uri);
        
        // buf_width = Number(paramFile.get('image width'));
        
        this.sourceX = Number(paramFile.get('image x'));
        this.sourceY = Number(paramFile.get('image y'));
        
        this.charCount = paramFile.get('letters').length;
        this.charW = Number(paramFile.get('letter width'));
        this.charH = Number(paramFile.get('letter height'));
        this.chars = paramFile.get('letters');
        
        this.sourceW = this.charW * this.charCount;
        this.sourceH = this.charH;
        
        path = this._uri.substring(0, this._uri.lastIndexOf('/')) + '/';
        imagePath = paramFile.get('image');
        
        const ld = await PK2wImageLoader.load(path + imagePath);
        this._baseTexture = ld.getTexture();
        // TODO: Control error
        //	temp_image = PisteDraw2_Image_Load(_uri,false);
        //	if (temp_image == -1) return -1;
        
        // Generate characters index
        for (let i = 0; i < this.charCount; i++) {
            const key = this.chars[i];
            this._charIndex[key] = i;
        }
        
        return this;
    }
    
    private getCharTexture(char: string) {
        const character = this._textureCache[char];
        
        if (character != null) {
            return character;
        }
        
        // In-atlas x => char position * char width
        const x = this._charIndex[char] * this.charW;
        return new PIXI.Texture(this._baseTexture, new PIXI.Rectangle(this.sourceX + x, this.sourceY, this.charW, this.charH));
    }
    
    public writeText(text: string, target?: PIXI.Container): PIXI.Container {
        if (!target) {
            target = new PIXI.Container();
        }
        
        let char: string;
        let texture: PIXI.Texture;
        let sprite: PIXI.Sprite;
        
        for (let i = 0; i < text.length; i++) {
            char = text[i];
            texture = this.getCharTexture(char);
            
            sprite = new PIXI.Sprite(texture);
            sprite.x = i * this.charW;
            
            target.addChild(sprite);
        }
        
        return target;
    }
}
