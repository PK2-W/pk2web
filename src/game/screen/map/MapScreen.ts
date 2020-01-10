import { PK2Context } from '@game/PK2Context';
import { TX } from '@game/texts';
import { UIPlainText } from '@game/ui/UIPlainText';
import { UIText } from '@game/ui/UIText';
import { clipTSprite } from '@ng/drawable/DwHelper';
import { PkScreen } from '@ng/screen/PkScreen';
import { PK2wImageLoader } from '@ng/support/PK2wImageLoader';
import * as PIXI from '@vendor/pixi';

export class MapScreen extends PkScreen {
    
    private _bgBaseTexture: PIXI.BaseTexture;
    
    
    public static async create(ctx: PK2Context): Promise<MapScreen> {
        const tmp = new MapScreen(ctx);
        return await tmp.inialize();
    }
    
    private constructor(ctx: PK2Context) {
        super(ctx);
    }
    
    private async inialize(): Promise<MapScreen> {
        this.layout();
        
        return this;
    }
    
    // public async start() {
    //     const ld = await PK2wImageLoader.load('gfx/map.bmp');
    //     this._bgBaseTexture = ld.getTexture();
    //
    //     this._context.audio.playXM('music/map.xm');
    //
    //     this.resume(1000);
    // }
    
    private layout(): void {
        let txt: UIText;
        
        const ctx = this._context;
        
        this.clean();
        
        // let black = new PIXI.Graphics();
        // black.beginFill(0x000000);
        // black.drawRect(0, 0, 640, 480);
        // this._drawable.addChild(black);
        //
        //
        // // // 	PisteDraw2_ScreenFill(0);
        // // // 	PisteDraw2_Image_Clip(kuva_tausta, (episode_started && settings.isWide)? -80 : 0, 0);
        // const island = clipTSprite(this._bgBaseTexture, 0, 0, 640, 480);
        // this._drawable.addChild(island);
        
        // PisteDraw2_ScreenFill(0);
        // PisteDraw2_Image_Clip(kuva_tausta, 0, 0);
        
        txt = this.add(new UIPlainText(ctx, '..episodi', ctx.fontti4, 100 + 2, 72 + 2));
        txt = this.add(new UIPlainText(ctx, '..episodi', ctx.fontti2, 100, 72));
        
        txt = this.add(new UIPlainText(ctx, TX.MAP_TOTAL_SCORE, ctx.fontti4, 100 + 2, 92 + 2));
        txt = this.add(new UIPlainText(ctx, TX.MAP_TOTAL_SCORE, ctx.fontti2, 100, 92));
        
        txt = this.add(new UIPlainText(ctx, '..luku', ctx.fontti4, 100 + txt.width + 15 + 2, 92 + 2));
        txt = this.add(new UIPlainText(ctx, '..luku', ctx.fontti2, 100 + txt.width + 15, 92));
        
        // if (episodipisteet.episode_top_score > 0) {
        //     vali = PisteDraw2_Font_Write(fontti1, tekstit->Hae_Teksti(PK_txt.map_episode_best_player), 360, 72);
        //     PisteDraw2_Font_Write(fontti1, episodipisteet.episode_top_player, 360 + vali + 10, 72);
        //     vali = PisteDraw2_Font_Write(fontti1, tekstit->Hae_Teksti(PK_txt.map_episode_hiscore), 360, 92);
        //     ltoa(episodipisteet.episode_top_score, luku, 10);
        //     PisteDraw2_Font_Write(fontti2, luku, 360 + vali + 15, 92);
        // }
        
        txt = this.add(new UIPlainText(ctx, TX.MAP_NEXT_LEVEL, ctx.fontti1, 100, 120));
        txt = this.add(new UIPlainText(ctx, '%luku', ctx.fontti1, 100 + txt.width + 15, 120));
    }
}
