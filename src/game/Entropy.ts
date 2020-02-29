import { PK2GAMELOOP } from '../support/constants';
import { int, CVect, cvect, uint } from '../support/types';

export class Entropy {
    private readonly _cosTable: CVect<number>;
    private readonly _sinTable: CVect<number>;
    
    private _degree: number;
    
    // Time oscillators
    private _kytkin1: int = 0;
    private _kytkin2: int = 0;
    private _kytkin3: int = 0;
    private _palikka_animaatio: int = 0;
    
    
    public constructor() {
        this._cosTable = cvect(360);
        this._sinTable = cvect(360);
        this.precalculateSinCos();
        
        this._degree = 0;
    }
    
    /**
     * Source: PK_Precalculate_SinCos.
     */
    private precalculateSinCos(): void {
        for (let i = 0; i < 360; i++) this._cosTable[i] = Math.cos(Math.PI * 2 * (i % 360) / 180) * 33;
        for (let i = 0; i < 360; i++) this._sinTable[i] = Math.sin(Math.PI * 2 * (i % 360) / 180) * 33;
    }
    
    public tickTimers(delta: number): void {
        if (this._kytkin1 > 0)
            this._kytkin1 -= Math.max(0, delta * PK2GAMELOOP / 1000);
        
        if (this._kytkin2 > 0)
            this._kytkin2 -= Math.max(0, delta * PK2GAMELOOP / 1000);
        
        if (this._kytkin3 > 0)
            this._kytkin3 -= Math.max(0, delta * PK2GAMELOOP / 1000);
    }
    
    
    ///  Accessors  ///
    
    public get degree(): number {
        return this._degree;
    }
    public set degree(degree: number) {
        this._degree = degree;
    }
    
    public get switcher1(): int {
        return this._kytkin1;
    }
    public get switcher2(): int {
        return this._kytkin2;
    }
    public get switcher3(): int {
        return this._kytkin3;
    }
    public set switcher1(v) {
        this._kytkin1 = v;
    }
    public set switcher2(v) {
        this._kytkin2 = v;
    }
    public set switcher3(v) {
        this._kytkin3 = v;
    }
    
    ///  Static trigonometry  ///
    
    public getSin(i: uint): number {
        return this._sinTable[i];
    }
    public getCos(i: uint): number {
        return this._cosTable[i];
    }
}
