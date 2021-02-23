import { DwContainer } from '@fwk/drawable/dw/DwContainer';
import { DwSprite } from '@fwk/drawable/dw/DwSprite';
import { PkResourceBase } from '@fwk/filesystem/PkResource';
import { pathJoin } from '@fwk/support/utils';
import { NewTexture } from '@fwk/texture/NewTexture';
import { PkPaletteBitmapResource } from '@fwk/texture/PkPaletteBitmapResource';
import { PkFont } from '@fwk/types/font/PkFont';
import { PkRectangle } from '@fwk/types/PkRectangle';
import { PekkaContext } from '@game/PekkaContext';
import { PkParameters } from '@game/resources/PkParameters';

export class PkFontAsset extends PkResourceBase implements PkFont {
    private _parameters: PkParameters;
    
    private _bitmap: PkPaletteBitmapResource;
    private readonly _textureCache: { [char: string]: NewTexture };
    private readonly _charIndex: { [char: string]: number };
    
    private _sourceX: number;
    private _sourceY: number;
    private _sourceW: number;
    
    private _sourceH: number;
    private _chars: string;
    private _charW: number;
    private _charH: number;
    private _charCount: number;
    
    public static async fetch(uris: string[], context: PekkaContext, child: boolean = false): Promise<PkFontAsset> {
        const self = new PkFontAsset();
        
        const parameters = await PkParameters.fetch(uris, context, true);
        
        self._parameters = parameters;
        self._uri = parameters.uri;
        
        self._sourceX = Number(parameters.get('image x'));
        self._sourceY = Number(parameters.get('image y'));
        
        self._charCount = parameters.get('letters').length;
        self._charW = Number(parameters.get('letter width'));
        self._charH = Number(parameters.get('letter height'));
        self._chars = parameters.get('letters');
        
        self._sourceW = self._charW * self._charCount;
        self._sourceH = self._charH;
        
        const path = parameters.uri.substring(0, parameters.uri.lastIndexOf('/')) + '/';
        const imagePath = parameters.get('image');
        
        self._bitmap = await PkPaletteBitmapResource.fetch([pathJoin(path, imagePath)], context);
        self._bitmap.internal.palette.setLastColorTransparent();
        // TODO: Control error
        //	temp_image = PisteDraw2_Image_Load(_uri,false);
        //	if (temp_image == -1) return -1;
        
        // Generate characters index
        for (let i = 0; i < self._charCount; i++) {
            const key = self._chars[i];
            self._charIndex[key] = i;
        }
        
        return self;
    }
    
    private constructor() {
        super();
        
        this._charIndex = {};
        this._textureCache = {};
        
        this._charW = 0;
        this._charH = 0;
        this._charCount = 0;
    }
    
    // Never used
    // PisteFont2::PisteFont2(int img_source, int x, int y, int width, int height, int count);
    
    // public GetImage(x: int, y: int, texture: PIXI.BaseTexture): PIXI.Texture {
    //     return new PIXI.Texture(texture, new PIXI.Rectangle(x, y, this._charW * this._charCount, this._charH * this._charCount));
    //     //	ImageIndex = PisteDraw2_Image_Cut(img_source, x, y, _charW*_charCount, _charH*_charCount);
    // }
    
    private getCharTexture(char: string): NewTexture {
        let character = this._textureCache[char];
        
        if (typeof character === 'undefined') {
            const index = this._charIndex[char];
            
            if (index != null) {
                // In-atlas x => char position * char width
                const x = this._charIndex[char] * this._charW;
                character = this._bitmap.getTexture(PkRectangle.$(this._sourceX + x, this._sourceY, this._charW, this._charH));
            } else {
                character = null;
            }
            
            this._textureCache[char] = character;
        }
        
        return character;
    }
    
    public writeText(text: string, target?: DwContainer, x: number = 0, y: number = 0): DwContainer {
        if (target == null) {
            target = (new DwContainer() as DwContainer);
        }
        
        let char: string;
        let texture: NewTexture;
        let sprite: DwSprite;
        
        let i;
        for (i = 0; i < text.length; i++) {
            char = text[i];
            
            // Every character is an individual drawable
            sprite = new DwSprite()
                .setPosition(i * this._charW + x, y)
                .addTo(target);
            
            // A texture is assigned only if it exists (spaces for example are exceptions)
            texture = this.getCharTexture(char);
            if (texture != null) {
                sprite.setTexture(texture);
            }
        }
        
        return target;
    }
    
    public get charWidth(): number { return this._charW; }
}
