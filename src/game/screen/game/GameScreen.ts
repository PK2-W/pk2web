import * as PIXI from 'pixi.js';
import { PK2wImageLoader } from '../../../engine/support/PK2wImageLoader';
import { RESOURCES_PATH } from '../../../support/constants';
import { clipTSprite } from '../../../engine/drawable/DwHelper';
import { int } from '../../../support/types';
import { PK2Context } from '../../PK2Context';
import { TX } from '../../texts';
import { PkScreen } from '../../../engine/screen/PkScreen';
import { MenuSquare } from './MenuSquare';
import { WaveText } from './WaveText';

// Setup
const PISTE_LOGO_INI = 3000;
const PISTE_LOGO_END = 5000;
const AUTHORS_INI = PISTE_LOGO_END + 800;
const AUTHORS_END = AUTHORS_INI + 7200;
const TESTERS_INI = AUTHORS_END + 800;
const TESTERS_END = TESTERS_INI + 7000;
const TRANSLATOR_INI = TESTERS_END + 1000;
const TRANSLATOR_END = TRANSLATOR_INI + 3000;


export class MenuScreen extends PkScreen {
    private startTime: number;
    
    private _bgBaseTexture: PIXI.BaseTexture;
    
    private _tmpObjs = [];
    private _19obj = [];
    private _square: MenuSquare;
    
    /** @deprecated */
    private _wave1: WaveText;
    
    private _menuItems = [];
    
    
    public static create(ctx: PK2Context) {
        return new MenuScreen(ctx);
    }
    
    private constructor(ctx: PK2Context) {
        super(ctx);
        
        this._square = new MenuSquare(160, 200, 640 - 180, 410,
            [0x00004f, 0x000053, 0x070757, 0x0b0b5b, 0x13135f, 0x171763, 0x1f1f67, 0x27276b, 0x2f2f6f, 0x3b3377, 0x4b377f]
        );
    }
    
    private newGame() {
    
    }
}
