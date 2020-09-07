//==================================================
//(#5) Particle System
//==================================================

import { ParticleContext } from '@game/particle/ParticleContext';
import { int } from '@game/support/types';
import { DwSprite } from '@ng/drawable/dw/DwSprite';
import { DwObjectBase } from '@ng/drawable/dwo/DwObjectBase';
import { PkBaseTexture } from '@ng/types/image/PkBaseTexture';
import { PkRectangle } from '@ng/types/PkRectangle';


export abstract class Particle extends DwObjectBase<DwSprite> {
    // Instance unique identifier
    private static IID: number = 0;
    private readonly __iid__: number;
    
    private _context: ParticleContext;
    
    protected _drawable: DwSprite;
    
    private _type: int;
    private _time: int;
    
    private _x: number;
    private _y: number;
    private _a: number;
    private _b: number;
    
    protected _anim: int;
    
    private _weight: number;
    private _color: int;
    private _alpha: int;
    
    public static create(context: ParticleContext, type: int, x: number, y: number, a: number, b: number, anim: int, time: int, weight: number, color: int) {
        switch (type) {
            case EParticle.PARTICLE_STAR:
                return new StarParticle(context, type, x, y, a, b, anim, time, weight, color);
            case EParticle.PARTICLE_FEATHER:
                return new FeatherParticle(context, type, x, y, a, b, anim, time, weight, color);
            case EParticle.PARTICLE_DUST_CLOUDS:
                return new DustParticle(context, type, x, y, a, b, anim, time, weight, color);
            case EParticle.PARTICLE_LIGHT:
                return new LightParticle(context, type, x, y, a, b, anim, time, weight, color);
            case EParticle.PARTICLE_SPARK:
                return new SparkParticle(context, type, x, y, a, b, anim, time, weight, color);
            case EParticle.PARTICLE_POINT:
                return new PointParticle(context, type, x, y, a, b, anim, time, weight, color);
            case EParticle.PARTICLE_SMOKE:
                return new SmokeParticle(context, type, x, y, a, b, anim, time, weight, color);
            case EParticle.BGPARTICLE_WATERDROP:
                break;
            case EParticle.BGPARTICLE_LEAF1:
                break;
            case EParticle.BGPARTICLE_LEAF2:
                break;
            case EParticle.BGPARTICLE_LEAF3:
                break;
            case EParticle.BGPARTICLE_LEAF4:
                break;
            case EParticle.BGPARTICLE_FLAKE1:
                break;
            case EParticle.BGPARTICLE_FLAKE2:
                break;
            case EParticle.BGPARTICLE_FLAKE3:
                break;
            case EParticle.BGPARTICLE_FLAKE4:
                break;
        }
    }
    
    protected constructor(context: ParticleContext, type: int, x: number, y: number, a: number, b: number, anim: int, time: int, weight: number, color: int) {
        super(new DwSprite());
        
        this.__iid__ = Particle.IID++;
        this._context = context;
        
        this._type = type;
        this.x = x;
        this.y = y;
        this._a = a;
        this._b = b;
        this._anim = anim;
        this._time = time;
        this._weight = weight;
        this._color = color;
        this._alpha = 0;
        
        // this.draw();
        this.stage();
    }
    
    private get x() { return this._x; }
    private set x(x: number) {
        this._x = x;
        this._dw.x = x;
    }
    private get y() { return this._y; }
    private set y(y: number) {
        this._y = y;
        this._dw.y = y;
    }
    
    private get alpha() { return this._alpha; }
    private set alpha(alpha: number) {
        this._alpha = alpha;
        this._dw.alpha = alpha / 100;
    }
    
    // public draw(): void {
    //     this._alpha = this._time;
    //     if (this._alpha > 100) this._alpha = 100;
    //
    //     if (this._time > 0) {
    //         switch (this._type) {
    //             case EParticle.PARTICLE_STAR:
    //                 this.draw_star();
    //                 break;
    //             case EParticle.PARTICLE_FEATHER:
    //                 this.draw_feather();
    //                 break;
    //             case EParticle.PARTICLE_DUST_CLOUDS:
    //                 //this.draw_dust();
    //                 break;
    //             case EParticle.PARTICLE_LIGHT:
    //                 this.draw_light();
    //                 break;
    //             case EParticle.PARTICLE_SPARK:
    //                 this.draw_spark();
    //                 break;
    //             case EParticle.PARTICLE_POINT:
    //                 this.draw_dot();
    //                 break;
    //             case EParticle.PARTICLE_SMOKE:
    //                 //this.draw_smoke();
    //                 break;
    //
    //             case EParticle.BGPARTICLE_WATERDROP:
    //                 this.draw_waterdrop();
    //                 break;
    //             case EParticle.BGPARTICLE_LEAF1:
    //                 this.draw_leaf1();
    //                 break;
    //             case EParticle.BGPARTICLE_LEAF2:
    //                 this.draw_leaf2();
    //                 break;
    //             case EParticle.BGPARTICLE_LEAF3:
    //                 this.draw_leaf3();
    //                 break;
    //             case EParticle.BGPARTICLE_LEAF4:
    //                 this.draw_leaf4();
    //                 break;
    //             case EParticle.BGPARTICLE_FLAKE1:
    //                 this.draw_flake1();
    //                 break;
    //             case EParticle.BGPARTICLE_FLAKE2:
    //                 this.draw_flake2();
    //                 break;
    //             case EParticle.BGPARTICLE_FLAKE3:
    //                 this.draw_flake3();
    //                 break;
    //             case EParticle.BGPARTICLE_FLAKE4:
    //                 this.draw_flake4();
    //                 break;
    //         }
    //     }
    // }
    //
    public update(): void {
        this.alpha = this._time;
        if (this._alpha > 100) this.alpha = 100;
        
        switch (this._type) {
            case EParticle.BGPARTICLE_WATERDROP:
                this.update_waterdrop();
                this.update_bg();
                break;
            case EParticle.BGPARTICLE_LEAF1:
                this.update_leaf1();
                this.update_bg();
                break;
            case EParticle.BGPARTICLE_LEAF2:
                this.update_leaf2();
                this.update_bg();
                break;
            case EParticle.BGPARTICLE_LEAF3:
                this.update_leaf3();
                this.update_bg();
                break;
            case EParticle.BGPARTICLE_LEAF4:
                this.update_leaf4();
                this.update_bg();
                break;
            case EParticle.BGPARTICLE_FLAKE1:
                this.update_flake1();
                this.update_bg();
                break;
            case EParticle.BGPARTICLE_FLAKE2:
                this.update_flake2();
                this.update_bg();
                break;
            case EParticle.BGPARTICLE_FLAKE3:
                this.update_flake3();
                this.update_bg();
                break;
            case EParticle.BGPARTICLE_FLAKE4:
                this.update_flake4();
                this.update_bg();
                break;
            default:
                break;
        }
    }
    
    public set_type(type: int): void {}
    
    public time_over(): boolean {
        return this._time == 0;
    }
    
    
    ///  Draw FG  ///
    private draw_hit(): void {}
    
    //Draw BG
    private draw_waterdrop(): void {}
    private draw_leaf1(): void {}
    private draw_leaf2(): void {}
    private draw_leaf3(): void {}
    private draw_leaf4(): void {}
    private draw_flake1(): void {}
    private draw_flake2(): void {}
    private draw_flake3(): void {}
    private draw_flake4(): void {}
    
    //Update FG
    protected update_fg(): void {
        if (this._time > 0) {
            this.x += this._a;
            this.y += this._b;
            
            if (this._weight > 0)
                this._b += this._weight;
            
            this._time--;
        }
    }
    
    //Update BG
    private update_bg(): void {
        //    // if ( x  >  Game::camera_x + screen_width )
        //     this.x  =   int(x  + screen_width) % screen_width;
        //    // if ( x  <  Game::camera_x )
        //     this.x  =  screen_width - int( x) % screen_width;
        //    // if ( y  >  Game::camera_y + screen_height )
        //     this.y  =  int(y  + screen_height) % screen_height;
        //   //  if ( y  <  Game::camera_y )
        //     this.y  =  screen_height - int( y) % screen_height;
    }
    private update_waterdrop(): void {}
    private update_leaf1(): void {}
    private update_leaf2(): void {}
    private update_leaf3(): void {}
    private update_leaf4(): void {}
    private update_flake1(): void {}
    private update_flake2(): void {}
    private update_flake3(): void {}
    private update_flake4(): void {}
    
    protected get stuffSheet(): PkBaseTexture { return this._context.stuffSheet; }
    
    protected stage() {};
}

abstract class FgParticle extends Particle {
    public update(): void {
        super.update();
        this.update_fg();
    }
}

abstract class BgParticle extends Particle {
}

class DustParticle extends FgParticle {
    protected stage() {
        this.dw.texture = this.stuffSheet.getTexture(PkRectangle.$(226, 2, 18, 19));
    }
    // public update(): void {
    //     super.update();
    //     // REMEMBER: !settings.lapinakyvat_objektit)
    // }
    
    // if (alpha > 99 || !settings.lapinakyvat_objektit)
    // PisteDraw2_Image_CutClip(kuva_peli,x-Game::camera_x,y-Game::camera_y,226,2,224,49);
    // else
    // PK_Draw_Transparent_Object(kuva_peli, 226, 2, 18, 19, x-Game::camera_x, y-Game::camera_y, alpha, color);
    // PisteDraw2_Image_CutClip(kuva_peli,x-Game::camera_x,y-Game::camera_y,226, 2, 18, 19);
}


class FeatherParticle extends FgParticle {
    protected stage() {
        this.dw.texture = this.stuffSheet.getTexture(PkRectangle.$(14, 1, 21, 12));
    }
    public update(): void {
        super.update();
        
        const xplus = Math.floor(this._anim / 7) * 21;
        
        this.dw.texture.frame.x = 14 + xplus;
        
        this._anim++;
        if (this._anim > 63)
            this._anim = 0;
    }
}

class SparkParticle extends FgParticle {
    /** @inheritDoc */
    protected stage() {
        this.dw.texture = this.stuffSheet.getTexture(PkRectangle.$(99, 14, 7, 7));
    }
    /** @inheritDoc */
    public update(): void {
        super.update();
        // If transparent obejcts are disabled, change color instead
        //	if (!settings.lapinakyvat_objektit) {
        // 		int vx = (color/32) * 8;
        // 		PisteDraw2_Image_CutClip(kuva_peli,x-Game::camera_x, y-Game::camera_y,99+vx,14+14,106+vx,21+14);
        // 	}
    }
}

/** Particle for {@link EParticle.PARTICLE_SMOKE}. */
class SmokeParticle extends FgParticle {
    /** @inheritDoc */
    protected stage() {
        this.dw.texture = this.stuffSheet.getTexture(PkRectangle.$(1, 338, 33, 28));
    }
    /** @inheritDoc */
    public update(): void {
        super.update();
        
        let frame: int = Math.floor(this._anim / 7);
        let xplus: int = (frame % 17) * 36;
        let yplus: int = 0;
        
        if (this._anim < 7 * 30) {
            if (frame > 16)
                yplus = 32;
            
            this.dw.texture.frame.change(1 + xplus, 338 + yplus, this.dw.texture.width, this.dw.texture.height);
            
            this._anim++;
        }
    }
}

/** Particle for {@link EParticle.PARTICLE_POINT}. */
class PointParticle extends FgParticle {
    /** @inheritDoc */
    protected stage() {
        //this._drawable=new PIXI.Graphics();
        //this.dw.texture = (texture as PkImageTextureImpl).getPixiTexture();
        //const texture = this.stuff.getTexture(PkRectangle.$(1, 338, 33, 28));
        // this.dw.texture = (texture as PkImageTextureImpl).getPixiTexture();
        
        // PisteDraw2_ScreenFill(x-Game::camera_x, y-Game::camera_y, x-Game::camera_x+1, y-Game::camera_y+1, color+25);
    }
    /** @inheritDoc */
    public update(): void {
        super.update();
    }
}

/** Particle for {@link EParticle.PARTICLE_STAR}. */
class StarParticle extends FgParticle {
    /** @inheritDoc */
    protected stage() {
        this.dw.texture = this.stuffSheet.getTexture(PkRectangle.$(1, 1, 10, 10));
        
        //     if (color > 99 || !settings.lapinakyvat_objektit)
        //         PisteDraw2_Image_CutClip(kuva_peli, x-Game::camera_x, y-Game::camera_y, 1, 1, 11, 11);
        // else
        //     PK_Draw_Transparent_Object(kuva_peli, 2, 2, 10, 10, x-Game::camera_x, y-Game::camera_y, alpha, color);
    }
    /** @inheritDoc */
    public update(): void {
        super.update();
    }
}

/** Particle for {@link EParticle.PARTICLE_LIGHT}. */
class LightParticle extends FgParticle {
    /** @inheritDoc */
    protected stage() {
        this.dw.texture = this.stuffSheet.getTexture(PkRectangle.$(1, 14, 13, 13));
        
        // if (settings.lapinakyvat_objektit)
        //     PK_Draw_Transparent_Object(kuva_peli, 1, 14, 13, 13, x-Game::camera_x, y-Game::camera_y, alpha, color);
        // else{
        //     int vx = (color/32) * 14;
        //     PisteDraw2_Image_CutClip(kuva_peli,x-Game::camera_x, y-Game::camera_y,1+vx,14+14,14+vx,27+14);
        // }
    }
    /** @inheritDoc */
    public update(): void {
        super.update();
    }
}

export enum EParticle {
    PARTICLE_NOTHING,
    PARTICLE_STAR,
    PARTICLE_FEATHER,
    PARTICLE_DUST_CLOUDS,
    PARTICLE_LIGHT,
    PARTICLE_SPARK,
    PARTICLE_POINT,
    PARTICLE_SMOKE,
    
    BGPARTICLE_NOTHING,
    BGPARTICLE_WATERDROP,
    BGPARTICLE_LEAF1,
    BGPARTICLE_LEAF2,
    BGPARTICLE_LEAF3,
    BGPARTICLE_LEAF4,
    BGPARTICLE_FLAKE1,
    BGPARTICLE_FLAKE2,
    BGPARTICLE_FLAKE3,
    BGPARTICLE_FLAKE4
}