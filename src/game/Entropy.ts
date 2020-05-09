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
     * SDL: PK_Precalculate_SinCos.
     */
    private precalculateSinCos(): void {
        for (let i = 0; i < 360; i++) this._cosTable[i] = Math.cos(Math.PI * 2 * (i % 360) / 180) * 33;
        for (let i = 0; i < 360; i++) this._sinTable[i] = Math.sin(Math.PI * 2 * (i % 360) / 180) * 33;
    }
    
    
    ///  Accessors  ///
    
    public get oscillator(): number {
        return this._degree;
    }
    public get degree(): number {
        return this.oscillator;
    }
    public set degree(degree: number) {
        this._degree = degree;
    }
    /** @deprecated */ public get aste(): number { return this.oscillator; }
    
    
    ///  Static trigonometry  ///
    
    /**
     * Returns the `sin` function of the given angle.<br>
     * If the angle is an integer precalculated table is used, in other case, native function is used.
     *
     * @param alpha - Angle in degrees
     */
    public sin(alpha: number): number {
        return (Number.isInteger(alpha))
            ? this._sinTable[alpha]
            : Math.sin(alpha * Math.PI / 180);
    }
    
    /**
     * Returns the `cos` function of the given angle.<br>
     * If the angle is an integer precalculated table is used, in other case, native function is used.
     *
     * @param alpha - Angle in degrees
     */
    public cos(alpha: number): number {
        return (Number.isInteger(alpha))
            ? this._cosTable[alpha]
            : Math.cos(alpha * Math.PI / 180);
    }
}
