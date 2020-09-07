import { EDestructionType } from '@game/enum/EDestructionType';
import { SPLASH_SOUND_CKEY, SOUND_SAMPLERATE } from '@sp/constants';
import { GameContext } from '../game/GameContext';
import { EParticle } from '../particle/Particle';
import { uint, rand, int } from '../support/types';

export class Effects {
    
    public static destruction(context: GameContext, tehoste: uint, x: uint, y: uint): void {
        switch (tehoste) {
            case EDestructionType.TUHOUTUMINEN_HOYHENET:
                return Effects.feathers(context, x, y);
            case EDestructionType.TUHOUTUMINEN_TAHDET_HARMAA:
                return Effects.stars(context, x, y, 0);
            case EDestructionType.TUHOUTUMINEN_TAHDET_SININEN:
                return Effects.stars(context, x, y, 32);
            case EDestructionType.TUHOUTUMINEN_TAHDET_PUNAINEN:
                return Effects.stars(context, x, y, 64);
            case EDestructionType.TUHOUTUMINEN_TAHDET_VIHREA:
                return Effects.stars(context, x, y, 96);
            case EDestructionType.TUHOUTUMINEN_TAHDET_ORANSSI:
                return Effects.stars(context, x, y, 128);
            case EDestructionType.TUHOUTUMINEN_TAHDET_VIOLETTI:
                return Effects.stars(context, x, y, 160);
            case EDestructionType.TUHOUTUMINEN_TAHDET_TURKOOSI:
                return Effects.stars(context, x, y, 192);
            case EDestructionType.TUHOUTUMINEN_RAJAHDYS_HARMAA:
                return Effects.explosion(context, x, y, 0);
            case EDestructionType.TUHOUTUMINEN_RAJAHDYS_SININEN:
                return Effects.explosion(context, x, y, 32);
            case EDestructionType.TUHOUTUMINEN_RAJAHDYS_PUNAINEN:
                return Effects.explosion(context, x, y, 64);
            case EDestructionType.TUHOUTUMINEN_RAJAHDYS_VIHREA:
                return Effects.explosion(context, x, y, 96);
            case EDestructionType.TUHOUTUMINEN_RAJAHDYS_ORANSSI:
                return Effects.explosion(context, x, y, 128);
            case EDestructionType.TUHOUTUMINEN_RAJAHDYS_VIOLETTI:
                return Effects.explosion(context, x, y, 160);
            case EDestructionType.TUHOUTUMINEN_RAJAHDYS_TURKOOSI:
                return Effects.explosion(context, x, y, 192);
            case EDestructionType.TUHOUTUMINEN_SAVU_HARMAA:
                return Effects.smoke(context, x, y, 0);
            case EDestructionType.TUHOUTUMINEN_SAVU_SININEN:
                return Effects.smoke(context, x, y, 32);
            case EDestructionType.TUHOUTUMINEN_SAVU_PUNAINEN:
                return Effects.smoke(context, x, y, 64);
            case EDestructionType.TUHOUTUMINEN_SAVU_VIHREA:
                return Effects.smoke(context, x, y, 96);
            case EDestructionType.TUHOUTUMINEN_SAVU_ORANSSI:
                return Effects.smoke(context, x, y, 128);
            case EDestructionType.TUHOUTUMINEN_SAVU_VIOLETTI:
                return Effects.smoke(context, x, y, 160);
            case EDestructionType.TUHOUTUMINEN_SAVU_TURKOOSI:
                return Effects.smoke(context, x, y, 192);
            case EDestructionType.TUHOUTUMINEN_SAVUPILVET:
                return Effects.smokeClouds(context, x, y);
            default:
                break;
        }
    }
    
    public static feathers(ctx: GameContext, x: uint, y: uint): void {
        for (let i = 0; i < 9; i++) {//6
            ctx._particles.newParticle(EParticle.PARTICLE_FEATHER,
                x + rand() % 17 - rand() % 17, y + rand() % 20 - rand() % 10,
                (rand() % 16 - rand() % 16) / 10.0, (45 + rand() % 45) / 100.0,
                300 + rand() % 40, 0, 0);
        }
    }
    
    public static splash(ctx: GameContext, x: uint, y: uint, color: uint): void {
        // Source:
        // for (int i=0;i<12;i++)
        //       Game::Particles->new_particle(	PARTICLE_LIGHT,x+rand()%17-13,y+rand()%17-13,
        // 				(rand()%7-rand()%7)/5,(rand()%7-rand()%7)/3, rand()%50+60,0.025,color);
        for (let i = 0; i < 7; i++)
            ctx._particles.newParticle(EParticle.PARTICLE_SPARK,
                x + rand() % 17 - 13, y + rand() % 17 - 13,
                (rand() % 5 - rand() % 5) / 4.0, (rand() % 4 - rand() % 7) / 3.0,
                rand() % 50 + 40, 0.025, color);//0.015
        
        for (let i = 0; i < 20; i++)
            ctx._particles.newParticle(EParticle.PARTICLE_POINT,
                x + rand() % 17 - 13, y + rand() % 17 - 13,
                (rand() % 5 - rand() % 5) / 4.0, (rand() % 2 - rand() % 7) / 3.0,
                rand() % 50 + 40, 0.025, color);//0.015
        
        ctx.playSound(ctx.stuff.getSound(SPLASH_SOUND_CKEY), 1, x, y, SOUND_SAMPLERATE, true);
    }
    
    public static explosion(ctx: GameContext, x: uint, y: uint, color: uint): void {
        let i: int;
        
        for (i = 0; i < 3; i++)
            ctx._particles.newParticle(EParticle.PARTICLE_SMOKE, x + rand() % 17 - 32, y + rand() % 17,
                0, ((rand() % 4) + 3) / -10.0, 450, 0.0, color);
        
        for (i = 0; i < 9; i++)//12
            ctx._particles.newParticle(EParticle.PARTICLE_LIGHT, x + rand() % 17 - 13, y + rand() % 17 - 13,
                (rand() % 7 - rand() % 7) / 5.0, (rand() % 7 - rand() % 7) / 3.0,
                rand() % 40 + 60, 0.025, color);
        
        for (i = 0; i < 8; i++)//8//10
            ctx._particles.newParticle(EParticle.PARTICLE_SPARK, x + rand() % 17 - 13, y + rand() % 17 - 13,
                (rand() % 3 - rand() % 3),//(rand()%7-rand()%7)/5,
                (rand() % 7 - rand() % 7) / 3,
                rand() % 20 + 60, 0.015, color);//50+60
        
        for (i = 0; i < 20; i++)//12
            ctx._particles.newParticle(EParticle.PARTICLE_POINT, x + rand() % 17 - 13, y + rand() % 17 - 13,
                (rand() % 7 - rand() % 7) / 5.0, (rand() % 7 - rand() % 7) / 3.0,
                rand() % 40 + 60, 0.025, color);
    }
    
    public static smoke(ctx: GameContext, x: uint, y: uint, color: uint): void {
        for (let i = 0; i < 3; i++) {
            ctx._particles.newParticle(EParticle.PARTICLE_SMOKE,
                x + rand() % 17 - 32, y + rand() % 17,
                0, ((rand() % 3) + 3) / -10.0/*-0.3*/,
                450, 0.0, color);
        }
        for (let i = 0; i < 6; i++) {
            ctx._particles.newParticle(EParticle.PARTICLE_DUST_CLOUDS,
                x + rand() % 30 - rand() % 30 - 10, y + rand() % 30 - rand() % 30 + 10,
                0, -0.3,
                rand() % 50 + 60, 0, color);
        }
    }
    
    public static smokeClouds(ctx: GameContext, x: uint, y: uint): void {
        for (let i = 0; i < 5; i++) {
            ctx._particles.newParticle(EParticle.PARTICLE_SMOKE,
                x + rand() % 17 - 32, y + rand() % 17,
                0, ((rand() % 3) + 3) / -10.0/*-0.3*/,
                450, 0.0, 0);
        }
    }
    
    public static stars(ctx: GameContext, x: uint, y: uint, color: uint): void {
        for (let i = 0; i < 5; i++) {
            ctx._particles.newParticle(EParticle.PARTICLE_STAR,
                x - 5, y - 5,
                (rand() % 3 - rand() % 3) / 1.5, rand() % 3 * -1,
                100, (rand() % 5 + 5) / 100.0/* 0.05*/, color);//300
        }
        
        for (let i = 0; i < 3; i++) { //12
            ctx._particles.newParticle(EParticle.PARTICLE_POINT,
                x - 5, y - 5,
                (rand() % 3 - rand() % 3) / 1.5, rand() % 3 * -1,
                100, (rand() % 5 + 5) / 100.0, color);
        }
    }
    
    
}