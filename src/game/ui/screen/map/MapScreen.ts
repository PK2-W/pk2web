import { PekkaContext } from '@game/PekkaContext';
import { TX } from '@game/texts';
import { UIPlainText } from '@game/ui/component/UIPlainText';
import { UIText } from '@game/ui/component/UIText';
import { Screen } from '@game/ui/screen/Screen';
import { DwSprite } from '@ng/drawable/dw/DwSprite';
import { pathJoin } from '@ng/support/utils';
import { PkAssetTk } from '@ng/toolkit/PkAssetTk';
import { RESOURCES_PATH } from '@sp/constants';

export class MapScreen extends Screen {
    public static async create(ctx: PekkaContext): Promise<MapScreen> {
        const self = new MapScreen(ctx);
        return await self.inialize();
    }
    
    private async inialize(): Promise<MapScreen> {
        const bgImage = await PkAssetTk.getImage(pathJoin(RESOURCES_PATH, 'gfx/map.bmp'));
        const bgDrawable = new DwSprite()
            .setTexture(bgImage.getTexture());
        this._drawable.add(bgDrawable);
    
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
        
        const context = this.context;
        const font1 = this.context.font1;
        const font2 = this.context.font2;
        const font4 = this.context.font4;
        
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
        
        this.add(new UIPlainText(context, '..episodi', font4, 100 + 2, 72 + 2));
        this.add(new UIPlainText(context, '..episodi', font2, 100, 72));
        
        this.add(new UIPlainText(context, TX.MAP_TOTAL_SCORE, font4, 100 + 2, 92 + 2));
        txt = new UIPlainText(context, TX.MAP_TOTAL_SCORE, font2, 100, 92)
            .addTo(this);
        
        txt = new UIPlainText(context, '..luku', font4, 100 + txt.width + 15 + 2, 92 + 2)
            .addTo(this);
        txt = new UIPlainText(context, '..luku', font2, 100 + txt.width + 15, 92)
            .addTo(this);
        
        // if (episodipisteet.episode_top_score > 0) {
        //     vali = PisteDraw2_Font_Write(fontti1, tekstit->Hae_Teksti(PK_txt.map_episode_best_player), 360, 72);
        //     PisteDraw2_Font_Write(fontti1, episodipisteet.episode_top_player, 360 + vali + 10, 72);
        //     vali = PisteDraw2_Font_Write(fontti1, tekstit->Hae_Teksti(PK_txt.map_episode_hiscore), 360, 92);
        //     ltoa(episodipisteet.episode_top_score, luku, 10);
        //     PisteDraw2_Font_Write(fontti2, luku, 360 + vali + 15, 92);
        // }
        
        txt = new UIPlainText(context, TX.MAP_NEXT_LEVEL, font1, 100, 120)
            .addTo(this);
        this.add(new UIPlainText(context, '%luku', font1, 100 + txt.width + 15, 120));
    }
}
