import { BYTE, int } from '../../support/types';

export interface SpriteAttributes {
    /** X coordinate. */
    x: number;
    /** Y coordinate. */
    y: number;
    /** Horizontal speed. */
    a: number;
    /** Vertical speed. */
    b: number;
    
    /** X coordinate of the teft side of the collision box. */
    left: number;
    /** X coordinate of the right side of the collision box. */
    right: number;
    /** Y coordinate of the top side of the collision box. */
    top: number;
    /** Y coordinate of the bottom side of the collision box. */
    bottom: number;
    
    /** Sprite width. */
    width: int;
    /** Sprite height. */
    height: int;
    
    toTheRight: boolean;
    toTheLeft: boolean;
    toTheTop: boolean;
    toTheBottom: boolean;
    
    inWater: boolean;
    
    maxSpeed: BYTE;
}
