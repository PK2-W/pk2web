import { GameContext } from '@game/game/GameContext';
import { Particle } from '@game/particle/Particle';
import { ParticleContext } from '@game/particle/ParticleContext';
import { int } from '@fwk/shared/bx-ctypes';
import { Log } from '@fwk/support/log/LoggerImpl';
import { rand } from '@fwk/support/utils';
import { PkBaseTexture } from '@fwk/types/image/PkBaseTexture';
import { STUFF_CKEY } from '@sp/constants';

/**
 * SDL: PK2::Particle_System.
 */
export class ParticleSystem implements ParticleContext {
    private _context: GameContext;
    
    private Particles: Particle[];
    private BGParticles: Particle[];
    
    private _debug_report = 0;
    
    //private readonly  int nof_bg_particles = 300;
    
    
    public constructor(context: GameContext) {
        this._context = context;
        
        this.Particles = [];
        this.BGParticles = [];
    }
    
    // PK2::Particle_System::Particle_System() {}
    
    // PK2::Particle_System::~Particle_System() {
    //
    //     clear_particles();
    //
    // }
    
    public update(): void {
        //if (!paused)
        for (let i = 0; i < this.Particles.length; i++) {
            const particle = this.Particles[i];
            particle.update();
            
            if (particle.time_over()) {
                this.Particles.splice(i--, 1);
                //particle.getDrawable().renderable = false;
                this._context.composition.removeFgParticle(particle);
            }
        }
        
        // Dani / TODO - clean "time_over" particles - use deque on Particles
        
        //if (settings.saa_efektit)
        for (let i = 0; i < this.BGParticles.length; i++) {
            const particle = this.BGParticles[i];
            particle.update();
            
            if (particle.time_over()) {
                this.BGParticles.splice(i--, 1);
                //particle.getDrawable().renderable = false;
                this._context.composition.removeBgParticle(particle);
            }
        }
        
        if (++this._debug_report == 60) {
            this._debug_report = 0;
            Log.fast('Active particles', (this.Particles.length + this.BGParticles.length));
        }
    }
    
    // public new_particle(type: int, x: number, y: number, a: number, b: number, time: int, weight: number, color: int): void {
    //     const particle = new Particle(this, type, x, y, a, b, rand() % 63, time, weight, color);
    //     this.Particles.push(particle);
    //     this._context.composition.addBgParticle(particle._dw);
    // }
    
    public newParticle(type: int, x: number, y: number, a: number, b: number, time: int, weight: number, color: int): void {
        const particle = Particle.create(this, type, x, y, a, b, rand() % 63, time, weight, color);
        
        if (particle == null) {
            Log.e(new Error(`Couldn't create a particle of type ${ type }.`));
        }
        
        this.Particles.push(particle);
        this._context.composition.addFgParticle(particle);
    }
    
    public draw_front_particles(): void {
        for (let particle of this.Particles) {
            particle.draw();
        }
    }
    
    public draw_bg_particles(): void {
        //     if (!settings.saa_efektit)
        //     return;
        
        for (let particle of this.BGParticles) {
            particle.draw();
        }
    }
    
    // public load_bg_particles(PK2Kartta* map) :void{
    //     int i = 0;
    //     PK2::Particle* particle;
    //
    //     while (i < nof_bg_particles){
    //         PK2::Particle* particle = new PK2::Particle(
    //             BGPARTICLE_NOTHING,   //type
    //             rand()%screen_width,  //x
    //             rand()%screen_height, //y
    //             rand()%10-rand()%10,  //a
    //             rand()%9+1,           //b
    //             rand()%63,            //anim
    //             1,                    //time -- unused
    //             rand()%10,            //weight
    //             0);                   //color
    //         BGParticles.push_back(particle);
    //         //taustapartikkelit[i].a = rand()%10-rand()%10;
    //         //taustapartikkelit[i].aika = 1;
    //         //taustapartikkelit[i].anim = rand()%10;
    //         //taustapartikkelit[i].b = rand()%9+1;
    //         //taustapartikkelit[i].tyyppi = BGPARTICLE_NOTHING;
    //         //taustapartikkelit[i].x = rand()%screen_width;
    //         //taustapartikkelit[i].y = rand()%screen_height;
    //         //taustapartikkelit[i].paino = rand()%10;
    //         //taustapartikkelit[i].vari = 0;
    //         i++;
    //     }
    //
    //     if (map->ilma == ILMA_SADE || map->ilma == ILMA_SADEMETSA)
    //     for( i = 0; i < nof_bg_particles; i++)
    //         BGParticles[i]->set_type(BGPARTICLE_WATERDROP);
    //
    //     if (map->ilma == ILMA_METSA || map->ilma == ILMA_SADEMETSA)
    //     for( i = 0; i < nof_bg_particles / 8; i++)
    //         BGParticles[i]->set_type(BGPARTICLE_LEAF1 + rand()%4);
    //
    //     if (map->ilma == ILMA_LUMISADE){
    //         for( i = 0; i < nof_bg_particles / 2; i++)
    //             BGParticles[i]->set_type(BGPARTICLE_FLAKE4);
    //         for( i = 0; i < nof_bg_particles / 3; i++)
    //             BGParticles[i]->set_type(BGPARTICLE_FLAKE1 + rand()%2+1);//3
    //     }
    //
    // }
    //
    // public clear_particles() :void{
    //     while (Particles.size() > 0) {
    //         delete Particles.back();
    //         Particles.pop_back();
    //     }
    //     while (BGParticles.size() > 0) {
    //         delete BGParticles.back();
    //         BGParticles.pop_back();
    //     }
    // }
    
    public get stuffSheet(): PkBaseTexture {
        return this._context.stuff.getBitmap(STUFF_CKEY);
    }
}